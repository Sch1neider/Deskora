import type { FastifyInstance } from "fastify";

import {
  createTicketController,
  getTicketsController,
  getTicketByIdController,
  updateTicketController,
  deleteTicketController,
} from "./ticket.controller.js";

export const ticketRoutes = async (
  app: FastifyInstance,
) => {
  app.get(
    "/tickets",
    {
      schema: {
        querystring: {
          type: "object",
          additionalProperties: false,

          properties: {
            status: {
              type: "string",
              enum: [
                "open",
                "in_progress",
                "pending",
                "resolved",
                "closed",
              ],
            },

            priority: {
              type: "string",
              enum: [
                "low",
                "medium",
                "high",
                "critical",
              ],
            },

            search: {
              type: "string",
              minLength: 1,
              maxLength: 100,
            },

            page: {
              type: "string",
              pattern: "^[1-9][0-9]*$",
            },

            limit: {
              type: "string",
              pattern: "^[1-9][0-9]*$",
              maxLength: 3,
            },

            sortBy: {
              type: "string",
              enum: [
                "createdAt",
                "updatedAt",
                "title",
                "priority",
                "status",
              ],
            },

            order: {
              type: "string",
              enum: [
                "asc",
                "desc",
              ],
            },
          },
        },
      },
    },
    getTicketsController,
  );

  app.get(
    "/tickets/:id",
    getTicketByIdController,
  );

  app.patch(
    "/tickets/:id",
    {
      schema: {
        body: {
          type: "object",
          minProperties: 1,
          additionalProperties: false,

          properties: {
            title: {
              type: "string",
              minLength: 3,
              maxLength: 150,
            },

            description: {
              type: "string",
              minLength: 5,
              maxLength: 1000,
            },

            priority: {
              type: "string",
              enum: [
                "low",
                "medium",
                "high",
                "critical",
              ],
            },

            status: {
              type: "string",
              enum: [
                "open",
                "in_progress",
                "pending",
                "resolved",
                "closed",
              ],
            },
          },
        },
      },
    },
    updateTicketController,
  );

  app.delete(
    "/tickets/:id",
    deleteTicketController,
  );

  app.post(
    "/tickets",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,

          required: [
            "title",
            "description",
            "priority",
            "requesterId",
          ],

          properties: {
            title: {
              type: "string",
              minLength: 3,
              maxLength: 150,
            },

            description: {
              type: "string",
              minLength: 5,
              maxLength: 1000,
            },

            priority: {
              type: "string",
              enum: [
                "low",
                "medium",
                "high",
                "critical",
              ],
            },

            requesterId: {
              type: "integer",
              minimum: 1,
            },
          },
        },
      },
    },
    createTicketController,
  );
};