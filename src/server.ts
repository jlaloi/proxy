import { Readable } from "node:stream";
import { setTimeout } from "node:timers/promises";
import path from "node:path";

import Fastify from "fastify";
import FastifyStatic from "@fastify/static";
import FastifyWebsocket from "@fastify/websocket";

const server = Fastify({ logger: true });

server.register(FastifyStatic, {
  root: path.join(__dirname, "../public"),
  prefix: "/",
});

server.get("/text", async (request, reply) =>
  reply.send(request.headers["x-user"] || "No user")
);

server.get("/api", async (request, reply) =>
  reply.send({
    hello: "world",
    requestHeaders: request.headers,
  })
);

server.get("/stream", async (_, reply) => {
  async function* render() {
    for (let i = 0; i < 5; i++) {
      await setTimeout(1_000);
      yield `${i + 1} second has passed\n`;
    }
  }
  const readable = Readable.from(render());
  reply.type("text/event-stream");
  reply.send(readable);
});

server.register(FastifyWebsocket);
server.get("/ws", { websocket: true }, (connection, request) => {
  const send = (message: string) =>
    connection.socket.send(
      `[${new Date().toLocaleTimeString()}] ${
        request.headers["x-user"] || "No user"
      }: ${message}`
    );
  connection.socket.on("message", (message: string) => {
    send(message);
  });
  send("welcome");
});

server.listen(3000);
