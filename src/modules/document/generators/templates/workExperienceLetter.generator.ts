import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { COMPANY_NAME } from '../../config/commonDetail.config.ts';
import {
  CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
  WORK_EXPERIENCE_LETTER_DEFAULT_INTRO_PARAGRAPH,
  WORK_EXPERIENCE_LETTER_DEFAULT_PARAGRAPHS,
} from '../../config/document.config.ts';
import { LETTER_LAYOUT } from '../../config/letterLayout.config.ts';
import { TYPOGRAPHY } from '../../config/typography.config.ts';
import { embedDMSansFonts } from '../../utils/fontLoader.util.ts';
import { formatIssueDate } from '../../utils/formatIssueDate.util.ts';
import { loadSignatureImage } from '../../utils/loadSignatureImage.util.ts';
import { parseRichText } from '../../utils/parseRichText.util.ts';
import { drawSimpleLine } from '../../utils/pdfLineLayout.util.ts';
import { drawRichParagraph, textWidth } from '../../utils/pdfTextLayout.util.ts';
import { normalizeParagraphsWithDefaults } from '../../utils/paragraphs.util.ts';

const resolveIssueText = (issueDate, issuedAt) => {
  if (typeof issueDate === 'string' && issueDate.trim()) {
    return issueDate.trim();
  }
  if (issueDate || issuedAt) {
    return formatIssueDate(issueDate || issuedAt);
  }
  return '[Date of Issuance]';
};

