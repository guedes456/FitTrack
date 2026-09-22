const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'profiles');

// Garante que a pasta existe (caso alguém clone o projeto sem o
// default-profile.png versionado, ou apague a pasta sem querer).
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Nome único por upload: userId + timestamp + extensão original.
    // Evita colisão entre usuários diferentes e entre uploads sucessivos
    // do mesmo usuário (senão o navegador poderia servir uma versão
    // antiga da imagem em cache, achando que é o mesmo arquivo).
    const ext = path.extname(file.originalname);
    const uniqueName = `user-${req.user.id}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

function fileFilter(req, file, cb) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error('Formato de imagem inválido. Envie um JPG, PNG ou WEBP.');
    error.status = 400;
    return cb(error);
  }
  cb(null, true);
}

const profileMulter = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = profileMulter;
