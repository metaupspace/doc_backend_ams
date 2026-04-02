import {
  CONTRACTUAL_LETTER_DEFAULT_PARAGRAPHS,
  CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
  INTERNSHIP_OFFER_LETTER_DEFAULT_PARAGRAPHS,
  INTERNSHIP_TO_FULL_TIME_LETTER_DEFAULT_PARAGRAPHS,
  JOINING_LETTER_DEFAULT_PARAGRAPHS,
  PROBATION_COMPLETION_LETTER_DEFAULT_PARAGRAPHS,
  RELIEVING_LETTER_DEFAULT_PARAGRAPHS,
  RESIGNATION_ACCEPTANCE_LETTER_DEFAULT_PARAGRAPHS,
  TERMINATION_LETTER_DEFAULT_PARAGRAPHS,
  WARNING_DISCIPLINARY_LETTER_DEFAULT_PARAGRAPHS,
  WARNING_LETTER_DEFAULT_PARAGRAPHS,
  PROBATION_OFFER_LETTER_DEFAULT_PARAGRAPHS,
  WORK_EXPERIENCE_LETTER_DEFAULT_PARAGRAPHS,
  DOCUMENT_SPECIFICATIONS,
} from '../../../modules/document/config/document.config.ts';

const appraisalExample = {
  payload: {
    employeeId: 'EMP-1001',
    employeeName: 'Ravi Kumar',
    paragraphs: [
      'We are pleased to inform you that based on your <strong>performance</strong> during the review period, your contribution has been appreciated and valued.',
      'As a result, the management has approved a revised compensation and recognizes your continued commitment to <em>excellence</em>.<br><br><u>Keep up the great work.</u>',
      'Please note that all other <strong>terms and conditions</strong> of your employment remain unchanged.<br><li>Consistent ownership</li><li>Strong team collaboration</li>',
    ],
    signatureUrl: 'https://res.cloudinary.com/dkstzpumx/image/upload/q_auto/f_auto/v1775112240/sign_1_rzfa4e.jpg',
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
  },
};

const contractualLetterExample = {
  payload: {
    employeeName: 'Ravi Kumar',
    jobTitle: 'Senior Software Engineer',
    department: 'Engineering',
    reportingManager: 'Ananya Sharma',
    startDate: '2026-04-15',
    endDate: '2027-04-14',
    employmentType: 'Fixed-Term Contractual',
    introParagraph:
      'We are pleased to extend to you an offer for the position of Senior Software Engineer at MetaUpSpace LLP, under a fixed-term contractual arrangement. This engagement will commence on 2026-04-15 and will remain in effect until 2027-04-14, unless extended or terminated earlier in accordance with the terms outlined in the accompanying agreement.',
    salaryOrStipend: 'INR 12,00,000 per annum',
    workLocation: 'Remote',
    acceptanceDeadline: '2026-04-07',
    paragraphs: CONTRACTUAL_LETTER_DEFAULT_PARAGRAPHS,
    contactParagraph:
      'Should you have any questions or require further clarification, please feel free to reach out to us at hr@metaupspace.com.',
    signatureUrl: CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
  },
};

const letterOfIntentExample = {
  payload: {
    employeeId: 'HR-0001',
    employeeName: 'HR Admin',
    jobTitle: 'HR Admin',
    department: 'HR',
    employmentType: 'Full-Time',
    reportingManager: 'Sahil Jaiswal',
    expectedStartDate: '2026-04-15',
    workLocation: 'Remote',
    keyDetailsTitle: 'Please find below the indicative terms of this proposed engagement:',
    introParagraphs: [
      'We are pleased to express our intent to engage you as a member of the MetaUpSpace LLP team.',
      'Based on your past performance and our recent discussions, we believe you can make valuable contributions to our team and organizational goals.',
    ],
    paragraphs: [
      'At the time of on-boarding, you will be expected to review and formally acknowledge adherence to company\'s standard policies, including but not limited to the Confidentiality Agreement, Code of Conduct, and IT Usage Policy.',
      'We are excited about the possibility of you joining our team and look forward to a positive response. Should you have any questions or require further clarification, please feel free to reach us out at hr@metaupspace.com.',
    ],
    closingText: 'Warm regards,',
    signatureUrl: CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
  },
};

