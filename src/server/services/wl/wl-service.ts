import { DatabaseConnection, sql } from "@databases/sqlite";

import ytDlp from "../yt-dlp";
import { VideoData } from "../../types";

const createWlService = (db: DatabaseConnection) => {
  const getAllVideos = async () => {
    return await db.query(sql`SELECT * FROM videos`);
  };

  const getVideosByCategory = async (category: VideoData["category"]) => {
    return await db.query(
      sql`SELECT * FROM videos WHERE category = ${category}`,
    );
  };

  const searchVideos = async (searchString: string) => {
    // see https://github.com/ForbesLindesay/atdatabases/issues/316
    return await db.query(sql`SELECT * FROM videos
              WHERE INSTR(LOWER(title),   LOWER(${searchString})) > 0
              OR    INSTR(LOWER(channel), LOWER(${searchString})) > 0
              OR    INSTR(LOWER(url),     LOWER(${searchString})) > 0
              `);
  };

  const saveVideo = async (data: VideoData) => {
    await db.query(
      sql`INSERT INTO videos (title, channel, duration, view_count, upload_date, url, thumbnail, category)
        VALUES (${data.title}, ${data.channel}, ${data.duration}, ${data.view_count}, ${data.upload_date}, ${data.url}, ${data.thumbnail}, ${data.category})`,
    );

    const last_insert_rowid = await db.query(sql`SELECT last_insert_rowid()`);
    return last_insert_rowid[0]["last_insert_rowid()"];
  };

  const updateVideo = async (id: string, data: VideoData) => {
    await db.query(
      sql`UPDATE videos SET title = ${data.title}, channel = ${data.channel}, duration = ${data.duration}, view_count = ${data.view_count}, upload_date = ${data.upload_date}, url = ${data.url}, thumbnail = ${data.thumbnail}, category = ${data.category} WHERE id = ${id}`,
    );
  };

  const patchVideo = async (id: string, data: Partial<VideoData>) => {
    const setString = Object.entries(data).map(
      ([key, value]) => sql`${sql.ident(key)} = ${value}`,
    );

    return await db.query(
      sql`UPDATE videos SET ${sql.join(setString, sql`, `)} WHERE id = ${id}`,
    );
  };

  const deleteVideo = async (id: string) => {
    return db.query(sql`DELETE FROM videos WHERE id = ${id}`);
  };

  const getUrlFromId = async (id: string): Promise<string> => {
    const data = await db.query(sql`SELECT url FROM videos WHERE id = ${id};`);
    return data[0]?.url;
  };

  const saveYtVideo = async (url: string, category: VideoData["category"]) => {
    try {
      const json = await ytDlp(url, {
        dumpSingleJson: true,
      });

      const data = {
        title: json.title,
        channel: json.channel,
        duration: json.duration_string,
        view_count: json.view_count,
        upload_date: json.upload_date,
        url: json.webpage_url,
        thumbnail: json.thumbnail,
        category: category ?? "other",
      };
      const id = await saveVideo(data);
      return { ...data, id };
    } catch (e) {
      const data = {
        title: "Deleted Video",
        url: url,
        category: "other" as const,
      };
      const id = await saveVideo(data);
      return { ...data, id };
    }
  };

  return {
    getAllVideos,
    getVideosByCategory,
    searchVideos,
    saveVideo,
    updateVideo,
    patchVideo,
    deleteVideo,
    getUrlFromId,

    saveYtVideo,
  };
};

export default createWlService;
