#!/usr/bin/env python3
"""Réécrit le Chapitre 1 de bout aligne.docx et complète la bibliographie [14]-[18]."""
from __future__ import annotations

import copy
import shutil
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "bout aligne.docx"
BACKUP = ROOT / "bout aligne.backup-chapitre1.docx"

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

RESEARCH_Q = (
    "Comment concevoir et développer une application web permettant de réduire le temps "
    "consacré aux démarches de retrait de documents scolaires, tant pour les élèves que "
    "pour les services OBC/DECC, tout en rendant le processus plus transparent, "
    "traçable et sécurisé ?"
)

THEME_TITLE = (
    "« Conception, développement et implémentation d'une application web de vérification "
    "et de gestion des retraits de documents scolaires (diplômes, relevés de notes et "
    "duplicatas) : cas de l'OBC et de la DECC du Cameroun »"
)

COMPARATIF_ROWS: list[tuple[str, str, str]] = [
    (
        "Information sur la disponibilité",
        "Diffusion informelle (WhatsApp, affichage) ; pas de notification individualisée",
        "Consultation en ligne du statut ; notifications applicatives et par e-mail",
    ),
    (
        "Démarches de l'usager",
        "Déplacements multiples au guichet pour vérifier, déposer, payer et retirer",
        "Parcours en ligne : demande, suivi, paiement et rendez-vous avant le déplacement",
    ),
    (
        "Suivi des demandes",
        "Aucun identifiant de suivi ; information obtenue sur place",
        "Suivi en temps réel du statut de chaque demande et document",
    ),
    (
        "Paiement",
        "Règlement au guichet uniquement",
        "Paiement applicatif avec génération de reçu (préparation à Mobile Money)",
    ),
    (
        "Planification des retraits",
        "Files d'attente ; planning antenne peu visible pour l'usager",
        "Prise de rendez-vous avec quota journalier et créneaux horaires",
    ),
    (
        "Traçabilité",
        "Registres papier et fichiers dispersés",
        "Historique centralisé des retraits et journal d'audit",
    ),
    (
        "Sécurité et accès",
        "Contrôle sur pièce d'identité au guichet",
        "Authentification sécurisée, profils par rôle (élève, admin, agent)",
    ),
    (
        "Pilotage administratif",
        "Statistiques difficiles à produire",
        "Tableaux de bord et indicateurs sur demandes, rendez-vous et retraits",
    ),
    (
        "Couverture diaspora / mandataire",
        "Procuration papier, expédition manuelle, faible visibilité",
        "Instructions claires en ligne ; réduction des allers-retours inutiles",
    ),
]

NEW_BIBLIO = [
    "Textes officiels et articles en ligne",
    (
        "[14]  Office du Baccalauréat du Cameroun (OBC), « Nos services », [En ligne]. "
        "Disponible sur : https://officedubac.cm/nos-services/. [Consulté en 2026]."
    ),
    (
        "[15]  République du Cameroun, Décret n°2018/608 du 18 octobre 2018 portant "
        "organisation de l'Office du Baccalauréat du Cameroun, [En ligne]. "
        "Disponible sur : https://www.primature.cm/. [Consulté en 2026]."
    ),
    (
        "[16]  Journalducameroun.com, « Cameroun : les diplômes des baccalauréats session 2024 "
        "sont disponibles », [En ligne]. Disponible sur : "
        "https://fr.journalducameroun.com/cameroun-les-diplomes-des-baccalaureats-session-2024-sont-disponibles/. "
        "[Consulté en 2026]."
    ),
    (
        "[17]  The Times of Cameroon, « Session 2024 : Les diplômes sont disponibles », [En ligne]. "
        "Disponible sur : https://timesofcameroon.com/session-2024-les-diplomes-sont-disponibles/. "
        "[Consulté en 2026]."
    ),
    (
        "[18]  Kamerpower, « Procédure de retrait ANDD et diplômes OBC.cm », [En ligne]. "
        "Disponible sur : https://kamerpower.com/fr/procedure-de-retrait-andd-et-diplomes/. "
        "[Consulté en 2026]."
    ),
]

