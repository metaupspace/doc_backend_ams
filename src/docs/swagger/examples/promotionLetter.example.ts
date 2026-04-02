import { CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL } from '../../../modules/document/config/document.config.ts';

export const promotionLetterExample = {
  payload: {
    employeeId: 'EMP-1001',
    employeeName: "Employee's Name",
    companyName: 'MetaUpSpace LLP',
    title: 'PROMOTION LETTER',
    issueDate: '[Date of Issuance]',
    greeting: "Dear Employee's Name,",
    newJobTitle: '[New Job Title]',
    previousJobTitle: '[Previous Job Title]',
    department: '[Department]',
    effectiveFrom: '[Effective Date]',
    revisedSalary: '[New Salary]',
    salaryFrequency: 'month/year',
    salaryEffectiveDate: '[Salary Effective Date]',
    introParagraph:
      'We are pleased to inform you that, in recognition of your exemplary performance, dedication, and consistent contributions to MetaUpSpace LLP, you are being promoted to the position of [New Job Title] in the [Department] effective from [Effective Date]. This promotion reflects the confidence the organization places in your capabilities and your potential to excel in a broader leadership capacity.',
    paragraphs: [
      'In line with this new role, your salary will be revised to [New Salary] per [month/year], effective [Salary Effective Date]. All other terms and conditions of your employment remain unchanged unless otherwise specified.',
      'We are confident that you will approach this opportunity with the same level of professionalism, initiative, and integrity that you have consistently demonstrated. Your promotion reflects our trust in your abilities and readiness to take on greater responsibilities.',
      'We extend our sincere congratulations on this well-earned advancement and look forward to your continued contributions to the success and vision of MetaUpSpace LLP in this elevated role.',
    ],
    closingText: 'Warm regards,',
    signatureUrl: CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
    signatoryCompany: 'MetaUpSpace LLP',
  },
};
