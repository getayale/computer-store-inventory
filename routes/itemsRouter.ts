import {Router} from "express";
import { createItem, deleteItem, getAllItems, getEditItem, getItemById, getNewItem, updateItem } from "../controllers/itemsController.js";

const itemsRouter=Router();

itemsRouter.get("/",getAllItems);
itemsRouter.get("/new",getNewItem);
itemsRouter.post("/new",createItem);
itemsRouter.get("/:id/edit",getEditItem);
itemsRouter.post("/:id/edit",updateItem);
itemsRouter.post("/:id/delete",deleteItem);
itemsRouter.get("/:id",getItemById);

export default itemsRouter;