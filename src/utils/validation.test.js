import { describe, it, expect } from 'vitest';
import { terminSchema, appDataSchema } from './validation';

describe('validation schemas', () => {
  describe('terminSchema', () => {
    it('should validate a correct appointment', () => {
      const validTermin = {
        id: "123",
        datum: "2026-04-27 10:30:00",
        name: "Test Termin",
        veranstalter: "FFW Test",
        Gruppe: "Zug",
        send: 0
      };
      const result = terminSchema.safeParse(validTermin);
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(123); // Coerced to number
      expect(result.data.send).toBe("0"); // Coerced to string
    });

    it('should fail if name is too short', () => {
      const invalidTermin = {
        id: 1,
        datum: "2026-04-27",
        name: "Ab",
        veranstalter: "FFW",
        Gruppe: "Alle"
      };
      const result = terminSchema.safeParse(invalidTermin);
      expect(result.success).toBe(false);
    });

    it('should fail if veranstalter is missing', () => {
      const invalidTermin = {
        id: 1,
        datum: "2026-04-27",
        name: "Test Termin",
        Gruppe: "Alle"
      };
      const result = terminSchema.safeParse(invalidTermin);
      expect(result.success).toBe(false);
    });
  });

  describe('appDataSchema', () => {
    it('should fail if datum contains T or Z (ISO format)', () => {
      const invalidData = {
        termine: [{
          id: 1,
          datum: "2026-04-27T10:30:00Z",
          name: "ISO Termin",
          veranstalter: "FFW",
          Gruppe: "Alle"
        }],
        stand: "2026-04-27",
        Gruppen: { A: [], B: [] }
      };
      const result = appDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe("Datumsformat ist ungültig (ISO-Format nicht erlaubt)");
    });

    it('should succeed with legacy date format', () => {
      const validData = {
        termine: [{
          id: 1,
          datum: "2026-04-27 10:30:00",
          name: "Legacy Termin",
          veranstalter: "FFW",
          Gruppe: "Alle"
        }],
        stand: "2026-04-27",
        Gruppen: { A: [], B: [] }
      };
      const result = appDataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
