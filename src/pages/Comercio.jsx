import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

export default function Comercio() {
  const [sesion, setSesion] = useState(undefined) // undefined = cargando
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorLogin, setErrorLogin] = useState(null)

  const [comercio, setComercio] = useState(null)
  const [productos, setProductos] = useState([])
  const [estados, setEstados] = useState({}) // { producto_id: true/false }
  const [mensaje, setMensaje] = useState(null)

  // Escuchar la sesión
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSesion(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSesion(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  // Cargar datos del comercio cuando hay sesión
  useEffect(() => {
    if (!sesion) {
      setComercio(null)
      return
    }
    async function cargar() {
      const { data: c } = await supabase
        .from('comercios')
        .select('*')
        .eq('owner_id', sesion.user.id)
        .maybeSingle()
      setComercio(c)
      if (!c) return

      const [p, e] = await Promise.all([
        supabase.from('productos').select('*').order('orden'),
        supabase.from('estado_producto').select('*').eq('comercio_id', c.id),
      ])
      setProductos(p.data ?? [])
      setEstados(Object.fromEntries((e.data ?? []).map((x) => [x.producto_id, x.hay])))
    }
    cargar()
  }, [sesion])

  async function entrar(ev) {
    ev.preventDefault()
    setErrorLogin(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setErrorLogin('Email o contraseña incorrectos')
  }

  async function cambiarHay(producto, hay) {
    const anterior = estados[producto.id]
    setEstados({ ...estados, [producto.id]: hay }) // se ve al instante
    const { error } = await supabase
      .from('estado_producto')
      .upsert(
        { comercio_id: comercio.id, producto_id: producto.id, hay },
        { onConflict: 'comercio_id,producto_id' }
      )
    if (error) {
      console.error(error)
      setEstados({ ...estados, [producto.id]: anterior })
      setMensaje('No se pudo guardar. Probá de nuevo.')
      setTimeout(() => setMensaje(null), 3000)
    }
  }

  async function cambiarAbierto() {
    const nuevo = !comercio.abierto
    setComercio({ ...comercio, abierto: nuevo })
    const { error } = await supabase
      .from('comercios')
      .update({ abierto: nuevo })
      .eq('id', comercio.id)
    if (error) {
      console.error(error)
      setComercio({ ...comercio, abierto: !nuevo })
      setMensaje('No se pudo guardar. Probá de nuevo.')
      setTimeout(() => setMensaje(null), 3000)
    }
  }

  if (sesion === undefined) return <p className="p-5">Cargando...</p>

  // Pantalla de login
  if (!sesion) {
    return (
      <div className="min-h-screen bg-numa-azul p-6 text-white">
        <h1 className="mt-10 text-3xl font-extrabold">NÜMA Comercios</h1>
        <p className="mb-8 text-sm opacity-80">Tu comercio, más visible</p>
        <form onSubmit={entrar} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl bg-white p-3 text-numa-azul"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl bg-white p-3 text-numa-azul"
            required
          />
          {errorLogin && <p className="text-sm text-red-300">{errorLogin}</p>}
          <button className="rounded-xl bg-numa-naranja p-3 font-bold text-white">
            Entrar
          </button>
        </form>
        <Link to="/" className="mt-6 block text-center text-sm underline opacity-70">
          ← Volver
        </Link>
      </div>
    )
  }

  // Sesión iniciada pero sin comercio asignado
  if (!comercio) {
    return (
      <div className="p-6">
        <p>Tu usuario todavía no tiene un comercio asignado. Avisale a NÜMA.</p>
        <button onClick={() => supabase.auth.signOut()} className="mt-4 underline">
          Salir
        </button>
      </div>
    )
  }

  // Panel
  return (
    <div className="min-h-screen bg-numa-crema">
      <header className="flex items-center justify-between bg-numa-azul p-5 text-white">
        <div>
          <p className="text-xs opacity-70">Tu comercio</p>
          <h1 className="text-xl font-bold">{comercio.nombre}</h1>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="text-sm underline">
          Salir
        </button>
      </header>

      <main className="p-5">
        <button
          onClick={cambiarAbierto}
          className={`mb-5 w-full rounded-2xl p-4 text-lg font-bold text-white ${
            comercio.abierto ? 'bg-green-600' : 'bg-gray-500'
          }`}
        >
          {comercio.abierto ? '🟢 Abierto (tocá para cerrar)' : '⚫ Cerrado (tocá para abrir)'}
        </button>

        <h2 className="mb-3 text-lg font-bold text-numa-azul">¿Qué tenés hoy?</h2>
        <div className="flex flex-col gap-2">
          {productos.map((p) => {
            const hay = estados[p.id]
            return (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm"
              >
                <span className="font-medium text-numa-azul">
                  {p.emoji} {p.nombre}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => cambiarHay(p, true)}
                    className={`rounded-xl px-4 py-2 font-semibold ${
                      hay === true ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    Hay
                  </button>
                  <button
                    onClick={() => cambiarHay(p, false)}
                    className={`rounded-xl px-4 py-2 font-semibold ${
                      hay === false ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    No hay
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        {mensaje && <p className="mt-4 text-sm text-red-600">{mensaje}</p>}
      </main>
    </div>
  )
}