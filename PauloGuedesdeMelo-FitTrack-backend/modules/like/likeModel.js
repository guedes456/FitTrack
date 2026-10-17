const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

// Uma linha = "este usuário curtiu este treino".
const Like = sequelize.define('Like',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    workoutId: { type: DataTypes.INTEGER, allowNull: false }
  },
  {
    timestamps: true,
    tableName: 'likes',
    indexes: [
      // A regra "uma pessoa só curte uma vez" mora NO BANCO. Checar antes de
      // inserir (if !existe -> create) não basta: dois cliques quase
      // simultâneos passam pela checagem ao mesmo tempo e os dois inserem. O
      // índice único composto (usuário + treino) faz o banco recusar o
      // segundo, aconteça o que acontecer no código. O name fixo evita que o
      // sync({ alter: true }) crie um índice duplicado a cada reinício.
      // Em `indexes`, os campos são os NOMES DAS COLUNAS no banco (user_id,
      // workout_id, por causa do underscored), e não os atributos do model.
      { unique: true, fields: ['user_id', 'workout_id'], name: 'idx_unique_user_workout_like' }
    ]
  }
);

module.exports = Like;
