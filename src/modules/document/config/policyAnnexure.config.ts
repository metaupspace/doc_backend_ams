export type PolicyAnnexureBlock = {
  text: string;
  indent?: number;
  size?: number;
  lineGap?: number;
  paragraphSpacing?: number;
  signatureBlock?: {
    left?: {
      signatureLabel?: string;
      signatureImageUrl?: string;
      name?: string;
      title?: string;
      date?: string;
    };
    right?: {
      signatureLabel?: string;
      signatureImageUrl?: string;
      name?: string;
      title?: string;
      date?: string;
    };
  };
  table?: {
    headers?: string[];
    rows?: Array<
      | {
          type: 'section';
          label: string;
        }
      | {
          type: 'data';
          cells: string[];
          bold?: boolean;
          fill?: boolean;
        }
    >;
  };
};

export type PolicyAnnexure = {
  annexureId: string;
  title: string;
  blocks: PolicyAnnexureBlock[];
};

export const POLICY_ANNEXURE_A_DEFAULT: PolicyAnnexure = {
  annexureId: 'A',
  title: 'Employment Policies',
  blocks: [
    {
      text: '<strong>1. Introduction:</strong> This annexure details the general employment policies governing your relationship with the Company. Compliance with these policies is mandatory for all employees.',
    },
    {
      text: '<strong>2. Posting and Transfer:</strong> The Company reserves the right to assign, post, or transfer employees to different roles, departments, projects, or work locations (including other cities or countries) based on operational needs, business requirements, and employee skill sets. Such changes will be communicated in advance. This is a standard practice allowing the company flexibility in resource allocation.',
    },
    {
      text: '<strong>3. Probation</strong>',
    },
    {
      text: '<strong>a. What it is:</strong> Your first few months with us are a probationary period (the exact duration, typically 3-6 months, is in your offer letter). This is a time for both you and the company to make sure we are a good fit for each other. We will look at your performance, how you fit into our team, and your overall potential.',

    },
    {
      text: '<strong>b. Confirmation:</strong> If everything goes well, we will send you a written confirmation at the end of the period, and you will officially be a permanent employee.',
      indent: 12,
    },
    {
      text: '<strong>c. Extension:</strong> In some cases, we might extend the probation period if we feel we need a little more time to assess your performance. We will always discuss this with you first.',
      indent: 12,


    },
    {
      text: '<strong>d. Leaving During Probation:</strong> If things do not work out, either you or the company can end your employment by providing the notice period stated in your contract i.e. 30 days. If you leave without giving notice, we may need to deduct the equivalent salary from your final payment. This aligns with common practices under Indian employment law for probationary periods.',
      indent: 12,
    },
    {
      text: '<strong>4. Working Shifts and Hours</strong>',
    },
    {
      text: '<strong>a. 24/7 Global Operations:</strong> The Company operates on a <strong>continuous, 24/7 basis, seven days a week</strong>, to support various project needs and global client requirements. Consequently, work schedules and "weekly offs" are managed at the project level rather than following a traditional calendar weekend.',
      indent: 12,
    },
    {
      text: '<strong>b. Standard Shift Timings:</strong> While specific project needs may dictate unique schedules, the Company\'s general standard working hours are:',
      indent: 12,
    },
    {
      text: '<strong>i. Day Shift:</strong> 11:00 AM to 9:00 PM IST & <strong>Night Shift:</strong> 11:00 PM to 9:00 AM IST',
      indent: 24,
    },
    {
      text: '<strong>ii. Breaks:</strong> Each shift includes a <strong>one-hour paid break</strong>.',
      indent: 24,
    },
    {
      text: '<strong>c. Rotational Weekly Offs:</strong> To ensure round-the-week coverage, every employee is entitled to <strong>one paid weekly off</strong>. The specific day for this off-period will vary by project team and is determined by the reporting or project manager. Your designated off-day may fall on any day of the week based on the agreed-upon team roster.',
      indent: 12,
    },
    {
      text: '<strong>d. Flexibility and Business Needs:</strong>',
      indent: 12,
    },
    {
      text: '<strong>i. Project-Specific Schedules:</strong> Operational requirements may necessitate shifts or schedules outside of the standard timings listed above. Your manager will communicate your specific assignment. Within your assigned shift, you are expected to manage your time to ensure task completion while remaining available for all critical meetings.',
      indent: 24,
    },
    {
      text: '<strong>ii. Policy Rights:</strong> The Company reserves the right to revise working hours and off-day schedules based on evolving business needs, with prior notice provided to affected employees.',
      indent: 24,
    },
    {
      text: '<strong>5. Attendance & Punctuality:</strong> In a round-the-clock operational model, punctuality is critical for seamless handovers and team collaboration. Consistent attendance and adherence to your assigned roster are essential job requirements. Any deviation from your schedule requires prior approval from your reporting manager.',
    },
    {
      text: '<strong>6. Employment Type:</strong> Your employment will be on one of the following bases, as specified in your offer letter:',
    },
    {
      text: '<strong>a. Full-time:</strong> Engaged for standard working hours on an ongoing basis post-probation.',
      indent: 12,
    },
    {
      text: '<strong>b. Part-time:</strong> Engaged for fewer than standard working hours, with specific terms defined in your employment agreement.',
      indent: 12,
    },
    {
      text: '<strong>c. Contractual/Fixed-Term:</strong> Engaged for a predetermined duration or specific project, governed by the terms of the specific contract.',
      indent: 12,
    },
    {
      text: '<strong>d. Internship:</strong> A temporary position offered primarily for learning and development purposes, with terms and duration defined in the internship agreement.',
      indent: 12,
    },
    {
      text: '<strong>7. Responsibilities & Duties</strong>',
    },
    {
      text: '<strong>a. Performance:</strong> You are expected to perform your assigned duties diligently, ethically, competently, and to the best of your abilities.',
      indent: 12,
    },
    {
      text: '<strong>b. Scope:</strong> Your job description gives you a good idea of your main duties, but we may sometimes ask you to take on other tasks to help the business. We believe in being flexible and working together as a team.',
      indent: 12,
    },
    {
      text: '<strong>c. Compliance:</strong> We trust you to do your job to the best of your ability, with honesty and integrity. We also expect you to follow all company policies and the law.',
      indent: 12,
    },
    {
      text: '<strong>8. Past Records & Verification</strong>',
    },
    {
      text: '<strong>a. Accuracy:</strong> Information provided during recruitment (qualifications, experience, references) must be accurate and truthful.',
      indent: 12,
    },
    {
      text: '<strong>b. Consequences:</strong> The Company reserves the right to conduct background verification. Discovery of any misrepresentation, falsification, or omission of material facts can lead to disciplinary actions, including immediate termination of employment, regardless of the time elapsed.',
      indent: 12,
    },
    {
      text: '<strong>9. Resignation (Voluntary Separation):</strong> This section applies when an employee chooses to end their employment with MetaUpSpace.',
    },
    {
      text: '<strong>a. Formal Notice Requirement:</strong> Employees who wish to resign are required to provide formal written notice to the company. The specific notice period is stipulated in your individual employment contract i.e. 90 days.',
      indent: 12,
    },
    {
      text: '<strong>b. Purpose of the Notice Period:</strong> This period is critical for the business. It allows for a comprehensive handover of duties, completion of pending tasks, and a smooth transfer of knowledge to colleagues or a successor, thereby ensuring operational continuity.',
      indent: 12,
    },
    {
      text: '<strong>c. Responsibilities During Notice Period:</strong> During this time, you are expected to continue performing your duties diligently, cooperate fully in the knowledge transfer process, and complete all exit formalities, including the return of all company property.',
      indent: 12,
    },
    {
      text: '<strong>d. Consequences of Unserved Notice Period:</strong> Should an employee depart MetaUpSpace during probation without serving the requisite notice or negotiating a buyout, the organization is legally permitted to deduct salary in lieu of notice from the final settlement. This recovery is viewed as a pre-defined contractual remedy for breach of contract. However, under Section 18 of the Code on Wages, such deductions are strictly capped. The cumulative total of all deductions including notice pay, loan recoveries, and damages cannot exceed 50% of the wages payable for that wage period. If the recovery amount exceeds this ceiling, MetaUpSpace must recover the balance through separate legal means or installments.',
      indent: 12,
    },
    {
      text: '<strong>e. Notice Period Buyout:</strong> In the event of an early exit, the notice period serves as a buffer to facilitate a professional handover. However, circumstances such as an immediate opportunity elsewhere or a significant performance gap may lead to a request for a "Notice Period Buyout". Upon submission of resignation, an employee may request an early release via a Notice Period Buyout. The acceptance of such a request is a privilege and remains at the sole discretion of MetaUpSpace management, contingent upon project stability and the successful completion of Knowledge Transfer. This amount may be paid directly to the company.',
      indent: 12,
    },
    {
      text: '<strong>10. Termination (Involuntary Separation):</strong> This section applies when the company initiates the end of the employment relationship. This can occur in two distinct forms:',
    },
    {
      text: '<strong>a. Termination for Cause:</strong> The company reserves the right to terminate employment immediately, without notice or payment in lieu thereof, for serious misconduct. Such causes include, but are not limited to:',
      indent: 12,
    },
    { text: '<strong>i.</strong> Gross misconduct (e.g., theft, fraud, harassment, insubordination).', indent: 40 },
    {
      text: '<strong>ii.</strong> A serious or persistent breach of company policies or employment terms.',
      indent: 24,
    },
    {
      text: '<strong>iii.</strong> Documented and persistent underperformance where improvement has not occurred despite support and warnings.',
      indent: 24,
    },
    { text: '<strong>iv.</strong> A significant breach of trust or dishonesty.', indent: 40 },
    {
      text: '<strong>v.</strong> Conviction for a criminal offense that impacts your ability to perform your duties.',
      indent: 24,
    },
    {
      text: '<strong>b. Termination Without Cause:</strong> In some circumstances, such as organizational restructuring, redundancy, or the elimination of a role, the company may need to terminate employment without cause. In these situations:',
      indent: 12,
    },
    {
      text: '<strong>i.</strong> The company will provide the full notice period as stipulated in the employment contract, or payment in lieu thereof.',
      indent: 24,
    },
    {
      text: '<strong>ii.</strong> We are committed to handling such separations with sensitivity, respect, and in full compliance with all legal requirements.',
      indent: 24,
    },
    {
      text: '<strong>11. Early Exit (Separation During Probation):</strong> This section applies specifically to the separation of employment during the initial probationary period.',
    },
    {
      text: '<strong>a. Mutual Evaluation:</strong> The probationary period is designed for both the employee and the company to assess mutual compatibility and suitability for the role.',
      indent: 12,
    },
    {
      text: '<strong>b. Notice Period:</strong> During this period, the employment relationship can be ended by either the employee or the company by providing the shorter notice period specified in the employment contract.',
      indent: 12,
    },
    {
      text: '<strong>c. Process:</strong> The principles of professionalism and cooperation in the handover process are expected, even during this shorter period.',
      indent: 12,
    },
    {
      text: '<strong>d. Consequences of Unserved Notice:</strong> Should an employee leave during probation without serving the required notice, the company may deduct salary in lieu of the notice period from the final settlement, subject to statutory limitations.',
      indent: 12,
    },
    {
      text: '<strong>12. Final Settlement and Deductions</strong>',
    },
    {
      text: '<strong>a. Commitment to Fair and Lawful Practices:</strong> MetaUpSpace is committed to ensuring that all final settlements are processed accurately and in strict compliance with the Payment of Wages Act and other applicable laws. Total deductions from any wage period will not exceed the statutory limits.',
      indent: 12,
    },
    {
      text: '<strong>b. Protection of Statutory Dues:</strong> We want to be very clear: statutory entitlements such as Gratuity and Leave Encashment are your vested rights. These are protected under law and will not be withheld as a penalty for an unserved notice period or other contractual breaches, except under specific circumstances explicitly permitted by statute.',
      indent: 12,
    },
    {
      text: '<strong>c. Permissible Deductions:</strong> Deductions from a final settlement are restricted to legally permissible items, which may include:',
      indent: 12,
    },
    { text: '1. Salary in lieu of an unserved notice period.', indent: 40 },
    { text: '2. Proven costs associated with a valid and enforceable Employment Bond.', indent: 40 },
    {
      text: '3. The cost of damage to or loss of company property due to negligence / misconduct by the employee.',
      indent: 24,
    },
    { text: '4. Authorized and outstanding loan recoveries.', indent: 40 },
    {
      text: '<strong>13. Breach of Contract and Recovery of Damages</strong>',
    },
    {
      text: '<strong>a. A Mutual Commitment:</strong> Our employment contract is a two-way agreement built on trust and mutual respect. If a breach of this agreement such as not serving as per your contract agreement, not serving your full notice period or failing to complete a proper handover results in a direct and provable financial loss for the company, we reserve the right to seek fair compensation.',
      indent: 12,
    },
    {
      text: '<strong>b. Transparency in Calculating Losses:</strong> Our goal is to recover genuine, documented costs, not to impose a penalty. Any claim would be based on a transparent calculation of actual losses, which could include:',
      indent: 12,
    },
    { text: '<strong>i.</strong> The direct costs of recruiting and training a replacement.', indent: 40 },
    {
      text: '<strong>ii.</strong> Measurable financial impacts, such as penalties from a client due to a project delay caused by an incomplete handover, additional resource costing required to meet the client commitments, etc.',
      indent: 24,
    },
    {
      text: '<strong>c. Resolution and Legal Recourse:</strong> We are committed to resolving these matters amicably through the standard exit process. Pursuing legal action is a final resort, reserved for situations where significant, documented loss has occurred and we have been unable to reach a fair resolution through direct discussion.',
      indent: 12,
    },
    {
      text: '<strong>14. Exit Formalities and Final Documentation</strong>',
    },
    {
      text: '<strong>a. Return of Company Property:</strong> On or before your last working day, you must return all company property, including laptops, access cards, mobile devices, and any other assets. The full and final settlement is contingent upon the successful return of all items.',
      indent: 12,
    },
    {
      text: '<strong>b. Issuance of Experience and Relieving Letters:</strong> The issuance of an Experience Letter and a Relieving Letter is the final step in a successfully concluded employment relationship. These documents serve as a formal record of your service and departure.',
      indent: 12,
    },
    {
      text: '<strong>c. Condition for Issuance:</strong> These letters are provided on the condition that the employee has completed all exit formalities in good faith. This includes:',
      indent: 12,
    },
    { text: '<strong>i.</strong> Serving the full / contractual notice period.', indent: 40 },
    { text: '<strong>ii.</strong> Completing a satisfactory and comprehensive knowledge transfer.', indent: 40 },
    { text: '<strong>iii.</strong> Returning all company property in good condition.', indent: 40 },
    { text: '<strong>iv.</strong> Settling any outstanding dues with the company.', indent: 40 },
    {
      text: '<strong>d. Withholding of Documents:</strong> In cases where an employee fails to meet these obligations such as through abandonment of employment, failure to serve the required notice period, or non-compliance with the exit process the company reserves the right to withhold the issuance of the Experience and Relieving Letters.',
      indent: 12,
    },
  ],
};

