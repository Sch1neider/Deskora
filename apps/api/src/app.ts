import Fastify from "fastify";

import { ticketRoutes } from "./modules/tickets/ticket.routes.js";

export const app = Fastify({
  logger: true
});

app.get("/health", async () => {
  return {
    status: "ok",
    service: "deskora-api"
  };
});

app.register(ticketRoutes);