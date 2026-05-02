import { describe, it, expect, vi } from 'vitest';
import { mapToIcalEvent, createIcalString } from './ical';

// Mock file-saver as it's a browser-only library
vi.mock('file-saver', () => ({
  saveAs: vi.fn()
}));

describe('ical utility', () => {
  const mockTermin = {
    id: 1,
    datum: '2026-04-28 20:00:00',
    name: 'Übung',
    veranstalter: 'FFW',
    Gruppe: 'Alle',
    ort: 'Feuerwehrhaus',
    dauer: 60
  };

  it('should map a termin to an ics event correctly', () => {
    const event = mapToIcalEvent(mockTermin);
    
    // 2026-04-28 20:00 in Germany (likely UTC+2 in April)
    // The test environment might have different TZ, so we check relative to UTC
    const expectedDate = new Date('2026-04-28 20:00:00'.replace(/-/g, '/'));
    
    expect(event.title).toBe('Übung');
    expect(event.location).toBe('Feuerwehrhaus');
    expect(event.duration).toEqual({ minutes: 60 });
    expect(event.description).toContain('Veranstalter: FFW');
    expect(event.description).toContain('Gruppe: Alle');
    
    expect(event.start).toEqual([
      expectedDate.getUTCFullYear(),
      expectedDate.getUTCMonth() + 1,
      expectedDate.getUTCDate(),
      expectedDate.getUTCHours(),
      expectedDate.getUTCMinutes()
    ]);
  });

  it('should use default duration if missing', () => {
    const terminWithoutDuration = { ...mockTermin, dauer: undefined };
    const event = mapToIcalEvent(terminWithoutDuration);
    expect(event.duration).toEqual({ minutes: 120 });
  });

  it('should throw error for invalid date', () => {
    const invalidTermin = { ...mockTermin, datum: 'invalid' };
    expect(() => mapToIcalEvent(invalidTermin)).toThrow('Invalid date');
  });

  it('should generate a valid iCal string', async () => {
    const icalString = await createIcalString(mockTermin);
    expect(icalString).toContain('BEGIN:VCALENDAR');
    expect(icalString).toContain('SUMMARY:Übung');
    expect(icalString).toContain('LOCATION:Feuerwehrhaus');
    expect(icalString).toContain('END:VCALENDAR');
  });

  it('should handle multiple events', async () => {
    const multipleTermine = [
      mockTermin,
      { ...mockTermin, id: 2, name: 'Zweite Übung' }
    ];
    const icalString = await createIcalString(multipleTermine);
    expect(icalString.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(icalString).toContain('SUMMARY:Übung');
    expect(icalString).toContain('SUMMARY:Zweite Übung');
  });
});