export const POLICY_ANNEXURE_B_DEFAULT: PolicyAnnexure = {
  annexureId: 'B',
  title: 'Performance Management & Your Growth',
  blocks: [
    {
      text: '<strong>1. Objective:</strong> Our performance management process is a structured partnership designed to support your professional growth and ensure your contributions are clearly recognized. This policy outlines the annual cycle, providing a transparent and quantifiable framework for setting goals, tracking progress, and evaluating performance.',
    },
    {
      text: '<strong>2. The Annual Performance Review Cycle:</strong> The performance cycle is a year-long process with defined formal checkpoints. Between these formal reviews, we operate on a principle of continuous, informal feedback, with Quarter 2 serving as a key period for focused execution.',
    },
    {
      text: '<strong>a. Step 1: Annual Goal Setting (Quarter 1: April - June)</strong>',
      indent: 12,
    },
    {
      text: '<strong>i. Action:</strong> At the start of each performance year, you will meet with your manager to collaboratively define <strong>Key Performance Objectives (KPOs)</strong> for the year ahead.',
      indent: 24,
    },
    {
      text: '<strong>ii. Standard:</strong> These KPOs will be based on the SMART framework (Specific, Measurable, Achievable, Relevant, Time-bound) to ensure absolute clarity on expectations.',
      indent: 24,
    },
    {
      text: '<strong>iii. Outcome:</strong> Your agreed-upon KPOs are formally documented in our performance management system, serving as your roadmap for the year.',
      indent: 24,
    },
    {
      text: '<strong>b. The Execution Quarter (Quarter 2: July - September)</strong>',
      indent: 12,
    },
    {
      text: '<strong>i.</strong> This quarter is dedicated to implementing the plans and working towards the KPOs set in Q1. While there is no formal, documented review during this period, continuous communication with your manager through regular one-on-one meetings is crucial for staying aligned and addressing challenges proactively.',
      indent: 24,
    },
    {
      text: '<strong>c. Mid-Year Performance Check-in (Quarter 3: October - December)</strong>',
      indent: 12,
    },
    {
      text: '<strong>i. Action:</strong> A formal, one-on-one mid-year review meeting will be scheduled with your manager.',
      indent: 24,
    },
    {
      text: '<strong>ii. Standard:</strong> This is a supportive checkpoint to review your progress against each of your KPOs, discuss any challenges, and make adjustments if business priorities have shifted.',
      indent: 24,
    },
    {
      text: '<strong>iii. Outcome:</strong> Following this meeting, a Mid-Year Performance Report will be shared with you. This report will outline your key achievements to date, areas identified for improvement, and the clarified expectations for the upcoming quarters.',
      indent: 24,
    },
    {
      text: '<strong>d. Year-End Performance Review (Quarter 4: January - March)</strong>',
      indent: 12,
    },
    {
      text: '<strong>i. Action:</strong> This is the formal evaluation phase, conducted in three parts:',
      indent: 24,
    },
    {
      text: '<strong>1. Self-Assessment:</strong> You will complete a self-assessment, rating your performance against each KPO.',
      indent: 36,
    },
    {
      text: '<strong>2. Manager\'s Assessment:</strong> Your manager will complete a parallel assessment of your performance.',
      indent: 36,
    },
    {
      text: '<strong>3. Final Review Meeting:</strong> You and your manager will meet to discuss both assessments and calibrate a final performance rating.',
      indent: 36,
    },
    {
      text: '<strong>ii. Outcome:</strong> Following the final review, a comprehensive Annual Performance Report will be circulated. This document will formally summarize your key achievements for the year, highlight areas for continued development, and outline the core expectations for the new performance cycle.',
      indent: 24,
    },
    {
      text: '<strong>3. Annual Appraisal & Impact</strong>',
    },
    {
      text: '<strong>a. Action:</strong> Your performance for the year is finalized with a rating on a <strong>5-point scale</strong> (e.g., 1-Needs Improvement to 5-Outstanding).',
      indent: 12,
    },
    {
      text: '<strong>b. Standard:</strong> This rating directly reflects your achievement against the KPOs set at the start of the year and overall performance throughout the year.',
      indent: 12,
    },
    {
      text: '<strong>c. Outcome:</strong> This final rating will serve as the foundation for your annual performance appraisal. The formal appraisal discussion and the communication of its outcomes including <strong>any revisions to your base salary and applicable bonuses will occur after the completion of one full year of full-time employment with the company.</strong> The same annual cycle will be followed thereafter, ensuring that rewards are fairly and transparently aligned with your performance over the preceding year.',
      indent: 12,
    },
  ],
};

