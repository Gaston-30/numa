import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin, Search, Croissant, ShoppingBasket, Beef, Carrot,
  Cigarette, Wrench, Cross, PawPrint, Store,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import BarraInferior from '../components/BarraInferior'
import { hace, normalizar, estaAbierto, textoEstado } from '../lib/utils'

const ICONOS = { Croissant, ShoppingBasket, Beef, Carrot, Cigarette, Wrench, Cross, PawPrint }

export default function Vecino() {
  const [productos, setProductos] = useState([])
  const [comercios, setComercios] = useState([])
  const [estados, setEstados] = useState([])
  const [categorias, setCategorias] = useState([])
  const [catSel, setCatSel] = useState(null) // id de la categoría elegida
  const [elegido, setElegido] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function cargar() {
      const [p, c, e, cat] = await Promise.all([
        supabase.from('productos').select('*').order('orden'),
        supabase.from('comercios').select('*'),
        supabase.from('estado_producto').select('*'),
        supabase.from('categorias').select('*').order('orden'),
      ])
      const fallo = p.error || c.error || e.error || cat.error
      if (fallo) {
        setError('No se pudieron cargar los datos')
        console.error(fallo)
      } else {
        setProductos(p.data)
        setComercios(c.data)
        setEstados(e.data)
        setCategorias(cat.data)
      }
      setCargando(false)
    }
    cargar()
  }, [])

  // Cuántos comercios abiertos tienen el producto
  const cuantosHay = (productoId) =>
    estados.filter(
      (e) =>
        e.producto_id === productoId &&
        e.hay &&
        estaAbierto(comercios.find((c) => c.id === e.comercio_id) ?? {})
    ).length

  const buscando = busqueda.trim() !== ''

  let visibles = productos
  if (catSel) visibles = visibles.filter((p) => p.categorias?.includes(catSel))
  if (buscando)
    visibles = visibles.filter((p) => normalizar(p.nombre).includes(normalizar(busqueda)))
  // Sin categoría ni búsqueda: solo lo que hoy se consigue en algún lado
  if (!catSel && !buscando) visibles = visibles.filter((p) => cuantosHay(p.id) > 0)
  visibles = [...visibles].sort((a, b) => cuantosHay(b.id) - cuantosHay(a.id) || a.orden - b.orden)

  const tituloLista = catSel
    ? categorias.find((c) => c.id === catSel)?.nombre
    : buscando
    ? 'Resultados'
    : 'Productos disponibles hoy'

  // Comercios para el producto elegido (solo los rubros donde se vende)
  const resultados = elegido
    ? comercios
        .filter((c) => !elegido.categorias?.length || elegido.categorias.includes(c.categoria_id))
        .map((c) => {
          const est = estados.find((x) => x.comercio_id === c.id && x.producto_id === elegido.id)
          return { ...c, hay: est?.hay ?? null, actualizado: est?.actualizado_en }
        })
        .sort((a, b) => {
          const puntos = (x) =>
            estaAbierto(x) && x.hay ? 0 : x.hay ? 1 : x.hay === false ? 2 : 3
          return puntos(a) - puntos(b)
        })
    : []

  return (
    <div className="min-h-screen bg-numa-azul">
      <header className="px-5 pb-6 pt-8 text-white">
        <div className="flex items-center justify-between">
          <img src="/logo-blanco.png" alt="NÜMA" className="h-9" />
          <span className="flex items-center gap-1 text-sm">
            <MapPin size={16} className="text-numa-naranja" /> Cnel. Baigorria
          </span>
        </div>
        <p className="mt-5 text-3xl font-bold leading-tight">
          Lo que buscás, está <span className="text-numa-naranja">más cerca.</span>
        </p>
        <div className="relative mt-5">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Buscá un producto..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value)
              setElegido(null)
            }}
            className="w-full rounded-full bg-white py-3 pl-12 pr-5 text-numa-azul"
          />
        </div>
      </header>

      <main className="min-h-[65vh] rounded-t-3xl bg-numa-crema p-5 pb-28">
        {cargando && <p>Cargando...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!cargando && !error && !elegido && (
          <>
            <h2 className="mb-3 text-lg font-bold text-numa-azul">Categorías</h2>
            <div className="mb-6 grid grid-cols-4 gap-2">
              {categorias.map((c) => {
                const Icono = ICONOS[c.icono] ?? Store
                const activa = catSel === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => setCatSel(activa ? null : c.id)}
                    className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2 text-[11px] font-medium active:scale-95 ${
                      activa
                        ? 'border-numa-naranja bg-white text-numa-naranja'
                        : 'border-transparent bg-white text-numa-azul'
                    }`}
                  >
                    <Icono size={26} />
                    {c.nombre}
                  </button>
                )
              })}
            </div>

            <h2 className="mb-3 text-lg font-bold text-numa-azul">{tituloLista}</h2>
            <div className="grid grid-cols-2 gap-3">
              {visibles.map((p) => {
                const n = cuantosHay(p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() => setElegido(p)}
                    className="flex flex-col items-start gap-1 rounded-2xl bg-white p-4 text-left shadow-sm active:scale-95"
                  >
                    <span className="text-3xl">{p.emoji}</span>
                    <span className="font-semibold text-numa-azul">{p.nombre}</span>
                    {n > 0 ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        Hay en {n} {n === 1 ? 'comercio' : 'comercios'}
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        Sin stock por ahora
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {visibles.length === 0 && (
              <p className="mt-4 text-center text-gray-500">
                {buscando || catSel
                  ? 'No encontramos productos.'
                  : 'Todavía no hay productos cargados hoy. Elegí una categoría.'}
              </p>
            )}
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
                <Link
                  to={`/comercios/${c.id}`}
                  key={c.id}
                  className="block rounded-2xl bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-numa-azul">{c.nombre}</p>
                      <p className="text-sm text-gray-500">{c.direccion}</p>
                      <p className="text-sm text-gray-500">{textoEstado(c)}</p>
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
                    <p className="mt-2 text-xs text-gray-400">Actualizado {hace(c.actualizado)}</p>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
      <BarraInferior />
    </div>
  )
}