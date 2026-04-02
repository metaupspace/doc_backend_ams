import Joi from 'joi';
import {
  CONTRACTUAL_LETTER_DEFAULT_PARAGRAPHS,
  CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
  LETTER_OF_INTENT_DEFAULT_INTRO_PARAGRAPHS,
  LETTER_OF_INTENT_DEFAULT_PARAGRAPHS,
  INTERNSHIP_OFFER_LETTER_DEFAULT_INTRO_PARAGRAPH,
  INTERNSHIP_OFFER_LETTER_DEFAULT_PARAGRAPHS,
  INTERNSHIP_COMPLETION_CERTIFICATE_DEFAULT_PARAGRAPHS,
  INTERNSHIP_TO_FULL_TIME_LETTER_DEFAULT_PARAGRAPHS,
  JOINING_LETTER_DEFAULT_PARAGRAPHS,
  PROMOTION_LETTER_DEFAULT_PARAGRAPHS,
  PROBATION_COMPLETION_LETTER_DEFAULT_PARAGRAPHS,
  RELIEVING_LETTER_DEFAULT_PARAGRAPHS,
  WORK_EXPERIENCE_LETTER_DEFAULT_PARAGRAPHS,
  RESIGNATION_ACCEPTANCE_LETTER_DEFAULT_PARAGRAPHS,
  TERMINATION_LETTER_DEFAULT_PARAGRAPHS,
  WARNING_DISCIPLINARY_LETTER_DEFAULT_PARAGRAPHS,
  WARNING_LETTER_DEFAULT_PARAGRAPHS,
  PROBATION_OFFER_LETTER_DEFAULT_PARAGRAPHS,
  DOCUMENT_SPECIFICATIONS,
  DOCUMENT_TYPES,
} from '../config/document.config.ts';

const baseDocumentSchema = Joi.object({
  payload: Joi.object().required().messages({
    'any.required': 'payload is required and must be a JSON object',
  }),
  employeeId: Joi.string().optional(),
  hrId: Joi.string().optional(),
  managerId: Joi.string().optional(),
});