export const POLICY_ANNEXURE_C_DEFAULT: PolicyAnnexure = {
  annexureId: 'C',
  title: 'Employee Bonus Policy',
  blocks: [
    {
      text: '<strong>1. Objective:</strong> When MetaUpSpace succeeds, we believe that success should be shared with the people who make it happen to you. This policy outlines our approach to bonuses, ensuring the process is fair, transparent, and rewards the hard work that drives our growth.',
    },
    {
      text: '<strong>2. Our Bonus Philosophy:</strong> Our bonus program is designed to do two things:',
    },
    {
      text: '<strong>a. Recognize Performance:</strong> To reward the outstanding contributions of individuals and teams.',
      indent: 12,
    },
    {
      text: '<strong>b. Share Success:</strong> To allow all employees to benefit from the company\'s overall prosperity.',
      indent: 12,
    },
    {
      text: '<strong>3. The Types of Bonuses We Offer:</strong> We have two primary types of bonuses:',
    },
    {
      text: '<strong>a. Annual Bonus:</strong> This is our company-wide bonus, typically paid out after the end of the financial year. It is directly linked to the company\'s overall performance and financial health. Think of it as our way of celebrating our collective success together.',
      indent: 12,
    },
    {
      text: '<strong>b. Discretionary Bonus:</strong> This bonus is for exceptional, "above-and-beyond" contributions. It is awarded at the discretion of management to recognize extraordinary efforts or achievements that have a significant impact on the business',
      indent: 12,
    },
    {
      text: '<strong>4. How Bonuses Are Determined:</strong> The size of the bonus pool and individual bonus amounts are determined by a blend of three key performance areas:',
    },
    {
      text: '<strong>a. Company Performance:</strong> The company\'s overall success, including achieving our financial targets and strategic goals, is the primary factor that determines the total bonus pool available.',
      indent: 12,
    },
    {
      text: '<strong>b. Team Performance:</strong> The collective achievements of your department or team against its specific goals.',
      indent: 12,
    },
    {
      text: '<strong>c. Individual Performance:</strong> Your personal contributions and achievements, as measured against the goals set during your performance review.',
      indent: 12,
    },
    {
      text: '<strong>5. Calculation and Payout:</strong>',
    },
    {
      text: '<strong>a. How it\'s Calculated:</strong> Your bonus is typically calculated as a percentage of your base salary. This percentage is determined by the three performance factors listed above. For employees who join part-way through the year, the bonus may be pro-rated based on their time with the company.',
      indent: 12,
    },
    {
      text: '<strong>b. Eligibility:</strong> To be eligible, you must be an employee in good standing at the time the bonus is paid out. Specific eligibility criteria will be communicated at the start of each bonus cycle.',
      indent: 12,
    },
    {
      text: '<strong>6. Bonus Cycle and Disbursement Timeline</strong>',
    },
    {
      text: 'To ensure business sustainability and accurate performance mapping, MetaUpSpace follows a structured annual cycle:',
    },
    {
      text: '<strong>a. Financial Year Period:</strong> The standard accounting year runs from April 1 to March 31.',
      indent: 12,
    },
    {
      text: '<strong>b. Announcement of Bonus:</strong> The organization will formally announce the annual bonus cycle following the closure of the financial year (typically in the April – June quarter).',
      indent: 12,
    },
    {
      text: '<strong>c. Defined Release Period:</strong> The specific quantum and individual eligibility details will be released over a 3 to 8-month or longer period following the initial announcement. This period allows for a deep-dive technical audit of project deliverables and performance metrics. The decision will be based on MetaUpSpace management',
      indent: 12,
    },
    {
      text: '<strong>d. Disbursement Method:</strong> Bonuses may be disbursed in monthly installments over the defined release window, as determined by the company\'s financial planning and strategic requirements.',
      indent: 12,
    },
  ],
};

