export function formatPrice(price: number): string {
  return `¥${price.toFixed(1)}`
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString)
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: '待确认',
    confirmed: '已接单',
    preparing: '制作中',
    ready: '可取餐',
    completed: '已完成',
    cancelled: '已取消',
  }
  return map[status] || status
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: '#FF7D00',
    confirmed: '#4080ff',
    preparing: '#FF6B35',
    ready: '#00B42A',
    completed: '#86909C',
    cancelled: '#C9CDD4',
  }
  return map[status] || '#86909C'
}

export function renderStars(rating: number): string {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  let stars = ''
  for (let i = 0; i < full; i++) stars += '★'
  if (half) stars += '☆'
  const remaining = 5 - full - (half ? 1 : 0)
  for (let i = 0; i < remaining; i++) stars += '☆'
  return stars
}