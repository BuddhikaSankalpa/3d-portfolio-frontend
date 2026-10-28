# CV source notes — review before drafting

This is a factual inventory from the current portfolio source and the existing one-page PDF. It is **not** a finished CV. “Site” means the text and links in index.html; “PDF” means public/MY_CV.pdf. A technology in the general skills list is **not** assigned to a particular project unless that project's card says so. Repository names and demo URLs have not been used to infer implementations or results.

## 1. Identity, contact, and online profiles

| Item | Recorded fact | Source |
| --- | --- | --- |
| Name on site | **W. A Buddhika Sankalpa** | index.html, About section, line 82; Contact section, line 518 |
| Name on PDF | **Buddhika Sankalpa** (without initials) | public/MY_CV.pdf, p. 1, heading |
| Email | buddhikasankalpa304@gmail.com | index.html, Contact section, lines 519–524; public/MY_CV.pdf, p. 1, Contact |
| Phone | Site display: **071 730 9230**; site telephone link: **+94717309230**. PDF display: **071-730-9230**. | index.html, Contact section, lines 521–522; public/MY_CV.pdf, p. 1, Contact |
| WhatsApp | https://wa.me/94717309230 | index.html, Contact section, line 525 |
| Location/address stated | **113/5B/15, Pitipana North, Homagama**. This appears in the PDF only; the site does not state a location. Decide whether a professional CV should show the full street address or just a confirmed locality. | public/MY_CV.pdf, p. 1, Contact; index.html, Contact section, lines 507–543 |
| GitHub | https://github.com/BuddhikaSankalpa | index.html, Contact section, line 531; scene social links, line 595 |
| LinkedIn | https://linkedin.com/in/buddhika-sankalpa-542a04311 | index.html, Contact section, line 536; scene social links, line 595 |
| Public portfolio URL | **Not stated** in the site source or PDF. The project has a local development address, but that is not a confirmed public portfolio URL. | index.html, head and Contact section, lines 1–7 and 507–595; public/MY_CV.pdf, p. 1 |

The site describes its owner as an Electronics & Computer Science student who builds full-stack web applications and explores electronics, embedded systems, and AI. It describes IoT, DevOps, MLOps, and cybersecurity as career interests or directions, not completed roles or proven specializations. Source: index.html, About section, lines 82 and 89–109.

## 2. Education

| Institution/program | Stated details | Source |
| --- | --- | --- |
| **University of Kelaniya — Electronics & Computer Science** | Current student; **expected graduation: 2028** (“Class of 2028 · Expected”). The site does not give an exact degree title, start date, GPA, or classification. The PDF calls this “Electronics and Computer Science undergraduate” but gives no graduation year. | index.html, About section, lines 82 and 99–104; Skills & Education section, lines 179–188; public/MY_CV.pdf, p. 1, profile |
| **Dharmapala College, Pannipitiya** | Site: **O/L: 9 A passes, 1 C pass**; **A/L: 3 B passes**. PDF names the school **Pannipitiya Dharmapala College** and states **GCE A/L (PHYSICAL SCIENCE)** with **Combine Maths - B**, **Physics - B**, **Chemistry - B**. The school-name forms and A/L summaries appear consistent; neither source gives dates. | index.html, Skills & Education section, lines 189–195; public/MY_CV.pdf, p. 1, Education → School |
| **ICET — diploma in ICT** | The PDF lists “ICET” and “diploma in ICT,” followed by **microsoft office (Business application)**, **Web Development**, **python programming**, and **Computerized Accounting**. Completion date, exact awarding institution name, and credential evidence are not stated. This item is absent from the website. | public/MY_CV.pdf, p. 1, Education → ICET |

## 3. Technical skills and interests

These are **listed skills or tools**, without proficiency levels. The site presents them as “technologies I work with.” The PDF adds some older or more specific wording. Grouping below is for CV planning; it does not prove each skill was used in a particular project.

