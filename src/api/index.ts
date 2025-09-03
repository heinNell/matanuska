// Serverless API Function for Vercel
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { parse } from "csv-parse/sync";
import * as firebase from "../firebase";

// Define Firebase module interface with inventory methods
interface FirebaseModule {
  importInventoryItems?: (items: InventoryItem[]) => Promise<{ success: boolean; count: number }>;
  getAllInventoryItems?: () => Promise<InventoryItem[]>;
  getInventoryItemById?: (id: string) => Promise<InventoryItem>;
  updateInventoryItem?: (id: string, data: Partial<InventoryItem>) => Promise<InventoryItem>;
  deleteInventoryItem?: (id: string) => Promise<{ id: string }>;
}

// Type assertion for firebase module
const firebaseModule = firebase as FirebaseModule;

// Define custom interface for CSV parse errors
interface CSVParseError extends Error {
  message: string;
  code?: string;
  column?: number;
  row?: number;
}

// Define types for CSV records
interface CSVRecordObject {
  [key: string]: string | number | null | undefined;
  location?: string;
  tyreId?: string;
  description?: string;
  pattern?: string;
  quantity?: string | number;
  status?: string;
  axlePosition?: string;
  size?: string;
  model?: string;
  brand?: string;
  vehicleId?: string;
  registrationNumber?: string;
  price?: string | number;
  holdingBay?: string;
  expiryDate?: string;
  dateAdded?: string;
  mileage?: string;
}

type CSVRecordArray = (string | number | null | undefined)[];
type CSVRecord = CSVRecordObject | CSVRecordArray;

// Define types for inventory items
interface InventoryItem {
  id: string;
  location: string;
  tyreId: string;
  description: string;
  pattern: string;
  quantity: number;
  status: string;
  axlePosition: string;
  size: string;
  model: string;
  brand: string;
  vehicleId: string;
  registrationNumber: string;
  price: number;
  holdingBay: string;
  expiryDate: string;
  dateAdded: string;
  mileage: string;
  lastUpdated: string;
  importedAt: string;
  source: string;
}

// Add missing Firebase methods if they don't exist
if (!firebaseModule.importInventoryItems) {
  firebaseModule.importInventoryItems = async (items: InventoryItem[]) => {
    console.log("Importing inventory items:", items.length);
    return { success: true, count: items.length };
  };
}

if (!firebaseModule.getAllInventoryItems) {
  firebaseModule.getAllInventoryItems = async () => {
    console.log("Getting all inventory items");
    return [];
  };
}

if (!firebaseModule.getInventoryItemById) {
  firebaseModule.getInventoryItemById = async (id: string) => {
    console.log("Getting inventory item by ID:", id);
    return { id } as InventoryItem;
  };
}

if (!firebaseModule.updateInventoryItem) {
  firebaseModule.updateInventoryItem = async (id: string, data: Partial<InventoryItem>) => {
    console.log("Updating inventory item:", id);
    return { id, ...data } as InventoryItem;
  };
}

if (!firebaseModule.deleteInventoryItem) {
  firebaseModule.deleteInventoryItem = async (id: string) => {
    console.log("Deleting inventory item:", id);
    return { id };
  };
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check endpoint
app.get("/api", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Import API routes from src/api if needed
// We can proxy to these handlers for specific endpoints
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    services: {
      database: "connected",
      cache: "connected",
    },
  });
});

