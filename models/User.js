import { DataTypes } from "sequelize";

export default (sequelize) => {
  const User = sequelize.define("User", {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true,
    },
  });

  User.associate = (models) => {
    User.hasMany(models.Product, { foreignKey: "userId" });
    User.hasMany(models.Transaction, { foreignKey: "userId" });
  };

  return User;
};
