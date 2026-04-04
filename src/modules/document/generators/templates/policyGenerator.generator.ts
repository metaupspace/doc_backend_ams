import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, rgb } from 'pdf-lib';
import {
  POLICY_ANNEXURE_A_DEFAULT,
  POLICY_ANNEXURE_DEFAULT_PAYLOAD,
} from '../../config/policyAnnexure.config.ts';
import { LETTER_LAYOUT } from '../../config/letterLayout.config.ts';
import { TYPOGRAPHY } from '../../config/typography.config.ts';
import { embedDMSansFonts } from '../../utils/fontLoader.util.ts';
import { loadSignatureImage } from '../../utils/loadSignatureImage.util.ts';
import { parseRichText } from '../../utils/parseRichText.util.ts';
import { drawRichParagraph } from '../../utils/pdfTextLayout.util.ts';

const cloneAnnexure = (annexure) => ({
  annexureId: annexure.annexureId,
  title: annexure.title,
  blocks: Array.isArray(annexure.blocks) ? annexure.blocks.map((block) => ({ ...block })) : [],
});

const TABLE_BORDER = rgb(0, 0, 0);
const TABLE_HEADER_FILL = rgb(0.78, 0.78, 0.78);
const TABLE_CELL_PADDING_X = 10;
const TABLE_CELL_PADDING_Y = 8;

const stripHtmlTags = (value) => String(value || '').replace(/<[^>]*>/g, '').trim();

const parseTablePairFromBlockText = (value) => {
  const plain = stripHtmlTags(value);
  const parts = plain.split('|').map((part) => part.trim());
  return [parts[0] || '', parts[1] || ''];
};

const wrapTableText = (font, text, size, maxWidth) => {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];

  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
      currentLine = '';
    }

    if (font.widthOfTextAtSize(word, size) <= maxWidth) {
      currentLine = word;
      continue;
    }

    let fragment = '';
    for (const character of word) {
      const fragmentCandidate = `${fragment}${character}`;
      if (font.widthOfTextAtSize(fragmentCandidate, size) <= maxWidth) {
        fragment = fragmentCandidate;
      } else {
        if (fragment) lines.push(fragment);
        fragment = character;
      }
    }

    currentLine = fragment;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [''];
};

const measureTableCellHeight = ({ font, text, size, width, paddingY }) => {
  const lines = wrapTableText(font, text, size, width);
  const lineHeight = size + 4;
  return Math.max(lineHeight + paddingY * 2, lines.length * lineHeight + paddingY * 2);
};

