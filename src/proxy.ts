import crypto from "node:crypto";
import { Transform } from "node:stream";

import Fastify from "fastify";
import FastifyHttpProxy from "@fastify/http-proxy";

const dumbPromise = (attribute: string) =>
  new Promise<Record<string, unknown>>((resolve) => {
    setTimeout(() => {
      resolve({
        [attribute]: crypto.randomUUID(),
        when: new Date(),
      });
    }, 1_000);
  });

const server = Fastify({ logger: true });

server.register(FastifyHttpProxy, {
  upstream: "http://0.0.0.0:3000/",
  prefix: "/",
  preHandler: async (request) => {
    const xUser = await dumbPromise("username");
    request.headers["X-User"] = JSON.stringify(xUser);
  },
  replyOptions: {
    onResponse: async (_, reply, res) => {
      if (reply.getHeader("Content-Type") === "application/json") {
        reply.removeHeader("Content-Length");
        reply.send(
          res.pipe(
            new Transform({
              transform: async function (chunk, _, done) {
                const response = JSON.parse(chunk.toString());
                const extraResponse = await dumbPromise("extra");
                const newResponse = JSON.stringify({
                  ...response,
                  ...extraResponse,
                });
                this.push(newResponse);
                done();
              },
            })
          )
        );
      } else reply.send(res);
    },
  },
});

server.listen(3001);
