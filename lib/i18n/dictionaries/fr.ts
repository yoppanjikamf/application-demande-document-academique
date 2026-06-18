export const dictionary = {
  common: {
    language: "Langue",
    french: "Français",
    english: "English",
    activation: "Activation",
    scope: "Périmètre",
    loading: "Chargement…",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    mySpace: "Mon espace",
    account: "Compte",
    logout: "Déconnexion",
    help: "Aide",
    navigation: "Navigation",
    securePortal: "Portail sécurisé",
    authorizedAccess: "Accès réservé aux utilisateurs autorisés.",
    alreadyHaveAccount: "J'ai déjà un compte",
    startNow: "Commencer maintenant",
    signIn: "Se connecter",
    activateAccount: "Activer mon compte",
    activateStudentAccount: "Activer mon compte élève",
    signInAs: "Se connecter en tant que",
    notConcerned: "Vous n'êtes pas concerné ? Choisissez votre espace :",
    alreadyRegistered: "Vous avez déjà un compte ? Connectez-vous à votre espace :",
  },
  nav: {
    homeSections: "Sections de la page d'accueil",
    features: "Fonctionnalités",
    consultation: "Consultation",
    steps: "Étapes",
    access: "Accès",
    faq: "FAQ",
    problemSolution: "Problème & solution",
    mobileNav: "Sections mobile",
    accountNav: "Navigation du compte",
    accountMobile: "Navigation du compte (mobile)",
    myAccount: "Mon compte",
  },
  loginPortals: {
    student: "Espace élève",
    studentHint: "Matricule, e-mail et mot de passe",
    obc: "Administration OBC",
    obcHint: "Baccalauréat, Probatoire et relevés",
    decc: "Administration DECC",
    deccHint: "BEPC et dossiers DECC",
    agent: "Centre d'examen",
    agentHint: "Confirmation des retraits",
  },
  consultation: {
    title: "Consultation rapide",
    description:
      "Saisissez votre matricule pour connaître la disponibilité de vos documents scolaires. Aucun compte n'est créé automatiquement.",
    matriculeLabel: "Matricule élève",
    matriculePlaceholder: "Ex. DEMO2026001",
    submit: "Consulter la disponibilité",
    searching: "Recherche…",
    errorDefault: "Consultation impossible.",
    notFound:
      "Aucun élève trouvé pour ce matricule. Vérifiez la saisie ou contactez votre organisme si vous venez d'être enregistré.",
    greeting: "Bonjour",
    statusIntro: "voici le statut de vos documents :",
    noExams: "Aucun examen composé n'est rattaché à ce matricule pour le moment.",
    nextSteps:
      "Pour demander un document, payer un duplicata ou prendre un rendez-vous de retrait, activez votre compte ou connectez-vous.",
    connect: "Me connecter",
    sectionBadge: "Consultation rapide",
    sectionTitle: "Vérifiez la disponibilité de vos documents avec votre matricule",
    sectionDescription:
      "Scannez le QR code ou ouvrez la page de consultation : saisissez votre matricule pour voir si vos documents sont disponibles, en attente ou déjà retirés. Aucun compte n'est créé automatiquement.",
    sectionFollowUp:
      "Pour une demande, un paiement ou un rendez-vous de retrait, activez votre compte ou connectez-vous ensuite.",
    openButton: "Ouvrir la consultation",
    qrCaption: "Scannez pour connaître le statut de vos documents académiques.",
    qrAlt: "QR code vers la consultation rapide DR-DOCSCOL",
    qrDevWarning:
      "Ce QR pointe vers localhost : il ne fonctionne pas depuis un téléphone. Ouvrez le site via l'adresse réseau affichée par npm run dev (ex. http://192.168.x.x:3000), connectez le téléphone au même Wi‑Fi, ou définissez NEXT_PUBLIC_SITE_URL / NEXT_PUBLIC_DEV_LAN_URL.",
  },
  documentStatus: {
    PENDING: "Demande non effectuée",
    PAS_DISPONIBLE: "Pas disponible",
    DISPONIBLE: "Disponible",
    RETIRE: "Retiré",
  },
  auth: {
    studentEyebrow: "Espace élève",
    studentPromo: "Vos documents scolaires, simples à suivre.",
    studentSub:
      "Demandes, rendez-vous, notifications et reçus réunis dans un seul espace sécurisé.",
    obcEyebrow: "Administration OBC",
    obcPromo: "Gestion officielle des documents du Baccalauréat.",
    obcSub: "Dossiers, disponibilités et retraits encadrés selon votre antenne régionale.",
    deccEyebrow: "Administration DECC",
    deccPromo: "Gestion officielle des diplômes d'État (BEPC).",
    deccSub: "Dossiers et retraits encadrés selon votre antenne régionale.",
    agentEyebrow: "Centre d'examen",
    agentPromo: "Confirmez les retraits effectués sur place.",
    agentSub: "Validez les retraits physiques des documents le jour du rendez-vous.",
    registerEyebrow: "Activation élève",
    registerPromo: "Activez votre compte élève.",
    registerSub:
      "Votre matricule et votre e-mail doivent déjà être enregistrés par l'administration.",
  },
  dashboard: {
    areas: {
      backOffice: "Back-office",
      agent: "Espace agent",
      student: "Espace élève",
    },
    breadcrumb: "Fil d'Ariane",
    openMenu: "Ouvrir le menu",
    notifications: "Notifications",
    scopePrefix: "Périmètre",
    roles: {
      admin: "Administrateur",
      agent: "Agent centre",
      student: "Élève",
    },
    nav: {
      navigation: "Navigation",
      account: "Compte",
      adminDashboard: "Tableau de bord Admin",
      documents: "Documents",
      students: "Élèves",
      payments: "Paiements",
      appointments: "Rendez-vous",
      availability: "Disponibilités",
      auditLogs: "Journaux d'audit",
      myAccount: "Mon Compte",
      studentDashboard: "Tableau de bord",
      myDocuments: "Mes Documents",
      myAppointments: "Mes Rendez-vous",
      myPayments: "Paiements",
      myNotifications: "Notifications",
      agentWithdrawals: "Retraits du jour",
    },
    paths: {
      admin: "Administration",
      dashboard: "Tableau de bord",
      documents: "Documents scolaires",
      students: "Élèves",
      appointments: "Rendez-vous",
      rendezvous: "Rendez-vous",
      payments: "Paiements",
      notifications: "Notifications",
      rdvdisponibilites: "Disponibilités",
      import: "Import",
      auditlogs: "Logs d'audit",
      account: "Compte",
      centreexamen: "Centre d'examen",
    },
  },
  landing: {
    heroBadge: "Portail officiel des documents scolaires",
    heroTitlePrefix: "Vos documents scolaires,",
    heroTitleHighlight: "enfin simples à retirer",
    heroSubtitle:
      "DR-DOCSCOL réunit les élèves, les équipes OBC/DECC et les centres d'examen sur un même portail : demande en ligne, suivi en temps réel, rendez-vous de retrait et notifications — sans paperasse ni allers-retours inutiles.",
    heroActivate: "Activer mon compte élève",
    heroBulletExams: "BEPC, Probatoire, Baccalauréat, ESG",
    heroBulletAppointments: "Rendez-vous en ligne",
    heroBulletNotifications: "Notifications à chaque étape",
    discoverSolution: "Découvrir la solution",
    stickyNav: {
      label: "Navigation rapide",
      features: "Fonctionnalités",
      steps: "Étapes",
      faq: "FAQ",
    },
    voirPlus: {
      title: "Aller plus loin",
      description:
        "Fonctionnalités détaillées, aperçu de l'espace élève, consultation sans compte et retours utilisateurs.",
      expand: "En savoir plus",
      collapse: "Réduire",
    },
    featuresTabs: {
      features: "Fonctionnalités",
      advantages: "Avantages au quotidien",
    },
    problemTabs: {
      without: "Sans portail",
      with: "Avec DR-DOCSCOL",
    },
    problem: {
      eyebrow: "Problème & solution",
      title: "Fini les longues files d'attente et les aller-retours inutiles",
      description:
        "Hier, impossible d'obtenir des informations claires sur la disponibilité de son diplôme. DR-DOCSCOL réunit toutes les informations nécessaires sur la disponibilité, la prise de rendez-vous et le retrait de vos documents scolaires.",
      withoutTitle: "Sans portail structuré",
      withoutSubtitle: "Ce que vivent encore trop d'élèves et d'équipes",
      withoutBullets: [
        "Longues files d'attente et nombreux aller-retours pour les élèves et les équipes administratives",
        "Absence de visibilité sur l'état d'avancement et la disponibilité réelle des documents",
        "Charge de travail accrue côté administration : gestion manuelle, erreurs de saisie, traçabilité difficile",
        "Frais de transport, délais de traitement et difficulté à obtenir les instructions exactes de retrait",
        "Duplicatas et paiements sans suivi clair pour l'usager",
      ],
      withTitle: "Avec DR-DOCSCOL",
      withSubtitle: "Une trajectoire lisible, de la demande au retrait",
      withBullets: [
        "Chaque demande a un statut visible par l'élève",
        "Créneaux de retrait au bon lieu (centre ou antenne)",
        "Paiement et reçu pour les duplicatas concernés",
        "Agents et admins alignés sur les mêmes informations",
      ],
      problemImageAlt:
        "Longue file d'attente d'usagers patientant sous le soleil devant une administration",
      solutionImageAlt:
        "Élève consultant sereinement le statut de ses documents en ligne depuis chez lui",
    },
    featuresSection: {
      eyebrow: "Fonctionnalités",
      title: "Tout ce dont vous avez besoin, en langage clair",
      description:
        "Chaque fonctionnalité répond à un besoin réel du terrain — pas à une contrainte technique.",
      ariaLabel: "Fonctionnalités principales",
    },
    featureCards: [
      {
        image: "/images/photos/documents.jpg",
        title: "Le statut de vos documents en temps réel",
        description:
          "Suivez chaque demande — en attente, disponible ou retirée — sans relancer personne, depuis votre espace personnel.",
      },
      {
        image: "/images/photos/rendez-vous.jpg",
        title: "Le retrait sur rendez-vous",
        description:
          "Réservez votre créneau au centre d'examen ou à l'antenne régionale compétente, et présentez-vous sans faire la queue.",
      },
      {
        image: "/images/photos/notifications.png",
        title: "Des notifications au bon moment",
        description:
          "Soyez prévenu dès qu'un document est prêt, qu'un rendez-vous approche ou qu'une action vous attend.",
      },
      {
        image: "/images/photos/securite.png",
        title: "Un accès strictement sécurisé",
        description:
          "Activation par matricule, accès personnel et traçabilité complète : chaque démarche reste protégée et vérifiable.",
      },
      {
        image: "/images/photos/graduation.jpg",
        title: "L'OBC et la DECC réunis",
        description:
          "Un seul portail pour l'Office du Baccalauréat du Cameroun et la Direction des Examens, des Concours et de la Certification : dossiers, disponibilités et retraits gérés dans les règles.",
      },
      {
        image: "/images/photos/retrait.png",
        title: "Un retrait confirmé sur place",
        description:
          "L'agent du centre valide chaque retrait physique ; l'administration garde la visibilité sur tous les dossiers.",
      },
    ],
    advantagesGrid: {
      title: "Encore plus d'avantages, au quotidien",
      items: [
        {
          title: "Consultation sans compte",
          description:
            "Saisissez votre matricule sur la page publique pour connaître la disponibilité de vos documents — sans créer de profil.",
        },
        {
          title: "Instructions de retrait claires",
          description:
            "Lieu, créneaux et pièces à présenter : vous savez exactement quoi faire avant de vous déplacer.",
        },
        {
          title: "Moins de paperasse",
          description:
            "Demandes, validations et confirmations numériques : fini les formulaires perdus et les dossiers incomplets.",
        },
        {
          title: "Historique conservé",
          description:
            "Notifications, rendez-vous et reçus de paiement restent accessibles dans votre espace personnel.",
        },
        {
          title: "Gain de temps pour les équipes",
          description:
            "Imports CSV, disponibilisation en masse et tableaux de bord admin : les antennes traitent plus de dossiers, plus vite.",
        },
        {
          title: "Traçabilité et audit",
          description:
            "Chaque action sensible est journalisée : les administrateurs disposent d'une visibilité complète sur les opérations.",
        },
        {
          title: "Réduction des files d'attente",
          description:
            "Les créneaux de retrait étalent l'affluence : moins d'attente sous le soleil, plus de sérénité le jour J.",
        },
        {
          title: "Conformité aux règles officielles",
          description:
            "BEPC, Probatoire, Baccalauréat et ESG : les circuits de demande respectent les règles métier de chaque organisme.",
        },
        {
          title: "Un seul portail, trois profils",
          description:
            "Élève, administrateur OBC/DECC ou agent de centre : chacun accède à l'interface adaptée à son rôle.",
        },
      ],
    },
    whySection: {
      eyebrow: "Pourquoi DR-DOCSCOL ?",
      title:
        "Solution pensée pour résoudre le problème du retrait des documents scolaires (BEPC, Probatoire, Baccalauréat, ESG) au Cameroun",
      description:
        "Moins de déplacements inutiles, moins d'attente au guichet et moins de longues files d'attente : disponibilité en ligne, rendez-vous au bon lieu et retrait encadré selon les règles de l'OBC et de la DECC.",
      bullets: [
        "Plus aucune incertitude : le statut de votre demande reste visible à tout moment.",
        "Moins d'attente au guichet et moins de longues files d'attente : des créneaux de retrait organisés au bon lieu.",
        "Un parcours conforme aux règles officielles du BEPC, du Probatoire, du Baccalauréat et de l'ESG.",
      ],
      overlayTitle: "Clarté, confiance et gain de temps",
      overlayText:
        "Que vous soyez élève, administrateur ou agent de centre, vous travaillez sur les mêmes données à jour — sans double saisie ni confusion.",
      statProfiles: "profils utilisateurs",
      statOnline: "suivi en ligne",
      imageAlt:
        "Élèves camerounais en uniforme scolaire consultant le portail sur leur téléphone en salle de classe",
    },
    previewSection: {
      eyebrow: "Aperçu",
      title: "Votre tableau de bord, en un coup d'œil",
      description:
        "L'espace élève regroupe documents, rendez-vous, paiements et notifications — le tout dans une interface sobre et lisible.",
      bullets: [
        "Liste de vos documents avec statut et lieu de retrait indiqué",
        "Prise de rendez-vous sur les créneaux encore disponibles",
        "Historique des notifications et des reçus de paiement",
        "Accès sécurisé depuis n'importe quel navigateur récent",
      ],
      cta: "Créer mon accès élève",
    },
    stepsSection: {
      eyebrow: "Comment ça marche",
      title: "Quatre étapes, de l'activation au retrait",
      description:
        "Un parcours guidé pour les élèves — les équipes admin et centre interviennent aux bons moments.",
    },
    activationSteps: [
      {
        title: "Activez votre compte",
        text: "Avec votre matricule et l'adresse e-mail déjà connus de l'administration — en quelques minutes.",
        image: "/images/landing/step-activation.png",
      },
      {
        title: "Soumettez votre demande",
        text: "Relevé, diplôme original ou duplicata : choisissez le document adapté à votre situation, selon les règles de votre organisme.",
        image: "/images/landing/step-demande.png",
      },
      {
        title: "Suivez et payez si besoin",
        text: "Suivez l'avancement à chaque étape et réglez en ligne, en toute sécurité, les duplicatas concernés.",
        image: "/images/landing/step-suivi-paiement.png",
      },
      {
        title: "Retirez sur rendez-vous",
        text: "Réservez un créneau au centre d'examen ou à l'antenne régionale, et repartez avec votre document.",
        image: "/images/landing/step-retrait.png",
      },
    ],
    accessSection: {
      eyebrow: "Accès par profil",
      title: "Chacun son espace, selon son rôle",
      description: "Choisissez l'entrée qui correspond à votre situation.",
    },
    testimonialsSection: {
      eyebrow: "Retours utilisateurs",
      title: "Ce que les équipes apprécient",
      description:
        "Élèves, administrations et centres d'examen partagent les bénéfices d'un parcours plus simple, plus rapide et plus transparent.",
      ariaLabel: "Retours utilisateurs",
      placeholder: "Exemple indicatif",
    },
    faqSection: {
      eyebrow: "FAQ",
      title: "Questions fréquentes",
      description: "Les réponses essentielles pour démarrer votre démarche en toute confiance.",
      showAll: "Afficher toutes les questions ({count})",
      showLess: "Afficher moins de questions",
    },
    faqItems: [
      {
        q: "Qui peut utiliser DR-DOCSCOL ?",
        a: "Les élèves dont le profil est déjà enregistré, les administrateurs OBC/DECC et les agents des centres d'examen habilités.",
      },
      {
        q: "Comment activer mon compte élève ?",
        a: "Rendez-vous sur « Activer mon compte », saisissez votre matricule, votre e-mail et choisissez un mot de passe. Vos informations doivent correspondre aux données déjà connues de l'organisme.",
      },
      {
        q: "Je suis administrateur : quelle page de connexion utiliser ?",
        a: "Utilisez « Connexion OBC » pour l'Office du Baccalauréat du Cameroun et « Connexion DECC » pour la Direction des Examens, des Concours et de la Certification (BEPC). La page de connexion élève ne donne pas accès à l'espace administrateur.",
      },
      {
        q: "Quels documents puis-je demander ?",
        a: "Selon votre parcours : relevés de notes, diplômes originaux ou duplicatas (BEPC, Probatoire, Baccalauréat), dans le respect des règles de chaque organisme.",
      },
      {
        q: "Où se passe le retrait ?",
        a: "Au centre d'examen pour la plupart des relevés et du BEPC, ou à l'antenne régionale OBC/DECC lorsque la règle métier l'exige (par exemple certains originaux ou duplicatas).",
      },
      {
        q: "Dois-je payer en ligne ?",
        a: "Le paiement concerne principalement les demandes de duplicata. Les montants et modalités vous sont indiqués dans votre espace au moment de la démarche.",
      },
      {
        q: "Comment suis-je informé de l'avancement ?",
        a: "Par les notifications dans votre espace et, le cas échéant, par e-mail lors des changements importants (document disponible, rendez-vous, etc.).",
      },
    ],
    footer: {
      navLabel: "Liens du pied de page",
      journey: "Parcours",
      access: "Accès",
      orgs: "Organismes",
      studentActivation: "Activation élève",
      signIn: "Connexion",
      copyright: "Tous droits réservés.",
      orgLines: [
        "OBC — Office du Baccalauréat du Cameroun",
        "DECC — Direction des Examens, des Concours et de la Certification",
      ],
    },
    features: [
      {
        title: "Un accès strictement sécurisé",
        description:
          "Activation par matricule, accès personnel et traçabilité complète : chaque démarche reste protégée et vérifiable.",
      },
      {
        title: "L'OBC et la DECC réunis",
        description:
          "Un seul portail pour l'Office du Baccalauréat du Cameroun et la Direction des Examens, des Concours et de la Certification.",
      },
      {
        title: "Un retrait confirmé sur place",
        description:
          "L'agent du centre valide chaque retrait physique ; l'administration garde la visibilité sur tous les dossiers.",
      },
    ],
    portals: [
      {
        title: "Espace élève",
        text: "Vos documents, rendez-vous, notifications et reçus, réunis en un seul espace.",
        cta: "Activer mon compte",
      },
      {
        title: "Administration OBC",
        text: "Baccalauréat, Probatoire et relevés, gérés selon votre antenne régionale.",
        cta: "Connexion OBC",
      },
      {
        title: "Administration DECC",
        text: "BEPC et dossiers d'État, gérés selon votre antenne régionale.",
        cta: "Connexion DECC",
      },
      {
        title: "Centre d'examen",
        text: "Confirmez en un geste les retraits effectués sur place.",
        cta: "Accès agent",
      },
    ],
    ctaTitle: "Prêt à obtenir vos documents sans détour ?",
    ctaSubtitle:
      "Activez votre compte élève ou connectez-vous à votre espace professionnel en quelques clics — et suivez chaque démarche jusqu'au retrait.",
    footerTagline:
      "DR-DOCSCOL — gestion des demandes et retraits de documents scolaires pour l'OBC et la DECC.",
    footerOrgs: "OBC — Office du Baccalauréat du Cameroun · DECC — Direction des Examens, des Concours et de la Certification",
  },
};