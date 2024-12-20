import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import client from "./config/database";
import userRoutes from "./routes/userRoutes/userRoutes";
import companyRoutes from "./routes/companyRoute";


dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000;

app.use(express.json());

// Connect to the database
client
  .connect()
  .then(() => {
    console.log("[database]: Connected to the PostgreSQL database successfully");
  })
  .catch((err) => {
    console.error("[database]: Failed to connect to the database", err);
    process.exit(1);
  });

// Middleware for logging
app.use((req: Request, res: Response, next) => {
  console.log(`[request]: ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/company", companyRoutes);


app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

// Start server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});