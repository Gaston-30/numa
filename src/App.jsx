import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function hace(fecha) {
  const min = Math.floor((Date.now() - new Date(fecha)) / 60000)
  if (min < 1) return 'recién'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  return `hace ${Math.floor(h / 24)} d`
}

export default function App() {
  const [productos, setProductos] = useState([])
  const [comercios, setComercios] = useState([])
  const [estados, setEstados] = useState([])
  const [elegido, setElegido] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function cargar() {
      const [p, c, e] = await Promise.all([
        supabase.from('productos').select('*').order('orden'),
        supabase.from('comercios').select('*'),
        supabase.from('estado_producto').select('*'),
      ])
      if (p.error || c.error || e.error) {
        setError('No se pudieron cargar los datos')
        console.error(p.error || c.error || e.error)
      } else {
        setProductos(p.data)
        setComercios(c.data)
        setEstados(e.data)
      }
      setCargando(false)
    }
    cargar()
  }, [])

  // Para el producto elegido: cada comercio con su estado
  const resultados = elegido
    ? comercios
        .map((c) => {
          const est = estados.find(
            (x) => x.comercio_id === c.id && x.producto_id === elegido.id
          )
          return { ...c, hay: est?.hay ?? null, actualizado: est?.actualizado_en }
        })
        .sort((a, b) => {
          const puntos = (x) => (x.abierto && x.hay ? 0 : x.hay ? 1 : x.hay === false ? 2 : 3)
          return puntos(a) - puntos(b)
        })
    : []

  return (
    <div className="min-h-screen bg-numa-crema">
      <header className="bg-numa-azul px-5 pt-8 pb-6 text-white">
        <h1 className="text-2xl font-extrabold tracking-wide">NÜMA</h1>
        <p className="mt-3 text-2xl font-bold leading-tight">
          Lo que buscás, está <span className="text-numa-naranja">más cerca.</span>
        </p>
      </header>

      <main className="p-5">
        {cargando && <p>Cargando...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!cargando && !error && !elegido && (
          <>
            <h2 className="mb-3 text-lg font-bold text-numa-azul">¿Qué estás buscando?</h2>
            <div className="grid grid-cols-3 gap-3">
              {productos.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setElegido(p)}
                  className="flex flex-col items-center gap-1 rounded-2xl bg-white p-3 text-sm font-medium text-numa-azul shadow-sm active:scale-95"
                >
                  <span className="text-3xl">{p.emoji}</span>
                  {p.nombre}
                </button>
              ))}
            </div>
          </>
        )}

        {elegido && (
          <>
            <button
              onClick={() => setElegido(null)}
              className="mb-3 text-sm font-medium text-numa-azul underline"
            >
              ← Volver
            </button>
            <h2 className="mb-3 text-xl font-bold text-numa-azul">
              {elegido.emoji} {elegido.nombre}
            </h2>

            {resultados.length === 0 && <p>Todavía no hay comercios cargados.</p>}

            <div className="flex flex-col gap-3">
              {resultados.map((c) => (
                <div key={c.id} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-numa-azul">{c.nombre}</p>
                      <p className="text-sm text-gray-500">{c.direccion}</p>
                      <p className="text-sm text-gray-500">
                        {c.abierto ? 'Abierto' : 'Cerrado'}
                        {c.horario ? ` · ${c.horario}` : ''}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        c.hay === true
                          ? 'bg-green-100 text-green-700'
                          : c.hay === false
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {c.hay === true ? 'Hay' : c.hay === false ? 'No hay' : 'Sin dato'}
                    </span>
                  </div>
                  {c.actualizado && (
                    <p className="mt-2 text-xs text-gray-400">
                      Actualizado {hace(c.actualizado)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}