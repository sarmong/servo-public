import path from "path";

import fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyView from "@fastify/view";
import fastifyFormbody from "@fastify/formbody";

import pug from "pug";

import sqlite from "./services/wl";
import renderService from "./services/render";
import ytRoutes from "./routes/yt";
import htmxRoutes from "./routes/htmx";
import { categories } from "./constants";

const app = fastify({
  logger: true,
});

app.register(sqlite);
app.register(fastifyStatic, {
  root: path.join(__dirname, "../client"),
  // prefix: '/public/', // optional: default '/'
  // constraints: { host: 'example.com' } // optional: default {}
});
app.register(fastifyFormbody);
app.register(fastifyView, {
  engine: { pug },
  root: path.join(__dirname, "views"),
});
app.register(renderService);

app.register(ytRoutes, { prefix: "/yt" });
app.register(htmxRoutes, { prefix: "/htmx" });

app.get("/", async (_request, reply) => {
  return reply.view("page.pug", { categories });
});

const start = async () => {
  try {
    await app.listen({ port: 3000 });
    app.log.info("Server is listening on port 3000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
