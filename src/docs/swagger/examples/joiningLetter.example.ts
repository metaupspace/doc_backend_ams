import { JOINING_LETTER_DEFAULT_PARAGRAPHS, CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL } from '../../../modules/document/config/document.config.ts';

export const joiningLetterExample = {
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
