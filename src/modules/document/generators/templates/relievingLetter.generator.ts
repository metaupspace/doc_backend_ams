import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { COMPANY_NAME } from '../../config/commonDetail.config.ts';
import {
  CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
  RELIEVING_LETTER_DEFAULT_INTRO_PARAGRAPH,
  RELIEVING_LETTER_DEFAULT_PARAGRAPHS,
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

const resolveRelievingTemplate = (template, payload, companyName) => {
  const employeeName = payload.employeeName || '[Employee_Name]';
  const employeeNo = payload.employeeNo || '[EMP No ]';
  const jobTitle = payload.jobTitle || payload.designation || '[Job_Ttle]';
  const department = payload.department || '[Job_Department]';
  const joiningDate = payload.joiningDate || '[Joining_Date]';
  const lastDay = payload.lastDay || payload.lastWorkingDate || '[Last_Day]';

  return String(template)
    .replace(/MetaUpSpace LLP/g, companyName)
    .replace('[Employee_Name]', employeeName)
    .replace('[EMP No ]', employeeNo)
    .replace('[Job_Ttle]', jobTitle)
    .replace('[Job_Department]', department)
    .replace('[Joining_Date]', joiningDate)
    .replace('[Last_Day]', lastDay);
};

export const generateRelievingLetterPdfBuffer = async (
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

  const title = payload.title || 'RELIEVING LETTER';
  const titleWidth = textWidth(boldFont, title, TYPOGRAPHY.heading1.size);
  await ensureSpace(58);
  page.drawText(title, {
    x: (pageWidth - titleWidth) / 2,
    y,
    size: TYPOGRAPHY.heading1.size,
    font: boldFont,
  });
  y -= 40;

  const issueText = payload.issueDate || issuedAt ? formatIssueDate(payload.issueDate || issuedAt) : '[Date of Issuance]';
  const issueWidth = textWidth(boldFont, issueText, TYPOGRAPHY.bodyHighlighted.size);
  page.drawText(issueText, {
    x: rightX - issueWidth,
    y,
    size: TYPOGRAPHY.bodyHighlighted.size,
    font: boldFont,
  });
  y -= 30;

  await drawSimpleLine({
    text: payload.greeting || 'To Whomsoever Concerned,',
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
      : resolveRelievingTemplate(RELIEVING_LETTER_DEFAULT_INTRO_PARAGRAPH, payload, companyName);

  await drawParagraph(introParagraph);

  const paragraphs = normalizeParagraphsWithDefaults(payload, RELIEVING_LETTER_DEFAULT_PARAGRAPHS).map(
    (paragraph) => resolveRelievingTemplate(paragraph, payload, companyName)
  );

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
    4 +
    closingLineHeight +
    signatureLeadGap +
    signatureDrawHeight +
    signatureImageGap +
    signatureNameHeight +
    signatureMetaHeight +
    signatureMetaHeight;

  await ensureSpace(signatureBlockHeight);

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
