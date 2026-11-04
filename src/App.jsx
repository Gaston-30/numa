import { Routes, Route } from 'react-router-dom'
import Vecino from './pages/Vecino'
import Comercio from './pages/Comercio'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Vecino />} />
      <Route path="/comercio" element={<Comercio />} />
    </Routes>
  )
}