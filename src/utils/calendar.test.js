import { describe, it, expect } from 'vitest'
import { getCalendarUrl } from './calendar'

describe('getCalendarUrl', () => {
  const icsUrl = 'https://firethunder.github.io/ffwtool/termine.ics'

  it('uses webcal:// protocol on iOS', () => {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
    const result = getCalendarUrl(icsUrl, userAgent)
    expect(result).toBe('webcal://firethunder.github.io/ffwtool/termine.ics')
  })

  it('uses Google Calendar render URL on Android', () => {
    const userAgent = 'Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.143 Mobile Safari/537.36'
    const result = getCalendarUrl(icsUrl, userAgent)
    expect(result).toContain('calendar.google.com/calendar/render')
    expect(result).toContain('cid=' + encodeURIComponent(icsUrl))
  })

  it('uses webcal:// as default protocol', () => {
    const result = getCalendarUrl(icsUrl, 'unknown')
    expect(result).toBe('webcal://firethunder.github.io/ffwtool/termine.ics')
  })

  it('correctly handles http:// to webcal:// conversion', () => {
    const httpUrl = 'http://test.com/cal.ics'
    const result = getCalendarUrl(httpUrl, 'iOS')
    expect(result).toBe('webcal://test.com/cal.ics')
  })
})
