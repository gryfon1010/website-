export function getPagination(input: { page?: unknown; limit?: unknown }) {
  const page = Math.max(1, Number(input.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(input.limit) || 12));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function getPaginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    pageCount: Math.max(1, Math.ceil(total / limit)),
  };
}
