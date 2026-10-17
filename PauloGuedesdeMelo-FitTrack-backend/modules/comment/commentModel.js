const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Comment = sequelize.define('Comment',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    workoutId: { type: DataTypes.INTEGER, allowNull: false }
  },
  {
    timestamps: true,
    tableName: 'comments'
  }
);

module.exports = Comment;