| Group | Explicitly listed on the site | Additional wording in the PDF | Source |
| --- | --- | --- | --- |
| Programming languages | Java, C, JavaScript, TypeScript, Python, PHP | Programming: C, Python, Java | index.html, Skills & Education → Programming & foundations, lines 121–135; public/MY_CV.pdf, p. 1, skills |
| Frontend and web | HTML, CSS, React, Next.js, Three.js | Web Development Basics (HTML, CSS, JavaScript) | index.html, Skills & Education → Programming & foundations and Web & cloud, lines 121–150; public/MY_CV.pdf, p. 1, skills |
| Backend/platform | Node.js, Express, Supabase | Web Development is listed under the ICET diploma, without a stack | index.html, Skills & Education → Web & cloud, lines 136–150; public/MY_CV.pdf, p. 1, Education → ICET |
| Databases | MongoDB, PostgreSQL, MySQL | None named | index.html, Skills & Education → Web & cloud, lines 136–150; public/MY_CV.pdf, p. 1, skills |
| Cloud/DevOps | AWS is listed; specific DevOps tools or completed DevOps work are not stated | No additional named cloud service | index.html, Skills & Education → Web & cloud, lines 136–150, and About, lines 105–109; public/MY_CV.pdf, p. 1, skills |
| IoT, electronics, and simulation | Proteus | Electronics & Circuit Design; “MATLAB & Simulation Tools(tinkercad)” as printed | index.html, Skills & Education → Tools & intelligent systems, lines 152–163; public/MY_CV.pdf, p. 1, skills |
| ML and AI | TensorFlow | Machine Learning & AI (basic concepts & applications) | index.html, Skills & Education → Tools & intelligent systems, lines 152–163; public/MY_CV.pdf, p. 1, skills |
| Design and media | Figma, Premiere Pro, After Effects, CapCut, Canva | Figma (UI/UX Design); Video Editing (adobe premiere pro) | index.html, Skills & Education → Tools & intelligent systems and Creative tools, lines 152–173; public/MY_CV.pdf, p. 1, skills |
| Tools | Git, GitHub, Kali Linux | “microsoft office (Business application)” is listed under ICET | index.html, Skills & Education → Tools & intelligent systems, lines 152–163; public/MY_CV.pdf, p. 1, Education → ICET |

The portfolio repository itself directly uses **Vite**, **Three.js/three**, and **GSAP**. Those are implementation evidence for **this portfolio only**, not evidence that any of the five linked projects use them. Source: package.json, scripts and dependencies; src/main.js, imports and 3D scene setup, lines 1–20. The site also lists Three.js as a skill (index.html, Skills & Education, line 146).

**Interests and learning directions, separate from skills/experience:** the About section says “Exploring IoT, DevOps, MLOps & Cybersecurity” and describes working toward roles involving devices, reliable systems, deployed machine learning, and security. The Contact section offers Full-Stack Web Apps, IoT & Embedded Systems, Machine Learning Prototypes, UI/UX Design, and Cloud & AWS Projects; those labels do not establish completed client work. Source: index.html, About section, lines 92 and 105–109; Contact section, lines 544–553.

## 4. Projects

The current source contains **five** project cards in the Projects & Experience section. Each has a separate live, frontend, and backend link. No card states project dates, team size, personal contribution, measurable results, or a named technology stack. Source: index.html, Projects & Experience section, lines 199–332.

### 01. NEVERMORE Boarding

- **Category:** Boarding & property management.
- **Description:** A modern platform for boarding and property management.
- **Technologies:** Not specified for this project in the site or PDF.
- **Live:** https://rentpay-web-frontend.vercel.app/
- **Frontend repository:** https://github.com/BuddhikaSankalpa/rentpay-web-frontend
- **Backend repository:** https://github.com/BuddhikaSankalpa/rentpay-web-backend
- **Stated outcome:** No measured outcome or adoption figure stated.
- **Source:** index.html, Projects & Experience → Project 01 card, lines 208–231.

### 02. I-Computers

