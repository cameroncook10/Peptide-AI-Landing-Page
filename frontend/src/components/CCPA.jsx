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
const OptOutBox = () => (
  <div className="legal-optout-box">
    <p className="legal-optout-title">How to Exercise Your Right to Opt Out of Sale/Sharing</p>
    <div className="legal-optout-options">
      <div className="legal-optout-option">
        <span className="legal-optout-num">1</span>
        <div>
          <strong>In-App</strong>
          <p>Tap "Do Not Sell or Share My Personal Information" in the Privacy section of your account settings.</p>
        </div>
      </div>
      <div className="legal-optout-option">
        <span className="legal-optout-num">2</span>
        <div>
          <strong>Email</strong>
          <p>Send a request to <a className="legal-link" href="mailto:legal@peptideai.co">legal@peptideai.co</a> with subject line: "CCPA Opt-Out — Sale/Sharing".</p>
        </div>
      </div>
      <div className="legal-optout-option">
        <span className="legal-optout-num">3</span>
        <div>
          <strong>Web</strong>
          <p>Visit www.peptideai.co and use the "Do Not Sell or Share My Personal Information" link.</p>
        </div>
      </div>
    </div>
    <p className="legal-optout-note">Note: Opting out applies prospectively. It does not affect data previously sold or shared. Opting out may limit access to certain Platform features.</p>
  </div>
);
const RequestBox = () => (
  <div className="legal-request-box">
    <p className="legal-optout-title">Submitting a CCPA Request</p>
    <UL items={[
      'Email: legal@peptideai.co',
      'Subject line: CCPA [Right to Know / Right to Delete / Right to Correct / Opt-Out / Sensitive Data Limit]',
      'In-App: Account Settings > Privacy Rights',
      'Website: www.peptideai.co (Privacy Rights portal)',
    ]} />
    <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
      <p>Response time: We will acknowledge your request within <strong>10 business days</strong>.</p>
      <p>We will respond to your request within <strong>45 calendar days</strong>.</p>
      <p>If we need additional time, we will inform you of the extension (up to 45 additional days).</p>
    </div>
  </div>
);

