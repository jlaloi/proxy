import { Readable } from "node:stream";
import { setTimeout } from "node:timers/promises";

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

server.get("/stream", async (_, reply) => {
  async function* render() {
    yield "Hello";
    for (let i = 0; i < 5; i++) {
      await setTimeout(1_000);
      yield `${i + 1} second has passed\n`;
    }
  }
  const readable = Readable.from(render());
  reply.type("text/event-stream");
  reply.send(readable);
});

server.listen(3000);
