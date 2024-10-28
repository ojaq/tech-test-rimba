import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

export default (sequelize) => {
  const Transaction = sequelize.define(
    "Transaction",
    {
      invoiceNo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        defaultValue: () => `INV-${uuidv4()}`,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      customer: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      totalPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      paranoid: true,
    }
  );

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.User, { foreignKey: "userId" });
    Transaction.belongsToMany(models.Product, {
      through: models.Summary,
      foreignKey: "transactionId",
    });
  };

  return Transaction;
};
