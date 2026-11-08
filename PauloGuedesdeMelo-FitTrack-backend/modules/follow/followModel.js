const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

// Uma linha = "followerId segue followingId". É uma relação entre DOIS
// USUÁRIOS: as duas colunas apontam para a mesma tabela (users).
const Follow = sequelize.define('Follow',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // Quem segue.
    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE'
    },
    // Quem é seguido.
    followingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE'
    }
  },
  {
    timestamps: true,
    tableName: 'follows',
    indexes: [
      // 1) Impede seguir a mesma pessoa duas vezes (a regra mora no banco) e
      //    acelera "quem eu sigo?" (WHERE follower_id = ?). A ORDEM importa:
      //    um índice composto só serve a consultas que usam o(s) primeiro(s)
      //    campo(s) dele, da esquerda para a direita. Com (follower_id,
      //    following_id), buscar por follower_id usa o índice; buscar só por
      //    following_id NÃO usa.
      { unique: true, fields: ['follower_id', 'following_id'], name: 'idx_unique_follow' },
      // 2) Por isso o segundo índice: "quem me segue?" (WHERE following_id = ?)
      //    e a checagem da chave estrangeira precisam de um índice que
      //    COMECE por following_id. Em `indexes`, os campos são os nomes das
      //    colunas no banco (underscored).
      { fields: ['following_id'], name: 'idx_follows_following_id' }
    ]
  }
);

module.exports = Follow;
