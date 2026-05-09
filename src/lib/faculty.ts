const PLACEHOLDER_IMAGE = "/Faculty_pics/sample.svg";

export interface FacultyMember {
  name: string;
  title: string;
  description: string;
  image: string;
}

export interface Department {
  slug: string;
  name: string;
  side: "left" | "right";
  y: number;
  x: number;
  link: string;
  logoAnchor: {
    x: number;
    y: number;
  };
  zoomScale: number;
}

export const facultyByDept: Record<string, FacultyMember[]> = {
  "Deans Office": [
    {
      name: "DR. MA. BETH S. CONCEPCION",
      title: "College Dean",
      description: "Faculty in BSIS and MIT",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "MR. NEILJAN C. RABORAR",
      title: "College Secretary / Quality Assurance Focal Person",
      description: "Faculty in BSIS",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "MS. AUBREY V. BALAJADIA",
      title: "Admin Aide Clerk",
      description: "Office Administration",
      image: PLACEHOLDER_IMAGE,
    },
  ],
  "Information Technology": [
    {
      name: "DR. FRANK I. ELIJORDE",
      title: "Division Chair",
      description: "Faculty in BSIT and MIT",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "DR. ENGR. LEA M. GABAWA",
      title: "GAD Coordinator",
      description: "Faculty in BSIT",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "DR. CHERYL ANN FELIPRADA",
      title: "OJT Coordinator",
      description: "Faculty in BSIT",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "MR. CHRISTIAN CADIZ",
      title: "Faculty member",
      description: "Faculty in BSIT",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "PROF. CYRENEO S. DOFITAS JR.",
      title: "Faculty member",
      description: "Faculty in BSIT",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "MS. KEILA JOY H. ARMADA",
      title: "Faculty member",
      description: "Faculty in BSIT",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "MS. ANGELICA GRACE P. SIMBRAN",
      title: "Faculty member",
      description: "Faculty in BSIT",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "MS. TRACY ANDREA MARIE MADRESTA",
      title: "Faculty member",
      description: "Faculty in BSIT",
      image: PLACEHOLDER_IMAGE,
    },
  ],
  "Information System": [
    {
      name: "DR. REGIN A. CABACAS",
      title: "Division Chair / Undergraduate Research Coordinator",
      description: "Faculty in BSIS and MIT",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "PROF. ERWIN D. OSORIO",
      title: "CICT Building Supervisor",
      description: "Faculty in BSIS",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "MR. SHEM DURST ELIJA B. SANDIG",
      title: "Extension Coordinator",
      description: "Faculty in BSIS",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "DR. NIKIE JO E. DEOCAMPO",
      title: "Faculty member",
      description: "Faculty in BSIS and MIT",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "MR. JHON ANTHONY ELECCION",
      title: "Faculty member",
      description: "Faculty in BSIS",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "MR. KEITH C. CENSORO",
      title: "Faculty member",
      description: "Faculty in BSIS",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "MR. PAOLO HILADO",
      title: "Faculty member",
      description: "Faculty in BSIS",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "MS. ROFA MAE MEDINA",
      title: "Faculty member",
      description: "Faculty in BSIS",
      image: PLACEHOLDER_IMAGE,
    },
  ],
  "Computer Science": [
    {
      name: "DR. RALPH J. VOLTAIRE DAYOT",
      title: "Division Chair / Computer Laboratory Supervisor",
      description: "Faculty in BSCS and MIT",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "DR. MA. LUCHE P. SABAYLE",
      title: "Faculty member",
      description: "Faculty in BSCS and MIT",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "DR. ARNEL N. SECONDES",
      title: "Educational Tour Coordinator",
      description: "Faculty in BSCS and MIT",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "MR. JOHN CHRISTOPHER MATEO",
      title: "Assistant Undergraduate Research Coordinator",
      description: "Faculty in BSCS and MIT",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "MS. KAREN MADOLINE CABRILLOS",
      title: "Division Chair",
      description: "Faculty in BSCS",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "MR. ORLANDO C. CABILLOS",
      title: "Faculty member",
      description: "Faculty in BSCS",
      image: PLACEHOLDER_IMAGE,
    },
  ],
  "Entertainment and Multimedia Computing (BSEMC)": [
    {
      name: "MR. MARK JOSEPH J. SOLIDARIOS",
      title: "Division Chair",
      description: "Faculty In BSEMC",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "DR. EVAN C. SUMIDO",
      title: "Faculty member",
      description: "Faculty In BSEMC And MIT",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "PROF. KAREN ALINOR J. DUMPIT",
      title: "Faculty member",
      description: "Faculty In BSEMC",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "MS. JANINE P. DEFANTE",
      title: "Faculty member",
      description: "Faculty In BSEMC",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "MS. CHRISTY G. VILLANO",
      title: "Faculty member",
      description: "Faculty In BSEMC",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "MR. LIBY NORMAN LIMOSO",
      title: "Faculty member",
      description: "Faculty In BSEMC",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "MR. PAUL NOEL DEQUITO",
      title: "Faculty member",
      description: "Faculty In BSEMC",
      image: PLACEHOLDER_IMAGE,
    },
  ],
  "Library & Information Science (BLIS)": [
    {
      name: "MR. STEPHEN B. ALAYON",
      title: "Program Coordinator / Research Coordinator",
      description: "Faculty In BLIS",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "DR. MANUELA R. LOSAÑES",
      title: "Guidance Counselor",
      description: "Faculty In BLIS",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "DR. ELRA D. M. MADALOGDOG",
      title: "Faculty member",
      description: "Faculty In BLIS",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "MR. JOSEPH M. YAP",
      title: "Faculty member",
      description: "Faculty In BLIS",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "MS. APRIL R. MANABAT",
      title: "Faculty member",
      description: "Faculty In BLIS",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "DR. ANALIZA C. ROSALES",
      title: "Faculty member",
      description: "Faculty In BLIS",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "MS. REGINA A. MALIGAD",
      title: "Faculty member",
      description: "Faculty In BLIS",
      image: PLACEHOLDER_IMAGE,
    },
  ],
  "Master of Information Technology": [
    {
      name: "MS. JOSSETH MARIE J. UMADHAY",
      title: "Graduate School Staff",
      description: "Faculty in MIT",
      image: PLACEHOLDER_IMAGE,
    },
  ],
  "Laboratory & Technical Support": [
    {
      name: "MR. FELIZARDO YGOT",
      title: "Laboratory Custodian",
      description: "Technical Support",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "MR. MIKE JOSEPH VELEZ",
      title: "Assistant Laboratory Custodian",
      description: "Technical Support",
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: "MR. ROBINSON CAPIOSO",
      title: "Assistant Laboratory Custodian",
      description: "Technical Support",
      image: PLACEHOLDER_IMAGE,
    },
  ],
};

