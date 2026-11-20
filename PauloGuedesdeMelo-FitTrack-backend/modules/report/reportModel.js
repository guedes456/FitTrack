const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const { REPORT } = require('../../config/constants');

// Denúncia = uma pessoa avisa a moderação de que um treino merece revisão.
const Report = sequelize.define('Report',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    // allowNull: false: toda denúncia É SOBRE um treino. Por isso o ON DELETE
    // da chave estrangeira é NO ACTION (o banco RECUSA excluir o treino
    // enquanto existirem denúncias dele) e a API precisa apagá-las antes.
    workoutId: { type: DataTypes.INTEGER, allowNull: false },
    // Segunda defesa do motivo: o validator barra na API; o ENUM, no banco.
    reason: { type: DataTypes.ENUM(...REPORT.REASONS), allowNull: false }
  },
  {
    timestamps: true,
    tableName: 'reports',
    indexes: [
      // Uma pessoa denuncia um treino UMA vez (a regra mora no banco).
      { unique: true, fields: ['user_id', 'workout_id'], name: 'idx_unique_report_user_workout' },
      // O índice acima NÃO ajuda quem busca só por workout_id: "denúncias
      // deste treino" (exclusão do treino, painel da Aula 15).
      { fields: ['workout_id'], name: 'idx_reports_workout_id' }
    ]
  }
);

module.exports = Report;
