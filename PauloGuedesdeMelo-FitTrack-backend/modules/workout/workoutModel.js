const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Workout = sequelize.define('Workout',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING(500), allowNull: true },
    // Grupo B: um arquivo só. A imagem enviada é ao mesmo tempo o conteúdo
    // principal e a "capa" — por isso não existe um campo `cover` separado
    // aqui, diferente do Grupo A (que teria video/audio + cover/thumbnail).
    image: { type: DataTypes.STRING, allowNull: false },
    // Contador de visualizações do detalhe (Aula 08). Incrementado de forma
    // atômica a cada GET /workouts/:id.
    viewsCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    // Contadores GUARDADOS (Aula 10): são atualizados junto com a curtida/
    // comentário, dentro de uma transação, para a listagem não precisar fazer
    // COUNT(*) em likes/comments para cada card.
    likesCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    commentsCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    userId: { type: DataTypes.INTEGER, allowNull: false }
  },
  {
    timestamps: true,
    tableName: 'workouts'
  }
);

module.exports = Workout;
