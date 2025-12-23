// components/collecte/confirmation-modal.tsx
"use client";

import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  isDanger?: boolean; // Nouveau: pour les actions dangereuses (annulation, suppression)
  size?: "sm" | "md" | "lg" | "xl"; // Nouveau: contrôle de la taille
  showIcon?: boolean; // Nouveau: afficher une icône d'alerte
}

const COLOR = "#72bc21";
const DANGER_COLOR = "#dc2626"; // Rouge pour les actions dangereuses

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  loading = false,
  isDanger = false, // Par défaut: action normale
  size = "md", // Taille par défaut: medium
  showIcon = false // Par défaut: pas d'icône
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  // Déterminer la largeur en fonction de la taille
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  // Déterminer la couleur du bouton de confirmation
  const confirmColor = isDanger ? DANGER_COLOR : COLOR;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      {/* Modal */}
      <div 
        className={`
          bg-white p-8 rounded-2xl shadow-2xl w-full mx-auto 
          transform scale-100 transition-all duration-300
          ${sizeClasses[size]}
        `}
      >
        {/* En-tête avec icône optionnelle */}
        <div className="mb-6">
          {showIcon && (
            <div className="flex justify-center mb-4">
              <div 
                className="p-3 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: isDanger ? `${DANGER_COLOR}20` : `${COLOR}20` 
                }}
              >
                <div 
                  className="text-2xl"
                  style={{ color: isDanger ? DANGER_COLOR : COLOR }}
                >
                  {isDanger ? "⚠️" : "ℹ️"}
                </div>
              </div>
            </div>
          )}
          
          <h3 
            className="text-2xl font-bold mb-4 text-center break-words leading-tight" 
            style={{ color: confirmColor }}
          >
            {title}
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed break-words text-center">
            {description}
          </p>
        </div>
        
        {/* Boutons d'Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant={isDanger ? "destructive" : "outline"}
            onClick={onClose}
            disabled={loading}
            className={`
              text-base font-medium py-3 px-8 min-w-[120px] 
              order-2 sm:order-1
              ${isDanger ? "border-red-300 hover:bg-red-50" : "border-gray-300 hover:bg-gray-50"}
            `}
          >
            {cancelText}
          </Button>
          <Button
            style={{ backgroundColor: confirmColor }}
            onClick={onConfirm}
            disabled={loading}
            className={`
              text-white hover:opacity-90 font-semibold 
              text-base py-3 px-8 min-w-[120px] 
              order-1 sm:order-2
              ${isDanger ? "hover:bg-red-700" : "hover:bg-green-600"}
            `}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Traitement...</span>
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}