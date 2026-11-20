const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middlewares/asyncHandler');
const isAuthenticated = require('../../middlewares/auth');
const notificationController = require('./notificationController');

// As três rotas exigem login (a notificação é sempre de quem está logado).
router.get('/notifications', isAuthenticated, asyncHandler(notificationController.getNotifications));
router.get('/notifications/unread-count', isAuthenticated, asyncHandler(notificationController.getUnreadCount));
router.patch('/notifications/:id/read', isAuthenticated, asyncHandler(notificationController.markAsRead));

module.exports = router;
