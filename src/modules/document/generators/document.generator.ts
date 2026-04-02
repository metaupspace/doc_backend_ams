import PDFDocument from 'pdfkit';
import logger from '../../../config/logger.ts';
import { DOCUMENT_SPECIFICATIONS } from '../config/document.config.ts';
import { generateAppraisalLetterPdfBuffer } from './templates/appraisalLetter.generator.ts';
import { generateContractualLetterPdfBuffer } from './templates/contractualLetter.generator.ts';
import { generateLetterOfIntentPdfBuffer } from './templates/letterOfIntent.generator.ts';
import { generateInternshipOfferLetterPdfBuffer } from './templates/internshipOfferLetter.generator.ts';
import { generateInternshipCompletionCertificatePdfBuffer } from './templates/internshipCompletionCertificate.generator.ts';
import { generateInternshipToFullTimeLetterPdfBuffer } from './templates/internshipToFullTimeLetter.generator.ts';
import { generateJoiningLetterPdfBuffer } from './templates/joiningLetter.generator.ts';
import { generatePromotionLetterPdfBuffer } from './templates/promotionLetter.generator.ts';
import { generateProbationCompletionLetterPdfBuffer } from './templates/probationCompletionLetter.generator.ts';
import { generateProbationOfferLetterPdfBuffer } from './templates/probationOfferLetter.generator.ts';
import { generateRelievingLetterPdfBuffer } from './templates/relievingLetter.generator.ts';
import { generateResignationAcceptanceLetterPdfBuffer } from './templates/resignationAcceptanceLetter.generator.ts';
import { generateTerminationLetterPdfBuffer } from './templates/terminationLetter.generator.ts';
import { generateWarningDisciplinaryLetterPdfBuffer } from './templates/warningDisciplinaryLetter.generator.ts';
import { generateWarningLetterPdfBuffer } from './templates/warningLetter.generator.ts';
import { generateWorkExperienceLetterPdfBuffer } from './templates/workExperienceLetter.generator.ts';

const prettyLabel = (key) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase());

const addHeader = (doc, title, documentType) => {
  doc.font('Helvetica-Bold').fontSize(22).text(title, { align: 'center' }).moveDown(0.5);

  doc
    .font('Helvetica')
    .fontSize(10)
    .text(`Document Type: ${documentType}`)
    .text(`Generated At: ${new Date().toISOString()}`)
    .moveDown(1);
};