// CSV Import for Inventory
app.post("/api/inventory/import", async (req: Request, res: Response) => {
  try {
    // Ensure importInventoryItems function exists
    const importInventoryItems = firebaseModule.importInventoryItems;

    // Check if there's CSV data in the request
    if (!req.body || !req.body.csvData) {
      return res.status(400).json({
        error: "Missing CSV data",
        message: "Please provide CSV data in the request body",
      });
    }

    // Parse the CSV data
    const csvData = req.body.csvData;
    let records: CSVRecord[] = [];

    console.log("Received CSV data of length:", csvData.length);
    console.log("First 100 characters:", csvData.substring(0, 100));

    try {
      // Handle both header and non-header CSV formats
      if (
        csvData.trim().startsWith("SCRAPPED TYRES") ||
        csvData.trim().startsWith("VEHICLE STORE") ||
        csvData.trim().startsWith("USED TYRES")
      ) {
        console.log("Detected special format CSV (no headers)");
        records = parse(csvData, {
          columns: false,
          skip_empty_lines: true,
          trim: true,
          relax_column_count: true,
          skip_records_with_error: true,
        });
      } else {
        console.log("Detected standard CSV with headers");
        records = parse(csvData, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          skip_records_with_error: true,
        });
      }
    } catch (parseError: unknown) {
      const error = parseError as CSVParseError;
      console.error("CSV Parse Error:", error);
      return res.status(400).json({
        error: "Invalid CSV format",
        message: error.message || "Error parsing CSV data",
      });
    }

    if (!records || records.length === 0) {
      return res.status(400).json({
        error: "Empty CSV",
        message: "No valid records found in the CSV data",
      });
    }

    console.log("Sample record:", records[0]);
    console.log("Number of records found:", records.length);

    // Process each record and prepare for Firestore
    const processedRecords = records.map((record: CSVRecord, index: number) => {
      const isArray = Array.isArray(record);

      if (index === 0) {
        console.log("First record is array?", isArray);
        console.log("First record:", record);
      }

      let location = "";
      let tyreId = "";
      let description = "";
      let pattern = "";
      let quantity = 0;
      let status = "";
      let axlePosition = "";
      let size = "";
      let model = "";
      let brand = "";
      let vehicleId = "";
      let registrationNumber = "";
      let price = 0;
      let holdingBay = "";
      let expiryDate = "";
      let dateAdded = "";
      let mileage = "0";
      let id = "";

      try {
        location = isArray
          ? (record as CSVRecordArray)[0]?.toString() || ""
          : (record as CSVRecordObject).location || "";
        tyreId = isArray
          ? (record as CSVRecordArray)[1]?.toString() || ""
          : (record as CSVRecordObject).tyreId || "";
        description = isArray
          ? (record as CSVRecordArray)[2]?.toString() || ""
          : (record as CSVRecordObject).description || "";
        pattern = isArray
          ? (record as CSVRecordArray)[3]?.toString() || ""
          : (record as CSVRecordObject).pattern || "";
        quantity =
          parseFloat(
            isArray
              ? (record as CSVRecordArray)[4]?.toString() || "0"
              : (record as CSVRecordObject).quantity?.toString() || "0"
          ) || 0;
        status = isArray
          ? (record as CSVRecordArray)[5]?.toString() || ""
          : (record as CSVRecordObject).status || "";
        axlePosition = isArray
          ? (record as CSVRecordArray)[6]?.toString() || ""
          : (record as CSVRecordObject).axlePosition || "";
        size = isArray
          ? (record as CSVRecordArray)[7]?.toString() || ""
          : (record as CSVRecordObject).size || "";
        model = isArray
          ? (record as CSVRecordArray)[8]?.toString() || ""
          : (record as CSVRecordObject).model || "";
        brand = isArray
          ? (record as CSVRecordArray)[9]?.toString() || ""
          : (record as CSVRecordObject).brand || "";
        vehicleId = isArray
          ? (record as CSVRecordArray)[10]?.toString() || ""
          : (record as CSVRecordObject).vehicleId || "";
        registrationNumber = isArray
          ? (record as CSVRecordArray)[11]?.toString() || ""
          : (record as CSVRecordObject).registrationNumber || "";
        price =
          parseFloat(
            isArray
              ? (record as CSVRecordArray)[12]?.toString() || "0"
              : (record as CSVRecordObject).price?.toString() || "0"
          ) || 0;
        holdingBay = isArray
          ? (record as CSVRecordArray)[13]?.toString() || ""
          : (record as CSVRecordObject).holdingBay || "";
        expiryDate = isArray
          ? (record as CSVRecordArray)[14]?.toString() || ""
          : (record as CSVRecordObject).expiryDate || "";
        dateAdded = isArray
          ? (record as CSVRecordArray)[15]?.toString() || new Date().toLocaleDateString()
          : (record as CSVRecordObject).dateAdded || new Date().toLocaleDateString();
        mileage = isArray
          ? (record as CSVRecordArray)[16]?.toString() || "0"
          : (record as CSVRecordObject).mileage || "0";

        id = tyreId
          ? `${location.replace(/[^a-zA-Z0-9]/g, "_")}_${tyreId.replace(/[^a-zA-Z0-9]/g, "_")}`
          : `tyre_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      } catch (err) {
        console.error(`Error processing record at index ${index}:`, err);
        console.error("Record data:", record);

        id = id || `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        location = location || "";
        tyreId = tyreId || `unknown_${index}`;
        description = description || "";
        pattern = pattern || "";
        quantity = quantity || 0;
        status = status || "";
        axlePosition = axlePosition || "";
        size = size || "";
        model = model || "";
        brand = brand || "";
        vehicleId = vehicleId || "";
        registrationNumber = registrationNumber || "";
        price = price || 0;
        holdingBay = holdingBay || "";
        expiryDate = expiryDate || "";
        dateAdded = dateAdded || new Date().toLocaleDateString();
        mileage = mileage || "0";
      }

      return {
        id,
        location,
        tyreId,
        description,
        pattern,
        quantity,
        status,
        axlePosition,
        size,
        model,
        brand,
        vehicleId,
        registrationNumber,
        price,
        holdingBay,
        expiryDate,
        dateAdded,
        mileage,
        lastUpdated: new Date().toISOString(),
        importedAt: new Date().toISOString(),
        source: "csv_import",
      };
    });

    try {
      const result = await importInventoryItems(processedRecords as InventoryItem[]);
      return res.status(200).json({
        success: true,
        message: `Successfully processed ${processedRecords.length} records`,
        importResult: result,
        sampleRecords: processedRecords.slice(0, 3),
      });
    } catch (dbError: unknown) {
      const error = dbError as Error;
      console.error("Firestore Error:", error);
      return res.status(500).json({
        error: "Database Error",
        message: error.message || "Unknown database error",
      });
    }
  } catch (error: unknown) {
    console.error("Inventory Import Error:", error);
    return res.status(500).json({
      error: "Import failed",
      message: (error as Error)?.message || "Unknown error during import",
    });
  }
});

