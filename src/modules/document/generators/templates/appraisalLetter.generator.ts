import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { TYPOGRAPHY } from '../../config/typography.config.ts';
import { embedDMSansFonts } from '../../utils/fontLoader.util.ts';
import { COMPANY_NAME } from '../../config/commonDetail.config.ts';
import { formatIssueDate } from '../../utils/formatIssueDate.util.ts';
import { parseRichText } from '../../utils/parseRichText.util.ts';
import { loadSignatureImage } from '../../utils/loadSignatureImage.util.ts';
import { drawRichParagraph, textWidth } from '../../utils/pdfTextLayout.util.ts';
import { normalizeParagraphList } from '../../utils/paragraphs.util.ts';
import { LETTER_LAYOUT } from '../../config/letterLayout.config.ts';

export const generateAppraisalLetterPdfBuffer = async (
  payload,
  { issuedAt } = { issuedAt: undefined }
) => {
  const letterheadPath = path.join(process.cwd(), 'public', 'letterhead.pdf');
  const letterheadBytes = await fs.readFile(letterheadPath);

  const letterheadDoc = await PDFDocument.load(letterheadBytes);
  const pdfDoc = await PDFDocument.create();

  const [templatePage] = await pdfDoc.copyPages(letterheadDoc, [0]);
  let page = pdfDoc.addPage(templatePage);

  // Embed DM Sans fonts (production-ready, cached on first load)
  const fonts = await embedDMSansFonts(pdfDoc);
  const helvetica = fonts.regular;
  const helveticaBold = fonts.bold;
  const helveticaItalic = fonts.italic;
  const helveticaBoldItalic = fonts.boldItalic;

  const pageWidth = page.getWidth();
  const topY = page.getHeight() - LETTER_LAYOUT.topOffset; // keep safe-zone under letterhead banner
  const leftX = LETTER_LAYOUT.sidePadding;
  const rightX = pageWidth - LETTER_LAYOUT.sidePadding;
  const contentWidth = rightX - leftX;
  const minY = LETTER_LAYOUT.minY; // keep safe-zone above footer graphics but avoid early pagination

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
    font = helvetica,
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
        regular: font,
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

  const title = 'APPRAISAL LETTER';
  const titleWidth = textWidth(helveticaBold, title, TYPOGRAPHY.heading1.size);
  await ensureSpace(40);
  page.drawText(title, {
    x: (pageWidth - titleWidth) / 2,
    y,
    size: TYPOGRAPHY.heading1.size,
    font: helveticaBold,
  });
  y -= 28;

  const issueDate = formatIssueDate(issuedAt);
  const issueWidth = textWidth(helveticaBold, issueDate, TYPOGRAPHY.bodyHighlighted.size);
  page.drawText(issueDate, {
    x: rightX - issueWidth,
    y,
    size: TYPOGRAPHY.bodyHighlighted.size,
    font: helveticaBold,
  });
  y -= 24;

  const employeeName = payload.employeeName || 'Employee';

  page.drawText(`Dear ${employeeName},`, {
    x: leftX,
    y,
    size: TYPOGRAPHY.bodyHighlighted.size,
    font: helveticaBold,
  });
  y -= 26;

  const paragraphs = normalizeParagraphList(payload, 3);
  for (const paragraph of paragraphs) {
    await drawParagraph(paragraph, helvetica, 11, TYPOGRAPHY.body.lineGap);
  }

  const signatureImage = await loadSignatureImage(pdfDoc, payload.signatureUrl);
  let estimatedSignatureImageHeight = 0;
  if (signatureImage) {
    const maxW = LETTER_LAYOUT.signatureImage.maxWidth;
    const maxH = LETTER_LAYOUT.signatureImage.maxHeight;
    const ratio = Math.min(maxW / signatureImage.width, maxH / signatureImage.height);
    estimatedSignatureImageHeight = signatureImage.height * ratio;
  }

  // Keep only what is needed for the closing/signature block.
  const signatureBlockHeight =
    24 + // warm regards
    (estimatedSignatureImageHeight ? estimatedSignatureImageHeight + 8 : 0) +
    18 +
    17 +
    16 +
    8;

  await ensureSpace(signatureBlockHeight);
  page.drawText('Warm regards,', {
    x: leftX,
    y,
    size: TYPOGRAPHY.bodyHighlighted.size,
    font: helveticaBold,
  });
  y -= 24;

  if (signatureImage) {
    const maxW = LETTER_LAYOUT.signatureImage.maxWidth;
    const maxH = LETTER_LAYOUT.signatureImage.maxHeight;
    const ratio = Math.min(maxW / signatureImage.width, maxH / signatureImage.height);
    const drawW = signatureImage.width * ratio;
    const drawH = signatureImage.height * ratio;

    page.drawImage(signatureImage, {
      x: leftX,
      y: y - drawH + 12,
      width: drawW,
      height: drawH,
    });
    y -= drawH + 8;
  }

  page.drawText(payload.signatoryName || 'Authorized Signatory', {
    x: leftX,
    y,
    size: TYPOGRAPHY.bodyHighlighted.size,
    font: helveticaBold,
  });
  y -= 18;

  page.drawText(payload.position || 'Position', {
    x: leftX,
    y,
    size: TYPOGRAPHY.body.size,
    font: helvetica,
  });
  y -= 17;

  page.drawText(COMPANY_NAME, {
    x: leftX,
    y,
    size: TYPOGRAPHY.bodyHighlighted.size,
    font: helveticaBold,
  });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
};
