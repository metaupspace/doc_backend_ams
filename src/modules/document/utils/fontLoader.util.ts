import fs from 'node:fs/promises';
import path from 'node:path';
import type { PDFDocument } from 'pdf-lib';
import fontkit from 'fontkit';

/**
 * Font loading utility for DM Sans custom fonts
 * Provides cached font instances to minimize file I/O
 * 
 * PRODUCTION READY: Uses fontkit for custom TrueType font support
 */

// Cache for loaded fonts
const fontCache = new Map<string, Buffer>();

/**
 * Load DM Sans font from file system
 * @param variant - Font variant (e.g., 'Regular', 'Bold', 'Italic', 'BoldItalic')
 * @returns Buffer containing the font data
 */
export const loadDMSansFont = async (variant: string = 'Regular'): Promise<Buffer> => {
  const cacheKey = `DMSans-${variant}`;

  // Return cached font if available
  const cached = fontCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const fontPath = path.join(
      process.cwd(),
      'public',
      'fonts',
      'dm-sans',
      'static',
      `${cacheKey}.ttf`
    );

    const fontBuffer = await fs.readFile(fontPath);

    // Cache the font
    fontCache.set(cacheKey, fontBuffer);

    return fontBuffer;
  } catch {
    throw new Error(`Failed to load DM Sans ${variant} font. Ensure fonts exist at ./public/fonts/dm-sans/static/`);
  }
};

/**
 * Load Bilbo Swash Caps signature font from file system.
 */
export const loadBilboSwashCapsFont = async (): Promise<Buffer> => {
  const cacheKey = 'BilboSwashCaps-Regular';

  const cached = fontCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const fontPath = path.join(
      process.cwd(),
      'public',
      'fonts',
      'Bilbo_Swash_Caps',
      'BilboSwashCaps-Regular.ttf'
    );

    const fontBuffer = await fs.readFile(fontPath);
    fontCache.set(cacheKey, fontBuffer);
    return fontBuffer;
  } catch {
    throw new Error(
      'Failed to load Bilbo Swash Caps font. Ensure font exists at ./public/fonts/Bilbo_Swash_Caps/'
    );
  }
};

/**
 * Embed DM Sans fonts into PDF document
 * @param pdfDoc - PDF document instance
 * @returns Object with embedded font references
 */
export const embedDMSansFonts = async (pdfDoc: PDFDocument) => {
  // Register fontkit with the PDF document instance for custom font support
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (pdfDoc as any).registerFontkit(fontkit);

  const regularBuffer = await loadDMSansFont('Regular');
  const boldBuffer = await loadDMSansFont('Bold');
  const italicBuffer = await loadDMSansFont('Italic');
  const boldItalicBuffer = await loadDMSansFont('BoldItalic');

  return {
    regular: await pdfDoc.embedFont(regularBuffer),
    bold: await pdfDoc.embedFont(boldBuffer),
    italic: await pdfDoc.embedFont(italicBuffer),
    boldItalic: await pdfDoc.embedFont(boldItalicBuffer),
  };
};
