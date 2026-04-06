import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import {
  CONTRACTUAL_LETTER_DEFAULT_PARAGRAPHS,
  CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
} from '../../config/document.config.ts';
import { COMPANY_NAME } from '../../config/commonDetail.config.ts';
import { TYPOGRAPHY } from '../../config/typography.config.ts';
import { LETTER_LAYOUT } from '../../config/letterLayout.config.ts';
import { formatIssueDate } from '../../utils/formatIssueDate.util.ts';
import { parseRichText } from '../../utils/parseRichText.util.ts';
import { loadSignatureImage } from '../../utils/loadSignatureImage.util.ts';
import { embedDMSansFonts } from '../../utils/fontLoader.util.ts';
import { drawRichParagraph, textWidth } from '../../utils/pdfTextLayout.util.ts';
import { normalizeParagraphsWithDefaults } from '../../utils/paragraphs.util.ts';
import { drawBulletLabelValue, drawSimpleLine } from '../../utils/pdfLineLayout.util.ts';

const SECTION_SPACING = 8;

const resolveContractualPlaceholders = (text, payload) => {
  const positionTitle =
    payload.positionTitle || payload.jobTitle || payload.designation || 'the stated role';
  const startDate = payload.startDate || 'the stated start date';
  const endDate = payload.endDate || payload.contractEndDate || 'the stated end date';
  const companyName = payload.companyName || COMPANY_NAME;

  return String(text || '')
    .replaceAll('[Position Title]', String(positionTitle))
    .replaceAll('[Start Date]', String(startDate))
    .replaceAll('[End Date]', String(endDate))
    .replaceAll('[Company Name]', String(companyName));
};

export const generateContractualLetterPdfBuffer = async (
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
  const helvetica = fonts.regular;
  const helveticaBold = fonts.bold;
  const helveticaItalic = fonts.italic;
  const helveticaBoldItalic = fonts.boldItalic;

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
        regular: helvetica,
        bold: helveticaBold,
        italic: helveticaItalic,
        boldItalic: helveticaBoldItalic,
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

  const title = 'CONTRACTUAL LETTER';
  const titleWidth = textWidth(helveticaBold, title, TYPOGRAPHY.heading1.size);
  await ensureSpace(20);
  page.drawText(title, {
    x: (pageWidth - titleWidth) / 2,
    y,
    size: TYPOGRAPHY.heading1.size,
    font: helveticaBold,
  });
  y -= 20;

  const issueDate = formatIssueDate(issuedAt);
  const issueLabel = `${issueDate}`;
  const issueWidth = textWidth(helveticaBold, issueLabel, TYPOGRAPHY.bodyHighlighted.size);
  page.drawText(issueLabel, {
    x: rightX - issueWidth,
    y,
    size: TYPOGRAPHY.bodyHighlighted.size,
    font: helveticaBold,
  });
  y -= 10;

  await drawSimpleLine({
    text: `Dear ${payload.employeeName},`,
    font: helveticaBold,
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

  await drawSimpleLine({
    text: 'Congratulations!',
    font: helveticaBold,
    size: 13,
    indent: 26,
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

  const introParagraph =
    typeof payload.introParagraph === 'string'
      ? resolveContractualPlaceholders(payload.introParagraph.trim(), payload)
      : '';
  if (introParagraph) {
    await drawParagraph(introParagraph);
  }

  await drawSimpleLine({
    text: 'Below are the key terms of your engagement:',
    font: helvetica,
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
  y -= 2;

  const keyTerms = [
    { label: 'Position Title', value: payload.jobTitle || payload.positionTitle || payload.designation },
    { label: 'Department', value: payload.department },
    { label: 'Reporting Manager', value: payload.reportingManager },
    { label: 'Start Date', value: payload.startDate },
    { label: 'End Date', value: payload.endDate || payload.contractEndDate },
    { label: 'Contract Duration', value: payload.contractDuration },
    {
      label: 'Employment Type',
      value: payload.employmentType || 'Fixed-Term Contractual',
    },
    { label: 'Salary / Stipend', value: payload.salaryOrStipend || payload.compensation || payload.stipend },
    { label: 'Work Location', value: payload.workLocation || 'Remote' },
    { label: 'Acceptance Deadline', value: payload.acceptanceDeadline },
  ];

  for (const term of keyTerms) {
    if (term.value === undefined || term.value === null || String(term.value).trim() === '') {
      continue;
    }
    await drawBulletLabelValue({
      label: term.label,
      value: term.value,
      valueBold: false,
      indent: 5,
      leftX,
      size: TYPOGRAPHY.body.size,
      lineGap: TYPOGRAPHY.body.lineGap,
      labelFont: helveticaBold,
      valueFont: helvetica,
      valueFontBold: helveticaBold,
      pageAccess: {
        getPage: () => page,
        getY: () => y,
        setY: (nextY) => {
          y = nextY;
        },
        ensureSpace,
      },
    });
  }

  y -= SECTION_SPACING;

  const paragraphs = normalizeParagraphsWithDefaults(payload, CONTRACTUAL_LETTER_DEFAULT_PARAGRAPHS);
  for (const paragraph of paragraphs) {
    await drawParagraph(resolveContractualPlaceholders(paragraph, payload));
  }

  const contactParagraph =
    typeof payload.contactParagraph === 'string'
      ? resolveContractualPlaceholders(payload.contactParagraph.trim(), payload)
      : '';
  if (contactParagraph) {
    await drawParagraph(contactParagraph);
  }

  y -= 2;
  await drawSimpleLine({
    text: 'Sincerely,',
    font: helveticaBold,
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

  const signatureImage = await loadSignatureImage(
    pdfDoc,
    payload.signatureUrl || CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL
  );
  if (signatureImage) {
    const maxW = LETTER_LAYOUT.signatureImage.maxWidth;
    const maxH = LETTER_LAYOUT.signatureImage.maxHeight;
    const ratio = Math.min(maxW / signatureImage.width, maxH / signatureImage.height);
    const drawW = signatureImage.width * ratio;
    const drawH = signatureImage.height * ratio;

    await ensureSpace(drawH + 70);
    page.drawImage(signatureImage, {
      x: leftX,
      y: y - drawH + 12,
      width: drawW,
      height: drawH,
    });
    y -= drawH + 8;
  } else {
    await ensureSpace(70);
  }

  await drawSimpleLine({
    text: payload.signatoryName,
    font: helveticaBold,
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
    text: payload.position,
    font: helveticaBold,
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
    text: COMPANY_NAME,
    font: helveticaBold,
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
