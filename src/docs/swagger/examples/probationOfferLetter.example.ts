import { PROBATION_OFFER_LETTER_DEFAULT_PARAGRAPHS, CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL } from '../../../modules/document/config/document.config.ts';

export const probationOfferLetterExample = {
  payload: {
    employeeName: 'Employee Name',
    companyName: 'MetaUpSpace LLP',
    title: 'PROBATION- OFFER LETTER',
    issueDate: '2026-04-02',
    positionTitle: 'Position Name',
    jobTitle: 'Position Name',
    designation: 'Position Name',
    startDate: '{date}',
    probationPeriod: '{Duration}',
    reportingManager: 'Reporting Manager',
    monthlySalary: 'Rs 1,00,000',
    workLocation: 'Location',
    location: 'Location',
    employmentType: 'Full-Time',
    acceptanceDeadline: '19/01/2026',
    keyDetailsTitle: 'Below are the key details of your probationary appointment:',
    introParagraph:
      'We are pleased to offer you the position of Position Name at MetaUpSpace LLP, effective {date}, under a probationary appointment. This initial probation period will be for a duration of {Duration}, during which your performance, conduct, and suitability for the role will be closely reviewed.',
    paragraphs: PROBATION_OFFER_LETTER_DEFAULT_PARAGRAPHS,
    contactParagraph:
      'Should you have any questions or require further clarification, please feel free to reach out to us at hr@metaupspace.com.',
    closingText: 'Warm Regards,',
    signatureUrl: CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
  },
};