export const POLICY_ANNEXURE_E_DEFAULT: PolicyAnnexure = {
  annexureId: 'E',
  title: 'Non-Disclosure Policies',
  blocks: [
    {
      text: '<strong>1. Purpose:</strong> This policy mandates the protection of the Company\'s sensitive information. Unauthorized disclosure can severely damage the Company\'s business, reputation, and competitive standing. Compliance is a fundamental condition of employment.',
    },
    {
      text: '<strong>2. Definition of Confidential Information:</strong>',
    },
    {
      text: '<strong>a. Confidential Information:</strong> means any non-public information related to the Company\'s business, operations, clients or technology, disclosed to or accessed by you during employment, regardless of format (oral, written, electronic, etc.). This includes, but is not limited to:',
      indent: 12,
    },
    {
      text: '<strong>i. Business Secrets:</strong> Business plans, financial data (revenue, costs, profits), customer/client lists and contracts, pricing strategies, marketing plans, supplier details, internal processes, employee data.',
      indent: 24,
    },
    {
      text: '<strong>ii. Technical Data:</strong> Software (source code, object code), algorithms, databases, hardware designs, formulas, inventions, R&D activities, technical specifications, know-how.',
      indent: 24,
    },
    {
      text: '<strong>iii. Intellectual Property (IP):</strong> As defined in Annexure [F], including unpublished works, patents, trademarks.',
      indent: 24,
    },
    {
      text: '<strong>iv. Third-Party Confidential Information:</strong> Information entrusted to the Company by clients or partners under confidentiality obligations.',
      indent: 24,
    },
    {
      text: '<strong>b. Exclusions:</strong> Information is NOT confidential if it:',
      indent: 12,
    },
    {
      text: '<strong>i.</strong> Is becomes public knowledge through no fault of yours;',
      indent: 24,
    },
    {
      text: '<strong>ii.</strong> Was lawfully known to you before joining the Company without confidentiality restrictions;',
      indent: 24,
    },
    {
      text: '<strong>iii.</strong> Is rightly received from a third party without confidentiality breach; or',
      indent: 24,
    },
    {
      text: '<strong>iv.</strong> Is independently developed by you without using Company Confidential Information (proof required).',
      indent: 24,
    },
    {
      text: '<strong>3. Employee Obligations:</strong>',
    },
    {
      text: '<strong>a. Strict Confidentiality:</strong> You must treat all Confidential Information with the utmost secrecy.',
      indent: 12,
    },
    {
      text: '<strong>b. Non-Disclosure:</strong> Do not disclose Confidential Information to anyone outside the Company, or to colleagues who do not have a legitimate "need-to-know" for their job duties, without explicit written authorization.',
      indent: 12,
    },
    {
      text: '<strong>c. Limited Use:</strong> Use Confidential Information only for performing your job responsibilities for the Company. Do not use it for personal benefit or for any third party.',
      indent: 12,
    },
    {
      text: '<strong>d. Due Care:</strong> Protect Confidential Information using reasonable security measures (e.g., secure passwords, locking screens, proper document handling, adhering to IT security policies) – at least the same level of care you\'d use for your own most sensitive information.',
      indent: 12,
    },
    {
      text: '<strong>e. Reporting Breaches:</strong> Immediately report any suspected or actual unauthorized disclosure or misuse of Confidential Information to your manager or designated authority.',
      indent: 12,
    },
    {
      text: '<strong>4. Duration of Obligation:</strong> Your duty to protect the Company\'s Confidential Information starts on your first day of employment and continues indefinitely, even after your employment with the Company ends for any reason.',
    },
    {
      text: '<strong>5. Legally Required Disclosures:</strong> If legally compelled (by law, court order, or government agency) to disclose Confidential Information, you must (where legally permitted):',
    },
    {
      text: '<strong>a. Promptly notify the Company before disclosure;</strong>',
      indent: 12,
    },
    {
      text: '<strong>b. Cooperate with the Company to limit the disclosure or obtain a protective order;</strong>',
      indent: 12,
    },
    {
      text: '<strong>c. and Disclose only the minimum information required.</strong>',
      indent: 12,
    },
    {
      text: '<strong>6. Return of Information:</strong> Upon termination of employment (or earlier if requested), you must immediately:',
    },
    {
      text: '<strong>a.</strong> Return all Company property, documents, files, and materials containing Confidential Information (in all formats, including copies); and',
      indent: 12,
    },
    {
      text: '<strong>b.</strong> Permanently delete all Company Confidential Information from personal devices, accounts, or storage. You may be required to certify compliance in writing.',
      indent: 12,
    },
    {
      text: '<strong>7. No Rights Granted:</strong> Access to Confidential Information does not grant you any ownership rights or licenses to it. All Confidential Information remains the sole property of the Company.',
    },
    {
      text: '<strong>8. Governing Law:</strong> This policy is governed by the laws of India. Disputes shall be subject to the jurisdiction of courts in <strong>Mumbai, Maharashtra, India</strong>. Breach may lead to legal action under contract law, common law (breach of confidence), and potentially the <strong>Information Technology Act, 2000</strong>.',
    },
  ],
};

