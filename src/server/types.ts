import { categories } from "./constants";

export type Category = keyof typeof categories;

export type VideoData = {
  url: string;
  title: string;
  channel?: string;
  duration?: string;
  view_count?: number;
  upload_date?: string;
  thumbnail?: string;
  category: Category;
};
