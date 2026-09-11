import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

/**
 * User Module Routes
 * Base Path: /api/users
 */
router.use(requireAuth);

router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.patch("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

export default router;
