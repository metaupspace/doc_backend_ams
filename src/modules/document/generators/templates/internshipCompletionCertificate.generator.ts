import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { INTERNSHIP_COMPLETION_CERTIFICATE_DEFAULT_PARAGRAPHS } from '../../config/document.config.ts';
import { COMPANY_NAME } from '../../config/commonDetail.config.ts';
import { TYPOGRAPHY } from '../../config/typography.config.ts';
import { LETTER_LAYOUT } from '../../config/letterLayout.config.ts';
import { formatIssueDate } from '../../utils/formatIssueDate.util.ts';
import { parseRichText } from '../../utils/parseRichText.util.ts';
import { loadSignatureImage } from '../../utils/loadSignatureImage.util.ts';
import { embedDMSansFonts } from '../../utils/fontLoader.util.ts';
import { drawRichParagraph, textWidth } from '../../utils/pdfTextLayout.util.ts';
import { normalizeParagraphsWithDefaults } from '../../utils/paragraphs.util.ts';
import { drawSimpleLine } from '../../utils/pdfLineLayout.util.ts';

export const generateInternshipCompletionCertificatePdfBuffer = async (
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

  const title = payload.title || 'INTERNSHIP COMPLETION CERTIFICATE';
  const titleWidth = textWidth(helveticaBold, title, TYPOGRAPHY.heading2.size);
  await ensureSpace(58);
  page.drawText(title, {
    x: (pageWidth - titleWidth) / 2,
    y,
    size: TYPOGRAPHY.heading2.size,
    font: helveticaBold,
  });
  y -= 40;

  const issueText = formatIssueDate(payload.issueDate || issuedAt);
  const issueWidth = textWidth(helveticaBold, issueText, TYPOGRAPHY.bodyHighlighted.size);
  page.drawText(issueText, {
    x: rightX - issueWidth,
    y,
    size: TYPOGRAPHY.bodyHighlighted.size,
    font: helveticaBold,
  });
  y -= 30;

  await drawSimpleLine(
    {
      text: payload.greeting || 'To Whom It May Concern,',
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
    }
  );
  y -= 10;

  const startDate = payload.startDate || payload.fromDate || '[Start Date]';
  const endDate = payload.endDate || payload.toDate || '[End Date]';
  const internReference = payload.internReference || 'Mr./Ms.';
  const companyName = payload.companyName || COMPANY_NAME;

  const introParagraph =
    typeof payload.introParagraph === 'string' && payload.introParagraph.trim()
      ? payload.introParagraph.trim()
      : `This is to formally acknowledge that ${internReference} ${
          payload.employeeName || '[Intern Name]'
        } has completed an internship with ${companyName} in the ${
          payload.department || '[Department]'
        } department. The internship tenure commenced on ${startDate} and concluded on ${endDate}.`;

  await drawParagraph(introParagraph);

  const paragraphs = normalizeParagraphsWithDefaults(
    payload,
    INTERNSHIP_COMPLETION_CERTIFICATE_DEFAULT_PARAGRAPHS
  );
  for (const paragraph of paragraphs) {
    await drawParagraph(paragraph);
  }

  y -= 4;
  await drawSimpleLine(
    {
      text: payload.closingText || 'Warm regards,',
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
    }
  );
  y -= 54;

  const leftSignatureImage = await loadSignatureImage(
    pdfDoc,
    payload.leftSignatoryUrl || payload.signatureUrl
  );
  const rightSignatureImage = await loadSignatureImage(
    pdfDoc,
    payload.rightSignatoryUrl || payload.signatureUrl
  );

  const maxSignatureWidth = LETTER_LAYOUT.signatureImage.maxWidth;
  const maxSignatureHeight = LETTER_LAYOUT.signatureImage.maxHeight;

  const leftSignatureDims = leftSignatureImage
    ? (() => {
        const ratio = Math.min(
          maxSignatureWidth / leftSignatureImage.width,
          maxSignatureHeight / leftSignatureImage.height
        );
        return {
          width: leftSignatureImage.width * ratio,
          height: leftSignatureImage.height * ratio,
        };
      })()
    : null;

  const rightSignatureDims = rightSignatureImage
    ? (() => {
        const ratio = Math.min(
          maxSignatureWidth / rightSignatureImage.width,
          maxSignatureHeight / rightSignatureImage.height
        );
        return {
          width: rightSignatureImage.width * ratio,
          height: rightSignatureImage.height * ratio,
        };
      })()
    : null;

  const maxSignatureDrawHeight = Math.max(
    leftSignatureDims?.height || 0,
    rightSignatureDims?.height || 0
  );
  const signatoryLineGap = 18;

  const signatureBlockHeight =
    (maxSignatureDrawHeight ? maxSignatureDrawHeight : 0) +
    signatoryLineGap * 2;

  await ensureSpace(signatureBlockHeight);

  const columnWidth = (contentWidth - 32) / 2;
  const leftColumnX = leftX;
  const rightColumnX = leftX + columnWidth + 32;
  const signatureImageY = y;
  const signatureY = y - (maxSignatureDrawHeight ? maxSignatureDrawHeight : 0);

  const leftName = payload.leftSignatoryName || 'Sahil Jaiswal';
  const leftRole = payload.leftSignatoryRole || 'CEO & Founder';
  const leftCompany = payload.leftSignatoryCompany || companyName;

  const rightName = payload.rightSignatoryName || "Manager's Name";
  const rightRole = payload.rightSignatoryRole || `${payload.department || '[Department]'} Manager`;
  const rightCompany = payload.rightSignatoryCompany || companyName;

  if (leftSignatureImage && leftSignatureDims) {
    page.drawImage(leftSignatureImage, {
      x: leftColumnX,
      y: signatureImageY,
      width: leftSignatureDims.width,
      height: leftSignatureDims.height,
    });
  }

  if (rightSignatureImage && rightSignatureDims) {
    page.drawImage(rightSignatureImage, {
      x: rightColumnX,
      y: signatureImageY,
      width: rightSignatureDims.width,
      height: rightSignatureDims.height,
    });
  }

  page.drawText(String(leftName), {
    x: leftColumnX,
    y: signatureY,
    size: TYPOGRAPHY.bodyHighlighted.size,
    font: helveticaBold,
    maxWidth: columnWidth,
  });
  page.drawText(String(leftRole), {
    x: leftColumnX,
    y: signatureY - signatoryLineGap,
    size: TYPOGRAPHY.body.size,
    font: helveticaBold,
    maxWidth: columnWidth,
  });
  page.drawText(String(leftCompany), {
    x: leftColumnX,
    y: signatureY - signatoryLineGap * 2,
    size: TYPOGRAPHY.bodyHighlighted.size,
    font: helveticaBold,
    maxWidth: columnWidth,
  });

  page.drawText(String(rightName), {
    x: rightColumnX,
    y: signatureY,
    size: TYPOGRAPHY.bodyHighlighted.size,
    font: helveticaBold,
    maxWidth: columnWidth,
  });
  page.drawText(String(rightRole), {
    x: rightColumnX,
    y: signatureY - signatoryLineGap,
    size: TYPOGRAPHY.body.size,
    font: helveticaBold,
    maxWidth: columnWidth,
  });
  page.drawText(String(rightCompany), {
    x: rightColumnX,
    y: signatureY - signatoryLineGap * 2,
    size: TYPOGRAPHY.bodyHighlighted.size,
    font: helveticaBold,
    maxWidth: columnWidth,
  });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
};