const probationOfferLetterExample = {
  payload: {
    employeeName: 'Employee Name',
    companyName: 'MetaUpSpace LLP',
    title: 'PROBATION- OFFER LETTER',
    issueDate: '2026-04-02',
    positionTitle: 'Position Name',
    jobTitle: 'Position Name',
    designation: 'Position Name',
    startDate: '{date}',
    probationPeriod: '{Duration}',
    reportingManager: 'Reporting Manager',
    monthlySalary: 'Rs 1,00,000',
    workLocation: 'Location',
    location: 'Location',
    employmentType: 'Full-Time',
    acceptanceDeadline: '19/01/2026',
    keyDetailsTitle: 'Below are the key details of your probationary appointment:',
    introParagraph:
      'We are pleased to offer you the position of Position Name at MetaUpSpace LLP, effective {date}, under a probationary appointment. This initial probation period will be for a duration of {Duration}, during which your performance, conduct, and suitability for the role will be closely reviewed.',
    paragraphs: PROBATION_OFFER_LETTER_DEFAULT_PARAGRAPHS,
    contactParagraph:
      'Should you have any questions or require further clarification, please feel free to reach out to us at hr@metaupspace.com.',
    closingText: 'Warm Regards,',
    signatureUrl: CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
  },
};

const internshipOfferLetterExample = {
  payload: {
    employeeName: 'Khushi Saini',
    positionTitle: 'Content Writer Intern',
    department: '[Department]',
    reportingManager: '[Reporting Manager]',
    internshipDuration: '6 Months',
    workSchedule: '6 days a week with Flexible Working Hours',
    workLocation: 'Hybrid (Initially WFO)',
    stipend: 'Rs. /Month',
    acceptanceDeadline: '09/07/2025',
    introParagraph:
      'We are pleased to extend to you an offer to join MetaUpSpace LLP as a Content Writer Intern. Following our recent discussions and your performance during the selection process, we believe you possess the qualities that align with the values and expectations of our organization.',
    keyDetailsTitle: 'Please find below the key details of your internship engagement:',
    paragraphs: [...INTERNSHIP_OFFER_LETTER_DEFAULT_PARAGRAPHS],
    contactParagraph:
      'Should you have any questions or require further clarification, please feel free to reach out to us at hr@metaupspace.com.',
    closingText: 'Sincerely,',
    signatureUrl: CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
  },
};

const probationCompletionLetterExample = {
  payload: {
    employeeId: 'HR-0001',
    employeeName: 'Aarav Sharma',
    companyName: 'MetaUpSpace LLP',
    title: 'PROBATION COMPLETION LETTER',
    issueDate: '2026-04-02',
    probationStartDate: '2025-07-01',
    probationEndDate: '2025-12-31',
    confirmationEffectiveDate: '2026-01-01',
    jobTitle: 'HR Admin',
    designation: 'HR Admin',
    department: 'HR',
    reportingManager: 'Sahil Jaiswal',
    workSchedule: 'Flexible Working Hours',
    workLocation: 'Remote',
    location: 'Remote',
    stipend: 'Rs 50,000 per month',
    expectedStartDate: '2026-01-01',
    keyDetailsTitle: 'Below are the key details of your employment confirmation:',
    introParagraph:
      "We are pleased to inform you that you have successfully completed your probationary period at MetaUpSpace LLP, which commenced on 2025-07-01 and concluded on 2025-12-31. Based on a thorough evaluation of your performance, conduct, and alignment with the role's expectations, we are satisfied with your contributions and professionalism during this period.",
    paragraphs: PROBATION_COMPLETION_LETTER_DEFAULT_PARAGRAPHS,
    closingText: 'Sincerely,',
    signatureUrl: CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
  },
};

