import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const corsMiddleware = cors({
    origin: "*",
    credentials: true,
})

const jsonMiddleware = express.json();
const urlMiddleware = express.urlencoded({ extended: false });
const cookieMiddleware = cookieParser();

// Exports
export default [
    cookieMiddleware,
    corsMiddleware,
    jsonMiddleware,
    urlMiddleware,
]