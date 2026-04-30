const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const getCellText = (cell: unknown): string | undefined => {
  if (typeof cell === 'string') {
    return cell;
  }

  if (cell && typeof cell === 'object' && 'text' in cell) {
    const text = (cell as { text?: unknown }).text;
    return typeof text === 'string' ? text : undefined;
  }

  return undefined;
};

const isTableBlock = (block: unknown): block is { rows: Array<{ cells?: unknown[] }> } =>
  Boolean(block) &&
  typeof block === 'object' &&
  (block as { type?: string }).type === 'table' &&
  Array.isArray((block as { rows?: unknown[] }).rows);

const findAcknowledgementTable = (
  blocks: unknown[]
): { rows: Array<{ cells?: unknown[] }> } | undefined => {
  return blocks.find(
    (block) =>
      isTableBlock(block) &&
      block.rows.some((row) => {
        if (!Array.isArray(row?.cells) || row.cells.length === 0) return false;
        const firstCell = getCellText(row.cells[0]);
        return ['Name', 'Signature', 'Date'].includes(String(firstCell || '').trim());
      })
  ) as { rows: Array<{ cells?: unknown[] }> } | undefined;
};

const setRowCell = (
  table: { rows: Array<{ cells?: unknown[] }> },
  rowLabel: string,
  columnIndex: number,
  value: unknown
) => {
  const row = table.rows.find((candidate) => {
    if (!Array.isArray(candidate?.cells) || candidate.cells.length === 0) return false;
    return String(getCellText(candidate.cells[0]) || '').trim() === rowLabel;
  });

  if (!row || !Array.isArray(row.cells) || row.cells.length <= columnIndex) {
    return;
  }

  row.cells[columnIndex] = value;
};

const buildGeneratedSignatureCell = (name: string) => ({
  text: name,
  align: 'left',
  fontStyle: 'signature',
  size: 24,
  disclaimerText: '* AMS generated signature',
  disclaimerSize: 8,
});

const findReviewerNameFromBlocks = (blocks: unknown[]): string | null => {
  for (const block of blocks) {
    if (!isTableBlock(block)) continue;

    const rows = Array.isArray(block.rows) ? block.rows : [];
    for (let index = 0; index < rows.length - 1; index += 1) {
      const headerRow = rows[index];
      const valueRow = rows[index + 1];
      const headers = Array.isArray(headerRow?.cells) ? headerRow.cells : [];
      const values = Array.isArray(valueRow?.cells) ? valueRow.cells : [];

      if (
        headers.length >= 3 &&
        String(getCellText(headers[0]) || '').trim().toUpperCase() === 'REVIEWER NAME' &&
        String(getCellText(headers[1]) || '').trim().toUpperCase() === 'REVIEWER TITLE' &&
        String(getCellText(headers[2]) || '').trim().toUpperCase() === 'DATE SUBMITTED'
      ) {
        const reviewerName = String(getCellText(values[0]) || '').trim();
        if (reviewerName) return reviewerName;
      }
    }
  }

  return null;
};

export const formatAcknowledgementTimestamp = (timestamp: Date) => {
  const parts = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(timestamp);

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const day = map.day || '';
  const month = map.month || '';
  const year = map.year || '';
  const hour = map.hour || '';
  const minute = map.minute || '';
  const dayPeriod = String(map.dayPeriod || '').toUpperCase();

  return `${day} ${month} ${year} | ${hour}:${minute} ${dayPeriod} IST`.replace(/\s+/g, ' ').trim();
};

export const stripHrAndEmployeeAcknowledgementSignaturesFromPayload = ({ payload }) => {
  const nextPayload = clone(payload || {});

  if (!Array.isArray(nextPayload.blocks)) {
    return nextPayload;
  }

  const acknowledgementTable = findAcknowledgementTable(nextPayload.blocks);
  if (!acknowledgementTable) {
    return nextPayload;
  }

  setRowCell(acknowledgementTable, 'Signature', 2, '');
  setRowCell(acknowledgementTable, 'Signature', 3, '');
  setRowCell(acknowledgementTable, 'Date', 2, '');
  setRowCell(acknowledgementTable, 'Date', 3, '');

  return nextPayload;
};

export const applyManagerReviewOnPerformanceReportPayload = ({
  payload,
  reviewerName,
  reviewedAt,
}) => {
  const nextPayload = clone(payload || {});

  if (!Array.isArray(nextPayload.blocks)) {
    return nextPayload;
  }

  const resolvedReviewerName =
    (typeof reviewerName === 'string' ? reviewerName.trim() : '') || findReviewerNameFromBlocks(nextPayload.blocks);
  if (!resolvedReviewerName) {
    return nextPayload;
  }

  const acknowledgementTable = findAcknowledgementTable(nextPayload.blocks);
  if (!acknowledgementTable) {
    return nextPayload;
  }

  setRowCell(acknowledgementTable, 'Name', 1, resolvedReviewerName);
  setRowCell(acknowledgementTable, 'Signature', 1, buildGeneratedSignatureCell(resolvedReviewerName));
  setRowCell(acknowledgementTable, 'Date', 1, formatAcknowledgementTimestamp(reviewedAt));

  return nextPayload;
};

export const applyHrReviewOnPerformanceReportPayload = ({
  payload,
  hrName,
  reviewedAt,
}) => {
  const nextPayload = clone(payload || {});

  if (!Array.isArray(nextPayload.blocks)) {
    return nextPayload;
  }

  const acknowledgementTable = findAcknowledgementTable(nextPayload.blocks);
  if (!acknowledgementTable) {
    return nextPayload;
  }

  setRowCell(acknowledgementTable, 'Name', 2, hrName);
  setRowCell(acknowledgementTable, 'Signature', 2, buildGeneratedSignatureCell(hrName));
  setRowCell(acknowledgementTable, 'Date', 2, formatAcknowledgementTimestamp(reviewedAt));

  return nextPayload;
};

export const applyEmployeeAcknowledgementOnPerformanceReportPayload = ({
  payload,
  employeeName,
  acknowledgedAt,
}) => {
  const nextPayload = clone(payload || {});

  if (!Array.isArray(nextPayload.blocks)) {
    return nextPayload;
  }

  const acknowledgementTable = findAcknowledgementTable(nextPayload.blocks);
  if (!acknowledgementTable) {
    return nextPayload;
  }

  const timestamp = formatAcknowledgementTimestamp(acknowledgedAt);

  setRowCell(acknowledgementTable, 'Name', 3, employeeName);
  setRowCell(acknowledgementTable, 'Signature', 3, buildGeneratedSignatureCell(employeeName));
  setRowCell(acknowledgementTable, 'Date', 3, timestamp);

  return nextPayload;
};