const relievingLetterExample = {
  payload: {
    employeeId: 'EMP-1001',
    employeeName: '[Employee_Name]',
    employeeNo: '[EMP No ]',
    companyName: 'MetaUpSpace LLP',
    title: 'RELIEVING LETTER',
    issueDate: '[Date of Issuance]',
    greeting: 'To Whomsoever Concerned,',
    jobTitle: '[Job_Ttle]',
    department: '[Job_Department]',
    joiningDate: '[Joining_Date]',
    lastDay: '[Last_Day]',
    introParagraph:
      'We hereby certify that [Employee_Name], [EMP No ] was employed as a [Job_Ttle] in [Job_Department] with MetaUpSpace LLP starting from [Joining_Date] to [Last_Day].',
    paragraphs: RELIEVING_LETTER_DEFAULT_PARAGRAPHS,
    closingText: 'Sincerely,',
    signatureUrl: CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
    signatoryCompany: 'MetaUpSpace LLP',
  },
};

const terminationLetterExample = {
  payload: {
    employeeId: 'EMP-1001',
    employeeName: "Employee's Name",
    companyName: 'MetaUpSpace LLP',
    title: 'TERMINATION LETTER',
    issueDate: '[Date of Issuance]',
    greeting: "Dear Employee's Name,",
    lastWorkingDate: '[Last Working Date]',
    lastOfficialWorkingDate: '[Last official working date]',
    finalSettlementDays: 45,
    introParagraph:
      'This is to formally notify you that your employment with <strong>MetaUpSpace LLP</strong> will be terminated effective <strong>[Last Working Date]</strong>, in accordance with the terms outlined in your employment agreement and as per applicable laws.',
    paragraphs: TERMINATION_LETTER_DEFAULT_PARAGRAPHS,
    settlementIntro: 'You will be entitled to receive:',
    settlementItems: [
      'Salary up to your last working day i.e. <strong>[Last official working date]</strong>',
      'Any unpaid reimbursements or earned leave encashment (if applicable), in accordance with company policy.',
      'Full and final settlement within <strong>45 days</strong> of your last working date.',
    ],
    closingText: 'Warm regards,',
    signatureUrl: CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
    signatoryCompany: 'MetaUpSpace LLP',
  },
};

const warningLetterExample = {
  payload: {
    employeeId: 'EMP-1001',
    employeeName: "Employee's Name",
    companyName: 'MetaUpSpace LLP',
    title: 'FIRST WARNING LETTER',
    issueDate: '[Date of Issuance]',
    greeting: "Dear Employee's Name,",
    warningReason:
      'behaviour, performance, attendance, punctuality, breach of policy, etc',
    introParagraph:
      'This letter will confirm our discussion today during which you were advised that your recent (<strong>behaviour, performance, attendance, punctuality, breach of policy, etc</strong>) is not acceptable, specifically (briefly describe the specific elements of behaviour or performance that are unsatisfactory or in breach of policy). You were also advised that immediate improvement is required.',
    paragraphs: WARNING_LETTER_DEFAULT_PARAGRAPHS,
    closingText: 'Sincerely,',
    signatureUrl: CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
    signatoryCompany: 'MetaUpSpace LLP',
  },
};

const resignationAcceptanceLetterExample = {
  payload: {
    employeeId: 'EMP-1001',
    employeeName: "Candidate's name",
    companyName: 'MetaUpSpace LLP',
    title: 'RESIGNATION ACCEPTANCE LETTER',
    issueDate: '[Date of Issuance]',
    greeting: "Dear Candidate's name,",
    jobTitle: '[Job Title]',
    resignationDate: '[Insert Date]',
    resignationTime: '[Insert Time]',
    effectiveDate: '[Insert Effective Date]',
    introParagraph:
      'This letter formally acknowledges receipt of your resignation submitted on <strong>[Insert Date]</strong> at <strong>[Insert Time]</strong>, from your position as <strong>[Job Title]</strong> with <strong>MetaUpSpace LLP</strong>. As per your notice, your resignation will be effective from <strong>[Insert Effective Date]</strong>, which will also serve as your final working day with the organization.',
    paragraphs: RESIGNATION_ACCEPTANCE_LETTER_DEFAULT_PARAGRAPHS,
    closingText: 'Warm regards,',
    signatureUrl: CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
    signatoryCompany: 'MetaUpSpace LLP',
  },
};

