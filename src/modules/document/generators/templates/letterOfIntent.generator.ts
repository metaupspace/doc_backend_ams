import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import {
  CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
  LETTER_OF_INTENT_DEFAULT_PARAGRAPHS,
} from '../../config/document.config.ts';

const COMPANY_NAME = 'MetaUpSpace LLP';

const TYPOGRAPHY = {
  headingSize: 24,
  bodySize: 11,
  bodyLineGap: 6,
  greetingSize: 12,
  issueSize: 11,
  sectionSpacing: 8,
  paragraphSpacing: 7,
  signatureNameSize: 12,
  signatureMetaSize: 11,
};

const formatIssueDate = (value) => {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) {
    return new Date().toLocaleDateString('en-GB');
  }
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const decodeHtmlEntities = (text) => {
  return String(text)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
};

const parseRichText = (htmlLikeText) => {
  const input = String(htmlLikeText || '');
  const parts = input.split(/(<[^>]+>)/g).filter(Boolean);
  const tokens = [];

  const style = { bold: false, italic: false, underline: false };

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
    if (tag === '<p>' || tag === '<div>') continue;
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

const normalizeParagraphs = (payload) => {
  const inputParagraphs = Array.isArray(payload.paragraphs)
    ? payload.paragraphs.filter(Boolean)
    : [payload.paragraph1, payload.paragraph2, payload.paragraph3].filter(Boolean);

  if (inputParagraphs.length > 0) {
    return inputParagraphs;
  }

  return [...LETTER_OF_INTENT_DEFAULT_PARAGRAPHS];
};

const loadSignatureImage = async (pdfDoc, signatureUrl) => {
  if (!signatureUrl || typeof signatureUrl !== 'string') {
    return null;
  }

  try {
    const response = await fetch(signatureUrl);
    if (!response.ok) return null;
    const imageBytes = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('png')) return pdfDoc.embedPng(imageBytes);
    if (contentType.includes('jpeg') || contentType.includes('jpg'))
      return pdfDoc.embedJpg(imageBytes);
    return null;
  } catch {
    return null;
  }
};

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

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const helveticaBoldItalic = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

  const pageWidth = page.getWidth();
  const topY = page.getHeight() - 160;
  const leftX = 34;
  const rightX = pageWidth - 34;
  const contentWidth = rightX - leftX;
  const minY = 96;

  let y = topY;

  const textWidth = (font, text, size) => font.widthOfTextAtSize(text, size);

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

  const drawLineRich = async (line, size, lineHeight, fontPicker) => {
    if (line.length === 0) return;
    await ensureSpace(lineHeight);
    let cursorX = leftX;

    for (const segment of line) {
      const segmentFont = fontPicker(segment.style);
      const segmentWidth = textWidth(segmentFont, segment.text, size);

      page.drawText(segment.text, { x: cursorX, y, size, font: segmentFont });

      if (segment.style.underline) {
        page.drawLine({
          start: { x: cursorX, y: y - 1.5 },
          end: { x: cursorX + segmentWidth, y: y - 1.5 },
          thickness: 0.8,
        });
      }

      cursorX += segmentWidth;
    }

    y -= lineHeight;
  };

  const drawParagraph = async (
    text,
    size = TYPOGRAPHY.bodySize,
    lineGap = TYPOGRAPHY.bodyLineGap
  ) => {
    const lineHeight = size + lineGap;
    const tokens = parseRichText(text);
    const currentLine = [];
    let currentLineWidth = 0;

    const fontForStyle = (styleInfo) => {
      if (styleInfo.bold && styleInfo.italic) return helveticaBoldItalic;
      if (styleInfo.bold) return helveticaBold;
      if (styleInfo.italic) return helveticaItalic;
      return helvetica;
    };

    const flushLine = async () => {
      await drawLineRich(currentLine, size, lineHeight, fontForStyle);
      currentLine.length = 0;
      currentLineWidth = 0;
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
        await flushLine();
      }

      currentLine.push({ text: chunk, style: styleInfo });
      currentLineWidth += chunkWidth;
    };

    for (const token of tokens) {
      if (token.type === 'newline') {
        await flushLine();
        continue;
      }

      const chunks = token.text.split(/(\s+)/).filter((c) => c.length > 0);
      for (const chunk of chunks) {
        await pushChunk(chunk, token.style);
      }
    }

    await flushLine();

    if (y - TYPOGRAPHY.paragraphSpacing >= minY) {
      y -= TYPOGRAPHY.paragraphSpacing;
    }
  };

  const drawSimpleLine = async (text, font = helvetica, size = TYPOGRAPHY.bodySize, indent = 0) => {
    const lineHeight = size + TYPOGRAPHY.bodyLineGap;
    await ensureSpace(lineHeight);
    page.drawText(String(text || ''), { x: leftX + indent, y, size, font });
    y -= lineHeight;
  };

  const drawBulletLabelValue = async (label, value, valueBold = false) => {
    const labelText = `• ${label}: `;
    const valueText = String(value || '');
    const labelFont = helveticaBold;
    const valueFont = valueBold ? helveticaBold : helvetica;
    const lineHeight = TYPOGRAPHY.bodySize + TYPOGRAPHY.bodyLineGap;

    await ensureSpace(lineHeight);

    page.drawText(labelText, {
      x: leftX,
      y,
      size: TYPOGRAPHY.bodySize,
      font: labelFont,
    });

    page.drawText(valueText, {
      x: leftX + textWidth(labelFont, labelText, TYPOGRAPHY.bodySize),
      y,
      size: TYPOGRAPHY.bodySize,
      font: valueFont,
    });

    y -= lineHeight;
  };

  const title = payload.title || 'LETTER OF INTENT';
  const titleWidth = textWidth(helveticaBold, title, TYPOGRAPHY.headingSize);
  await ensureSpace(58);
  page.drawText(title, {
    x: (pageWidth - titleWidth) / 2,
    y,
    size: TYPOGRAPHY.headingSize,
    font: helveticaBold,
  });
  y -= 40;

  const issueLabel = `[Date of Issuance: ${formatIssueDate(payload.issueDate || issuedAt)}]`;
  const issueWidth = textWidth(helveticaBold, issueLabel, TYPOGRAPHY.issueSize);
  page.drawText(issueLabel, {
    x: rightX - issueWidth,
    y,
    size: TYPOGRAPHY.issueSize,
    font: helveticaBold,
  });
  y -= 30;

  await drawSimpleLine(
    `Dear ${payload.employeeName || `Employee's Name`},`,
    helveticaBold,
    TYPOGRAPHY.greetingSize
  );
  y -= 2;
  await drawSimpleLine('Congratulations!', helveticaBold, 13, 26);

  const introParagraph =
    typeof payload.introParagraph === 'string' && payload.introParagraph.trim()
      ? payload.introParagraph.trim()
      : `We are pleased to express our intent to engage you as a ${
          payload.jobTitle || '[Job Title]'
        } within ${payload.department || '[Job Department]'} at ${
          payload.companyName || COMPANY_NAME
        }. Based on your past performance and our recent discussions, we believe you can make valuable contributions to our team and organizational goals.`;

  await drawParagraph(introParagraph);

  const paragraphs = normalizeParagraphs(payload);
  for (const paragraph of paragraphs) {
    await drawParagraph(paragraph);
  }

  await drawSimpleLine(
    payload.keyDetailsTitle ||
      'Please find below the indicative terms of this proposed engagement:',
    helvetica,
    TYPOGRAPHY.bodySize
  );
  y -= 2;

  const keyTerms = [
    { label: 'Position Title', value: payload.positionTitle || payload.jobTitle, bold: true },
    { label: 'Department', value: payload.department, bold: true },
    { label: 'Employment Type', value: payload.employmentType, bold: true },
    { label: 'Reporting Manager', value: payload.reportingManager, bold: true },
    { label: 'Expected Start Date', value: payload.expectedStartDate, bold: true },
    { label: 'Work Location', value: payload.workLocation || payload.location, bold: true },
  ];

  for (const term of keyTerms) {
    if (term.value === undefined || term.value === null || String(term.value).trim() === '')
      continue;
    await drawBulletLabelValue(term.label, term.value, term.bold);
  }

  y -= TYPOGRAPHY.sectionSpacing;

  const contactParagraph =
    typeof payload.contactParagraph === 'string' ? payload.contactParagraph.trim() : '';
  if (contactParagraph) {
    await drawParagraph(contactParagraph);
  }

  y -= 2;
  await drawSimpleLine(
    payload.closingText || 'Warm regards,',
    helveticaBold,
    TYPOGRAPHY.greetingSize
  );
  y -= 24;

  const signatureImage = await loadSignatureImage(
    pdfDoc,
    payload.signatureUrl || CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL
  );

  if (signatureImage) {
    const maxW = 120;
    const maxH = 42;
    const ratio = Math.min(maxW / signatureImage.width, maxH / signatureImage.height);
    const drawW = signatureImage.width * ratio;
    const drawH = signatureImage.height * ratio;

    await ensureSpace(drawH + 75);
    page.drawImage(signatureImage, {
      x: leftX,
      y: y - drawH + 10,
      width: drawW,
      height: drawH,
    });
    y -= drawH + 8;
  } else {
    await ensureSpace(75);
    y -= 35;
  }

  await drawSimpleLine(
    payload.signatoryName || 'Authorized Signatory',
    helveticaBold,
    TYPOGRAPHY.signatureNameSize
  );
  await drawSimpleLine(payload.position || 'Position', helveticaBold, TYPOGRAPHY.signatureMetaSize);
  await drawSimpleLine(
    payload.companyName || COMPANY_NAME,
    helveticaBold,
    TYPOGRAPHY.signatureMetaSize
  );

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
};
