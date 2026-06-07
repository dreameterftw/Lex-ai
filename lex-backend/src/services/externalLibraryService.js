import { createError } from "../middleware/errorHandler.js";

const WIKIPEDIA_SEARCH_URL = "https://en.wikipedia.org/w/api.php";
const WIKIPEDIA_SUMMARY_URL = "https://en.wikipedia.org/api/rest_v1/page/summary";

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const body = await response.json();

  if (!response.ok) {
    throw createError(
      body?.error?.info || body?.message || `External API request failed: ${response.statusText}`,
      response.status || 502
    );
  }

  return body;
};

export const searchWikipedia = async (query) => {
  if (!query || query.trim().length < 2) {
    throw createError("Search query must be at least 2 characters.", 400);
  }

  const url = new URL(WIKIPEDIA_SEARCH_URL);
  url.searchParams.set("action", "query");
  url.searchParams.set("list", "search");
  url.searchParams.set("srsearch", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("utf8", "1");
  url.searchParams.set("srlimit", "8");
  url.searchParams.set("srprop", "snippet");

  const payload = await fetchJson(url.toString());
  const searchItems = payload?.query?.search || [];

  return searchItems.map((item) => ({
    title: item.title,
    snippet: item.snippet.replace(/<[^>]+>/g, ""),
    pageId: item.pageid,
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, "_"))}`
  }));
};

export const getWikipediaArticle = async (title) => {
  if (!title || !title.trim()) {
    throw createError("Article title is required.", 400);
  }

  const url = `${WIKIPEDIA_SUMMARY_URL}/${encodeURIComponent(title)}`;
  const payload = await fetchJson(url);

  return {
    title: payload.title,
    description: payload.description,
    extract: payload.extract,
    extractHtml: payload.extract_html,
    url: payload.content_urls?.desktop?.page,
    thumbnail: payload.thumbnail?.source
  };
};
