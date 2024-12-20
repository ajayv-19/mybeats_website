import { Request, Response } from "express";
import { UserModel } from "../models/userModel";

export class UserController {
  static async createUser(req: Request, res: Response) {
    try {
      const { name, email } = req.body;
      const user = await UserModel.create(name, email);
      res.json({ success: true, user });
    } catch (err) {
      console.error("[api/users]: Error creating user", err);
      res.status(500).json({ success: false, error: "Failed to create user" });
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UserModel.findAll();
      res.json({ success: true, users });
    } catch (err) {
      console.error("[api/users]: Error fetching users", err);
      res.status(500).json({ success: false, error: "Failed to fetch users" });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);
      
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      
      res.json({ success: true, user });
    } catch (err) {
      console.error("[api/users]: Error fetching user", err);
      res.status(500).json({ success: false, error: "Failed to fetch user" });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;
      const user = await UserModel.update(id, name, email);
      
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      
      res.json({ success: true, user });
    } catch (err) {
      console.error("[api/users]: Error updating user", err);
      res.status(500).json({ success: false, error: "Failed to update user" });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserModel.delete(id);
      
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      
      res.json({ success: true, user });
    } catch (err) {
      console.error("[api/users]: Error deleting user", err);
      res.status(500).json({ success: false, error: "Failed to delete user" });
    }
  }
}