export const validateDocumentRequest = (documentType, data): any => {
  const typeResult = Joi.string()
    .valid(...DOCUMENT_TYPES)
    .required()
    .validate(documentType);

  if (typeResult.error) {
    return {
      error: {
        details: [
          {
            path: ['documentType'],
            message: `documentType must be one of: ${DOCUMENT_TYPES.join(', ')}`,
          },
        ],
      },
    };
  }

  const result = baseDocumentSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (result.error) {
    return result;
  }

  const specification = DOCUMENT_SPECIFICATIONS[documentType];
  const requiredFields = specification?.requiredFields || [];

  if (documentType === 'appraisal-letter') {
    const p = result.value.payload;
    if (!Array.isArray(p.paragraphs)) {
      const normalized = [p.paragraph1, p.paragraph2, p.paragraph3].filter(Boolean);
      if (normalized.length > 0) {
        result.value.payload.paragraphs = normalized;
      }
    }
  }

  if (documentType === 'contractual-letter') {
    const p = result.value.payload;
    const inputParagraphs = Array.isArray(p.paragraphs)
      ? p.paragraphs.filter(Boolean)
      : [p.paragraph1, p.paragraph2, p.paragraph3].filter(Boolean);

    const normalizedParagraphs = CONTRACTUAL_LETTER_DEFAULT_PARAGRAPHS.map(
      (defaultParagraph, index) => inputParagraphs[index] || defaultParagraph
    );

    p.paragraphs = normalizedParagraphs;
    p.signatureUrl = p.signatureUrl || CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL;
  }

  if (documentType === 'letter-of-intent') {
    const p = result.value.payload;
    const introParagraphsFromArray = Array.isArray(p.introParagraphs)
      ? p.introParagraphs.filter(Boolean)
      : [];
    const introParagraphsFromFields = [p.introParagraph1, p.introParagraph2].filter(Boolean);
    const introParagraphsFromText =
      typeof p.introParagraph === 'string' && p.introParagraph.trim()
        ? p.introParagraph
            .split(/(?<=[.!?])\s+(?=[A-Z])/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)
            .slice(0, 2)
        : [];

    const inputIntroParagraphs =
      introParagraphsFromArray.length > 0
        ? introParagraphsFromArray.slice(0, 2)
        : introParagraphsFromFields.length > 0
          ? introParagraphsFromFields.slice(0, 2)
          : introParagraphsFromText;

    const inputParagraphs = Array.isArray(p.paragraphs)
      ? p.paragraphs.filter(Boolean)
      : [p.paragraph1, p.paragraph2, p.paragraph3].filter(Boolean);

    p.introParagraphs =
      inputIntroParagraphs.length > 0
        ? inputIntroParagraphs.slice(0, 2)
        : [...LETTER_OF_INTENT_DEFAULT_INTRO_PARAGRAPHS];

    p.paragraphs =
      inputParagraphs.length > 0
        ? inputParagraphs.slice(0, 2)
        : [...LETTER_OF_INTENT_DEFAULT_PARAGRAPHS].slice(0, 2);
    p.signatureUrl = p.signatureUrl || CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL;
    p.signatoryName = p.signatoryName || 'Authorized Signatory';
    p.position = p.position || 'Position';
  }

  if (documentType === 'internship-offer-letter') {
    const p = result.value.payload;
    const inputParagraphs = Array.isArray(p.paragraphs)
      ? p.paragraphs.filter(Boolean)
      : [p.paragraph1, p.paragraph2, p.paragraph3, p.paragraph4].filter(Boolean);

    p.paragraphs =
      inputParagraphs.length > 0 ? inputParagraphs : [...INTERNSHIP_OFFER_LETTER_DEFAULT_PARAGRAPHS];
    p.introParagraph = p.introParagraph || INTERNSHIP_OFFER_LETTER_DEFAULT_INTRO_PARAGRAPH;
    p.signatureUrl = p.signatureUrl || CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL;
    p.signatoryName = p.signatoryName || 'Sahil Jaiswal';
    p.position = p.position || 'CEO & Founder';
  }

  if (documentType === 'probation-completion-letter') {
    const p = result.value.payload;
    const inputParagraphs = Array.isArray(p.paragraphs)
      ? p.paragraphs.filter(Boolean)
      : [p.paragraph1, p.paragraph2, p.paragraph3].filter(Boolean);

    p.paragraphs =
      inputParagraphs.length > 0
        ? inputParagraphs
        : [...PROBATION_COMPLETION_LETTER_DEFAULT_PARAGRAPHS];
    p.signatureUrl = p.signatureUrl || CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL;
    p.signatoryName = p.signatoryName || 'Authorized Signatory';
    p.position = p.position || 'Position';
  }

  if (documentType === 'probation-offer-letter') {
    const p = result.value.payload;
    const inputParagraphs = Array.isArray(p.paragraphs)
      ? p.paragraphs.filter(Boolean)
      : [p.paragraph1, p.paragraph2, p.paragraph3, p.paragraph4].filter(Boolean);

    p.paragraphs =
      inputParagraphs.length > 0 ? inputParagraphs : [...PROBATION_OFFER_LETTER_DEFAULT_PARAGRAPHS];
    p.signatureUrl = p.signatureUrl || CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL;
  }

  if (documentType === 'relieving-letter') {
    const p = result.value.payload;
    const inputParagraphs = Array.isArray(p.paragraphs)
      ? p.paragraphs.filter(Boolean)
      : [p.paragraph1, p.paragraph2].filter(Boolean);

    p.paragraphs =
      inputParagraphs.length > 0 ? inputParagraphs : [...RELIEVING_LETTER_DEFAULT_PARAGRAPHS];
    p.signatureUrl = p.signatureUrl || CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL;
    p.signatoryName = p.signatoryName || 'Authorized Signatory';
    p.position = p.position || 'Position';
  }

  if (documentType === 'termination-letter') {
    const p = result.value.payload;
    const inputParagraphs = Array.isArray(p.paragraphs)
      ? p.paragraphs.filter(Boolean)
      : [p.paragraph1, p.paragraph2, p.paragraph3].filter(Boolean);

    p.paragraphs =
      inputParagraphs.length > 0 ? inputParagraphs : [...TERMINATION_LETTER_DEFAULT_PARAGRAPHS];
    p.signatureUrl = p.signatureUrl || CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL;
    p.signatoryName = p.signatoryName || 'Authorized Signatory';
    p.position = p.position || 'Position';
  }

  if (documentType === 'warning-letter') {
    const p = result.value.payload;
    const inputParagraphs = Array.isArray(p.paragraphs)
      ? p.paragraphs.filter(Boolean)
      : [p.paragraph1, p.paragraph2, p.paragraph3].filter(Boolean);

    p.paragraphs =
      inputParagraphs.length > 0 ? inputParagraphs : [...WARNING_LETTER_DEFAULT_PARAGRAPHS];
    p.signatureUrl = p.signatureUrl || CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL;
    p.signatoryName = p.signatoryName || 'Authorized Signatory';
    p.position = p.position || 'Position';
  }

  if (documentType === 'resignation-acceptance-letter') {
    const p = result.value.payload;
    const inputParagraphs = Array.isArray(p.paragraphs)
      ? p.paragraphs.filter(Boolean)
      : [p.paragraph1, p.paragraph2, p.paragraph3].filter(Boolean);

    p.paragraphs =
      inputParagraphs.length > 0
        ? inputParagraphs
        : [...RESIGNATION_ACCEPTANCE_LETTER_DEFAULT_PARAGRAPHS];
    p.signatureUrl = p.signatureUrl || CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL;
    p.signatoryName = p.signatoryName || 'Authorized Signatory';
    p.position = p.position || 'Position';
  }

  if (documentType === 'warning-and-disciplinary-letter') {
    const p = result.value.payload;
    const inputParagraphs = Array.isArray(p.paragraphs)
      ? p.paragraphs.filter(Boolean)
      : [p.paragraph1, p.paragraph2, p.paragraph3].filter(Boolean);

    p.paragraphs =
      inputParagraphs.length > 0
        ? inputParagraphs
        : [...WARNING_DISCIPLINARY_LETTER_DEFAULT_PARAGRAPHS];
    p.signatureUrl = p.signatureUrl || CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL;
    p.signatoryName = p.signatoryName || 'Authorized Signatory';
    p.position = p.position || 'Position';
  }

  if (documentType === 'internship-completion-certificate') {
    const p = result.value.payload;
    const inputParagraphs = Array.isArray(p.paragraphs)
      ? p.paragraphs.filter(Boolean)
      : [p.paragraph1, p.paragraph2].filter(Boolean);

    p.paragraphs =
      inputParagraphs.length > 0
        ? inputParagraphs
        : [...INTERNSHIP_COMPLETION_CERTIFICATE_DEFAULT_PARAGRAPHS];

    p.companyName = p.companyName || 'MetaUpSpace LLP';
    p.greeting = p.greeting || 'To Whom It May Concern,';
    p.leftSignatoryName = p.leftSignatoryName || 'Sahil Jaiswal';
    p.leftSignatoryRole = p.leftSignatoryRole || 'CEO & Founder';
    p.leftSignatoryCompany = p.leftSignatoryCompany || p.companyName;
    p.rightSignatoryName = p.rightSignatoryName || "Manager's Name";
    p.rightSignatoryRole = p.rightSignatoryRole || `${p.department || '[Department]'} Manager`;
    p.rightSignatoryCompany = p.rightSignatoryCompany || p.companyName;
  }

  if (documentType === 'internship-to-full-time-letter') {
    const p = result.value.payload;
    const inputParagraphs = Array.isArray(p.paragraphs)
      ? p.paragraphs.filter(Boolean)
      : [p.paragraph1, p.paragraph2, p.paragraph3, p.paragraph4].filter(Boolean);

    p.paragraphs =
      inputParagraphs.length > 0 ? inputParagraphs : [...INTERNSHIP_TO_FULL_TIME_LETTER_DEFAULT_PARAGRAPHS];
    p.signatureUrl = p.signatureUrl || CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL;
    p.signatoryName = p.signatoryName || 'Sahil Jaiswal';
    p.position = p.position || 'CEO & Founder';
    p.signatoryCompany = p.signatoryCompany || 'MetaUpSpace LLP';
  }

  if (documentType === 'experience-letter') {
    const p = result.value.payload;
    const inputParagraphs = Array.isArray(p.paragraphs)
      ? p.paragraphs.filter(Boolean)
      : [p.paragraph1, p.paragraph2].filter(Boolean);

    p.startDate = p.startDate || p.fromDate;
    p.endDate = p.endDate || p.toDate || p.lastWorkingDate;
    p.paragraphs =
      inputParagraphs.length > 0 ? inputParagraphs : [...WORK_EXPERIENCE_LETTER_DEFAULT_PARAGRAPHS];
    p.companyName = p.companyName || 'MetaUpSpace LLP';
    p.greeting = p.greeting || 'To Whom It May Concern,';
    p.title = p.title || 'WORK EXPERIENCE LETTER';
    p.signatoryName = p.signatoryName || 'Sahil Jaiswal';
    p.position = p.position || 'CEO & Founder';
  }

  if (documentType === 'joining-letter') {
    const p = result.value.payload;
    const inputParagraphs = Array.isArray(p.paragraphs)
      ? p.paragraphs.filter(Boolean)
      : [p.paragraph1, p.paragraph2, p.paragraph3].filter(Boolean);

    p.paragraphs = inputParagraphs.length > 0 ? inputParagraphs : [...JOINING_LETTER_DEFAULT_PARAGRAPHS];
    p.signatureUrl = p.signatureUrl || CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL;
    p.signatoryName = p.signatoryName || 'Sahil Jaiswal';
    p.position = p.position || 'CEO & Founder';
    p.signatoryCompany = p.signatoryCompany || 'MetaUpSpace LLP';
  }

  if (documentType === 'promotion-letter') {
    const p = result.value.payload;
    const inputParagraphs = Array.isArray(p.paragraphs)
      ? p.paragraphs.filter(Boolean)
      : [p.paragraph1, p.paragraph2].filter(Boolean);

    p.newJobTitle = p.newJobTitle || p.newDesignation;
    p.previousJobTitle = p.previousJobTitle || p.oldDesignation;
    p.effectiveFrom = p.effectiveFrom || p.effectiveDate;
    p.salaryEffectiveDate = p.salaryEffectiveDate || p.effectiveFrom;
    p.paragraphs =
      inputParagraphs.length > 0 ? inputParagraphs : [...PROMOTION_LETTER_DEFAULT_PARAGRAPHS];
    p.companyName = p.companyName || 'MetaUpSpace LLP';
    p.greeting = p.greeting || `Dear ${p.employeeName || 'Employee'},`;
    p.title = p.title || 'PROMOTION LETTER';
    p.signatoryName = p.signatoryName || 'Sahil Jaiswal';
    p.position = p.position || 'CEO & Founder';
  }

  if (documentType === 'joining-letter') {
    const p = result.value.payload;
    const inputParagraphs = Array.isArray(p.paragraphs)
      ? p.paragraphs.filter(Boolean)
      : [p.paragraph1, p.paragraph2, p.paragraph3].filter(Boolean);

    p.paragraphs =
      inputParagraphs.length > 0 ? inputParagraphs : [...JOINING_LETTER_DEFAULT_PARAGRAPHS];
    p.companyName = p.companyName || 'MetaUpSpace LLP';
    p.greeting = p.greeting || `Dear ${p.employeeName || 'Employee'},`;
    p.title = p.title || 'JOINING LETTER';
    p.designation = p.designation || p.jobTitle;
    p.reportingManagerName = p.reportingManagerName || p.reportingManager;
    p.signatoryName = p.signatoryName || 'Sahil Jaiswal';
    p.position = p.position || 'CEO & Founder';
  }

  if (documentType === 'internship-to-full-time-letter') {
    const p = result.value.payload;
    const inputParagraphs = Array.isArray(p.paragraphs)
      ? p.paragraphs.filter(Boolean)
      : [p.paragraph1, p.paragraph2, p.paragraph3, p.paragraph4].filter(Boolean);

    p.paragraphs =
      inputParagraphs.length > 0
        ? inputParagraphs
        : [...INTERNSHIP_TO_FULL_TIME_LETTER_DEFAULT_PARAGRAPHS];
    p.companyName = p.companyName || 'MetaUpSpace LLP';
    p.greeting = p.greeting || `Dear ${p.employeeName || 'Employee'},`;
    p.title = p.title || 'OFFER LETTER';
    p.employmentType = p.employmentType || 'Full-Time';
    p.workSchedule = p.workSchedule || 'Flexible working hours';
    p.workLocation = p.workLocation || 'Remote';
    p.signatoryName = p.signatoryName || 'Sahil Jaiswal';
    p.position = p.position || 'CEO & Founder';
  }

  const missingFields = requiredFields.filter((field) => result.value.payload[field] === undefined);

  if (missingFields.length > 0) {
    return {
      error: {
        details: missingFields.map((field) => ({
          path: ['payload', field],
          message: `payload.${field} is required for documentType ${documentType}`,
        })),
      },
    };
  }

  return result;
};
