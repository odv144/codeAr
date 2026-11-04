import { generarRespuestaChat } from "../services/chatService.js";

export const procesarMensajeChat = async (req, res, next) => {
    try {
        const { mensaje } = req.body || {};

        if (!mensaje || typeof mensaje !== "string" || !mensaje.trim()) {
            return res.status(400).json({ error: "El campo 'mensaje' es obligatorio y debe ser un texto válido." });
        }

        const respuesta = await generarRespuestaChat(mensaje.trim());

        return res.status(200).json({
            respuesta
        });
    } catch (error) {
        console.error("Error en chatController:", error);
        return res.status(500).json({
            error: error.message || "Error interno al procesar el mensaje con el asistente."
        });
    }
};