- **Category:** E-commerce platform.
- **Description:** A full-stack e-commerce platform bringing the shopping experience online.
- **Technologies:** No named technology is specified for this project in the site or PDF; “full-stack” is the site's description.
- **Live:** https://i-computers-frontend-five.vercel.app/
- **Frontend repository:** https://github.com/BuddhikaSankalpa/i-computers-frontend
- **Backend repository:** https://github.com/BuddhikaSankalpa/i-computers-backend
- **Stated outcome:** No measured outcome, sales figure, or user count stated.
- **Source:** index.html, Projects & Experience → Project 02 card, lines 233–256.

### 03. E-learning Platform

- **Category:** Online learning.
- **Description:** A full-stack e-learning platform built for digital education.
- **Technologies:** No named technology is specified for this project in the site or PDF; “full-stack” is the site's description.
- **Live:** https://learnbridge-edulk.vercel.app/
- **Frontend repository:** https://github.com/BuddhikaSankalpa/E-learnign-Frontend
- **Backend repository:** https://github.com/BuddhikaSankalpa/E-learnign-backend
- **Stated outcome:** No measured outcome, learner count, or course count stated.
- **Source:** index.html, Projects & Experience → Project 03 card, lines 259–282.

### 04. Security System for a Security Service Providing Company

- **Category:** Security Management System.
- **Description:** A web-based system developed for a security service providing company.
- **Technologies:** Not specified for this project in the site or PDF.
- **Live:** https://nexgard-pi.vercel.app
- **Frontend repository:** https://github.com/BuddhikaSankalpa/wedding-website-frontend
- **Backend repository:** https://github.com/BuddhikaSankalpa/security-system-backend
- **Stated outcome:** No measured outcome or deployment/customer details stated. The frontend repository name does not match the project theme; retain the source URL pending confirmation.
- **Source:** index.html, Projects & Experience → Project 04 card, lines 284–306. The live URL above is the **current file value**, without an /admin suffix.

### 05. Movie & TV Series Recommendation System

- **Category:** Recommendation System.
- **Description:** A platform for discovering movie and TV series suggestions.
- **Technologies:** Not specified for this project in the site or PDF. The title alone does not establish an ML algorithm.
- **Live:** https://frame-umber-one.vercel.app/
- **Frontend repository:** https://github.com/BuddhikaSankalpa/recommender-frontend
- **Backend repository:** https://github.com/BuddhikaSankalpa/recommender-backend
- **Stated outcome:** No measured outcome, recommendation method, or user count stated.
- **Source:** index.html, Projects & Experience → Project 05 card, lines 308–330.

**Additional-project check:** No other named, detailed project card appears in the site source or PDF. “Machine Learning Experiments” and “IoT Research” are broad learning-activity cards with no specific project title, date, repository, or result; they are recorded below as activities. The Contact service labels are areas of work, not additional finished projects. Source: index.html, Certifications → Learning in practice, lines 479–505; Contact section, lines 544–553; public/MY_CV.pdf, p. 1.

## 5. Leadership, event work, and recognition

| Organization/event | Role or recognition | Year/date stated | Description and website | Source |
| --- | --- | --- | --- | --- |
| **Electronics and Computer Science Club** | **Public Relations Coordinator**; **Technical Coordinator** | Not stated | Site describes leadership, communication, and technical coordination through club activities. Website: https://ecsc-uok.com/ | index.html, Projects & Experience → Leadership & experience, lines 338–351 |
| **Electronics and Computer Science Club** | **Designing Team Member** | Not stated | No specific duties or outcomes stated. Organization website is linked on the other club card: https://ecsc-uok.com/ | index.html, Projects & Experience → Leadership & experience, lines 398–409; organization link at line 350 |
| **UOK Robot Battle** | **Co-Technical Coordinator** | **2024** | No specific duties or outcomes stated. Website: https://robotgames.ecsc-uok.com/ | index.html, Projects & Experience → Leadership & experience, lines 353–366 |
| **UOK Robot Battle** | **Technical Coordinator** | **2025** | No specific duties or outcomes stated. Website: https://robotgames.ecsc-uok.com/ | index.html, Projects & Experience → Leadership & experience, lines 353–366 |
| **MEDUSA 2026** | **Video Editing Head** | **2025** | No specific duties or outcomes stated. Website: https://medusa.ecsc-uok.com/ | index.html, Projects & Experience → Leadership & experience, lines 368–381 |
| **MEDUSA 2026** | **Technical Coordinator** | **2026** | No specific duties or outcomes stated. Website: https://medusa.ecsc-uok.com/ | index.html, Projects & Experience → Leadership & experience, lines 368–381 |
| **AWS Student Community Day Sri Lanka 2026** | **Head of Event & Logistics**; recognition: **Outstanding Contribution** | Event name states **2026**; exact role and recognition dates not given | No specific duties, scale, or awarding body stated. Website: https://www.awsug.lk/ | index.html, Projects & Experience → Leadership & experience, lines 383–396 |