const resolveWorkExperienceTemplate = (template, payload, companyName) => {
  const employeeFullName = payload.employeeName || "[Employee's Full Name]";
  const employeeNameShort = payload.employeeNameShort || "[Employee's Name]";
  const startDate = payload.startDate || payload.fromDate || '[Start Date]';
  const endDate = payload.endDate || payload.toDate || payload.lastWorkingDate || '[Last Working Date]';
  const jobTitle = payload.jobTitle || '[Job Title]';
  const department = payload.department || '[Department Name]';
  const pronoun = payload.pronoun || '[him/her]';
  const associationPronoun = payload.associationPronoun || '[his/her]';

  return String(template)
    .replace(/MetaUpSpace LLP/g, companyName)
    .replace(/\[Employee's Full Name\]/g, employeeFullName)
    .replace(/\[Employee's Name\]/g, employeeNameShort)
    .replace('[Start Date]', startDate)
    .replace('[Last Working Date]', endDate)
    .replace('[Job Title]', jobTitle)
    .replace('[Department Name]', department)
    .replace('[him/her]', pronoun)
    .replace('[his/her]', associationPronoun);
};

export const generateWorkExperienceLetterPdfBuffer = async (
  payload,
  { issuedAt } = { issuedAt: undefined }
) => {
  const letterheadPath = path.join(process.cwd(), 'public', 'letterhead.pdf');
  const letterheadBytes = await fs.readFile(letterheadPath);

  const letterheadDoc = await PDFDocument.load(letterheadBytes);
  const pdfDoc = await PDFDocument.create();

  const [templatePage] = await pdfDoc.copyPages(letterheadDoc, [0]);
  let page = pdfDoc.addPage(templatePage);

  const fonts = await embedDMSansFonts(pdfDoc);
  const regularFont = fonts.regular;
  const boldFont = fonts.bold;
  const italicFont = fonts.italic;
  const boldItalicFont = fonts.boldItalic;

  const pageWidth = page.getWidth();
  const topY = page.getHeight() - LETTER_LAYOUT.topOffset;
  const leftX = LETTER_LAYOUT.sidePadding;
  const rightX = pageWidth - LETTER_LAYOUT.sidePadding;
  const contentWidth = rightX - leftX;
  const minY = LETTER_LAYOUT.minY;

  let y = topY;

  const newTemplatePage = async () => {
    const [copied] = await pdfDoc.copyPages(letterheadDoc, [0]);
    page = pdfDoc.addPage(copied);
    y = topY;
  };

  const ensureSpace = async (requiredHeight) => {
    if (y - requiredHeight < minY) {
      await newTemplatePage();
    }
  };

  const drawParagraph = async (
    text,
    size = TYPOGRAPHY.body.size,
    lineGap = TYPOGRAPHY.body.lineGap
  ) =>
    drawRichParagraph({
      text,
      parseRichText,
      leftX,
      contentWidth,
      size,
      lineGap,
      paragraphSpacing: TYPOGRAPHY.paragraphSpacing,
      minY,
      fonts: {
        regular: regularFont,
        bold: boldFont,
        italic: italicFont,
        boldItalic: boldItalicFont,
      },
      pageAccess: {
        getPage: () => page,
        getY: () => y,
        setY: (nextY) => {
          y = nextY;
        },
        ensureSpace,
      },
    });

  const title = payload.title || 'WORK EXPERIENCE LETTER';
  const titleWidth = textWidth(boldFont, title, TYPOGRAPHY.heading1.size);
  await ensureSpace(58);
  page.drawText(title, {
    x: (pageWidth - titleWidth) / 2,
    y,
    size: TYPOGRAPHY.heading1.size,
    font: boldFont,
  });
  y -= 40;

  const issueText = resolveIssueText(payload.issueDate, issuedAt);
  const issueWidth = textWidth(boldFont, issueText, TYPOGRAPHY.bodyHighlighted.size);
  page.drawText(issueText, {
    x: rightX - issueWidth,
    y,
    size: TYPOGRAPHY.bodyHighlighted.size,
    font: boldFont,
  });
  y -= 30;

  await drawSimpleLine({
    text: payload.greeting || 'To Whom It May Concern,',
    font: boldFont,
    size: TYPOGRAPHY.bodyHighlighted.size,
    leftX,
    lineGap: TYPOGRAPHY.body.lineGap,
    pageAccess: {
      getPage: () => page,
      getY: () => y,
      setY: (nextY) => {
        y = nextY;
      },
      ensureSpace,
    },
  });

  y -= 10;

  const companyName = payload.companyName || COMPANY_NAME;
  const introParagraph =
    typeof payload.introParagraph === 'string' && payload.introParagraph.trim()
      ? payload.introParagraph.trim()
      : resolveWorkExperienceTemplate(WORK_EXPERIENCE_LETTER_DEFAULT_INTRO_PARAGRAPH, payload, companyName);

  await drawParagraph(introParagraph);

  const paragraphs = normalizeParagraphsWithDefaults(
    payload,
    WORK_EXPERIENCE_LETTER_DEFAULT_PARAGRAPHS
  ).map((paragraph) => resolveWorkExperienceTemplate(paragraph, payload, companyName));

  for (const paragraph of paragraphs) {
    await drawParagraph(paragraph);
  }

  y -= 4;
  await drawSimpleLine({
    text: payload.closingText || 'Sincerely,',
    font: boldFont,
    size: TYPOGRAPHY.bodyHighlighted.size,
    leftX,
    lineGap: TYPOGRAPHY.body.lineGap,
    pageAccess: {
      getPage: () => page,
      getY: () => y,
      setY: (nextY) => {
        y = nextY;
      },
      ensureSpace,
    },
  });

  y -= 16;

  const signatureImage = await loadSignatureImage(
    pdfDoc,
    payload.signatureUrl || CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL
  );

  if (signatureImage) {
    const maxWidth = LETTER_LAYOUT.signatureImage.maxWidth;
    const maxHeight = LETTER_LAYOUT.signatureImage.maxHeight;
    const ratio = Math.min(maxWidth / signatureImage.width, maxHeight / signatureImage.height);
    const drawWidth = signatureImage.width * ratio;
    const drawHeight = signatureImage.height * ratio;

    await ensureSpace(drawHeight + 72);
    page.drawImage(signatureImage, {
      x: leftX,
      y: y - drawHeight + 10,
      width: drawWidth,
      height: drawHeight,
    });
    y -= drawHeight + 8;
  } else {
    await ensureSpace(72);
  }

  await drawSimpleLine({
    text: payload.signatoryName || 'Sahil Jaiswal',
    font: boldFont,
    size: TYPOGRAPHY.bodyHighlighted.size,
    leftX,
    lineGap: TYPOGRAPHY.body.lineGap,
    pageAccess: {
      getPage: () => page,
      getY: () => y,
      setY: (nextY) => {
        y = nextY;
      },
      ensureSpace,
    },
  });
  await drawSimpleLine({
    text: payload.position || 'CEO & Founder',
    font: boldFont,
    size: TYPOGRAPHY.body.size,
    leftX,
    lineGap: TYPOGRAPHY.body.lineGap,
    pageAccess: {
      getPage: () => page,
      getY: () => y,
      setY: (nextY) => {
        y = nextY;
      },
      ensureSpace,
    },
  });
  await drawSimpleLine({
    text: payload.signatoryCompany || companyName,
    font: boldFont,
    size: TYPOGRAPHY.bodyHighlighted.size,
    leftX,
    lineGap: TYPOGRAPHY.body.lineGap,
    pageAccess: {
      getPage: () => page,
      getY: () => y,
      setY: (nextY) => {
        y = nextY;
      },
      ensureSpace,
    },
  });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
};
