import { Router, Request, Response } from "express";
import { CompanyController } from "../controllers/companyController";

const router = Router();

router.get("/get-company-by-email", async (req: Request, res: Response) => {
  await CompanyController.getCompanyByEmail(req, res);
});

router.get("/health", async (req: Request, res: Response) => {
  await CompanyController.health(req, res);
});

export default router;
