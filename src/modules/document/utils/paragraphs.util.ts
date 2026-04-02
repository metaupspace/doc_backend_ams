export const normalizeParagraphList = (payload: any, limit: number = 3): string[] => {
  if (Array.isArray(payload?.paragraphs)) {
    return payload.paragraphs.filter(Boolean).slice(0, limit);
  }

  return [payload?.paragraph1, payload?.paragraph2, payload?.paragraph3].filter(Boolean);
};

export const normalizeParagraphsWithDefaults = (
  payload: any,
  defaultParagraphs: string[]
): string[] => {
  const inputParagraphs = Array.isArray(payload?.paragraphs)
    ? payload.paragraphs.filter(Boolean)
    : [payload?.paragraph1, payload?.paragraph2, payload?.paragraph3].filter(Boolean);

  return defaultParagraphs.map((defaultParagraph, index) => inputParagraphs[index] || defaultParagraph);
};
