
import type { Request, Response } from "express";
import { pool } from "../db/pool.js";

export const getAllItems = async (req: Request, res: Response) => {
    const search = String(req.query.search ?? "").trim();
    const categoryId = String(req.query.category ?? "").trim();

    const page = Math.max(1, Number(req.query.page) || 1);
const limit = 5;
const offset = (page - 1) * limit;

    const categoriesResult = await pool.query(
  "SELECT id, name FROM categories ORDER BY name"
);

const countResult = await pool.query(
  `SELECT COUNT(*) 
   FROM items
   WHERE (items.name ILIKE $1 OR items.sku ILIKE $1)
     AND ($2 = '' OR items.category_id = $2::INTEGER)`,
  [`%${search}%`, categoryId]
);

const totalItems = Number(countResult.rows[0].count);
const totalPages = Math.ceil(totalItems / limit);

  try {
    const result = await pool.query(`
      SELECT
        items.id,
        items.name,
        items.description,
        items.price,
        items.quantity,
        items.sku,
        categories.name AS category_name
      FROM items
      JOIN categories
        ON items.category_id = categories.id
   WHERE (items.name ILIKE $1 OR items.sku ILIKE $1)
  AND ($2 = '' OR items.category_id = $2::INTEGER)
ORDER BY items.name
LIMIT $3 OFFSET $4
       `,
    [`%${search}%`,categoryId,limit,offset]
  );
    res.render("items", { items: result.rows,search:search,categories:categoriesResult.rows,
        categoryId,page,totalPages
     });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to retrieve items.");
  }
};
export const getItemById=async(req:Request,res:Response)=>{

    const id=Number(req.params.id);

    try {
  const result = await pool.query(
    `SELECT
       items.id,
       items.name,
       items.description,
       items.price,
       items.quantity,
       items.sku,
       categories.name AS category_name
     FROM items
     JOIN categories
       ON items.category_id = categories.id
     WHERE items.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
  return res.status(404).send("Item not found.");

  
}
const item = result.rows[0];

res.render("item", { item });
} catch (error) {
  console.error(error);
  res.status(500).send("Failed to retrieve item.");
}
};

export const getNewItem=async(req:Request,res:Response)=>{
try {
const result=await pool.query("SELECT id, name FROM categories ORDER BY name");
res.render("newItem", { categories: result.rows });
}
catch(error){
console.error(error);
res.status(500).send("Failed to load Categories");
}
};

export const createItem = async (req: Request, res: Response) => {
  const { name, description, price, quantity, sku, category_id } = req.body;
  if (
  !name?.trim() ||
  !sku?.trim() ||
  price === "" ||
  quantity === "" ||
  !category_id
) {
  return res.status(400).send("Please fill in all required fields.");
}

const itemPrice = Number(price);
const itemQuantity = Number(quantity);
if (!Number.isFinite(itemPrice) || itemPrice < 0) {
  return res.status(400).send("Price must be a valid number greater than or equal to 0.");
}

if (!Number.isInteger(itemQuantity) || itemQuantity < 0) {
  return res.status(400).send("Quantity must be a non-negative whole number.");
}

const categoryId = Number(category_id);

if (!Number.isInteger(categoryId) || categoryId <= 0) {
  return res.status(400).send("Please select a valid category.");
}

const normalizedSku = sku.trim().toUpperCase();

if (!/^[A-Z0-9_-]+$/.test(normalizedSku)) {
  return res.status(400).send(
    "SKU can contain only letters, numbers, hyphens, and underscores."
  );
}

  try {
    await pool.query(
      `INSERT INTO items
        (name, description, price, quantity, sku, category_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        name.trim(),
        description?.trim() || null,
        itemPrice,
itemQuantity,
        sku.trim(),
    categoryId,
      ]
    );

    res.redirect("/items");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to create item. Check that the SKU is unique and the category is valid.");
  }
};


export const getEditItem=async(req:Request,res:Response)=>{

    const id=Number(req.params.id);

    try{
        const itemResult=await pool.query("SELECT * FROM items WHERE id=$1",[id]);
        if(itemResult.rows.length===0){
            return res.status(404).send("Item Not Found");
        }
const categoryResult=await pool.query("SELECT id,name FROM categories ORDER BY name");

res.render("editItem",{
    item:  itemResult.rows[0],
    categories:categoryResult.rows});
    }
    catch(error){
        console.error(error);
        res.status(500).send("Failed to load item");

    }

};

export const updateItem=async(req:Request,res:Response)=>{
    const id=Number(req.params.id);
    const{name,description,price,quantity,sku,category_id}=req.body;
    if(!Number.isInteger(id) || id<=0){
        return res.status(400).send("Invalid item ID");
    }

    if (
  !name?.trim() ||
  !sku?.trim() ||
  price === "" ||
  quantity === "" ||
  !category_id
) {
  return res.status(400).send("Please fill in all required fields.");
}
const normalizedSku = sku.trim().toUpperCase();

if (!/^[A-Z0-9_-]+$/.test(normalizedSku)) {
  return res.status(400).send(
    "SKU can contain only letters, numbers, hyphens, and underscores."
  );
}
const itemPrice = Number(price);
const itemQuantity = Number(quantity);

if (!Number.isFinite(itemPrice) || itemPrice < 0) {
  return res.status(400).send(
    "Price must be a valid number greater than or equal to 0."
  );
}

if (!Number.isInteger(itemQuantity) || itemQuantity < 0) {
  return res.status(400).send(
    "Quantity must be a non-negative whole number."
  );
}
const categoryId = Number(category_id);

if (!Number.isInteger(categoryId) || categoryId <= 0) {
  return res.status(400).send("Please select a valid category.");
}

try{
    await pool.query(`
        UPDATE items
        SET name=$1,
            description=$2,
            price = $3,
            quantity=$4,
            sku=$5,
            category_id=$6
      WHERE id=$7

        `,[
            name.trim(),
            description?.trim() || null,
            itemPrice,
            itemQuantity,
            normalizedSku,
            categoryId,
            id
        ]);
        res.redirect("/items");

}
catch(error){
    console.error(error);
    res.status(500).send("Failed to update the item.");
}
};


export const deleteItem = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).send("Invalid item ID.");
  }

  // Database deletion 

  
  try {
    const result = await pool.query(
      "DELETE FROM items WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Item not found.");
    }

    return res.redirect("/items");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Failed to delete item.");
  }

};


export const createCategory=async(req:Request,res:Response)=>{
    const {name,description}=req.body;

    const normalizedName = String(name ?? "").trim();
const normalizedDescription = String(description ?? "").trim();
if (!normalizedName) {
  return res.status(400).send("Category name is required.");
}

    try{
        const result = await pool.query(
  `INSERT INTO categories (name, description)
   VALUES ($1, $2)
   RETURNING id`,
  [normalizedName, normalizedDescription || null]
);
return res.redirect("/categories");

    }
    catch(error){
        console.error(error);
        res.status(500).send("failed to create category");
    }

};