export const POLICY_ANNEXURE_F_DEFAULT: PolicyAnnexure = {
  annexureId: 'F',
  title: 'IP & Data Confidentiality Policies',
  blocks: [
    {
      text: '<strong>1. Introduction:</strong> This policy specifically addresses the creation, ownership, and protection of Intellectual Property (IP) and sensitive Company Data, complementing Annexure[E].',
    },
    {
      text: '<strong>2. Definitions:</strong>',
    },
    {
      text: '<strong>a. Intellectual Property (IP):</strong> Includes all creations conceived or developed by you during your employment, related to the Company\'s business (actual or anticipated), or using Company resources. This covers inventions, software code, designs, databases, documentation, processes, trademarks, copyrighted material, etc. (Definition: IP refers to creations of the mind, such as inventions; literary and artistic works; designs; and symbols, names and images used in commerce).',
      indent: 12,
    },
    {
      text: '<strong>b. Company Data:</strong> All information processed, stored, or transmitted using Company systems or related to Company business, including client data, financial records, employee details, project files, etc.',
      indent: 12,
    },
    {
      text: '<strong>3. Ownership of Intellectual Property</strong>',
    },
    {
      text: '<strong>a. Company Ownership:</strong> All IP created by you within the scope of your employment (i.e., as part of your job duties, during work hours, using Company resources, or related to Company business) is automatically the exclusive property of the Company from the moment of creation. This aligns with Indian law (e.g., Section 17 of the Copyright Act, 1957 regarding works made during employment).',
      indent: 12,
    },
    {
      text: '<strong>b. Assignment:</strong> You hereby assign all rights, titles, and interests in such IP to the Company.',
      indent: 12,
    },
    {
      text: '<strong>c. Cooperation:</strong> You agree to promptly disclose such IP to the Company and assist (at the Company\'s expense) in securing legal protections like patents or copyrights.',
      indent: 12,
    },
    {
      text: '<strong>4. Data Confidentiality and Security</strong>',
    },
    {
      text: '<strong>a. Utmost Care:</strong> Handle all Company Data with strict confidentiality and security.',
      indent: 12,
    },
    {
      text: '<strong>b. Access Control:</strong> Access Company Data only on a "need-to-know" basis required for your job. Do not attempt unauthorized access.',
      indent: 12,
    },
    {
      text: '<strong>c. Security Protocols:</strong> Strictly follow all Company IT security policies (passwords, data encryption, secure transfer, device security, acceptable use).',
      indent: 12,
    },
    {
      text: '<strong>d. Data Transfer:</strong> Do not copy, transfer, or store Company Data on personal devices or external media without explicit prior written authorization.',
      indent: 12,
    },
    {
      text: '<strong>e. Breach Reporting:</strong> Immediately report any suspected or actual <strong>data breach</strong> (unauthorized access, disclosure of data) or security incident to IT Security/Management.',
      indent: 12,
    },
    {
      text: '<strong>5. Use of Company Systems:</strong> Company IT resources (computers, network, email, internet) are primarily for business use. The Company reserves the right to monitor usage for security and compliance purposes, subject to applicable laws. Avoid storing excessive personal data on Company systems.',
    },
    {
      text: '<strong>6. Prevention of Misuse:</strong> Using Company IP or Data for personal gain, unauthorized sharing, or any purpose harmful to the Company is strictly prohibited. Sharing with external parties requires authorization and potentially an NDA.',
    },
  ],
};

export const POLICY_ANNEXURE_G_DEFAULT: PolicyAnnexure = {
  annexureId: 'G',
  title: 'Task Sheet, Overtime Policies and Knowledge Transfer (KT)',
  blocks: [
    {
      text: '<strong>Part 1: Task Sheet Policy</strong>',
    },
    {
      text: '<strong>1. Purpose:</strong> To maintain timely and accurate task records essential for project tracking, client billing, and operations. This is managed through the company\'s automated <strong>MetaUpSpace Attendance Management System (AMS) portal</strong>, which serves as the definitive record of work.',
    },
    {
      text: '<strong>2. Daily Attendance & Task Protocol</strong>',
    },
    {
      text: '<strong>a. Check-In Requirement:</strong> Employees must "Check In" via the AMS prior to commencing work. Upon check-in, employees must define a <strong>minimum of 1 and a maximum of 10 specific, well-described agendas</strong> for that session.',
      indent: 12,
    },
    {
      text: '<strong>b. Check-Out Requirement:</strong> Employees must "Check Out" whenever moving away from the system or ending a session. A <strong>maximum of 5 Check-Ins is permitted per working day</strong>.',
      indent: 12,
    },
    {
      text: '<strong>c. Proof of Work:</strong> It is mandatory to provide a descriptive remark and attach a <strong>valid Reference Link</strong> as evidence of work during check-out. Sessions closed without this documentation will be considered non-compliant.',
      indent: 12,
    },
    {
      text: '<strong>d. System Calibration:</strong> The AMS undergoes an automated daily reset at <strong>12:00 PM (Noon)</strong>. All active sessions are auto-checked out and automatically checked back in at 12:01 PM. Agendas carry forward automatically; no manual intervention is required.',
      indent: 12,
    },
    {
      text: '<strong>3. Digital Timesheet & Dashboard Monitoring</strong>',
    },
    {
      text: '<strong>a. Automated Record Keeping:</strong> There is no <strong>manual monthly submission process</strong>. The data on the AMS portal, including all login sessions, agendas, and proof of work, is the official timesheet.',
      indent: 12,
    },
    {
      text: '<strong>b. Self-Monitoring:</strong> The AMS Dashboard is the "Single Source of Truth." Employees are responsible for monitoring their shift timings, available leave balance, and week-offs. No manual reminders will be issued for data entry or shift adherence.',
      indent: 12,
    },
    {
      text: '<strong>4. Discrepancy Management & 24-Hour Resolution</strong>',
    },
    {
      text: '<strong>a. Immediate Resolution:</strong> In the event of attendance anomalies (forgotten check-ins, technical errors), employees must raise a request for <strong>Edit Session</strong>, <strong>Add Session</strong>, or <strong>Delete Session</strong> immediately.',
      indent: 12,
    },
    {
      text: '<strong>b. The 48-Hour Rule:</strong> Every discrepancy <strong>must be resolved and approved by the Manager within 48 hours</strong> of the occurrence.',
      indent: 12,
    },
    {
      text: '<strong>c. Escalation:</strong> If the Manager is unavailable, the employee is authorized to escalate the request to the HR Department within the same 48-hour window to ensure the record is corrected. No revisions or regularizations will be allowed once this window has passed.',
      indent: 12,
    },
    {
      text: '<strong>5. Accuracy and Integrity:</strong> All entries in the AMS must be truthful and accurate. Employees are fully responsible for any falsification or misrepresentation (e.g., providing invalid or unrelated links as proof of work). Such actions will be considered a breach of policy and may lead to strict disciplinary action.',
    },
    {
      text: '<strong>Part 2: Overtime (OT) Policy</strong>',
    },
    {
      text: '<strong>1. Purpose:</strong> This outlines procedures for authorized work performed beyond standard hours. <strong>Overtime (OT)</strong> refers to time worked beyond your scheduled daily/weekly hours on Company business.',
    },
    {
      text: '<strong>2. OT Culture Statement:</strong> MetaUpSpace encourages efficiency and prioritizes a <strong>no-OT work culture</strong>. Employees are expected to manage their deliverables within standard working hours. However, in cases where extended work hours become necessary due to project deadlines or business urgency, the Company may provide appropriate compensation or recognition at its discretion to acknowledge the additional effort.',
    },
    {
      text: '<strong>3. Eligibility:</strong> Eligibility for OT compensation applies to all full-time employees as defined by the Company.',
    },
    {
      text: '<strong>4. Mandatory Pre-Approval:</strong>',
    },
    {
      text: '<strong>a. ALL OT requires prior written approval</strong> (email/system request) from your reporting manager/project lead <strong>before</strong> the OT work begins. The request must state the reason and estimated duration.',
      indent: 12,
    },
    {
      text: '<strong>b. Unapproved OT will NOT be compensated.</strong>',
      indent: 12,
    },
    {
      text: '<strong>5. OT Limits:</strong> Standard OT is generally limited to 10 hours per week to support work-life balance. Exceptions require senior management approval based on critical business needs.',
    },
    {
      text: '<strong>6. Logging & Reporting:</strong> Accurately log all approved OT hours separately in the timesheet system. Submit monthly OT summaries with your task sheet.',
    },
    {
      text: '<strong>7. Excessive OT (Management Discretion):</strong> Compensation for pre-approved OT exceeding standard limits due to exceptional project needs will be determined by management on a case-by-case basis.',
    },
    {
      text: '<strong>8. Misuse:</strong> Claiming unworked hours, working unapproved OT, or falsifying OT records constitutes serious misconduct and will lead to disciplinary action, including potential termination.',
    },
    {
      text: '<strong>Part 3 Section: Knowledge Transfer (KT) Obligations</strong>',
    },
    {
      text: '<strong>1. Purpose of Knowledge Transfer:</strong>',
    },
    {
      text: '<strong>a.</strong> To ensure continuity of operations, preserve institutional knowledge, and minimize disruption during employee transitions, all departing employees are obligated to participate in a structured Knowledge Transfer (KT) process.',
      indent: 12,
    },
    {
      text: '<strong>b. KT Responsibilities:</strong> During their notice period, departing employees are responsible for:',
      indent: 12,
    },
    {
      text: '<strong>i.</strong> Updating all relevant task sheets, project documentation, and client records.',
      indent: 24,
    },
    {
      text: '<strong>ii.</strong> Systematically transferring critical information, ongoing project statuses, and essential expertise to their designated successor or team members.',
      indent: 24,
    },
    {
      text: '<strong>iii.</strong> Creating comprehensive handover documents, including process guides, access details, and key contacts.',
      indent: 24,
    },
    {
      text: '<strong>iv.</strong> Participating in handover meetings as required by their manager.',
      indent: 24,
    },
    {
      text: '<strong>2. Consequences of KT Failure:</strong>',
    },
    {
      text: '<strong>i.</strong> Failure to comply with these Knowledge Transfer obligations may lead to significant operational disruptions for MetaUpSpace LLP. While not directly linked to salary withholding beyond the notice period, if such failure results in quantifiable financial loss (e.g., project penalties, lost client revenue, or the necessity of hiring external consultants to fill critical knowledge gaps), MetaUpSpace LLP reserves the right to seek damages for breach of contractual KT obligations as per the "Breach of Contract and Recovery of Damages" section in the Employment Policies.',
      indent: 12,
    },
  ],
};

