import { TERMINATION_LETTER_DEFAULT_PARAGRAPHS, CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL } from '../../../modules/document/config/document.config.ts';

export const terminationLetterExample = {
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
