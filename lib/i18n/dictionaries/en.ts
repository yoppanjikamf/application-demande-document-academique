import type { Dictionary } from "@/lib/i18n/types";

export const dictionary: Dictionary = {
  common: {
    language: "Language",
    french: "Français",
    english: "English",
    activation: "Activation",
    scope: "Scope",
    loading: "Loading…",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    mySpace: "My space",
    account: "Account",
    logout: "Sign out",
    help: "Help",
    navigation: "Navigation",
    securePortal: "Secure portal",
    authorizedAccess: "Access restricted to authorized users.",
    alreadyHaveAccount: "I already have an account",
    startNow: "Get started",
    signIn: "Sign in",
    activateAccount: "Activate my account",
    activateStudentAccount: "Activate my student account",
    signInAs: "Sign in as",
    notConcerned: "Not your profile? Choose your portal:",
    alreadyRegistered: "Already registered? Sign in to your space:",
  },
  nav: {
    homeSections: "Home page sections",
    features: "Features",
    consultation: "Lookup",
    steps: "Steps",
    access: "Access",
    faq: "FAQ",
    problemSolution: "Problem & solution",
    mobileNav: "Mobile sections",
    accountNav: "Account navigation",
    accountMobile: "Account navigation (mobile)",
    myAccount: "My account",
  },
  loginPortals: {
    student: "Student portal",
    studentHint: "Student ID, email and password",
    obc: "OBC administration",
    obcHint: "Baccalaureate, Probatoire and transcripts",
    decc: "DECC administration",
    deccHint: "BEPC and DECC records",
    agent: "Examination centre",
    agentHint: "Withdrawal confirmation",
  },
  consultation: {
    title: "Quick lookup",
    description:
      "Enter your student ID to check the availability of your academic documents. No account is created automatically.",
    matriculeLabel: "Student ID",
    matriculePlaceholder: "E.g. DEMO2026001",
    submit: "Check availability",
    searching: "Searching…",
    errorDefault: "Unable to look up records.",
    notFound:
      "No student found for this ID. Check your entry or contact your organisation if you were recently registered.",
    greeting: "Hello",
    statusIntro: "here is the status of your documents:",
    noExams: "No completed exams are linked to this student ID yet.",
    nextSteps:
      "To request a document, pay for a duplicate or book a withdrawal appointment, activate your account or sign in.",
    connect: "Sign in",
    sectionBadge: "Quick lookup",
    sectionTitle: "Check document availability with your student ID",
    sectionDescription:
      "Scan the QR code or open the lookup page: enter your student ID to see whether your documents are available, pending or already collected. No account is created automatically.",
    sectionFollowUp:
      "To submit a request, pay for a duplicate or book a withdrawal appointment, activate your account or sign in afterwards.",
    openButton: "Open lookup",
    qrCaption: "Scan to check the status of your academic documents.",
    qrAlt: "QR code to DR-DOCSCOL quick lookup",
    qrDevWarning:
      "This QR points to localhost and will not work from a phone. Open the site using the network address shown by npm run dev (e.g. http://192.168.x.x:3000), connect your phone to the same Wi‑Fi, or set NEXT_PUBLIC_SITE_URL / NEXT_PUBLIC_DEV_LAN_URL.",
  },
  documentStatus: {
    PENDING: "Request not submitted",
    PAS_DISPONIBLE: "Not available",
    DISPONIBLE: "Available",
    RETIRE: "Withdrawn",
  },
  auth: {
    studentEyebrow: "Student portal",
    studentPromo: "Your academic documents, easy to follow.",
    studentSub:
      "Requests, appointments, notifications and receipts in one secure space.",
    obcEyebrow: "OBC administration",
    obcPromo: "Official management of Baccalaureate documents.",
    obcSub: "Records, availability and withdrawals managed for your regional office.",
    deccEyebrow: "DECC administration",
    deccPromo: "Official management of BEPC state diplomas.",
    deccSub: "Records and withdrawals managed for your regional office.",
    agentEyebrow: "Examination centre",
    agentPromo: "Confirm withdrawals completed on site.",
    agentSub: "Validate physical document handovers on appointment day.",
    registerEyebrow: "Student activation",
    registerPromo: "Activate your student account.",
    registerSub: "Your student ID and email must already be registered by the administration.",
  },
  dashboard: {
    areas: {
      backOffice: "Back office",
      agent: "Agent portal",
      student: "Student portal",
    },
    breadcrumb: "Breadcrumb",
    openMenu: "Open menu",
    notifications: "Notifications",
    scopePrefix: "Scope",
    roles: {
      admin: "Administrator",
      agent: "Centre agent",
      student: "Student",
    },
    nav: {
      navigation: "Navigation",
      account: "Account",
      adminDashboard: "Admin dashboard",
      documents: "Documents",
      students: "Students",
      payments: "Payments",
      appointments: "Appointments",
      availability: "Availability",
      auditLogs: "Audit logs",
      myAccount: "My account",
      studentDashboard: "Dashboard",
      myDocuments: "My documents",
      myAppointments: "My appointments",
      myPayments: "Payments",
      myNotifications: "Notifications",
      agentWithdrawals: "Today's withdrawals",
    },
    paths: {
      admin: "Administration",
      dashboard: "Dashboard",
      documents: "Academic documents",
      students: "Students",
      appointments: "Appointments",
      rendezvous: "Appointments",
      payments: "Payments",
      notifications: "Notifications",
      rdvdisponibilites: "Availability",
      import: "Import",
      auditlogs: "Audit logs",
      account: "Account",
      centreexamen: "Examination centre",
    },
  },
  landing: {
    heroBadge: "Official school documents portal",
    heroTitlePrefix: "Your academic documents,",
    heroTitleHighlight: "finally easy to collect",
    heroSubtitle:
      "DR-DOCSCOL brings together students, OBC/DECC teams and examination centres on one portal: online requests, real-time tracking, withdrawal appointments and notifications — without paperwork or unnecessary trips.",
    heroActivate: "Activate my student account",
    heroBulletExams: "BEPC, Probatoire, Baccalaureate, ESG",
    heroBulletAppointments: "Online appointments",
    heroBulletNotifications: "Notifications at every step",
    discoverSolution: "Discover the solution",
    stickyNav: {
      label: "Quick navigation",
      features: "Features",
      steps: "Steps",
      faq: "FAQ",
    },
    voirPlus: {
      title: "Go further",
      description:
        "Detailed features, student space preview, lookup without an account and user feedback.",
      expand: "Learn more",
      collapse: "Show less",
    },
    featuresTabs: {
      features: "Features",
      advantages: "Daily benefits",
    },
    problemTabs: {
      without: "Without a portal",
      with: "With DR-DOCSCOL",
    },
    problem: {
      eyebrow: "Problem & solution",
      title: "No more long queues and unnecessary trips",
      description:
        "Until now, it was hard to get clear information about diploma availability. DR-DOCSCOL brings together everything you need about availability, appointments and withdrawal of your school documents.",
      withoutTitle: "Without a structured portal",
      withoutSubtitle: "What too many students and teams still experience",
      withoutBullets: [
        "Long queues and repeated trips for students and administrative teams",
        "No visibility on progress or actual document availability",
        "Higher workload for administration: manual handling, data entry errors, poor traceability",
        "Transport costs, processing delays and difficulty getting exact withdrawal instructions",
        "Duplicates and payments with no clear follow-up for users",
      ],
      withTitle: "With DR-DOCSCOL",
      withSubtitle: "A clear path from request to withdrawal",
      withBullets: [
        "Every request has a status visible to the student",
        "Withdrawal slots at the right location (centre or regional office)",
        "Payment and receipt for relevant duplicate requests",
        "Agents and admins aligned on the same up-to-date information",
      ],
      problemImageAlt: "Long queue of people waiting in the sun outside an administration building",
      solutionImageAlt: "Student calmly checking document status online from home",
    },
    featuresSection: {
      eyebrow: "Features",
      title: "Everything you need, in plain language",
      description: "Each feature addresses a real need on the ground — not a technical constraint.",
      ariaLabel: "Main features",
    },
    featureCards: [
      {
        image: "/images/photos/documents.jpg",
        title: "Real-time document status",
        description:
          "Track every request — pending, available or collected — without chasing anyone, from your personal space.",
      },
      {
        image: "/images/photos/rendez-vous.jpg",
        title: "Withdrawal by appointment",
        description:
          "Book your slot at the examination centre or competent regional office and show up without queuing.",
      },
      {
        image: "/images/photos/notifications.png",
        title: "Timely notifications",
        description:
          "Get notified when a document is ready, an appointment is approaching or an action is required.",
      },
      {
        image: "/images/photos/securite.png",
        title: "Strictly secure access",
        description:
          "Activation by student ID, personal access and full traceability: every step stays protected and auditable.",
      },
      {
        image: "/images/photos/graduation.jpg",
        title: "OBC and DECC together",
        description:
          "One portal for the Cameroon Baccalaureate Office and the Directorate of Exams, Competitions and Certification: records, availability and withdrawals managed by the rules.",
      },
      {
        image: "/images/photos/retrait.png",
        title: "Withdrawal confirmed on site",
        description:
          "The centre agent validates each physical handover; administration keeps visibility on all records.",
      },
    ],
    advantagesGrid: {
      title: "Even more benefits, every day",
      items: [
        {
          title: "Lookup without an account",
          description:
            "Enter your student ID on the public page to check document availability — no profile required.",
        },
        {
          title: "Clear withdrawal instructions",
          description:
            "Location, slots and documents to bring: you know exactly what to do before travelling.",
        },
        {
          title: "Less paperwork",
          description:
            "Digital requests, validations and confirmations: no more lost forms or incomplete files.",
        },
        {
          title: "Preserved history",
          description:
            "Notifications, appointments and payment receipts stay accessible in your personal space.",
        },
        {
          title: "Time saved for teams",
          description:
            "CSV imports, bulk availability and admin dashboards: regional offices process more records, faster.",
        },
        {
          title: "Traceability and audit",
          description:
            "Every sensitive action is logged: administrators have full visibility over operations.",
        },
        {
          title: "Shorter queues",
          description:
            "Withdrawal slots spread demand: less waiting in the sun, more peace of mind on the day.",
        },
        {
          title: "Official rules compliance",
          description:
            "BEPC, Probatoire, Baccalaureate and ESG: request flows follow each organisation's business rules.",
        },
        {
          title: "One portal, three profiles",
          description:
            "Student, OBC/DECC administrator or centre agent: each user gets the interface suited to their role.",
        },
      ],
    },
    whySection: {
      eyebrow: "Why DR-DOCSCOL?",
      title:
        "Built to solve school document withdrawal (BEPC, Probatoire, Baccalaureate, ESG) in Cameroon",
      description:
        "Fewer unnecessary trips, less counter waiting and shorter queues: online availability, appointments at the right place and controlled withdrawal under OBC and DECC rules.",
      bullets: [
        "No more uncertainty: your request status stays visible at all times.",
        "Less counter waiting and shorter queues: organised withdrawal slots at the right location.",
        "A path aligned with official BEPC, Probatoire, Baccalaureate and ESG rules.",
      ],
      overlayTitle: "Clarity, trust and time saved",
      overlayText:
        "Whether you are a student, administrator or centre agent, you work from the same up-to-date data — no duplicate entry or confusion.",
      statProfiles: "user profiles",
      statOnline: "online tracking",
      imageAlt: "Cameroonian students in uniform checking the portal on their phone in class",
    },
    previewSection: {
      eyebrow: "Preview",
      title: "Your dashboard at a glance",
      description:
        "The student space brings together documents, appointments, payments and notifications — in a clean, readable interface.",
      bullets: [
        "List of your documents with status and withdrawal location",
        "Book appointments on remaining available slots",
        "History of notifications and payment receipts",
        "Secure access from any recent browser",
      ],
      cta: "Create my student access",
    },
    stepsSection: {
      eyebrow: "How it works",
      title: "Four steps from activation to withdrawal",
      description:
        "A guided path for students — admin and centre teams step in at the right moments.",
    },
    activationSteps: [
      {
        title: "Activate your account",
        text: "With your student ID and e-mail already known to the administration — in a few minutes.",
        image: "/images/landing/step-activation.png",
      },
      {
        title: "Submit your request",
        text: "Transcript, original diploma or duplicate: choose the document that fits your situation, under your organisation's rules.",
        image: "/images/landing/step-demande.png",
      },
      {
        title: "Track and pay if needed",
        text: "Follow progress at each step and pay online securely for relevant duplicate requests.",
        image: "/images/landing/step-suivi-paiement.png",
      },
      {
        title: "Collect by appointment",
        text: "Book a slot at the examination centre or regional office and leave with your document.",
        image: "/images/landing/step-retrait.png",
      },
    ],
    accessSection: {
      eyebrow: "Access by profile",
      title: "The right space for your role",
      description: "Choose the entry that matches your situation.",
    },
    testimonialsSection: {
      eyebrow: "User feedback",
      title: "What teams appreciate",
      description:
        "Students, administrations and examination centres share the benefits of a simpler, faster and more transparent journey.",
      ariaLabel: "User feedback",
      placeholder: "Illustrative example",
    },
    faqSection: {
      eyebrow: "FAQ",
      title: "Frequently asked questions",
      description: "Essential answers to start your process with confidence.",
      showAll: "Show all questions ({count})",
      showLess: "Show fewer questions",
    },
    faqItems: [
      {
        q: "Who can use DR-DOCSCOL?",
        a: "Students whose profile is already registered, OBC/DECC administrators and authorised examination centre agents.",
      },
      {
        q: "How do I activate my student account?",
        a: "Go to “Activate my account”, enter your student ID, e-mail and choose a password. Your details must match data already held by the organisation.",
      },
      {
        q: "I'm an administrator: which sign-in page should I use?",
        a: "Use “OBC sign in” for the Cameroon Baccalaureate Office and “DECC sign in” for the Directorate of Exams, Competitions and Certification (BEPC). The student sign-in page does not grant admin access.",
      },
      {
        q: "Which documents can I request?",
        a: "Depending on your path: transcripts, original diplomas or duplicates (BEPC, Probatoire, Baccalaureate), in line with each organisation's rules.",
      },
      {
        q: "Where does withdrawal take place?",
        a: "At the examination centre for most transcripts and BEPC, or at the OBC/DECC regional office when business rules require it (e.g. certain originals or duplicates).",
      },
      {
        q: "Do I have to pay online?",
        a: "Payment mainly applies to duplicate requests. Amounts and methods are shown in your space when you start the process.",
      },
      {
        q: "How am I informed of progress?",
        a: "Through notifications in your space and, where applicable, by e-mail for important changes (document available, appointment, etc.).",
      },
    ],
    footer: {
      navLabel: "Footer links",
      journey: "Journey",
      access: "Access",
      orgs: "Organisations",
      studentActivation: "Student activation",
      signIn: "Sign in",
      copyright: "All rights reserved.",
      orgLines: [
        "OBC — Cameroon Baccalaureate Office",
        "DECC — Directorate of Exams, Competitions and Certification",
      ],
    },
    features: [
      {
        title: "Strictly secure access",
        description:
          "Activation by student ID, personal access and full traceability: every step stays protected and auditable.",
      },
      {
        title: "OBC and DECC together",
        description:
          "One portal for the Cameroon Baccalaureate Office and the Directorate of Exams, Competitions and Certification.",
      },
      {
        title: "Withdrawal confirmed on site",
        description:
          "The centre agent validates each physical handover; administration keeps visibility on all records.",
      },
    ],
    portals: [
      {
        title: "Student portal",
        text: "Your documents, appointments, notifications and receipts in one place.",
        cta: "Activate my account",
      },
      {
        title: "OBC administration",
        text: "Baccalaureate, Probatoire and transcripts for your regional office.",
        cta: "OBC sign in",
      },
      {
        title: "DECC administration",
        text: "BEPC and state records for your regional office.",
        cta: "DECC sign in",
      },
      {
        title: "Examination centre",
        text: "Confirm withdrawals completed on site.",
        cta: "Agent access",
      },
    ],
    ctaTitle: "Ready to get your documents without detours?",
    ctaSubtitle:
      "Activate your student account or sign in to your professional space in a few clicks — and track every step through to withdrawal.",
    footerTagline:
      "DR-DOCSCOL — management of academic document requests and withdrawals for OBC and DECC.",
    footerOrgs:
      "OBC — Cameroon Baccalaureate Office · DECC — Directorate of Exams, Competitions and Certification",
  },
};
