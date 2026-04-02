import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { COMPANY_NAME } from '../../config/commonDetail.config.ts';
import {
  CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL,
  WARNING_DISCIPLINARY_LETTER_DEFAULT_INTRO_PARAGRAPH,
  WARNING_DISCIPLINARY_LETTER_DEFAULT_PARAGRAPHS,
} from '../../config/document.config.ts';
import { LETTER_LAYOUT } from '../../config/letterLayout.config.ts';
import { TYPOGRAPHY } from '../../config/typography.config.ts';
import { embedDMSansFonts } from '../../utils/fontLoader.util.ts';
import { formatIssueDate } from '../../utils/formatIssueDate.util.ts';
import { loadSignatureImage } from '../../utils/loadSignatureImage.util.ts';
import { parseRichText } from '../../utils/parseRichText.util.ts';
import { drawSimpleLine } from '../../utils/pdfLineLayout.util.ts';
import { drawRichParagraph, textWidth } from '../../utils/pdfTextLayout.util.ts';
import { normalizeParagraphsWithDefaults } from '../../utils/paragraphs.util.ts';

const WARNING_DISCIPLINARY_SPACING = {
  sectionBlockGap: 8,
  bulletLineGap: 7,
  bulletParagraphSpacing: 2,
  closingTopGap: 8,
  acknowledgementGapAfterSignBlock: 150,
  acknowledgementMinStartY: 190,
  acknowledgementLineTopGap: 30,
};

const resolveIssueText = (issueDate, issuedAt) => {
  if (typeof issueDate === 'string' && issueDate.trim()) {
    return issueDate.trim();
  }
  if (issueDate || issuedAt) {
    return formatIssueDate(issueDate || issuedAt);
  }
  return '[Date of Issuance]';
};