const addCommonFields = (doc, payload) => {
  Object.entries(payload).forEach(([key, value]) => {
    if (Array.isArray(value) || (value && typeof value === 'object')) {
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .text(`${prettyLabel(key)}:`)
        .font('Helvetica')
        .fontSize(10)
        .text(JSON.stringify(value, null, 2))
        .moveDown(0.5);
      return;
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .text(`${prettyLabel(key)}:`, { continued: true })
      .font('Helvetica')
      .fontSize(11)
      .text(` ${value ?? '-'}`);
  });
};

const renderPerformanceReport = (doc, payload) => {
  doc.font('Helvetica-Bold').fontSize(13).text('Performance Summary').moveDown(0.3);

  const metricKeys = ['rating', 'attendanceScore', 'productivityScore', 'qualityScore'];
  metricKeys.forEach((key) => {
    if (payload[key] !== undefined) {
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .text(`${prettyLabel(key)}:`, { continued: true })
        .font('Helvetica')
        .fontSize(11)
        .text(` ${payload[key]}`);
    }
  });

  if (payload.managerRemarks) {
    doc.moveDown(0.6);
    doc.font('Helvetica-Bold').fontSize(12).text('Manager Remarks');
    doc.font('Helvetica').fontSize(11).text(payload.managerRemarks);
  }

  doc.moveDown(0.8);
  addCommonFields(doc, payload);
};

const renderByDocumentType = (doc, documentType, payload) => {
  if (documentType === 'performance-report') {
    renderPerformanceReport(doc, payload);
    return;
  }

  addCommonFields(doc, payload);
};

export const generatePDFBuffer = async (
  documentType,
  payload,
  context: { issuedAt?: string | number | Date } = {}
): Promise<Buffer> => {
  if (documentType === 'appraisal-letter') {
    return generateAppraisalLetterPdfBuffer(payload, {
      issuedAt: context.issuedAt,
    });
  }

  if (documentType === 'contractual-letter') {
    return generateContractualLetterPdfBuffer(payload, {
      issuedAt: context.issuedAt,
    });
  }

  if (documentType === 'letter-of-intent') {
    return generateLetterOfIntentPdfBuffer(payload, {
      issuedAt: context.issuedAt,
    });
  }

  if (documentType === 'internship-offer-letter') {
    return generateInternshipOfferLetterPdfBuffer(payload, {
      issuedAt: context.issuedAt,
    });
  }

  if (documentType === 'internship-completion-certificate') {
    return generateInternshipCompletionCertificatePdfBuffer(payload, {
      issuedAt: context.issuedAt,
    });
  }

  if (documentType === 'internship-to-full-time-letter') {
    return generateInternshipToFullTimeLetterPdfBuffer(payload, {
      issuedAt: context.issuedAt,
    });
  }

  if (documentType === 'experience-letter') {
    return generateWorkExperienceLetterPdfBuffer(payload, {
      issuedAt: context.issuedAt,
    });
  }

  if (documentType === 'promotion-letter') {
    return generatePromotionLetterPdfBuffer(payload, {
      issuedAt: context.issuedAt,
    });
  }

  if (documentType === 'joining-letter') {
    return generateJoiningLetterPdfBuffer(payload, {
      issuedAt: context.issuedAt,
    });
  }

  if (documentType === 'probation-completion-letter') {
    return generateProbationCompletionLetterPdfBuffer(payload, {
      issuedAt: context.issuedAt,
    });
  }

  if (documentType === 'probation-offer-letter') {
    return generateProbationOfferLetterPdfBuffer(payload, {
      issuedAt: context.issuedAt,
    });
  }

  if (documentType === 'relieving-letter') {
    return generateRelievingLetterPdfBuffer(payload, {
      issuedAt: context.issuedAt,
    });
  }

  if (documentType === 'resignation-acceptance-letter') {
    return generateResignationAcceptanceLetterPdfBuffer(payload, {
      issuedAt: context.issuedAt,
    });
  }

  if (documentType === 'termination-letter') {
    return generateTerminationLetterPdfBuffer(payload, {
      issuedAt: context.issuedAt,
    });
  }

  if (documentType === 'warning-letter') {
    return generateWarningLetterPdfBuffer(payload, {
      issuedAt: context.issuedAt,
    });
  }

  if (documentType === 'warning-and-disciplinary-letter') {
    return generateWarningDisciplinaryLetterPdfBuffer(payload, {
      issuedAt: context.issuedAt,
    });
  }

  const specification = DOCUMENT_SPECIFICATIONS[documentType];
  const title = specification?.title || 'Document';

  const doc = new PDFDocument({ margin: 50 });
  const chunks = [];

  return new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('error', reject);
    doc.on('end', () => {
      const buffer = Buffer.concat(chunks);
      logger.info(`PDF generated for type: ${documentType}`);
      resolve(buffer);
    });

    addHeader(doc, title, documentType);

    doc.font('Helvetica-Bold').fontSize(12).text('Specification Fields').moveDown(0.3);

    (specification?.requiredFields || []).forEach((field) => {
      doc.font('Helvetica').fontSize(10).text(`- ${field}`);
    });

    doc.moveDown(0.8);
    doc.font('Helvetica-Bold').fontSize(12).text('Payload Content').moveDown(0.3);

    renderByDocumentType(doc, documentType, payload);

    doc.end();
  });
};
