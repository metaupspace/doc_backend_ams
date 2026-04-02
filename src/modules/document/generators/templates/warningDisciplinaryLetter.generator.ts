import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import {
  CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
  WARNING_DISCIPLINARY_LETTER_DEFAULT_PARAGRAPHS,
} from '../../config/document.config.ts';

const COMPANY_NAME = 'MetaUpSpace LLP';

const TYPOGRAPHY = {
  headingSize: 24,
  bodySize: 11,
  bodyLineGap: 6,
  greetingSize: 12,
  issueSize: 11,
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
    month: '2-digit',
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

  return [...WARNING_DISCIPLINARY_LETTER_DEFAULT_PARAGRAPHS];
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

export const generateWarningDisciplinaryLetterPdfBuffer = async (
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

  const drawBullets = async (items = []) => {
    for (const item of items.filter(Boolean)) {
      await drawParagraph(`• ${item}`, TYPOGRAPHY.bodySize, 4);
    }
  };

  const title = payload.title || 'WARNING AND DISCIPLINARY LETTER';
  const titleWidth = textWidth(helveticaBold, title, TYPOGRAPHY.headingSize);
  await ensureSpace(58);
  page.drawText(title, {
    x: (pageWidth - titleWidth) / 2,
    y,
    size: TYPOGRAPHY.headingSize,
    font: helveticaBold,
  });
  y -= 40;

  const issueDate = payload.issueDate || issuedAt;
  const issueText = formatIssueDate(issueDate);
  const issueWidth = textWidth(helveticaBold, issueText, TYPOGRAPHY.issueSize);
  page.drawText(issueText, {
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
  y -= 10;

  await drawParagraph(
    payload.introParagraph ||
      'This letter serves as a formal written warning regarding recent behavior that is not in accordance with the standards, policies, and values of MetaUpSpace LLP.'
  );

  await drawSimpleLine(
    payload.section1Title || '1. Description of Concern',
    helveticaBold,
    TYPOGRAPHY.greetingSize
  );
  await drawParagraph(
    payload.section1Intro ||
      'It has been observed that over the past review period, there have been repeated concerns in expected conduct and delivery.'
  );
  await drawBullets(
    payload.concernsList || [
      'Failure to join the virtual office during expected hours',
      'Lack of responsiveness and poor communication with the team',
      'Mark your attendance as per company protocol',
      'Negligence in completing assigned work',
    ]
  );
  await drawParagraph(
    payload.section1Outro ||
      'This behavior is in direct violation of company policies, as outlined in the Annexure[A].'
  );

  await drawSimpleLine(
    payload.section2Title || '2. Previous Actions Taken',
    helveticaBold,
    TYPOGRAPHY.greetingSize
  );
  await drawParagraph(
    payload.section2Intro ||
      'Prior to this letter, the following steps were taken to address the concerns:'
  );
  await drawBullets(
    payload.previousActionsList || [
      '[Insert Date]: Verbal reminder regarding communication and availability',
      '[Insert Date]: Advised via email/chat to be present and responsive during working hours',
    ]
  );
  await drawParagraph(
    payload.section2Outro ||
      'Despite these measures, there has been insufficient or no improvement in your conduct.'
  );

  await drawSimpleLine(
    payload.section3Title || '3. Required Improvement and Expectations',
    helveticaBold,
    TYPOGRAPHY.greetingSize
  );
  await drawParagraph(payload.section3Intro || 'You are expected to:');
  await drawBullets(
    payload.expectationsList || [
      'Be present in the virtual office consistently',
      'Communicate clearly and promptly',
      'Show responsibility in your assigned tasks',
    ]
  );
  await drawParagraph(
    payload.section3Outro ||
      'This improvement must be immediate and sustained. Your conduct will be closely monitored over the next 30 days.'
  );

  await drawSimpleLine(
    payload.section4Title || '4. Consequences of Further Violation',
    helveticaBold,
    TYPOGRAPHY.greetingSize
  );
  await drawParagraph(
    payload.section4Intro ||
      'Failure to demonstrate consistent improvement or any recurrence of similar issues may result in:'
  );
  await drawParagraph(
    payload.monetaryPenalty ||
      'Monetary Penalty: A deduction may be applied to your current or upcoming stipend/compensation based on the impact of your continued non-compliance.'
  );
  await drawParagraph(
    payload.nonMonetaryPenalty ||
      'Non-Monetary Penalty: This may include temporary removal from ongoing projects, withdrawal of discretionary privileges, or official downgrade of performance status, which will be recorded in your employee profile or, if deemed necessary, termination of employment in accordance with company policies and applicable laws.'
  );

  await drawSimpleLine(
    payload.section5Title || '5. Acknowledgment and Support',
    helveticaBold,
    TYPOGRAPHY.greetingSize
  );
  await drawParagraph(
    payload.section5Intro ||
      'We are committed to supporting your success at MetaUpSpace LLP. If you are experiencing any challenges that may be affecting your performance, you are encouraged to speak with HR directly and confidentially.'
  );

  const paragraphs = normalizeParagraphs(payload);
  for (const paragraph of paragraphs) {
    await drawParagraph(paragraph);
  }

  y -= 2;
  await drawSimpleLine(payload.closingText || 'Sincerely,', helveticaBold, TYPOGRAPHY.greetingSize);
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

  if (y - 160 > minY) {
    y -= 120;
  } else {
    await newTemplatePage();
  }

  await drawSimpleLine(
    payload.acknowledgementTitle || 'Employee Acknowledgment',
    helveticaBold,
    TYPOGRAPHY.greetingSize
  );
  await drawParagraph(
    payload.acknowledgementText ||
      `I, ${
        payload.acknowledgementName || '[Employee Full Name]'
      }, acknowledge receipt of this warning and understand the expectations and potential consequences outlined above.`
  );
  y -= 18;
  await drawSimpleLine(
    `${payload.signatureLabel || 'Signature'}: _____________________________`,
    helveticaBold,
    TYPOGRAPHY.greetingSize
  );
  y -= 8;
  await drawSimpleLine(
    `${payload.dateLabel || 'Date'}: _____________________________`,
    helveticaBold,
    TYPOGRAPHY.greetingSize
  );

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
};
