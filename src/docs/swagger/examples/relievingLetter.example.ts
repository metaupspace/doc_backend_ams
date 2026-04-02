import { RELIEVING_LETTER_DEFAULT_PARAGRAPHS, CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL } from '../../../modules/document/config/document.config.ts';

export const relievingLetterExample = {
  payload: {
    employeeId: 'EMP-1001',
    employeeName: '[Employee_Name]',
    employeeNo: '[EMP No ]',
    companyName: 'MetaUpSpace LLP',
    title: 'RELIEVING LETTER',
    issueDate: '[Date of Issuance]',
    greeting: 'To Whomsoever Concerned,',
    jobTitle: '[Job_Ttle]',
    department: '[Job_Department]',
    joiningDate: '[Joining_Date]',
    lastDay: '[Last_Day]',
    introParagraph:
      'We hereby certify that [Employee_Name], [EMP No ] was employed as a [Job_Ttle] in [Job_Department] with MetaUpSpace LLP starting from [Joining_Date] to [Last_Day].',
    paragraphs: RELIEVING_LETTER_DEFAULT_PARAGRAPHS,
    closingText: 'Sincerely,',
    signatureUrl: CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
    signatoryCompany: 'MetaUpSpace LLP',
  },
};
