const commentService = require('./commentService');
const { success } = require('../../middlewares/apiResponse');

exports.createComment = async (req, res) => {
  // Ordem: (userId, workoutId, content) — igual à assinatura do service.
  const comment = await commentService.createComment(
    req.user.id,
    req.params.workoutId,
    req.body.content
  );
  return success(res, comment, 'Comentário publicado.', 201);
};

exports.getComments = async (req, res) => {
  const comments = await commentService.getComments(req.params.workoutId);
  return success(res, comments);
};
