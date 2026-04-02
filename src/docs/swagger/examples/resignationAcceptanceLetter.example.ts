import { RESIGNATION_ACCEPTANCE_LETTER_DEFAULT_PARAGRAPHS, CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL } from '../../../modules/document/config/document.config.ts';

export const resignationAcceptanceLetterExample = {
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
