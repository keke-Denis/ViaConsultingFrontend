import React from 'react'

const Clients = () => {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
            Informations Client
          </h2>
          
          <div className="space-y-8 max-w-2xl mx-auto">
            {/* Nom Entreprise - Centré */}
            <div className="text-center">
              <label className="block text-lg font-medium text-gray-700 mb-3">
                Nom de l'Entreprise *
              </label>
              <input
                type="text"
                className="w-full max-w-md mx-auto px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#76bc21]/30 focus:border-[#76bc21] outline-none transition-all duration-200 text-center text-lg"
                placeholder="Entrez le nom de l'entreprise"
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Nom officiel de l'entreprise ou société
              </p>
            </div>

            {/* Nom Client - Centré en colonne */}
            <div className="text-center space-y-8">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Nom du Client *
                </label>
                <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-xl mx-auto">
                  <input
                    type="text"
                    className="flex-1 max-w-xs px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#76bc21]/30 focus:border-[#76bc21] outline-none transition-all duration-200 text-center text-lg"
                    placeholder="Nom"
                  />
                  <input
                    type="text"
                    className="flex-1 max-w-xs px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#76bc21]/30 focus:border-[#76bc21] outline-none transition-all duration-200 text-center text-lg"
                    placeholder="Prénom"
                  />
                </div>
              </div>
            </div>

            {/* Contact - Centré en colonne */}
            <div className="text-center space-y-8">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Contact *
                </label>
                <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-xl mx-auto">
                  <input
                    type="tel"
                    className="flex-1 max-w-xs px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#76bc21]/30 focus:border-[#76bc21] outline-none transition-all duration-200 text-center text-lg"
                    placeholder="+261 32 12 345 67"
                  />
                  <input
                    type="email"
                    className="flex-1 max-w-xs px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#76bc21]/30 focus:border-[#76bc21] outline-none transition-all duration-200 text-center text-lg"
                    placeholder="client@entreprise.com"
                  />
                </div>
              </div>
            </div>

            {/* Adresse exacte - Centré */}
            <div className="text-center">
              <label className="block text-lg font-medium text-gray-700 mb-3">
                Adresse exacte *
              </label>
              <div className="space-y-4 max-w-xl mx-auto">
                <input
                  type="text"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#76bc21]/30 focus:border-[#76bc21] outline-none transition-all duration-200 text-center text-lg"
                  placeholder="Rue, Numéro"
                />
                
                <input
                  type="text"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#76bc21]/30 focus:border-[#76bc21] outline-none transition-all duration-200 text-center text-lg"
                  placeholder="Quartier, Lot"
                />
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <input
                    type="text"
                    className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#76bc21]/30 focus:border-[#76bc21] outline-none transition-all duration-200 text-center text-lg"
                    placeholder="Ville"
                  />
                  <input
                    type="text"
                    className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#76bc21]/30 focus:border-[#76bc21] outline-none transition-all duration-200 text-center text-lg"
                    placeholder="Code postal"
                  />
                </div>
              </div>
            </div>

            {/* Informations supplémentaires - Centré */}
            <div className="text-center">
              <label className="block text-lg font-medium text-gray-700 mb-3">
                Informations supplémentaires
              </label>
              <textarea
                className="w-full max-w-xl mx-auto px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#76bc21]/30 focus:border-[#76bc21] outline-none transition-all duration-200 text-center text-lg h-32 resize-none"
                placeholder="Notes, références, informations complémentaires..."
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Optionnel : Remarques ou instructions spéciales
              </p>
            </div>

            {/* Boutons d'action - Centrés */}
            <div className="flex justify-center gap-6 pt-8 border-t">
              <button
                type="button"
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default Clients