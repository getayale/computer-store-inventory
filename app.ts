
import express from "express";
import { pool } from "./db/pool.js";
import categoriesRouter from "./routes/categoriesRouter.js";
import itemsRouter from "./routes/itemsRouter.js";

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use("/categories", categoriesRouter);
app.use("/items", itemsRouter);

app.get("/", (req, res) => {
  res.send("Computer Store Inventory");
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.send(`Database connected! Server time: ${result.rows[0].now}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Database connection failed.");
  }
});

app.get("/db-info", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT current_database(), current_schema()"
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to retrieve database information.");
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
