import express from "express";
import {nanoid} from "nanoid"
import dotenv from "dotenv"
import { initDb } from "./src/config/db.js"
import short_url from "./src/routes/short_url.route.js"
import user_routes from "./src/routes/user.routes.js"
import auth_routes from "./src/routes/auth.routes.js"
import { redirectFromShortUrl } from "./src/controller/short_url.controller.js";
import { errorHandler } from "./src/utils/errorHandler.js";
import cors from "cors"
import { attachUser } from "./src/utils/attachUser.js";
import cookieParser from "cookie-parser"

dotenv.config({ path: "./.env" })

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173', // your React app
    credentials: true // 👈 this allows cookies to be sent
}));

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.use(attachUser)

app.use("/api/user",user_routes)
app.use("/api/auth",auth_routes)
app.use("/api/create",short_url)
// Health check for deployment platforms
app.get("/healthz", (req, res) => res.status(200).send("ok"))
app.get("/:id",redirectFromShortUrl)

app.use(errorHandler)

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    initDb().then(()=>{
        console.log("Postgres schema ensured.")
    }).catch((e)=>{
        console.error("Postgres init failed", e)
        process.exit(1)
    })
    console.log(`Server is running on http://localhost:${PORT}`);
})

// GET - Redirection 