# Chaque entrée : texte simple OU liste de (texte, gras, italique)
# Pour les titres de section, gras=True sur tout le paragraphe via bold_all
ChapterBlock = list[tuple[str, bool, bool]] | str

CHAPTER1_BLOCKS: list[ChapterBlock] = [
    "INTRODUCTION",
    [
        (
            "Ce chapitre pose les bases du projet. Dans un premier temps, nous présentons le centre "
            "de formation Work and Yamo. Dans un second temps, nous nous intéressons aux services "
            "OBC et DECC, organes chargés de la délivrance et du retrait des documents scolaires "
            "au Cameroun, à travers l'étude de l'existant et la formulation de la problématique.",
            False,
            False,
        ),
    ],
    "1.1 PRÉSENTATION DU CENTRE DE FORMATION ET DU STAGE",
    [
        (
            "Le stage s'est déroulé au sein de Work and Yamo, centre de formation professionnelle "
            "situé à Yaoundé. Créé initialement sous forme de startup orientée vers l'accompagnement "
            "numérique, la structure s'est progressivement orientée vers la formation pratique en "
            "développement web et en technologies de l'information, en lien avec les besoins du "
            "marché local.",
            False,
            False,
        ),
    ],
    [
        (
            "Le stage a eu lieu du 18 mars 2026 au __________________, au sein de l'unité "
            "d'apprentissage. L'activité y est organisée autour de projets concrets, du travail en "
            "équipe et de l'encadrement par des formateurs. Le présent mémoire ne porte pas sur le "
            "fonctionnement interne du centre, mais sur un problème métier identifié en amont du "
            "stage et approfondi durant celui-ci.",
            False,
            False,
        ),
    ],
    [
        (
            "L'intérêt pour la gestion des documents scolaires est né d'un constat personnel, issu "
            "de mon expérience : déplacements répétés, files d'attente, manque d'information fiable "
            "sur la disponibilité des diplômes et sur les démarches à suivre. Pour vérifier si ce "
            "que je vivais correspondait à ce que d'autres vivaient, je me suis rapproché de "
            "camarades et de personnes partageant le même cadre de stage. Des échanges informels, "
            "des questionnaires et des discussions m'ont permis, sans prétendre à une enquête "
            "statistique, de constater que le problème était réel et partagé : ce n'était pas un "
            "cas isolé ; plusieurs personnes subissaient les mêmes difficultés. Ces constats ont "
            "orienté le choix du sujet et la rédaction du cahier des charges de l'application "
            "D-SCOLCAM.",
            False,
            False,
        ),
    ],
    "1.2 PRÉSENTATION DES SERVICES OBC ET DECC",
    [
        (
            "Le système de gestion des documents scolaires au Cameroun implique principalement deux "
            "structures placées sous la tutelle du Ministère des Enseignements Secondaires (MINESEC) "
            "[2] : l'Office du Baccalauréat du Cameroun (OBC) et la Direction des Examens, des "
            "Concours et de la Certification (DECC). Ces deux entités sont responsables, chacune "
            "dans son périmètre, de la délivrance, de la conservation et de la remise des documents "
            "scolaires aux candidats.",
            False,
            False,
        ),
    ],
    "1.2.1 L'Office du Baccalauréat du Cameroun (OBC)",
    [
        (
            "L'Office du Baccalauréat du Cameroun, désigné par le sigle OBC, est un établissement "
            "public à caractère administratif créé par le Décret n°93/255 du 28 septembre 1993, "
            "modifié par le Décret n°97/044 du 5 mars 1997, puis réorganisé par le Décret "
            "n°2018/608 du 18 octobre 2018, qui lui a conféré une autonomie financière accrue et "
            "la possibilité de créer des antennes régionales, effectives depuis 2021 [15]. Son siège "
            "est établi à Yaoundé ; il est accessible via le site officiel www.officedubac.cm [1].",
            False,
            False,
        ),
    ],
    [
        (
            "Dans le cadre de notre projet, nous nous intéressons spécifiquement aux missions de "
            "l'OBC relatives à la gestion, la conservation, la délivrance et le retrait des "
            "documents scolaires. Ces missions comprennent notamment :",
            False,
            False,
        ),
    ],
    [
        (
            "La collation des diplômes : ",
            True,
            False,
        ),
        (
            "l'OBC est chargé de la délivrance officielle des diplômes du second cycle en "
            "collaboration avec le MINESEC, après délibération des jurys d'examens.",
            False,
            False,
        ),
    ],
    [
        (
            "La conservation des archives : ",
            True,
            False,
        ),
        (
            "l'OBC conserve les archives des résultats et des diplômes délivrés, ce qui constitue "
            "la base de toute vérification ou demande ultérieure de documents.",
            False,
            False,
        ),
    ],
    [
        (
            "La délivrance des relevés de notes et duplicatas : ",
            True,
            False,
        ),
        (
            "en cas de perte ou de détérioration d'un document officiel, l'OBC est compétent pour "
            "instruire et traiter les demandes de duplicatas ou d'attestations de résultats [14].",
            False,
            False,
        ),
    ],
    [
        (
            "Les antennes régionales : ",
            True,
            False,
        ),
        (
            "depuis 2021, l'OBC dispose d'antennes régionales qui servent de points de retrait "
            "physiques pour les diplômés, réduisant ainsi la nécessité de se déplacer jusqu'au "
            "siège central [1].",
            False,
            False,
        ),
    ],
    "1.2.2 La Direction des Examens, des Concours et de la Certification (DECC)",
    [
        (
            "La Direction des Examens, des Concours et de la Certification, en abrégé DECC, est "
            "une direction technique du MINESEC [2]. Elle constitue l'une des structures "
            "opérationnelles chargées de l'organisation des examens officiels au Cameroun, aux "
            "côtés de l'OBC et du General Certificate of Education Board (GCE Board).",
            False,
            False,
        ),
    ],
    [
        (
            "Dans le périmètre de notre projet, les missions pertinentes de la DECC sont les "
            "suivantes :",
            False,
            False,
        ),
    ],
    [
        (
            "L'organisation des examens du premier cycle : ",
            True,
            False,
        ),
        (
            "la DECC est responsable des examens certificatifs du premier cycle de l'enseignement "
            "secondaire, notamment le Brevet d'Études du Premier Cycle (BEPC) et les Certificats "
            "d'Aptitude Professionnelle (CAP).",
            False,
            False,
        ),
    ],
    [
        (
            "La certification et la délivrance des diplômes du premier cycle : ",
            True,
            False,
        ),
        (
            "à l'issue des délibérations, la DECC assure la production et la remise des diplômes "
            "correspondants aux candidats admis.",
            False,
            False,
        ),
    ],
    [
        (
            "La centralisation et la conservation des archives : ",
            True,
            False,
        ),
        (
            "la DECC centralise les archives relatives aux examens et concours relevant de sa "
            "compétence, constituant ainsi la base documentaire pour les demandes de duplicatas "
            "ou de relevés.",
            False,
            False,
        ),
    ],
    [
        (
            "Le contrôle de l'authenticité des diplômes : ",
            True,
            False,
        ),
        (
            "la DECC veille à la vérification de la conformité et de l'authenticité des documents "
            "délivrés sous son autorité.",
            False,
            False,
        ),
    ],
    "1.2.3 Complémentarité OBC / DECC",
    [
        (
            "L'OBC et la DECC sont deux structures complémentaires dont les périmètres de compétence "
            "couvrent l'ensemble du cycle de l'enseignement secondaire camerounais. L'OBC prend en "
            "charge les examens et documents du second cycle (Probatoires et Baccalauréats), tandis "
            "que la DECC gère ceux du premier cycle (BEPC et CAP). Dans les deux cas, les usagers "
            "— élèves, anciens élèves et diplômés — doivent interagir avec ces structures pour "
            "obtenir, vérifier ou renouveler leurs documents scolaires. C'est précisément ce "
            "processus d'interaction que le projet D-SCOLCAM vise à simplifier et à sécuriser.",
            False,
            False,
        ),
    ],
    "1.3 ANALYSE DE L'EXISTANT",
    "1.3.1 Présentation du fonctionnement actuel",
    [
        (
            "Actuellement, la gestion des demandes et des retraits de documents scolaires au sein "
            "des services OBC et DECC repose essentiellement sur des procédures physiques et "
            "manuelles. L'information sur la disponibilité des documents est diffusée de façon "
            "informelle, principalement via des messages dans des groupes WhatsApp, des publications "
            "sur les réseaux sociaux ou par voie d'affichage dans les établissements scolaires, "
            "en complément des communications ponctuelles des antennes régionales. Il n'existe pas "
            "de canal officiel et systématique de notification individualisée.",
            False,
            False,
        ),
    ],
    [
        (
            "Sur le plan officiel, l'OBC organise le retrait dans ses dix antennes régionales [1]. "
            "Le lauréat doit se présenter en personne, muni d'une pièce d'identité en cours de "
            "validité (carte nationale d'identité ou passeport ; les récépissés ne sont pas "
            "acceptés) [14][18]. À l'antenne régionale du Centre à Yaoundé, un planning de retrait "
            "distingue les sessions et fixe des horaires de service généralement de 7 h 30 à 15 h "
            "[16][17]. Pour certaines démarches, comme le retrait d'une attestation de "
            "non-délivrance, la fenêtre d'accueil peut être très restreinte [18].",
            False,
            False,
        ),
    ],
    [
        (
            "Pour la session 2024, le retrait gratuit des diplômes était possible jusqu'au "
            "31 décembre 2025 ; au-delà de cette date, des frais de pénalité pour retrait tardif "
            "de 25 000 FCFA sont appliqués [16][17]. Ce dispositif illustre l'importance d'une "
            "information individualisée et traçable : un diplômé peut être pénalisé financièrement "
            "sans négligence de sa part, faute d'avoir été informé à temps.",
            False,
            False,
        ),
    ],
    [
        (
            "Pour tout retrait, demande ou simple renseignement, l'usager doit se présenter "
            "physiquement dans le centre de retrait désigné. À l'accueil, les agents enregistrent "
            "les informations manuellement dans des registres papier ou des fichiers bureautiques ; "
            "l'usager remplit une fiche papier (identité, filière, session, centre, coordonnées) "
            "[16][17]. Les demandes de duplicata exigent un dossier papier (demande adressée au "
            "directeur général, photocopie de la CNI, déclaration de perte, décharge du bordereau "
            "de réussite, etc.), avec des tarifs officiels de 10 000 FCFA pour un relevé et "
            "15 000 FCFA pour un diplôme [14]. Le règlement s'effectue sur place ; il n'existe "
            "pas, à ce jour, de portail national de suivi des demandes pour l'usager.",
            False,
            False,
        ),
    ],
    [
        (
            "Pour les lauréats résidant à l'étranger, une procuration légalisée par une autorité "
            "diplomatique ou consulaire camerounaise est requise ; le mandataire se présente "
            "ensuite à l'antenne et l'expédition du document reste à la charge du demandeur "
            "[14][18]. La DECC, de son côté, assure le premier cycle (BEPC, CAP) selon un "
            "schéma comparable : dépôt et retrait physiques, instruction manuelle des dossiers, "
            "sans chaîne numérique unifiée avec l'OBC.",
            False,
            False,
        ),
    ],
    "1.3.2 Outils utilisés",
    [
        (
            "L'ensemble des opérations de gestion des documents scolaires repose sur des outils "
            "informels et non spécialisés, notamment :",
            False,
            False,
        ),
    ],
    [
        (
            "Registres papier et fichiers bureautiques : ",
            True,
            False,
        ),
        (
            "enregistrement manuel des retraits effectués, sans base de données centralisée ni "
            "système de recherche rapide.",
            False,
            False,
        ),
    ],
    [
        (
            "Messagerie informelle (WhatsApp, SMS, affichage) : ",
            True,
            False,
        ),
        (
            "seuls canaux disponibles pour informer les élèves de la disponibilité de leurs "
            "documents, sans garantie d'exhaustivité ni de fiabilité.",
            False,
            False,
        ),
    ],
    [
        (
            "Guichets physiques : ",
            True,
            False,
        ),
        (
            "seul point de contact entre l'usager et l'administration pour toute démarche liée "
            "aux documents scolaires.",
            False,
            False,
        ),
    ],
    "1.4 CRITIQUE DE L'EXISTANT",
    [
        (
            "L'analyse du dispositif actuel met en évidence un écart persistant entre des procédures "
            "officielles documentées et une expérience usager marquée par l'incertitude, les "
            "déplacements répétés et l'absence de visibilité en temps réel.",
            False,
            False,
        ),
    ],
    [
        (
            "Manque d'information officielle et inclusive : ",
            True,
            False,
        ),
        (
            "la diffusion via WhatsApp ou les réseaux sociaux n'atteint pas tous les diplômés. Or, "
            "pour certaines sessions, le retrait gratuit est limité dans le temps ; passé le délai "
            "fixé, des pénalités de 25 000 FCFA s'appliquent [16][17]. Des lauréats peuvent ainsi "
            "être pénalisés sans négligence, faute d'avoir reçu une information individualisée.",
            False,
            False,
        ),
    ],
    [
        (
            "Contraintes horaires et organisationnelles rigides : ",
            True,
            False,
        ),
        (
            "le retrait reste conditionné par la présence physique, des plages horaires fixes et, "
            "pour certaines démarches, des créneaux très étroits [16][17][18]. Cela favorise les "
            "files d'attente et les déplacements infructueux, particulièrement coûteux pour les "
            "usagers venant de l'intérieur du pays ou de la diaspora.",
            False,
            False,
        ),
    ],
    [
        (
            "Procédures lourdes et peu traçables pour l'usager : ",
            True,
            False,
        ),
        (
            "les duplicatas et rectifications reposent sur des dossiers papier multiples [14], sans "
            "notification automatique de l'état d'instruction. L'usager ne dispose d'aucun "
            "identifiant de suivi et doit souvent revenir au guichet pour obtenir une simple "
            "information.",
            False,
            False,
        ),
    ],
    [
        (
            "Opacité et risque d'intermédiation informelle : ",
            True,
            False,
        ),
        (
            "faute de canal unique et transparent (tarifs, délais, pièces requises, lieu de retrait "
            "selon le type de document et la région), certains usagers recourent à des "
            "intermédiaires non officiels, avec des coûts supérieurs aux barèmes publics — "
            "phénomène favorisé par la complexité perçue du parcours.",
            False,
            False,
        ),
    ],
    [
        (
            "Absence de suivi des démarches : ",
            True,
            False,
        ),
        (
            "les usagers n'ont aucun moyen de connaître l'état d'avancement de leur demande sans "
            "se déplacer physiquement jusqu'au service compétent.",
            False,
            False,
        ),
    ],
    [
        (
            "Charge de travail élevée côté administration : ",
            True,
            False,
        ),
        (
            "la gestion manuelle de chaque dossier alourdit la charge des agents, multiplie les "
            "risques d'erreurs de saisie et rend difficile la traçabilité des retraits effectués.",
            False,
            False,
        ),
    ],
    [
        (
            "Impossibilité de pilotage statistique : ",
            True,
            False,
        ),
        (
            "l'absence d'une base de données structurée rend impossible la production de "
            "statistiques fiables sur les retraits, les demandes en attente et les taux de retrait "
            "par session.",
            False,
            False,
        ),
    ],
    [
        (
            "Absence de solution numérique dédiée : ",
            True,
            False,
        ),
        (
            "des démarches administratives camerounaises se sont partiellement dématérialisées, "
            "comme la plateforme IDCAM pour la carte nationale d'identité [3]. En revanche, aucune "
            "plateforme nationale ne couvre aujourd'hui de bout en bout la vérification, la "
            "demande, le paiement et la planification du retrait des documents scolaires OBC/DECC — "
            "d'où le vide que vise D-SCOLCAM.",
            False,
            False,
        ),
    ],
    "1.5 ÉLÉMENTS DU CAHIER DES CHARGES",
    [
        (
            "À partir de cette analyse, le projet vise une application web (D-SCOLCAM) permettant "
            "aux élèves et diplômés de consulter leurs documents, formuler des demandes (relevés, "
            "duplicatas), être notifiés, payer lorsque requis et planifier un rendez-vous de "
            "retrait, tandis que les administrateurs OBC/DECC et les agents de centre disposent "
            "d'un back-office pour gérer statuts, imports, rendez-vous et retraits. Le périmètre "
            "couvre les règles de routage entre OBC et DECC selon le type de document et la "
            "région. Le cahier des charges détaillé est développé au chapitre 2 ; ici, il sert "
            "de référence pour situer la réponse proposée face à l'existant.",
            False,
            False,
        ),
    ],
    "1.6 COMPARAISON ENTRE LE SYSTÈME ACTUEL ET D-SCOLCAM",
    "Tableau 1 : Comparatif entre le système manuel actuel et la solution D-SCOLCAM",
    "__TABLE_COMPARATIF__",
    "1.7 PROBLÉMATIQUE",
    [
        (
            "Actuellement, la gestion des documents scolaires au sein des services OBC et DECC du "
            "Cameroun repose sur des procédures manuelles et informelles. Les élèves et diplômés "
            "effectuent de multiples déplacements pour vérifier la disponibilité de leurs "
            "documents, déposer des demandes et retirer leurs diplômes, souvent après de longues "
            "files d'attente sans garantie de retrait le jour même. Ce système engendre des "
            "délais, des erreurs, un manque de transparence et une communication déficiente, avec "
            "des conséquences concrètes : amendes pour retrait tardif, coûts de transport, recours "
            "à des intermédiaires informels.",
            False,
            False,
        ),
    ],
    [
        (
            "Des solutions numériques ont été développées dans d'autres contextes administratifs "
            "camerounais, comme la plateforme IDCAM pour la carte nationale d'identité [3]. "
            "Cependant, aucune solution dédiée ne couvre aujourd'hui l'ensemble du parcours "
            "documentaire scolaire OBC/DECC.",
            False,
            False,
        ),
    ],
    [
        (
            "La question centrale de cette recherche est donc la suivante : ",
            False,
            False,
        ),
        (RESEARCH_Q, False, True),
    ],
    [
        (
            "Pour explorer cette problématique, trois questions spécifiques seront abordées : "
            "quelles sont les insuffisances concrètes du système actuel de gestion des documents "
            "scolaires au Cameroun ? Comment les technologies web modernes peuvent-elles être "
            "mobilisées pour automatiser et sécuriser ce processus ? Enfin, quelle approche de "
            "conception garantira que l'application soit intuitive, adaptée aux besoins des "
            "usagers et conforme aux règles métier OBC / DECC ?",
            False,
            False,
        ),
    ],
    [
        (
            "C'est pour répondre à cette problématique que nous avons choisi d'étudier le thème "
            "intitulé : ",
            False,
            False,
        ),
        (THEME_TITLE, False, True),
        (
            ". Cette solution devrait constituer un outil central de gestion des documents "
            "scolaires pour ces services, et il devient évident que sa réalisation serait "
            "judicieuse pour moderniser et sécuriser l'ensemble du processus.",
            False,
            False,
        ),
    ],
    "CONCLUSION",
    [
        (
            "Ce chapitre a d'abord situé le stage au sein de Work and Yamo, puis présenté les "
            "services OBC et DECC. La partie la plus développée a porté sur l'analyse du "
            "fonctionnement actuel, la critique de ses limites, l'esquisse du cahier des charges, "
            "la comparaison avec l'approche D-SCOLCAM et la formulation de la problématique. "
            "Le chapitre suivant exposera la méthodologie retenue, la conception fonctionnelle "
            "et technique de l'application, ainsi que les choix d'architecture et de modélisation "
            "qui en découlent.",
            False,
            False,
        ),
    ],
]


