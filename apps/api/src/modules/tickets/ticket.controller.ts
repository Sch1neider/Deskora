import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
} from "./ticket.service.js";

import type {
  CreateTicketInput,
  TicketFilters,
  TicketSortBy,
  SortOrder,
  UpdateTicketInput,
} from "./ticket.types.js";

// Lê o corpo validado pela rota, cria o ticket e responde com HTTP 201.
export const createTicketController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const body =
    request.body as CreateTicketInput;

  const ticket = createTicket(body);

  return reply
    .status(201)
    .send(ticket);
};

// Converte os parâmetros de consulta em filtros, paginação e ordenação do serviço.
export const getTicketsController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const query =
    request.query as TicketFilters & {
      page?: string;
      limit?: string;
      sortBy?: TicketSortBy;
      order?: SortOrder;
    };

  const page = query.page
    ? Number(query.page)
    : 1;

  const limit = query.limit
    ? Number(query.limit)
    : 10;

  const filters: TicketFilters = {
    status: query.status,
    priority: query.priority,
    search: query.search,
  };

  const result = getTickets(
    filters,
    {
      page,
      limit,
    },
    {
      sortBy:
        query.sortBy ?? "createdAt",
      order:
        query.order ?? "desc",
    },
  );

  return reply
    .status(200)
    .send(result);
};

// Busca um ticket pelo ID e responde 404 quando não há correspondência.
export const getTicketByIdController =
  async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const { id } =
      request.params as {
        id: string;
      };

    const ticket =
      getTicketById(id);

    if (!ticket) {
      return reply
        .status(404)
        .send({
          message:
            "Ticket não encontrado",
        });
    }

    return reply
      .status(200)
      .send(ticket);
  };

  // Encaminha os campos enviados para atualização e traduz erros em respostas HTTP.
export const updateTicketController =
  async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const { id } =
      request.params as {
        id: string;
      };

    const body =
      request.body as UpdateTicketInput;

    try {
      const ticket =
        updateTicket(id, body);

      if (!ticket) {
        return reply
          .status(404)
          .send({
            message:
              "Ticket não encontrado",
          });
      }

      return reply
        .status(200)
        .send(ticket);
    } catch (error) {
      if (error instanceof Error) {
        return reply
          .status(400)
          .send({
            message:
              error.message,
          });
      }

      return reply
        .status(400)
        .send({
          message:
            "Não foi possível atualizar o ticket",
        });
    }
  };

  // Exclui o ticket indicado e retorna 204 quando a operação é concluída.
export const deleteTicketController =
  async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const { id } =
      request.params as {
        id: string;
      };

    const deleted =
      deleteTicket(id);

    if (!deleted) {
      return reply
        .status(404)
        .send({
          message:
            "Ticket não encontrado",
        });
    }

    return reply
      .status(204)
      .send();
  };