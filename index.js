import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import UserModel from "./models/User.js";
import ProductModel from "./models/Product.js";
import TransactionModel from "./models/Transaction.js";
import SummaryModel from "./models/Summary.js";
import { authenticateToken } from "./middleware/auth.js";
import dotenv from "dotenv";
import cors from "cors";
import { Sequelize } from "sequelize";
import config from "./config/config.json" assert { type: "json" };

dotenv.config();

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET;

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
  }
);

const User = UserModel(sequelize, Sequelize.DataTypes);
const Product = ProductModel(sequelize, Sequelize.DataTypes);
const Transaction = TransactionModel(sequelize, Sequelize.DataTypes);
const Summary = SummaryModel(sequelize, Sequelize.DataTypes);

User.associate({ Product, Transaction });
Product.associate({ User, Transaction, Summary });
Transaction.associate({ User, Product, Summary });
Summary.associate({ Transaction, Product });

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

sequelize
  .authenticate()
  .then(() =>
    console.log("Database connection has been established successfully.")
  )
  .catch((err) => console.error("Unable to connect to the database:", err));

sequelize
  .sync()
  .then(() => console.log("All models are synchronized with the database."))
  .catch((error) => console.error("Error syncing models:", error));

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post("/register", async (req, res) => {
  const requestId = uuidv4();
  const { email, name, phoneNumber, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        requestId,
        data: null,
        message: "User with this email already exists",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      name,
      phoneNumber: phoneNumber || null,
      password: hashedPassword,
    });

    res.status(201).json({
      requestId,
      data: user,
      message: null,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      requestId,
      data: null,
      message: error.message || "Server error during registration",
      success: false,
    });
  }
});

app.post("/login", async (req, res) => {
  const requestId = uuidv4();
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        requestId,
        data: null,
        message: "Invalid email or password",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        requestId,
        data: null,
        message: "Invalid email or password",
        success: false,
      });
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      requestId,
      data: {
        accessToken,
        refreshToken,
        expiredIn: 7200,
        user,
      },
      message: "Login successful",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      requestId,
      data: null,
      message: "Server error during login",
      success: false,
    });
  }
});

app.get("/product", authenticateToken, async (req, res) => {
  const requestId = uuidv4();

  try {
    const products = await Product.findAll({
      where: { userId: req.userId },
    });
    res.status(200).json({
      requestId,
      data: products,
      message: "Products fetched successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      requestId,
      data: null,
      message: error.message || "Error fetching products",
      success: false,
    });
  }
});

app.post("/product", authenticateToken, async (req, res) => {
  const requestId = uuidv4();
  const { productCode, name, price, stock } = req.body;

  try {
    if (!productCode || !name || !price || !stock) {
      return res.status(400).json({
        requestId,
        data: null,
        message: "All fields are required",
        success: false,
      });
    }

    const product = await Product.create({
      productCode,
      name,
      price,
      stock,
      userId: req.userId,
    });

    res.status(201).json({
      requestId,
      data: product,
      message: "Product created successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      requestId,
      data: null,
      message: error.message || "Server error during product creation",
      success: false,
    });
  }
});

app.get("/transaction", authenticateToken, async (req, res) => {
  const requestId = uuidv4();

  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.userId },
      include: [
        {
          model: Product,
          through: { attributes: ["quantity"] },
        },
      ],
    });
    res.status(200).json({
      requestId,
      data: transactions,
      message: "Transactions fetched successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      requestId,
      data: null,
      message: error.message || "Error fetching transactions",
      success: false,
    });
  }
});

app.post("/transaction", authenticateToken, async (req, res) => {
  const requestId = uuidv4();
  const { customer, products, date } = req.body;

  try {
    if (!customer || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        requestId,
        data: null,
        message: "Invalid transaction data",
        success: false,
      });
    }

    let totalPrice = 0;
    const transactionProducts = [];

    for (const { productCode, quantity } of products) {
      if (!productCode) {
        return res.status(400).json({
          requestId,
          data: null,
          message: "Product code is required",
          success: false,
        });
      }

      const product = await Product.findOne({ where: { productCode } });

      if (!product) {
        return res.status(400).json({
          requestId,
          data: null,
          message: `Product not found for code: ${productCode}`,
          success: false,
        });
      }
      if (product.stock < quantity) {
        return res.status(400).json({
          requestId,
          data: null,
          message: `Insufficient stock for ${product.name}`,
          success: false,
        });
      }

      totalPrice += product.price * quantity;
      transactionProducts.push({ productId: product.id, quantity });
    }

    const transaction = await Transaction.create({
      customer,
      totalPrice,
      userId: req.userId,
      date: date || new Date(),
    });

    for (const { productId, quantity } of transactionProducts) {
      await Summary.create({
        transactionId: transaction.id,
        productId,
        quantity,
      });
      await Product.decrement("stock", {
        by: quantity,
        where: { id: productId },
      });
    }

    res.status(201).json({
      requestId,
      data: transaction,
      message: "Transaction created successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      requestId,
      data: null,
      message: error.message || "Error creating transaction",
      success: false,
    });
  }
});

app.delete("/transaction/:id", authenticateToken, async (req, res) => {
  const requestId = uuidv4();
  const { id } = req.params;

  try {
    const transaction = await Transaction.findOne({
      where: { id, userId: req.userId },
    });
    if (!transaction) {
      return res.status(404).json({
        requestId,
        data: null,
        message: "Transaction not found",
        success: false,
      });
    }

    await transaction.destroy();

    res.status(200).json({
      requestId,
      data: transaction,
      message: "Transaction deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      requestId,
      data: null,
      message: error.message || "Server error during transaction deletion",
      success: false,
    });
  }
});

app.get("/transaction/summary", authenticateToken, async (req, res) => {
  const requestId = uuidv4();

  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.userId, deletedAt: null },
      include: [
        {
          model: Product,
          through: { attributes: ["quantity"] },
        },
      ],
    });

    const summary = transactions.map((transaction) => ({
      invoiceNo: transaction.invoiceNo,
      date: transaction.date,
      customer: transaction.customer,
      totalPrice: transaction.totalPrice,
      products: transaction.Products.map((product) => ({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: product.Summary.quantity,
      })),
    }));

    res.status(200).json({
      requestId,
      data: summary,
      message: "Transaction summaries retrieved successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      requestId,
      data: null,
      message:
        error.message || "Server error while retrieving transaction summaries",
      success: false,
    });
  }
});
