import {Router} from "express";
import { getAllCategories,getCategoryById,deleteCategory ,getEditCategory,updateCategory, getNewCategory, createCategory} from "../controllers/categoriesController.js";


const categoriesRouter=Router();
categoriesRouter.get("/",getAllCategories);
categoriesRouter.get("/new",getNewCategory);
categoriesRouter.post("/new",createCategory);


categoriesRouter.post("/:id/delete", deleteCategory);
categoriesRouter.get("/:id/edit", getEditCategory);
categoriesRouter.post("/:id/edit", updateCategory);
categoriesRouter.get("/:id", getCategoryById);

export default categoriesRouter;