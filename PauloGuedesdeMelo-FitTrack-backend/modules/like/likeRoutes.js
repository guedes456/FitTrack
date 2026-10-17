const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middlewares/asyncHandler');
const isAuthenticated = require('../../middlewares/auth');
const optionalAuth = require('../../middlewares/optionalAuth');
const likeController = require('./likeController');

// Curtir/descurtir exige login.
router.post('/workouts/:workoutId/toggle-like', isAuthenticated, asyncHandler(likeController.toggleLike));

// Pública (optionalAuth): visitante vê o contador; logado também recebe se curtiu.
router.get('/workouts/:workoutId/like-status', optionalAuth, asyncHandler(likeController.getLikeStatus));

// Lista de curtidos do usuário logado.
router.get('/liked-workouts', isAuthenticated, asyncHandler(likeController.getLikedWorkouts));

module.exports = router;