**Academic achievement also stated:** O/L 9 A passes and 1 C pass; A/L 3 B passes, with subject grades in the PDF as recorded in Education above. Source: index.html, Skills & Education, lines 189–195; public/MY_CV.pdf, p. 1, Education → School.

## 6. Certifications, courses, and learning activities

### Earned credentials that can be asserted now

The site does **not** name any earned certificate, issuer, date, credential ID, or verification link. Its “Certifications” page labels every card **Learning area** and says certificate titles, issuers, and credential links will be added when available. The PDF lists courses and an ICT diploma, but does not state course completion dates or certificate/verification credentials. Therefore, do **not** turn the learning-area cards or course list into earned certifications without confirmation. Source: index.html, Certifications section, lines 413–478; public/MY_CV.pdf, p. 1, Education → ICET and Courses.

### Learning areas on the site — not certifications

Every card below is labeled “Learning area,” not an earned certificate:

| Learning area | Source |
| --- | --- |
| **DevOps & MLOps** | index.html, Certifications, lines 421–428 |
| **Cloud & AWS** | index.html, Certifications, lines 430–437 |
| **Web Development** | index.html, Certifications, lines 439–446 |
| **Machine Learning** | index.html, Certifications, lines 448–455 |
| **Cybersecurity** | index.html, Certifications, lines 457–464 |
| **Figma** | index.html, Certifications, lines 466–473 |

### Learning in practice on the site

| Activity | Site description | Source |
| --- | --- | --- |
| **Cloud Labs** | Exploring AWS services and cloud infrastructure through hands-on practice. | index.html, Certifications → Learning in practice, lines 483–488 |
| **Machine Learning Experiments** | Building and testing machine learning ideas through practical projects. | index.html, Certifications → Learning in practice, lines 490–494 |
| **IoT Research** | Exploring connected devices, embedded systems, and sensor-based projects. | index.html, Certifications → Learning in practice, lines 495–499 |
| **Cybersecurity Practice** | Learning security fundamentals and applying them through hands-on exercises. | index.html, Certifications → Learning in practice, lines 500–504 |

### Courses listed in the existing PDF — completion and certificates unverified

The names and issuer spellings below follow the PDF. The three Coursera URLs are hyperlinks embedded on course titles, **not credential or verification URLs**.

| PDF course entry | Course-page link present in PDF | Source |
| --- | --- | --- |
| **AI/ML Engineer (Stage 1 and 2) - SLIT university** | None shown; verify the printed institution spelling and completion status | public/MY_CV.pdf, p. 1, Courses |
| **Introduction to Artificial Intelligence (AI) - IBM** | https://www.coursera.org/learn/introduction-to-ai/home/welcome | public/MY_CV.pdf, p. 1, Courses |
| **Supervised Machine Learning: Regression and Classification- DeepLearning.AI** | https://www.coursera.org/learn/machine-learning | public/MY_CV.pdf, p. 1, Courses |
| **Advanced Learning Algorithms- DeepLearning.AI** | https://www.coursera.org/learn/advanced-learning-algorithms | public/MY_CV.pdf, p. 1, Courses |
| **Foundations of User Experience (UX) Design - Google** | None shown | public/MY_CV.pdf, p. 1, Courses |
| **PSD academy-Video Editing Course(Adobe Premiere Pro)** | None shown | public/MY_CV.pdf, p. 1, Courses |

