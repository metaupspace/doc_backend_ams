import { decodeHtmlEntities } from './decodeHtmlEntities.util.ts';
export const parseRichText = (htmlLikeText) => {
  const input = String(htmlLikeText || '');
  const parts = input.split(/(<[^>]+>)/g).filter(Boolean);
  const tokens = [];

  const style = {
    bold: false,
    italic: false,
    underline: false,
  };

  const pushText = (value) => {
    const decoded = decodeHtmlEntities(value);
    if (!decoded) return;
    tokens.push({
      type: 'text',
      text: decoded,
      style: {
        bold: style.bold,
        italic: style.italic,
        underline: style.underline,
      },
    });
  };

  for (const part of parts) {
    if (!part.startsWith('<')) {
      pushText(part);
      continue;
    }

    const tag = part.toLowerCase().replace(/\s+/g, '');
    if (tag === '<br>' || tag === '<br/>' || tag === '<br/ >') {
      tokens.push({ type: 'newline' });
      continue;
    }

    if (tag === '<p>' || tag === '<div>') {
      continue;
    }

    if (tag === '</p>' || tag === '</div>') {
      tokens.push({ type: 'newline' });
      continue;
    }

    if (tag === '<li>') {
      pushText('• ');
      continue;
    }

    if (tag === '</li>') {
      tokens.push({ type: 'newline' });
      continue;
    }

    if (tag === '<b>' || tag === '<strong>') {
      style.bold = true;
      continue;
    }

    if (tag === '</b>' || tag === '</strong>') {
      style.bold = false;
      continue;
    }

    if (tag === '<i>' || tag === '<em>') {
      style.italic = true;
      continue;
    }

    if (tag === '</i>' || tag === '</em>') {
      style.italic = false;
      continue;
    }

    if (tag === '<u>') {
      style.underline = true;
      continue;
    }

    if (tag === '</u>') {
      style.underline = false;
      continue;
    }
  }

  return tokens;
};
