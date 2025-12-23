"use client"

import { useState, useRef, useEffect } from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, Upload, X } from 'lucide-react'
import { toast } from "react-toastify"

const COLOR = "#72bc21"

export default function ScanPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
      }
    } catch (error) {
      toast.error("Impossible d'accéder à la caméra", { position: "top-right" })
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      setIsCameraActive(false)
    }
  }

  const captureFromCamera = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "qr-capture.png", { type: "image/png" })
            setSelectedFile(file)
            setPreview(canvas.toDataURL("image/png"))
            stopCamera()
          }
        })
      }
    }
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Veuillez sélectionner ou capturer une image QR Code", { position: "top-right" })
      return
    }

    setLoading(true)
    try {
      // Simulate QR code processing
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success("QR Code scanné avec succès", { position: "top-right" })
      setScanResult({
        reference: "TEST-20251115-000123",
        type: "Huile essentielle",
        weight: "12.50 kg",
        status: "En attente de test"
      })
    } catch (error) {
      toast.error("Erreur lors du traitement du QR Code", { position: "top-right" })
    } finally {
      setLoading(false)
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreview("")
    setScanResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <ProtectedLayout allowedRoles={["admin", "collecteur"]}>
      <div className="space-y-6 p-4 md:p-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scanner QR Code</h1>
          <p className="text-gray-600 mt-2">Scannez ou importez une image QR Code pour obtenir les détails</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Capture section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" style={{ color: COLOR }} />
                Capturer QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isCameraActive ? (
                <Button
                  onClick={startCamera}
                  className="w-full text-white"
                  style={{ backgroundColor: COLOR }}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Activer la caméra
                </Button>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg border-2"
                    style={{ borderColor: COLOR }}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={captureFromCamera}
                      className="flex-1 text-white"
                      style={{ backgroundColor: COLOR }}
                    >
                      Capturer
                    </Button>
                    <Button
                      onClick={stopCamera}
                      variant="outline"
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Import section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" style={{ color: COLOR }} />
                Importer une image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderColor: COLOR }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2" style={{ color: COLOR }} />
                <p className="text-sm font-medium text-gray-700">Cliquez ou déposez une image</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG jusqu'à 5MB</p>
              </div>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </CardContent>
          </Card>
        </div>

        {/* Preview section */}
        {preview && (
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Aperçu</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full max-w-md mx-auto rounded-lg border" />
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full text-white text-lg h-12 font-semibold"
                style={{ backgroundColor: COLOR }}
              >
                {loading ? "Traitement..." : "Analyser le QR Code"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Result section */}
        {scanResult && (
          <Card className="shadow-lg border-l-4" style={{ borderLeftColor: COLOR }}>
            <CardHeader>
              <CardTitle style={{ color: COLOR }}>Résultats du scan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Référence</p>
                  <p className="text-lg font-bold text-gray-900">{scanResult.reference}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="text-lg font-bold text-gray-900">{scanResult.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Poids</p>
                  <p className="text-lg font-bold text-gray-900">{scanResult.weight}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Statut</p>
                  <p className="text-lg font-bold" style={{ color: COLOR }}>{scanResult.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedLayout>
  )
}
