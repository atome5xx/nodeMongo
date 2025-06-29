import express from "express";
const router = express.Router();
import userController from "../controller/userController.js";
import security from "../middleware/authMiddleware.js";
import securityId from "../middleware/idMiddleware.js";
import securityAdmin from "../middleware/adminMiddleware.js";

router.get('/:id', security, securityId, userController.getProfile);

router.put('/:id', security, securityId, userController.updateUser);

router.delete("/:id", security, securityId, userController.deleteUser);

router.delete("/Emprunt", security, securityId, userController.delEmprunt);

router.post('/Emprunt', security, securityId, userController.addEmprunt);

router.get('/Emprunt/:id', security, securityId, userController.affEmprunt);

router.get('/edit/:id', security, userController.showEditForm)

export default router;