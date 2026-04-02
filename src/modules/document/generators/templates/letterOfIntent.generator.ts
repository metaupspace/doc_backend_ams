import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { COMPANY_NAME } from '../../config/commonDetail.config.ts';
import {
  CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
  LETTER_OF_INTENT_DEFAULT_INTRO_PARAGRAPHS,
  LETTER_OF_INTENT_DEFAULT_PARAGRAPHS,
} from '../../config/document.config.ts';
import { LETTER_LAYOUT } from '../../config/letterLayout.config.ts';
import { TYPOGRAPHY } from '../../config/typography.config.ts';
import { embedDMSansFonts } from '../../utils/fontLoader.util.ts';
import { formatIssueDate } from '../../utils/formatIssueDate.util.ts';
import { loadSignatureImage } from '../../utils/loadSignatureImage.util.ts';
import { parseRichText } from '../../utils/parseRichText.util.ts';
import { drawBulletLabelValue, drawSimpleLine } from '../../utils/pdfLineLayout.util.ts';
import { drawRichParagraph, textWidth } from '../../utils/pdfTextLayout.util.ts';

export const generateLetterOfIntentPdfBuffer = async (
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

  const normalizeIntroParagraphs = () => {
    if (Array.isArray(payload.introParagraphs)) {
      return payload.introParagraphs.filter(Boolean).slice(0, 2);
    }

    const introParagraphsFromFields = [payload.introParagraph1, payload.introParagraph2].filter(Boolean);
    if (introParagraphsFromFields.length > 0) {
      return introParagraphsFromFields.slice(0, 2);
    }

    if (typeof payload.introParagraph === 'string' && payload.introParagraph.trim()) {
      const sentences = payload.introParagraph
        .split(/(?<=[.!?])\s+(?=[A-Z])/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

      if (sentences.length > 0) {
        return sentences.slice(0, 2);
      }
    }

    return [...LETTER_OF_INTENT_DEFAULT_INTRO_PARAGRAPHS];
  };

  const normalizeBodyParagraphs = () => {
    const inputParagraphs = Array.isArray(payload.paragraphs)
      ? payload.paragraphs.filter(Boolean)
      : [payload.paragraph1, payload.paragraph2, payload.paragraph3].filter(Boolean);

    if (inputParagraphs.length > 0) {
      return inputParagraphs.slice(0, 2);
    }

    return [...LETTER_OF_INTENT_DEFAULT_PARAGRAPHS].slice(0, 2);
  };

  const title = payload.title || 'LETTER OF INTENT';
  const titleWidth = textWidth(boldFont, title, TYPOGRAPHY.heading1.size);
  await ensureSpace(58);
  page.drawText(title, {
    x: (pageWidth - titleWidth) / 2,
    y,
    size: TYPOGRAPHY.heading1.size,
    font: boldFont,
  });
  y -= 40;

  const issueLabel = `${formatIssueDate(payload.issueDate || issuedAt)}`;
  const issueWidth = textWidth(boldFont, issueLabel, TYPOGRAPHY.bodyHighlighted.size);
  page.drawText(issueLabel, {
    x: rightX - issueWidth,
    y,
    size: TYPOGRAPHY.bodyHighlighted.size,
    font: boldFont,
  });
  y -= 30;

  await drawSimpleLine({
    text: payload.greeting || `Dear ${payload.employeeName || "Employee's Name"},`,
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

  y -= 2;

  await drawSimpleLine({
    text: 'Congratulations!',
    font: boldFont,
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

  const companyName = payload.companyName || COMPANY_NAME;
  const introParagraphs = normalizeIntroParagraphs();
  for (const paragraph of introParagraphs) {
    await drawParagraph(paragraph);
  }

  await drawSimpleLine({
    text:
      payload.keyDetailsTitle || 'Please find below the indicative terms of this proposed engagement:',
    font: regularFont,
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

  const keyTerms = [
    { label: 'Position Title', value: payload.positionTitle || payload.jobTitle },
    { label: 'Department', value: payload.department },
    { label: 'Employment Type', value: payload.employmentType },
    { label: 'Reporting Manager', value: payload.reportingManager },
    { label: 'Expected Start Date', value: payload.expectedStartDate },
    { label: 'Work Location', value: payload.workLocation || payload.location },
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

  y -= TYPOGRAPHY.paragraphSpacing;

  const paragraphs = normalizeBodyParagraphs();
  for (const paragraph of paragraphs) {
    await drawParagraph(paragraph);
  }

  const contactParagraph = typeof payload.contactParagraph === 'string' ? payload.contactParagraph.trim() : '';
  if (contactParagraph) {
    await drawParagraph(contactParagraph);
  }

  const signatureImage = await loadSignatureImage(
    pdfDoc,
    payload.signatureUrl || CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL
  );

  let signatureDrawHeight = 0;
  if (signatureImage) {
    const maxWidth = LETTER_LAYOUT.signatureImage.maxWidth;
    const maxHeight = LETTER_LAYOUT.signatureImage.maxHeight;
    const ratio = Math.min(maxWidth / signatureImage.width, maxHeight / signatureImage.height);
    signatureDrawHeight = signatureImage.height * ratio;
  }

  const closingLineHeight = TYPOGRAPHY.bodyHighlighted.size + TYPOGRAPHY.body.lineGap;
  const signatureNameHeight = TYPOGRAPHY.bodyHighlighted.size + TYPOGRAPHY.body.lineGap;
  const signatureMetaHeight = TYPOGRAPHY.body.size + TYPOGRAPHY.body.lineGap;
  const signatureLeadGap = 24;
  const signatureImageGap = signatureDrawHeight ? 4 : 0;
  const signatureBlockHeight =
    2 +
    closingLineHeight +
    signatureLeadGap +
    signatureDrawHeight +
    signatureImageGap +
    signatureNameHeight +
    signatureMetaHeight +
    signatureMetaHeight;

  await ensureSpace(signatureBlockHeight);

  y -= 2;
  await drawSimpleLine({
    text: payload.closingText || 'Warm regards,',
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
      y: y - signatureDrawHeight + 10,
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
    text: payload.position || 'Position',
    font: regularFont,
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
    text: payload.companyName || companyName,
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