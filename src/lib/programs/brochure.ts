/**
 * Public program copy from docs/CICT-PSHS-Brochure-Inputs-Revised.pdf.
 * MIT is not in that brochure, so it keeps the CMS text.
 */

export type BrochureSubject = {
  code: string;
  title: string;
};

export type BrochureGroup = {
  /** Year or specialization name. */
  label: string;
  /** Short note under the label, such as "Foundations" or "3rd and 4th Year". */
  note?: string;
  subjects: BrochureSubject[];
};

export type BrochureProgram = {
  code: string;
  /** Opening line that sits above the description. */
  lead?: string;
  description: string;
  /** A fact called out under the description. */
  highlight?: string;
  groups: BrochureGroup[];
};

function group(
  label: string,
  note: string | undefined,
  subjects: [string, string][],
): BrochureGroup {
  return {
    label,
    note,
    subjects: subjects.map(([code, title]) => ({ code, title })),
  };
}

export const BROCHURE: BrochureProgram[] = [
  {
    code: "BSCS",
    description:
      "The Bachelor of Science in Computer Science (BSCS) program provides a strong foundation in computing theory, algorithmic problem-solving, and software engineering principles. Grounded in research, the curriculum prepares students to design complex software systems and specialize in high-growth fields: (1) Artificial Intelligence or (2) Data Science. Through hands-on projects and team challenges, students are trained to develop solutions to real-world problems while upholding the highest standards of ethics, security, and lifelong learning.",
    groups: [
      group("First Year", "Foundations", [
        ["CC 201", "Introduction to Computing"],
        ["CC 202", "Computer Programming 1"],
        ["CC 203", "Computer Programming 2"],
        ["CIT 201", "Discrete Structures"],
        ["CIT 205", "Human Computer Interaction"],
      ]),
      group("Second Year", "Core Competencies", [
        ["CC 204", "Data Structures and Algorithms"],
        ["CCS 222", "Web Design and Development"],
        ["CCS 224", "Algorithms and Complexity"],
        ["MTH 210", "Linear Algebra"],
        ["CIT 214", "Software Engineering 1"],
        ["CC 206", "Systems Analysis and Design"],
      ]),
      group("Third Year", "Advanced Systems and Research", [
        ["CCS 225", "Architecture and Organization"],
        ["CCS 231", "Parallel and Distributed Computing"],
        ["CCS 226", "Automata Theory and Formal Languages"],
        ["CCS 227", "Software Engineering 2"],
        ["BA 234", "Technopreneurship"],
      ]),
      group("Fourth Year", "Capstone and Industry Prep", [
        ["CCS 236", "Operating Systems"],
        ["CCS 237", "Computational Science"],
        ["CCS 238", "Programming Languages"],
        ["CCS 240", "Internship for CS (300 hours)"],
      ]),
      group("Artificial Intelligence Track", "Specialization", [
        ["CCS 246", "Introduction to Artificial Intelligence"],
        ["CCS 248", "Artificial Neural Networks"],
        ["CCS 249", "Natural Language Processing"],
        ["CCS 250", "Computer Vision"],
        ["CCS 251", "Generative AI"],
      ]),
      group("Data Science Track", "Specialization", [
        ["CCS 252", "Introduction to Data Science and Machine Learning"],
        ["CCS 253", "Programming for Data Science"],
        ["CCS 254", "Data Visualization and Communication"],
        ["CCS 255", "Big Data Technologies"],
        ["CCS 256", "Big Data Processing"],
      ]),
    ],
  },
  {
    code: "BSIT",
    description:
      "The Bachelor of Science in Information Technology (BSIT) program prepares students to become IT professionals skilled in developing, installing, operating, administering, and maintaining applications and IT infrastructure. Specialization tracks are offered: (1) Software Development Technologies, which builds mastery of core and advanced software development skills; and (2) Cybersecurity, which trains students to safeguard critical infrastructure, protect sensitive data, and counter cyberattacks. Graduates are well-positioned for careers in software development, IT security, government, finance, healthcare, and more.",
    groups: [
      group("First Year", undefined, [
        ["CC 201", "Introduction to Computing"],
        ["CC 202", "Computer Programming 1"],
        ["CC 203", "Computer Programming 2"],
        ["CIT 201", "Discrete Structures"],
        ["CIT 202", "Fundamentals of Multimedia Systems"],
        ["CIT 203", "Fundamentals of Database Systems"],
      ]),
      group("Second Year", undefined, [
        ["CC 204", "Data Structures and Algorithms"],
        ["CIT 206", "Platform Technologies"],
        ["CIT 207", "Object-Oriented Programming"],
        ["CIT 205", "Human Computer Interaction 1"],
        ["CIT 208", "Networking 1"],
        ["CIT 209", "Integrative Programming and Technologies"],
      ]),
      group("Third Year", undefined, [
        ["CC 207", "Applications Development & Emerging Technologies"],
        ["CIT 210", "Web Systems and Technologies"],
        ["CIT 212", "Networking 2"],
        ["CIT 211", "Systems Integration and Architecture"],
        ["CIT 216", "Information Assurance and Security 1"],
        ["CIT 215", "Capstone Project 1"],
      ]),
      group("Fourth Year", undefined, [
        ["CIT 219", "Capstone Project 2"],
        ["CIT 220", "Information Assurance and Security 2"],
        ["CIT 221", "Internship for IT"],
      ]),
      group(
        "Software Development Technologies",
        "Specialization, 3rd and 4th Year",
        [
          ["CIT 246", "IT Project Management"],
          ["CIT 247", "Cloud Computing and DevOps"],
          ["CIT 248", "Full-Stack Development"],
          ["CIT 249", "Microservices Architecture and Containerization"],
          ["CIT 250", "Cybersecurity for Software Development"],
        ],
      ),
      group("Cybersecurity", "Specialization, 3rd and 4th Year", [
        ["CIT 251", "Security Compliance and Governance"],
        ["CIT 252", "Cloud Infrastructure and Security"],
        ["CIT 253", "IoT and Edge Security"],
        ["CIT 254", "Penetration Testing and Ethical Hacking"],
        ["CIT 255", "Incident Response and Digital Forensics"],
      ]),
    ],
  },
  {
    code: "BSIS",
    description:
      "The Bachelor of Science in Information Systems (BSIS) program combines information technology with business and organizational knowledge, preparing students to develop practical digital solutions that improve an organization's efficiency, productivity, and performance. Specialization tracks are offered to deepen skills for diverse careers: (1) Business Analytics, where students gain hands-on experience in data preparation, processing, modeling, and analysis to support informed decision-making; and (2) Business Application Development, where students learn to analyze business processes and design, develop, and implement software applications.",
    groups: [
      group("First Year", undefined, [
        ["CC 201", "Introduction to Computing"],
        ["CC 202", "Computer Programming 1"],
        ["CC 203", "Computer Programming 2"],
        ["BA 236", "Organization and Management Concepts"],
        ["CIS 201", "Fundamentals of Information Systems"],
        ["CIS 202", "Web Development"],
      ]),
      group("Second Year", undefined, [
        ["CIS 216", "Business Intelligence"],
        ["CC 204", "Data Structures and Algorithms"],
        ["CIS 203", "IT Infrastructure and Network Technologies"],
        ["CC 205", "Information Management"],
        ["CC 206", "Applications Development & Emerging Technologies"],
        ["CIT 205", "Human Computer Interaction"],
      ]),
      group("Third Year", undefined, [
        ["CC 207", "Systems Analysis and Design"],
        ["CIS 206", "Business Process Management"],
        ["CIS 230", "IT Security and Management"],
        ["CIS 205", "IS Project Management 1"],
        ["CIS 215", "IS Innovations and New Technologies"],
        ["CIS 211", "Thesis Writing for IS 1"],
      ]),
      group("Fourth Year", undefined, [
        ["CIS 204", "Enterprise Architecture"],
        ["CIS 210", "Enterprise Systems"],
        ["CIS 212", "Thesis Writing for IS 2"],
        ["CIS 214", "Internship for Information Systems"],
      ]),
      group("Business Analytics", "Specialization, 3rd and 4th Year", [
        ["CIS 217", "Fundamentals of Business Analytics"],
        ["CIS 218", "Fundamentals of Enterprise Data Management"],
        ["CIS 219", "Fundamentals of Analytics Modeling"],
        ["CIS 220", "Analytics Techniques & Tools"],
      ]),
      group(
        "Business Application Development",
        "Specialization, 3rd and 4th Year",
        [
          ["CIS 226", "Programming for E-Business Applications"],
          [
            "CIS 228",
            "Mobile Application Development for Business Integration",
          ],
          ["CIS 231", "Cloud Applications Development"],
          ["CIS 232", "Systems Testing and Quality Assurance"],
        ],
      ),
    ],
  },
  {
    code: "BSEMC",
    description:
      "The Bachelor of Science in Entertainment and Multimedia Computing (BSEMC) blends computing with creativity. You will learn programming, drawing, storyboarding, 2D and 3D animation, sound design, and game development, then specialize in one of two tracks: (1) Game Development or (2) Digital Animation Technology. Through studio-style projects, a capstone, and an industry internship, you will build a portfolio for careers as a game developer, animator, 3D artist, or multimedia designer.",
    groups: [
      group("First Year", undefined, [
        ["CC 201", "Introduction to Computing"],
        ["CC 202", "Computer Programming 1"],
        ["CC 203", "Computer Programming 2"],
        ["EMC 201", "Freehand and Digital Drawing"],
        ["EMC 202", "Intro to Game Design and Development"],
        ["EMC 203", "Script Writing and Storyboard Design"],
      ]),
      group("Second Year", undefined, [
        ["EMC 204", "Usability, HCI, and UI Design"],
        ["EMC 205", "Principles of 2D Animation"],
        ["EMC 210", "Concept Art and Design"],
        ["EMC 206", "Audio Design and Sound Engineering"],
        ["EMC 207", "Computer Graphics Programming"],
        ["EMC 208", "Design and Production Process"],
      ]),
      group("Third Year", undefined, [
        ["EMC 209", "Principles of 3D Animation"],
        ["CC 206", "Applications Development & Emerging Technologies"],
        ["CC 208", "Methods of Research in Computing"],
        ["EMC 212", "Multimedia Portfolio and Branding"],
        ["EMC 214", "Game Analysis and Design"],
        ["EMC 218", "Stop Motion Animation"],
      ]),
      group("Fourth Year", undefined, [
        ["EMC 213", "Thesis Writing in EMC/Capstone Project (Residency)"],
        ["CC 209", "Seminars and Field Study"],
        ["EMC 215", "Internship for EMC"],
        ["EMC 224", "AR and VR Programming"],
      ]),
      group("Game Development", "Specialization, 2nd to 4th Year", [
        ["GD 301", "Game Programming I"],
        ["GD 303", "Applied Mathematics for Games"],
        ["GD 306", "Artificial Intelligence (AI) in Games"],
        ["GD 308", "Game Networking"],
        ["GD 309", "Game Production"],
      ]),
      group("Digital Animation Technology", "Specialization, 2nd to 4th Year", [
        ["DA 302", "Modelling and Rigging"],
        ["DA 303", "Lighting and Effects"],
        ["DA 306", "Advanced 3D Animation and Scripting"],
        ["DA 308", "Compositing and Rendering"],
        ["DA 309", "Animation Design and Production"],
      ]),
    ],
  },
  {
    code: "BLIS",
    lead: "Step into the future of information with the BLIS!",
    description:
      "The program blends IT innovation with data and content curation, information literacy, and cultural heritage. Students master organization, automation, digital web solutions, modern research tools, and the responsible use of AI and emerging technologies. You will learn to preserve cultural artifacts, combat fake news, manage physical and electronic resources, and make research easy. Become a tech-savvy information specialist equipped to analyze and solve complex problems, lead information institutions and knowledge-based organizations, and shape the future of digital access and retrieval.",
    highlight:
      "Program highlight: WVSU is the Top 1 performing school in the Librarians Computer-based Licensure Exam (LCBLE) for 2024 and 2026 and has produced 3 topnotchers since the 2023 board exam.",
    groups: [
      group("First Year", undefined, [
        ["LIS 201", "Introduction to Library and Information Science"],
        ["IT 202", "Programming Fundamentals"],
        ["LIS 203", "Organization of Information Resources 1"],
        ["LIS 205", "Indexing and Abstracting"],
        [
          "LIS 206 (IT1)",
          "Information Processing and Handling in Libraries and Information Centers",
        ],
      ]),
      group("Second Year", undefined, [
        ["LIS 204", "Introduction to Records Management and Archives"],
        [
          "LIS 209 (IT2)",
          "Web Technologies in Libraries and Information Centers",
        ],
        [
          "LIS 211",
          "System Analysis and Design in Libraries and Information Centers",
        ],
        ["LIS 213", "Database Design for Libraries"],
        ["LIS 230", "Digital Libraries and Resources"],
      ]),
      group("Third Year", undefined, [
        [
          "LIS 214",
          "Research Methods and Evaluation in Library and Information Science",
        ],
        ["LIS 215", "Indigenous Knowledge and Multiculturalism"],
        ["LIS 226", "Preservation of Information Resources"],
        ["LIS 229", "Information Literacy"],
        ["LIS 223", "Foreign Language"],
        ["LIS 218", "Thesis Writing in LIS"],
      ]),
      group("Fourth Year", undefined, [
        ["LIS 220", "Integration Course (Intensive Review I)"],
        ["LIS 221", "Internship / Library Practice I (In-Campus)"],
        ["LIS 232", "Research Colloquium"],
        ["LIS 222", "Internship / Library Practice II (Off-Campus)"],
      ]),
    ],
  },
];

export function brochureFor(code: string) {
  const key = code.trim().toLowerCase();
  return BROCHURE.find((program) => program.code.toLowerCase() === key);
}
