import Fastify from "fastify";

const server = Fastify({ logger: true });

server.get("/", async (request, reply) =>
  reply.send(request.headers["x-user"] || "No user")
);

server.get("/api", async (request, reply) =>
  reply.send({
    hello: "world",
    requestHeaders: request.headers,
  })
);

server.listen(3000);
