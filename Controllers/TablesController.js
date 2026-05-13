import { tableModel } from "../Models/Tables.js";
import dotenv from "dotenv"
import QRCode from "qrcode"
dotenv.config()


const frontend_base_url = process.env.FRONTEND_BASE_URL



export const generateTableRange = async (req, res) => {
  try{
        const { fromTable, toTable, replaceExisting } = req.body;

        const restaurantId = req.user._id;

        const createdTables = [];

        for (let i = fromTable; i <= toTable; i++) {

            const existing = await tableModel.findOne({
            restaurantId,
            tableNumber: i,
            });

            if (existing && !replaceExisting) {
            continue;
            }

            const menuUrl = `${frontend_base_url}/m/${restaurantId}/table/${i}`;

            const qrImageUrl = await QRCode.toDataURL(menuUrl);

            const table = await tableModel.findOneAndUpdate(
            {
                restaurantId,
                tableNumber: i,
                },
                {
                restaurantId,
                tableNumber: i,
                menuUrl,
                qrImageUrl,
            },
            {
                upsert: true,
                new: true,
            }
        );

        createdTables.push(table);
        }

        res.json({
            success: true,
            tables: createdTables,
        });
        // console.log(createdTables)
    }catch(error){
        console.log(error)
    }
};


export const createSingleTable = async (req, res) => {
    try {
        const restaurantId  = req.user._id;
        
        const { tableNumber, replaceExisting = false } = req.body;
        
        // Validation
        if (!tableNumber || tableNumber < 1) {
            return res.status(400).json({
                success: false,
                message: "Valid table number is required",
            });
        }
        
        // Check if table already exists
        const existingTable = await tableModel.findOne({
            restaurantId,
      tableNumber,
    });

    // Prevent duplicate creation
    if (existingTable && !replaceExisting) {
      return res.status(409).json({
        success: false,
        message: `Table ${tableNumber} already exists`,
      });
    }

    // Generate menu URL
    const menuUrl = `${frontend_base_url}/m/${restaurantId}/${tableNumber}`;

    // Generate QR code
    const qrImageUrl = await QRCode.toDataURL(menuUrl);

    let table;

    // Replace existing table QR
    if (existingTable && replaceExisting) {
      existingTable.menuUrl = menuUrl;
      existingTable.qrImageUrl = qrImageUrl;

      table = await existingTable.save();
    } else {
      // Create new table
      table = await tableModel.create({
        restaurantId,
        tableNumber,
        menuUrl,
        qrImageUrl,
      });
    }

    return res.status(existingTable ? 200 : 201).json({
      success: true,
      message: existingTable
        ? `Table ${tableNumber} QR replaced successfully`
        : `Table ${tableNumber} created successfully`,
      data: table,
    });
  } catch (error) {
    console.error("Create Single Table Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create table",
      error: error.message,
    });
  }
};


export const getAllTables = async (req, res) => {
  try {
    const restaurantId  = req.user._id;

    // Fetch all restaurant tables
    const tables = await tableModel
      .find({
        restaurantId,
      })
      .sort({ tableNumber: 1 });

    return res.status(200).json({
      success: true,
      message: "Tables fetched successfully",
      count: tables.length,
      data: tables,
    });
  } catch (error) {
    console.error("Get Tables Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tables",
      error: error.message,
    });
  }
};



export const deleteSingleTable = async (req, res) => {
  try {
    const {  tableNumber } = req.params;

    const restaurantId = req.user._id

    // Find and delete table
    const deletedTable = await tableModel.findOneAndDelete({
      restaurantId,
      tableNumber: Number(tableNumber),
    });

    // Table not found
    if (!deletedTable) {
      return res.status(404).json({
        success: false,
        message: `Table ${tableNumber} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Table ${tableNumber} deleted successfully`,
      data: deletedTable,
    });
  } catch (error) {
    console.error("Delete Single Table Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete table",
      error: error.message,
    });
  }
};

export const deleteAllTables = async (req, res) => {
  try {
    const  restaurantId  = req.user._id;

    // Delete all tables belonging to restaurant
    const result = await tableModel.deleteMany({
      restaurantId,
    });

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} table(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Delete All Tables Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete tables",
      error: error.message,
    });
  }
};