const sections = [
  {
    id: 'intro',
    label: '1. Introduction & Scope',
    title: '1. Introduction & Scope',
    content: (
      <>
        <P>This California Consumer Privacy Act (CCPA) Notice, as amended by the California Privacy Rights Act (CPRA), is provided by PeptideAI LLC ("PeptideAI," "we," "us," or "our") to California residents who use the PeptideAI mobile application, website, and related services (collectively, the "Platform").</P>
        <P>This Notice supplements our Privacy Policy and Terms of Service and describes your rights as a California resident under the CCPA/CPRA (California Civil Code § 1798.100 et seq.), how we collect, use, and disclose your personal information, and how to exercise your rights.</P>
        <P>This Notice applies to personal information we collect online and offline in the context of our consumer Platform. It does not apply to information collected in the context of employment.</P>
      </>
    ),
  },
  {
    id: 'categories',
    label: '2. Categories We Collect',
    title: '2. Categories of Personal Information We Collect',
    content: (
      <>
        <P>In the preceding 12 months, we have collected the following categories of personal information from California consumers, as defined under California Civil Code § 1798.140:</P>
        <Table
          headers={['Category', 'Examples Collected by PeptideAI', 'Collected?']}
          rows={[
            ['A. Identifiers', 'Name, email address, username, IP address, device ID, account ID', 'Yes'],
            ['B. Customer Records (Cal. Civ. Code § 1798.80)', 'Name, email, payment billing address, profile fields provided at registration', 'Yes'],
            ['C. Protected Classification Characteristics', 'Age (18+ verification)', 'Yes'],
            ['D. Commercial Information', 'Subscription tier, purchase history, billing records', 'Yes'],
            ['E. Biometric Information', 'Not collected', 'No'],
            ['F. Internet / Network Activity', 'Pages visited, AI queries, feature usage, click patterns, session duration, search terms within Platform', 'Yes'],
            ['G. Geolocation Data', 'General geographic location inferred from IP address', 'Yes'],
            ['H. Sensory Data', 'Not collected', 'No'],
            ['I. Professional / Employment Info', 'Not collected unless voluntarily provided in profile', 'No'],
            ['J. Education Information', 'Not collected', 'No'],
            ['K. Inferences', 'User interest profiles, behavioral patterns derived from usage data', 'Yes'],
            ['L. Sensitive Personal Information (CPRA)', 'Account access credentials (username and password, stored encrypted/hashed); precise payment card data (handled by processor only)', 'Yes'],
          ]}
        />
        <P><strong>2.1 Sources of Personal Information</strong></P>
        <UL items={[
          'Directly from you — when you register, complete your profile, submit consulting queries, make a purchase, or contact us for support.',
          'Automatically from your device — through cookies, SDKs, analytics technologies, and server logs when you use the Platform.',
          'From social login providers — if you sign in via Google or another third-party provider, we receive basic profile information from that service.',
          'From analytics and advertising partners — data about your interactions with our marketing materials.',
        ]} />
      </>
    ),
  },
  {
    id: 'purposes',
    label: '3. Business Purposes',
    title: '3. Business or Commercial Purposes for Collection',
    content: (
      <>
        <P>We collect the categories of personal information identified in Section 2 for the following business and commercial purposes:</P>
        <UL items={[
          'Platform Operations: To create and manage your account, authenticate your identity, provide core Platform features, process subscription payments, and provide customer support.',
          'AI Personalization & Model Improvement: To power our AI consulting engine, generate educational outputs tailored to your queries, and train, test, evaluate, and improve our artificial intelligence models.',
          'Research & Product Development: To conduct internal research, analyze usage trends, and develop new Platform features and educational content.',
          'Analytics & Business Intelligence: To understand how users interact with the Platform, measure performance, and optimize our business operations.',
          "Commercial Data Activities: To aggregate, de-identify, package, and monetize data for commercial purposes as described in Section 5. This is a core element of PeptideAI's business model.",
          'Marketing & Communications: To send promotional content and product updates where you have opted in or where permitted by applicable law, and to deliver targeted advertisements.',
          'Legal Compliance & Safety: To comply with applicable laws, enforce our Terms of Service, prevent fraud, and protect rights, property, and safety.',
        ]} />
      </>
    ),
  },
  {
    id: 'retention',
    label: '4. Retention',
    title: '4. Retention of Personal Information',
    content: (
      <>
        <P>We retain your personal information for as long as your account is active, as necessary to provide the Platform to you, and as required or permitted by applicable law. Specific retention practices include:</P>
        <UL items={[
          'Active account data is retained for the duration of your account plus a reasonable wind-down period following deletion or termination.',
          'Anonymized and aggregated data derived from your personal information may be retained indefinitely and is not subject to deletion requests, as it is no longer personal information.',
          'Backup and archival copies of deleted data may persist for up to 90 days following deletion from active systems.',
          "Data that has been sold or shared with third-party commercial partners prior to your deletion request is subject to those partners' own retention practices. We cannot guarantee or compel deletion from third-party systems.",
          'We may retain certain information beyond these periods as required by law, for fraud prevention, to resolve disputes, or to enforce our agreements.',
        ]} />
      </>
    ),
  },
  {
    id: 'disclosure',
    label: '5. Disclosure, Sale & Sharing',
    title: '5. Disclosure, Sale & Sharing of Personal Information',
    content: (
      <>
        <Warn>⚠ IMPORTANT DISCLOSURE: WE SELL AND SHARE YOUR PERSONAL INFORMATION. PeptideAI engages in the sale and sharing of personal information as those terms are defined under the CCPA/CPRA. This is a core part of our business model. California residents have the right to opt out. See Section 7 for how to exercise this right.</Warn>
        <P><strong>5.1 Disclosures to Service Providers.</strong> We disclose personal information to third-party service providers who assist us in operating the Platform. These disclosures are for business purposes only, and service providers are contractually obligated to use your information only as directed by us. Service provider categories include:</P>
        <UL items={[
          'Cloud infrastructure and hosting providers',
          'Payment processors (payment card data is handled exclusively by our processor and is not stored by PeptideAI)',
          'Customer support and help desk platforms',
          'Email and communications platforms',
          'Analytics and performance monitoring services',
          'Security and fraud prevention vendors',
        ]} />
        <P><strong>5.2 Sale and Sharing with Commercial & Research Data Partners.</strong> PeptideAI sells, licenses, transfers, and otherwise shares personal information — including consulting interaction data and behavioral data — with third-party commercial and research partners.</P>
        <Table
          headers={['Category of Personal Information', 'Categories of Third-Party Recipients', 'Purpose']}
          rows={[
            ['Identifiers (name, email, device ID, IP)', 'Analytics providers, advertising technology platforms, marketing data companies', 'Analytics, targeted advertising, data monetization'],
            ['Consulting interaction data (AI queries, research topics)', 'Pharmaceutical companies, biotechnology firms, academic research institutions', 'Research, product development, market analysis'],
            ['Internet / network activity (feature usage, click patterns)', 'Advertising technology platforms, analytics providers, commercial data partners', 'Behavioral analytics, targeted advertising, data monetization'],
            ['Geolocation data (IP-derived location)', 'Analytics providers, advertising platforms', 'Targeted advertising, market analytics'],
            ['Inferences (interest profiles, behavioral patterns)', 'Research institutions, commercial data partners, healthcare technology companies', 'Research, product development, commercial analytics'],
            ['Account & profile data', 'Commercial data partners, analytics providers', 'Market segmentation, research, product development'],
          ]}
        />
        <P><strong>5.3 Other Disclosures.</strong> We may also disclose your information in connection with business transfers, legal requirements, or with your explicit prior consent.</P>
      </>
    ),
  },
  {
    id: 'sensitive',
    label: '6. Sensitive Personal Information',
    title: '6. Sensitive Personal Information',
    content: (
      <>
        <P>Under the CPRA, certain categories of personal information are classified as "sensitive personal information" and receive enhanced protections. PeptideAI collects the following categories of sensitive personal information:</P>
        <Table
          headers={['Sensitive Category', 'Specific Data Elements Collected', 'How Used']}
          rows={[
            ['Account access credentials', 'Username and password (stored in encrypted/hashed form)', 'Account authentication only'],
            ['Precise payment information', 'Payment card data (handled exclusively by third-party payment processor — not stored by PeptideAI)', 'Payment processing only — not sold'],
          ]}
        />
        <P>You have the right to request that PeptideAI limit its use and disclosure of your sensitive personal information to uses that are necessary to provide the Platform to you. See Section 7.5 for how to exercise this right.</P>
      </>
    ),
  },
  {
    id: 'rights',
    label: '7. Your California Rights',
    title: '7. Your California Privacy Rights',
    content: (
      <>
        <P>As a California resident, you have the following rights under the CCPA/CPRA. These rights are subject to certain exceptions and verification requirements as described below.</P>
        <P><strong>7.1 Right to Know.</strong> You have the right to request that PeptideAI disclose to you: the categories of personal information we have collected about you; the categories of sources from which we collected your personal information; our business or commercial purpose for collecting, selling, or sharing your personal information; the categories of third parties to whom we disclose, sell, or share your personal information; and the specific pieces of personal information we have collected about you. You may submit a Right to Know request twice in any 12-month period.</P>
        <P><strong>7.2 Right to Delete.</strong> You have the right to request that PeptideAI delete personal information we have collected from you, subject to certain legal exceptions. Please note that data we have already sold or shared with third-party commercial partners prior to your deletion request may not be retrievable or deletable from those third parties' systems.</P>
        <P><strong>7.3 Right to Correct.</strong> You have the right to request that PeptideAI correct inaccurate personal information we maintain about you, taking into account the nature of the information and the purposes for which we process it.</P>
        <P><strong>7.4 Right to Opt Out of Sale and Sharing.</strong> You have the right to direct PeptideAI to not sell or share your personal information with third parties.</P>
        <OptOutBox />
        <P><strong>7.5 Right to Limit Use of Sensitive Personal Information.</strong> You have the right to request that PeptideAI limit its use of your sensitive personal information to uses that are necessary to perform the services you requested. To exercise this right, contact us at <a className="legal-link" href="mailto:legal@peptideai.co">legal@peptideai.co</a> with subject line: "CCPA Sensitive Data Limit Request."</P>
        <P><strong>7.6 Right to Non-Discrimination.</strong> PeptideAI will not discriminate against you for exercising any of your CCPA/CPRA rights. We will not deny you goods or services, charge you different prices or rates, provide a different level or quality of service, or suggest that you will receive a different price or quality of service because you exercised a right.</P>
      </>
    ),
  },
  {
    id: 'requests',
    label: '8. How to Submit a Request',
    title: '8. How to Submit a Privacy Rights Request',
    content: (
      <>
        <RequestBox />
        <P><strong>8.1 Verification.</strong> To protect your personal information, we must verify your identity before processing a request. The verification process may require you to: confirm your email address on file with PeptideAI; confirm your account username or registration details; or provide additional identifying information if required to match what we hold on file.</P>
        <P><strong>8.2 Authorized Agents.</strong> You may designate an authorized agent to make a CCPA request on your behalf. We will require written proof that the agent is authorized to act on your behalf (such as a signed permission form or power of attorney), and we may still contact you directly to verify your identity.</P>
      </>
    ),
  },
  {
    id: 'incentives',
    label: '9. Financial Incentives',
    title: '9. Financial Incentives',
    content: (
      <P>PeptideAI does not currently offer any financial incentive programs in exchange for the collection, retention, or sale of personal information. If we introduce such a program in the future, we will provide a separate notice describing the material terms of the program and your right to opt in or withdraw.</P>
    ),
  },
  {
    id: 'dnt',
    label: '10. Do Not Track',
    title: '10. Do Not Track',
    content: (
      <P>Your browser may offer a "Do Not Track" (DNT) setting. PeptideAI's Platform does not currently respond to DNT signals, as no uniform technical standard for responding to DNT has been established. We continue to collect and use information as described in this Notice regardless of DNT settings.</P>
    ),
  },
  {
    id: 'cookies',
    label: '11. Cookies & Tracking',
    title: '11. Cookies and Tracking Technologies',
    content: (
      <>
        <P>PeptideAI and its third-party partners use cookies, pixel tags, web beacons, SDKs, and similar tracking technologies on the Platform.</P>
        <Table
          headers={['Category', 'Purpose', 'Third Parties Involved']}
          rows={[
            ['Essential / Strictly Necessary', 'Session management, account authentication, core Platform functionality', 'None (first-party only)'],
            ['Analytics', 'Understanding how users interact with the Platform, measuring performance', 'Analytics service providers'],
            ['Personalization', 'Remembering your preferences and customizing your experience', 'First-party and select partners'],
            ['Advertising & Marketing', 'Delivering targeted advertisements, measuring ad performance, enabling retargeting', 'Advertising technology platforms, marketing data companies'],
            ['Data Partnerships', 'Certain third-party partners may place tracking technologies to collect data for their own purposes', 'Third-party commercial and research partners'],
          ]}
        />
      </>
    ),
  },
  {
    id: 'children',
    label: '12. Children',
    title: '12. Children',
    content: (
      <P>PeptideAI is intended for users who are 18 years of age or older. We do not knowingly collect personal information from anyone under the age of 18. If we discover that we have collected personal information from a person under 18, we will delete that information immediately. If you believe we have collected information from a minor, please contact us immediately at <a className="legal-link" href="mailto:legal@peptideai.co">legal@peptideai.co</a>.</P>
    ),
  },
  {
    id: 'changes',
    label: '13. Changes to This Notice',
    title: '13. Changes to This Notice',
    content: (
      <P>We may update this CCPA Notice from time to time to reflect changes in our data practices or applicable law. When we make material changes, we will notify you by posting the updated Notice on the Platform and updating the Effective Date. For significant changes, we will provide at least 30 days' advance notice by email or prominent in-app notification where required by law. Your continued use of the Platform after the effective date of any update constitutes your acceptance of the updated Notice.</P>
    ),
  },
  {
    id: 'contact',
    label: '14. Contact Us',
    title: '14. Contact & Data Controller Information',
    content: (
      <>
        <P>For questions about this CCPA Notice or to exercise your California privacy rights, contact PeptideAI:</P>
        <Table
          headers={['Contact Type', 'Details']}
          rows={[
            ['Company', 'PeptideAI LLC'],
            ['Privacy & CCPA Inquiries', 'legal@peptideai.co'],
            ['Opt-Out of Sale/Sharing', 'legal@peptideai.co — Subject: "CCPA Opt-Out — Sale/Sharing"'],
            ['Right to Know / Delete / Correct', 'legal@peptideai.co — Subject: "CCPA [Right Name] Request"'],
            ['Sensitive Data Limit Request', 'legal@peptideai.co — Subject: "CCPA Sensitive Data Limit Request"'],
            ['Nevada Privacy Opt-Out', 'legal@peptideai.co — Subject: "Nevada Privacy Opt-Out"'],
            ['Website', 'www.peptideai.co'],
            ['In-App Privacy Portal', 'Account Settings > Privacy Rights'],
            ['Response Time', 'Acknowledgment within 10 business days; response within 45 calendar days'],
          ]}
        />
      </>
    ),
  },
];

export default function CCPA() {
  return (
    <LegalPage
      title="CCPA Notice"
      subtitle="California Consumer Privacy Act (CCPA) Notice, as amended by the California Privacy Rights Act (CPRA)."
      effectiveDate="March 8, 2026"
      sections={sections}
    />
  );
}
