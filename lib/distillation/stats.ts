import api from '@/api/api'

export async function fetchDistillationStats() {
  try {
    const res = await api.get('/distillation-stat')
    // return the whole data object (contains distillations, expeditions, totaux, etc.)
    return res.data?.data ?? null
  } catch (error) {
    console.error('fetchDistillationStats error', error)
    return null
  }
}
