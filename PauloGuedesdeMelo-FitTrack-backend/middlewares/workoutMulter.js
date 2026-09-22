const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'workouts');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Mesmo esquema do profileMulter: userId + timestamp + extensão,
    // pra nunca colidir entre uploads diferentes.
    const ext = path.extname(file.originalname);
    const uniqueName = `workout-${req.user.id}-${Date.now()}${ext}`;
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

// Grupo B usa multer.single(...): um único campo de arquivo ('image'), já
// que aqui não existe capa separada do conteúdo — a mesma imagem é as duas
// coisas. Se o projeto fosse Grupo A (arquivo principal + capa), a rota
// precisaria de multer.fields([{ name: 'video' }, { name: 'cover' }])
// para receber dois arquivos, cada um com seu próprio campo no formulário.
const workoutMulter = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 } // 8MB
});

module.exports = workoutMulter;
