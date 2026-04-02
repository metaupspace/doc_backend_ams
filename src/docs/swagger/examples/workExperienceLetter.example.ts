import { WORK_EXPERIENCE_LETTER_DEFAULT_PARAGRAPHS, CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL } from '../../../modules/document/config/document.config.ts';

export const workExperienceLetterExample = {
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
