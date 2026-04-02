import { DOCUMENT_SPECIFICATIONS } from '../../../modules/document/config/document.config.ts';
import { appraisalExample } from './appraisal.example.ts';
import { contractualLetterExample } from './contractualLetter.example.ts';
import { letterOfIntentExample } from './letterOfIntent.example.ts';
import { probationOfferLetterExample } from './probationOfferLetter.example.ts';
import { internshipOfferLetterExample } from './internshipOfferLetter.example.ts';
import { probationCompletionLetterExample } from './probationCompletionLetter.example.ts';
import { relievingLetterExample } from './relievingLetter.example.ts';
import { terminationLetterExample } from './terminationLetter.example.ts';
import { warningLetterExample } from './warningLetter.example.ts';
import { resignationAcceptanceLetterExample } from './resignationAcceptanceLetter.example.ts';
import { warningDisciplinaryLetterExample } from './warningDisciplinaryLetter.example.ts';
import { workExperienceLetterExample } from './workExperienceLetter.example.ts';
import { promotionLetterExample } from './promotionLetter.example.ts';
import { joiningLetterExample } from './joiningLetter.example.ts';
import { internshipToFullTimeLetterExample } from './internshipToFullTimeLetter.example.ts';
import { internshipCompletionCertificateExample } from './internshipCompletionCertificate.example.ts';

export const genericExampleForType = (documentType: string) => {
  if (documentType === 'appraisal-letter') return appraisalExample;
  if (documentType === 'internship-completion-certificate') {
    return internshipCompletionCertificateExample;
  }
  if (documentType === 'internship-to-full-time-letter') return internshipToFullTimeLetterExample;
  if (documentType === 'experience-letter') return workExperienceLetterExample;
  if (documentType === 'joining-letter') return joiningLetterExample;
  if (documentType === 'promotion-letter') return promotionLetterExample;
  if (documentType === 'letter-of-intent') return letterOfIntentExample;
  if (documentType === 'internship-offer-letter') return internshipOfferLetterExample;
  if (documentType === 'probation-completion-letter') return probationCompletionLetterExample;
  if (documentType === 'relieving-letter') return relievingLetterExample;
  if (documentType === 'resignation-acceptance-letter') return resignationAcceptanceLetterExample;
  if (documentType === 'termination-letter') return terminationLetterExample;
  if (documentType === 'warning-and-disciplinary-letter') return warningDisciplinaryLetterExample;
  if (documentType === 'warning-letter') return warningLetterExample;
  if (documentType === 'contractual-letter') return contractualLetterExample;
  if (documentType === 'probation-offer-letter') return probationOfferLetterExample;

  const requiredFields = DOCUMENT_SPECIFICATIONS[documentType]?.requiredFields || [];
  const payload: Record<string, unknown> = {};

  for (const field of requiredFields) {
    switch (field) {
      case 'employeeId':
        payload[field] = 'EMP-1001';
        break;
      case 'employeeName':
        payload[field] = 'Ravi Kumar';
        break;
      case 'fromDate':
      case 'toDate':
      case 'joiningDate':
      case 'completionDate':
      case 'claimDate':
      case 'travelDate':
      case 'issueDate':
        payload[field] = '2026-04-01';
        break;
      case 'year':
        payload[field] = '2026';
        break;
      case 'month':
        payload[field] = 'April';
        break;
      case 'rating':
        payload[field] = 4;
        break;
      case 'paragraphs':
        payload[field] = ['Paragraph 1', 'Paragraph 2', 'Paragraph 3'];
        break;
      default:
        payload[field] = `sample-${field}`;
        break;
    }
  }

  return { payload };
};
