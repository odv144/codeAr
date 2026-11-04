import express from "express";
import { procesarMensajeChat } from "../controllers/chatController.js";

const router = express.Router();

router.post("/", procesarMensajeChat);

export default router;
