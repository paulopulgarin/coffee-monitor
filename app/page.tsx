'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import PlantList from './components/PlantList'

const PlantForm = dynamic(() => import('./components/PlantForm'), { ssr: false })

interface Plot {
  id: string
  nombre: string
}

export default function Home() {
  const [plots, setPlots] = useState<Plot[]>([])
  const [selectedPlot, setSelectedPlot] = useState<string>('')

  useEffect(() => {
    fetch('/api/plots')
      .then(r => r.json())
      .then(data => {
        const plotsArray = Array.isArray(data) ? data : []
        setPlots(plotsArray)
        if (plotsArray.length) setSelectedPlot(plotsArray[0].id)
      })
      .catch(err => console.error('Error fetching plots:', err))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-full mx-auto">
        
        <div className="mb-8">
          <h1 className="text-4xl