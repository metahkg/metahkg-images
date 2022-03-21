import dotenv from "dotenv";
import { MongoClient } from "mongodb";
dotenv.config();
export const mongouri = process.env.mongouri || "mongodb://localhost";
export const client = new MongoClient(mongouri);