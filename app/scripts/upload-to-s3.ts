import { S3Client, PutObjectCommand, ListObjectsCommand, DeleteObjectsCommand, ObjectIdentifier } from "@aws-sdk/client-s3";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

const REGION = process.env.AWS_REGION;
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

if (!REGION || !BUCKET_NAME || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("Missing required environment variables for AWS S3.");
}

const s3Client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const FOLDER_TO_UPLOAD = "out/news";
const S3_FOLDER = "news";

async function uploadFile(filePath: string, s3Key: string): Promise<void> {
    const fileContent = fs.readFileSync(filePath);

    const params = {
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fileContent,
        ContentType: "text/html",
    };
    console.log(`Uploading file: ${filePath} to S3 key: ${s3Key}`);
    try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        console.log(`File ${filePath} uploaded successfully to ${s3Key}`);
    } catch (err) {
        console.error(`Error uploading file ${filePath} to ${s3Key}`, err);
        throw err; // Propagate the error to be handled in the main function
    }
}

async function listS3Objects(): Promise<string[]> {
    const params = {
        Bucket: BUCKET_NAME,
        Prefix: S3_FOLDER,
    };
    console.log(`Listing S3 objects with prefix: ${S3_FOLDER}`);
    try {
        const command = new ListObjectsCommand(params);
        const data = await s3Client.send(command);
        console.log("S3 objects:",data.Contents);
        return data.Contents ? data.Contents.map(obj => obj.Key).filter((key): key is string => key !== undefined) : [];
    } catch (err) {
        console.error("Error listing S3 objects", err);
        return [];
    }
}

async function uploadDirectory(dir: string, s3Folder: string = ""): Promise<void> {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const s3Key = path.join(s3Folder, file).replace(/\\/g, "/");
        const fileStat = fs.statSync(filePath);

        if (fileStat.isDirectory()) {
            console.log(`Entering directory: ${filePath}`);
            await uploadDirectory(filePath, s3Key);
        } else {
            await uploadFile(filePath, s3Key);
        }
    }
}
//usamos ObjectIdentifier para tipar los datos a eliminar.
async function deleteMultipleFiles(s3Keys: ObjectIdentifier[]): Promise<void> {
    if(s3Keys.length === 0) {
        console.log("No files to delete.");
        return;
    }
    const deleteParams = {
        Bucket: BUCKET_NAME,
        Delete: {
            Objects: s3Keys,
        },
    };
    console.log("Deleting multiple files in S3:", s3Keys);
    try {
        // Eliminar varios archivos
        const command = new DeleteObjectsCommand(deleteParams);
        await s3Client.send(command);
        console.log("Multiple files deleted successfully");
    } catch (err) {
        console.error("Error deleting multiple files", err);
        throw err;
    }
}

async function main(): Promise<void> {
    console.log("Upload started");
    try {
        const s3Objects = await listS3Objects();
        const localFiles: string[] = [];

        const getLocalFiles = (dir: string): void => {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const filePath = path.join(dir, file);
                const fileStat = fs.statSync(filePath);

                if (fileStat.isDirectory()) {
                    getLocalFiles(filePath);
                } else {
                    localFiles.push(filePath.replace(/\\/g, "/"));
                }
            }
        };

        getLocalFiles(FOLDER_TO_UPLOAD);
        await uploadDirectory(FOLDER_TO_UPLOAD, S3_FOLDER);

        // Usar un array para guardar los archivos a eliminar
        const filesToDelete: ObjectIdentifier[] = [];
        for (const fileS3 of s3Objects) {
            if (fileS3) {
                const aux = fileS3.split("/").slice(1).join("/");
                if (!localFiles.includes(`${FOLDER_TO_UPLOAD}/${aux}`)) {
                    filesToDelete.push({ Key: fileS3 });
                }
            }
        }

        // Eliminar todos los archivos a la vez
        await deleteMultipleFiles(filesToDelete);

        console.log("Upload finished");
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main();
