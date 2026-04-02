import { INTERNSHIP_OFFER_LETTER_DEFAULT_PARAGRAPHS, CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL } from '../../../modules/document/config/document.config.ts';

export const internshipOfferLetterExample = {
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
