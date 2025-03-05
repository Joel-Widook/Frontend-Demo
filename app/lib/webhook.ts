import { NextApiRequest, NextApiResponse } from "next";
import { exec } from "child_process";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        try {
            // Ejecutar el script de construcción y subida a S3
            exec("npm run deploy", (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    return res.status(500).json({ message: "Build failed" });
                }
                if (stderr) {
                    console.error(`Stderr: ${stderr}`);
                    return res.status(500).json({ message: "Build failed" });
                }
                console.log(`Stdout: ${stdout}`);
                return res.status(200).json({ message: "Build and upload successful" });
            });
        } catch (error) {
            console.error("Error handling webhook:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}