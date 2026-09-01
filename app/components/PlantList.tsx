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
}

export default function PlantList({ plotId }: { plotId: string }) {
  const [plants, setPlants] = useState<Plant[]>([])

  useEffect(() => {
    fetch(`/api/plants?plot_id=${plotId}`)
      .then(r => r.json())
      .then(data => setPlants(Array.isArray(data) ? data : []))
  }, [plotId])

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-lg font-bold mb-4">Plantas ({plants.length})</h3>
      
      {plants.length === 0 ? (
        <p className="text-gray-500">No hay plantas</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-black border-collapse">
            <thead>
              <tr className="bg-green-200 border">
                <th className="p-2 text-left">ID</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Altura</th>
                <th className="p-2">Diám</th>
                <th className="p-2">Lat</th>
                <th className="p-2">Lon</th>
                <th className="p-2">Notas</th>
              </tr>
            </thead>
            <tbody>
              {plants.map((plant) => (
                <tr key={plant.id} className="border hover:bg-gray-100">
                  <td className="p-2 font-bold">{plant.id_planta}</td>
                  <td className="p-2 text-center">{plant.estado}</td>
                  <td className="p-2 text-center">{plant.altura_cm || '-'}</td>
                  <td className="p-2 text-center">{plant.diametro_mm || '-'}</td>
                  <td className="p-2 text-center text-xs">{plant.lat.toFixed(4)}</td>
                  <td className="p-2 text-center text-xs">{plant.lon.toFixed(4)}</td>
                  <td className="p-2 text-xs">{plant.notas || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
