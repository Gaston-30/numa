import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Store, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import BarraInferior from '../components/BarraInferior'

export default function Comercios() {
  const [comercios, setComercios] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase
      .from('comercios')
      .select('*')
      .order('nombre')
      .then(({ data }) => {
        setComercios(data ?? [])
        setCargando(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-numa-crema pb-28">
      <header className="bg-numa-azul px-5 pb-6 pt-8 text-white">
        <h1 className="text-2xl font-bold">Comercios</h1>
        <p className="text-sm opacity-80">Cnel. Baigorria</p>
      </header>
      <main className="flex flex-col gap-3 p-5">
        {cargando && <p>Cargando...</p>}
        {comercios.map((c) => (
          <Link
            key={c.id}
            to={`/comercios/${c.id}`}
            className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
          >
            <div className="rounded-xl bg-numa-crema p-2 text-numa-naranja">
              <Store size={24} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-numa-azul">{c.nombre}</p>
              <p className="text-sm text-gray-500">
                {c.abierto ? 'Abierto' : 'Cerrado'}
                {c.horario ? ` · ${c.horario}` : ''}
              </p>
            </div>
            <ChevronRight className="text-gray-400" />
          </Link>
        ))}
      </main>
      <BarraInferior />
    </div>
  )
}