def para_text(p: ET.Element) -> str:
    return "".join(t.text or "" for t in p.iter(f"{W}t")).strip()


def clone_pPr(template: ET.Element) -> ET.Element | None:
    pPr = template.find(f"{W}pPr")
    return copy.deepcopy(pPr) if pPr is not None else None


def make_run(text: str, bold: bool = False, italic: bool = False) -> ET.Element:
    r = ET.Element(f"{W}r")
    if bold or italic:
        rPr = ET.SubElement(r, f"{W}rPr")
        if bold:
            ET.SubElement(rPr, f"{W}b")
            ET.SubElement(rPr, f"{W}bCs")
        if italic:
            ET.SubElement(rPr, f"{W}i")
            ET.SubElement(rPr, f"{W}iCs")
    t = ET.SubElement(r, f"{W}t")
    if text.startswith(" ") or text.endswith(" "):
        t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    t.text = text
    return r


def make_paragraph(parts: list[tuple[str, bool, bool]], pPr_template: ET.Element | None) -> ET.Element:
    p = ET.Element(f"{W}p")
    if pPr_template is not None:
        p.append(copy.deepcopy(pPr_template))
    for text, bold, italic in parts:
        p.append(make_run(text, bold=bold, italic=italic))
    return p


def make_simple_paragraph(text: str, pPr_template: ET.Element | None, *, italic: bool = False) -> ET.Element:
    return make_paragraph([(text, False, italic)], pPr_template)


