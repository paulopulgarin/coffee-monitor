'use client'
import { useEffect, useState } from 'react'

interface Plant {
  id: string
  id_planta: string
  lat: number
  lon: number
  altura_cm?: number
  diametro_mm?: number
  estado: string
  notas?: string
  fecha_observacion?: string
}

export default function PlantList({ plotId }: { plotId: string }) {
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/plants?plot_id=${plotId}`)
      .then(r => r.json())
      .then(data => setPlants(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [plotId])

  if (loading) return <p className="text-center text-gray-500">Cargando...</p>

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-lg font-bold mb-4">Plantas Guardadas ({plants.length})</h3>
      
      {plants.length === 0 ? (
        <p className="text-gray-500">No hay plantas registradas aún</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {plants.map((plant) => (
            <div className="overflow-x-auto">
  <table className="w-full text-sm border-collapse">
    <thead>
      <tr className="bg-green-100">
        <th className="border p-2 text-left">ID</th>
        <th className="border p-2 text-left">Estado</th>
        <th className="border p-2">Altura</th>
        <th className="border p-2">Diámetro</th>
        <th className="border p-2">Lat</th>
        <th className="border p-2">Lon</th>
        <th className="border p-2 text-left">Notas</th>
      </tr>
    </thead>
    <tbody>
      {plants.map((plant) => (
        <tr key={plant.id} className="border-b hover:bg-gray-50">
          <td className="border p-2 font-bold text-green-700">{plant.id_planta}</td>
          <td className="border p-2">{plant.estado}</td>
          <td className="border p-2 text-center">{plant.altura_cm || '-'}</td>
          <td className="border p-2 text-center">{plant.diametro_mm || '-'}</td>
          <td className="border p-2 text-center text-xs">{plant.lat.toFixed(4)}</td>
          <td className="border p-2 text-center text-xs">{plant.lon.toFixed(4)}</td>
          <td className="border p-2 text-xs">{plant.notas || '-'}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>