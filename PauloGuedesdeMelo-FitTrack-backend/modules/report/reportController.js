const reportService = require('./reportService');
const { success } = require('../../middlewares/apiResponse');
const { parseId } = require('../../utils/parseId');

exports.createReport = async (req, res) => {
  const workoutId = parseId(req.params.workoutId, 'treino');
  const report = await reportService.createReport(req.user.id, workoutId, req.body.reason);
  // 201 com só o necessário: quem denunciou e quando não voltam ao cliente.
  return success(res, report, 'Denúncia enviada. Obrigado por avisar.', 201);
};
