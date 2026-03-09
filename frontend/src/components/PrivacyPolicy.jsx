import LegalPage from './LegalPage';

const P = ({ children }) => <p className="legal-p">{children}</p>;
const UL = ({ items }) => <ul className="legal-ul">{items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
const Warn = ({ children }) => <div className="legal-warn">{children}</div>;
const Table = ({ headers, rows }) => (
  <div className="legal-table-wrap">
    <table className="legal-table">
      <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody>
    </table>
  </div>
);
const SummaryBox = () => (
  <div className="legal-summary-box">
    <p className="legal-summary-title">Plain Language Summary</p>
    <ul className="legal-summary-list">
      <li><span className="legal-check">✓</span> We collect personal and account data when you use PeptideAI.</li>
      <li><span className="legal-check">✓</span> We use that data to run the platform, improve our AI, and personalize your consulting experience.</li>
      <li><span className="legal-check">✓</span> We may share, license, or sell your data with third-party research and commercial partners.</li>
      <li><span className="legal-check">✓</span> We maintain HIPAA-compliant data handling practices for any protected health information.</li>
      <li><span className="legal-check">✓</span> California and other state residents have opt-out rights. See Section 11.</li>
      <li><span className="legal-check">✓</span> You can request access, correction, or deletion of your data at any time.</li>
    </ul>
  </div>
);

const sections = [
  {
    id: 'introduction',
    label: '1. Introduction',
    title: '1. Introduction',
    content: (
      <>
        <SummaryBox />
        <P>PeptideAI LLC ("PeptideAI," "we," "us," or "our") is committed to being transparent about how we collect, use, share, and monetize information about you. This Privacy Policy applies to all information collected through the PeptideAI platform, including our website, mobile application, AI consulting tools, and all related services (collectively, the "Platform").</P>
        <P>By using the Platform, you agree to the data practices described in this Privacy Policy. If you do not agree, please discontinue use of the Platform immediately. This Policy is incorporated into and forms part of our Terms of Service.</P>
        <P>We update this Policy from time to time. The current version is always available at www.peptideai.co/privacy. Material updates will be communicated via email or in-app notice, and your continued use after the effective date constitutes acceptance.</P>
        <div className="legal-info-box">
          <strong>Important:</strong> PeptideAI is a SaaS peptide consulting and educational platform powered by artificial intelligence. We maintain HIPAA-compliant data handling practices and employ industry-standard safeguards to protect any health-related information that may be processed through our consulting services.
        </div>
      </>
    ),
  },
  {
    id: 'collection',
    label: '2. Information We Collect',
    title: '2. Information We Collect',
    content: (
      <>
        <P>We collect information in three ways: information you give us directly, information collected automatically when you use the Platform, and information from third-party sources.</P>
        <P><strong>2.1 Information You Provide Directly</strong></P>
        <UL items={[
          'Account information: name, email address, username, and password when you register;',
          'Profile information: professional background, areas of interest, organization or affiliation, and consulting preferences;',
          'Consulting query data: questions, prompts, research topics, and any information you submit to our AI consulting tools for peptide-related guidance;',
          'Payment information: billing name, address, and payment card details (card numbers are handled exclusively by our payment processor and are not stored on our systems);',
          'Communications: messages, feedback, support requests, survey responses, and content you post in community features.',
        ]} />
        <P><strong>2.2 Information Collected Automatically</strong></P>
        <UL items={[
          'Device and technical data: device type, operating system version, browser type, unique device identifiers, and hardware model;',
          'Usage data: features you access, AI queries you submit, content you view, time spent, click patterns, navigation paths, and search terms used within the Platform;',
          'Log data: IP address, access timestamps, referring URLs, pages viewed, and error logs;',
          'Location data: general geographic location inferred from your IP address;',
          'Cookies and tracking data: as further described in Section 8.',
        ]} />
        <P><strong>2.3 Information from Third Parties</strong></P>
        <UL items={[
          'Social login providers: if you sign in via Google or another provider, we receive basic profile data from that service per your settings;',
          'Analytics and marketing providers: data about your interactions with our advertising and marketing materials;',
          'Public research databases: publicly available scientific literature and research data used to power educational content.',
        ]} />
        <p className="legal-p" style={{ marginTop: '1.5rem' }}><strong>Summary of data collection:</strong></p>
        <Table
          headers={['Data Category', 'What We Collect', 'Who May Receive It']}
          rows={[
            ['Identifiers', 'Name, email, username, device ID, IP address', 'Service providers, analytics partners, marketing platforms'],
            ['Consulting Data', 'AI queries, research topics, consulting interactions', 'Research institutions, commercial data partners (de-identified or identifiable per Section 5)'],
            ['Usage & Behavioral', 'Pages visited, features used, AI queries, click patterns, session duration', 'Analytics providers, advertising platforms, commercial partners'],
            ['Account & Profile', 'Professional background, interests, organization, subscription tier', 'Service providers, commercial data partners'],
            ['Device & Technical', 'Device type, OS, browser, crash logs, performance data', 'Cloud providers, analytics services'],
            ['Payment', 'Billing address (card data handled by payment processor only)', 'Payment processor only — not sold'],
            ['Communications', 'Support messages, survey responses, feedback', 'Customer support providers'],
          ]}
        />
      </>
    ),
  },
  {
    id: 'use',
    label: '3. How We Use Your Information',
    title: '3. How We Use Your Information',
    content: (
      <>
        <P>We use the information we collect for the following purposes:</P>
        <UL items={[
          'Platform operations: to create and manage your account, process payments, deliver features, provide customer support, and send essential account communications;',
          'AI personalization: to power our AI consulting engine, generate educational outputs tailored to your queries, and improve the relevance of content recommendations;',
          'AI model training and improvement: to train, test, evaluate, and improve our artificial intelligence systems. Your data — including consulting queries and usage patterns — may be used in model training and development processes;',
          'Research and product development: to conduct internal research, analyze usage trends, develop new features, and improve the Platform;',
          'Analytics: to understand how users interact with the Platform, measure performance, and identify areas for improvement;',
          'Marketing and communications: to send you promotional content, product updates, and newsletters where you have opted in or where permitted by law;',
          'Commercial data activities: to aggregate, de-identify, package, and monetize data for commercial purposes as described in Section 5;',
          'Legal and safety: to comply with applicable laws, enforce our Terms of Service, prevent fraud, and protect the rights and safety of PeptideAI, our users, and others.',
        ]} />
      </>
    ),
  },
  {
    id: 'legal-basis',
    label: '4. Legal Basis for Processing',
    title: '4. Legal Basis for Processing',
    content: (
      <>
        <P>Where applicable law requires a legal basis for processing your personal information, we rely on the following:</P>
        <UL items={[
          'Contract performance: processing necessary to provide the Platform and fulfill our Terms of Service with you;',
          'Legitimate interests: processing for our legitimate business interests, including platform improvement, fraud prevention, analytics, and marketing, where those interests are not overridden by your rights;',
          'Consent: where we have obtained your explicit consent — including for direct marketing communications;',
          'Legal obligation: processing required to comply with applicable law.',
        ]} />
        <P>For California residents, the relevant legal framework is the CCPA/CPRA, described in Section 11. For users in other jurisdictions, we comply with applicable local law.</P>
      </>
    ),
  },
  {
    id: 'sharing',
    label: '5. How We Share Your Data',
    title: '5. How We Share, License, and Sell Your Data',
    content: (
      <>
        <Warn>⚠ WE MAY SELL AND SHARE YOUR DATA — READ THIS SECTION CAREFULLY. PeptideAI engages in data monetization activities, including selling and sharing personal information with third parties for research and commercial purposes. By using the Platform, you consent to these practices. California and other state residents have opt-out rights described in Section 11.</Warn>
        <P><strong>5.1 Service Providers.</strong> We share your information with vendors and service providers who help us operate the Platform, including cloud infrastructure providers, payment processors, analytics services, email platforms, and customer support tools. These providers process your data only on our behalf and under contractual data protection obligations.</P>
        <P><strong>5.2 Research and Commercial Data Partners — Including Data Sales.</strong> PeptideAI may sell, license, transfer, or otherwise share your personal information — including consulting interaction data and behavioral data — with third-party partners for research and commercial purposes. This is a core part of our business model.</P>
        <P>Partners who may purchase or receive your data include:</P>
        <UL items={[
          'Pharmaceutical and biotechnology companies conducting research on peptides, longevity, metabolic health, and related fields;',
          'Nutraceutical companies, supplement manufacturers, and wellness product brands seeking consumer behavioral and market trend data;',
          'Academic and research institutions conducting observational studies or research planning;',
          'Data analytics companies and research data platforms;',
          'Healthcare technology companies developing tools related to longevity and functional medicine;',
          'Advertising technology platforms and marketing data companies.',
        ]} />
        <div className="legal-info-box" style={{ marginTop: '1rem' }}>
          <strong>Your Control:</strong> California residents and users in certain other jurisdictions may opt out of the sale or sharing of their personal information. See Section 11 for how to exercise this right. Opting out may limit certain features of the Platform.
        </div>
        <P><strong>5.3 Business Transfers and Acquisitions.</strong> In the event of a merger, acquisition, asset sale, reorganization, bankruptcy, or similar transaction, your personal information may be transferred to the acquiring or successor entity as a business asset.</P>
        <P><strong>5.4 Legal Compliance and Protection.</strong> We may disclose your information to law enforcement, government authorities, or other parties as required by applicable law, court order, or legal process.</P>
        <P><strong>5.5 With Your Consent.</strong> We may share your information with other parties with your explicit prior consent, including for any purposes disclosed to you at the time of collection.</P>
      </>
    ),
  },
  {
    id: 'hipaa',
    label: '6. HIPAA Compliance',
    title: '6. HIPAA Compliance',
    content: (
      <>
        <P>PeptideAI maintains HIPAA-compliant data handling practices. We implement administrative, technical, and physical safeguards consistent with the requirements of the Health Insurance Portability and Accountability Act (HIPAA) and the HITECH Act to protect any protected health information (PHI) that may be processed through our Platform.</P>
        <P>Our HIPAA compliance program includes:</P>
        <UL items={[
          'Encryption of data in transit (TLS 1.2+) and at rest (AES-256);',
          'Role-based access controls limiting access to personal and sensitive data;',
          'Regular security risk assessments and vulnerability testing;',
          'Employee training on HIPAA requirements and data privacy practices;',
          'Business Associate Agreements (BAAs) with applicable third-party service providers;',
          'Incident response and breach notification procedures in accordance with HIPAA requirements.',
        ]} />
        <P>If you have questions about our HIPAA compliance practices, please contact us at <a className="legal-link" href="mailto:legal@peptideai.co">legal@peptideai.co</a>.</P>
      </>
    ),
  },
  {
    id: 'retention',
    label: '7. Data Retention',
    title: '7. Data Retention',
    content: (
      <>
        <P>We retain your personal information for as long as your account remains active, as needed to provide the Platform, and as required or permitted by applicable law. The following retention practices apply:</P>
        <UL items={[
          'Active account data is retained for the duration of your account plus a reasonable wind-down period following deletion;',
          'Anonymized and aggregated data derived from your account may be retained indefinitely and is not subject to deletion requests;',
          "Data shared with or sold to third-party partners prior to your deletion request is subject to those partners' own retention practices — we cannot guarantee deletion from third-party systems;",
          'Backup and archival copies may persist for up to 90 days following deletion from active systems;',
          'We may retain certain data as required by law, for fraud prevention, to resolve disputes, or to enforce our agreements.',
        ]} />
        <P>To request deletion of your personal information, contact us at <a className="legal-link" href="mailto:legal@peptideai.co">legal@peptideai.co</a> or use the account settings in the Platform.</P>
      </>
    ),
  },
  {
    id: 'cookies',
    label: '8. Cookies & Tracking',
    title: '8. Cookies and Tracking Technologies',
    content: (
      <>
        <P>We and our third-party partners use cookies, pixel tags, web beacons, SDKs, and similar tracking technologies on the Platform for the following purposes:</P>
        <UL items={[
          'Essential functionality: maintaining your session, authenticating your account, and enabling core features;',
          'Analytics: understanding how users interact with the Platform, measuring feature performance, and identifying areas for improvement;',
          'Personalization: remembering your preferences and customizing your experience;',
          'Advertising and marketing: delivering targeted advertisements, measuring ad performance, and enabling retargeting by our advertising partners;',
          'Data partnerships: certain third-party partners may place tracking technologies on the Platform to collect data for their own purposes in accordance with their own privacy policies.',
        ]} />
        <P>You can manage cookie preferences through your browser settings. Disabling certain cookies may affect Platform functionality. By continuing to use the Platform, you consent to our use of cookies as described in this Policy.</P>
      </>
    ),
  },
  {
    id: 'security',
    label: '9. Data Security',
    title: '9. Data Security',
    content: (
      <P>We implement commercially reasonable technical and organizational security measures designed to protect your information from unauthorized access, disclosure, alteration, and destruction. These measures include encryption of data in transit using TLS, encryption of sensitive data at rest, role-based access controls, regular security assessments, and HIPAA-compliant safeguards. However, no security system is impenetrable. We cannot guarantee absolute security of your information. In the event of a data breach that requires notification under applicable law, we will notify affected users as required.</P>
    ),
  },
  {
    id: 'children',
    label: "10. Children's Privacy",
    title: "10. Children's Privacy",
    content: (
      <P>PeptideAI is intended for users who are 18 years of age or older. We do not knowingly collect personal information from anyone under the age of 18. If we learn that we have collected information from a person under 18, we will delete that information immediately. If you believe we have collected information from a child under 18, please contact us at <a className="legal-link" href="mailto:legal@peptideai.co">legal@peptideai.co</a>.</P>
    ),
  },
  {
    id: 'rights',
    label: '11. Your Privacy Rights',
    title: '11. Your Privacy Rights',
    content: (
      <>
        <P><strong>11.1 General Rights.</strong> Depending on where you live, you may have certain rights regarding your personal information. To exercise any of the rights described in this section, contact us at <a className="legal-link" href="mailto:legal@peptideai.co">legal@peptideai.co</a> or through the Privacy Rights section of your account settings.</P>
        <P><strong>11.2 California Residents — CCPA / CPRA.</strong> If you are a California resident, you have the following rights:</P>
        <UL items={[
          'Right to Know: Request disclosure of the categories and specific pieces of personal information we collect, use, disclose, and sell about you.',
          'Right to Delete: Request deletion of your personal information, subject to certain legal exceptions.',
          'Right to Correct: Request correction of inaccurate personal information we hold about you.',
          'Right to Opt Out of Sale/Sharing: Opt out of the sale or sharing of your personal information with third parties. Use the "Do Not Sell or Share My Personal Information" link on our Platform or email legal@peptideai.co.',
          'Right to Limit Sensitive Data Use: Request that we limit our use and disclosure of sensitive personal information to purposes necessary to provide the Platform.',
          'Right to Non-Discrimination: We will not discriminate against you for exercising any of your CCPA/CPRA rights.',
        ]} />
        <P><strong>11.3 Nevada Residents.</strong> Nevada residents may opt out of the sale of certain personal information under Nevada law by contacting us at <a className="legal-link" href="mailto:legal@peptideai.co">legal@peptideai.co</a> with the subject line "Nevada Privacy Opt-Out."</P>
        <P><strong>11.4 Other U.S. States.</strong> Users in Virginia, Colorado, Connecticut, Utah, Texas, and other states with applicable privacy laws may have additional rights under state law. Contact us at <a className="legal-link" href="mailto:legal@peptideai.co">legal@peptideai.co</a> to exercise applicable rights.</P>
      </>
    ),
  },
  {
    id: 'international',
    label: '12. International Transfers',
    title: '12. International Data Transfers',
    content: (
      <P>PeptideAI is based in the United States. If you access the Platform from outside the United States, your information will be transferred to, stored in, and processed in the United States, where data protection laws may differ from those in your home country. By using the Platform, you consent to the transfer of your information to the United States and other countries where our service providers operate.</P>
    ),
  },
  {
    id: 'third-party',
    label: '13. Third-Party Links',
    title: '13. Third-Party Links and Services',
    content: (
      <P>The Platform may contain links to third-party websites, affiliate services, and external content. This Privacy Policy applies only to the PeptideAI Platform. We are not responsible for the privacy practices of any third party. We encourage you to review the privacy policies of any third-party services you access in connection with the Platform.</P>
    ),
  },
  {
    id: 'changes',
    label: '14. Changes to This Policy',
    title: '14. Changes to This Privacy Policy',
    content: (
      <P>We may update this Privacy Policy at any time. We will post the revised Policy on the Platform and update the Effective Date. For material changes, we will provide notice via email or prominent in-app notification at least 30 days before the change takes effect, where required by law. Your continued use of the Platform after the effective date of any change constitutes your acceptance of the updated Policy.</P>
    ),
  },
  {
    id: 'contact',
    label: '15. Contact Us',
    title: '15. How to Contact Us',
    content: (
      <>
        <P>For privacy-related questions, requests, or concerns — including to exercise any rights described in this Policy — please contact us:</P>
        <Table
          headers={['', '']}
          rows={[
            ['Company', 'PeptideAI LLC'],
            ['Privacy inquiries', 'legal@peptideai.co'],
            ['Opt-out requests', 'legal@peptideai.co (subject: "Privacy Opt-Out")'],
            ['Data deletion requests', 'legal@peptideai.co (subject: "Data Deletion Request")'],
            ['Website', 'www.peptideai.co'],
            ['Response time', 'Within 45 days (or sooner as required by applicable law)'],
          ]}
        />
      </>
    ),
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="We are committed to transparency about how we collect, use, share, and monetize your information."
      effectiveDate="March 8, 2026"
      sections={sections}
    />
  );
}