def make_comparatif_table(pPr_template: ET.Element | None) -> ET.Element:
    tbl = ET.Element(f"{W}tbl")
    tbl_pr = ET.SubElement(tbl, f"{W}tblPr")
    ET.SubElement(tbl_pr, f"{W}tblW", {f"{W}w": "5000", f"{W}type": "pct"})
    borders = ET.SubElement(tbl_pr, f"{W}tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        ET.SubElement(
            borders,
            f"{W}{edge}",
            {f"{W}val": "single", f"{W}sz": "4", f"{W}space": "0", f"{W}color": "999999"},
        )
    grid = ET.SubElement(tbl, f"{W}tblGrid")
    for width in ("1800", "3300", "3300"):
        ET.SubElement(grid, f"{W}gridCol", {f"{W}w": width})

    header = ("Critère", "Système manuel actuel (OBC/DECC)", "Solution proposée (D-SCOLCAM)")
    rows = [header, *COMPARATIF_ROWS]

    for r_idx, row in enumerate(rows):
        tr = ET.SubElement(tbl, f"{W}tr")
        for c_idx, cell_text in enumerate(row):
            tc = ET.SubElement(tr, f"{W}tc")
            tc_pr = ET.SubElement(tc, f"{W}tcPr")
            ET.SubElement(tc_pr, f"{W}tcW", {f"{W}w": "1800" if c_idx == 0 else "3300", f"{W}type": "dxa"})
            if r_idx == 0:
                shd = ET.SubElement(tc_pr, f"{W}shd")
                shd.set(f"{W}val", "clear")
                shd.set(f"{W}color", "auto")
                shd.set(f"{W}fill", "F0F0F0")
            cp = ET.SubElement(tc, f"{W}p")
            if pPr_template is not None:
                cp.append(copy.deepcopy(pPr_template))
            cp.append(make_run(cell_text, bold=(r_idx == 0)))
    return tbl


