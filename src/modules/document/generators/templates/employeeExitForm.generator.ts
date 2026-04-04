import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, rgb } from 'pdf-lib';
import {
  EMPLOYEE_EXIT_FORM_DEFAULT_CLEARANCE_STATUSES,
  EMPLOYEE_EXIT_FORM_DEFAULT_DATE_TEXT,
  EMPLOYEE_EXIT_FORM_DEFAULT_HANDOVER_CONFIRMATION,
  EMPLOYEE_EXIT_FORM_DEFAULT_PROPERTY_HANDOVER,
  EMPLOYEE_EXIT_FORM_DEFAULT_REMARKS,
} from '../../config/document.config.ts';
import { LETTER_LAYOUT } from '../../config/letterLayout.config.ts';
import { TYPOGRAPHY } from '../../config/typography.config.ts';
import { embedDMSansFonts } from '../../utils/fontLoader.util.ts';
import { loadSignatureImage } from '../../utils/loadSignatureImage.util.ts';
import { textWidth } from '../../utils/pdfTextLayout.util.ts';

const BORDER_COLOR = rgb(0, 0, 0);
const HEADER_FILL = rgb(0.97, 0.97, 0.97);
const SAFE_BOTTOM_MARGIN = 48;
const CELL_PADDING_X = 10;
const CELL_PADDING_Y = 8;
const SECTION_SEPARATOR_TOP_GAP = 16;
const SECTION_SEPARATOR_BOTTOM_GAP = 28;
const SECTION_HEADING_SAFE_GAP = 12;

const firstDefined = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    return value;
  }

  return undefined;
};

const normalizeDateText = (value) => {
  if (!value) return EMPLOYEE_EXIT_FORM_DEFAULT_DATE_TEXT;

  if (typeof value === 'string' && /\d{1,2}(st|nd|rd|th)\s+[A-Za-z]+,?\s+\d{4}/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  const day = parsed.getDate();
  const month = parsed.toLocaleDateString('en-GB', { month: 'long' });
  const year = parsed.getFullYear();
  const suffix = day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th';
  return `${String(day).padStart(2, '0')}${suffix} ${month}, ${year}`;
};

const wrapText = (font, text, size, maxWidth) => {
  const input = String(text ?? '');
  const paragraphs = input.split(/\r?\n/);
  const lines = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }

    const words = paragraph.split(/\s+/);
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
          continue;
        }

        if (fragment) {
          lines.push(fragment);
        }
        fragment = character;
      }

      currentLine = fragment;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines.length > 0 ? lines : [''];
};

const measureTextCellHeight = ({ font, text, size, width, paddingY }) => {
  const lineHeight = size + 4;
  const lines = wrapText(font, text, size, width);
  return Math.max(lineHeight + paddingY * 2, lines.length * lineHeight + paddingY * 2);
};

