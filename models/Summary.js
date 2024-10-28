import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Summary = sequelize.define("Summary", {
    transactionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Transactions",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Products",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  Summary.associate = (models) => {
    Summary.belongsTo(models.Transaction, { foreignKey: "transactionId" });
    Summary.belongsTo(models.Product, { foreignKey: "productId" });
  };

  return Summary;
};
