const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middlewares/asyncHandler');
const { isAuthenticated, isAdmin } = require('../../middlewares/auth');
const adminController = require('./adminController');
const { reportsFilterValidator, blockUserValidator } = require('./adminValidator');

// UMA ÚNICA GUARDA para tudo que começa com /admin (inclusive rotas que nem
// existem: /admin/qualquer-coisa responde 401/403, não 404). Uma rota nova
// acrescentada abaixo já nasce protegida, sem ninguém precisar lembrar.
// Ordem: isAuthenticated (monta o req.user) ANTES do isAdmin (lê o req.user).
router.use('/admin', isAuthenticated, isAdmin);

router.get('/admin/dashboard', asyncHandler(adminController.getDashboard));

router.get('/admin/reports', reportsFilterValidator, asyncHandler(adminController.getReports));
router.patch('/admin/reports/:id/review', asyncHandler(adminController.reviewReport));

router.get('/admin/users', asyncHandler(adminController.getUsers));
router.patch('/admin/users/:id/block', blockUserValidator, asyncHandler(adminController.setUserBlocked));

router.get('/admin/workouts', asyncHandler(adminController.getWorkouts));
router.delete('/admin/workouts/:id', asyncHandler(adminController.deleteWorkout));

module.exports = router;
