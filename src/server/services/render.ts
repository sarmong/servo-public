import type {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginCallback,
} from "fastify";
import fp from "fastify-plugin";

import { categories } from "../constants";

declare module "fastify" {
  interface FastifyInstance {
    render: ReturnType<typeof renderService>;
  }
}

export const renderService = (app: FastifyInstance) => {
  const page = () => {
    return app.view("page.pug", { categories });
  };

  return { page };
};

const plugin = fp((app, opts, done) => {
  const rs = renderService(app);

  app.decorate("render", rs);

  done();
});

export default plugin;
