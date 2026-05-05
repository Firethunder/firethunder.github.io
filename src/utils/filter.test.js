import { describe, it, expect } from 'vitest'
import { filterAppointments } from './filter'

describe('filterAppointments', () => {
  const appointments = [
    { id: 1, Name: 'Übung A', Gruppe: 'A' },
    { id: 2, Name: 'Übung B', Gruppe: 'B' },
    { id: 3, Name: 'Alle Treffen', Gruppe: 'Alle' },
    { id: 4, Name: 'No Group', Gruppe: '' }
  ]

  it('returns all appointments when filter is "Alle"', () => {
    const result = filterAppointments(appointments, 'Alle')
    expect(result).toHaveLength(4)
  })

  it('returns Group A and "Alle" appointments when filter is "A"', () => {
    const result = filterAppointments(appointments, 'A')
    expect(result.map(a => a.id)).toContain(1)
    expect(result.map(a => a.id)).toContain(3)
    expect(result.map(a => a.id)).not.toContain(2)
  })

  it('returns Group B and "Alle" appointments when filter is "B"', () => {
    const result = filterAppointments(appointments, 'B')
    expect(result.map(a => a.id)).toContain(2)
    expect(result.map(a => a.id)).toContain(3)
    expect(result.map(a => a.id)).not.toContain(1)
  })

  it('includes empty or missing group in "Alle" filter', () => {
    const result = filterAppointments(appointments, 'Alle')
    expect(result.map(a => a.id)).toContain(4)
  })
})
