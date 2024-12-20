import { Request, Response } from "express";
import { CompanyModel } from "../models/companyModel";

export class CompanyController {
  static async getCompanyByEmail(req: Request, res: Response) {
    try {
      const email = req.query.email as string;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: "Missing 'email' parameter in request",
        });
      }

      const company = await CompanyModel.findByEmail(email);

      if (!company) {
        return res.status(404).json({
          success: false,
          error: "No company found for the provided email",
        });
      }

      res.json({
        success: true,
        data: company,
        message: "Company found successfully",
      });
    } catch (err) {
      console.error("[api/company]: Error fetching company", err);
      res.status(500).json({
        success: false,
        error: "Failed to fetch company",
        details: err,
      });
    }
  }

  static async health(req: Request, res: Response) {
    res.json({
      success: true,
      message: "Company service is healthy",
    });
  }
}
