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
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {plants.map((plant) => (
            <div key={plant.id} className="border p-3 rounded bg-gray-50">
              <div className="font-bold text-green-700">{plant.id_planta}</div>
              <div className="text-sm text-gray-600">
                <p>Estado: <span className="font-semibold">{plant.estado}</span></p>
                <p>Altura: {plant.altura_cm || '-'} cm | Diámetro: {plant.diametro_mm || '-'} mm</p>
                <p>Coords: {plant.lat.toFixed(4)}, {plant.lon.toFixed(4)}</p>
                {plant.notas && <p>Notas: {plant.notas}</p>}
                {plant.fecha_observacion && <p className="text-xs text-gray-400">Fecha: {plant.fecha_observacion}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
