import type { PDFFont, PDFPage } from 'pdf-lib';
import { textWidth } from './pdfTextLayout.util.ts';

type PageAccess = {
  getPage: () => PDFPage;
  getY: () => number;
  setY: (nextY: number) => void;
  ensureSpace: (requiredHeight: number) => Promise<void>;
};

type DrawSimpleLineInput = {
  text: string;
  font: PDFFont;
  size: number;
  indent?: number;
  leftX: number;
  lineGap: number;
  pageAccess: PageAccess;
};

type DrawBulletLabelValueInput = {
  label: string;
  value: unknown;
  valueBold?: boolean;
  indent?: number;
  leftX: number;
  size: number;
  lineGap: number;
  labelFont: PDFFont;
  valueFont: PDFFont;
  valueFontBold: PDFFont;
  pageAccess: PageAccess;
};

export const drawSimpleLine = async ({
  text,
  font,
  size,
  indent = 0,
  leftX,
  lineGap,
  pageAccess,
}: DrawSimpleLineInput): Promise<void> => {
  const lineHeight = size + lineGap;
  await pageAccess.ensureSpace(lineHeight);
  const page = pageAccess.getPage();
  const y = pageAccess.getY();

  page.drawText(String(text || ''), {
    x: leftX + indent,
    y,
    size,
    font,
  });

  pageAccess.setY(y - lineHeight);
};

export const drawBulletLabelValue = async ({
  label,
  value,
  valueBold = false,
  indent = 0,
  leftX,
  size,
  lineGap,
  labelFont,
  valueFont,
  valueFontBold,
  pageAccess,
}: DrawBulletLabelValueInput): Promise<void> => {
  const bulletText = '•';
  const labelText = `${label}: `;
  const valueText = String(value || '-');
  const actualValueFont = valueBold ? valueFontBold : valueFont;
  const lineHeight = size + lineGap;
  const bulletSize = size * 1.3;
  const bulletGap = Math.max(8, Math.round(size * 0.7));

  await pageAccess.ensureSpace(lineHeight);

  const page = pageAccess.getPage();
  const y = pageAccess.getY();

  page.drawText(bulletText, {
    x: leftX + indent,
    y,
    size: bulletSize,
    font: labelFont,
  });

  const bulletWidth = textWidth(labelFont, bulletText, bulletSize);
  const labelStartX = leftX + indent + bulletWidth + bulletGap;

  page.drawText(labelText, {
    x: labelStartX,
    y,
    size,
    font: labelFont,
  });

  const labelWidth = textWidth(labelFont, labelText, size);

  page.drawText(valueText, {
    x: labelStartX + labelWidth,
    y,
    size,
    font: actualValueFont,
  });

  pageAccess.setY(y - lineHeight);
};