export const POLICY_ANNEXURE_H_DEFAULT: PolicyAnnexure = {
  annexureId: 'H',
  title: 'Leave(s) Policies',
  blocks: [
    { text: '<strong>1. Purpose:</strong> This policy details paid leave entitlements and procedures.' },
    {
      text: '<strong>2. Annual Paid Leave Entitlement (Calendar Year: Jan-Dec)</strong> <strong>(Pro-rated for mid-year joiners)</strong>',
    },
    {
      text: '<strong>a. Casual Leave (CL):</strong> 1 day/month. For short, unforeseen personal needs. Typically lapses if unused at year-end.',
      indent: 12,
    },
    {
      text: '<strong>b. Sick Leave (SL):</strong> 6 days/year. For personal illness/injury. Medical certificates may be required for >2 consecutive days.',
      indent: 12,
    },
    {
      text: '<strong>c. Weekly Off:</strong> Fixed weekly off (day to be decided based on team/department/project requirements)',
      indent: 12,
    },
    {
      text: '<strong>d. Carry Forward Rule:</strong> Can be carried forward up to 6 days; excess may lapse.',
      indent: 12,
    },
    { text: '<strong>3. Application Procedure</strong>' },
    {
      text: '<strong>a. Minimum Advance Notice:</strong> At least 7 days\' notice is required for any planned leave, subject to manager review and operational needs.',
      indent: 12,
    },
    {
      text: '<strong>b. Apply via:</strong> Designated HR portal /Email to reporting/project manager & HR.',
      indent: 12,
    },
    {
      text: '<strong>i. Casual Leave:</strong> Should be applied in advance, preferably 2 days in advance. As soon as possible, preferably at least 1-2 days prior.',
      indent: 24,
    },
    {
      text: '<strong>ii. Sick Leave:</strong> Inform the manager as soon as possible on the first day of absence. A formal application can be submitted upon return, or earlier as applicable.',
      indent: 24,
    },
    {
      text: '<strong>c. Approval:</strong> All leaves are subject to manager review and approval. Unauthorized absence may result in loss of pay and potential disciplinary action.',
      indent: 12,
    },
    { text: '<strong>d. Leave Calculation & Conditions</strong>', indent: 12 },
    {
      text: '<strong>i. Leave balance</strong> is tracked by HR. Taking leave beyond accrued balance results in loss of pay.',
      indent: 24,
    },
    {
      text: '<strong>ii. Combining</strong> leave types or prefixing/suffixing with holidays requires manager approval.',
      indent: 24,
    },
    {
      text: '<strong>e. Leave Encashment:</strong> Encashment is allowed only at final settlement. Calculation is based on basic salary.',
      indent: 12,
    },
    {
      text: '<strong>f. Exceptions:</strong> For extended medical leave or emergencies, contact HR to discuss options as per Company policy and applicable laws.',
      indent: 12,
    },
  ],
};

export const POLICY_ANNEXURE_I_DEFAULT: PolicyAnnexure = {
  annexureId: 'I',
  title: 'Allowances and Reimbursement Policies',
  blocks: [
    {
      text: '<strong>1. Purpose:</strong> This policy governs reimbursement for specific official expenses. <strong>Reimbursement</strong> means repayment by the Company for approved expenses incurred by you for business purposes.',
    },
    { text: '<strong>2. Travel & Daily Allowances (T & DA):</strong>' },
    {
      text: '<strong>a. Eligibility:</strong> For pre-approved official travel outside your regular work location.',
      indent: 12,
    },
    {
      text: '<strong>b. Approval:</strong> Mode of travel, accommodation, and estimated expenses must be pre-approved by your manager.',
      indent: 12,
    },
    {
      text: '<strong>c. Limits:</strong> Specific allowances (transport, meals, lodging, incidentals-often termed <strong>Daily Allowance or DA</strong>) depend on travel location, duration, and grade, as communicated during approval. Expenses must be reasonable and necessary.',
      indent: 12,
    },
    {
      text: '<strong>d. Process:</strong> Submit claims with itemized bills through the designated system / portal.',
      indent: 12,
    },
    { text: '<strong>3. General Conditions:</strong>' },
    {
      text: '<strong>a. Only</strong> actual, necessary, and approved business expenses are reimbursable.',
      indent: 12,
    },
    {
      text: '<strong>b. Claims</strong> without required proof, approval, or exceeding limits will be rejected. Personal expenses are not reimbursable.',
      indent: 12,
    },
    {
      text: '<strong>4. Misuse:</strong> Submitting false or inflated claims is fraud and grounds for immediate termination and potential legal action to recover funds.',
    },
  ],
};

