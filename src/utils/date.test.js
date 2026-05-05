import { describe, it, expect } from 'vitest';
import { formatDate, displayDate, remoteStandString, formatShortDate, getWeekday } from './date';

describe('date utils', () => {
  describe('formatDate', () => {
    it('should format date to YYYY-MM-DD HH:mm:ss', () => {
      const date = new Date('2026-04-27T10:30:00');
      // Use toContain or regex to be safe with local timezone if necessary, 
      // but formatDate uses getFullYear/getMonth+1 etc directly which is local time.
      const formatted = formatDate(date);
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      expect(formatted).toContain('2026-04-27');
    });

    it('should return empty string for null', () => {
      expect(formatDate(null)).toBe('');
    });
  });

  describe('displayDate', () => {
    it('should format date to DD.MM.YYYY HH:mm', () => {
      const date = new Date('2026-04-27T10:30:00');
      const formatted = displayDate(date);
      expect(formatted).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/);
      expect(formatted).toContain('27.04.2026');
    });

    it('should return empty string for null', () => {
      expect(displayDate(null)).toBe('');
    });
  });

  describe('remoteStandString', () => {
    it('should replace dashes with slashes', () => {
      expect(remoteStandString('2024-10-26 15:00:00')).toBe('2024/10/26 15:00:00');
    });

    it('should return empty string for empty input', () => {
      expect(remoteStandString('')).toBe('');
      expect(remoteStandString(null)).toBe('');
    });
  });

  describe('formatShortDate', () => {
    it('should format date to DD.MM', () => {
      const date = new Date('2026-04-27T10:30:00');
      const formatted = formatShortDate(date);
      expect(formatted).toBe('27.04.');
    });

    it('should return empty string for null', () => {
      expect(formatShortDate(null)).toBe('');
    });
  });

  describe('getWeekday', () => {
    it('should return short German weekday', () => {
      const date = new Date('2026-04-27T10:30:00'); // April 27, 2026 is Monday (Mo)
      const weekday = getWeekday(date);
      expect(weekday).toBe('Mo');
    });

    it('should return empty string for null', () => {
      expect(getWeekday(null)).toBe('');
    });
  });
});
