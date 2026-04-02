import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { TYPOGRAPHY } from '../../config/typography.config.ts';
import { embedDMSansFonts } from '../../utils/fontLoader.util.ts';
import { COMPANY_NAME } from '../../config/commonDetail.config.ts';
import { formatIssueDate } from '../../utils/formatIssueDate.util.ts';
import { decodeHtmlEntities } from '../../utils/decodeHtmlEntities.util.ts';

const normalizeParagraphs = (payload) => {
  if (Array.isArray(payload.paragraphs)) {
    return payload.paragraphs.filter(Boolean).slice(0, 3);
  }

  return [payload.paragraph1, payload.paragraph2, payload.paragraph3].filter(Boolean);
};

const parseRichText = (htmlLikeText) => {
  const input = String(htmlLikeText || '');
  const parts = input.split(/(<[^>]+>)/g).filter(Boolean);
  const tokens = [];

  const style = {
    bold: false,
    italic: false,
    underline: false,
  };

  const pushText = (value) => {
    const decoded = decodeHtmlEntities(value);
    if (!decoded) return;
    tokens.push({
      type: 'text',
      text: decoded,
      style: {
        bold: style.bold,
        italic: style.italic,
        underline: style.underline,
      },
    });
  };

  for (const part of parts) {
    if (!part.startsWith('<')) {
      pushText(part);
      continue;
    }

    const tag = part.toLowerCase().replace(/\s+/g, '');
    if (tag === '<br>' || tag === '<br/>' || tag === '<br/ >') {
      tokens.push({ type: 'newline' });
      continue;
    }

    if (tag === '<p>' || tag === '<div>') {
      continue;
    }

    if (tag === '</p>' || tag === '</div>') {
      tokens.push({ type: 'newline' });
      continue;
    }

    if (tag === '<li>') {
      pushText('• ');
      continue;
    }

    if (tag === '</li>') {
      tokens.push({ type: 'newline' });
      continue;
    }

    if (tag === '<b>' || tag === '<strong>') {
      style.bold = true;
      continue;
    }

    if (tag === '</b>' || tag === '</strong>') {
      style.bold = false;
      continue;
    }

    if (tag === '<i>' || tag === '<em>') {
      style.italic = true;
      continue;
    }

    if (tag === '</i>' || tag === '</em>') {
      style.italic = false;
      continue;
    }

    if (tag === '<u>') {
      style.underline = true;
      continue;
    }

    if (tag === '</u>') {
      style.underline = false;
      continue;
    }
  }

  return tokens;
};

const textWidth = (font, text, size) => font.widthOfTextAtSize(text, size);

const loadSignatureImage = async (pdfDoc, signatureUrl) => {
  if (!signatureUrl || typeof signatureUrl !== 'string') {
    return null;
  }

  try {
    const response = await fetch(signatureUrl);
    if (!response.ok) return null;
    const imageBytes = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('png')) {
      return pdfDoc.embedPng(imageBytes);
    }
    if (contentType.includes('jpeg') || contentType.includes('jpg')) {
      return pdfDoc.embedJpg(imageBytes);
    }
    return null;
  } catch {
    return null;
  }
};

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
  const topY = page.getHeight() - 160; // keep safe-zone under letterhead banner
  const leftX = 48;
  const rightX = pageWidth - 48;
  const contentWidth = rightX - leftX;
  const minY = 96; // keep safe-zone above footer graphics but avoid early pagination

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
  ) => {
    const lineHeight = size + lineGap;
    const tokens = parseRichText(text);
    const currentLine = [];
    let currentLineWidth = 0;

    const fontForStyle = (styleInfo) => {
      if (styleInfo.bold && styleInfo.italic) return helveticaBoldItalic;
      if (styleInfo.bold) return helveticaBold;
      if (styleInfo.italic) return helveticaItalic;
      return font;
    };

    const drawLine = async () => {
      if (currentLine.length === 0) return;

      await ensureSpace(lineHeight);
      let cursorX = leftX;

      for (const segment of currentLine) {
        const segmentFont = fontForStyle(segment.style);
        const segmentWidth = textWidth(segmentFont, segment.text, size);

        page.drawText(segment.text, {
          x: cursorX,
          y,
          size,
          font: segmentFont,
        });

        if (segment.style.underline) {
          page.drawLine({
            start: { x: cursorX, y: y - 1.5 },
            end: { x: cursorX + segmentWidth, y: y - 1.5 },
            thickness: 0.8,
          });
        }

        cursorX += segmentWidth;
      }

      currentLine.length = 0;
      currentLineWidth = 0;
      y -= lineHeight;
    };

    const pushChunk = async (chunk, styleInfo) => {
      if (!chunk) return;
      if (/^\s+$/.test(chunk) && currentLine.length === 0) return;

      const chunkFont = fontForStyle(styleInfo);
      const chunkWidth = textWidth(chunkFont, chunk, size);

      if (
        !/^\s+$/.test(chunk) &&
        currentLineWidth + chunkWidth > contentWidth &&
        currentLine.length > 0
      ) {
        await drawLine();
      }

      // If a single chunk is still too long, split by characters.
      if (!/^\s+$/.test(chunk) && chunkWidth > contentWidth) {
        let buffer = '';
        for (const char of chunk) {
          const candidate = `${buffer}${char}`;
          const candidateWidth = textWidth(chunkFont, candidate, size);
          if (candidateWidth > contentWidth && buffer) {
            currentLine.push({ text: buffer, style: styleInfo });
            currentLineWidth += textWidth(chunkFont, buffer, size);
            await drawLine();
            buffer = char;
          } else {
            buffer = candidate;
          }
        }
        if (buffer) {
          currentLine.push({ text: buffer, style: styleInfo });
          currentLineWidth += textWidth(chunkFont, buffer, size);
        }
        return;
      }

      currentLine.push({ text: chunk, style: styleInfo });
      currentLineWidth += chunkWidth;
    };

    for (const token of tokens) {
      if (token.type === 'newline') {
        await drawLine();
        continue;
      }

      const chunks = token.text.split(/(\s+)/).filter((c) => c.length > 0);
      for (const chunk of chunks) {
        await pushChunk(chunk, token.style);
      }
    }

    await drawLine();

    // Keep paragraph gap only when it does not force a pointless page break.
    if (y - TYPOGRAPHY.paragraphSpacing >= minY) {
      y -= TYPOGRAPHY.paragraphSpacing;
    }
  };

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

  const paragraphs = normalizeParagraphs(payload);
  for (const paragraph of paragraphs) {
    await drawParagraph(paragraph, helvetica, 11, TYPOGRAPHY.body.lineGap);
  }

  const signatureImage = await loadSignatureImage(pdfDoc, payload.signatureUrl);
  let estimatedSignatureImageHeight = 0;
  if (signatureImage) {
    const maxW = 220;
    const maxH = 80;
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
    const maxW = 220;
    const maxH = 80;
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
