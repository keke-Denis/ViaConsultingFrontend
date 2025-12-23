import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { FournisseurProvider } from "@/contexts/fournisseur/fournisseur-context"
import { PVReceptionProvider } from "@/contexts/pvreception/pvreception-context"
import { FacturationProvider } from "@/contexts/pvreception/facturation-context"
import { ImpayeProvider } from "@/contexts/pvreception/impaye-context"
import { LocalisationProvider } from '@/contexts/localisation/localisation-context'
import { ProvenanceProvider } from "@/contexts/provenance/provenance-context"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { SoldeProvider } from "@/contexts/paimentEnAvance/solde-context"
import { PoidsNetProvider } from "@/contexts/poidsNet-context"
import { StockHEProvider } from "@/contexts/stockHE-context"
import { TransferPrefillProvider } from '@/contexts/transferPrefill/transferPrefill-context'
import { TestFicheProvider } from '@/contexts/test-huile/fiche-context'
import { DistillationStatsProvider } from '@/contexts/distillation/distillation-stats-context'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Via Consulting",
  description: "Système de gestion Via Consulting",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <SoldeProvider>
          <TransferPrefillProvider>
          <PoidsNetProvider>
          <StockHEProvider>
          <FournisseurProvider>
            <ProvenanceProvider>
               <LocalisationProvider>
            <PVReceptionProvider>
              <FacturationProvider>
                <ImpayeProvider>
                  <TestFicheProvider>
                    <DistillationStatsProvider>
                      {children}
                    </DistillationStatsProvider>
                    {/* React Toastify pour les fournisseurs */}
                    <ToastContainer
                      position="top-right"
                      autoClose={5000}
                      hideProgressBar={false}
                      newestOnTop={false}
                      closeOnClick
                      rtl={false}
                      pauseOnFocusLoss
                      draggable
                      pauseOnHover
                      theme="light"
                      style={{
                        zIndex: 10000,
                      }}
                    />
                  </TestFicheProvider>
                </ImpayeProvider>
              </FacturationProvider>
            </PVReceptionProvider>
            </LocalisationProvider>
            </ProvenanceProvider>
          </FournisseurProvider>
          </StockHEProvider>
          </PoidsNetProvider>
          </TransferPrefillProvider>
          </SoldeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
