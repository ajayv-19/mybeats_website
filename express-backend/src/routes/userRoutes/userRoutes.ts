import { Router, Request, Response } from "express";
import { UserController } from "../../controllers/userController";

const router = Router();

router.post("/", (req: Request, res: Response) => UserController.createUser(req, res));
router.get("/", (req: Request, res: Response) => UserController.getAllUsers(req, res));


export default router;
