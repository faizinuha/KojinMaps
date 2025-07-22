"use client"

import { useState } from "react"
import { getLocationsByType, searchLocation } from "@/lib/osm"

export default function ApiTest() {
  const [toiletData, setToiletData] = useState<any[]>([])
  const [searchData, setSearchData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const testToiletAPI = async () => {
    setLoading(true)
    try {
      // Test REAL Overpass API
      const data = await getLocationsByType("toilets", [35.6, 139.5, 35.8, 139.8])
      setToiletData(data.slice(0, 5)) // Ambil 5 data pertama
      console.log("REAL Toilet Data from OpenStreetMap:", data)
    } catch (error) {
      console.error("Error:", error)
    }
    setLoading(false)
  }

  const testSearchAPI = async () => {
    setLoading(true)
    try {
      // Test REAL Nominatim Search API
      const data = await searchLocation("Tokyo Station")
      setSearchData(data)
      console.log("REAL Search Data from Nominatim:", data)
    } catch (error) {
      console.error("Error:", error)
    }
    setLoading(false)
  }

  const testRawAPI = async () => {
    setLoading(true)
    try {
      // Test langsung ke Overpass API tanpa wrapper
      const overpassQuery = `
        [out:json];
        node["amenity"="toilets"](35.6,139.5,35.8,139.8);
        out body;
      `

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: overpassQuery,
      })

      const rawData = await response.json()
      console.log("RAW API Response from Overpass:", rawData)
      alert(`Found ${rawData.elements.length} toilets from REAL API!`)
    } catch (error) {
      console.error("Error:", error)
    }
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧪 Test API Real vs Mock</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={testToiletAPI}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Test Toilet API (REAL)"}
        </button>

        <button
          onClick={testSearchAPI}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Test Search API (REAL)"}
        </button>

        <button
          onClick={testRawAPI}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Test Raw API"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Toilet Data */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">🚻 REAL Toilet Data</h2>
          <p className="text-sm text-gray-600 mb-3">Data dari OpenStreetMap Overpass API</p>
          {toiletData.length > 0 ? (
            <div className="space-y-2">
              {toiletData.map((toilet, index) => (
                <div key={index} className="bg-white p-2 rounded border">
                  <p className="font-medium">{toilet.name}</p>
                  <p className="text-xs text-gray-500">
                    Lat: {toilet.lat}, Lon: {toilet.lon}
                  </p>
                  <p className="text-xs text-blue-600">Source: {toilet.source}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Klik tombol untuk load data real</p>
          )}
        </div>

        {/* Search Data */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">🔍 REAL Search Data</h2>
          <p className="text-sm text-gray-600 mb-3">Data dari Nominatim API</p>
          {searchData.length > 0 ? (
            <div className="space-y-2">
              {searchData.map((result, index) => (
                <div key={index} className="bg-white p-2 rounded border">
                  <p className="font-medium text-sm">{result.name}</p>
                  <p className="text-xs text-gray-500">
                    Lat: {result.lat}, Lon: {result.lon}
                  </p>
                  <p className="text-xs text-green-600">Source: {result.source}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Klik tombol untuk search Tokyo Station</p>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Penjelasan:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>
            • <strong>Toilet, Konbini, Stasiun, dll</strong> = Data REAL dari OpenStreetMap
          </li>
          <li>
            • <strong>Search</strong> = Data REAL dari Nominatim
          </li>
          <li>
            • <strong>Japan Travel API</strong> = Data MOCK (contoh saja)
          </li>
          <li>
            • <strong>Map Tiles</strong> = Data REAL dari OpenStreetMap & ArcGIS
          </li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">🔗 API Endpoints yang Digunakan:</h3>
        <ul className="text-sm text-blue-700 space-y-1 font-mono">
          <li>• https://overpass-api.de/api/interpreter (REAL)</li>
          <li>• https://nominatim.openstreetmap.org/search (REAL)</li>
          <li>
            • https://{"{s}"}.tile.openstreetmap.org/{"{z}/{x}/{y}"}.png (REAL)
          </li>
        </ul>
      </div>
    </div>
  )
}
