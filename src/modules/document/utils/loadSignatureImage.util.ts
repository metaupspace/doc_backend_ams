export const loadSignatureImage = async (pdfDoc, signatureUrl) => {
  if (!signatureUrl || typeof signatureUrl !== 'string') {
    return null;
  }

  try {
    const response = await fetch(signatureUrl);
    if (!response.ok) return null;
    const imageBytes = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('png')) {
      return pdfDoc.embedPng(imageBytes);
    }
    if (contentType.includes('jpeg') || contentType.includes('jpg')) {
      return pdfDoc.embedJpg(imageBytes);
    }
    return null;
  } catch {
    return null;
  }
};