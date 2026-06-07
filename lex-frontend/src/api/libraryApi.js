import client from "./client.js"

export const getCategories = () =>
  client.get("/api/library/categories")

export const getArticlesByCategory = (categoryId) =>
  client.get(`/api/library/articles/${categoryId}`)

export const getArticle = (articleId) =>
  client.get(`/api/library/article/${articleId}`)

export const searchArticles = (query) =>
  client.get(`/api/library/search?q=${encodeURIComponent(query)}`)

export const searchWikipedia = (query) =>
  client.get(`/api/library/external/wikipedia/search?q=${encodeURIComponent(query)}`)

export const getWikipediaArticle = (title) =>
  client.get(`/api/library/external/wikipedia/article?title=${encodeURIComponent(title)}`)
