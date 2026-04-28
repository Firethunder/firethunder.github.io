import { z } from 'zod';

// Validation Schemas
export const terminSchema = z.object({
  id: z.coerce.number().default(0),
  datum: z.string().min(1, "Datum ist erforderlich"),
  name: z.string().min(3, "Name muss mindestens 3 Zeichen lang sein"),
  veranstalter: z.string().min(1, "Veranstalter ist erforderlich"),
  Gruppe: z.string().min(1, "Gruppe ist erforderlich"),
  ort: z.string().optional().default(""),
  dauer: z.coerce.number().optional().default(120),
  send: z.coerce.string().default("0")
});

export const appDataSchema = z.object({
  termine: z.array(terminSchema),
  stand: z.coerce.string().default(""),
  Gruppen: z.any().optional().default({ A: [], B: [] })
}).refine(data => {
  return data.termine.every(t => !t.datum.includes('T') && !t.datum.includes('Z'));
}, {
  message: "Datumsformat ist ungültig (ISO-Format nicht erlaubt)"
});
