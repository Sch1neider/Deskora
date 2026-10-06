import { db } from "../../prisma/db.js";

import type {
  CreateTicketInput,
  Ticket,
  TicketFilters,
  TicketPagination,
  TicketSorting,
  TicketStatus,
  UpdateTicketInput,
} from "./ticket.types.js";

const allowedStatusTransitions: Record<
  TicketStatus,
  TicketStatus[]
> = {
  open: ["in_progress"],
  in_progress: ["pending", "resolved"],
  pending: ["in_progress"],
  resolved: ["closed", "in_progress"],
  closed: [],
};

const priorityWeight: Record<
  Ticket["priority"],
  number
> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

type DatabaseTicket = {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  requesterId: number;
  assigneeId: number | null;
  createdAt: Date;
  updatedAt: Date;
};

const mapTicket = (
  ticket: DatabaseTicket,
): Ticket => {
  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    priority:
      ticket.priority.toLowerCase() as Ticket["priority"],
    status:
      ticket.status.toLowerCase() as TicketStatus,
    requesterId: ticket.requesterId,
    assigneeId: ticket.assigneeId,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  };
};

export const createTicket = async (
  input: CreateTicketInput,
): Promise<Ticket> => {
  const now = new Date();

  const ticket =
    await db.orm.public.Ticket.create({
      title: input.title,
      description: input.description,
      priority: input.priority.toUpperCase(),
      status: "OPEN",
      requesterId: input.requesterId,
      updatedAt: now,
    });

  return mapTicket(ticket);
};

export const getTickets = async (
  filters: TicketFilters,
  pagination: TicketPagination,
  sorting: TicketSorting,
) => {
  const tickets =
    await db.orm.public.Ticket.all();

  let filteredTickets: Ticket[] =
    tickets.map(mapTicket);

  if (filters.status) {
    filteredTickets =
      filteredTickets.filter(
        (ticket) =>
          ticket.status === filters.status,
      );
  }

  if (filters.priority) {
    filteredTickets =
      filteredTickets.filter(
        (ticket) =>
          ticket.priority === filters.priority,
      );
  }

  if (filters.search) {
    const search = filters.search
      .trim()
      .toLowerCase();

    filteredTickets =
      filteredTickets.filter(
        (ticket) =>
          ticket.title
            .toLowerCase()
            .includes(search) ||
          ticket.description
            .toLowerCase()
            .includes(search),
      );
  }

  filteredTickets.sort((a, b) => {
    let comparison = 0;

    switch (sorting.sortBy) {
      case "title":
        comparison =
          a.title.localeCompare(b.title);
        break;

      case "priority":
        comparison =
          priorityWeight[a.priority] -
          priorityWeight[b.priority];
        break;

      case "status":
        comparison =
          a.status.localeCompare(b.status);
        break;

      case "updatedAt":
        comparison =
          new Date(a.updatedAt).getTime() -
          new Date(b.updatedAt).getTime();
        break;

      case "createdAt":
      default:
        comparison =
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime();
        break;
    }

    return sorting.order === "asc"
      ? comparison
      : -comparison;
  });

  const total = filteredTickets.length;

  const startIndex =
    (pagination.page - 1) *
    pagination.limit;

  const endIndex =
    startIndex + pagination.limit;

  const paginatedTickets =
    filteredTickets.slice(
      startIndex,
      endIndex,
    );

  const totalPages =
    total === 0
      ? 0
      : Math.ceil(
          total / pagination.limit,
        );

  return {
    data: paginatedTickets,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
    },
    sorting,
  };
};

export const getTicketById = async (
  id: string,
): Promise<Ticket | undefined> => {
  const ticketId = Number(id);

  if (!Number.isInteger(ticketId)) {
    return undefined;
  }

  const ticket =
    await db.orm.public.Ticket.first({
      id: ticketId,
    });

  if (!ticket) {
    return undefined;
  }

  return mapTicket(ticket);
};

export const updateTicket = async (
  id: string,
  input: UpdateTicketInput,
): Promise<Ticket | undefined> => {
  const ticketId = Number(id);

  if (!Number.isInteger(ticketId)) {
    return undefined;
  }

  const existingTicket =
    await db.orm.public.Ticket.first({
      id: ticketId,
    });

  if (!existingTicket) {
    return undefined;
  }

  const currentStatus =
    existingTicket.status.toLowerCase() as TicketStatus;

  if (input.status !== undefined) {
    const allowedTransitions =
      allowedStatusTransitions[
        currentStatus
      ];

    if (
      !allowedTransitions.includes(
        input.status,
      )
    ) {
      throw new Error(
        `Transição de status inválida: ${currentStatus} → ${input.status}`,
      );
    }
  }

  const updateData: {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    updatedAt: Date;
  } = {
    updatedAt: new Date(),
  };

  if (input.title !== undefined) {
    updateData.title = input.title;
  }

  if (input.description !== undefined) {
    updateData.description =
      input.description;
  }

  if (input.priority !== undefined) {
    updateData.priority =
      input.priority.toUpperCase();
  }

  if (input.status !== undefined) {
    updateData.status =
      input.status.toUpperCase();
  }

  const ticket =
    await db.orm.public.Ticket
      .where({ id: ticketId })
      .update(updateData);

  if (!ticket) {
    return undefined;
  }

  return mapTicket(ticket);
};

export const deleteTicket = async (
  id: string,
): Promise<boolean> => {
  const ticketId = Number(id);

  if (!Number.isInteger(ticketId)) {
    return false;
  }

  const ticket =
    await db.orm.public.Ticket
      .where({ id: ticketId })
      .delete();

  return ticket !== null;
};