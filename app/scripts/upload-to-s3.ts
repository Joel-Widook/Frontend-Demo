import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from "@aws-sdk/client-s3";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import "dotenv/config";

// Configuración de AWS S3 usando las variables de entorno

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },

    region: process.env.AWS_REGION as string,
});

// Función para subir un archivo a S3
const uploadFile = async (filePath: string, key: string): Promise<void> => {
    const fileContent = readFileSync(filePath);

    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: fileContent,
    };

    try {
        const data = await new Upload({
            client: s3,
            params,
        }).done();
        console.log(`File uploaded successfully. ${data.Location}`);
    } catch (err) {
        console.error(`Error uploading file ${key}:`, err);
        throw err; // Relanzar el error para manejarlo en un nivel superior
    }
};

// Función para subir todos los archivos a S3
const uploadFilesToS3 = async (): Promise<void> => {
    const buildDir = join(__dirname, "../../out/news"); // Directorio de construcción de Next.js
    const files = readdirSync(buildDir);

    try {
        // Subir archivos en paralelo
        await Promise.all(files.map(async (file) => {
            const filePath = join(buildDir, file);
            // Construir la clave para S3 (manteniendo la estructura de news/[article])
            const key = `news/${file}`;
            await uploadFile(filePath, key);
        }));

        console.log("All files in news uploaded successfully.");
    } catch (err) {
        console.error("Error uploading files:", err);
        throw err; // Relanzar el error para manejarlo en un nivel superior
    }
};

// Ejecutar la función principal
uploadFilesToS3().catch((err) => {
    console.error("Error in upload process:", err);
    process.exit(1); // Salir con código de error
});