## 7. Source differences and items to review

- **No direct contradiction was found in the visible biographical facts.** The website uses **W. A Buddhika Sankalpa** while the PDF heading uses **Buddhika Sankalpa**; confirm the preferred CV name. Source: index.html, About line 82 and Contact line 518; public/MY_CV.pdf, p. 1, heading.
- The school appears as **Dharmapala College, Pannipitiya** on the site and **Pannipitiya Dharmapala College** in the PDF. These may be equivalent names; confirm the official name. Source: index.html, Skills & Education, line 193; public/MY_CV.pdf, p. 1, Education → School.
- The PDF adds a street address, ICET diploma, and course list absent from the website. The website adds expected graduation in **2028**, O/L results, more skills, projects, leadership, and an **Outstanding Contribution** recognition absent from the PDF. Absence is not a contradiction. Source: index.html, About, Skills & Education, Projects & Experience, and Certifications sections; public/MY_CV.pdf, p. 1.
- **PDF metadata caveat:** the file's embedded Author field is **“gimhan hasitha”**, while the visible PDF heading and website name Buddhika Sankalpa. This may be export/template metadata and is not treated as the applicant's name; confirm the PDF's provenance if needed. Source: public/MY_CV.pdf, document metadata and p. 1 heading; index.html, About line 82.

## 8. Facts needed before writing a professional CV

1. Confirm the full preferred name, a public portfolio URL, and whether to use **Homagama** or the full PDF address on the CV. Confirm the preferred phone display format. Source gaps: index.html, About and Contact; public/MY_CV.pdf, p. 1, Contact.
2. Give the exact University of Kelaniya degree title/award, start month/year, expected graduation month in **2028**, and any GPA or academic honors you want included. Confirm the official school name and school completion years. Source gaps: index.html, Skills & Education; public/MY_CV.pdf, p. 1, Education.
3. Confirm whether the **ICET diploma in ICT** was completed, its full institution/award name, award date, and credential evidence. Source gap: public/MY_CV.pdf, p. 1, Education → ICET.
4. For **each of the five projects**, provide dates, your role and team size, key features or architecture, verified frontend/backend/database/cloud technologies, and concrete results or usage numbers if available. The cards do not support project-specific technology claims or metrics. Source gap: index.html, Projects & Experience, lines 207–332.
5. Confirm the Security System frontend repository URL, whose current source name is **wedding-website-frontend**, and which demo route belongs on the CV. The current site source uses **https://nexgard-pi.vercel.app**. Source: index.html, Project 04 card, lines 299–302.
6. Give dates, responsibilities, scale, and measurable outcomes for the club, UOK Robot Battle, MEDUSA 2026, and AWS Student Community Day roles. Clarify who granted **Outstanding Contribution** and when. Source gaps: index.html, Projects & Experience → Leadership & experience, lines 338–409.
7. Identify which PDF courses were completed, with dates, exact issuer names, certificates, credential IDs, and verification URLs. Confirm whether any of the site's six learning areas correspond to earned certificates. Source gaps: public/MY_CV.pdf, p. 1, Courses; index.html, Certifications, lines 413–478.
8. Clarify proficiency levels and which listed tools you currently use. Give concrete examples for Cloud Labs, Machine Learning Experiments, IoT Research, and Cybersecurity Practice if they are to appear on the CV. Source gaps: index.html, Skills & Education and Certifications → Learning in practice; public/MY_CV.pdf, p. 1, skills.
9. Confirm whether there is internship, paid work, volunteering, or research experience beyond the leadership items. Neither inspected source provides a separate employment history. Source gaps: index.html, Projects & Experience; public/MY_CV.pdf, p. 1.

## Suggested CV section order

**Name and contact → short targeted profile → education → technical skills → selected projects → leadership and recognition → verified certifications/courses → optional learning activities.** For a software, IoT, cloud/DevOps, MLOps, or cybersecurity application, select the most relevant verified projects and skills for that role; keep unverified interests in the profile or learning section rather than presenting them as completed expertise.
