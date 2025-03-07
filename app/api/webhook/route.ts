import { NextResponse } from "next/server";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

// Directorio donde se ejecutará el comando
const PROJECT_ROOT = process.cwd();
// Archivo de log para depuración
const LOG_FILE = path.join(PROJECT_ROOT, "webhook-logs.txt");

// Función para escribir en el archivo de log
const logToFile = (message: string) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  try {
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (error) {
    console.error(`Error writing to log file: ${error}`);
  }
};

// Asegurarse de que el archivo de log exista
try {
  if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, `[${new Date().toISOString()}] Log file created\n`);
  }
} catch (error) {
  console.error(`Error creating log file: ${error}`);
}

export const POST = async (request: Request) => {
  const timestamp = new Date().toISOString();
  console.log(`Webhook received at ${timestamp}. Starting deploy process...`);
  
  try {
    logToFile(`Webhook received at ${timestamp}`);
    
    // Obtener el cuerpo del webhook para registrarlo
    const body = await request.json().catch(() => ({}));
    logToFile(`Webhook payload: ${JSON.stringify(body, null, 2)}`);
    
    // Responder inmediatamente al webhook para evitar timeouts
    // Ejecutar el script de despliegue en segundo plano usando el comando npm
    logToFile(`Executing npm run webhook-deploy`);
    
    // Usar spawn en lugar de exec para mejor manejo de procesos
    const deployProcess = spawn("npm", ["run", "webhook-deploy"], {
      detached: true, // Ejecutar en segundo plano
      stdio: "ignore", // No vincular a la entrada/salida del proceso padre
      cwd: PROJECT_ROOT,
    });
    
    // Desconectar el proceso hijo para que pueda ejecutarse independientemente
    deployProcess.unref();
    
    logToFile(`Deploy process started with PID: ${deployProcess.pid}`);
    logToFile("Webhook procesado correctamente");
    
    // Responder inmediatamente con éxito
    return NextResponse.json({
      message: "Webhook received. Deploy process started in background.",
      timestamp: timestamp,
      processId: deployProcess.pid
    }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logToFile(`Error handling webhook: ${errorMessage}`);
    console.error("Error handling webhook:", error);
    return NextResponse.json({ 
      success: false,
      message: "Internal server error", 
      error: errorMessage 
    }, { status: 500 });
  }
};
