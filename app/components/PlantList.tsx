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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {plants.map((plant) => (
            <div key={plant.id} className="border border-green-300 p-3 rounded-lg bg-green-50 text-black text-xs">
              <p className="font-bold text-green-700 mb-1">{plant.id_planta}</p>
              <p><span className="font-semibold">Estado:</span> {plant.estado}</p>
              <p>Altura: {plant.altura_cm || '-'} cm</p>
              <p>Diámetro: {plant.diametro_mm || '-'} mm</p>
              <p className="text-gray-600 mt-1">({plant.lat.toFixed(3)}, {plant.lon.toFixed(3)})</p>
              {plant.notas && <p className="text-gray-500 italic mt-1">"{plant.notas}"</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
