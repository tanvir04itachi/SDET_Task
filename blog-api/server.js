import "dotenv/config";
import app from "./app.js";
import sequelize, { connectDB } from "./config/db.js";
import "./models/user.model.js";
import "./models/blog.model.js"; // must be imported before sync so the table is created

const PORT = process.env.PORT || 5000;

await connectDB();

if (process.env.DB_SYNC !== "false") {
  await sequelize.sync({ alter: true });
  console.log("Database synced");
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
