export const expeditionData = [
  {
    id: 1,
    documentNumber: "EXP-2024-001",
    dateEnvoi: "2024-01-15",
    dateArrivee: "2024-01-18",
    typeMatierePremiere: "Plastique PET",
    quantite: 1500,
    siteCollecte: "Centre de tri Ouest",
    status: "receptionné"
  },
  {
    id: 2,
    documentNumber: "EXP-2024-002",
    dateEnvoi: "2024-01-16",
    dateArrivee: "2024-01-20",
    typeMatierePremiere: "Papier carton",
    quantite: 2500,
    siteCollecte: "Centre de tri Nord",
    status: "receptionné"
  },
  {
    id: 3,
    documentNumber: "EXP-2024-003",
    dateEnvoi: "2024-01-18",
    dateArrivee: null,
    typeMatierePremiere: "Verre",
    quantite: 1800,
    siteCollecte: "Centre de tri Est",
    status: "en attente"
  },
  {
    id: 4,
    documentNumber: "EXP-2024-004",
    dateEnvoi: "2024-01-19",
    dateArrivee: "2024-01-22",
    typeMatierePremiere: "Métal",
    quantite: 1200,
    siteCollecte: "Centre de tri Sud",
    status: "receptionné"
  },
  {
    id: 5,
    documentNumber: "EXP-2024-005",
    dateEnvoi: "2024-01-20",
    dateArrivee: null,
    typeMatierePremiere: "Plastique PEHD",
    quantite: 2000,
    siteCollecte: "Centre de tri Centre",
    status: "en attente"
  },
  {
    id: 6,
    documentNumber: "EXP-2024-006",
    dateEnvoi: "2024-01-10",
    dateArrivee: "2024-01-14",
    typeMatierePremiere: "Papier journal",
    quantite: 3000,
    siteCollecte: "Centre de tri Ouest",
    status: "receptionné"
  },
  {
    id: 7,
    documentNumber: "EXP-2024-007",
    dateEnvoi: "2024-01-22",
    dateArrivee: null,
    typeMatierePremiere: "Textile",
    quantite: 800,
    siteCollecte: "Centre de tri Nord",
    status: "en attente"
  }
];

export const sitesCollecte = [
  "Centre de tri Ouest",
  "Centre de tri Nord",
  "Centre de tri Est",
  "Centre de tri Sud",
  "Centre de tri Centre"
];

export const typesMatierePremiere = [
  "Plastique PET",
  "Plastique PEHD",
  "Papier carton",
  "Papier journal",
  "Verre",
  "Métal",
  "Textile",
  "Bois",
  "Déchets organiques"
];