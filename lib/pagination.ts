export const HOME_STOCK_PAGE_SIZE = 9

export function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value
  const page = Number.parseInt(raw ?? "1", 10)
  if (!Number.isFinite(page) || page < 1) return 1
  return page
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize

  return {
    items: items.slice(start, start + pageSize),
    total,
    totalPages,
    currentPage,
    pageSize,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
  }
}
