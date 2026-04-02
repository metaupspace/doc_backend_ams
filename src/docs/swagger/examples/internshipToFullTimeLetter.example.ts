import { INTERNSHIP_TO_FULL_TIME_LETTER_DEFAULT_PARAGRAPHS } from '../../../modules/document/config/document.config.ts';

export const internshipToFullTimeLetterExample = {
  payload: {
    employeeId: 'EMP-1001',
    employeeName: 'Ravi Kumar',
    positionTitle: 'Software Engineer',
    department: 'Engineering',
    reportingManager: 'Ananya Sharma',
    expectedStartDate: '2026-04-15',
    bondDuration: '12 months',
    workSchedule: 'Flexible working hours',
    workLocation: 'Remote',
    salaryOrStipend: 'INR 12,00,000 per annum',
    acceptanceDeadline: '2026-04-10',
    issueDate: '2026-04-01',
    introParagraph:
      "In continuation to our recent discussions regarding your Full-Time Employment at MetaUpSpace LLP, we are pleased to extend this offer letter. We are highly impressed by your performance, dedication, and alignment with the company's values during your internship period.",
    paragraphs: INTERNSHIP_TO_FULL_TIME_LETTER_DEFAULT_PARAGRAPHS,
    contactParagraph:
      'Should you have any questions or require further clarification, please feel free to reach out to us at hr@metaupspace.com.',
    closingText: 'Warm Regards,',
    signatureUrl:
      'https://res.cloudinary.com/dkstzpumx/image/upload/q_auto/f_auto/v1775112240/sign_1_rzfa4e.jpg',
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
    signatoryCompany: 'MetaUpSpace LLP',
  },
};
