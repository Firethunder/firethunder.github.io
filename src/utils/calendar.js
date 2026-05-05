/**
 * Generates a platform-specific calendar subscription URL.
 * @param {string} icsUrl - The absolute URL to the .ics file.
 * @param {string} userAgent - The browser's user agent string.
 * @returns {string}
 */
export function getCalendarUrl(icsUrl, userAgent = '') {
  const isAndroid = /Android/i.test(userAgent)
  const isiOS = /iPhone|iPad|iPod/i.test(userAgent)

  if (isAndroid) {
    return `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(icsUrl)}`
  }

  // Default to webcal for iOS and others
  return icsUrl.replace(/^https?:\/\//, 'webcal://')
}
