const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middlewares/asyncHandler');
const isAuthenticated = require('../../middlewares/auth');
const followController = require('./followController');

// Seguir e saber se sigo exigem login.
router.post('/users/:userId/toggle-follow', isAuthenticated, asyncHandler(followController.toggleFollow));
router.get('/users/:userId/follow-status', isAuthenticated, asyncHandler(followController.getFollowStatus));

// As listas são públicas: qualquer visitante vê quem segue quem.
router.get('/users/:userId/followers', asyncHandler(followController.getFollowers));
router.get('/users/:userId/following', asyncHandler(followController.getFollowing));

// Feed filtrado: só treinos de quem eu sigo.
router.get('/following-workouts', isAuthenticated, asyncHandler(followController.getFollowingWorkouts));

module.exports = router;
