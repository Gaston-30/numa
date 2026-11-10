import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Store, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import BarraInferior from '../components/BarraInferior'
import { hace } from '../lib/utils'

export default function Tienda() {
  const { id } = useParams()
  const [comercio, setComercio] = useState(null)
  const [productos, setProductos] = useState([])
  const [estados, setEstados] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const [c, p, e] = await Promise.all([
        supabase.from('comercios').select('*').eq('id', id).maybeSingle(),
        supabase.from('productos').select('*').order('orden'),
        supabase.from('estado_producto').select('*').eq('comercio_id', id),
      ])
      setComercio(c.data)
      setProductos(p.data ?? [])
      setEstados(e.data ?? [])
      setCargando(false)
    }
    cargar()
  }, [id])

  if (cargando) return <p className="p-5">Cargando...</p>
  if (!comercio) return <p className="p-5">No encontramos este comercio.</p>

  const estadoDe = (pid) => estados.find((x) => x.producto_id === pid)
  const ultima = estados.reduce(
    (m, x) => (!m || x.actualizado_en > m ? x.actualizado_en : m),
    null
  )

  return (
    <div className="min-h-screen bg-numa-crema pb-28">
      <header className="bg-numa-azul px-5 pb-8 pt-6 text-white">
        <Link to="/comercios" className="mb-4 inline-flex items-center gap-1 text-sm">
          <ArrowLeft size={18} /> Volver
        </Link>
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-numa-crema p-3 text-numa-naranja">
            <Store size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{comercio.nombre}</h1>
            <p className="text-sm">
              <span className={comercio.abierto ? 'text-green-400' : 'text-gray-300'}>
                ● {comercio.abierto ? 'Abierto' : 'Cerrado'}
              </span>
              {comercio.horario ? ` · ${comercio.horario}` : ''}
            </p>
            <p className="text-sm opacity-80">{comercio.direccion}</p>
          </div>
        </div>
      </header>

      <main className="-mt-4 rounded-t-3xl bg-numa-crema p-5">
        <h2 className="mb-3 text-lg font-bold text-numa-azul">Productos</h2>
        <div className="flex flex-col gap-2">
          {productos.map((p) => {
            const est = estadoDe(p.id)
            return (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm"
              >
                <span className="font-medium text-numa-azul">
                  {p.emoji} {p.nombre}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    est?.hay === true
                      ? 'bg-green-100 text-green-700'
                      : est?.hay === false
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {est?.hay === true ? 'Disponible' : est?.hay === false ? 'No hay' : 'Sin dato'}
                </span>
              </div>
            )
          })}
        </div>
        {ultima && (
          <p className="mt-4 flex items-center gap-2 rounded-2xl bg-white p-3 text-sm text-gray-500">
            <Clock size={16} /> Última actualización: {hace(ultima)}
          </p>
        )}
      </main>
      <BarraInferior />
    </div>
  )
}