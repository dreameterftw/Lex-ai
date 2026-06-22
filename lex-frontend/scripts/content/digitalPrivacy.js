// Content attribution: Statistics sourced from NCRB Crime in India Report 2024,
// MHA Parliamentary data (Rajya Sabha, 2024), CERT-In reports, and
// publicly reported court proceedings. Content rephrased for compliance.

export const digitalPrivacyArticles = [
  // ── Landmark cases ─────────────────────────────────────────────────────────
  {
    category: "digital-privacy",
    type: "landmark-case",
    title: "Shreya Singhal v. Union of India (2015)",
    subtitle: "The judgment that deleted Section 66A and protected free speech online",
    summary: "The Supreme Court struck down Section 66A of the IT Act — which had been used to arrest people for Facebook posts and WhatsApp messages — as unconstitutional for violating free speech.",
    readingTime: "3 min",
    difficulty: "Beginner",
    tags: ["Shreya Singhal", "Section 66A", "IT Act", "free speech online", "internet freedom"],
    jurisdiction: "india",
    featured: true,
    year: "2015",
    court: "Supreme Court of India",
    publishedAt: "2024-09-01T00:00:00.000Z",
    content: `# Shreya Singhal v. Union of India (2015)

**Court:** Supreme Court of India
**Year:** 2015

## What happened

Shreya Singhal, a law student, filed a PIL challenging Section 66A of the Information Technology Act 2000 after two women in Mumbai were arrested for posting comments on Facebook that were critical of a political shutdown. The law allowed arrest for sending any "offensive" or "menacing" content online — terms so vague they covered almost any critical speech.

Over the years, Section 66A had been used to arrest cartoonists, students, academics, and ordinary citizens for social media posts, WhatsApp messages, and online articles. The arrests often involved no actual harm.

## What the court decided

The Supreme Court struck down Section 66A in its entirety as unconstitutional. The court held that the expressions "grossly offensive," "menacing character," and "causing annoyance or inconvenience" had no clear definition and created an unconstitutional chilling effect on free speech protected under Article 19(1)(a).

The court drew a distinction between discussion, advocacy, and incitement — only the last of these can be legitimately restricted.

## Why it matters

Section 66A was one of the most misused provisions in Indian digital law. Its deletion meant that you could no longer be arrested merely for expressing an opinion online, however unpopular. The judgment established that the internet is not a lawless space, but that laws restricting online speech must meet the same constitutional standards as laws restricting offline speech.

Notably, despite being struck down in 2015, cases continued to be registered under Section 66A in several states. In 2022, the Supreme Court had to issue specific directions to states to stop using the provision — reflecting the gap between a judicial ruling and its implementation on the ground.

## Key quote from the judgment

"Section 66A of the Information Technology Act, 2000 is struck down in its entirety being violative of Article 19(1)(a) and not saved under Article 19(2)."

## What it means for you today

You cannot be arrested under Section 66A — it no longer exists. If police attempt to book you under it, the charge is void. You can approach the High Court immediately for quashing. Your online speech is protected by the same constitutional guarantees as your offline speech.`
  },

  {
    category: "digital-privacy",
    type: "landmark-case",
    title: "WazirX Hack — Rs 1,900 Crore and What Indian Courts Did (2024–2025)",
    subtitle: "India's largest crypto theft and the legal battle that followed",
    summary: "When hackers stole $235 million from WazirX in July 2024, 15 million Indian investors lost access to their funds. The case tested the limits of Indian crypto law, consumer rights, and cross-border jurisdiction.",
    readingTime: "4 min",
    difficulty: "Intermediate",
    tags: ["WazirX hack", "crypto theft", "Lazarus Group", "digital asset law", "consumer rights crypto"],
    jurisdiction: "india",
    featured: true,
    year: "2024–2025",
    court: "Supreme Court / Madras High Court / NCDRC",
    publishedAt: "2024-09-02T00:00:00.000Z",
    content: `# WazirX Hack — Rs 1,900 Crore and What Indian Courts Did (2024–2025)

**Court:** Supreme Court of India / Madras High Court / NCDRC
**Year:** 2024–2025

## What happened

On July 18, 2024, hackers — attributed by investigators to North Korea's state-sponsored Lazarus Group — drained over $235 million (approximately Rs 1,900 crore) from WazirX's multisig crypto wallet. The exchange served roughly 15 million Indian investors. Trading was halted immediately and millions of users found their funds frozen.

WazirX is operated by Zanmai Labs in India, which is linked to a Singapore-based parent entity. The exchange went into court-supervised restructuring under Singapore law.

## What the courts decided

A group of 40 affected users filed a class action before the National Consumer Disputes Redressal Commission (NCDRC) — which dismissed it, noting the lack of specific crypto regulation in India that would bring the exchange clearly under consumer protection frameworks for this type of loss.

The Supreme Court dismissed a separate petition, also citing the absence of a regulatory framework for crypto assets.

In a significant development, the Madras High Court ruled that digital assets constitute property under Indian law and blocked WazirX from reallocating a user's XRP holdings to offset the hack losses — one of the first Indian court orders treating cryptocurrency as legally protectable property.

## Why it matters

The case exposed a significant regulatory gap. India had no specific crypto law at the time of the hack. Users discovered that the absence of regulation left them with limited formal legal remedies even when they suffered documented financial loss through no fault of their own.

The Madras High Court's property ruling is significant — it means crypto holdings can at minimum be protected under property law principles, even without sector-specific legislation.

## What it means for you today

If you hold crypto on any Indian exchange, understand that regulatory protection is limited compared to bank deposits or stock market investments. Keep records of all transactions and correspondence. If an exchange freezes your funds, you can approach the consumer commission (outcomes may vary), the High Court for property protection of specific identified assets, and SEBI (which has been given oversight of crypto assets under recent regulatory directions).`
  },

  {
    category: "digital-privacy",
    type: "landmark-case",
    title: "BSNL Data Breach (2023–2024) — When a Government Company Exposed 278GB of User Data",
    subtitle: "India's biggest telecom data breach and what it means for users",
    summary: "BSNL suffered two major data breaches — 191GB in December 2023 and 278GB in May 2024 — exposing SIM card details, IMSI numbers, and security keys of millions of subscribers, enabling SIM cloning and financial fraud risks.",
    readingTime: "3 min",
    difficulty: "Beginner",
    tags: ["BSNL data breach", "SIM cloning", "telecom data leak", "CERT-In", "data protection India"],
    jurisdiction: "india",
    featured: true,
    year: "2023–2024",
    court: "Government investigation / Parliamentary acknowledgement",
    publishedAt: "2024-09-03T00:00:00.000Z",
    content: `# BSNL Data Breach (2023–2024) — When a Government Company Exposed 278GB of User Data

**Forum:** CERT-In / Department of Telecom / Parliament
**Year:** 2023–2024

## What happened

India's state-owned telecom operator BSNL suffered two separate data breaches. In December 2023, approximately 191GB of data was exposed. In May 2024, a further breach resulted in approximately 278GB of sensitive telecom data — including International Mobile Subscriber Identity (IMSI) numbers, SIM card details, Home Location Register (HLR) data, and critical security keys — being offered for sale on BreachForums, a dark web marketplace.

CERT-In (India's cybersecurity agency) confirmed the breach. The Department of Telecom acknowledged it in a Lok Sabha response.

## Why it matters

IMSI numbers and SIM security keys can be used to clone SIM cards, enabling fraudsters to intercept OTPs, bypass two-factor authentication, and access bank accounts and financial applications. The breach directly raised the risk of SIM-swap fraud for millions of BSNL subscribers.

The incident exposed how even government entities can fail at basic data security, and highlighted that India lacked a mandatory data breach notification law at the time — BSNL users were not directly notified about their data being compromised.

## What the DPDP Act now requires

The Digital Personal Data Protection Act 2023 (DPDP Act), once fully operational, will require Data Fiduciaries (organisations that process your data) to notify the Data Protection Board and affected individuals in the event of a personal data breach. This notification obligation — which did not apply to the BSNL breach — is one of the most significant new protections for Indian data subjects.

## What it means for you today

If you are a BSNL subscriber, watch for unusual SIM activity, unexpected OTPs, or inability to make calls (which can indicate SIM cloning). Report SIM fraud immediately to your telecom operator and to 1930 (cybercrime helpline). File a complaint with the telecom regulator TRAI if your operator fails to act within 24 hours of a reported SIM-related fraud.`
  },

  // ── Articles ────────────────────────────────────────────────────────────────
  {
    category: "digital-privacy",
    type: "article",
    title: "India's cybercrime crisis — the numbers behind 1 lakh cases in 2024",
    subtitle: "NCRB data shows cybercrime up 18% in 2024, with Rs 22,800 crore lost to online fraud",
    summary: "India recorded over 1 lakh cybercrime cases in 2024 — an 18% jump from 2023. Fraud drove 73% of all cases. Here is what the data means and what is being done.",
    readingTime: "4 min",
    difficulty: "Beginner",
    tags: ["cybercrime statistics India", "NCRB 2024", "online fraud India", "digital crime data", "cybercrime rise"],
    jurisdiction: "india",
    featured: true,
    publishedAt: "2024-09-04T00:00:00.000Z",
    content: `# India's cybercrime crisis — the numbers behind 1 lakh cases in 2024

## The one-line answer

India recorded over 1,01,928 cybercrime cases in 2024 — an 18% increase over 2023 — with financial fraud accounting for nearly three-quarters of all cases.

## The data

The NCRB's Crime in India 2024 report (released May 2026) recorded:

- **1,01,928** cybercrime cases registered in 2024 — up from 86,420 in 2023
- **18% year-on-year increase** in registered cases
- **Rs 22,845 crore** lost to online fraud in 2024 (MHA parliamentary data) — nearly triple the 2023 figure
- **73,987 cases** (72.6%) driven by financial fraud — the dominant motive
- **5,710 cases** involving sexual exploitation online
- **2,530 cases** of cyber extortion
- National cybercrime rate rose from 6.2 to 7.3 per lakh population

MHA data tabled before the Rajya Sabha noted a roughly 900% growth in cybercrime complaints between 2021 and 2025.

Source: NCRB Crime in India 2024 report; [Indian Express](https://indianexpress.com/article/india/crime-cases-saw-dip-but-cyber-offences-rose-in-2024-ncrb-data-10676671/); [India Today](https://www.indiatoday.in/diu/story/cybercrime-india-record-high-overall-crime-falls-ncrb-2024-2908326-2026-05-07)

## What the law says

Cybercrimes in India are prosecuted under the Information Technology Act 2000 and the Bharatiya Nyaya Sanhita 2023. The MHA operates the National Cyber Crime Reporting Portal (cybercrime.gov.in) and the 1930 helpline.

Despite the rise in cases, conviction rates in cybercrime cases remain low — investigations are technically complex, evidence collection is challenging, and many perpetrators operate across state or national borders.

## What you can do

- Report financial cyber fraud immediately at 1930 — the first hour is critical for fund recovery
- File online at cybercrime.gov.in for all categories of cybercrime
- For amounts above Rs 1 lakh, visit your local Cyber Crime Cell to convert the portal complaint into a formal FIR
- Enable two-factor authentication on all banking and financial apps
- Never share OTPs — no bank, government department, or legitimate company will ever ask for your OTP

## India vs the world

India's cybercrime growth rate significantly outpaces the rate at which enforcement capacity is being built. The EU has dedicated ENISA (EU Agency for Cybersecurity) and mandatory breach notification under GDPR. India's DPDP Act 2023, once operational, will introduce similar breach notification obligations — but enforcement infrastructure is still developing.`
  },

  {
    category: "digital-privacy",
    type: "article",
    title: "India's Digital Personal Data Protection Act 2023 — what it means for you",
    subtitle: "Your rights under India's first comprehensive data protection law",
    summary: "The DPDP Act 2023 is India's first cross-sectoral data protection law. It gives you rights to access, correct, and erase your data — but also has significant government exemptions that the EU's GDPR does not.",
    readingTime: "5 min",
    difficulty: "Beginner",
    tags: ["DPDP Act 2023", "data protection India", "privacy rights", "data principal rights", "data fiduciary"],
    jurisdiction: "india",
    featured: true,
    publishedAt: "2024-09-05T00:00:00.000Z",
    content: `# India's Digital Personal Data Protection Act 2023 — what it means for you

## The one-line answer

The DPDP Act 2023 is India's first comprehensive data protection law. It gives you rights to access, correct, and erase your personal data — but with significant exemptions for government processing.

## Why this matters to you

Before the DPDP Act, India had no single law governing how companies could collect, store, and use your personal data. The only protection was the 2017 Supreme Court ruling in Puttaswamy declaring privacy a fundamental right. The DPDP Act operationalises that right.

## What the law actually says

The DPDP Act applies to any digital personal data processed within India, and to processing outside India where it relates to Indian residents. It creates two key roles:
- **Data Principal** — you, the individual whose data is being processed
- **Data Fiduciary** — the company or organisation processing your data

**Your rights as a Data Principal:**
- Right to access information about what data is being processed about you and why
- Right to correction and erasure of inaccurate or incomplete data
- Right to grievance redressal against the Data Fiduciary
- Right to nominate someone to exercise your rights in case of death or incapacity

**Obligations on Data Fiduciaries:**
- Must obtain free, specific, and informed consent before processing personal data (with exceptions)
- Must notify the Data Protection Board and affected individuals in case of a data breach
- Must not retain personal data beyond the purpose for which it was collected
- Must have a published privacy policy in accessible language

**Relevant law:** Digital Personal Data Protection Act 2023.

## Where the DPDP Act falls short compared to the EU GDPR

- **Government exemptions:** The central government can exempt any of its own agencies from the Act's requirements — a significant gap that the EU's GDPR does not have
- **No right to data portability:** Unlike GDPR, you cannot demand your data in a machine-readable format to move to another service provider
- **No right to explanation:** GDPR gives you the right to an explanation when an automated decision affects you — the DPDP Act does not
- **Data Protection Board not yet operational:** As of 2025, the enforcement body has not been constituted

## What you can do today

- Request data access from companies that hold your data — send a formal email citing your rights under the DPDP Act
- Withdraw consent by contacting the company's data protection officer (each Data Fiduciary must have one)
- File a grievance with the company's internal mechanism first
- Once operational, file a complaint with the Data Protection Board for violations

## India vs the world

India declared privacy a fundamental right in 2017 — earlier than many nations enacted data protection laws. However, the DPDP Act's government exemptions, lack of data portability rights, and absence of algorithmic decision-making protections make it meaningfully weaker than the EU's GDPR in practical citizen protection. The DPDP Rules 2025 are intended to fill some gaps — their full implementation will determine how effective the framework becomes.`
  },

  {
    category: "digital-privacy",
    type: "article",
    title: "SIM swap fraud — how it works and how to stop it",
    subtitle: "How criminals use your Aadhaar and ID documents to take over your phone number",
    summary: "SIM swap fraud is one of India's fastest-growing financial crimes. Criminals get your SIM ported to their device, intercept your OTPs, and drain your bank accounts. Here is exactly what to do.",
    readingTime: "4 min",
    difficulty: "Beginner",
    tags: ["SIM swap fraud", "SIM cloning", "OTP fraud", "mobile banking fraud", "telecom fraud India"],
    jurisdiction: "india",
    featured: false,
    publishedAt: "2024-09-06T00:00:00.000Z",
    content: `# SIM swap fraud — how it works and how to stop it

## The one-line answer

In a SIM swap, criminals port your phone number to a SIM they control, intercept all your OTPs, and access your bank accounts. You typically lose signal before you realise what has happened.

## Why this matters to you

India processes billions of OTP-based authentications daily for banking, payments, and government services. SIM swap makes OTP-based two-factor authentication worthless. The BSNL data breach of 2024 — which exposed IMSI numbers and SIM security keys of millions of subscribers — significantly raised the risk of SIM swap attacks for BSNL users.

## How it typically works

1. Fraudsters gather your personal information — from data breaches, social engineering, or phishing
2. They visit a telecom store or use a compromised insider to request a SIM replacement for your number, using forged documents or your Aadhaar details
3. Your original SIM is deactivated; their SIM now receives all calls and messages to your number
4. They trigger password resets and OTP flows on your bank accounts and financial apps

## Warning signs

- Your phone suddenly shows "No Service" or "Emergency Calls Only" for an extended period
- You stop receiving calls or messages unexpectedly
- You receive SMS alerts about a SIM change you did not initiate
- You get account login notifications you did not trigger

## What you can do if it happens

- Call your telecom operator's fraud hotline immediately — ask them to freeze the SIM change and restore your original SIM
- Call your bank immediately to freeze all transactions
- Report to 1930 (National Cyber Crime Helpline) — the first hours are critical for freezing fraudulent transfers
- File an FIR at the local Cyber Crime Cell
- File a complaint with TRAI against your telecom operator if they failed to follow proper SIM swap verification procedures

## Prevention

- Register on the DoT's TAFCOP portal (tafcop.sancharsaathi.gov.in) to see all SIMs registered in your name and disconnect any you do not recognise
- Avoid using SMS OTP as the only authentication method for high-value financial transactions where alternatives exist
- Never share your Aadhaar OTP, SIM details, or IMSI with anyone claiming to be from your telecom operator or bank

**Relevant law:** IT Act 2000 + BNS 2023 (cheating by impersonation) + TRAI regulations on SIM swap procedures.`
  },

  {
    category: "digital-privacy",
    type: "article",
    title: "Online harassment and cyberstalking — your legal options in India",
    subtitle: "From threatening messages to deepfakes — what constitutes an offence and how to report it",
    summary: "Cyberstalking, online harassment, and non-consensual intimate images are criminal offences under the BNS 2023 and the IT Act. Here is what the law covers and how to act.",
    readingTime: "4 min",
    difficulty: "Beginner",
    tags: ["cyberstalking", "online harassment", "deepfake", "non consensual images", "BNS digital crime"],
    jurisdiction: "india",
    featured: false,
    publishedAt: "2024-09-07T00:00:00.000Z",
    content: `# Online harassment and cyberstalking — your legal options in India

## The one-line answer

Cyberstalking, repeated threatening messages, and sharing non-consensual intimate images are criminal offences in India. The NCRB recorded 5,710 cybercrime cases involving sexual exploitation in 2024 alone.

## Why this matters to you

Online harassment can escalate quickly and cause lasting harm to employment, education, mental health, and personal safety. Many victims do not report because they believe nothing can be done. The law provides specific criminal remedies.

## What the law actually says

**Cyberstalking and online harassment:**
Section 78 of the BNS 2023 (formerly Section 354D IPC) criminalises stalking, including monitoring a person's use of internet and electronic communication. Punishment is imprisonment up to 3 years for a first offence and up to 5 years for a repeat offence.

**Non-consensual intimate images (deepfakes and real images):**
Section 67A of the IT Act criminalises publishing sexually explicit material online. The BNS 2023 introduced specific provisions against publishing intimate images without consent and creating deepfake intimate images. Punishment can extend to 3–7 years imprisonment.

**Criminal intimidation online:**
Section 351 BNS 2023 (formerly Section 506 IPC) covers threats made via any medium including digital messages.

**Relevant law:** BNS 2023 Sections 78, 351 + IT Act 2000 Sections 66E, 67, 67A.

## What you can do

- Preserve all evidence before blocking — screenshot with timestamps, save URLs, export chat logs
- Report the content to the platform immediately through their formal grievance mechanism — platforms must acknowledge within 24 hours and act within 15 days under IT Rules 2021
- File a cybercrime complaint at cybercrime.gov.in — use the "Report Other Cyber Crime" or "Women/Child Related Crime" category
- File an FIR at your nearest police station or Cyber Crime Cell — cyberstalking is cognizable
- If the police are unresponsive, approach the Magistrate directly or the State Human Rights Commission
- Apply for an interim injunction in civil court to require removal of content while criminal proceedings are pending

## Common misconceptions

- "Public figures or public accounts have no privacy rights online" — the law protects all individuals from harassment and non-consensual sharing regardless of their public profile
- "Blocking the harasser ends the problem legally" — blocking is a safety measure, but does not create a legal record; a formal complaint does
- "Deepfakes are too technically complex for police to investigate" — Cyber Crime Cells have increasing technical capacity and platforms can be compelled to provide user data under court order`
  },

  {
    category: "digital-privacy",
    type: "article",
    title: "Your right to be forgotten in India — what exists and what does not",
    subtitle: "Courts have partially recognised it, but there is no statutory right yet",
    summary: "India does not have a statutory right to be forgotten equivalent to the EU's GDPR. However, courts have partially recognised it under the fundamental right to privacy. Here is where things stand.",
    readingTime: "4 min",
    difficulty: "Intermediate",
    tags: ["right to be forgotten", "GDPR India", "data erasure", "privacy internet India", "DPDP Act erasure"],
    jurisdiction: "india",
    featured: false,
    publishedAt: "2024-09-08T00:00:00.000Z",
    content: `# Your right to be forgotten in India — what exists and what does not

## The one-line answer

India does not have a full statutory right to be forgotten like the EU's GDPR. Courts have partially recognised it via the constitutional right to privacy, and the DPDP Act 2023 introduces a right to erasure — but with limitations.

## Why this matters to you

When old news articles, criminal proceedings that ended in acquittal, or embarrassing content continues to appear in Google searches years later, the question of whether you can legally require its removal becomes deeply personal.

## What the EU's right to be forgotten looks like

Under Article 17 of the EU's General Data Protection Regulation (GDPR), any EU citizen can request that a search engine delist specific results linking to outdated, inaccurate, or no longer relevant information. Google processes millions of such requests each year. This right is enforceable with significant penalties for non-compliance.

## What India has

**Constitutional recognition (partial):** In the Puttaswamy case (2017), the Supreme Court's discussion of informational privacy created the constitutional foundation for a right to be forgotten. Several High Courts have cited this to grant relief in specific cases — for example, ordering the removal of old court judgments from search results where the person was acquitted or where ongoing publication caused disproportionate harm.

**DPDP Act 2023 — right to erasure:** Section 13 of the DPDP Act gives Data Principals the right to request erasure of their personal data once the purpose for which it was collected is fulfilled. However, this applies to Data Fiduciaries (companies processing your data), not to search engines indexing publicly available content. It also does not apply where retention is required by law.

**What does not yet exist:** A clear statutory mechanism to compel search engines to delist results linking to lawfully published content that is outdated or no longer relevant — equivalent to Article 17 GDPR.

## What you can currently do

- Submit a removal request directly to Google, Bing, and other search engines — they have voluntary processes for removing certain categories of content (non-consensual intimate images, financial information, Indian court-ordered removals)
- File a petition in the High Court under Article 226 citing the constitutional right to privacy if continued publication causes serious, documented harm disproportionate to any public interest
- Use the DPDP Act erasure right for personal data held by companies — once the Data Protection Board is operational, this becomes enforceable
- For content on specific websites, approach the platform's grievance officer under IT Rules 2021

## India vs the world

The EU's GDPR right to be forgotten is among the strongest globally — search engines must comply with valid delisting requests and provide explanations for refusals. India is behind on this specific protection. The DPDP Act is a step forward but targets company data processing, not general web content. A truly comprehensive right to be forgotten in India awaits either specific legislation or a stronger Supreme Court ruling.`
  },

  {
    category: "digital-privacy",
    type: "comparison",
    title: "India's digital rights vs the EU, US, and China — an honest comparison",
    subtitle: "Where India leads, where it lags, and what the DPDP Act changes",
    summary: "India declared privacy a fundamental right in 2017. But how does India's digital rights framework actually compare to the EU's GDPR, the US's fragmented state laws, and China's PIPL? An honest assessment.",
    readingTime: "5 min",
    difficulty: "Beginner",
    tags: ["digital rights comparison", "GDPR vs India", "DPDP Act vs GDPR", "internet freedom India", "data protection comparison"],
    jurisdiction: "india",
    featured: true,
    publishedAt: "2024-09-09T00:00:00.000Z",
    content: `# India's digital rights vs the EU, US, and China — an honest comparison

## The one-line answer

India leads the US on constitutional privacy recognition and leads China on internet freedom — but lags significantly behind the EU on enforceable data rights, breach notification, and algorithmic accountability.

## Where India leads

**Constitutional privacy — ahead of the US:** India declared privacy a fundamental right in the Puttaswamy judgment in 2017. The United States still has no federal constitutional right to privacy explicitly recognised by the Supreme Court — privacy protection in the US comes through a patchwork of sector-specific laws and state constitutions.

**Internet freedom — significantly ahead of China:** The Shreya Singhal case (2015) established that online speech enjoys the same constitutional protections as offline speech. China's approach to internet governance is fundamentally different — social media content, search results, and news are subject to extensive government filtering. India's courts regularly challenge executive attempts to restrict internet access, as demonstrated in the Anuradha Bhasin case (2020) which required government to justify internet shutdowns.

**Free legal challenge to surveillance:** Indian courts — particularly the Supreme Court — have actively reviewed and constrained surveillance powers using Article 21. The Pegasus spyware controversy led to a Supreme Court-appointed technical committee investigation, setting a precedent for judicial oversight of state surveillance.

## Where India lags

**Behind the EU on enforceable data rights:** The EU's GDPR gives citizens the right to data portability, explanation of automated decisions, objection to profiling, and meaningful consent requirements with heavy penalties. India's DPDP Act 2023 has weaker consent mechanisms, broader government exemptions, no right to data portability, and no algorithmic explanation rights.

**Breach notification:** GDPR requires notification to regulators within 72 hours of a breach and to affected individuals without undue delay. India's DPDP Act requires notification but the Data Protection Board — which will enforce this — is not yet operational as of 2025.

**Internet shutdowns:** India leads the world in the number of government-ordered internet shutdowns. Between 2012 and 2024, India recorded over 700 shutdowns — more than any other democracy. While courts have placed limits on them, they remain frequent.

**Behind the US on cybercrime victim support:** The US has the FBI's IC3 (Internet Crime Complaint Center) with dedicated victim support, financial recovery assistance, and international coordination. India's cybercrime infrastructure — while improving — operates with significantly fewer resources relative to the scale of incidents.

## What the DPDP Act changes

When fully operational, the DPDP Act will introduce:
- Mandatory breach notification obligations
- Enforceable consent requirements for data processing
- A Data Protection Board with penalty powers (up to Rs 250 crore for significant violations)
- Rights to access, correct, and erase personal data

These are meaningful improvements over the pre-2023 position. Whether they are effectively enforced will determine how well India actually protects its citizens' digital rights in practice.`
  }
]
