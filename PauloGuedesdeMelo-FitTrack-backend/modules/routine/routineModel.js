const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

// Rotina = coleção pessoal de treinos ("meu treino de segunda", "pernas").
// A relação com Workout é MUITOS-PARA-MUITOS (uma rotina tem vários treinos e
// um treino pode estar em várias rotinas) e mora na tabela de junção
// routine_workouts (RoutineWorkout).
const Routine = sequelize.define('Routine',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.STRING(500), allowNull: true },
    // PRIVADA por padrão: quem esquece de marcar não expõe a rotina sem querer.
    isPublic: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    // Contador GUARDADO (como likesCount): atualizado junto com a junção,
    // na mesma transação, para a lista não precisar de COUNT(*) por cartão.
    treinosCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    }
  },
  {
    timestamps: true,
    tableName: 'routines',
    indexes: [
      // "Minhas rotinas" filtra por user_id. Os campos de `indexes` são os
      // NOMES DAS COLUNAS (user_id), por causa do underscored.
      { fields: ['user_id'], name: 'idx_routines_user_id' }
    ]
  }
);

module.exports = Routine;
