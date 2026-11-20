const notificationService = require('./notificationService');
const { success } = require('../../middlewares/apiResponse');
const { parsePagination } = require('../../utils/pagination');
const { parseId } = require('../../utils/parseId');

// O userId vem SEMPRE do token (req.user.id), nunca da URL nem do corpo.

exports.getNotifications = async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const result = await notificationService.getUserNotifications(req.user.id, page, limit);
  return success(res, result);
};

exports.getUnreadCount = async (req, res) => {
  const unreadCount = await notificationService.getUnreadCount(req.user.id);
  // Num objeto: o front lê response.data.unreadCount.
  return success(res, { unreadCount });
};

exports.markAsRead = async (req, res) => {
  const notificationId = parseId(req.params.id, 'notificação');
  const result = await notificationService.markAsRead(notificationId, req.user.id);
  return success(res, result);
};
