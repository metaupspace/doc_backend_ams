import type { PDFFont, PDFPage } from 'pdf-lib';

type StyleInfo = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
};

type RichTextToken =
  | {
      type: 'newline';
    }
  | {
      type: 'text';
      text: string;
      style: StyleInfo;
    };

type FontSet = {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  boldItalic: PDFFont;
};

type PageAccess = {
  getPage: () => PDFPage;
  getY: () => number;
  setY: (nextY: number) => void;
  ensureSpace: (requiredHeight: number) => Promise<void>;
};

type DrawRichParagraphInput = {
  text: string;
  parseRichText: (input: string) => RichTextToken[];
  leftX: number;
  contentWidth: number;
  size: number;
  lineGap: number;
  paragraphSpacing: number;
  minY: number;
  fonts: FontSet;
  pageAccess: PageAccess;
};

export const textWidth = (font: PDFFont, text: string, size: number) =>
  font.widthOfTextAtSize(text, size);

export const drawRichParagraph = async ({
  text,
  parseRichText,
  leftX,
  contentWidth,
  size,
  lineGap,
  paragraphSpacing,
  minY,
  fonts,
  pageAccess,
}: DrawRichParagraphInput): Promise<void> => {
  const lineHeight = size + lineGap;
  const tokens = parseRichText(text);
  const currentLine: Array<{ text: string; style: StyleInfo }> = [];
  let currentLineWidth = 0;

  const fontForStyle = (styleInfo: StyleInfo): PDFFont => {
    if (styleInfo.bold && styleInfo.italic) return fonts.boldItalic;
    if (styleInfo.bold) return fonts.bold;
    if (styleInfo.italic) return fonts.italic;
    return fonts.regular;
  };

  const drawLine = async (): Promise<void> => {
    if (currentLine.length === 0) return;

    await pageAccess.ensureSpace(lineHeight);
    const page = pageAccess.getPage();
    const y = pageAccess.getY();
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
    pageAccess.setY(y - lineHeight);
  };

  const pushChunk = async (chunk: string, styleInfo: StyleInfo): Promise<void> => {
    if (!chunk) return;
    if (/^\s+$/.test(chunk) && currentLine.length === 0) return;

    const chunkFont = fontForStyle(styleInfo);
    const chunkWidth = textWidth(chunkFont, chunk, size);

    if (!/^\s+$/.test(chunk) && currentLineWidth + chunkWidth > contentWidth && currentLine.length > 0) {
      await drawLine();
    }

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

  const y = pageAccess.getY();
  if (y - paragraphSpacing >= minY) {
    pageAccess.setY(y - paragraphSpacing);
  }
};
