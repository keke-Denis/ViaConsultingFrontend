import api from '@/api/api'
import type { ApiResponse, ListReceptionsParams, Reception } from './vente-type'

export async function getReceptions(params?: ListReceptionsParams) {
	try {
		const res = await api.get('/receptions', { params })
		return (res.data as ApiResponse<Reception[]>) || { success: false }
	} catch (err) {
		console.error('getReceptions', err)
		return { success: false, error: err }
	}
}

export async function getReception(id: number | string) {
	try {
		const res = await api.get(`/receptions/${id}`)
		return (res.data as ApiResponse<Reception>) || { success: false }
	} catch (err) {
		console.error('getReception', err)
		return { success: false, error: err }
	}
}

export async function createReception(payload: Partial<Reception>) {
	try {
		const res = await api.post('/receptions', payload)
		return (res.data as ApiResponse<Reception>) || { success: false }
	} catch (err: any) {
		console.error('createReception', err)
		return { success: false, error: err?.response?.data || err }
	}
}

export async function updateReception(id: number | string, payload: Partial<Reception>) {
	try {
		const res = await api.put(`/receptions/${id}`, payload)
		return (res.data as ApiResponse<Reception>) || { success: false }
	} catch (err: any) {
		console.error('updateReception', err)
		return { success: false, error: err?.response?.data || err }
	}
}

export async function deleteReception(id: number | string) {
	try {
		const res = await api.delete(`/receptions/${id}`)
		return (res.data as ApiResponse<null>) || { success: false }
	} catch (err: any) {
		console.error('deleteReception', err)
		return { success: false, error: err?.response?.data || err }
	}
}

export async function marquerReceptionne(id: number | string, payload?: { observations?: string }) {
	try {
		const res = await api.post(`/receptions/${id}/marquer-receptionne`, payload || {})
		return (res.data as ApiResponse<Reception>) || { success: false }
	} catch (err: any) {
		console.error('marquerReceptionne', err)
		return { success: false, error: err?.response?.data || err }
	}
}

export async function marquerAnnule(id: number | string, payload: { raison: string }) {
	try {
		const res = await api.post(`/receptions/${id}/annuler`, payload)
		return (res.data as ApiResponse<Reception>) || { success: false }
	} catch (err: any) {
		console.error('marquerAnnule', err)
		return { success: false, error: err?.response?.data || err }
	}
}

export async function getReceptionsByStatut(statut: string) {
	try {
		const res = await api.get(`/receptions/statut/${encodeURIComponent(statut)}`)
		return (res.data as ApiResponse<Reception[]>) || { success: false }
	} catch (err: any) {
		console.error('getReceptionsByStatut', err)
		return { success: false, error: err?.response?.data || err }
	}
}

export async function getReceptionsByFicheLivraison(ficheLivraisonId: number | string) {
	try {
		const res = await api.get(`/receptions/fiche-livraison/${ficheLivraisonId}`)
		return (res.data as ApiResponse<Reception[]>) || { success: false }
	} catch (err: any) {
		console.error('getReceptionsByFicheLivraison', err)
		return { success: false, error: err?.response?.data || err }
	}
}

export async function getReceptionsByTransport(transportId: number | string) {
	try {
		const res = await api.get(`/receptions/transport/${transportId}`)
		return (res.data as ApiResponse<Reception[]>) || { success: false }
	} catch (err: any) {
		console.error('getReceptionsByTransport', err)
		return { success: false, error: err?.response?.data || err }
	}
}

export async function getMesReceptions() {
	try {
		const res = await api.get('/receptions/mes-receptions')
		return (res.data as ApiResponse<Reception[]>) || { success: false }
	} catch (err: any) {
		console.error('getMesReceptions', err)
		return { success: false, error: err?.response?.data || err }
	}
}

