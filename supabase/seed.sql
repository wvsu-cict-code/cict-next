-- Seed content migrated from the previous hardcoded site data.
-- Runs automatically on `supabase db reset` (local only).

insert into public.programs (id, code, name, logo_url, description, objectives, duration, semesters, curriculum_pdf_url, sort_order) values
  ('blis', 'BLIS', 'Bachelor of Library and Information Science', '/program_assets/blis.svg', 'The program blends IT innovation with data and content curation, information literacy, and cultural heritage. Students master organization, automation, digital web solutions, modern research tools, and the responsible use of AI and emerging technologies. You will learn to preserve cultural artifacts, combat fake news, manage physical and electronic resources, and make research easy. Become a tech-savvy information specialist equipped to analyze and solve complex problems, lead information institutions and knowledge-based organizations, and shape the future of digital access and retrieval.', 'The Bachelor of Library and Information Science (BLIS) Program aims to prepare students for their unique role in gathering, organizing, curating, managing, and providing access to the best information sources for the knowledge-based organization they belong to, as well as implementing standards for the ethical and appropriate use of information.', '4 years', '2 semesters per year', '/assets/curriculum/bscs-curriculum.pdf', 0),
  ('bscs', 'BSCS', 'Bachelor of Science in Computer Science', '/program_assets/bscs.svg', 'The Bachelor of Science in Computer Science (BSCS) program provides a strong foundation in computing theory, algorithmic problem-solving, and software engineering principles. Grounded in research, the curriculum prepares students to design complex software systems and specialize in high-growth fields: (1) Artificial Intelligence or (2) Data Science. Through hands-on projects and team challenges, students are trained to develop solutions to real-world problems while upholding the highest standards of ethics, security, and lifelong learning.', 'The BSCS graduates are expected to become globally competent, innovative and socially and ethnically responsible computing professionals engaged in life-learning endeavors. They are capable of contributing to the country''s national development goals.', '4 years', '2 semesters per year', '/assets/curriculum/bscs-curriculum.pdf', 1),
  ('bsemc', 'BSEMC', 'Bachelor of Science in Entertainment and Media Computing', '/program_assets/bsemc.svg', 'The Bachelor of Science in Entertainment and Multimedia Computing (BSEMC) blends computing with creativity. You will learn programming, drawing, storyboarding, 2D and 3D animation, sound design, and game development, then specialize in one of two tracks: (1) Game Development or (2) Digital Animation Technology. Through studio-style projects, a capstone, and an industry internship, you will build a portfolio for careers as a game developer, animator, 3D artist, or multimedia designer.', 'The BSEMC program is designed to prepare students to become professionals in the fields of Game Development and Digital Animation Technology. Specifically, the Game Development track equips students with specialized knowledge, competencies, and values for designing, developing, and producing digital games and tools, as well as managing development projects.

 Complementing this, the Digital Animation Technology component ensures students are armed with the creative and technical skills necessary to conceptualize, design, and produce animation solutions, enabling them to effectively manage projects across various technology platforms.', '4 years', '2 semesters per year', '/assets/curriculum/bscs-curriculum.pdf', 2),
  ('bsis', 'BSIS', 'Bachelor of Science in Information Systems', '/program_assets/bsis.svg', 'The Bachelor of Science in Information Systems (BSIS) program combines information technology with business and organizational knowledge, preparing students to develop practical digital solutions that improve an organization''s efficiency, productivity, and performance. Specialization tracks are offered to deepen skills for diverse careers: (1) Business Analytics, where students gain hands-on experience in data preparation, processing, modeling, and analysis to support informed decision-making; and (2) Business Application Development, where students learn to analyze business processes and design, develop, and implement software applications.', 'Provide students with comprehensive Information systems education, equipping them with the knowledge, skills, and ethical values necessary to analyze, design, implement, and manage information technology solutions in diverse organizational contexts, preparing them for successful and socially responsible careers in the field of Information Systems.', '4 years', '2 semesters per year', '/assets/curriculum/bscs-curriculum.pdf', 3),
  ('bsit', 'BSIT', 'Bachelor of Science in Information Technology', '/program_assets/bsit.svg', 'The Bachelor of Science in Information Technology (BSIT) program prepares students to become IT professionals skilled in developing, installing, operating, administering, and maintaining applications and IT infrastructure. Specialization tracks are offered: (1) Software Development Technologies, which builds mastery of core and advanced software development skills; and (2) Cybersecurity, which trains students to safeguard critical infrastructure, protect sensitive data, and counter cyberattacks. Graduates are well-positioned for careers in software development, IT security, government, finance, healthcare, and more.', 'The program aims to produce competent graduates with sufficient exposure to the real-world environment through on-the-job training and educational trips. It prepares students with a broad liberal education in the arts, communications, social sciences, and philosophy , while equipping them with broad and specific research capabilities applicable to their chosen area of specialization.

 Furthermore, the curriculum develops an understanding of professional, ethical, legal, security, and social responsibilities. Ultimately, the program engages students in research, extension, and development, enabling them to innovate, invent, and develop ICT processes and products that help elevate human lives.', '4 years', '2 semesters per year', '/assets/curriculum/bscs-curriculum.pdf', 4),
  ('mit', 'MIT', 'Master in Information Technology', '/program_assets/mit.svg', 'The Master in Information Technology (MIT) program gives students the opportunity to deepen their IT knowledge and allow them to study new and emerging areas of advanced information technology (IT). This program provides a comprehensive postgraduate education in information technology directed at IT educators, IT professionals and recent graduates seeking to update their knowledge.', 'Graduates are expected to apply advanced knowledge of information technology principles and practices to evaluate existing IT solutions, as well as to innovate or create new ones tailored to organizational needs. They are capable of identifying, planning, analyzing, designing, and implementing solutions to address complex IT-related problems , utilizing research and correct systems analysis principles to develop stable, secure, scalable, and maintainable IT products.

 Additionally, they recommend appropriate solutions while assuring system confidentiality, integrity, and availability , and manage the use and maintenance of these solutions according to globally accepted standards and practices. Beyond technical application, they utilize their advanced knowledge to provide expertise in both industry and academic settings, mentoring IT professionals for continued career growth and life-long learning.', '4 years', '2 semesters per year', '/assets/curriculum/bscs-curriculum.pdf', 5);

insert into public.departments (slug, name, side, x, y, logo_anchor_x, logo_anchor_y, zoom_scale, sort_order) values
  ('deans-office', 'Deans Office', 'left', 0, 200, 130, 200, 6, 0),
  ('it', 'Information Technology', 'left', -100, 450, 170, 450, 6, 1),
  ('is', 'Information System', 'left', 0, 650, 400, 650, 6, 2),
  ('mit', 'Master of Information Technology', 'left', 90, 950, 500, 950, 6, 3),
  ('cs', 'Computer Science', 'right', 1000, 300, 800, 300, 6, 4),
  ('lis', 'Library & Information Science (BLIS)', 'right', 950, 500, 510, 500, 6, 5),
  ('emc', 'Entertainment and Multimedia Computing (BSEMC)', 'right', 1000, 600, 660, 600, 6, 6),
  ('lts', 'Laboratory & Technical Support', 'right', 1000, 800, 650, 800, 6, 7);

insert into public.faculty_members (department_slug, name, title, description, image_url, sort_order) values
  ('deans-office', 'DR. MA. BETH S. CONCEPCION', 'College Dean', 'Faculty in BSIS and MIT', null, 0),
  ('deans-office', 'MR. NEILJAN C. RABORAR', 'College Secretary / Quality Assurance Focal Person', 'Faculty in BSIS', null, 1),
  ('deans-office', 'MS. AUBREY V. BALAJADIA', 'Admin Aide Clerk', 'Office Administration', null, 2),
  ('it', 'DR. FRANK I. ELIJORDE', 'Division Chair', 'Faculty in BSIT and MIT', null, 0),
  ('it', 'DR. ENGR. LEA M. GABAWA', 'GAD Coordinator', 'Faculty in BSIT', null, 1),
  ('it', 'DR. CHERYL ANN FELIPRADA', 'OJT Coordinator', 'Faculty in BSIT', null, 2),
  ('it', 'MR. CHRISTIAN CADIZ', 'Faculty member', 'Faculty in BSIT', null, 3),
  ('it', 'PROF. CYRENEO S. DOFITAS JR.', 'Faculty member', 'Faculty in BSIT', null, 4),
  ('it', 'MS. KEILA JOY H. ARMADA', 'Faculty member', 'Faculty in BSIT', null, 5),
  ('it', 'MS. ANGELICA GRACE P. SIMBRAN', 'Faculty member', 'Faculty in BSIT', null, 6),
  ('it', 'MS. TRACY ANDREA MARIE MADRESTA', 'Faculty member', 'Faculty in BSIT', null, 7),
  ('is', 'DR. REGIN A. CABACAS', 'Division Chair / Undergraduate Research Coordinator', 'Faculty in BSIS and MIT', null, 0),
  ('is', 'PROF. ERWIN D. OSORIO', 'CICT Building Supervisor', 'Faculty in BSIS', null, 1),
  ('is', 'MR. SHEM DURST ELIJA B. SANDIG', 'Extension Coordinator', 'Faculty in BSIS', null, 2),
  ('is', 'DR. NIKIE JO E. DEOCAMPO', 'Faculty member', 'Faculty in BSIS and MIT', null, 3),
  ('is', 'MR. JHON ANTHONY ELECCION', 'Faculty member', 'Faculty in BSIS', null, 4),
  ('is', 'MR. KEITH C. CENSORO', 'Faculty member', 'Faculty in BSIS', null, 5),
  ('is', 'MR. PAOLO HILADO', 'Faculty member', 'Faculty in BSIS', null, 6),
  ('is', 'MS. ROFA MAE MEDINA', 'Faculty member', 'Faculty in BSIS', null, 7),
  ('mit', 'MS. JOSSETH MARIE J. UMADHAY', 'Graduate School Staff', 'Faculty in MIT', null, 0),
  ('cs', 'DR. RALPH J. VOLTAIRE DAYOT', 'Division Chair / Computer Laboratory Supervisor', 'Faculty in BSCS and MIT', null, 0),
  ('cs', 'DR. MA. LUCHE P. SABAYLE', 'Faculty member', 'Faculty in BSCS and MIT', null, 1),
  ('cs', 'DR. ARNEL N. SECONDES', 'Educational Tour Coordinator', 'Faculty in BSCS and MIT', null, 2),
  ('cs', 'MR. JOHN CHRISTOPHER MATEO', 'Assistant Undergraduate Research Coordinator', 'Faculty in BSCS and MIT', null, 3),
  ('cs', 'MS. KAREN MADOLINE CABRILLOS', 'Division Chair', 'Faculty in BSCS', null, 4),
  ('cs', 'MR. ORLANDO C. CABILLOS', 'Faculty member', 'Faculty in BSCS', null, 5),
  ('lis', 'MR. STEPHEN B. ALAYON', 'Program Coordinator / Research Coordinator', 'Faculty In BLIS', null, 0),
  ('lis', 'DR. MANUELA R. LOSAÑES', 'Guidance Counselor', 'Faculty In BLIS', null, 1),
  ('lis', 'DR. ELRA D. M. MADALOGDOG', 'Faculty member', 'Faculty In BLIS', null, 2),
  ('lis', 'MR. JOSEPH M. YAP', 'Faculty member', 'Faculty In BLIS', null, 3),
  ('lis', 'MS. APRIL R. MANABAT', 'Faculty member', 'Faculty In BLIS', null, 4),
  ('lis', 'DR. ANALIZA C. ROSALES', 'Faculty member', 'Faculty In BLIS', null, 5),
  ('lis', 'MS. REGINA A. MALIGAD', 'Faculty member', 'Faculty In BLIS', null, 6),
  ('emc', 'MR. MARK JOSEPH J. SOLIDARIOS', 'Division Chair', 'Faculty In BSEMC', null, 0),
  ('emc', 'DR. EVAN C. SUMIDO', 'Faculty member', 'Faculty In BSEMC And MIT', null, 1),
  ('emc', 'PROF. KAREN ALINOR J. DUMPIT', 'Faculty member', 'Faculty In BSEMC', null, 2),
  ('emc', 'MS. JANINE P. DEFANTE', 'Faculty member', 'Faculty In BSEMC', null, 3),
  ('emc', 'MS. CHRISTY G. VILLANO', 'Faculty member', 'Faculty In BSEMC', null, 4),
  ('emc', 'MR. LIBY NORMAN LIMOSO', 'Faculty member', 'Faculty In BSEMC', null, 5),
  ('emc', 'MR. PAUL NOEL DEQUITO', 'Faculty member', 'Faculty In BSEMC', null, 6),
  ('lts', 'MR. FELIZARDO YGOT', 'Laboratory Custodian', 'Technical Support', null, 0),
  ('lts', 'MR. MIKE JOSEPH VELEZ', 'Assistant Laboratory Custodian', 'Technical Support', null, 1),
  ('lts', 'MR. ROBINSON CAPIOSO', 'Assistant Laboratory Custodian', 'Technical Support', null, 2);
-- Sample posts (placeholder content carried over from the old mock data)
insert into public.posts (slug, title, excerpt, body, category, status, is_featured, published_at) values
  ('wvsu-cict-presents-tech-solutions-at-icc-2025-in-taiwan',
   'WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan',
   'WVSU-CICT showcased innovative tech solutions at the ICC 2025 in Taiwan, highlighting student projects and faculty research.',
   'Full content for ICC 2025 news goes here...',
   'news', 'published', true, '2026-02-01 08:00:00+08'),
  ('cict-faculty-publishes-ai-research-paper',
   'CICT Faculty Publishes AI Research Paper',
   'CICT faculty member Dr. Reyes published a groundbreaking research paper on AI applications in education, receiving international acclaim.',
   'Full content for AI research news goes here...',
   'news', 'published', false, '2026-02-02 08:00:00+08'),
  ('new-student-projects-showcase-2026',
   'New Student Projects Showcase 2026',
   'WVSU-CICT will host the annual Student Projects Showcase on March 15, featuring innovative projects from students across all levels.',
   'Full content for student projects news goes here...',
   'announcement', 'published', false, '2026-02-03 08:00:00+08'),
  ('upcoming-technology-workshops-at-wvsu',
   'Upcoming Technology Workshops at WVSU',
   'WVSU-CICT is launching a new scholarship program for underprivileged students pursuing degrees in computer science and information technology.',
   'Full content for technology workshops news goes here...',
   'announcement', 'published', false, '2026-02-04 08:00:00+08');
