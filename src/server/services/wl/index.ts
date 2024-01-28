import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import connect, { sql } from "@databases/sqlite";

import createWlService from "./wl-service";

declare module "fastify" {
  interface FastifyInstance {
    db: ReturnType<typeof createWlService>;
  }
}

const dbConnector: FastifyPluginAsync = async (fastify, _options) => {
  const db = connect("./assets/watch-later.db");

  try {
    await db.query(
      sql`CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        channel TEXT,
        duration TEXT,
        view_count INT,
        upload_date TEXT,
        url TEXT NOT NULL,
        thumbnail TEXT,
        category TEXT
      )`,
    );
  } catch (e) {
    console.error("DB could not be created: ", e);
  }

  const service = createWlService(db);

  fastify.decorate("db", service);
};

const plugin = fp(dbConnector);

export default plugin;
