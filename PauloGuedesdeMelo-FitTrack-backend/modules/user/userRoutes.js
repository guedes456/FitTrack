const express = require('express');
const router = express.Router();
const userController = require('./userController');
const { registerValidator, loginValidator, profileUpdateValidator } = require('./userValidator');
const asyncHandler = require('../../middlewares/asyncHandler');
const isAuthenticated = require('../../middlewares/auth');
const profileMulter = require('../../middlewares/profileMulter');

router.post('/register', registerValidator, asyncHandler(userController.register));
router.post('/login', loginValidator, asyncHandler(userController.login));
router.post('/logout', asyncHandler(userController.logout));

// /profile/me precisa vir ANTES de /profile/:username, senão o Express
// interpreta "me" como um valor de :username e a rota nunca é alcançada.
router.get('/profile/me', isAuthenticated, asyncHandler(userController.getMyProfile));

// Ordem importa: isAuthenticated primeiro (sem usuário logado, nem faz
// sentido processar upload); profileMulter em seguida, porque ele é quem
// interpreta o multipart/form-data e popula req.body/req.file — os
// validadores do express-validator (profileUpdateValidator) só enxergam
// req.body depois que o Multer já rodou.
router.put(
  '/profile/me',
  isAuthenticated,
  profileMulter.single('profilePicture'),
  profileUpdateValidator,
  asyncHandler(userController.updateProfile)
);

router.get('/profile/:username', asyncHandler(userController.getPublicProfile));

module.exports = router;
