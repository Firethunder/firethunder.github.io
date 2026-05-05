/**
 * Filters appointments based on the selected group.
 * @param {Array} appointments 
 * @param {string} filterGroup - 'A', 'B', or 'Alle'
 * @returns {Array}
 */
export function filterAppointments(appointments, filterGroup) {
  if (!appointments) return []
  
  // Normalize and filter by group first
  const filteredByGroup = filterGroup === 'Alle' 
    ? appointments 
    : appointments.filter(appt => {
        const group = appt.Gruppe || 'Alle'
        return group === filterGroup || group === 'Alle'
      })

  return filteredByGroup
}
