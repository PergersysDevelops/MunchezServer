import express from "express"
import { authenticateRestaurant } from "../Middleware/auth.js"
import { generateTableRange, createSingleTable, getAllTables, deleteSingleTable, deleteAllTables } from "../Controllers/TablesController.js"
import { checkRole } from "../Middleware/auth.js"



export const tableRouter = express.Router()

tableRouter.post("/restaurant/table/range",authenticateRestaurant, checkRole ,generateTableRange)
tableRouter.post("/restaurant/create-single",authenticateRestaurant, checkRole , createSingleTable)
tableRouter.get("/restaurant/fetch-qr-codes",authenticateRestaurant, checkRole , getAllTables)
tableRouter.delete("/delete-table/:tableNumber",authenticateRestaurant, checkRole , deleteSingleTable)
tableRouter.delete("/delete-all-tables",authenticateRestaurant, checkRole, deleteAllTables )




