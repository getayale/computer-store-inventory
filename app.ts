import Express  from "express";
import { pool } from "./db/pool.js";
const app=Express();

app.get("/",(req,res)=>{
res.send("Computer Store Inventory");
});

app.listen(3001,()=>{

    console.log("Server running at http://localhost:3001");

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
  const result = await pool.query(
    "SELECT current_database(), current_schema()"
  );

  res.json(result.rows[0]);
});


app.get("/categories",async (req,res)=>{

    try{
        const result=await pool.query("SELECT * FROM categories ORDER BY name");
        res.json(result.rows);
    }

    catch(error){
        console.error(error);
        res.status(500).send("Failed to retrieve categories.");

    }

});