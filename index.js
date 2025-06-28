import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}))
const port = process.env.PORT;

app.get('/',(req,res)=>{
    res.send("Hello world!");
})

app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
});