export const departments: Department[] = [
  {
    slug: "deans-office",
    name: "Deans Office",
    side: "left",
    y: 200,
    x: 0,
    link: "/faculty-profiles/deans-office",
    logoAnchor: {
      x: 130,
      y: 200,
    },
    zoomScale: 6.0,
  },
  {
    slug: "it",
    name: "Information Technology",
    side: "left",
    y: 450,
    x: -100,
    link: "/faculty-profiles/it",
    logoAnchor: {
      x: 170,
      y: 450,
    },
    zoomScale: 6.0,
  },
  {
    slug: "is",
    name: "Information System",
    side: "left",
    y: 650,
    x: 0,
    link: "/faculty-profiles/is",
    logoAnchor: {
      x: 400,
      y: 650,
    },
    zoomScale: 6.0,
  },
  {
    slug: "mit",
    name: "Master of Information Technology",
    side: "left",
    y: 950,
    x: 90,
    link: "/faculty-profiles/mit",
    logoAnchor: {
      x: 500,
      y: 950,
    },
    zoomScale: 6.0,
  },
  {
    slug: "cs",
    name: "Computer Science",
    side: "right",
    y: 300,
    x: 1000,
    link: "/faculty-profiles/cs",
    logoAnchor: {
      x: 800,
      y: 300,
    },
    zoomScale: 6.0,
  },
  {
    slug: "lis",
    name: "Library & Information Science (BLIS)",
    side: "right",
    y: 500,
    x: 950,
    link: "/faculty-profiles/lis",
    logoAnchor: {
      x: 510,
      y: 500,
    },
    zoomScale: 6.0,
  },
  {
    slug: "emc",
    name: "Entertainment and Multimedia Computing (BSEMC)",
    side: "right",
    y: 600,
    x: 1000,
    link: "/faculty-profiles/emc",
    logoAnchor: {
      x: 660,
      y: 600,
    },
    zoomScale: 6.0,
  },
  {
    slug: "lts",
    name: "Laboratory & Technical Support",
    side: "right",
    y: 800,
    x: 1000,
    link: "/faculty-profiles/lts",
    logoAnchor: {
      x: 650,
      y: 800,
    },
    zoomScale: 6.0,
  },
];
