import { WARNING_DISCIPLINARY_LETTER_DEFAULT_PARAGRAPHS, CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL } from '../../../modules/document/config/document.config.ts';

export const warningDisciplinaryLetterExample = {
  payload: {
    employeeId: 'EMP-1001',
    employeeName: "Employee's Name",
    companyName: 'MetaUpSpace LLP',
    title: 'WARNING AND DISCIPLINARY LETTER',
    issueDate: '12/10/2025',
    greeting: "Dear Employee's Name,",
    introParagraph:
      'This letter serves as a <strong>formal written warning</strong> regarding recent behavior that is not in accordance with the standards, policies, and values of <strong>MetaUpSpace LLP</strong>.',
    section1Title: '1. Description of Concern',
    section1Intro:
      'It has been observed that over the past [insert duration or dates], you have consistently failed to:',
    concernsList: [
      'Failure to join the virtual office during expected hours',
      'Lack of responsiveness and poor communication with the team',
      'Mark your attendance as per company protocol',
      'Negligence in completing assigned work',
    ],
    section1Outro:
      'This behavior is in direct violation of company policies, as outlined in the <strong><em>Annexure[A]</em></strong>.',
    section2Title: '2. Previous Actions Taken',
    section2Intro: 'Prior to this letter, the following steps were taken to address the concerns:',
    previousActionsList: [
      '[Insert Date]: Verbal reminder regarding communication and availability',
      '[Insert Date]: Advised via email/chat to be present and responsive during working hours',
    ],
    section2Outro:
      'Despite these measures, there has been insufficient or no improvement in your conduct.',
    section3Title: '3. Required Improvement and Expectations',
    section3Intro: 'You are expected to:',
    expectationsList: [
      'Be present in the virtual office consistently',
      'Communicate clearly and promptly',
      'Show responsibility in your assigned tasks',
    ],
    section3Outro:
      'This improvement must be <strong>immediate and sustained</strong>. Your conduct will be closely monitored over the next 30 days.',
    section4Title: '4. Consequences of Further Violation',
    section4Intro:
      'Failure to demonstrate consistent improvement or any recurrence of similar issues may result in:',
    monetaryPenalty:
      '<strong>Monetary Penalty:</strong> A deduction may be applied to your current or upcoming stipend/compensation based on the impact of your continued non-compliance.',
    nonMonetaryPenalty:
      '<strong>Non-Monetary Penalty:</strong> This may include temporary removal from ongoing projects, withdrawal of discretionary privileges, or official downgrade of performance status, which will be recorded in your employee profile or, if deemed necessary, termination of employment in accordance with company policies and applicable laws.',
    section5Title: '5. Acknowledgment and Support',
    section5Intro:
      'We are committed to supporting your success at MetaUpSpace LLP. If you are experiencing any challenges that may be affecting your performance, you are encouraged to speak with <strong>[Insert HR or manager\'s name]</strong> directly and confidentially.',
    paragraphs: WARNING_DISCIPLINARY_LETTER_DEFAULT_PARAGRAPHS,
    closingText: 'Sincerely,',
    signatureUrl: CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
    signatoryCompany: 'MetaUpSpace LLP',
    acknowledgementTitle: 'Employee Acknowledgment',
    acknowledgementText:
      'I, [Employee Full Name], acknowledge receipt of this warning and understand the expectations and potential consequences outlined above.',
    signatureLabel: 'Signature',
    dateLabel: 'Date',
  },
};
