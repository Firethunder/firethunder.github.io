export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const pad = n => n.toString().padStart(2, '0');
  // Internal/Legacy Format: YYYY-MM-DD HH:mm:ss
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export const displayDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const pad = n => n.toString().padStart(2, '0');
  // German Display Format: DD.MM.YYYY HH:mm
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const formatShortDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit'
  });
};

export const getWeekday = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('de-DE', { weekday: 'short' });
};

// Utility to parse "stand" string (YYYY-MM-DD HH:mm:ss) for comparison
export const remoteStandString = (stand) => stand ? stand.replace(/-/g, '/') : "";
