import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import { LETTER_LAYOUT } from '../../config/letterLayout.config.ts';
import {
  PERFORMANCE_REPORT_DEFAULT_PAYLOAD,
  type PerformanceReportBlock,
  type PerformanceReportCell,
  type PerformanceReportPayload,
  type PerformanceReportTableRow,
} from '../../config/performanceReport.config.ts';
import { TYPOGRAPHY } from '../../config/typography.config.ts';
import { embedDMSansFonts, loadBilboSwashCapsFont } from '../../utils/fontLoader.util.ts';
import { loadSignatureImage } from '../../utils/loadSignatureImage.util.ts';

const BORDER = rgb(0, 0, 0);
const CELL_PADDING_X = 8;
const CELL_PADDING_Y = 7;
const SAFE_BOTTOM = 44;

type NormalizedCell = {
  text: string;
  bold: boolean;
  align: 'left' | 'center' | 'right';
  fontStyle: 'normal' | 'signature';
  disclaimerText?: string;
  disclaimerSize?: number;
  kind: 'text' | 'checkbox' | 'image';
  checked: boolean;
  imageUrl?: string;
  colSpan: number;
  size?: number;
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const ISO_TIMESTAMP_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:?\d{2})?$/;

const formatTimestampToIst = (input: string) => {
  if (!ISO_TIMESTAMP_REGEX.test(input)) return input;

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return input;

  const parts = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(parsed);

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const day = map.day || '';
  const month = map.month || '';
  const year = map.year || '';
  const hour = map.hour || '';
  const minute = map.minute || '';
  const dayPeriod = String(map.dayPeriod || '').toUpperCase();

  return `${day} ${month} ${year} | ${hour}:${minute} ${dayPeriod} IST`.replace(/\s+/g, ' ').trim();
};

const normalizeTimestampIfPossible = (value: string) => formatTimestampToIst(String(value || '').trim());

const wrapText = (font, text: string, size: number, maxWidth: number) => {
  const lines: string[] = [];
  const paragraphs = String(text || '').split(/\r?\n/);

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) {
      lines.push('');
      continue;
    }

    const words = trimmed.split(/\s+/);
    let current = '';

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        current = candidate;
        continue;
      }

      if (current) {
        lines.push(current);
      }

      if (font.widthOfTextAtSize(word, size) <= maxWidth) {
        current = word;
        continue;
      }

      let fragment = '';
      for (const ch of word) {
        const next = `${fragment}${ch}`;
        if (font.widthOfTextAtSize(next, size) <= maxWidth) {
          fragment = next;
        } else {
          if (fragment) lines.push(fragment);
          fragment = ch;
        }
      }
      current = fragment;
    }

    if (current) lines.push(current);
  }

  return lines.length > 0 ? lines : [''];
};

const normalizeCell = (cell: PerformanceReportCell): NormalizedCell => {
  if (typeof cell === 'string') {
    return {
      text: cell,
      bold: false,
      align: 'left',
      fontStyle: 'normal',
      kind: 'text',
      checked: false,
      colSpan: 1,
    };
  }

  return {
    text: String(cell?.text || ''),
    bold: Boolean(cell?.bold),
    align:
      cell?.align === 'center' || cell?.align === 'right' || cell?.align === 'left'
        ? cell.align
        : 'left',
    fontStyle: cell?.fontStyle === 'signature' ? 'signature' : 'normal',
    disclaimerText:
      typeof cell?.disclaimerText === 'string' && cell.disclaimerText.trim()
        ? cell.disclaimerText.trim()
        : undefined,
    disclaimerSize:
      typeof cell?.disclaimerSize === 'number' && Number.isFinite(cell.disclaimerSize)
        ? cell.disclaimerSize
        : undefined,
    kind: cell?.kind === 'checkbox' || cell?.kind === 'image' ? cell.kind : 'text',
    checked: Boolean(cell?.checked),
    imageUrl: typeof cell?.imageUrl === 'string' ? cell.imageUrl : undefined,
    colSpan: Math.max(1, Number(cell?.colSpan || 1)),
    size: typeof cell?.size === 'number' ? cell.size : undefined,
  };
};

