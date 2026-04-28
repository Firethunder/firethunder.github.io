import { createEvents } from 'ics';
import { saveAs } from 'file-saver';

/**
 * Maps a single appointment to an ics event object.
 * Expects termin.datum in a format parsable by new Date() 
 * (e.g., YYYY-MM-DD HH:mm:ss or DD.MM.YYYY HH:mm).
 */
export const mapToIcalEvent = (termin) => {
  // Replace dashes with slashes for better cross-browser compatibility if needed,
  // but standard ISO-like strings should work.
  const date = new Date(termin.datum.replace(/-/g, '/'));
  
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${termin.datum}`);
  }

  // Convert to UTC components for explicit UTC export
  return {
    start: [
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes()
    ],
    duration: { minutes: termin.dauer || 120 },
    title: termin.name,
    description: `Veranstalter: ${termin.veranstalter}\nGruppe: ${termin.Gruppe}`,
    location: termin.ort || '',
    status: 'CONFIRMED',
    busyStatus: 'BUSY'
  };
};

/**
 * Generates an iCal string from an array of appointments.
 */
export const createIcalString = (termine) => {
  return new Promise((resolve, reject) => {
    const events = Array.isArray(termine) ? termine.map(mapToIcalEvent) : [mapToIcalEvent(termine)];
    
    createEvents(events, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
};

/**
 * Generates and triggers a download for an iCal file.
 */
export const generateIcalBlob = async (termine, filename = 'termine.ics') => {
  try {
    const icalString = await createIcalString(termine);
    const blob = new Blob([icalString], { type: 'text/calendar;charset=utf-8' });
    saveAs(blob, filename);
    return true;
  } catch (error) {
    console.error('Failed to generate iCal:', error);
    throw error;
  }
};
