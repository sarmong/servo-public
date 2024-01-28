import type { FastifyPluginCallback } from "fastify";

import { categories } from "../constants";
import type { Category, VideoData } from "../types";

function displayDate(dateString?: string) {
  if (!dateString) return "Unknown date";
  const year = String(dateString).slice(0, 4);
  const month = String(dateString).slice(4, 6);
  const day = String(dateString).slice(6, 8);
  const date = new Date(`${year}-${month}-${day}`);
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

interface CreateBody {
  url: string;
  category: Category;
}

interface PatchBody {
  id: string;
  category: Category;
}

interface VideosQuery {
  search?: string;
  category?: Category;
}

const htmxRoutes: FastifyPluginCallback = (app, _opts, done) => {
  app.get("/", async (_request, reply) => {
    return reply.view("page.pug", { categories });
  });

  app.post<{ Body: CreateBody }>("/create", async (request, reply) => {
    const { url, category } = request.body;
    const data = await app.db.saveYtVideo(url, category);

    return reply.view("video-card.pug", {
      video: data,
      displayDate,
      categories,
      asPartial: true,
    });
  });

  app.patch<{ Body: PatchBody }>("/update-category", async (request, reply) => {
    const { id, category } = request.body;
    if (!id) return reply.status(400);

    app.db.patchVideo(id, { category });

    return reply.status(201).send();
  });

  app.get<{ Querystring: VideosQuery }>(`/videos`, async (request, reply) => {
    const { search } = request.query;

    if (search && search !== "") {
      const data = await app.db.searchVideos(search);
      return reply.view("videos-list.pug", {
        videos: data,
        displayDate,
      });
    }

    const category = request.query.category ?? "other";
    const videos = await app.db.getVideosByCategory(category);
    return reply.view("tabs.pug", {
      title: categories[category],
      categories,
      active: category,
      videos: videos.reverse(),
      displayDate,
    });
  });

  done();
};

export default htmxRoutes;
