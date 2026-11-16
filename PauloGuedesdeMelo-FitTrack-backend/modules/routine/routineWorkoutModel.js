const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

// TABELA DE JUNÇÃO. Uma linha = "este treino está nesta rotina". Um banco
// relacional não guarda uma LISTA numa coluna: a relação muitos-para-muitos
// vira duas relações um-para-muitos, e esta tabela fica no meio, com uma FK
// para cada lado.
const RoutineWorkout = sequelize.define('RoutineWorkout',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    routineId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'routines', key: 'id' },
      onDelete: 'CASCADE'
    },
    workoutId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'workouts', key: 'id' },
      onDelete: 'CASCADE'
    }
  },
  {
    timestamps: true,
    tableName: 'routine_workouts',
    indexes: [
      // 1) ÚNICO composto (routine_id, workout_id): o treino só entra uma vez
      //    na mesma rotina (a regra mora NO BANCO, como em likes). Como
      //    routine_id é a primeira coluna, ele também acelera "os treinos
      //    desta rotina" (WHERE routine_id = ?).
      { unique: true, fields: ['routine_id', 'workout_id'], name: 'idx_unique_routine_workout' },
      // 2) simples em workout_id: o índice acima NÃO ajuda quem busca só pela
      //    segunda coluna. "Em quais rotinas este treino está?" (status do
      //    modal Salvar, exclusão do treino) filtra por workout_id.
      { fields: ['workout_id'], name: 'idx_routine_workouts_workout_id' }
    ]
  }
);

module.exports = RoutineWorkout;
