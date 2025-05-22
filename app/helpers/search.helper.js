exports.sanitizeSearchInput = (value) => {
  if (!value || typeof value !== 'string') return '';
  return value
    .trim()
    .substring(0, 100) // prevent overly long search
    .replace(/[%_\\]/g, ''); // remove special SQL wildcard characters
};