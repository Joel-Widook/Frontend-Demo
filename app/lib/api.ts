import { Article } from "../types";

export const STRAPI_URL = "http://localhost:1337";

export const fetchArticles = async (): Promise<Article[]> => {
    const response = await fetch(`${STRAPI_URL}/api/articles?populate=*`, {
    cache: "force-cache", // Generación estática (SSG)
  });
    if(!response.ok) {
        throw new Error("Failed to fetch articles");
    }
    const data = await response.json();
    return data.data;
}