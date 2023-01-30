export interface PaginationOptions {
  total: number;
  perPage: number;
  page: number;
}

export interface Pagination {
  total: number;
  perPage: number;
  page: number;
  totalPages: number;
}

export function pagination({ total, perPage, page }: PaginationOptions) {
  return {
    total,
    perPage,
    page,
    totalPages: Math.ceil(total / perPage),
  };
}
