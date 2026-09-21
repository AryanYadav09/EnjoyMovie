import { Router } from 'express';
import * as movieController from '../controllers/movie.controller.js';

const router = Router();

// Discovery & Search
router.get('/discover', movieController.discover);
router.get('/search', movieController.search);
router.get('/nlp-search', movieController.nlpSearch);
router.get('/trending', movieController.getTrending);
router.get('/curated/:category', movieController.getCurated);

// Quiz "What Should I Watch" & AI Personalized
router.post('/quiz-recommendations', movieController.quizRecommendations);
router.post('/personalized', movieController.getPersonalized);

// Movie Details, Reviews, Recommendations
router.get('/:id', movieController.getDetails);
router.get('/:id/reviews', movieController.getReviews);

export default router;
