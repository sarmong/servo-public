import type { FastifyPluginCallback } from "fastify";

import ytDlp from "../services/yt-dlp";
import type { Category } from "../types";

interface CreateBody {
  url: string;
  category: Category;
}

const ytRoutes: FastifyPluginCallback = (app, _opts, done) => {
  app.get("/", async (_request, reply) => {
    const tasks = await app.db.getAllVideos();
    reply.send(tasks);
  });

  app.post<{ Body: CreateBody }>("/", async (request, reply) => {
    reply.send(app.db.saveYtVideo(request.body.url, request.body.category));
  });

  app.post("/update/:id", async (request, _reply) => {
    const { id } = request.params as { id: string };
    const url = await app.db.getUrlFromId(id);
    const json = await ytDlp(url, {
      dumpSingleJson: true,
    });

    await app.db.updateVideo(id, {
      title: json.title,
      channel: json.channel,
      duration: json.duration_string,
      view_count: json.view_count,
      upload_date: json.upload_date,
      url: json.webpage_url,
      thumbnail: json.thumbnail,
      category: "philos",
    });
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await app.db.deleteVideo(id);
    reply.status(200);
  });

  done();
};

export default ytRoutes;
