var express = require('express');
var logger = require('morgan');
var cors = require('cors');
var path = require('path');
require('dotenv').config();

var indexRouter = require('./routes/index');
var searchRoutes = require('./modules/search/searchRoutes');
var userRoutes = require('./modules/user/userRoutes');
var workoutRoutes = require('./modules/workout/workoutRoutes');
var likeRoutes = require('./modules/like/likeRoutes');
var commentRoutes = require('./modules/comment/commentRoutes');
var followRoutes = require('./modules/follow/followRoutes');
var routineRoutes = require('./modules/routine/routineRoutes');
var notificationRoutes = require('./modules/notification/notificationRoutes');
var reportRoutes = require('./modules/report/reportRoutes');
var adminRoutes = require('./modules/admin/adminRoutes');
var errorHandler = require('./middlewares/errorHandler');

var app = express();

app.use(logger('dev'));
// cors ANTES dos parsers: se o express.json() rejeitar um corpo inválido (400)
// antes de o cors rodar, a resposta de erro sai SEM o cabeçalho
// Access-Control-Allow-Origin e o navegador mostra "erro de CORS" no Console
// em vez do 400 verdadeiro.
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



// Serve os arquivos de uploads publicamente — precisa vir ANTES das rotas
// da API, para que uma requisição a /uploads/... nunca caia no 404 handler.
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.use('/api', indexRouter);
app.use('/api', searchRoutes);
app.use('/api', userRoutes);
app.use('/api', workoutRoutes);
app.use('/api', likeRoutes);
app.use('/api', commentRoutes);
app.use('/api', followRoutes);
app.use('/api', routineRoutes);
app.use('/api', notificationRoutes);
app.use('/api', reportRoutes);
// Depois das denúncias e ANTES do 404: o router.use('/admin') guarda tudo.
app.use('/api', adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada.',
    errors: []
  });
});

app.use(errorHandler); // sempre o ÚLTIMO app.use()

const sequelize = require('./config/database');

// Precisa ser carregado ANTES do sync: é aqui que Workout aprende que tem
// uma FK para User (e vice-versa). Se o sync rodasse antes, a tabela
// workouts seria criada sem a coluna/constraint de user_id vindo da
// associação.
require('./config/associations');

sequelize.sync({ alter: true })
  .then(() => console.log('Banco de dados sincronizado!'))
  .catch(err => console.error('Erro ao sincronizar banco:', err));

module.exports = app;
