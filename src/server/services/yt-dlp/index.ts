import { execa, Options } from "execa";
import dargs from "dargs";

import { YtFlags, YtResponse } from "./types";

const YOUTUBE_DL_FILE = "yt-dlp";

const args = (url: string, flags = {}) =>
  [url, ...dargs(flags, { useEquals: false })].filter(Boolean);

const isJSON = (str = "") => str.startsWith("{");

const parse = (json: string) => (isJSON(json) ? JSON.parse(json) : json);

const ytDlp = async (url: string, flags?: YtFlags, opts?: Options) => {
  const res = await execa(YOUTUBE_DL_FILE, args(url, flags), opts);
  return parse(res.stdout) as YtResponse;
};

export default ytDlp;
