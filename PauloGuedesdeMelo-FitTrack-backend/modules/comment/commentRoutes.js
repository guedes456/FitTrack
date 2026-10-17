const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middlewares/asyncHandler');
const isAuthenticated = require('../../middlewares/auth');
const commentController = require('./commentController');
const { createCommentValidator } = require('./commentValidator');

// Comentar exige login e passa pela validação (trim primeiro).
router.post(
  '/workouts/:workoutId/comments',
  isAuthenticated,
  createCommentValidator,
  asyncHandler(commentController.createComment)
);

// Ler comentários é público: qualquer visitante vê a conversa.
router.get('/workouts/:workoutId/comments', asyncHandler(commentController.getComments));

module.exports = router;
