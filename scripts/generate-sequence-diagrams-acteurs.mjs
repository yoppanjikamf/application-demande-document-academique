/**
 * Génère les diagrammes de séquence Mermaid (un par cas d'utilisation acteur).
 * Sources cas d'utilisation : cas utilisation eleve .drawio.png,
 * admin obc_decc.drawio.png, agent centre.drawio.png
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = "docs/diagrammes-mermaid/sequences";

const diagrams = {
  eleve: [
    {
      file: "seq-eleve-01-authentifier.mmd",
      title: "Élève — Authentifier",
      body: `sequenceDiagram
    autonumber
    actor Eleve as Élève
    participant UI as Interface Web<br/>/auth/login
    participant Action as Server Action<br/>signInAction
    participant DB as PostgreSQL<br/>(Prisma)
    participant Auth as Supabase Auth
    participant Audit as Journal audit

    Eleve->>UI: Saisir matricule, email, mot de passe
    UI->>Action: Soumettre formulaire de connexion
    Action->>DB: Rechercher User par matricule
    DB-->>Action: Profil élève (role=ELEVE)
    Action->>Action: Vérifier email + rôle élève
    Action->>Auth: signInWithPassword(email, password)
    Auth-->>Action: Session JWT + cookies
    Action->>DB: Mettre à jour derniereConnexion, authUserId
    Action->>Audit: INSERT audit_logs (action=LOGIN)
    Action-->>UI: redirectTo /dashboard
    UI-->>Eleve: Afficher tableau de bord élève`,
    },
    {
      file: "seq-eleve-02-consulter-via-qrcode.mmd",
      title: "Élève — Consulter via QR code (consultation publique)",
      body: `sequenceDiagram
    autonumber
    actor Eleve as Élève / Visiteur
    participant Mobile as Téléphone<br/>(scan QR)
    participant UI as Page publique<br/>/consultation
    participant API as API Route<br/>POST /api/public/consultation
    participant Svc as Service<br/>lookupPublicConsultationByMatricule
    participant DB as PostgreSQL<br/>(Prisma)

    Eleve->>Mobile: Scanner le QR code (URL /consultation)
    Mobile->>UI: Ouvrir la page consultation rapide
    Eleve->>UI: Saisir son matricule
    UI->>API: POST { matricule }
    API->>API: Contrôle rate-limit par IP
    API->>Svc: lookupPublicConsultationByMatricule(matricule)
    Svc->>DB: SELECT User + examens + documents (hors duplicata)
    DB-->>Svc: Données élève
    alt Compte non activé (authUserId null)
        Svc-->>API: { found:true, activated:false, prenom }
        API-->>UI: Invitation à activer via /auth/register
    else Compte activé
        Svc-->>API: { found:true, activated:true, documents[] }
        API-->>UI: Statuts PAS_DISPONIBLE / DISPONIBLE / RETIRE
    end
    UI-->>Eleve: Afficher synthèse lecture seule (sans RDV ni paiement)`,
    },
    {
      file: "seq-eleve-03-verifier-disponibilite.mmd",
      title: "Élève — Vérifier disponibilité document",
      body: `sequenceDiagram
    autonumber
    actor Eleve as Élève
    participant UI as Dashboard<br/>/dashboard/documents
    participant Page as Server Component
    participant DB as PostgreSQL<br/>(Prisma)
    participant Route as Service<br/>document-routing

    Eleve->>UI: Ouvrir Mes documents
    UI->>Page: Charger page (session élève)
    Page->>DB: SELECT documents + duplicatas + examens par eleveId
    DB-->>Page: Liste documents par diplôme
    Page->>Route: resolveDocumentRoute(diplomeType, typeDocument)
    Route-->>Page: organisme, lieu retrait, requiresAppointment
    Page->>Page: Calculer libellé statut (PAS_DISPONIBLE, DISPONIBLE, RETIRE)
    Page-->>UI: Afficher cartes par examen (original, relevé, duplicata)
    UI-->>Eleve: Indiquer si document disponible, en attente ou retiré`,
    },
    {
      file: "seq-eleve-04-demande-original-diplome.mmd",
      title: "Élève — Demande retrait original diplôme",
      body: `sequenceDiagram
    autonumber
    actor Eleve as Élève
    participant UI as Dashboard documents
    participant Action as Server Action<br/>submitDocumentRequestAction
    participant Route as document-routing
    participant DB as PostgreSQL<br/>(Prisma)
    participant Notif as notification-service

    Eleve->>UI: Choisir diplôme + Demander original
    UI->>Action: POST typeDocument=ORIGINAL, diplomeType
    Action->>DB: Vérifier ExamenValide + document existant
    Action->>Route: isDocumentRequestAllowed(BAC/PROBATOIRE original)
    Route-->>Action: Autorisé (OBC, centre ou antenne)
    Action->>DB: UPSERT DocumentAcademique (statut=PAS_DISPONIBLE, demandeSoumiseAt)
    Action->>Notif: createNotification(DEMANDE_ENREGISTREE)
    Action-->>UI: Succès + revalidatePath
    UI-->>Eleve: Message « Demande enregistrée, suivi par l'administration »`,
    },
    {
      file: "seq-eleve-05-demande-releve.mmd",
      title: "Élève — Demande retrait relevé de notes",
      body: `sequenceDiagram
    autonumber
    actor Eleve as Élève
    participant UI as Dashboard documents
    participant Action as Server Action<br/>submitDocumentRequestAction
    participant Route as document-routing
    participant DB as PostgreSQL<br/>(Prisma)
    participant Notif as notification-service

    Eleve->>UI: Choisir examen BEPC + Demander relevé
    UI->>Action: POST typeDocument=RELEVE_NOTES, diplomeType=BEPC
    Action->>DB: Vérifier ExamenValide BEPC
    Action->>Route: isDocumentRequestAllowed(BEPC relevé)
    Route-->>Action: Autorisé (DECC)
    Action->>DB: UPSERT DocumentAcademique RELEVE_NOTES (PAS_DISPONIBLE)
    Action->>Notif: createNotification(DEMANDE_ENREGISTREE)
    Action-->>UI: Confirmation
    UI-->>Eleve: Demande relevé en attente de traitement admin`,
    },
    {
      file: "seq-eleve-06-demande-duplicata-formulaire.mmd",
      title: "Élève — Demande duplicata (remplir formulaire + pièces)",
      body: `sequenceDiagram
    autonumber
    actor Eleve as Élève
    participant UI as Dashboard documents<br/>formulaire duplicata
    participant Action as Server Action<br/>submitDuplicataRequestAction
    participant Storage as Supabase Storage
    participant DB as PostgreSQL<br/>(Prisma)
    participant Mail as mail-service

    Eleve->>UI: Remplir motif, session, centre, type cible
    Eleve->>UI: Joindre 4 pièces obligatoires (CNI, perte, etc.)
    UI->>Action: FormData (fichiers + métadonnées)
    Action->>Action: Valider examen + cooldown duplicata 1 an
    Action->>Storage: uploadDuplicataPiece (×4)
    Storage-->>Action: bucket + path
    Action->>DB: BEGIN TRANSACTION
    Action->>DB: UPSERT DocumentAcademique DUPLICATA
    Action->>DB: INSERT Duplicata (statutValidation=SOUMISE)
    Action->>DB: INSERT PieceDuplicata (×4)
    Action->>DB: INSERT Paiement (statut=EFFECTUE)
    Action->>DB: INSERT Recu (numero, montant)
    Action->>DB: COMMIT
    Action->>Mail: notifyDuplicataRequestRegistered + notifyPaymentConfirmed
    Action-->>UI: revalidatePath /dashboard/documents
    UI-->>Eleve: Dossier soumis, en analyse admin`,
    },
    {
      file: "seq-eleve-07-effectuer-paiement.mmd",
      title: "Élève — Effectuer paiement duplicata",
      body: `sequenceDiagram
    autonumber
    actor Eleve as Élève
    participant UI as Formulaire duplicata
    participant Action as submitDuplicataRequestAction
    participant DB as PostgreSQL<br/>(Prisma)
    participant Webhook as API webhook<br/>/api/payments/webhook

    Note over Eleve,Webhook: Dans le MVP, le paiement est simulé à la soumission du dossier

    Eleve->>UI: Choisir mode paiement (Orange/MTN/Carte)
    UI->>Action: modePaiement + pièces jointes
    Action->>DB: Calculer montant (10 000 relevé / 15 000 original)
    Action->>DB: INSERT paiements (statut=EFFECTUE, modePaiment)
    Action->>DB: INSERT recus (numero REC-..., montant)
    alt Intégration PSP externe (évolution)
        Webhook->>DB: PATCH paiement statut=EFFECTUE + upsert recu
    end
    Action-->>UI: Paiement enregistré
    UI-->>Eleve: Accès au reçu depuis Paiements`,
    },
    {
      file: "seq-eleve-08-telecharger-recu.mmd",
      title: "Élève — Télécharger reçu de paiement",
      body: `sequenceDiagram
    autonumber
    actor Eleve as Élève
    participant UI as Dashboard<br/>/dashboard/payments
    participant API as API Route<br/>GET .../payments/:id/receipt
    participant DB as PostgreSQL<br/>(Prisma)

    Eleve->>UI: Ouvrir Mes paiements
    UI->>DB: SELECT paiements + recus (eleveId)
    DB-->>UI: Liste avec numero recu
    Eleve->>UI: Cliquer « Télécharger » (?download=1)
    UI->>API: GET /api/students/me/payments/{paymentId}/receipt?download=1
    API->>DB: findFirst paiement (scope élève) + recu
    alt Aucun reçu
        API-->>UI: 404 « Aucun reçu disponible »
    else Reçu existant
        API->>API: Générer HTML reçu (numero, montant, date, document)
        API-->>UI: Content-Disposition attachment recu-XXX.html
    end
    UI-->>Eleve: Fichier reçu téléchargé`,
    },
    {
      file: "seq-eleve-09-prendre-rdv.mmd",
      title: "Élève — Prendre rendez-vous de retrait",
      body: `sequenceDiagram
    autonumber
    actor Eleve as Élève
    participant UI as Dialog RDV<br/>/dashboard/documents
    participant Slots as API<br/>GET /api/appointments/slots
    participant Action as reserverDisponibiliteAction
    participant Appt as appointment-service
    participant DB as PostgreSQL<br/>(Prisma)
    participant Mail as mail-service

    Eleve->>UI: Choisir date + créneau pour document DISPONIBLE
    UI->>Slots: GET slots?documentId&date
    Slots->>Appt: getAvailableSlots (quota, fériés, week-end)
    Appt->>DB: Compter RDV du jour + lire parametres_rendez_vous
    Slots-->>UI: Créneaux libres
    UI->>Action: documentId, dateRdv, heureRdv
    Action->>DB: Vérifier document DISPONIBLE + pas de RDV actif
    Action->>Appt: Contrôler quota journalier
    Action->>DB: INSERT rendez_vous (statut=PLANIFIE, lieu, adminId)
    Action->>Mail: notifyAppointmentConfirmed (email + notification)
    Action-->>UI: redirect /dashboard/rendez-vous
    UI-->>Eleve: RDV confirmé (date, heure, lieu)`,
    },
    {
      file: "seq-eleve-10-annuler-rdv.mmd",
      title: "Élève — Annuler rendez-vous",
      body: `sequenceDiagram
    autonumber
    actor Eleve as Élève
    participant UI as Page<br/>/dashboard/rendez-vous
    participant API as API Route<br/>PATCH .../appointments/:id/cancel
    participant DB as PostgreSQL<br/>(Prisma)
    participant Notif as notification-service

    Eleve->>UI: Cliquer « Annuler » sur RDV PLANIFIE/CONFIRME
    UI->>API: PATCH /api/students/me/appointments/{id}/cancel
    API->>DB: findFirst rendez_vous (eleveId, statut actif)
    alt RDV introuvable ou déjà honoré
        API-->>UI: 409 Erreur
    else Annulation autorisée
        API->>DB: UPDATE rendez_vous statut=ANNULE
        API->>Notif: createNotification(ANNULATION_RDV)
        API-->>UI: 200 OK
    end
    UI-->>Eleve: RDV annulé, créneau libéré`,
    },
  ],
  admin: [
    {
      file: "seq-admin-01-authentifier.mmd",
      title: "Admin OBC/DECC — Authentifier",
      body: `sequenceDiagram
    autonumber
    actor Admin as Admin OBC/DECC
    participant UI as Portail login<br/>/auth/login/obc ou /decc
    participant Action as signInAction
    participant DB as PostgreSQL<br/>(Prisma)
    participant Auth as Supabase Auth

    Admin->>UI: Saisir matricule, email, mot de passe
    UI->>Action: loginOrganisme=OBC ou DECC
    Action->>DB: findUnique User par matricule
    Action->>Action: Vérifier email, organismeId, antenneRegionaleId
    alt Compte sans antenne régionale
        Action-->>UI: Erreur — compte incomplet
    else Compte valide
        Action->>Auth: signInWithPassword
        Auth-->>Action: Session admin
        Action->>DB: UPDATE derniereConnexion + audit LOGIN
        UI-->>Admin: Accès /admin (scope régional du matricule)
    end`,
    },
    {
      file: "seq-admin-02-definir-quota-journalier.mmd",
      title: "Admin — Définir quota journalier RDV",
      body: `sequenceDiagram
    autonumber
    actor Admin as Admin OBC/DECC
    participant UI as Page<br/>/admin/rdv-disponibilites
    participant Action as updateAdminQuotaAction
    participant DB as PostgreSQL<br/>(Prisma)
    participant Audit as Journal audit

    Admin->>UI: Saisir nouveau quotaJournalier
    UI->>Action: POST formulaire quota
    Action->>Action: assertAppointmentAdmin (OBC ou DECC)
    Action->>DB: SELECT parametres_rendez_vous (id=GLOBAL)
    Action->>DB: UPSERT quotaJournalier
    Action->>Audit: INSERT audit_logs (QUOTA_CHANGED)
    Action-->>UI: revalidatePath
    UI-->>Admin: Quota mis à jour (ex. 200 RDV/jour)`,
    },
    {
      file: "seq-admin-03-definir-jours-feries.mmd",
      title: "Admin — Définir jours fériés",
      body: `sequenceDiagram
    autonumber
    actor Admin as Admin OBC/DECC
    participant UI as /admin/rdv-disponibilites
    participant Action as upsertHolidayAction
    participant DB as PostgreSQL<br/>(Prisma)

    Admin->>UI: Saisir date + nom du jour férié
    UI->>Action: POST date, nom
    Action->>Action: assertAppointmentAdmin
    Action->>DB: UPSERT jours_feries (date unique)
    Action-->>UI: revalidatePath
    UI-->>Admin: Jour férié enregistré (RDV bloqués ce jour)`,
    },
    {
      file: "seq-admin-04-consulter-journal-audit.mmd",
      title: "Admin — Consulter journal audit",
      body: `sequenceDiagram
    autonumber
    actor Admin as Admin OBC/DECC
    participant UI as Page<br/>/admin/audit-logs
    participant Page as Server Component
    participant DB as PostgreSQL<br/>(Prisma)

    Admin->>UI: Ouvrir Journal d'audit
    UI->>Page: requireRole ADMINISTRATEUR
    Page->>DB: SELECT audit_logs ORDER BY createdAt DESC
    DB-->>Page: Logs (LOGIN, QUOTA_CHANGED, WITHDRAWAL, etc.)
    Page->>DB: JOIN users pour nom admin
    Page-->>UI: Table paginée (action, ressource, date, détails)
    UI-->>Admin: Consultation lecture seule de la traçabilité`,
    },
    {
      file: "seq-admin-05-mettre-a-jour-original-diplome.mmd",
      title: "Admin — Mettre à jour statut original diplôme",
      body: `sequenceDiagram
    autonumber
    actor Admin as Admin OBC/DECC
    participant UI as /admin/documents
    participant Action as updateDocumentStatusAction
    participant Trans as document-status-transition
    participant DB as PostgreSQL<br/>(Prisma)
    participant Mail as mail-service

    Admin->>UI: Sélectionner document ORIGINAL + nouveau statut
    UI->>Action: documentId, statut=DISPONIBLE ou RETIRE
    Action->>DB: findFirst document (scope admin OBC/DECC)
    Action->>Trans: applyDocumentStatusTransition
    Trans->>DB: UPDATE documents statut
    alt Passage à DISPONIBLE
        Trans->>Mail: notifyDocumentAvailable (email + notification élève)
    end
    Trans->>DB: INSERT audit_logs
    Action-->>UI: revalidatePath
    UI-->>Admin: Statut original mis à jour`,
    },
    {
      file: "seq-admin-06-mettre-a-jour-releve.mmd",
      title: "Admin — Mettre à jour statut relevé de notes",
      body: `sequenceDiagram
    autonumber
    actor Admin as Admin OBC/DECC
    participant UI as /admin/documents
    participant Action as updateDocumentStatusAction
    participant Trans as document-status-transition
    participant DB as PostgreSQL<br/>(Prisma)
    participant Mail as mail-service

    Admin->>UI: Filtrer RELEVE_NOTES (BEPC / scope DECC)
    Admin->>UI: Changer statut → DISPONIBLE
    UI->>Action: updateDocumentStatusAction
    Action->>DB: Vérifier document RELEVE_NOTES dans périmètre admin
    Action->>Trans: applyDocumentStatusTransition(DISPONIBLE)
    Trans->>DB: UPDATE statut document
    Trans->>Mail: notifyDocumentAvailable → élève concerné
    Trans->>DB: INSERT audit_logs (CHANGE_STATUS)
    UI-->>Admin: Élève notifié, peut prendre RDV`,
    },
    {
      file: "seq-admin-07-traiter-demande-duplicata.mmd",
      title: "Admin — Traiter demande duplicata (analyse pièces)",
      body: `sequenceDiagram
    autonumber
    actor Admin as Admin OBC/DECC
    participant UI as /admin/documents<br/>fiche duplicata
    participant Action as updateDuplicataPieceReviewAction
    participant DB as PostgreSQL<br/>(Prisma)

    Admin->>UI: Ouvrir dossier duplicata SOUMISE/EN_ANALYSE
    Admin->>UI: Examiner chaque pièce (CNI, perte, DG OBC, bordereau)
    loop Pour chaque pièce
        Admin->>UI: Valider ou rejeter pièce
        UI->>Action: updateDuplicataPieceReviewAction
        Action->>DB: UPDATE pieces_duplicata (statut, validatedById)
    end
    Action->>DB: UPDATE duplicatas statutValidation=EN_ANALYSE
    UI-->>Admin: Dossier prêt pour décision finale`,
    },
    {
      file: "seq-admin-08-valider-demande-duplicata.mmd",
      title: "Admin — Valider demande duplicata",
      body: `sequenceDiagram
    autonumber
    actor Admin as Admin OBC/DECC
    participant UI as /admin/documents
    participant Action as validateDuplicataRequestAction
    participant DB as PostgreSQL<br/>(Prisma)
    participant Mail as mail-service

    Admin->>UI: Cliquer « Valider le dossier »
    UI->>Action: validateDuplicataRequestAction(duplicataId)
    Action->>DB: Vérifier toutes pièces VALIDEE
    Action->>DB: UPDATE duplicata statutValidation=VALIDEE, statut=DISPONIBLE
    Action->>DB: SYNC DocumentAcademique DUPLICATA → DISPONIBLE
    Action->>Mail: notifyDocumentAvailable
    Action->>DB: INSERT audit_logs
    UI-->>Admin: Duplicata prêt → élève peut prendre RDV`,
    },
    {
      file: "seq-admin-09-rejeter-demande-duplicata.mmd",
      title: "Admin — Rejeter demande duplicata",
      body: `sequenceDiagram
    autonumber
    actor Admin as Admin OBC/DECC
    participant UI as /admin/documents
    participant Action as rejectDuplicataRequestAction
    participant DB as PostgreSQL<br/>(Prisma)
    participant Mail as mail-service

    Admin->>UI: Saisir motif de rejet
    UI->>Action: rejectDuplicataRequestAction(duplicataId, motif)
    Action->>DB: UPDATE duplicata statutValidation=REJETEE, motifRejet
    Action->>Mail: notifyDuplicataRejected (email + notification)
    Action->>DB: INSERT audit_logs
    UI-->>Admin: Élève informé du rejet`,
    },
    {
      file: "seq-admin-10-import-disponibilisation.mmd",
      title: "Admin — Import disponibilisation (CSV)",
      body: `sequenceDiagram
    autonumber
    actor Admin as Admin OBC/DECC
    participant UI as /admin/documents<br/>import CSV
    participant Action as importDocumentAvailabilityAction
    participant CSV as admin-import-config
    participant DB as PostgreSQL<br/>(Prisma)
    participant Mail as mail-service

    Admin->>UI: Télécharger modèle + uploader CSV disponibilisation
    UI->>Action: importDocumentAvailabilityAction(formData)
    Action->>CSV: Parser lignes (matricule, diplome, statut)
    loop Pour chaque ligne valide
        Action->>DB: UPDATE documents statut=DISPONIBLE
        Action->>Mail: notifyDocumentAvailable (si changement)
    end
    Action->>DB: INSERT audit_logs (IMPORT)
    Action-->>UI: Rapport succès / erreurs par ligne
    UI-->>Admin: Documents disponibles publiés`,
    },
    {
      file: "seq-admin-11-import-ajout-eleve.mmd",
      title: "Admin — Import ajout élève (CSV)",
      body: `sequenceDiagram
    autonumber
    actor Admin as Admin OBC/DECC
    participant UI as /admin/students
    participant Action as importTestDataAction
    participant Svc as importTestDataFromCsv
    participant DB as PostgreSQL<br/>(Prisma)

    Admin->>UI: Uploader CSV élèves + examens
    UI->>Action: importTestDataAction (fichier CSV)
    Action->>Svc: importTestDataFromCsv (scope organisme/région)
    loop Pour chaque élève
        Svc->>DB: UPSERT users (role=ELEVE, matricule)
        Svc->>DB: UPSERT examens_valides
        Svc->>DB: UPSERT documents (statut initial)
    end
    Svc-->>Action: ImportCsvResult (créés, mis à jour, erreurs)
    Action-->>UI: redirect avec rapport import
    UI-->>Admin: Élèves enregistrés dans le périmètre régional`,
    },
  ],
  agent: [
    {
      file: "seq-agent-01-authentifier.mmd",
      title: "Agent centre — Authentifier",
      body: `sequenceDiagram
    autonumber
    actor Agent as Agent centre d'examen
    participant UI as /auth/login/centre-examen
    participant Action as signInAction
    participant DB as PostgreSQL<br/>(Prisma)
    participant Auth as Supabase Auth

    Agent->>UI: Saisir matricule, email, mot de passe
    UI->>Action: loginRole=AGENT_CENTRE_EXAMEN
    Action->>DB: findUnique User (role=AGENT_CENTRE_EXAMEN)
    Action->>Action: Vérifier centreExamenId renseigné
    Action->>Auth: signInWithPassword
    Auth-->>Action: Session agent
    Action->>DB: UPDATE derniereConnexion + audit LOGIN
    Action-->>UI: redirect /centre-examen
    UI-->>Agent: Espace agent chargé`,
    },
    {
      file: "seq-agent-02-consulter-les-rdv.mmd",
      title: "Agent centre — Consulter les RDV transmis",
      body: `sequenceDiagram
    autonumber
    actor Agent as Agent centre d'examen
    participant UI as /centre-examen
    participant API as GET /api/centre-examen/appointments
    participant Svc as centre-examen-service
    participant DB as PostgreSQL<br/>(Prisma)

    Agent->>UI: Ouvrir espace retraits
    UI->>API: GET appointments (filtre date/créneau)
    API->>Svc: getAgentCentreExamen(user)
    Svc->>DB: SELECT centre_examen par centreExamenId
    API->>Svc: getCentreExamenAppointmentWhere (documents centre only)
    Svc->>DB: SELECT rendez_vous + eleve + document
    DB-->>API: RDV PLANIFIE/CONFIRME/HONORE du centre
    API-->>UI: Liste (matricule, document, heure, statut)
    UI-->>Agent: Afficher RDV du jour et à venir`,
    },
    {
      file: "seq-agent-03-confirmer-retrait-effectue.mmd",
      title: "Agent centre — Confirmer retrait effectué",
      body: `sequenceDiagram
    autonumber
    actor Agent as Agent centre d'examen
    participant UI as centre-appointments-panel
    participant API as PATCH .../confirm-withdrawal
    participant DB as PostgreSQL<br/>(Prisma)
    participant Mail as mail-service

    Agent->>UI: Vérifier identité élève sur place
    Agent->>UI: Cliquer « Confirmer le retrait »
    UI->>API: PATCH /api/centre-examen/appointments/{id}/confirm-withdrawal
    API->>DB: BEGIN TRANSACTION (Serializable)
    API->>DB: Vérifier RDV PLANIFIE/CONFIRME + document centre
    API->>DB: UPDATE rendez_vous statut=HONORE, retraitConfirmeParId
    API->>DB: UPDATE documents statut=RETIRE
    API->>DB: INSERT audit_logs WITHDRAWAL_CONFIRMED_BY_CENTER_AGENT
    API->>DB: COMMIT
    API->>Mail: notifyDocumentRetired → élève
    API-->>UI: 200 OK
    UI-->>Agent: Retrait confirmé, document marqué RETIRE`,
    },
  ],
};

const header = (title) => `%% ${title}
%% Cas d'utilisation DR-DOCSCOL — diagramme de séquence détaillé
%% Acteurs explicites : utilisateur métier, interface, services, base de données
`;

for (const [actor, list] of Object.entries(diagrams)) {
  const dir = join(ROOT, actor);
  mkdirSync(dir, { recursive: true });
  for (const { file, title, body } of list) {
    writeFileSync(join(dir, file), `${header(title)}\n${body}\n`);
  }
}

const indexLines = [
  "# Diagrammes de séquence par cas d'utilisation",
  "",
  "Sources cas d'utilisation :",
  "- `cas utilisation eleve .drawio.png`",
  "- `admin obc_decc.drawio.png`",
  "- `agent centre.drawio.png`",
  "",
  "## Élève",
  "",
  ...diagrams.eleve.map((d) => `- **${d.title}** → \`sequences/eleve/${d.file}\``),
  "",
  "## Admin OBC/DECC",
  "",
  ...diagrams.admin.map((d) => `- **${d.title}** → \`sequences/admin/${d.file}\``),
  "",
  "## Agent centre d'examen",
  "",
  ...diagrams.agent.map((d) => `- **${d.title}** → \`sequences/agent/${d.file}\``),
  "",
  "## Export images",
  "",
  "```bash",
  "npm run diagrams:sequences-acteurs",
  "```",
];

writeFileSync("docs/SEQUENCES_PAR_CAS_UTILISATION.md", indexLines.join("\n"));
console.log(
  `Generated ${diagrams.eleve.length + diagrams.admin.length + diagrams.agent.length} sequence diagrams`,
);