export const POLICY_ANNEXURE_J_DEFAULT: PolicyAnnexure = {
  annexureId: 'J',
  title: 'Prevention of Sexual Harassment (POSH) Policy',
  blocks: [
    {
      text: '<strong>1. Objective:</strong> The objective of this policy is to ensure a safe, respectful, and inclusive work environment for all employees, interns, contract staff, and stakeholders. It is framed in accordance with the provisions of the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 ("POSH Act") and its Rules.',
    },
    {
      text: '<strong>2. Scope:</strong> This policy applies to all employees of the Company, including permanent, temporary, contractual staff, interns, volunteers, and visitors across all workplaces, including branches, remote working environments, site visits, and official travel.',
    },
    { text: '<strong>3. Definitions:</strong>' },
    {
      text: '<strong>a. Sexual Harassment:</strong> Refers to any unwelcome behavior of a sexual nature, including verbal, non-verbal, or physical conduct that creates an intimidating, offensive, or hostile work environment.',
      indent: 12,
    },
    {
      text: '<strong>b. Employee:</strong> Includes any person working for the Company in any capacity, regardless of nature, mode, or terms of engagement.',
      indent: 12,
    },
    {
      text: '<strong>4. Policy Statement:</strong> The Company is committed to providing a safe and respectful work environment and maintains a <strong>zero-tolerance</strong> stance towards any form of sexual harassment. All employees are expected to adhere to the highest standards of behavior and respect for colleagues.',
    },
    {
      text: '<strong>5. Internal Committee (IC):</strong> The Company has constituted an Internal Committee (IC) in compliance with the POSH Act. The IC is responsible for:',
    },
    {
      text: '<strong>a.</strong> Receiving, reviewing, and addressing complaints related to sexual harassment.',
      indent: 12,
    },
    {
      text: '<strong>b.</strong> Ensuring a fair, impartial, and confidential inquiry process.',
      indent: 12,
    },
    {
      text: '<strong>c.</strong> Making recommendations for action based on its findings.',
      indent: 12,
    },
    { text: '<strong>6. Complaint Redressal Process</strong>' },
    {
      text: '<strong>a.</strong> An aggrieved person may lodge a written complaint with the IC.',
      indent: 12,
    },
    {
      text: '<strong>b.</strong> The IC will acknowledge the complaint, review it, and initiate a thorough inquiry in accordance with the POSH Act.',
      indent: 12,
    },
    {
      text: '<strong>c.</strong> Upon completion, the IC will recommend necessary action to the Management.',
      indent: 12,
    },
    {
      text: '<strong>7. Confidentiality:</strong> All proceedings, documents, and information related to complaints will be treated with utmost confidentiality, except as required by applicable laws and regulations.',
    },
    {
      text: '<strong>8. Disciplinary Action:</strong> If an employee is found guilty of sexual harassment, appropriate disciplinary action will be taken, which may range from a warning to termination of services, as deemed fit by the Company.',
    },
    {
      text: '<strong>9. Awareness and Training:</strong> The Company will periodically organize awareness sessions, training, and communication programs to educate employees about their rights, responsibilities, and the Company\'s POSH Policy.',
    },
    {
      text: '<strong>10. Policy Review:</strong> This policy will be periodically reviewed and updated to ensure its effectiveness, relevancy, and compliance with applicable laws.',
    },
  ],
};

export const POLICY_ANNEXURE_K_DEFAULT: PolicyAnnexure = {
  annexureId: 'K',
  title: 'Audit and Internal Control',
  blocks: [
    {
      text: '<strong>1. Objective:</strong> Our commitment to excellence and integrity means we regularly review our own processes. This policy explains our approach to audits. Think of them as a regular "health check" for the company, designed to help us improve, stay secure, and operate with transparency.',
    },
    {
      text: '<strong>2. We conduct audits for three main reasons,</strong> all of which are focused on making the company stronger and more successful.',
    },
    {
      text: '<strong>a. To Ensure Integrity:</strong> To verify that our financial records are accurate and that we are complying with all legal and regulatory requirements.',
      indent: 12,
    },
    {
      text: '<strong>b. To Improve and Grow:</strong> To identify opportunities to work smarter, be more efficient, and strengthen our internal processes.',
      indent: 12,
    },
    {
      text: '<strong>c. To Protect the Company:</strong> To proactively find and fix risks to our data, our finances, and our reputation.',
      indent: 12,
    },
    {
      text: '<strong>3. The Annual Audit Timeline:</strong> To ensure a structured and predictable process, our key audits are scheduled at specific times throughout the year:',
    },
    {
      text: '<strong>a. Annual Financial Audit (April - May):</strong> Our primary external financial audit is conducted annually, with the main review period occurring in April and May, following the close of the financial year.',
      indent: 12,
    },
    {
      text: '<strong>b. Periodic Departmental Audits (July & January):</strong> Focused internal reviews of specific departments and processes, such as HR, Operations, and Timesheet accuracy, are scheduled during July and January. This allows for continuous improvement without disrupting major year-end activities.',
      indent: 12,
    },
    {
      text: '<strong>c. Annual IT & Security Audit (October):</strong> A comprehensive internal audit focusing on our IT systems, data security, and company-wide compliance is conducted every October to ensure our digital assets are secure.',
      indent: 12,
    },
    {
      text: '<strong>d. As-Needed Audits:</strong> In addition to our planned schedule, specific audits may be initiated at any time to respond to new regulations, address an identified risk, or review the implementation of a new system.',
      indent: 12,
    },
    {
      text: '<strong>4. Your (Employee) Role in an Audit:</strong> Your role is straightforward: <strong>cooperation</strong>. We expect all employees to provide accurate information, answer questions honestly, and assist auditors as needed. This transparency is crucial for the process to be effective and is a core part of your professional responsibility.',
    },
    {
      text: '<strong>5. How We Use Audit Findings:</strong> The outcome of an audit is always focused on positive action.',
    },
    {
      text: '<strong>a. For Company Improvement:</strong> The primary goal is to learn and get better. Most findings lead to the development of Corrective Action Plans (CAPs) designed to strengthen our processes, improve security, and enhance our overall efficiency.',
      indent: 12,
    },
    {
      text: '<strong>b. For Individual Accountability:</strong> Audits also ensure we all adhere to our shared standards of conduct. If a finding reveals individual misconduct, such as timesheet fraud or a serious policy violation, it will be addressed through our standard disciplinary process, which may include actions up to and including termination of employment.',
      indent: 12,
    },
  ],
};