const warningDisciplinaryLetterExample = {
  payload: {
    employeeId: 'EMP-1001',
    employeeName: "Employee's Name",
    companyName: 'MetaUpSpace LLP',
    title: 'WARNING AND DISCIPLINARY LETTER',
    issueDate: '12/10/2025',
    greeting: "Dear Employee's Name,",
    introParagraph:
      'This letter serves as a <strong>formal written warning</strong> regarding recent behavior that is not in accordance with the standards, policies, and values of <strong>MetaUpSpace LLP</strong>.',
    section1Title: '1. Description of Concern',
    section1Intro:
      'It has been observed that over the past [insert duration or dates], you have consistently failed to:',
    concernsList: [
      'Failure to join the virtual office during expected hours',
      'Lack of responsiveness and poor communication with the team',
      'Mark your attendance as per company protocol',
      'Negligence in completing assigned work',
    ],
    section1Outro:
      'This behavior is in direct violation of company policies, as outlined in the <strong><em>Annexure[A]</em></strong>.',
    section2Title: '2. Previous Actions Taken',
    section2Intro: 'Prior to this letter, the following steps were taken to address the concerns:',
    previousActionsList: [
      '[Insert Date]: Verbal reminder regarding communication and availability',
      '[Insert Date]: Advised via email/chat to be present and responsive during working hours',
    ],
    section2Outro:
      'Despite these measures, there has been insufficient or no improvement in your conduct.',
    section3Title: '3. Required Improvement and Expectations',
    section3Intro: 'You are expected to:',
    expectationsList: [
      'Be present in the virtual office consistently',
      'Communicate clearly and promptly',
      'Show responsibility in your assigned tasks',
    ],
    section3Outro:
      'This improvement must be <strong>immediate and sustained</strong>. Your conduct will be closely monitored over the next 30 days.',
    section4Title: '4. Consequences of Further Violation',
    section4Intro:
      'Failure to demonstrate consistent improvement or any recurrence of similar issues may result in:',
    monetaryPenalty:
      '<strong>Monetary Penalty:</strong> A deduction may be applied to your current or upcoming stipend/compensation based on the impact of your continued non-compliance.',
    nonMonetaryPenalty:
      '<strong>Non-Monetary Penalty:</strong> This may include temporary removal from ongoing projects, withdrawal of discretionary privileges, or official downgrade of performance status, which will be recorded in your employee profile or, if deemed necessary, termination of employment in accordance with company policies and applicable laws.',
    section5Title: '5. Acknowledgment and Support',
    section5Intro:
      'We are committed to supporting your success at MetaUpSpace LLP. If you are experiencing any challenges that may be affecting your performance, you are encouraged to speak with <strong>[Insert HR or manager\'s name]</strong> directly and confidentially.',
    paragraphs: WARNING_DISCIPLINARY_LETTER_DEFAULT_PARAGRAPHS,
    closingText: 'Sincerely,',
    signatureUrl: CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
    signatoryCompany: 'MetaUpSpace LLP',
    acknowledgementTitle: 'Employee Acknowledgment',
    acknowledgementText:
      'I, [Employee Full Name], acknowledge receipt of this warning and understand the expectations and potential consequences outlined above.',
    signatureLabel: 'Signature',
    dateLabel: 'Date',
  },
};

const workExperienceLetterExample = {
  payload: {
    employeeId: 'EMP-1001',
    employeeName: "[Employee's Full Name]",
    companyName: 'MetaUpSpace LLP',
    title: 'WORK EXPERIENCE LETTER',
    issueDate: '[Date of Issuance]',
    greeting: 'To Whom It May Concern,',
    startDate: '[Start Date]',
    endDate: '[Last Working Date]',
    jobTitle: '[Job Title]',
    department: '[Department Name]',
    introParagraph:
      'This is to certify that <strong>Mr./Ms. [Employee\'s Full Name]</strong> was employed with <strong>MetaUpSpace LLP</strong> from <strong>[Start Date]</strong> to <strong>[Last Working Date]</strong>, serving in the role of <strong>[Job Title]</strong> within the <strong>[Department Name]</strong>.',
    paragraphs: WORK_EXPERIENCE_LETTER_DEFAULT_PARAGRAPHS,
    closingText: 'Sincerely,',
    signatureUrl: CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
    signatoryCompany: 'MetaUpSpace LLP',
  },
};