const drawWrappedTextInCell = ({ page, font, text, size, x, y, width, height, align = 'left' }) => {
  const lineHeight = size + 4;
  const lines = wrapText(font, text, size, width - CELL_PADDING_X * 2);
  const contentHeight = lines.length * lineHeight;
  let cursorY = y - CELL_PADDING_Y - size;

  const topAlignedY = y - CELL_PADDING_Y - size;

  if (align === 'center') {
    cursorY = y - ((height - contentHeight) / 2) - size;
  } else if (height > contentHeight + CELL_PADDING_Y * 2) {
    cursorY = Math.min(topAlignedY, y - CELL_PADDING_Y - size);
  }

  for (const line of lines) {
    let cursorX = x + CELL_PADDING_X;
    const lineWidth = font.widthOfTextAtSize(line, size);
    if (align === 'center') {
      cursorX = x + (width - lineWidth) / 2;
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

const drawCheckboxOptions = ({ page, font, size, x, y, options, width }) => {
  const boxSize = 9;
  const optionGap = 18;
  let cursorX = x + CELL_PADDING_X;
  const baselineY = y - CELL_PADDING_Y - boxSize + 2;

  for (const option of options) {
    const label = String(option.label || '');
    const labelWidth = font.widthOfTextAtSize(label, size);
    const lineWidth = boxSize + 6 + labelWidth;
    if (cursorX + lineWidth > x + width - CELL_PADDING_X) {
      break;
    }

    if (option.checked) {
      page.drawLine({
        start: { x: cursorX + 1.5, y: baselineY + boxSize / 2 },
        end: { x: cursorX + boxSize / 2.5, y: baselineY + 1.5 },
        thickness: 1.1,
        color: BORDER_COLOR,
      });
      page.drawLine({
        start: { x: cursorX + boxSize / 2.5, y: baselineY + 1.5 },
        end: { x: cursorX + boxSize - 1.5, y: baselineY + boxSize - 1.5 },
        thickness: 1.1,
        color: BORDER_COLOR,
      });
    }

    page.drawRectangle({
      x: cursorX,
      y: baselineY,
      width: boxSize,
      height: boxSize,
      borderColor: BORDER_COLOR,
      borderWidth: 1,
    });

    page.drawText(label, {
      x: cursorX + boxSize + 6,
      y: baselineY - 0.5,
      size,
      font,
    });

    cursorX += lineWidth + optionGap;
  }
};

const drawKeyValueList = async ({
  pageAccess,
  leftX,
  contentWidth,
  entries,
  labelFont,
  valueFont,
  valueSize = TYPOGRAPHY.body.size,
  gap = 6,
}) => {
  const labelWidth = Math.min(190, contentWidth * 0.35);
  const valueX = leftX + labelWidth + 8;
  const valueWidth = contentWidth - labelWidth - 8;
  const lineHeight = valueSize + 6;

  for (const entry of entries) {
    const label = String(entry.label || '');
    const value = firstDefined(entry.value, '-') || '-';
    const wrappedValue = wrapText(valueFont, String(value), valueSize, valueWidth);
    const requiredHeight = Math.max(lineHeight, wrappedValue.length * (valueSize + 4)) + gap;
    await pageAccess.ensureSpace(requiredHeight);

    const y = pageAccess.getY();
    const page = pageAccess.getPage();
    page.drawText(`${label}:`, {
      x: leftX,
      y,
      size: TYPOGRAPHY.bodyHighlighted.size,
      font: labelFont,
    });

    let cursorY = y;
    for (const line of wrappedValue) {
      page.drawText(line, {
        x: valueX,
        y: cursorY,
        size: valueSize,
        font: valueFont,
      });
      cursorY -= valueSize + 4;
    }

    pageAccess.setY(y - requiredHeight);
  }
};

const getSelectedLabel = (value, fallback) => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (value && typeof value === 'object') {
    if (typeof value.selected === 'string' && value.selected.trim()) {
      return value.selected.trim();
    }
    if (value.cleared || value.checked || value.yes) return fallback;
    if (value.notCleared || value.no || value.notApplicable) {
      return fallback === 'Yes' ? 'Not Applicable' : 'Not Cleared';
    }
  }

  return fallback;
};

const drawTable = async ({
  pageAccess,
  leftX,
  widths,
  headers,
  rows,
  bodyFont,
  bodyBoldFont,
  headerFont,
  size = TYPOGRAPHY.body.size,
  rowGap = 0,
  minY,
  repeatHeader = false,
}) => {
  const lineHeight = size + 4;
  const headerHeight = 28;
  const paddingY = CELL_PADDING_Y;
  const paddingX = CELL_PADDING_X;

  const drawHeader = () => {
    const page = pageAccess.getPage();
    let cursorX = leftX;
    for (let index = 0; index < headers.length; index += 1) {
      const width = widths[index];
      page.drawRectangle({
        x: cursorX,
        y: pageAccess.getY() - headerHeight,
        width,
        height: headerHeight,
        borderColor: BORDER_COLOR,
        borderWidth: 1,
        color: HEADER_FILL,
      });
      page.drawText(String(headers[index] || ''), {
        x: cursorX + paddingX,
        y: pageAccess.getY() - 18,
        size,
        font: headerFont,
      });
      cursorX += width;
    }

    pageAccess.setY(pageAccess.getY() - headerHeight);
  };

  const drawRow = async (row) => {
    const cellHeights = row.map((cell, index) => {
      if (typeof cell.height === 'number') {
        return cell.height;
      }

      if (cell.kind === 'options') {
        const optionCount = Array.isArray(cell.options) ? cell.options.length : 0;
        return Math.max(lineHeight + paddingY * 2, optionCount * (size + 7) + paddingY * 2);
      }

      return measureTextCellHeight({
        font: cell.font || bodyFont,
        text: cell.text,
        size: cell.size || size,
        width: widths[index] - paddingX * 2,
        paddingY,
      });
    });

    const rowHeight = Math.max(...cellHeights, lineHeight + paddingY * 2);

    if (pageAccess.getY() - rowHeight < minY) {
      await pageAccess.ensureSpace(rowHeight + headerHeight + rowGap + 8);
      if (repeatHeader) {
        drawHeader();
      }
    }

    const page = pageAccess.getPage();
    let cursorX = leftX;
    for (let index = 0; index < row.length; index += 1) {
      const cell = row[index];
      const width = widths[index];
      page.drawRectangle({
        x: cursorX,
        y: pageAccess.getY() - rowHeight,
        width,
        height: rowHeight,
        borderColor: BORDER_COLOR,
        borderWidth: 1,
      });

      if (cell.kind === 'options') {
        drawCheckboxOptions({
          page,
          font: bodyFont,
          size,
          x: cursorX,
          y: pageAccess.getY(),
          options: cell.options || [],
          width,
        });
      } else {
        drawWrappedTextInCell({
          page,
          font: cell.bold ? bodyBoldFont : cell.font || bodyFont,
          text: cell.text,
          size: cell.size || size,
          x: cursorX,
          y: pageAccess.getY(),
          width,
          height: rowHeight,
          align: cell.align || 'left',
        });
      }

      cursorX += width;
    }

    pageAccess.setY(pageAccess.getY() - rowHeight - rowGap);
  };

  if (headers.length > 0) {
    drawHeader();
  }

  for (const row of rows) {
    await drawRow(row);
  }
};

const drawSectionHeading = async ({ pageAccess, leftX, contentWidth, title, font }) => {
  const size = TYPOGRAPHY.heading2.size;
  const titleWidth = textWidth(font, title, size);
  const headingHeight = size + 14;
  await pageAccess.ensureSpace(headingHeight);
  const currentPage = pageAccess.getPage();
  currentPage.drawText(title, {
    x: leftX + (contentWidth - titleWidth) / 2,
    y: pageAccess.getY(),
    size,
    font,
  });
  pageAccess.setY(pageAccess.getY() - headingHeight);
};

const drawParagraphBlock = async ({
  pageAccess,
  leftX,
  contentWidth,
  text,
  font,
  size = TYPOGRAPHY.body.size,
  lineGap = TYPOGRAPHY.body.lineGap,
}) => {
  const lineHeight = size + lineGap;
  const lines = wrapText(font, text, size, contentWidth);
  const requiredHeight = lines.length * lineHeight + 4;
  await pageAccess.ensureSpace(requiredHeight);
  const page = pageAccess.getPage();

  let cursorY = pageAccess.getY();
  for (const line of lines) {
    page.drawText(line, {
      x: leftX,
      y: cursorY,
      size,
      font,
    });
    cursorY -= lineHeight;
  }

  pageAccess.setY(cursorY - 4);
};

const drawSignatureLine = async ({ pageAccess, leftX, rightX = undefined, label, value, font, size }) => {
  await pageAccess.ensureSpace(size + 18);
  const page = pageAccess.getPage();
  const y = pageAccess.getY();

  page.drawText(`${label}:`, {
    x: leftX,
    y,
    size,
    font,
  });

  const lineStartX = leftX + textWidth(font, `${label}:`, size) + 8;
  if (value) {
    page.drawText(String(value), {
      x: lineStartX,
      y,
      size,
      font,
    });
  } else {
    const lineEndX = rightX ?? lineStartX + 190;
    page.drawLine({
      start: { x: lineStartX, y: y - 2 },
      end: { x: lineEndX, y: y - 2 },
      thickness: 1,
      color: BORDER_COLOR,
    });
  }

  pageAccess.setY(y - (size + 18));
};

const drawSignatureOnlyBlock = async ({
  pdfDoc,
  pageAccess,
  leftX,
  label = 'Signature',
  signatureUrl,
  font,
}) => {
  const signatureImage = signatureUrl ? await loadSignatureImage(pdfDoc, signatureUrl) : null;
  const maxWidth = 150;
  const maxHeight = 40;
  const imageHeight = signatureImage
    ? Math.min(maxWidth / signatureImage.width, maxHeight / signatureImage.height) * signatureImage.height
    : 0;

  const labelHeight = TYPOGRAPHY.bodyHighlighted.size + 10;
  const blockHeight = labelHeight + (imageHeight ? imageHeight + 10 : 22);
  await pageAccess.ensureSpace(blockHeight);
  const page = pageAccess.getPage();

  let cursorY = pageAccess.getY();
  if (label && String(label).trim()) {
    page.drawText(`${label}:`, {
      x: leftX,
      y: cursorY,
      size: TYPOGRAPHY.bodyHighlighted.size,
      font,
    });
  }

  cursorY -= labelHeight;

  if (signatureImage) {
    const ratio = Math.min(maxWidth / signatureImage.width, maxHeight / signatureImage.height);
    const drawWidth = signatureImage.width * ratio;
    const drawHeight = signatureImage.height * ratio;
    page.drawImage(signatureImage, {
      x: leftX,
      y: cursorY - drawHeight + 4,
      width: drawWidth,
      height: drawHeight,
    });
    pageAccess.setY(cursorY - drawHeight - 10);
    return;
  }

  page.drawLine({
    start: { x: leftX, y: cursorY - 2 },
    end: { x: leftX + 220, y: cursorY - 2 },
    thickness: 1,
    color: BORDER_COLOR,
  });

  pageAccess.setY(cursorY - 18);
};

const drawLabelValue = async ({ pageAccess, leftX, label, value, labelFont, valueFont, size }) => {
  const textHeight = size + 14;
  await pageAccess.ensureSpace(textHeight);
  const page = pageAccess.getPage();
  const y = pageAccess.getY();

  page.drawText(`${label}:`, {
    x: leftX,
    y,
    size,
    font: labelFont,
  });

  page.drawText(String(firstDefined(value, '-')), {
    x: leftX + textWidth(labelFont, `${label}:`, size) + 8,
    y,
    size,
    font: valueFont,
  });

  pageAccess.setY(y - textHeight);
};


const resolveInfoValue = (payload, key, fallback = '') =>
  firstDefined(payload?.employeeInformation?.[key], payload?.sectionA?.[key], payload?.[key], fallback) || '';

const resolveExitDate = (payload, issuedAt) =>
  normalizeDateText(firstDefined(payload?.date, payload?.issueDate, issuedAt, EMPLOYEE_EXIT_FORM_DEFAULT_DATE_TEXT));

export const generateEmployeeExitFormPdfBuffer = async (
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

  const pageWidth = page.getWidth();
  const topY = page.getHeight() - LETTER_LAYOUT.topOffset;
  const leftX = LETTER_LAYOUT.sidePadding;
  const rightX = pageWidth - LETTER_LAYOUT.sidePadding;
  const contentWidth = rightX - leftX;
  const minY = Math.max(LETTER_LAYOUT.minY, SAFE_BOTTOM_MARGIN);

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

  const pageAccess = {
    getPage: () => page,
    getY: () => y,
    setY: (nextY) => {
      y = nextY;
    },
    ensureSpace,
  };

  const beginSection = async (title, drawDivider = true, minContentHeight = 0) => {
    const dividerTopGap = SECTION_SEPARATOR_TOP_GAP;
    const dividerBottomGap = SECTION_SEPARATOR_BOTTOM_GAP;
    const headingHeight = TYPOGRAPHY.heading2.size + 14;
    const wantsDivider = drawDivider && y < topY - 4;

    if (wantsDivider) {
      const requiredWithDivider =
        dividerTopGap + dividerBottomGap + SECTION_HEADING_SAFE_GAP + headingHeight + minContentHeight;
      const canStayOnSamePageWithDivider = y - requiredWithDivider >= minY;

      if (canStayOnSamePageWithDivider) {
        page.drawLine({
          start: { x: leftX, y: y - dividerTopGap },
          end: { x: rightX, y: y - dividerTopGap },
          thickness: 1,
          color: BORDER_COLOR,
        });
        y -= dividerTopGap + dividerBottomGap + SECTION_HEADING_SAFE_GAP;
      } else {
        await newTemplatePage();
      }
    }

    if (minContentHeight > 0) {
      await ensureSpace(headingHeight + minContentHeight);
    } else {
      await ensureSpace(headingHeight);
    }

    await drawSectionHeading({
      pageAccess,
      leftX,
      contentWidth,
      title,
      font: boldFont,
    });
  };

  const sectionTitle = payload.title || 'Employee Exit Form';
  const titleSize = TYPOGRAPHY.heading1.size;
  const titleWidth = textWidth(boldFont, sectionTitle, titleSize);
  await ensureSpace(48);
  page.drawText(sectionTitle, {
    x: (pageWidth - titleWidth) / 2,
    y,
    size: titleSize,
    font: boldFont,
  });
  y -= 38;

  const issueText = resolveExitDate(payload, issuedAt);
  const issueWidth = textWidth(boldFont, `Date: ${issueText}`, TYPOGRAPHY.bodyHighlighted.size);
  page.drawText(`Date: ${issueText}`, {
    x: rightX - issueWidth,
    y,
    size: TYPOGRAPHY.bodyHighlighted.size,
    font: boldFont,
  });
  y -= 26;

  const sectionAFields = [
    ['Full Name', resolveInfoValue(payload, 'fullName', resolveInfoValue(payload, 'employeeName'))],
    ['Employee ID', resolveInfoValue(payload, 'employeeId')],
    ['Department', resolveInfoValue(payload, 'department')],
    ['Employee Type', resolveInfoValue(payload, 'employeeType')],
    ['Contact info', resolveInfoValue(payload, 'contactInfo')],
    ['Designation', resolveInfoValue(payload, 'designation')],
    ['Date of Joining', normalizeDateText(resolveInfoValue(payload, 'dateOfJoining'))],
    ['Date of Resignation Submitted', normalizeDateText(resolveInfoValue(payload, 'resignationSubmittedDate'))],
    ['Date of Resignation Accepted', normalizeDateText(resolveInfoValue(payload, 'resignationAcceptedDate'))],
    ['Last Working Day', normalizeDateText(resolveInfoValue(payload, 'lastWorkingDay'))],
    ['Reporting Manager', resolveInfoValue(payload, 'reportingManager')],
    ['Reason for Resignation', resolveInfoValue(payload, 'reasonForResignation')],
  ];

  await beginSection('Section A: Employee Information', false, 170);

  await drawKeyValueList({
    pageAccess,
    leftX,
    contentWidth,
    entries: sectionAFields.map(([label, value]) => ({ label, value })),
    labelFont: boldFont,
    valueFont: regularFont,
    valueSize: TYPOGRAPHY.body.size,
  });

  await beginSection('Section B: Exit Clearance Checklist', true, 130);

  await drawParagraphBlock({
    pageAccess,
    leftX,
    contentWidth,
    font: regularFont,
    text: 'Please ensure that clearance is obtained from the following departments:',
  });

  const clearance = payload.exitClearanceChecklist || payload.sectionB || {};
  const clearanceRows = [
    {
      department: 'Reporting Manager',
      selected: getSelectedLabel(clearance.reportingManager, EMPLOYEE_EXIT_FORM_DEFAULT_CLEARANCE_STATUSES.reportingManager),
      remarks: firstDefined(
        clearance.reportingManagerRemarks,
        clearance.reportingManagerRemark,
        clearance.reportingManager?.remarks,
        clearance.reportingManager?.remark,
        '-'
      ),
    },
    {
      department: 'Human Resources (HR)',
      selected: getSelectedLabel(clearance.humanResources, EMPLOYEE_EXIT_FORM_DEFAULT_CLEARANCE_STATUSES.humanResources),
      remarks: firstDefined(
        clearance.humanResourcesRemarks,
        clearance.humanResourcesRemark,
        clearance.humanResources?.remarks,
        clearance.humanResources?.remark,
        '-'
      ),
    },
    {
      department: 'IT / Administration',
      selected: getSelectedLabel(clearance.itAdministration, EMPLOYEE_EXIT_FORM_DEFAULT_CLEARANCE_STATUSES.itAdministration),
      remarks: firstDefined(
        clearance.itAdministrationRemarks,
        clearance.itAdministrationRemark,
        clearance.itAdministration?.remarks,
        clearance.itAdministration?.remark,
        '-'
      ),
    },
    {
      department: 'Finance & Accounts',
      selected: getSelectedLabel(clearance.financeAccounts, EMPLOYEE_EXIT_FORM_DEFAULT_CLEARANCE_STATUSES.financeAccounts),
      remarks: firstDefined(
        clearance.financeAccountsRemarks,
        clearance.financeAccountsRemark,
        clearance.financeAccounts?.remarks,
        clearance.financeAccounts?.remark,
        '-'
      ),
    },
  ];

  await drawTable({
    pageAccess,
    leftX,
    widths: [contentWidth * 0.28, contentWidth * 0.32, contentWidth * 0.40],
    headers: ['Department', 'Clearance Status', 'Remarks'],
    rows: clearanceRows.map((row) => [
      { text: row.department, bold: true },
      {
        kind: 'options',
        options: [
          { label: 'Cleared', checked: row.selected === 'Cleared' },
          { label: 'Not Cleared', checked: row.selected === 'Not Cleared' },
        ],
      },
      { text: row.remarks || '-', align: 'center' },
    ]),
    bodyFont: regularFont,
    bodyBoldFont: boldFont,
    headerFont: boldFont,
    size: TYPOGRAPHY.body.size,
    rowGap: 0,
    minY,
    repeatHeader: true,
  });

  pageAccess.setY(pageAccess.getY() - 10);

  await beginSection('Section C: Company Property Handover', true, 120);

  const propertyRows = (payload.companyPropertyHandover || payload.sectionC || EMPLOYEE_EXIT_FORM_DEFAULT_PROPERTY_HANDOVER).map(
    (item) => ({
      assetDescription: item.assetDescription || item.description || '',
      returned: firstDefined(item.returned, item.status, 'NA'),
      remarks: firstDefined(item.remarks, '-'),
    })
  );

  await drawTable({
    pageAccess,
    leftX,
    widths: [contentWidth * 0.35, contentWidth * 0.25, contentWidth * 0.40],
    headers: ['Asset Description', 'Returned (✓)', 'Remarks'],
    rows: propertyRows.map((row) => [
      { text: row.assetDescription, bold: true },
      { text: row.returned },
      { text: row.remarks || '-', align: 'center' },
    ]),
    bodyFont: regularFont,
    bodyBoldFont: boldFont,
    headerFont: boldFont,
    size: TYPOGRAPHY.body.size,
    rowGap: 0,
    minY,
    repeatHeader: true,
  });

  pageAccess.setY(pageAccess.getY() - 10);

  await beginSection('Section D: Knowledge Transfer & Work Handover Confirmation', true, 160);

  const handover = payload.handoverConfirmation || payload.sectionD || {};
  const handoverSummaryRows = [
    ['Handover Completed To', firstDefined(handover.handoverCompletedTo, payload.handoverCompletedTo, '')],
    ['Handover Date', normalizeDateText(firstDefined(handover.handoverDate, payload.handoverDate, ''))],
    [
      'List of Ongoing Projects / Tasks Handover Summary',
      firstDefined(handover.summary, handover.handoverSummary, payload.handoverSummary, ''),
    ],
  ];

  await drawTable({
    pageAccess,
    leftX,
    widths: [contentWidth * 0.35, contentWidth * 0.65],
    headers: ['Field', 'Details'],
    rows: handoverSummaryRows.map(([label, value]) => [
      { text: label, bold: true },
      { text: value || '' },
    ]),
    bodyFont: regularFont,
    bodyBoldFont: boldFont,
    headerFont: boldFont,
    size: TYPOGRAPHY.body.size,
    rowGap: 0,
    minY,
    repeatHeader: true,
  });

  pageAccess.setY(pageAccess.getY() - 12);

  const statusRows = (handover.statuses || EMPLOYEE_EXIT_FORM_DEFAULT_HANDOVER_CONFIRMATION).map((item) => ({
    field: item.field || item.label || '',
    selected: getSelectedLabel(item.selected || item.status || item.value, 'Yes'),
  }));

  await drawTable({
    pageAccess,
    leftX,
    widths: [contentWidth * 0.47, contentWidth * 0.53],
    headers: ['Field', 'Details'],
    rows: statusRows.map((row) => [
      { text: row.field, bold: true },
      {
        kind: 'options',
        options: [
          { label: 'Yes', checked: row.selected === 'Yes' },
          { label: 'Not Applicable', checked: row.selected === 'Not Applicable' },
        ],
      },
    ]),
    bodyFont: regularFont,
    bodyBoldFont: boldFont,
    headerFont: boldFont,
    size: TYPOGRAPHY.body.size,
    rowGap: 0,
    minY,
    repeatHeader: true,
  });

  pageAccess.setY(pageAccess.getY() - 12);

  pageAccess.setY(pageAccess.getY() - 10);
  const remarksText = firstDefined(handover.remarks, payload.remarks, EMPLOYEE_EXIT_FORM_DEFAULT_REMARKS);
  page.drawText(`Remarks: ${remarksText}`, {
    x: leftX,
    y: pageAccess.getY(),
    size: TYPOGRAPHY.bodyHighlighted.size,
    font: boldFont,
  });
  pageAccess.setY(pageAccess.getY() - 24);

  await drawSignatureLine({
    pageAccess,
    leftX,
    label: 'Employee Signature',
    value: '',
    font: boldFont,
    size: TYPOGRAPHY.bodyHighlighted.size,
  });

  await drawSignatureLine({
    pageAccess,
    leftX,
    label: 'Date',
    value: issueText,
    font: boldFont,
    size: TYPOGRAPHY.bodyHighlighted.size,
  });

  await drawSignatureOnlyBlock({
    pdfDoc,
    pageAccess,
    leftX,
    label: 'Reporting Manager Signature',
    signatureUrl: firstDefined(payload.reportingManagerSignatureUrl, payload.managerSignatureUrl),
    font: boldFont,
  });

  pageAccess.setY(pageAccess.getY() - 12);


  await beginSection("Section E: Reporting Manager's Note", true, 120);

  await drawParagraphBlock({
    pageAccess,
    leftX,
    contentWidth,
    font: regularFont,
    text:
      payload.reportingManagerNoteInstructions ||
      "Kindly provide a brief summary of the employee's performance, contribution to the team, and recommendation regarding future engagement (rehire eligibility, referrals, etc.):",
  });

  await drawParagraphBlock({
    pageAccess,
    leftX,
    contentWidth,
    font: regularFont,
    text: firstDefined(payload.reportingManagerNote, `Mr. ${resolveInfoValue(payload, 'fullName', resolveInfoValue(payload, 'employeeName'))}`),
  });

  await drawLabelValue({
    pageAccess,
    leftX,
    label: 'Reporting Manager Name',
    value: firstDefined(
      payload.reportingManagerName,
      payload.managerFullName,
      payload.employeeInformation?.reportingManager,
      payload.reportingManager,
      'Amit Sharma'
    ),
    labelFont: boldFont,
    valueFont: regularFont,
    size: TYPOGRAPHY.bodyHighlighted.size,
  });

  await drawSignatureOnlyBlock({
    pdfDoc,
    pageAccess,
    leftX,
    label: 'Signature',
    signatureUrl: firstDefined(payload.managerSignatureUrl, payload.signatureUrl),
    font: boldFont,
  });

  await drawSignatureLine({
    pageAccess,
    leftX,
    label: 'Date',
    value: issueText,
    font: boldFont,
    size: TYPOGRAPHY.bodyHighlighted.size,
  });

  await beginSection('Section F: Employee Declaration', true, 110);

  await drawParagraphBlock({
    pageAccess,
    leftX,
    contentWidth,
    font: regularFont,
    text:
      payload.employeeDeclaration ||
      'I hereby confirm that I have submitted all company assets assigned to me, completed my responsibilities to the best of my knowledge, and have no outstanding obligations towards the organization.',
  });

  await drawSignatureLine({
    pageAccess,
    leftX,
    label: 'Employee Signature',
    value: '',
    font: boldFont,
    size: TYPOGRAPHY.bodyHighlighted.size,
  });

  await drawSignatureLine({
    pageAccess,
    leftX,
    label: 'Date',
    value: '',
    font: boldFont,
    size: TYPOGRAPHY.bodyHighlighted.size,
  });

  await beginSection('Section G: HR Review and Final Approval', true, 170);

  const hrReview = payload.hrReviewAndFinalApproval || payload.sectionG || {};
  const finalApprovalRows = [
    [
      'Final Settlement Date',
      firstDefined(
        hrReview.finalSettlementDate,
        payload.finalSettlementDate,
        'Will Get Settle within 30-45 Days from Submitting the signed Exit Form'
      ),
    ],
    [
      'Eligible for Rehire',
      getSelectedLabel(hrReview.eligibleForRehire, 'No'),
    ],
    ['HR Remarks', firstDefined(hrReview.hrRemarks, payload.hrRemarks, '')],
    ['Finance & Accounts', firstDefined(hrReview.financeAndAccounts, payload.financeAndAccounts, 'NA')],
  ];

  await drawTable({
    pageAccess,
    leftX,
    widths: [contentWidth * 0.34, contentWidth * 0.66],
    headers: ['Field', 'Details'],
    rows: finalApprovalRows.map(([label, value]) => [
      { text: label, bold: true },
      label === 'Eligible for Rehire'
        ? {
            kind: 'options',
            options: [
              { label: 'Yes', checked: value === 'Yes' },
              { label: 'No', checked: value === 'No' },
            ],
          }
        : { text: value || '', align: label === 'Finance & Accounts' ? 'center' : 'left' },
    ]),
    bodyFont: regularFont,
    bodyBoldFont: boldFont,
    headerFont: boldFont,
    size: TYPOGRAPHY.body.size,
    rowGap: 0,
    minY,
    repeatHeader: true,
  });

  pageAccess.setY(pageAccess.getY() - 28);

  await drawLabelValue({
    pageAccess,
    leftX,
    label: 'Reviewed by',
    value: firstDefined(hrReview.reviewedBy, hrReview.hrName, payload.hrName, 'Miss Shruti Kabra'),
    labelFont: boldFont,
    valueFont: regularFont,
    size: TYPOGRAPHY.bodyHighlighted.size,
  });

  await drawSignatureOnlyBlock({
    pdfDoc,
    pageAccess,
    leftX,
    label: 'Signature',
    signatureUrl: firstDefined(payload.hrSignatureUrl, hrReview.hrSignatureUrl, payload.signatureUrl),
    font: boldFont,
  });
  await drawSignatureLine({
    pageAccess,
    leftX,
    label: 'Date',
    value: issueText,
    font: boldFont,
    size: TYPOGRAPHY.bodyHighlighted.size,
  });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
};