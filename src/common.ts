import dotenv from "dotenv";
dotenv.config();
export const mongouri = process.env.mongouri || "mongodb://localhost";
