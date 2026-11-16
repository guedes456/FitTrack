const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middlewares/asyncHandler');
const isAuthenticated = require('../../middlewares/auth');
const optionalAuth = require('../../middlewares/optionalAuth');
const routineController = require('./routineController');
const { createRoutineValidator } = require('./routineValidator');

// Minhas rotinas (da pessoa logada).
router.get('/my-routines', isAuthenticated, asyncHandler(routineController.getMyRoutines));

router.post('/routines', isAuthenticated, createRoutineValidator, asyncHandler(routineController.createRoutine));

// ÚNICA rota pública do módulo (optionalAuth): visitante lê rotina pública;
// a dona lê a privada dela. O resto exige login.
router.get('/routines/:id', optionalAuth, asyncHandler(routineController.getRoutineDetails));

router.delete('/routines/:id', isAuthenticated, asyncHandler(routineController.deleteRoutine));

// O id do treino vai no CORPO ao adicionar e na URL ao remover.
router.post('/routines/:id/workouts', isAuthenticated, asyncHandler(routineController.addWorkout));
router.delete('/routines/:id/workouts/:workoutId', isAuthenticated, asyncHandler(routineController.removeWorkout));

// Para o modal "Salvar" do detalhe do treino: minhas rotinas + hasWorkout.
router.get('/workouts/:workoutId/routines-status', isAuthenticated, asyncHandler(routineController.getRoutinesStatus));

module.exports = router;
