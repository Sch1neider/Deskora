export type TicketPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type TicketStatus =
  | "open"
  | "in_progress"
  | "pending"
  | "resolved"
  | "closed";

export type TicketSortBy =
  | "createdAt"
  | "updatedAt"
  | "title"
  | "priority"
  | "status";

export type SortOrder = "asc" | "desc";

export interface CreateTicketInput {
  title: string;
  description: string;
  priority: TicketPriority;
  requesterId: number;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  priority?: TicketPriority;
  status?: TicketStatus;
}

export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  search?: string;
}

export interface TicketPagination {
  page: number;
  limit: number;
}

export interface TicketSorting {
  sortBy: TicketSortBy;
  order: SortOrder;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  requesterId: number;
  assigneeId: number | null;
  createdAt: string;
  updatedAt: string;
}