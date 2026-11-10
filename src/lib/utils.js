export function hace(fecha) {
  const min = Math.floor((Date.now() - new Date(fecha)) / 60000)
  if (min < 1) return 'recién'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  return `hace ${Math.floor(h / 24)} d`
}

export const normalizar = (t) =>
  t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const aMinutos = (t) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
const hhmm = (t) => t.slice(0, 5)

// "Abierto" = no lo cerró a mano Y está dentro de su horario.
// Si no cargó horario, vale solo el botón manual.
export function estaAbierto(c) {
  if (!c.abierto) return false
  if (!c.hora_apertura || !c.hora_cierre) return true
  const ahora = new Date()
  const min = ahora.getHours() * 60 + ahora.getMinutes()
  const a = aMinutos(c.hora_apertura)
  const z = aMinutos(c.hora_cierre)
  // si cierra después de medianoche (ej. 18:00 a 02:00)
  return a <= z ? min >= a && min < z : min >= a || min < z
}

export function textoEstado(c) {
  if (estaAbierto(c)) {
    return c.hora_cierre ? `Abierto · hasta las ${hhmm(c.hora_cierre)}` : 'Abierto'
  }
  if (c.abierto && c.hora_apertura) return `Cerrado · abre a las ${hhmm(c.hora_apertura)}`
  return 'Cerrado'
}