const promotionLetterExample = {
  payload: {
    employeeId: 'EMP-1001',
    employeeName: "Employee's Name",
    companyName: 'MetaUpSpace LLP',
    title: 'PROMOTION LETTER',
    issueDate: '[Date of Issuance]',
    greeting: "Dear Employee's Name,",
    newJobTitle: '[New Job Title]',
    previousJobTitle: '[Previous Job Title]',
    department: '[Department]',
    effectiveFrom: '[Effective Date]',
    revisedSalary: '[New Salary]',
    salaryFrequency: 'month/year',
    salaryEffectiveDate: '[Salary Effective Date]',
    introParagraph:
      'We are pleased to inform you that, in recognition of your exemplary performance, dedication, and consistent contributions to MetaUpSpace LLP, you are being promoted to the position of [New Job Title] in the [Department] effective from [Effective Date]. This promotion reflects the confidence the organization places in your capabilities and your potential to excel in a broader leadership capacity.',
    paragraphs: [
      'In line with this new role, your salary will be revised to [New Salary] per [month/year], effective [Salary Effective Date]. All other terms and conditions of your employment remain unchanged unless otherwise specified.',
      'We are confident that you will approach this opportunity with the same level of professionalism, initiative, and integrity that you have consistently demonstrated. Your promotion reflects our trust in your abilities and readiness to take on greater responsibilities.',
      'We extend our sincere congratulations on this well-earned advancement and look forward to your continued contributions to the success and vision of MetaUpSpace LLP in this elevated role.',
    ],
    closingText: 'Warm regards,',
    signatureUrl: CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
    signatoryCompany: 'MetaUpSpace LLP',
  },
};

const joiningLetterExample = {
  payload: {
    employeeId: 'EMP-1001',
    employeeName: 'Ravi Kumar',
    designation: 'Software Engineer',
    department: 'Engineering',
    joiningDate: '2026-04-01',
    reportingManagerName: 'Ananya Sharma',
    reportingManagerDesignation: 'Engineering Manager',
    offerLetterDocumentId: '660abc1234de5678f9012345',
    issueDate: '2026-04-01',
    introParagraph:
      'We are pleased to confirm that you have officially joined MetaUpSpace LLP as a Software Engineer in the Engineering department, effective from 2026-04-01. You will be reporting directly to Ananya Sharma, Engineering Manager.',
    paragraphs: JOINING_LETTER_DEFAULT_PARAGRAPHS,
    closingText: 'Warm regards,',
    signatureUrl: CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
    signatoryCompany: 'MetaUpSpace LLP',
  },
};

const internshipToFullTimeLetterExample = {
  payload: {
    employeeId: 'EMP-1001',
    employeeName: 'Ravi Kumar',
    positionTitle: 'Software Engineer',
    department: 'Engineering',
    reportingManager: 'Ananya Sharma',
    expectedStartDate: '2026-04-15',
    bondDuration: '12 months',
    workSchedule: 'Flexible working hours',
    workLocation: 'Remote',
    salaryOrStipend: 'INR 12,00,000 per annum',
    acceptanceDeadline: '2026-04-10',
    issueDate: '2026-04-01',
    introParagraph:
      "In continuation to our recent discussions regarding your Full-Time Employment at MetaUpSpace LLP, we are pleased to extend this offer letter. We are highly impressed by your performance, dedication, and alignment with the company's values during your internship period.",
    paragraphs: INTERNSHIP_TO_FULL_TIME_LETTER_DEFAULT_PARAGRAPHS,
    contactParagraph:
      'Should you have any questions or require further clarification, please feel free to reach out to us at hr@metaupspace.com.',
    closingText: 'Warm Regards,',
    signatureUrl:
      'https://res.cloudinary.com/dkstzpumx/image/upload/q_auto/f_auto/v1775112240/sign_1_rzfa4e.jpg',
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
    signatoryCompany: 'MetaUpSpace LLP',
  },
};