const resolvePayloadAnnexures = (payload) => {
  if (Array.isArray(payload?.annexures) && payload.annexures.length > 0) {
    return payload.annexures.map((annexure) => ({
      annexureId: String(annexure?.annexureId || '').trim() || 'A',
      title: String(annexure?.title || '').trim() || 'Annexure',
      blocks: Array.isArray(annexure?.blocks)
        ? annexure.blocks
            .filter((block) => block && typeof block.text === 'string' && block.text.trim().length > 0)
            .map((block) => ({
              text: String(block.text),
              indent: typeof block.indent === 'number' ? block.indent : 0,
              size: typeof block.size === 'number' ? block.size : TYPOGRAPHY.body.size,
              lineGap: typeof block.lineGap === 'number' ? block.lineGap : TYPOGRAPHY.body.lineGap,
              paragraphSpacing:
                typeof block.paragraphSpacing === 'number'
                  ? block.paragraphSpacing
                  : TYPOGRAPHY.paragraphSpacing,
              signatureBlock:
                block?.signatureBlock && typeof block.signatureBlock === 'object'
                  ? {
                      left:
                        block.signatureBlock.left && typeof block.signatureBlock.left === 'object'
                          ? {
                              signatureLabel:
                                typeof block.signatureBlock.left.signatureLabel === 'string'
                                  ? block.signatureBlock.left.signatureLabel
                                  : undefined,
                              signatureImageUrl:
                                typeof block.signatureBlock.left.signatureImageUrl === 'string'
                                  ? block.signatureBlock.left.signatureImageUrl
                                  : undefined,
                              name:
                                typeof block.signatureBlock.left.name === 'string'
                                  ? block.signatureBlock.left.name
                                  : undefined,
                              title:
                                typeof block.signatureBlock.left.title === 'string'
                                  ? block.signatureBlock.left.title
                                  : undefined,
                              date:
                                typeof block.signatureBlock.left.date === 'string'
                                  ? block.signatureBlock.left.date
                                  : undefined,
                            }
                          : undefined,
                      right:
                        block.signatureBlock.right && typeof block.signatureBlock.right === 'object'
                          ? {
                              signatureLabel:
                                typeof block.signatureBlock.right.signatureLabel === 'string'
                                  ? block.signatureBlock.right.signatureLabel
                                  : undefined,
                              signatureImageUrl:
                                typeof block.signatureBlock.right.signatureImageUrl === 'string'
                                  ? block.signatureBlock.right.signatureImageUrl
                                  : undefined,
                              name:
                                typeof block.signatureBlock.right.name === 'string'
                                  ? block.signatureBlock.right.name
                                  : undefined,
                              title:
                                typeof block.signatureBlock.right.title === 'string'
                                  ? block.signatureBlock.right.title
                                  : undefined,
                              date:
                                typeof block.signatureBlock.right.date === 'string'
                                  ? block.signatureBlock.right.date
                                  : undefined,
                            }
                          : undefined,
                    }
                  : undefined,
              table:
                block?.table && typeof block.table === 'object'
                  ? {
                      headers: Array.isArray(block.table.headers)
                        ? block.table.headers.map((header) => String(header))
                        : undefined,
                      rows: Array.isArray(block.table.rows)
                        ? block.table.rows
                            .filter((row) => row && typeof row === 'object')
                            .map((row) => {
                              if (row.type === 'section') {
                                return {
                                  type: 'section',
                                  label: String(row.label || ''),
                                };
                              }

                              return {
                                type: 'data',
                                cells: Array.isArray(row.cells)
                                  ? row.cells.map((cell) => String(cell))
                                  : ['', '', ''],
                                bold: Boolean(row.bold),
                                fill: Boolean(row.fill),
                              };
                            })
                        : undefined,
                    }
                  : undefined,
            }))
        : [],
    }));
  }

  return [cloneAnnexure(POLICY_ANNEXURE_A_DEFAULT)];
};