def build_chapter_nodes(pPr_template: ET.Element | None) -> list[ET.Element]:
    nodes: list[ET.Element] = []
    for block in CHAPTER1_BLOCKS:
        if block == "__TABLE_COMPARATIF__":
            nodes.append(make_comparatif_table(pPr_template))
            continue
        if isinstance(block, str):
            nodes.append(make_simple_paragraph(block, pPr_template))
            continue
        nodes.append(make_paragraph(block, pPr_template))
    return nodes


def find_chapter1_range(children: list[ET.Element]) -> tuple[int, int, ET.Element | None]:
    chapitre1_idx = intro_start = end = None
    pPr_template = None

    for i, child in enumerate(children):
        if child.tag != f"{W}p":
            continue
        text = para_text(child)
        if text in ("CHAPITRE 1", "CHAPITRE 1:") or (
            text.startswith("CHAPITRE 1") and len(text) <= 12 and "…" not in text
        ):
            chapitre1_idx = i
        if chapitre1_idx is not None and intro_start is None and text == "INTRODUCTION":
            intro_start = i
            pPr_template = clone_pPr(child)
        if intro_start is not None and text.startswith("CHAPITRE 2"):
            end = i
            break

    if intro_start is None or end is None:
        raise SystemExit("Impossible de localiser le Chapitre 1.")
    return intro_start, end, pPr_template


