import { CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL } from '../../../modules/document/config/document.config.ts';

export const letterOfIntentExample = {
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
