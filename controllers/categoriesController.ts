
import { pool } from "../db/pool.js";
import type { Request, Response } from "express";

export const getAllCategories = async (
  req: Request,
  res: Response
) => {

  const search = String(req.query.search ?? "").trim();
const page = Math.max(1, Number(req.query.page) || 1);
const limit = 5;
const offset = (page - 1) * limit;

  try {
   const result = await pool.query(
  `SELECT *
   FROM categories
   WHERE name ILIKE $1
   ORDER BY name
   LIMIT $2 OFFSET $3`,
  [`%${search}%`, limit, offset]
);
const countResult = await pool.query(
  `SELECT COUNT(*)
   FROM categories
   WHERE name ILIKE $1`,
  [`%${search}%`]
);

const totalCategories = Number(countResult.rows[0].count);
const totalPages = Math.max(
  1,
  Math.ceil(totalCategories / limit)
);

  res.render("categories", {
  categories: result.rows,
  search,
  page,
  totalPages,
  error: req.query.error === "category_has_items"
    ? "Cannot delete this category because it contains items."
    : null,
});
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to retrieve categories.");
  }
};


export const getCategoryById = async (
  req: Request,
  res: Response
) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
  return res.status(400).send("Invalid category ID.");
}

  try {
    const result = await pool.query(
      "SELECT * FROM categories WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Category not found.");
    }

    res.render("category", { category: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to retrieve category.");
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response
) => {
  const id = Number(req.params.id);

  try {
    const items = await pool.query(
      "SELECT id FROM items WHERE category_id = $1 LIMIT 1",
      [id]
    );

    if (items.rows.length > 0) {
  return res.redirect(
    "/categories?error=category_has_items"
  );
}
    const result = await pool.query(
      "DELETE FROM categories WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Category not found.");
    }

    res.redirect("/categories");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to delete category.");
  }
};

export const getEditCategory = async (
  req: Request,
  res: Response
) => {
  const id = Number(req.params.id);

  try {
    const result = await pool.query(
      "SELECT * FROM categories WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Category not found.");
    }

    res.render("editCategory", {
      category: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to retrieve category.");
  }
};

export const updateCategory = async (
  req: Request,
  res: Response
) => {
  const id = Number(req.params.id);
  const { name, description } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).send("Category name is required.");
  }

  try {
    const result = await pool.query(
      `UPDATE categories
       SET name = $1, description = $2
       WHERE id = $3
       RETURNING id`,
      [name.trim(), description?.trim() || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Category not found.");
    }

    res.redirect("/categories");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to update category.");
  }
};

export const getNewCategory=async(req:Request,res:Response)=>{

  
   return res.render("newCategory");

  

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
   catch (error) {
  console.error(error);

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  ) {
    return res.status(409).send("This category already exists.");
  }

  return res.status(500).send("Failed to create category.");
}

};