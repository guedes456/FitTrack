const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

// Uma linha = "followerId segue followingId". É uma relação ENTRE USUÁRIOS:
// as duas colunas apontam para a MESMA tabela (users).
const Follow = sequelize.define('Follow',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    followingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    }
  },
  {
    timestamps: true,
    tableName: 'follows',
    indexes: [
      // 1) Único composto: "ninguém segue a mesma pessoa duas vezes" mora NO
      //    BANCO (um if no código não segura dois cliques simultâneos). A ORDEM
      //    das colunas importa: o índice é ordenado por follower_id e, dentro
      //    dele, por following_id. Por isso ele também serve para buscas por
      //    follower_id sozinho ("quem este usuário segue", "o feed de quem eu
      //    sigo"), mas NÃO ajuda numa busca só por following_id.
      { unique: true, fields: ['follower_id', 'following_id'], name: 'idx_unique_follower_following' },

      // 2) Simples em following_id: cobre exatamente a busca que o índice
      //    acima não cobre — "quem segue esta pessoa" (a lista de seguidores).
      { fields: ['following_id'], name: 'idx_follows_following_id' }
    ]
  }
);

module.exports = Follow;
