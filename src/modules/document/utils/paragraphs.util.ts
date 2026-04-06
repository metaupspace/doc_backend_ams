export const normalizeParagraphList = (payload: any): string[] => {
  if (Array.isArray(payload?.paragraphs)) {
    return payload.paragraphs.filter(Boolean);
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

  if (inputParagraphs.length > 0) {
    return [...inputParagraphs, ...defaultParagraphs.slice(inputParagraphs.length)];
  }

  return [...defaultParagraphs];
};
