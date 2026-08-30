import express from "express";
import authRoute  from "./routes/auth.route.js";
import usersRoute from "./routes/users.route.js";
import blogRoute  from "./routes/blog.route.js";

const app = express();

app.use(express.json());

app.use("/api/auth",  authRoute);
app.use("/api/users", usersRoute);
app.use("/api/blogs", blogRoute);

export default app;