const resolveColumnCount = (rows: PerformanceReportTableRow[], columnWidths?: number[]) => {
  if (Array.isArray(columnWidths) && columnWidths.length > 0) {
    return columnWidths.length;
  }

  let maxColumns = 1;
  for (const row of rows) {
    const normalized = Array.isArray(row?.cells) ? row.cells.map(normalizeCell) : [];
    const spanSum = normalized.reduce((acc, cell) => acc + cell.colSpan, 0);
    maxColumns = Math.max(maxColumns, spanSum || normalized.length || 1);
  }

  return maxColumns;
};

const resolveColumnWidths = (tableWidth: number, count: number, columnWidths?: number[]) => {
  if (!Array.isArray(columnWidths) || columnWidths.length !== count) {
    return Array.from({ length: count }, () => tableWidth / count);
  }

  const numeric = columnWidths.map((value) => (Number.isFinite(value) ? Number(value) : 0));
  const sum = numeric.reduce((acc, value) => acc + value, 0);
  if (sum <= 0) {
    return Array.from({ length: count }, () => tableWidth / count);
  }

  return numeric.map((value) => (value / sum) * tableWidth);
};

const drawCheckbox = (page, x: number, yTop: number, width: number, height: number, checked: boolean) => {
  const box = Math.min(16, Math.max(10, Math.floor(height * 0.35)));
  const boxX = x + (width - box) / 2;
  const boxY = yTop - (height + box) / 2;

  page.drawRectangle({
    x: boxX,
    y: boxY,
    width: box,
    height: box,
    borderColor: BORDER,
    borderWidth: 1,
  });

  if (!checked) return;

  page.drawLine({
    start: { x: boxX + 2, y: boxY + box * 0.52 },
    end: { x: boxX + box * 0.42, y: boxY + 2 },
    thickness: 1,
    color: BORDER,
  });
  page.drawLine({
    start: { x: boxX + box * 0.42, y: boxY + 2 },
    end: { x: boxX + box - 2, y: boxY + box - 2 },
    thickness: 1,
    color: BORDER,
  });
};

const resolvePayload = (payload: PerformanceReportPayload): PerformanceReportPayload => {
  const base = clone(PERFORMANCE_REPORT_DEFAULT_PAYLOAD);

  return {
    title: typeof payload?.title === 'string' && payload.title.trim() ? payload.title.trim() : base.title,
    blocks:
      Array.isArray(payload?.blocks) && payload.blocks.length > 0 ? payload.blocks : (base.blocks || []),
  };
};