const drawBullets = async (items, drawParagraph) => {
  for (const item of items.filter(Boolean)) {
    await drawParagraph(
      `• ${item}`,
      TYPOGRAPHY.body.size,
      WARNING_DISCIPLINARY_SPACING.bulletLineGap,
      WARNING_DISCIPLINARY_SPACING.bulletParagraphSpacing
    );
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

  const fonts = await embedDMSansFonts(pdfDoc);
  const regularFont = fonts.regular;
  const boldFont = fonts.bold;
  const italicFont = fonts.italic;
  const boldItalicFont = fonts.boldItalic;

  const pageWidth = page.getWidth();
  const topY = page.getHeight() - LETTER_LAYOUT.topOffset;
  const leftX = LETTER_LAYOUT.sidePadding;
  const rightX = pageWidth - LETTER_LAYOUT.sidePadding;
  const contentWidth = rightX - leftX;
  const minY = LETTER_LAYOUT.minY;

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
    size = TYPOGRAPHY.body.size,
    lineGap = TYPOGRAPHY.body.lineGap,
    paragraphSpacing = TYPOGRAPHY.paragraphSpacing
  ) =>
    drawRichParagraph({
      text,
      parseRichText,
      leftX,
      contentWidth,
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

  const addSectionGap = async () => {
    if (y - WARNING_DISCIPLINARY_SPACING.sectionBlockGap < minY) {
      await newTemplatePage();
      return;
    }
    y -= WARNING_DISCIPLINARY_SPACING.sectionBlockGap;
  };

  const title = payload.title || 'WARNING AND DISCIPLINARY LETTER';
  const titleWidth = textWidth(boldFont, title, TYPOGRAPHY.heading1.size);
  await ensureSpace(58);
  page.drawText(title, {
    x: (pageWidth - titleWidth) / 2,
    y,
    size: TYPOGRAPHY.heading1.size,
    font: boldFont,
  });
  y -= 40;

  const issueText = resolveIssueText(payload.issueDate, issuedAt);
  const issueWidth = textWidth(boldFont, issueText, TYPOGRAPHY.bodyHighlighted.size);
  page.drawText(issueText, {
    x: rightX - issueWidth,
    y,
    size: TYPOGRAPHY.bodyHighlighted.size,
    font: boldFont,
  });
  y -= 30;

  await drawSimpleLine({
    text: payload.greeting || `Dear ${payload.employeeName || "Employee's Name"},`,
    font: boldFont,
    size: TYPOGRAPHY.bodyHighlighted.size,
    leftX,
    lineGap: TYPOGRAPHY.body.lineGap,
    pageAccess: {
      getPage: () => page,
      getY: () => y,
      setY: (nextY) => {
        y = nextY;
      },
      ensureSpace,
    },
  });
  y -= 10;

  const companyName = payload.companyName || COMPANY_NAME;
  const introParagraph =
    typeof payload.introParagraph === 'string' && payload.introParagraph.trim()
      ? payload.introParagraph.trim()
      : WARNING_DISCIPLINARY_LETTER_DEFAULT_INTRO_PARAGRAPH.replace(/MetaUpSpace LLP/g, companyName);

  await drawParagraph(introParagraph);
  await addSectionGap();

  await drawSimpleLine({
    text: payload.section1Title || '1. Description of Concern',
    font: boldFont,
    size: TYPOGRAPHY.bodyHighlighted.size,
    leftX,
    lineGap: TYPOGRAPHY.body.lineGap,
    pageAccess: {
      getPage: () => page,
      getY: () => y,
      setY: (nextY) => {
        y = nextY;
      },
      ensureSpace,
    },
  });
  await drawParagraph(
    payload.section1Intro ||
      'It has been observed that over the past [insert duration or dates], you have consistently failed to:'
  );
  await drawBullets(
    payload.concernsList || [
      'Failure to join the virtual office during expected hours',
      'Lack of responsiveness and poor communication with the team',
      'Mark your attendance as per company protocol',
      'Negligence in completing assigned work',
    ],
    drawParagraph
  );
  await drawParagraph(
    payload.section1Outro ||
      'This behavior is in direct violation of company policies, as outlined in the <strong><em>Annexure[A]</em></strong>.'
  );
  await addSectionGap();

  await drawSimpleLine({
    text: payload.section2Title || '2. Previous Actions Taken',
    font: boldFont,
    size: TYPOGRAPHY.bodyHighlighted.size,
    leftX,
    lineGap: TYPOGRAPHY.body.lineGap,
    pageAccess: {
      getPage: () => page,
      getY: () => y,
      setY: (nextY) => {
        y = nextY;
      },
      ensureSpace,
    },
  });
  await drawParagraph(
    payload.section2Intro || 'Prior to this letter, the following steps were taken to address the concerns:'
  );
  await drawBullets(
    payload.previousActionsList || [
      '[Insert Date]: Verbal reminder regarding communication and availability',
      '[Insert Date]: Advised via email/chat to be present and responsive during working hours',
    ],
    drawParagraph
  );
  await drawParagraph(
    payload.section2Outro ||
      'Despite these measures, there has been insufficient or no improvement in your conduct.'
  );
  await addSectionGap();

  await drawSimpleLine({
    text: payload.section3Title || '3. Required Improvement and Expectations',
    font: boldFont,
    size: TYPOGRAPHY.bodyHighlighted.size,
    leftX,
    lineGap: TYPOGRAPHY.body.lineGap,
    pageAccess: {
      getPage: () => page,
      getY: () => y,
      setY: (nextY) => {
        y = nextY;
      },
      ensureSpace,
    },
  });
  await drawParagraph(payload.section3Intro || 'You are expected to:');
  await drawBullets(
    payload.expectationsList || [
      'Be present in the virtual office consistently',
      'Communicate clearly and promptly',
      'Show responsibility in your assigned tasks',
    ],
    drawParagraph
  );
  await drawParagraph(
    payload.section3Outro ||
      'This improvement must be <strong>immediate and sustained</strong>. Your conduct will be closely monitored over the next 30 days.'
  );
  await addSectionGap();

  await drawSimpleLine({
    text: payload.section4Title || '4. Consequences of Further Violation',
    font: boldFont,
    size: TYPOGRAPHY.bodyHighlighted.size,
    leftX,
    lineGap: TYPOGRAPHY.body.lineGap,
    pageAccess: {
      getPage: () => page,
      getY: () => y,
      setY: (nextY) => {
        y = nextY;
      },
      ensureSpace,
    },
  });
  await drawParagraph(
    payload.section4Intro ||
      'Failure to demonstrate consistent improvement or any recurrence of similar issues may result in:'
  );
  await drawParagraph(
    payload.monetaryPenalty ||
      '<strong>Monetary Penalty:</strong> A deduction may be applied to your current or upcoming stipend/compensation based on the impact of your continued non-compliance.'
  );
  await drawParagraph(
    payload.nonMonetaryPenalty ||
      '<strong>Non-Monetary Penalty:</strong> This may include temporary removal from ongoing projects, withdrawal of discretionary privileges, or official downgrade of performance status, which will be recorded in your employee profile or, if deemed necessary, termination of employment in accordance with company policies and applicable laws.'
  );
  await addSectionGap();

  await drawSimpleLine({
    text: payload.section5Title || '5. Acknowledgment and Support',
    font: boldFont,
    size: TYPOGRAPHY.bodyHighlighted.size,
    leftX,
    lineGap: TYPOGRAPHY.body.lineGap,
    pageAccess: {
      getPage: () => page,
      getY: () => y,
      setY: (nextY) => {
        y = nextY;
      },
      ensureSpace,
    },
  });
  await drawParagraph(
    payload.section5Intro ||
      'We are committed to supporting your success at MetaUpSpace LLP. If you are experiencing any challenges that may be affecting your performance, you are encouraged to speak with <strong>[Insert HR or manager\'s name]</strong> directly and confidentially.'
  );

  const paragraphs = normalizeParagraphsWithDefaults(payload, WARNING_DISCIPLINARY_LETTER_DEFAULT_PARAGRAPHS);
  for (const paragraph of paragraphs) {
    await drawParagraph(paragraph);
  }

  y -= WARNING_DISCIPLINARY_SPACING.closingTopGap;
  await drawSimpleLine({
    text: payload.closingText || 'Sincerely,',
    font: boldFont,
    size: TYPOGRAPHY.bodyHighlighted.size,
    leftX,
    lineGap: TYPOGRAPHY.body.lineGap,
    pageAccess: {
      getPage: () => page,
      getY: () => y,
      setY: (nextY) => {
        y = nextY;
      },
      ensureSpace,
    },
  });

  const signatureImage = await loadSignatureImage(
    pdfDoc,
    payload.signatureUrl || CONTRACTUAL_LETTER_DEFAULT_SIGNATURE_URL
  );

  let signatureDrawHeight = 0;
  if (signatureImage) {
    const maxWidth = LETTER_LAYOUT.signatureImage.maxWidth;
    const maxHeight = LETTER_LAYOUT.signatureImage.maxHeight;
    const ratio = Math.min(maxWidth / signatureImage.width, maxHeight / signatureImage.height);
    signatureDrawHeight = signatureImage.height * ratio;
  }

  const closingLineHeight = TYPOGRAPHY.bodyHighlighted.size + TYPOGRAPHY.body.lineGap;
  const signatureNameHeight = TYPOGRAPHY.bodyHighlighted.size + TYPOGRAPHY.body.lineGap;
  const signatureMetaHeight = TYPOGRAPHY.body.size + TYPOGRAPHY.body.lineGap;
  const signatureLeadGap = 24;
  const signatureImageGap = signatureDrawHeight ? 4 : 0;
  const signatureBlockHeight =
    4 +
    closingLineHeight +
    signatureLeadGap +
    signatureDrawHeight +
    signatureImageGap +
    signatureNameHeight +
    signatureMetaHeight +
    signatureMetaHeight;

  await ensureSpace(signatureBlockHeight);

  y -= signatureLeadGap;

  if (signatureImage) {
    const maxWidth = LETTER_LAYOUT.signatureImage.maxWidth;
    const maxHeight = LETTER_LAYOUT.signatureImage.maxHeight;
    const ratio = Math.min(maxWidth / signatureImage.width, maxHeight / signatureImage.height);
    const drawWidth = signatureImage.width * ratio;

    page.drawImage(signatureImage, {
      x: leftX,
      y: y - signatureDrawHeight + 10,
      width: drawWidth,
      height: signatureDrawHeight,
    });

    y -= signatureDrawHeight + 4;
  }

  await drawSimpleLine({
    text: payload.signatoryName || 'Sahil Jaiswal',
    font: boldFont,
    size: TYPOGRAPHY.bodyHighlighted.size,
    leftX,
    lineGap: TYPOGRAPHY.body.lineGap,
    pageAccess: {
      getPage: () => page,
      getY: () => y,
      setY: (nextY) => {
        y = nextY;
      },
      ensureSpace,
    },
  });
  await drawSimpleLine({
    text: payload.position || 'CEO & Founder',
    font: boldFont,
    size: TYPOGRAPHY.body.size,
    leftX,
    lineGap: TYPOGRAPHY.body.lineGap,
    pageAccess: {
      getPage: () => page,
      getY: () => y,
      setY: (nextY) => {
        y = nextY;
      },
      ensureSpace,
    },
  });
  await drawSimpleLine({
    text: payload.signatoryCompany || companyName,
    font: boldFont,
    size: TYPOGRAPHY.bodyHighlighted.size,
    leftX,
    lineGap: TYPOGRAPHY.body.lineGap,
    pageAccess: {
      getPage: () => page,
      getY: () => y,
      setY: (nextY) => {
        y = nextY;
      },
      ensureSpace,
    },
  });

  if (
    y - WARNING_DISCIPLINARY_SPACING.acknowledgementGapAfterSignBlock >=
    WARNING_DISCIPLINARY_SPACING.acknowledgementMinStartY
  ) {
    y -= WARNING_DISCIPLINARY_SPACING.acknowledgementGapAfterSignBlock;
  } else {
    await newTemplatePage();
    y = topY - 32;
  }

  await drawSimpleLine({
    text: payload.acknowledgementTitle || 'Employee Acknowledgment',
    font: boldFont,
    size: TYPOGRAPHY.bodyHighlighted.size,
    leftX,
    lineGap: TYPOGRAPHY.body.lineGap,
    pageAccess: {
      getPage: () => page,
      getY: () => y,
      setY: (nextY) => {
        y = nextY;
      },
      ensureSpace,
    },
  });
  await drawParagraph(
    payload.acknowledgementText ||
      'I, [Employee Full Name], acknowledge receipt of this warning and understand the expectations and potential consequences outlined above.'
  );

  y -= WARNING_DISCIPLINARY_SPACING.acknowledgementLineTopGap;
  await ensureSpace(TYPOGRAPHY.bodyHighlighted.size + TYPOGRAPHY.body.lineGap);
  const signatureLine = `${payload.signatureLabel || 'Signature'}: _____________________________`;
  const dateLine = `${payload.dateLabel || 'Date'}: _____________________________`;

  page.drawText(signatureLine, {
    x: leftX,
    y,
    size: TYPOGRAPHY.bodyHighlighted.size,
    font: boldFont,
  });
  page.drawText(dateLine, {
    x: rightX - textWidth(boldFont, dateLine, TYPOGRAPHY.bodyHighlighted.size),
    y,
    size: TYPOGRAPHY.bodyHighlighted.size,
    font: boldFont,
  });
  y -= TYPOGRAPHY.bodyHighlighted.size + TYPOGRAPHY.body.lineGap;

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
};
