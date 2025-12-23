import React, { useState } from 'react'

const Exportation = () => {
  const [formData, setFormData] = useState({
    numeroContrat: '',
    typeDocument: '',
    dateContrat: '',
    incoterm: '',
    devise: '',
    quantite: '',
    prixUnitaire: '',
    valeurTotale: '',
    fichierContrat: null as File | null
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      
      // Calcul automatique de la valeur totale
      if ((name === 'quantite' || name === 'prixUnitaire') && newData.quantite && newData.prixUnitaire) {
        const quantite = parseFloat(newData.quantite) || 0
        const prix = parseFloat(newData.prixUnitaire) || 0
        newData.valeurTotale = (quantite * prix).toFixed(2)
      }
      
      return newData
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        fichierContrat: e.target.files![0]
      }))
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl mx-auto">
        <div className="p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold mb-2 text-gray-800 text-center">
            Exportation - Nouveau Contrat
          </h2>
          <p className="text-gray-600 mb-8 text-center">
            Remplissez les informations du contrat d'exportation
          </p>
          
          <div className="space-y-8 max-w-3xl mx-auto">
            {/* Première ligne : N° Contrat et Type Document */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  N° Contrat *
                </label>
                <input
                  type="text"
                  name="numeroContrat"
                  value={formData.numeroContrat}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#76bc21]/30 focus:border-[#76bc21] outline-none transition-all duration-200 text-center text-lg"
                  placeholder="CTR-2024-001"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Référence interne
                </p>
              </div>

              <div className="text-center">
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Type Document *
                </label>
                <select
                  name="typeDocument"
                  value={formData.typeDocument}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#76bc21]/30 focus:border-[#76bc21] outline-none transition-all duration-200 text-center text-lg bg-white"
                >
                  <option value="" className="text-center">Sélectionnez</option>
                  <option value="devis" className="text-center">Devis</option>
                  <option value="proforma" className="text-center">Proforma</option>
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  Devis / Proforma
                </p>
              </div>
            </div>

            {/* Deuxième ligne : Date Contrat et Incoterm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Date Contrat *
                </label>
                <input
                  type="date"
                  name="dateContrat"
                  value={formData.dateContrat}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#76bc21]/30 focus:border-[#76bc21] outline-none transition-all duration-200 text-center text-lg"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Date de signature
                </p>
              </div>

              <div className="text-center">
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Incoterm *
                </label>
                <select
                  name="incoterm"
                  value={formData.incoterm}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#76bc21]/30 focus:border-[#76bc21] outline-none transition-all duration-200 text-center text-lg bg-white"
                >
                  <option value="" className="text-center">Sélectionnez</option>
                  <option value="fob" className="text-center">FOB</option>
                  <option value="cif" className="text-center">CIF</option>
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  FOB / CIF
                </p>
              </div>
            </div>

            {/* Troisième ligne : Devise et Quantité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Devise *
                </label>
                <select
                  name="devise"
                  value={formData.devise}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#76bc21]/30 focus:border-[#76bc21] outline-none transition-all duration-200 text-center text-lg bg-white"
                >
                  <option value="" className="text-center">Sélectionnez</option>
                  <option value="usd" className="text-center">USD</option>
                  <option value="eur" className="text-center">EUR</option>
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  USD / EUR
                </p>
              </div>

              <div className="text-center">
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Quantité prévue *
                </label>
                <input
                  type="number"
                  name="quantite"
                  value={formData.quantite}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#76bc21]/30 focus:border-[#76bc21] outline-none transition-all duration-200 text-center text-lg"
                  placeholder="100"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Kg uniquement
                </p>
              </div>
            </div>

            {/* Quatrième ligne : Prix unitaire et Valeur totale */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Prix unitaire *
                </label>
                <div className="flex items-center justify-center">
                  <input
                    type="number"
                    name="prixUnitaire"
                    value={formData.prixUnitaire}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#76bc21]/30 focus:border-[#76bc21] outline-none transition-all duration-200 text-center text-lg"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Prix par kg
                </p>
              </div>

              <div className="text-center">
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Valeur totale
                </label>
                <div className="flex items-center justify-center">
                  <input
                    type="text"
                    name="valeurTotale"
                    value={formData.valeurTotale}
                    readOnly
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl bg-gray-50 outline-none transition-all duration-200 text-center text-lg font-semibold text-gray-800"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Calcul automatique
                </p>
              </div>
            </div>

            {/* Fichier contrat */}
            <div className="text-center">
              <label className="block text-lg font-medium text-gray-700 mb-3">
                Fichier Contrat *
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#76bc21]/30 focus:border-[#76bc21] outline-none transition-all duration-200 text-center text-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#76bc21] file:text-white hover:file:bg-[#5ea11a]"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Format PDF uniquement
              </p>
              {formData.fichierContrat && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Fichier sélectionné : {formData.fichierContrat.name}
                </p>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-center gap-6 pt-8 border-t">
              <button
                type="button"
                onClick={() => setFormData({
                  numeroContrat: '',
                  typeDocument: '',
                  dateContrat: '',
                  incoterm: '',
                  devise: '',
                  quantite: '',
                  prixUnitaire: '',
                  valeurTotale: '',
                  fichierContrat: null
                })}
                className="px-8 py-3.5 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 text-lg font-medium min-w-[150px]"
              >
                Annuler
              </button>
              <button
                type="button"
                className="px-8 py-3.5 bg-gradient-to-r from-[#76bc21] to-[#5ea11a] text-white rounded-xl hover:shadow-lg transition-all duration-200 text-lg font-medium min-w-[150px] shadow-md"
              >
                Enregistrer
              </button>
            </div>

            {/* Indication des champs obligatoires */}
            <div className="text-sm text-gray-500 pt-4 text-center">
              <span className="text-red-500">*</span> Champs obligatoires
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Exportation