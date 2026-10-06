import { db } from "./db.js";

const user = await db.orm.public.User.create({
  name: "Usuário de Teste",
  email: "teste@deskora.local",
  role: "USER",
  updatedAt: new Date(),
});

console.log(user);