import { Router, Request, Response } from 'express';
import { requiresAuth } from "../ApiServer";
import Server from "../../models/Server";

const router = Router();

router.post('/create', requiresAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const { serverName, serverIP, serverPort } = req.body; // TODO: Validation

        if (!serverName || !serverIP || !serverPort) {
            res.status(400).json({ error: "All fields are required" });
            return;
        }

        await new Server({
            name: serverName,
            ip: serverIP,
            port: serverPort
        }).save();

        res.status(201).json({ message: "Server created successfully" });
        return;
    } catch (error) {
        console.error("Error creating server:", error);
        res.status(500).json({ error: "An error occurred while creating the server" });
    }
});

export default router;