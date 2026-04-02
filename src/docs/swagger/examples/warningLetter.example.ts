import { WARNING_LETTER_DEFAULT_PARAGRAPHS, CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL } from '../../../modules/document/config/document.config.ts';

export const warningLetterExample = {
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