export const generatePolicyGeneratorPdfBuffer = async (
  payload,
  { issuedAt: _issuedAt } = { issuedAt: undefined }
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
  // Increase top spacing by 20% from the current compact layout.
  const topY = page.getHeight() - Math.round(LETTER_LAYOUT.topOffset * 0.9);
  const leftX = LETTER_LAYOUT.sidePadding;
  const rightX = pageWidth - LETTER_LAYOUT.sidePadding;
  const contentWidth = rightX - leftX;
  const minY = Math.max(LETTER_LAYOUT.minY, 24);

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
    {
      indent = 0,
      size = TYPOGRAPHY.body.size,
      lineGap = TYPOGRAPHY.body.lineGap,
      paragraphSpacing = TYPOGRAPHY.paragraphSpacing,
    } = {}
  ) =>
    drawRichParagraph({
      text,
      parseRichText,
      leftX: leftX + indent,
      contentWidth: contentWidth - indent,
      size,
      lineGap,
      paragraphSpacing,
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

  const drawTwoColumnTable = async ({ headers, rows, indent = 0 }) => {
    const tableWidth = Math.min(contentWidth - indent, 460);
    const tableX = leftX + indent + (contentWidth - indent - tableWidth) / 2;
    const columnWidth = tableWidth / 2;
    const headerHeight = 34;
    const rowHeight = 34;
    const verticalPadding = 10;
    const totalHeight = headerHeight + rows.length * rowHeight;

    await ensureSpace(totalHeight + verticalPadding + 4);

    const drawCell = ({ x, yTop, width, height, text, isHeader = false }) => {
      page.drawRectangle({
        x,
        y: yTop - height,
        width,
        height,
        borderColor: TABLE_BORDER,
        borderWidth: 1,
        color: isHeader ? TABLE_HEADER_FILL : undefined,
      });

      const font = isHeader ? boldFont : regularFont;
      const size = isHeader ? TYPOGRAPHY.body.size + 1 : TYPOGRAPHY.body.size + 1;
      const textWidth = font.widthOfTextAtSize(text, size);
      page.drawText(text, {
        x: x + (width - textWidth) / 2,
        y: yTop - height / 2 - size / 2 + 3,
        size,
        font,
      });
    };

    let cursorY = y;
    drawCell({ x: tableX, yTop: cursorY, width: columnWidth, height: headerHeight, text: headers[0], isHeader: true });
    drawCell({ x: tableX + columnWidth, yTop: cursorY, width: columnWidth, height: headerHeight, text: headers[1], isHeader: true });
    cursorY -= headerHeight;

    for (const row of rows) {
      drawCell({ x: tableX, yTop: cursorY, width: columnWidth, height: rowHeight, text: row[0] || '' });
      drawCell({ x: tableX + columnWidth, yTop: cursorY, width: columnWidth, height: rowHeight, text: row[1] || '' });
      cursorY -= rowHeight;
    }

    y = cursorY - verticalPadding;
  };

  const drawSalaryStructureTable = async (tableData) => {
    const tableWidth = contentWidth;
    const tableX = leftX;
    const widths = [0.4 * tableWidth, 0.3 * tableWidth, 0.3 * tableWidth];
    const headerHeight = 28;
    const sectionHeight = 22;
    const dataPaddingY = 7;
    const dataSize = TYPOGRAPHY.body.size - 1;
    const defaultRows = [
      { type: 'section', label: 'Earnings:' },
      { type: 'data', cells: ['Basic', '12,000', '1,44,000'] },
      { type: 'data', cells: ['HRA', 'Nil', 'Nil'] },
      { type: 'data', cells: ['Conveyance', 'Nil', 'Nil'] },
      { type: 'data', cells: ['Other Allowance', 'Nil', 'Nil'] },
      { type: 'data', cells: ['Gross Salary (A)', '12,000', '1,44,000'], bold: true, fill: true },
      { type: 'section', label: 'Deductions:' },
      { type: 'data', cells: ['Provident Fund*', 'Nil', 'Nil'] },
      { type: 'data', cells: ['ESIC*', 'Nil', 'Nil'] },
      { type: 'data', cells: ['Professional Tax**', '200', '2,500'] },
      { type: 'data', cells: ['Net Take Home', '11,800', '1,41,500'], bold: true, fill: true },
      { type: 'section', label: 'Retirement Benefits:' },
      { type: 'data', cells: ['Provident Fund (Employer Contribution)*', 'Nil', 'Nil'] },
      { type: 'data', cells: ['ESIC (Employer Contribution)*', 'Nil', 'Nil'] },
      { type: 'data', cells: ['Gratuity', 'Nil', 'Nil'] },
      { type: 'data', cells: ['Total Retirement Benefits (B)', 'Nil', 'Nil'] },
      { type: 'data', cells: ['Total CTC (Cost to Company) (A+B)', '12,000', '1,44,000'], bold: true, fill: true },
    ];
    const headers =
      tableData && Array.isArray(tableData.headers) && tableData.headers.length === 3
        ? tableData.headers.map((value) => String(value))
        : ['Component', 'Monthly (INR)', 'Annual (INR)'];
    const rows =
      tableData && Array.isArray(tableData.rows) && tableData.rows.length > 0
        ? tableData.rows
        : defaultRows;

    const estimateRowHeight = (row) => {
      if (row.type === 'section') return sectionHeight;
      const cellHeights = row.cells.map((cellText, index) => measureTableCellHeight({
        font: index === 0 || row.bold ? boldFont : regularFont,
        text: cellText,
        size: dataSize,
        width: widths[index] - TABLE_CELL_PADDING_X * 2,
        paddingY: dataPaddingY,
      }));
      return Math.max(...cellHeights, dataSize + dataPaddingY * 2);
    };

    const totalHeight = headerHeight + rows.reduce((sum, row) => sum + estimateRowHeight(row), 0) + 8;
    await ensureSpace(totalHeight);

    const drawCellText = ({ text, x, yTop, width, height, font, size, align = 'left' }) => {
      const lines = wrapTableText(font, text, size, width - TABLE_CELL_PADDING_X * 2);
      const lineHeight = size + 4;
      const contentHeight = lines.length * lineHeight;
      let cursorY = yTop - TABLE_CELL_PADDING_Y - size;

      if (align === 'center') {
        cursorY = yTop - ((height - contentHeight) / 2) - size;
      }

      for (const line of lines) {
        let cursorX = x + TABLE_CELL_PADDING_X;
        if (align === 'center') {
          cursorX = x + (width - font.widthOfTextAtSize(line, size)) / 2;
        }

        page.drawText(line, {
          x: cursorX,
          y: cursorY,
          size,
          font,
        });
        cursorY -= lineHeight;
      }
    };

    // Header
    let cursorY = y;
    let cursorX = tableX;
    headers.forEach((header, index) => {
      page.drawRectangle({
        x: cursorX,
        y: cursorY - headerHeight,
        width: widths[index],
        height: headerHeight,
        borderColor: TABLE_BORDER,
        borderWidth: 1,
        color: TABLE_HEADER_FILL,
      });
      drawCellText({
        text: header,
        x: cursorX,
        yTop: cursorY,
        width: widths[index],
        height: headerHeight,
        font: boldFont,
        size: TYPOGRAPHY.body.size,
        align: 'center',
      });
      cursorX += widths[index];
    });
    cursorY -= headerHeight;

    for (const row of rows) {
      if (row.type === 'section') {
        page.drawRectangle({
          x: tableX,
          y: cursorY - sectionHeight,
          width: tableWidth,
          height: sectionHeight,
          borderColor: TABLE_BORDER,
          borderWidth: 1,
          color: TABLE_HEADER_FILL,
        });
        drawCellText({
          text: row.label,
          x: tableX,
          yTop: cursorY,
          width: tableWidth,
          height: sectionHeight,
          font: boldFont,
          size: TYPOGRAPHY.body.size,
        });
        cursorY -= sectionHeight;
        continue;
      }

      const rowHeight = estimateRowHeight(row);
      cursorX = tableX;
      for (let index = 0; index < row.cells.length; index += 1) {
        page.drawRectangle({
          x: cursorX,
          y: cursorY - rowHeight,
          width: widths[index],
          height: rowHeight,
          borderColor: TABLE_BORDER,
          borderWidth: 1,
          color: row.fill ? TABLE_HEADER_FILL : undefined,
        });
        drawCellText({
          text: row.cells[index],
          x: cursorX,
          yTop: cursorY,
          width: widths[index],
          height: rowHeight,
          font: index === 0 || row.bold ? boldFont : regularFont,
          size: dataSize,
          align: index === 0 ? 'left' : 'center',
        });
        cursorX += widths[index];
      }
      cursorY -= rowHeight;
    }

    y = cursorY - 8;
  };

  const drawAcknowledgementSignatureBlock = async (signatureBlock) => {
    const blockHeight = 140;
    if (y - blockHeight < minY) {
      await newTemplatePage();
    }

    // Place signatures around the middle of the available blank space.
    const blankBottomY = minY + 20;
    const blankHeight = Math.max(0, y - blankBottomY);
    const targetY = blankBottomY + Math.floor(blankHeight * 0.55);
    if (y > targetY) {
      y = targetY;
    }

    const gap = 40;
    const colWidth = (contentWidth - gap) / 2;
    const leftColX = leftX;
    const rightColX = leftX + colWidth + gap;
    const lineGap = 22;
    const imageMaxWidth = 120;
    const imageMaxHeight = 34;

    const leftDetails = {
      signatureLabel: signatureBlock?.left?.signatureLabel || 'Signature:',
      signatureImageUrl: signatureBlock?.left?.signatureImageUrl || '',
      name: signatureBlock?.left?.name || '',
      title: signatureBlock?.left?.title || '',
      date: signatureBlock?.left?.date || '',
    };

    const rightDetails = {
      signatureLabel: signatureBlock?.right?.signatureLabel || 'Signature:',
      signatureImageUrl: signatureBlock?.right?.signatureImageUrl || '',
      name: signatureBlock?.right?.name || '',
      title: signatureBlock?.right?.title || '',
      date: signatureBlock?.right?.date || '',
    };

    const leftImage = await loadSignatureImage(pdfDoc, leftDetails.signatureImageUrl);
    const rightImage = await loadSignatureImage(pdfDoc, rightDetails.signatureImageUrl);

    const signatureSize = TYPOGRAPHY.body.size + 1;

    page.drawText(leftDetails.signatureLabel, {
      x: leftColX,
      y,
      size: signatureSize,
      font: regularFont,
    });
    page.drawText(rightDetails.signatureLabel, {
      x: rightColX,
      y,
      size: signatureSize,
      font: regularFont,
    });

    if (leftImage) {
      const leftScale = Math.min(imageMaxWidth / leftImage.width, imageMaxHeight / leftImage.height, 1);
      const leftWidth = leftImage.width * leftScale;
      const leftHeight = leftImage.height * leftScale;
      const leftLabelWidth = regularFont.widthOfTextAtSize(leftDetails.signatureLabel, signatureSize);
      page.drawImage(leftImage, {
        x: leftColX + leftLabelWidth + 8,
        y: y - (leftHeight - signatureSize) / 2,
        width: leftWidth,
        height: leftHeight,
      });
    }

    if (rightImage) {
      const rightScale = Math.min(imageMaxWidth / rightImage.width, imageMaxHeight / rightImage.height, 1);
      const rightWidth = rightImage.width * rightScale;
      const rightHeight = rightImage.height * rightScale;
      const rightLabelWidth = regularFont.widthOfTextAtSize(rightDetails.signatureLabel, signatureSize);
      page.drawImage(rightImage, {
        x: rightColX + rightLabelWidth + 8,
        y: y - (rightHeight - signatureSize) / 2,
        width: rightWidth,
        height: rightHeight,
      });
    }

    const detailsY = y - 54;
    page.drawText('Name:', { x: leftColX, y: detailsY, size: TYPOGRAPHY.body.size + 1, font: regularFont });
    page.drawText(leftDetails.name, {
      x: leftColX + 44,
      y: detailsY,
      size: TYPOGRAPHY.body.size + 1,
      font: boldFont,
    });

    page.drawText('Title:', { x: leftColX, y: detailsY - lineGap, size: TYPOGRAPHY.body.size + 1, font: regularFont });
    page.drawText(leftDetails.title, {
      x: leftColX + 42,
      y: detailsY - lineGap,
      size: TYPOGRAPHY.body.size + 1,
      font: boldFont,
    });

    page.drawText('Date:', { x: leftColX, y: detailsY - lineGap * 2, size: TYPOGRAPHY.body.size + 1, font: regularFont });
    page.drawText(leftDetails.date, {
      x: leftColX + 38,
      y: detailsY - lineGap * 2,
      size: TYPOGRAPHY.body.size + 1,
      font: regularFont,
    });

    page.drawText('Name:', { x: rightColX, y: detailsY, size: TYPOGRAPHY.body.size + 1, font: regularFont });
    page.drawText(rightDetails.name, {
      x: rightColX + 44,
      y: detailsY,
      size: TYPOGRAPHY.body.size + 1,
      font: regularFont,
    });
    page.drawText('Title :', {
      x: rightColX,
      y: detailsY - lineGap,
      size: TYPOGRAPHY.body.size + 1,
      font: regularFont,
    });
    page.drawText(rightDetails.title, {
      x: rightColX + 44,
      y: detailsY - lineGap,
      size: TYPOGRAPHY.body.size + 1,
      font: regularFont,
    });
    page.drawText('Date :', {
      x: rightColX,
      y: detailsY - lineGap * 2,
      size: TYPOGRAPHY.body.size + 1,
      font: regularFont,
    });
    page.drawText(rightDetails.date, {
      x: rightColX + 44,
      y: detailsY - lineGap * 2,
      size: TYPOGRAPHY.body.size + 1,
      font: regularFont,
    });

    y = minY + 20;
  };

  const annexures = resolvePayloadAnnexures(payload || POLICY_ANNEXURE_DEFAULT_PAYLOAD);

  let previousAnnexureId = null;

  for (let annexureIndex = 0; annexureIndex < annexures.length; annexureIndex += 1) {
    const annexure = annexures[annexureIndex];

    if (
      annexureIndex > 0 &&
      previousAnnexureId !== null &&
      String(previousAnnexureId).toUpperCase() !== String(annexure.annexureId).toUpperCase()
    ) {
      await newTemplatePage();
    }

    const headingText =
      annexure.annexureId === 'N'
        ? annexure.title
        : `Annexure [${annexure.annexureId}]: ${annexure.title}`;

    // Dynamic heading font size with width-based wrapping for long titles.
    const baseHeadingSize = TYPOGRAPHY.heading2.size + 2;
    const fitHeadingLines = (size: number) => {
      const words = headingText.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const candidate = currentLine ? `${currentLine} ${word}` : word;
        const candidateWidth = boldFont.widthOfTextAtSize(candidate, size);
        if (candidateWidth > contentWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = candidate;
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }

      return lines;
    };

    let headingSize = baseHeadingSize;
    let headingLines = fitHeadingLines(headingSize);
    while (headingLines.length > 2 && headingSize > TYPOGRAPHY.heading2.size - 2) {
      headingSize -= 1;
      headingLines = fitHeadingLines(headingSize);
    }

    const headingLineGap = headingLines.length > 1 ? Math.max(headingSize + 1, 11) : 14;
    await ensureSpace(headingLines.length * headingLineGap + 8);

    for (let i = 0; i < headingLines.length; i += 1) {
      page.drawText(headingLines[i], {
        x: leftX,
        y,
        size: headingSize,
        font: boldFont,
      });
      y -= headingLineGap;
    }
    
    y -= 6;

    for (let blockIndex = 0; blockIndex < annexure.blocks.length; blockIndex += 1) {
      const block = annexure.blocks[blockIndex];

      // In Annexure G, keep Part 1 on the heading page and start only Part 2/3 on new pages.
      if (
        annexure.annexureId === 'G' &&
        (block.text.startsWith('<strong>Part 2') || block.text.startsWith('<strong>Part 3'))
      ) {
        await newTemplatePage();
      }

      // Render slab rows as bordered tables for Annexure L.
      if (
        annexure.annexureId === 'L' &&
        block.text.includes('Professional Tax - Male Employees') &&
        annexure.blocks[blockIndex + 4]
      ) {
        await drawParagraph(block.text, {
          indent: (block.indent || 0) * 0.6,
          size: block.size || TYPOGRAPHY.body.size + 1,
          lineGap: block.lineGap || Math.max(-1, TYPOGRAPHY.body.lineGap - 5),
          paragraphSpacing:
            typeof block.paragraphSpacing === 'number'
              ? block.paragraphSpacing * 0.6
              : Math.max(0, (TYPOGRAPHY.paragraphSpacing - 8) * 0.6),
        });

        const headers = parseTablePairFromBlockText(annexure.blocks[blockIndex + 1].text);
        const rows = [
          parseTablePairFromBlockText(annexure.blocks[blockIndex + 2].text),
          parseTablePairFromBlockText(annexure.blocks[blockIndex + 3].text),
          parseTablePairFromBlockText(annexure.blocks[blockIndex + 4].text),
        ];
        await drawTwoColumnTable({ headers, rows, indent: (block.indent || 0) * 0.6 });
        blockIndex += 4;
        continue;
      }

      if (
        annexure.annexureId === 'L' &&
        block.text.includes('Professional Tax - Female Employees') &&
        annexure.blocks[blockIndex + 3]
      ) {
        await drawParagraph(block.text, {
          indent: (block.indent || 0) * 0.6,
          size: block.size || TYPOGRAPHY.body.size + 1,
          lineGap: block.lineGap || Math.max(-1, TYPOGRAPHY.body.lineGap - 5),
          paragraphSpacing:
            typeof block.paragraphSpacing === 'number'
              ? block.paragraphSpacing * 0.6
              : Math.max(0, (TYPOGRAPHY.paragraphSpacing - 8) * 0.6),
        });

        const headers = parseTablePairFromBlockText(annexure.blocks[blockIndex + 1].text);
        const rows = [
          parseTablePairFromBlockText(annexure.blocks[blockIndex + 2].text),
          parseTablePairFromBlockText(annexure.blocks[blockIndex + 3].text),
        ];
        await drawTwoColumnTable({ headers, rows, indent: (block.indent || 0) * 0.6 });
        blockIndex += 3;
        continue;
      }

      if (annexure.annexureId === 'M' && block.text === '<TABLE:SALARY_STRUCTURE>') {
        await drawSalaryStructureTable(block.table);
        continue;
      }

      if (annexure.annexureId === 'N' && block.text === '<ACK_SIGNATURE_BLOCK>') {
        await drawAcknowledgementSignatureBlock(block.signatureBlock);
        continue;
      }

      await drawParagraph(block.text, {
        indent: (block.indent || 0) * 0.6,
        size: block.size || TYPOGRAPHY.body.size + 1,
        lineGap: block.lineGap || Math.max(-1, TYPOGRAPHY.body.lineGap - 5),
        paragraphSpacing:
          typeof block.paragraphSpacing === 'number'
            ? block.paragraphSpacing * 0.6
            : Math.max(0, (TYPOGRAPHY.paragraphSpacing - 8) * 0.6),
      });
    }

    previousAnnexureId = annexure.annexureId;

    if (annexureIndex < annexures.length - 1) {
      y -= 2;
    }
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
};
