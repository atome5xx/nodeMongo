import express from "express";
const router = express.Router();
import userController from "../controller/userController.js";

router.get('/:id', security, securityId, userController.getProfile);

router.put('/', security, securityId, userController.updateUser);

router.delete("/:id", security, securityId, userController.deleteUser);

router.delete("/Favoris", security, securityId, userController.delEmprunt);

router.post('/Favoris', security, securityId, userController.addEmprunt);

router.get('/Favoris/:id', security, securityId, userController.affEmprunt);

export default router;