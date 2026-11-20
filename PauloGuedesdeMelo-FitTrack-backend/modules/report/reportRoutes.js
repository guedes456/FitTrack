const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middlewares/asyncHandler');
const isAuthenticated = require('../../middlewares/auth');
const reportController = require('./reportController');
const { reportValidator } = require('./reportValidator');

// Ordem: login (401) -> validação do motivo (400) -> controller (id 400, 404,
// próprio 400, 409).
router.post('/workouts/:workoutId/report', isAuthenticated, reportValidator, asyncHandler(reportController.createReport));

module.exports = router;
