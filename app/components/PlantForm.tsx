'use client'
import { useState } from 'react'

export default function PlantForm({ plotId }: { plotId: string }) {
  const [form, setForm] = useState({
    id_planta: '',
    lat: '',
    lon: '',
    altura_cm: '',
    diametro_mm: '',
    estado: 'Crecimiento-Sano',
    notas: '',
    fecha_observacion: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm({
            ...form,
            lat: position.coords.latitude.toString(),
            lon: position.coords.longitude.toString()
          })
          setMessage('✅ Ubicación capturada')
          setTimeout(() => setMessage(''), 2000)
        },
        () => {
          setMessage('❌ No se pudo obtener la ubicación')
        }
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/plants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          plot_id: plotId,
          altura_cm: form.altura_cm ? parseInt(form.altura_cm) : null,
          diametro_mm: form.diametro_mm ? parseFloat(form.diametro_mm) : null,
          lat: parseFloat(form.lat),
          lon: parseFloat(form.lon)
        })
      })
      
      if (!res.ok) throw new Error('Error al guardar')
      setMessage('✅ Planta registrada')
      setForm({ ...form, id_planta: '', lat: '', lon: '', altura_cm: '', diametro_mm: '', notas: '' })
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(`❌ ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4 text-black">
      <h3 className="text-lg font-bold">Registrar Planta</h3>
      
      <input type="text" name="id_planta" placeholder="ID Planta (P001)" value={form.id_planta} onChange={handleChange} required className="w-full border p-2 rounded" />
      
      <div className="grid grid-cols-2 gap-2">
        <input type="number" name="lat" placeholder="Lat" value={form.lat} onChange={handleChange} required step="0.0001" className="border p-2 rounded text-sm" />
        <input type="number" name="lon" placeholder="Lon" value={form.lon} onChange={handleChange} required step="0.0001" className="border p-2 rounded text-sm" />
      </div>

      <button type="button" onClick={handleGetLocation} className="w-full bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700">
        📍 Obtener Ubicación GPS
      </button>
      
      <div className="grid grid-cols-2 gap-2">
        <input type="number" name="altura_cm" placeholder="Altura (cm)" value={form.altura_cm} onChange={handleChange} className="border p-2 rounded" />
        <input type="number" name="diametro_mm" placeholder="Diámetro (mm)" value={form.diametro_mm} onChange={handleChange} step="0.1" className="border p-2 rounded" />
      </div>
      
      <select name="estado" value={form.estado} onChange={handleChange} className="w-full border p-2 rounded">
        <option>Crecimiento-Sano</option>
        <option>Crecimiento-Quedado</option>
        <option>Quedado-Sano</option>
        <option>Quedado-Enfermo</option>
        <option>Muerto</option>
      </select>
      
      <input type="date" name="fecha_observacion" value={form.fecha_observacion} onChange={handleChange} className="w-full border p-2 rounded" />
      
      <textarea name="notas" placeholder="Notas" value={form.notas} onChange={handleChange} className="w-full border p-2 rounded h-20" />
      
      <button type="submit" disabled={loading} className="w-full bg-green-600 text-white p-2 rounded font-bold hover:bg-green-700 disabled:opacity-50">
        {loading ? 'Guardando...' : 'Guardar Planta'}
      </button>
      
      {message && <p className="text-center text-sm">{message}</p>}
    </form>
  )
}
