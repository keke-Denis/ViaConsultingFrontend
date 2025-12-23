import api from '@/api/api'

export async function getDistillationsSansTransport() {
  try {
    const res = await api.get('/transports/distillations-sans-transport')
    return res.data || { success: false }
  } catch (err) {
    console.error('getDistillationsSansTransport', err)
    return { success: false, error: err }
  }
}

export async function getVendeursDisponibles() {
  try {
    const res = await api.get('/transports/vendeurs-disponibles')
    return res.data || { success: false }
  } catch (err) {
    console.error('getVendeursDisponibles', err)
    return { success: false, error: err }
  }
}

export async function getLivreursDisponibles() {
  try {
    const res = await api.get('/transports/livreurs-disponibles')
    return res.data || { success: false }
  } catch (err) {
    console.error('getLivreursDisponibles', err)
    return { success: false, error: err }
  }
}

export async function creerTransport(payload: any) {
  try {
    const res = await api.post('/transports/creer', payload)
    return res.data || { success: false }
  } catch (err: any) {
    console.error('creerTransport', err)
    return { success: false, error: err?.response?.data || err }
  }
}
