// src/routes/library.js
import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { query, param } from "express-validator";
import { runValidation } from "../middleware/validateInput.js";
import {
  getCategories,
  getArticlesByCategory,
  getArticle,
  searchArticles,
  seedLibrary
} from "../services/libraryService.js";
import {
  searchWikipedia,
  getWikipediaArticle
} from "../services/externalLibraryService.js";

const router = Router();


// GET /api/library/categories
// Public — no auth required
router.get("/categories", async (req, res, next) => {
  try {
    const categories = getCategories();

    res.status(200).json({
      success: true,
      data: categories
    });

  } catch (err) {
    next(err);
  }
});


// GET /api/library/search?q=query
router.get("/search",
  [
    query("q")
      .isString()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Search query must be at least 2 characters"),
    runValidation
  ],
  async (req, res, next) => {
    try {
      const results = await searchArticles(req.query.q);

      res.status(200).json({
        success: true,
        data: results
      });

    } catch (err) {
      next(err);
    }
  }
);


// GET /api/library/external/wikipedia/search?q=query
router.get("/external/wikipedia/search",
  [
    query("q")
      .isString()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Search query must be at least 2 characters"),
    runValidation
  ],
  async (req, res, next) => {
    try {
      const results = await searchWikipedia(req.query.q);

      res.status(200).json({
        success: true,
        data: results
      });
    } catch (err) {
      next(err);
    }
  }
);


// GET /api/library/external/wikipedia/article?title=...
router.get("/external/wikipedia/article",
  [
    query("title")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Article title is required"),
    runValidation
  ],
  async (req, res, next) => {
    try {
      const result = await getWikipediaArticle(req.query.title);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
);


// GET /api/library/articles/:categoryId
router.get("/articles/:categoryId",
  [
    param("categoryId")
      .isString()
      .notEmpty()
      .withMessage("Category ID is required"),
    runValidation
  ],
  async (req, res, next) => {
    try {
      const articles = await getArticlesByCategory(
        req.params.categoryId
      );

      res.status(200).json({
        success: true,
        data: articles
      });

    } catch (err) {
      next(err);
    }
  }
);


// GET /api/library/article/:articleId
router.get("/article/:articleId",
  [
    param("articleId")
      .isString()
      .notEmpty()
      .withMessage("Article ID is required"),
    runValidation
  ],
  async (req, res, next) => {
    try {
      const article = await getArticle(req.params.articleId);

      res.status(200).json({
        success: true,
        data: article
      });

    } catch (err) {
      next(err);
    }
  }
);


// POST /api/library/seed
// Protected — requires auth + should only run once
router.post("/seed",
  verifyToken,
  async (req, res, next) => {
    try {
      await seedLibrary();

      res.status(200).json({
        success: true,
        message: "Library seeded successfully"
      });

    } catch (err) {
      next(err);
    }
  }
);

export default router;
