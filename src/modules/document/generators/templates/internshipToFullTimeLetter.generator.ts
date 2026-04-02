import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { COMPANY_NAME } from '../../config/commonDetail.config.ts';
import {
  INTERNSHIP_TO_FULL_TIME_LETTER_DEFAULT_PARAGRAPHS,
} from '../../config/document.config.ts';
import { LETTER_LAYOUT } from '../../config/letterLayout.config.ts';
import { TYPOGRAPHY } from '../../config/typography.config.ts';
import { embedDMSansFonts } from '../../utils/fontLoader.util.ts';
import { formatIssueDate } from '../../utils/formatIssueDate.util.ts';
import { loadSignatureImage } from '../../utils/loadSignatureImage.util.ts';
import { parseRichText } from '../../utils/parseRichText.util.ts';
import { drawBulletLabelValue, drawSimpleLine } from '../../utils/pdfLineLayout.util.ts';
import { drawRichParagraph, textWidth } from '../../utils/pdfTextLayout.util.ts';
import { normalizeParagraphsWithDefaults } from '../../utils/paragraphs.util.ts';

export const generateInternshipToFullTimeLetterPdfBuffer = async (
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
    size = TYPOGRAPHY.bodyHighlighted.size,
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

  const title = payload.title || 'OFFER LETTER';
  const titleWidth = textWidth(boldFont, title, TYPOGRAPHY.heading1.size);
  await ensureSpace(40);
  page.drawText(title, {
    x: (pageWidth - titleWidth) / 2,
    y,
    size: TYPOGRAPHY.heading1.size,
    font: boldFont,
  });
  y -= 28;

  const issueText = formatIssueDate(payload.issueDate || issuedAt);
  const issueWidth = textWidth(boldFont, issueText, TYPOGRAPHY.bodyHighlighted.size);
  page.drawText(issueText, {
    x: rightX - issueWidth,
    y,
    size: TYPOGRAPHY.bodyHighlighted.size,
    font: boldFont,
  });
  y -= 30;

  await drawSimpleLine({
    text: payload.greeting || `Dear ${payload.employeeName || 'Employee'},`,
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

  y -= 8;

  await drawSimpleLine({
    text: payload.congratsText || 'Congratulations!',
    font: boldFont,
    size: 13,
    indent: 30,
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

  const companyName = payload.companyName || COMPANY_NAME;
  const introParagraph =
    typeof payload.introParagraph === 'string' && payload.introParagraph.trim()
      ? payload.introParagraph.trim()
      : `In continuation to our recent discussions regarding your ${
          payload.employmentType || 'Full-Time Employment'
        } at ${companyName}, we are pleased to extend this offer letter. We are highly impressed by your performance, dedication, and alignment with the company's values during your internship period.`;

  await drawParagraph(introParagraph);

  const termsTitle = payload.termsTitle || 'We are pleased to extend the following full-time offer:';
  await drawSimpleLine({
    text: termsTitle,
    font: regularFont,
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

  const terms = [
    { label: 'Position Title', value: payload.positionTitle, bold: false },
    { label: 'Department', value: payload.department, bold: false },
    { label: 'Reporting Manager', value: payload.reportingManager, bold: false },
    { label: 'Expected Start Date', value: payload.expectedStartDate, bold: false },
    { label: 'Minimum Serving / Bond Duration', value: payload.bondDuration, bold: false },
    {
      label: 'Employment Type',
      value: payload.employmentType || 'Full-Time',
      bold: false,
    },
    {
      label: 'Work Schedule',
      value: payload.workSchedule || 'Flexible working hours',
      bold: false,
    },
    { label: 'Work Location', value: payload.workLocation || 'Remote', bold: false },
    { label: 'Salary / Stipend', value: payload.salaryOrStipend, bold: false },
    { label: 'Acceptance Deadline', value: payload.acceptanceDeadline, bold: false },
  ];

  for (const term of terms) {
    if (term.value) {
      await drawBulletLabelValue({
        label: term.label,
        value: term.value,
        valueBold: term.bold,
        indent: 5,
        leftX,
        size: TYPOGRAPHY.bodyHighlighted.size,
        lineGap: TYPOGRAPHY.body.lineGap,
        labelFont: boldFont,
        valueFont: regularFont,
        valueFontBold: boldFont,
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
  }

  y -= 8;

  const paragraphs = normalizeParagraphsWithDefaults(
    payload,
    INTERNSHIP_TO_FULL_TIME_LETTER_DEFAULT_PARAGRAPHS
  );

  for (const paragraph of paragraphs) {
    await drawParagraph(paragraph);
  }

  if (payload.contactParagraph) {
    await drawParagraph(payload.contactParagraph);
  }

  const signatureImage = await loadSignatureImage(pdfDoc, payload.signatureUrl);
  let signatureDrawHeight = 0;

  if (signatureImage) {
    const maxWidth = LETTER_LAYOUT.signatureImage.maxWidth;
    const maxHeight = LETTER_LAYOUT.signatureImage.maxHeight;
    const ratio = Math.min(maxWidth / signatureImage.width, maxHeight / signatureImage.height);
    signatureDrawHeight = signatureImage.height * ratio;
  }

  const closingLineHeight = TYPOGRAPHY.bodyHighlighted.size + TYPOGRAPHY.body.lineGap;
  const positionLineHeight = TYPOGRAPHY.body.size + TYPOGRAPHY.body.lineGap;
  const companyLineHeight = TYPOGRAPHY.bodyHighlighted.size + TYPOGRAPHY.body.lineGap;
  const signatureLeadGap = 28;
  const signatureImageGap = signatureDrawHeight ? 4 : 0;
  const signatureBlockHeight =
    4 +
    closingLineHeight +
    signatureLeadGap +
    signatureDrawHeight +
    signatureImageGap +
    companyLineHeight +
    positionLineHeight +
    companyLineHeight;

  await ensureSpace(signatureBlockHeight);

  y -= 4;
  await drawSimpleLine({
    text: payload.closingText || 'Warm Regards,',
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

  y -= signatureLeadGap;

  if (signatureImage) {
    const maxWidth = LETTER_LAYOUT.signatureImage.maxWidth;
    const maxHeight = LETTER_LAYOUT.signatureImage.maxHeight;
    const ratio = Math.min(maxWidth / signatureImage.width, maxHeight / signatureImage.height);
    const drawWidth = signatureImage.width * ratio;

    page.drawImage(signatureImage, {
      x: leftX,
      y: y - signatureDrawHeight + 12,
      width: drawWidth,
      height: signatureDrawHeight,
    });

    y -= signatureDrawHeight + 4;
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