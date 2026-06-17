import {
  getArticle as getArticleService,
  getArticlesByCategory as getArticlesByCategoryService,
  getCategories as getCategoriesService,
  getComparisonArticles as getComparisonArticlesService,
  getFeaturedArticles as getFeaturedArticlesService,
  getLandmarkCases as getLandmarkCasesService,
  searchArticles as searchArticlesService
} from "../services/libraryService.js"
import { apiResult } from "../services/firestoreService.js"

export const getCategories = async () => apiResult(getCategoriesService())

export const getArticlesByCategory = async (categoryId) =>
  apiResult(await getArticlesByCategoryService(categoryId))

export const getArticle = async (articleId) =>
  apiResult(await getArticleService(articleId))

export const searchArticles = async (query) =>
  apiResult(await searchArticlesService(query))

export const getFeaturedArticles = async (maxItems) =>
  apiResult(await getFeaturedArticlesService(maxItems))

export const getLandmarkCases = async () =>
  apiResult(await getLandmarkCasesService())

export const getComparisonArticles = async () =>
  apiResult(await getComparisonArticlesService())

export const searchWikipedia = async () => apiResult([])

export const getWikipediaArticle = async () => apiResult(null)
