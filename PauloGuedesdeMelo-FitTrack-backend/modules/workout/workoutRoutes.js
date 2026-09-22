const express = require('express');
const router = express.Router();
const workoutController = require('./workoutController');
const { createWorkoutValidator } = require('./workoutValidator');
const asyncHandler = require('../../middlewares/asyncHandler');
const isAuthenticated = require('../../middlewares/auth');
const workoutMulter = require('../../middlewares/workoutMulter');

// Ordem dos middlewares (igual ao PUT /profile/me da Aula 05):
// 1) isAuthenticated  — sem usuário logado, nem processa o upload
// 2) workoutMulter    — interpreta o multipart/form-data, popula req.body e req.file
// 3) createWorkoutValidator — só enxerga req.body/req.file depois que o Multer já rodou
// 4) controller
router.post(
  '/workouts',
  isAuthenticated,
  workoutMulter.single('image'),
  createWorkoutValidator,
  asyncHandler(workoutController.createWorkout)
);

module.exports = router;
