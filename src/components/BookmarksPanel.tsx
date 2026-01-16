"use client"

import { Bookmark, Download, MapPin, Navigation, Trash2, Upload, X } from 'lucide-react'
import React, { useState } from 'react'
import {
    clearAllBookmarks,
    exportBookmarks,
    getBookmarks,
    getBookmarksByProximity,
    importBookmarks,
    removeBookmark
} from '../lib/bookmark-service'

interface BookmarksPanelProps {
  isOpen: boolean
  onClose: () => void
  onLocationSelect: (lat: number, lon: number, name: string) => void
  currentPosition?: [number, number]
}

export default function BookmarksPanel({ 
  isOpen, 
  onClose, 
  onLocationSelect,
  currentPosition 
}: BookmarksPanelProps) {
  const [bookmarks, setBookmarks] = useState(getBookmarks())
  const [sortByProximity, setSortByProximity] = useState(false)

  const refreshBookmarks = () => {
    if (sortByProximity && currentPosition) {
      const sorted = getBookmarksByProximity(currentPosition[0], currentPosition[1])
      setBookmarks(sorted)
    } else {
      setBookmarks(getBookmarks())
    }
  }

  const handleRemove = (id: string) => {
    removeBookmark(id)
    refreshBookmarks()
  }

  const handleClearAll = () => {
    if (confirm('Hapus semua bookmark? Tindakan ini tidak dapat dibatalkan.')) {
      clearAllBookmarks()
      refreshBookmarks()
    }
  }

  const handleExport = () => {
    const json = exportBookmarks()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kojinmaps-bookmarks-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const content = event.target?.result as string
          if (importBookmarks(content)) {
            refreshBookmarks()
            alert('Bookmark berhasil diimpor!')
          } else {
            alert('Gagal mengimpor bookmark. Pastikan format file benar.')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleLocationClick = (lat: number, lon: number, name: string) => {
    onLocationSelect(lat, lon, name)
    onClose()
  }

  const toggleSortByProximity = () => {
    setSortByProximity(!sortByProximity)
    if (!sortByProximity && currentPosition) {
      const sorted = getBookmarksByProximity(currentPosition[0], currentPosition[1])
      setBookmarks(sorted)
    } else {
      setBookmarks(getBookmarks())
    }
  }

  React.useEffect(() => {
    if (isOpen) {
      refreshBookmarks()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl">
              <Bookmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bookmark Saya</h2>
              <p className="text-sm text-gray-500">{bookmarks.length} lokasi tersimpan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 p-4 border-b border-gray-100 flex-wrap">
          {currentPosition && (
            <button
              onClick={toggleSortByProximity}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                sortByProximity
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Navigation className="w-4 h-4" />
              Urutkan Jarak
            </button>
          )}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleImport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          {bookmarks.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-xl text-sm font-medium text-red-600 transition-colors ml-auto"
            >
              <Trash2 className="w-4 h-4" />
              Hapus Semua
            </button>
          )}
        </div>

        {/* Bookmarks List */}
        <div className="flex-1 overflow-y-auto p-4">
          {bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Bookmark className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum Ada Bookmark
              </h3>
              <p className="text-gray-500 max-w-sm">
                Klik ikon bookmark pada lokasi di peta untuk menyimpannya di sini
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="group bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
                  onClick={() => handleLocationClick(bookmark.lat, bookmark.lon, bookmark.name)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex-shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">
                        {bookmark.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {bookmark.type}
                      </p>
                      {bookmark.address && (
                        <p className="text-xs text-gray-400 mb-2 line-clamp-1">
                          📍 {bookmark.address}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>
                          {new Date(bookmark.bookmarkedAt).toLocaleDateString('id-ID')}
                        </span>
                        <span>
                          {bookmark.lat.toFixed(4)}, {bookmark.lon.toFixed(4)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(bookmark.id)
                      }}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
