const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const { NOTIFICATION } = require('../../config/constants');

// Notificação = um aviso para QUEM RECEBE (userId) de que ALGUÉM (actorId)
// fez algo (type), opcionalmente sobre um treino (workoutId).
const Notification = sequelize.define('Notification',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // Quem recebe o aviso (o dono do treino; ou quem foi seguido).
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    // Quem fez a ação. Segunda chave para a MESMA tabela users: por isso a
    // associação precisa de apelidos (Recipient / Actor).
    actorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    // ENUM: o banco recusa qualquer tipo fora da lista (defesa em profundidade).
    type: { type: DataTypes.ENUM(...Object.values(NOTIFICATION.TYPES)), allowNull: false },
    // OPCIONAL: seguir não envolve treino. allowNull: true faz a associação
    // belongsTo gerar ON DELETE SET NULL (veja associations.js e o teste de
    // controle da Etapa 4: por isso a exclusão do treino apaga os avisos dele).
    workoutId: { type: DataTypes.INTEGER, allowNull: true },
    isRead: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  },
  {
    timestamps: true,
    tableName: 'notifications',
    indexes: [
      // "minhas não lidas" (contador do sino) e "minhas notificações": os dois
      // filtram por user_id; is_read é a segunda coluna, para o COUNT do sino
      // (user_id = ? AND is_read = false) não precisar olhar linha por linha.
      { fields: ['user_id', 'is_read'], name: 'idx_notifications_user_read' },
      // Ao excluir um treino, o banco/a API procura os avisos DELE.
      { fields: ['workout_id'], name: 'idx_notifications_workout_id' }
    ]
  }
);

module.exports = Notification;
