"use client"

import { X, Map, Satellite, Layers } from "lucide-react"

interface LayersPanelProps {
  onClose: () => void
  activeLayer: string
  onLayerChange: (layer: string) => void
  className?: string
}

const mapLayers = [
  {
    id: "standard",
    name: "Standard",
    description: "Peta standar dengan jalan dan label",
    icon: Map,
    preview: "/placeholder.svg?height=60&width=100&text=Standard",
  },
  {
    id: "satellite",
    name: "Satelit",
    description: "Citra satelit resolusi tinggi",
    icon: Satellite,
    preview: "/placeholder.svg?height=60&width=100&text=Satellite",
  },
]

export default function LayersPanel({ onClose, activeLayer, onLayerChange, className = "" }: LayersPanelProps) {
  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Layer Peta</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Close">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="space-y-3">
          {mapLayers.map((layer) => {
            const IconComponent = layer.icon
            return (
              <div
                key={layer.id}
                onClick={() => {
                  onLayerChange(layer.id)
                }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  activeLayer === layer.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <img
                      src={layer.preview || "/placeholder.svg"}
                      alt={layer.name}
                      className="w-16 h-10 rounded border object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent size={16} className="text-gray-600" />
                      <h3 className="font-medium text-gray-900">{layer.name}</h3>
                      {activeLayer === layer.id && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                    </div>
                    <p className="text-sm text-gray-600">{layer.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}