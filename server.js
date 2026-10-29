const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/auth.routes");
const postRoutes = require("./src/routes/post.routes");
const adminRoutes = require("./src/routes/admin.routes");
const aiRoutes = require("./src/routes/ai.routes");
const { notFound, errorHandler } = require("./src/middleware/error.middleware");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",").map((item) => item.trim())
    : true
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({ message: "Akatsuki's Draft API is running", status: "ok" });
});
app.get("/health", (_req, res) => res.status(200).json({ status: "healthy" }));

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/admin/posts", adminRoutes);
app.use("/ai", aiRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("Unable to start API:", error.message);
    process.exit(1);
  });
