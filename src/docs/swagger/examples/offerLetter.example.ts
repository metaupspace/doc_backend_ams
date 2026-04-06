import {
  CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
  OFFER_LETTER_DEFAULT_PARAGRAPHS,
} from '../../../modules/document/config/document.config.ts';

export const offerLetterExample = {
  payload: {
    employeeName: 'Employee Name',
    companyName: 'MetaUpSpace LLP',
    title: 'OFFER LETTER',
    issueDate: '2026-04-06',
    positionTitle: 'Role / Position',
    department: 'Department',
    reportingManager: 'Reporting Manager',
    probationDuration: '6 Months',
    workSchedule: 'Flexible working hours',
    location: 'Remote',
    compensation: 'As per discussion',
    acceptanceDeadline: '2026-04-10',
    introParagraph:
      'We are pleased to extend to you an offer to join <strong>MetaUpSpace LLP</strong> as a <strong>Full-Time Employee</strong> in the <strong>[Department]</strong> as <strong>[Role / Position]</strong>. Following our recent discussions and your performance during the selection process, we believe you possess the qualities that align with the values and expectations of our organization.',
    keyDetailsTitle: 'We are pleased to extend the following offer:',
    paragraphs: OFFER_LETTER_DEFAULT_PARAGRAPHS,
    contactParagraph:
      'Should you have any questions or require further clarification, please feel free to reach out to us at <strong>hr@metaupspace.com</strong>.',
    closingText: 'Warm Regards,',
    signatureUrl: CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
  },
};
