import { Routes, Route } from 'react-router-dom'
import Vecino from './pages/Vecino'
import Comercio from './pages/Comercio'
import Comercios from './pages/Comercios'
import Tienda from './pages/Tienda'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Vecino />} />
      <Route path="/comercios" element={<Comercios />} />
      <Route path="/comercios/:id" element={<Tienda />} />
      <Route path="/comercio" element={<Comercio />} />
    </Routes>
  )
}