def find_bib_insert_index(children: list[ET.Element]) -> int:
    for i, child in enumerate(children):
        if child.tag != f"{W}p":
            continue
        if para_text(child).startswith("[13]"):
            return i + 1
    raise SystemExit("Référence [13] introuvable.")


def main() -> None:
    if not DOCX.exists():
        raise SystemExit(f"Fichier introuvable : {DOCX}")

    shutil.copy2(DOCX, BACKUP)

    with zipfile.ZipFile(DOCX, "r") as zin:
        xml = zin.read("word/document.xml")
        other_files = {name: zin.read(name) for name in zin.namelist() if name != "word/document.xml"}

    root = ET.fromstring(xml)
    body = root.find(f"{W}body")
    if body is None:
        raise SystemExit("document.xml invalide")

    children = list(body)
    start, end, pPr_template = find_chapter1_range(children)
    old_block = children[start:end]
    new_nodes = build_chapter_nodes(pPr_template)

    insert_at = list(body).index(old_block[0])
    for node in old_block:
        body.remove(node)
    for offset, node in enumerate(new_nodes):
        body.insert(insert_at + offset, node)

    # Bibliographie [14]-[18] si absente
    children = list(body)
    has_14 = any(
        child.tag == f"{W}p" and para_text(child).startswith("[14]")
        for child in children
    )
    if not has_14:
        bib_idx = find_bib_insert_index(children)
        bib_nodes: list[ET.Element] = []
        for entry in NEW_BIBLIO:
            bib_nodes.append(make_simple_paragraph(entry, pPr_template))
        for offset, node in enumerate(bib_nodes):
            body.insert(bib_idx + offset, node)

    new_xml = ET.tostring(root, encoding="utf-8", xml_declaration=True)
    with zipfile.ZipFile(DOCX, "w", compression=zipfile.ZIP_DEFLATED) as zout:
        zout.writestr("word/document.xml", new_xml)
        for name, data in other_files.items():
            zout.writestr(name, data)

    print(f"OK — Chapitre 1 mis à jour ({len(new_nodes)} blocs) : {DOCX}")
    print(f"Sauvegarde : {BACKUP}")


if __name__ == "__main__":
    main()