export const POLICY_ANNEXURE_L_DEFAULT: PolicyAnnexure = {
  annexureId: 'L',
  title: 'Taxation Policy',
  blocks: [
    {
      text: '<strong>1. Applicability and Scope:</strong> This Taxation Policy outlines the statutory deductions applicable to employees of MetaUpSpace LLP in accordance with prevailing Indian laws and regulations. All salary payments and benefits forming part of an employee\'s remuneration shall be subject to such statutory deductions as mandated from time to time.',
    },
    { text: '<strong>2. Current Statutory Deductions:</strong>' },
    {
      text: '<strong>a.</strong> As of the effective date of this policy, Professional Tax (PT) is the only statutory deduction applicable to employees of the Company.',
      indent: 12,
    },
    {
      text: '<strong>b.</strong> Other statutory deductions, such as Provident Fund (PF), Employees\' State Insurance (ESI), or any other government-mandated contributions, are currently not applicable to the Company based on the prevailing legal eligibility criteria.',
      indent: 12,
    },
    {
      text: '<strong>3. Professional Tax (PT) - Maharashtra Compliance:</strong> Professional Tax is deducted in accordance with the provisions of the Maharashtra State Tax on Professions, Trades, Callings and Employments Act and the rules framed thereunder. The deduction is determined based on the employee\'s monthly gross salary and gender-specific applicability.',
    },
    { text: '<strong>a. Professional Tax - Male Employees</strong>', indent: 12 },
    { text: '<strong>Monthly Salary Range | Professional Tax Deduction</strong>', indent: 24 },
    { text: 'Up to Rs 7,500 | Nil', indent: 24 },
    { text: 'Rs 7,501 - Rs 10,000 | Rs 175 per month', indent: 24 },
    { text: 'Above Rs 10,000 | Rs 200 per month*', indent: 24 },
    { text: '<strong>b. Professional Tax - Female Employees</strong>', indent: 12 },
    { text: '<strong>Monthly Salary Range | Professional Tax Deduction</strong>', indent: 24 },
    { text: 'Up to Rs 25,000 | Nil', indent: 24 },
    { text: 'Above Rs 25,000 | Rs 200 per month*', indent: 24 },
    {
      text: '*In the month of February, the Professional Tax deduction shall be Rs 300 instead of Rs 200, to comply with the annual Professional Tax ceiling of Rs 2,500 as prescribed under Maharashtra law.',
    },
    { text: '<strong>4. Future Statutory Deductions:</strong>' },
    {
      text: 'In the event that any additional statutory deductions (including but not limited to Provident Fund, Employees\' State Insurance, Labour Welfare Fund, or any other statutory levy) become applicable to the Company in the future:',
      indent: 12,
    },
    {
      text: '- Such deductions shall be implemented strictly in compliance with applicable laws',
      indent: 24,
    },
    {
      text: '- Employees shall be informed in advance through formal communication',
      indent: 24,
    },
    {
      text: '- Revised salary structures or policy updates shall be issued, where applicable',
      indent: 24,
    },
    {
      text: '<strong>5. Policy Amendment:</strong> MetaUpSpace LLP reserves the right to modify, amend, or update this Taxation Policy at any time to ensure compliance with changes in statutory regulations or business requirements. Any such amendments shall be duly communicated to employees and shall form an integral part of the Company\'s employment policies.',
    },
  ],
};

export const POLICY_ANNEXURE_M_DEFAULT: PolicyAnnexure = {
  annexureId: 'M',
  title: 'Salary Structure',
  blocks: [
    {
      text: '<TABLE:SALARY_STRUCTURE>',
      table: {
        headers: ['Component', 'Monthly (INR)', 'Annual (INR)'],
        rows: [
          { type: 'section', label: 'Earnings:' },
          { type: 'data', cells: ['Basic', '12,000', '1,44,000'] },
          { type: 'data', cells: ['HRA', 'Nil', 'Nil'] },
          { type: 'data', cells: ['Conveyance', 'Nil', 'Nil'] },
          { type: 'data', cells: ['Other Allowance', 'Nil', 'Nil'] },
          { type: 'data', cells: ['Gross Salary (A)', '12,000', '1,44,000'], bold: true, fill: true },
          { type: 'section', label: 'Deductions:' },
          { type: 'data', cells: ['Provident Fund*', 'Nil', 'Nil'] },
          { type: 'data', cells: ['ESIC*', 'Nil', 'Nil'] },
          { type: 'data', cells: ['Professional Tax**', '200', '2,500'] },
          { type: 'data', cells: ['Net Take Home', '11,800', '1,41,500'], bold: true, fill: true },
          { type: 'section', label: 'Retirement Benefits:' },
          { type: 'data', cells: ['Provident Fund (Employer Contribution)*', 'Nil', 'Nil'] },
          { type: 'data', cells: ['ESIC (Employer Contribution)*', 'Nil', 'Nil'] },
          { type: 'data', cells: ['Gratuity', 'Nil', 'Nil'] },
          { type: 'data', cells: ['Total Retirement Benefits (B)', 'Nil', 'Nil'] },
          {
            type: 'data',
            cells: ['Total CTC (Cost to Company) (A+B)', '12,000', '1,44,000'],
            bold: true,
            fill: true,
          },
        ],
      },
    },
    {
      text: '<strong>Note:</strong>',
      paragraphSpacing: 12,
    },
    {
      text: '1. You will receive your salary and all other benefits forming part of your remuneration package subject to deduction of TDS, PF, ESI, and professional taxes, in accordance with applicable laws.',
      indent: 12,
    },
    {
      text: '2. Currently, PF deduction is not applicable as per the prevailing legal requirements for our company.',
      indent: 12,
    },
    {
      text: '<em>However, if PF deduction becomes applicable in the future, employees will be informed in advance, and a revised salary structure will be shared accordingly.</em>',
      indent: 24,
    },
  ],
};

export const POLICY_ANNEXURE_N_DEFAULT: PolicyAnnexure = {
  annexureId: 'N',
  title: 'Employee Acknowledgment and Agreement',
  blocks: [
    {
      text: '<strong>I, the undersigned employee, hereby acknowledge that:</strong>',
    },
    {
      text: '1. I have received, read, and fully understood all the policies and terms outlined in this document, comprising Annexures [A] through [M] (Employment Policies, Performance Management & Your Growth, Employee Bonus Policy, Employment Bond Policies, Non-Disclosure Policies, IP & Data Confidentiality Policies, Task Sheet, Knowledge Transfer (KT) and Overtime Policies, Leave(s) Policies, and Allowances and Reimbursement Policies, Prevention of Sexual Harassment (POSH) Policy, Taxation Policy, and Salary Structure).',
      indent: 12,
    },
    {
      text: '2. I have had the opportunity to ask questions regarding these policies and have received satisfactory answers.',
      indent: 12,
    },
    {
      text: '3. I understand that these policies form an integral part of my employment agreement with MetaUpSpace. I agree to abide by all the terms, conditions, rules, and regulations stipulated in these policies throughout my employment with the Company.',
      indent: 12,
    },
    {
      text: '4. I understand that failure to comply with these policies may lead to disciplinary action, up to and including termination of my employment, and may also result in legal action where applicable.',
      indent: 12,
    },
    {
      text: '5. I acknowledge the Company\'s right to amend these policies from time to time, and I agree to be bound by such amendments upon notification.',
      indent: 12,
    },
    {
      text: '<ACK_SIGNATURE_BLOCK>',
      signatureBlock: {
        left: {
          signatureLabel: 'Signature:',
          signatureImageUrl:
            'https://res.cloudinary.com/dkstzpumx/image/upload/q_auto/f_auto/v1775112240/sign_1_rzfa4e.jpg',
          name: 'Mr. Sahil Jaiswal',
          title: 'Chief Executive Officer, MetaUpSpace LLP',
          date: '',
        },
        right: {
          signatureLabel: 'Signature:',
          signatureImageUrl:
            'https://res.cloudinary.com/dkstzpumx/image/upload/q_auto/f_auto/v1775112240/sign_1_rzfa4e.jpg',
          name: '',
          title: '',
          date: '',
        },
      },
    },
  ],
};

export const POLICY_ANNEXURE_DEFAULT_PAYLOAD = {
  title: 'Policy Annexures',
  annexures: [
    POLICY_ANNEXURE_A_DEFAULT,
    POLICY_ANNEXURE_B_DEFAULT,
    POLICY_ANNEXURE_C_DEFAULT,
    POLICY_ANNEXURE_E_DEFAULT,
    POLICY_ANNEXURE_F_DEFAULT,
    POLICY_ANNEXURE_G_DEFAULT,
    POLICY_ANNEXURE_H_DEFAULT,
    POLICY_ANNEXURE_I_DEFAULT,
    POLICY_ANNEXURE_J_DEFAULT,
    POLICY_ANNEXURE_K_DEFAULT,
    POLICY_ANNEXURE_L_DEFAULT,
    POLICY_ANNEXURE_M_DEFAULT,
    POLICY_ANNEXURE_N_DEFAULT,
  ],
};