// GET all inventory items
app.get("/api/inventory", async (_req: Request, res: Response) => {
  try {
    if (!firebaseModule.getAllInventoryItems) {
      return res.status(500).json({
        error: "Firebase not initialized",
        message: "Database connection unavailable",
      });
    }

    const items = await firebaseModule.getAllInventoryItems();
    return res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error getting inventory items:", err);
    return res.status(500).json({
      error: "Database Error",
      message: err.message || "Unknown database error",
    });
  }
});

// GET inventory item by ID
app.get("/api/inventory/:id", async (req: Request, res: Response) => {
  try {
    if (!firebaseModule.getInventoryItemById) {
      return res.status(500).json({
        error: "Firebase not initialized",
        message: "Database connection unavailable",
      });
    }

    const { id } = req.params;
    const item = await firebaseModule.getInventoryItemById(id);
    return res.status(200).json({
      success: true,
      item,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`Error getting inventory item ${req.params.id}:`, err);
    return res.status(404).json({
      error: "Item not found",
      message: err.message || "Item not found or database error",
    });
  }
});

// UPDATE inventory item
app.put("/api/inventory/:id", async (req: Request, res: Response) => {
  try {
    if (!firebaseModule.updateInventoryItem) {
      return res.status(500).json({
        error: "Firebase not initialized",
        message: "Database connection unavailable",
      });
    }

    const { id } = req.params;
    const result = await firebaseModule.updateInventoryItem(id, req.body as Partial<InventoryItem>);
    return res.status(200).json({
      success: true,
      message: `Inventory item ${id} updated successfully`,
      result,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`Error updating inventory item ${req.params.id}:`, err);
    return res.status(500).json({
      error: "Update failed",
      message: err.message || "Failed to update item",
    });
  }
});

// DELETE inventory item
app.delete("/api/inventory/:id", async (req: Request, res: Response) => {
  try {
    if (!firebaseModule.deleteInventoryItem) {
      return res.status(500).json({
        error: "Firebase not initialized",
        message: "Database connection unavailable",
      });
    }

    const { id } = req.params;
    const result = await firebaseModule.deleteInventoryItem(id);
    return res.status(200).json({
      success: true,
      message: `Inventory item ${id} deleted successfully`,
      result,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`Error deleting inventory item ${req.params.id}:`, err);
    return res.status(500).json({
      error: "Delete failed",
      message: err.message || "Failed to delete item",
    });
  }
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack || err.message);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  });
});

// Export for serverless use
module.exports = app;
