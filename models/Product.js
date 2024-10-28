import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Product = sequelize.define(
    "Product",
    {
      productCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        comment: "Price in IDR",
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: false,
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.User, { foreignKey: "userId" });
    Product.belongsToMany(models.Transaction, {
      through: models.Summary,
      foreignKey: "productId",
    });
  };

  return Product;
};
