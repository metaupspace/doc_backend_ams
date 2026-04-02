import { PROBATION_COMPLETION_LETTER_DEFAULT_PARAGRAPHS, CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL } from '../../../modules/document/config/document.config.ts';

export const probationCompletionLetterExample = {
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
