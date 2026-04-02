import {
  CONTRACTUAL_LETTER_DEFAULT_PARAGRAPHS,
  CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
} from '../../../modules/document/config/document.config.ts';

export const contractualLetterExample = {
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
