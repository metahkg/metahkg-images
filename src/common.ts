import dotenv from "dotenv";
import { MongoClient } from "mongodb";
dotenv.config();
export const mongouri = process.env.DB_URI || "mongodb://localhost";
export const client = new MongoClient(mongouri);
export const db = client.db("images");
export const imagesCl = db.collection("images");