const internshipCompletionCertificateExample = {
  payload: {
    employeeId: 'INT-2026-001',
    employeeName: "[Intern's Full Name]",
    department: '[Department Name]',
    startDate: '[Start Date]',
    endDate: '[End Date]',
    issueDate: '2026-04-02',
    title: 'INTERNSHIP COMPLETION CERTIFICATE',
    greeting: 'To Whom It May Concern,',
    internReference: 'Mr./Ms.',
    introParagraph:
      "This is to formally acknowledge that Mr./Ms. [Intern's Full Name] has completed an internship with MetaUpSpace LLP in the [Department Name] department. The internship tenure commenced on [Start Date] and concluded on [End Date].",
    paragraphs: [
      "During this period, the intern was associated with the department in a supporting capacity and demonstrated a professional attitude aligned with the organization's standards and workplace ethics.",
      "This certificate is issued in recognition of the successful completion of the internship and to appreciate the intern's time and contribution during the engagement with MetaUpSpace LLP. We extend our best wishes to [him/her/them] for continued success in future professional endeavors.",
    ],
    closingText: 'Warm regards,',
    leftSignatoryUrl:
      'https://res.cloudinary.com/dkstzpumx/image/upload/q_auto/f_auto/v1775112240/sign_1_rzfa4e.jpg',
    leftSignatoryName: 'Sahil Jaiswal',
    leftSignatoryRole: 'CEO & Founder',
    leftSignatoryCompany: 'MetaUpSpace LLP',
    rightSignatoryUrl:
      'https://res.cloudinary.com/dkstzpumx/image/upload/q_auto/f_auto/v1775112240/sign_1_rzfa4e.jpg',
    rightSignatoryName: "Manager's Name",
    rightSignatoryRole: '[Department] Manager',
    rightSignatoryCompany: 'MetaUpSpace LLP',
  },
};

export const genericExampleForType = (documentType: string) => {
  if (documentType === 'appraisal-letter') return appraisalExample;
  if (documentType === 'internship-completion-certificate') {
    return internshipCompletionCertificateExample;
  }
  if (documentType === 'internship-to-full-time-letter') return internshipToFullTimeLetterExample;
  if (documentType === 'experience-letter') return workExperienceLetterExample;
  if (documentType === 'joining-letter') return joiningLetterExample;
  if (documentType === 'promotion-letter') return promotionLetterExample;
  if (documentType === 'letter-of-intent') return letterOfIntentExample;
  if (documentType === 'internship-offer-letter') return internshipOfferLetterExample;
  if (documentType === 'probation-completion-letter') return probationCompletionLetterExample;
  if (documentType === 'relieving-letter') return relievingLetterExample;
  if (documentType === 'resignation-acceptance-letter') return resignationAcceptanceLetterExample;
  if (documentType === 'termination-letter') return terminationLetterExample;
  if (documentType === 'warning-and-disciplinary-letter') return warningDisciplinaryLetterExample;
  if (documentType === 'warning-letter') return warningLetterExample;
  if (documentType === 'contractual-letter') return contractualLetterExample;
  if (documentType === 'probation-offer-letter') return probationOfferLetterExample;

  const requiredFields = DOCUMENT_SPECIFICATIONS[documentType]?.requiredFields || [];
  const payload: Record<string, unknown> = {};

  for (const field of requiredFields) {
    switch (field) {
      case 'employeeId':
        payload[field] = 'EMP-1001';
        break;
      case 'employeeName':
        payload[field] = 'Ravi Kumar';
        break;
      case 'fromDate':
      case 'toDate':
      case 'joiningDate':
      case 'completionDate':
      case 'claimDate':
      case 'travelDate':
      case 'issueDate':
        payload[field] = '2026-04-01';
        break;
      case 'year':
        payload[field] = '2026';
        break;
      case 'month':
        payload[field] = 'April';
        break;
      case 'rating':
        payload[field] = 4;
        break;
      case 'paragraphs':
        payload[field] = ['Paragraph 1', 'Paragraph 2', 'Paragraph 3'];
        break;
      default:
        payload[field] = `sample-${field}`;
        break;
    }
  }

  return { payload };
};