export const generatePerformanceReportPdfBuffer = async (
  payload,
  { issuedAt: _issuedAt } = { issuedAt: undefined }
) => {
  const report = resolvePayload(payload || {});

  const letterheadPath = path.join(process.cwd(), 'public', 'letterhead.pdf');
  const letterheadBytes = await fs.readFile(letterheadPath);
  const letterheadDoc = await PDFDocument.load(letterheadBytes);
  const pdfDoc = await PDFDocument.create();

  const [templatePage] = await pdfDoc.copyPages(letterheadDoc, [0]);
  let page = pdfDoc.addPage(templatePage);

  const fonts = await embedDMSansFonts(pdfDoc);
  const regular = fonts.regular;
  const bold = fonts.bold;
  const italic = fonts.italic;
  let signature;
  try {
    const bilboBuffer = await loadBilboSwashCapsFont();
    signature = await pdfDoc.embedFont(bilboBuffer);
  } catch {
    signature = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  }

  const pageWidth = page.getWidth();
  const topY = page.getHeight() - LETTER_LAYOUT.topOffset - 12;
  const leftX = LETTER_LAYOUT.sidePadding + 6;
  const rightX = pageWidth - LETTER_LAYOUT.sidePadding - 6;
  const contentWidth = rightX - leftX;
  const minY = Math.max(LETTER_LAYOUT.minY, SAFE_BOTTOM);
  let y = topY;

  const newPage = async () => {
    const [copied] = await pdfDoc.copyPages(letterheadDoc, [0]);
    page = pdfDoc.addPage(copied);
    y = topY;
  };

  const ensureSpace = async (height: number) => {
    if (y - height < minY) {
      await newPage();
    }
  };

  const drawTextBlock = async (
    block: Extract<PerformanceReportBlock, { type: 'heading' | 'text' }>
  ) => {
    const size = block.size || (block.type === 'heading' ? TYPOGRAPHY.heading2.size : TYPOGRAPHY.bodyHighlighted.size + 1);
    const font = block.type === 'heading' || block.bold ? bold : regular;
    const lineGap = block.type === 'heading' ? 6 : (typeof block.lineGap === 'number' ? block.lineGap : 5);
    const lines = wrapText(font, block.text, size, contentWidth);
    const headingDefaultBottom = block.type === 'heading' ? 12 : 8;
    const blockHeight = lines.length * (size + lineGap) + (block.marginBottom ?? headingDefaultBottom);

    const headingExtraTop = block.type === 'heading' ? 12 : 0;
    const configuredTop = typeof block.marginTop === 'number' ? block.marginTop : 0;
    const appliedTop = Math.max(0, configuredTop + headingExtraTop);

    if (appliedTop > 0) {
      y -= appliedTop;
    }

    await ensureSpace(blockHeight + 2);

    for (const line of lines) {
      const lineWidth = font.widthOfTextAtSize(line, size);
      let x = leftX;
      const align = block.align || (block.type === 'heading' ? 'center' : 'left');
      if (align === 'center') x = leftX + (contentWidth - lineWidth) / 2;
      if (align === 'right') x = rightX - lineWidth;

      page.drawText(line, {
        x,
        y,
        size,
        font,
      });
      y -= size + lineGap;
    }

    y -= block.marginBottom ?? headingDefaultBottom;
  };

  const drawTable = async (block: Extract<PerformanceReportBlock, { type: 'table' }>) => {
    if (typeof block.marginTop === 'number' && block.marginTop > 0) {
      y -= block.marginTop;
    }

    if (block.title) {
      await drawTextBlock({ type: 'text', text: block.title, bold: true, marginBottom: 6, size: TYPOGRAPHY.bodyHighlighted.size + 1 });
    }

    const rows = Array.isArray(block.rows) ? block.rows : [];
    if (rows.length === 0) {
      y -= block.marginBottom ?? 8;
      return;
    }

    const colCount = resolveColumnCount(rows, block.columnWidths);
    const widths = resolveColumnWidths(contentWidth, colCount, block.columnWidths);

    const drawHeaderRow = async (row: PerformanceReportTableRow) => {
      await drawRow(row);
    };

    const drawRow = async (row: PerformanceReportTableRow) => {
      const normalizedCells = (Array.isArray(row.cells) ? row.cells : []).map(normalizeCell);
      if (normalizedCells.length === 0) return;

      let spanCursor = 0;
      const effectiveCells: Array<NormalizedCell & { startCol: number; width: number }> = [];

      for (const cell of normalizedCells) {
        const startCol = spanCursor;
        const allowedSpan = Math.max(1, Math.min(cell.colSpan, colCount - spanCursor));
        const endCol = Math.min(colCount, startCol + allowedSpan);
        const width = widths.slice(startCol, endCol).reduce((acc, value) => acc + value, 0);
        effectiveCells.push({ ...cell, startCol, width });
        spanCursor = endCol;
        if (spanCursor >= colCount) break;
      }

      const baseSize = TYPOGRAPHY.bodyHighlighted.size + 1;
      const firstCellLabel = (effectiveCells[0]?.text || '').trim().toLowerCase();
      const isDateRow = firstCellLabel === 'date';
      let rowHeight = Math.max(28, row.minHeight || 0);
      for (const cell of effectiveCells) {
        if (cell.kind === 'checkbox') {
          rowHeight = Math.max(rowHeight, 34);
          continue;
        }

        if (cell.kind === 'image') {
          rowHeight = Math.max(rowHeight, 52);
          continue;
        }

        const computedCellSize = cell.size || baseSize;
        const cellSize = isDateRow ? Math.max(8, computedCellSize - 1) : computedCellSize;
        const font =
          cell.fontStyle === 'signature' ? signature : cell.bold || row.header ? bold : regular;
        const lines = wrapText(font, cell.text, cellSize, Math.max(10, cell.width - CELL_PADDING_X * 2));
        const needed = lines.length * (cellSize + 4) + CELL_PADDING_Y * 2;
        let requiredHeight = needed;
        if (cell.fontStyle === 'signature' && cell.disclaimerText) {
          const disclaimerSize = cell.disclaimerSize || 4;
          const disclaimerLines = wrapText(
            regular,
            cell.disclaimerText,
            disclaimerSize,
            Math.max(10, cell.width - CELL_PADDING_X * 2)
          );
          const disclaimerHeight = disclaimerLines.length * (disclaimerSize + 2);
          requiredHeight = Math.max(requiredHeight, cellSize + disclaimerHeight + 20);
        }
        rowHeight = Math.max(rowHeight, requiredHeight);
      }

      await ensureSpace(rowHeight + 2);

      for (const cell of effectiveCells) {
        const x = leftX + widths.slice(0, cell.startCol).reduce((acc, value) => acc + value, 0);
        page.drawRectangle({
          x,
          y: y - rowHeight,
          width: cell.width,
          height: rowHeight,
          borderColor: BORDER,
          borderWidth: 1,
        });

        if (cell.kind === 'checkbox') {
          drawCheckbox(page, x, y, cell.width, rowHeight, cell.checked);
          continue;
        }

        if (cell.kind === 'image') {
          const image = await loadSignatureImage(pdfDoc, cell.imageUrl);
          if (image) {
            const maxWidth = Math.max(24, cell.width - CELL_PADDING_X * 2);
            const maxHeight = Math.max(24, rowHeight - CELL_PADDING_Y * 2);
            const ratio = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
            const drawWidth = image.width * ratio;
            const drawHeight = image.height * ratio;
            const drawX = x + (cell.width - drawWidth) / 2;
            const drawY = y - (rowHeight + drawHeight) / 2;
            page.drawImage(image, {
              x: drawX,
              y: drawY,
              width: drawWidth,
              height: drawHeight,
            });
          }
          continue;
        }

        const computedCellSize = cell.size || baseSize;
        const cellSize = isDateRow ? Math.max(8, computedCellSize - 1) : computedCellSize;
        const font =
          cell.fontStyle === 'signature' ? signature : cell.bold || row.header ? bold : regular;

        if (cell.fontStyle === 'signature') {
          const rawLines = String(cell.text || '')
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);

          const signatureLine = rawLines[0] || '';
          const legacyDisclaimerLine = rawLines.find((line) => /system generated/i.test(line));
          const rawDisclaimer = cell.disclaimerText || legacyDisclaimerLine;
          const disclaimerLine = rawDisclaimer
            ? '* AMS generated signature'
            : undefined;

          if (signatureLine) {
            const drawSize = Math.max(12, Math.floor(Math.max(cellSize, 28) * 0.75));
            const signatureLines = wrapText(
              font,
              signatureLine,
              drawSize,
              Math.max(10, cell.width - CELL_PADDING_X * 2 - 14)
            );
            let textY = y - rowHeight * 0.70;

            for (const line of signatureLines) {
              const lineWidth = font.widthOfTextAtSize(line, drawSize);
              const textX = x + (cell.width - lineWidth) / 2;
              page.drawText(line, {
                x: textX,
                y: textY,
                size: drawSize,
                font,
                rotate: degrees(17),
              });
              textY -= drawSize + 2;
            }
          }

          if (disclaimerLine) {
            const disclaimerSize = cell.disclaimerSize || 8;
            const disclaimerLines = wrapText(
              regular,
              disclaimerLine,
              disclaimerSize,
              Math.max(10, cell.width - CELL_PADDING_X * 2)
            );
            const disclaimerLineHeight = disclaimerSize + 2;
            let disclaimerY = y - rowHeight + 4 + disclaimerLineHeight * (disclaimerLines.length - 1);

            for (const disclaimerText of disclaimerLines) {
              const lineWidth = italic.widthOfTextAtSize(disclaimerText, disclaimerSize);
              const disclaimerX = x + (cell.width - lineWidth) / 2;
              page.drawText(disclaimerText, {
                x: disclaimerX,
                y: disclaimerY,
                size: disclaimerSize,
                font: italic,
              });
              disclaimerY -= disclaimerLineHeight;
            }
          }

          continue;
        }

        const normalizedCellText = normalizeTimestampIfPossible(cell.text);
        const lines = wrapText(
          font,
          normalizedCellText,
          cellSize,
          Math.max(10, cell.width - CELL_PADDING_X * 2)
        );
        const lineHeight = cellSize + 4;
        const contentHeight = lines.length * lineHeight;
        let textY = y - ((rowHeight - contentHeight) / 2) - cellSize + 2;

        for (const line of lines) {
          let textX = x + CELL_PADDING_X;
          const lineWidth = font.widthOfTextAtSize(line, cellSize);
          if (cell.align === 'center') {
            textX = x + (cell.width - lineWidth) / 2;
          } else if (cell.align === 'right') {
            textX = x + cell.width - CELL_PADDING_X - lineWidth;
          }

          page.drawText(line, {
            x: textX,
            y: textY,
            size: cellSize,
            font,
          });
          textY -= lineHeight;
        }
      }

      y -= rowHeight;
    };

    const firstHeaderIndex = rows.findIndex((row) => row?.header);
    const headerRow = firstHeaderIndex >= 0 ? rows[firstHeaderIndex] : null;

    for (let index = 0; index < rows.length; index += 1) {
      if (
        block.repeatHeader &&
        headerRow &&
        index > 0 &&
        y < topY - 4 &&
        rows[index - 1] !== headerRow &&
        y - 36 < minY
      ) {
        await newPage();
        await drawHeaderRow(headerRow);
      }

      await drawRow(rows[index]);
    }

    y -= block.marginBottom ?? 10;
  };

  const drawProjectReviews = async (block: Extract<PerformanceReportBlock, { type: 'project-reviews' }>) => {
    if (typeof block.marginTop === 'number' && block.marginTop > 0) {
      y -= block.marginTop;
    }

    const projects = Array.isArray(block.projects) ? block.projects : [];
    for (let projectIndex = 0; projectIndex < projects.length; projectIndex += 1) {
      const project = projects[projectIndex];

      await drawTextBlock({
        type: 'text',
        text: `Project Name: ${project.projectName || ''}`,
        bold: true,
        marginBottom: 4,
      });

      await drawTextBlock({
        type: 'text',
        text: `Employee's Role in the Project: ${project.employeeRole || ''}`,
        bold: true,
        marginBottom: 8,
      });

      await drawTable({
        type: 'table',
        columnWidths: [1.5, 0.55, 2.45],
        rows: [
          {
            header: true,
            cells: [
              { text: 'CHARACTERISTICS', bold: true, align: 'center' },
              { text: 'RATING', bold: true, align: 'center' },
              { text: 'REMARKS', bold: true, align: 'center' },
            ],
          },
          ...(Array.isArray(project.criteria) ? project.criteria : []).map((row) => ({
            cells: [row.characteristic || '', row.rating || '0', row.remarks || ''],
          })),
        ],
      });

      if (projectIndex < projects.length - 1) {
        y -= 10;
      }
    }

    y -= block.marginBottom ?? 6;
  };

  const title = String(report.title || 'EMPLOYEE PERFORMANCE REPORT');
  const titleSize = TYPOGRAPHY.heading1.size + 1;
  await ensureSpace(42);
  const titleWidth = bold.widthOfTextAtSize(title, titleSize);
  page.drawText(title, {
    x: leftX + (contentWidth - titleWidth) / 2,
    y,
    size: titleSize,
    font: bold,
  });
  y -= 34;

  const blocks = report.blocks || [];

  for (let blockIndex = 0; blockIndex < blocks.length; blockIndex += 1) {
    const block = blocks[blockIndex];
    if (block.type === 'spacer') {
      y -= Math.max(0, Number(block.height || 8));
      continue;
    }

    if (block.type === 'heading' || block.type === 'text') {
      await drawTextBlock(block);
      continue;
    }

    if (block.type === 'project-reviews') {
      await drawProjectReviews(block);
      continue;
    }

    if (block.type === 'table') {
      await drawTable(block);
    }
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
};