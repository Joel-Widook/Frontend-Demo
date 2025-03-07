// Script para manejar el despliegue desde el webhook
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";

// Configuración
const PROJECT_ROOT = process.cwd();
const LOG_FILE = path.join(PROJECT_ROOT, "webhook-deploy-logs.txt");

// Asegurarse de que el archivo de log exista
try {
  if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, `[${new Date().toISOString()}] Log file created\n`);
    console.log(`Archivo de log creado en: ${LOG_FILE}`);
  }
} catch (error) {
  console.error(`Error al crear el archivo de log: ${error}`);
}

// Función para escribir en el archivo de log
const logToFile = (message: string): void => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logMessage);
  console.log(message); // También mostrar en la consola
};

// Función principal
async function runDeploy(): Promise<void> {
  logToFile("=== INICIANDO PROCESO DE DESPLIEGUE ===");
  logToFile(`Directorio de trabajo: ${PROJECT_ROOT}`);
  
  try {
    // Ejecutar el comando de despliegue
    logToFile("Ejecutando npm run deploy...");
    
    const deployProcess = exec("npm run deploy", { 
      cwd: PROJECT_ROOT,
      env: { ...process.env, PATH: process.env.PATH }
    });
    
    // Capturar toda la salida
    let stdoutBuffer = "";
    let stderrBuffer = "";
    
    deployProcess.stdout?.on("data", (data: string) => {
      // Usar la variable para evitar el error de ESLint
      stdoutBuffer = `${stdoutBuffer}${data}`;
      logToFile(`STDOUT: ${data.trim()}`);
    });
    
    deployProcess.stderr?.on("data", (data: string) => {
      // Usar la variable para evitar el error de ESLint
      stderrBuffer = `${stderrBuffer}${data}`;
      logToFile(`STDERR: ${data.trim()}`);
    });
    
    // Manejar errores y finalización
    return new Promise<void>((resolve, reject) => {
      deployProcess.on("error", (error: Error) => {
        logToFile(`ERROR: ${error.message}`);
        reject(error);
      });
      
      deployProcess.on("close", (code: number | null) => {
        logToFile(`Proceso finalizado con código: ${code}`);
        
        if (code !== 0) {
          logToFile("DESPLIEGUE FALLIDO");
          if (stderrBuffer) {
            logToFile(`Detalles del error: ${stderrBuffer}`);
          }
          reject(new Error(`Proceso finalizado con código: ${code}`));
        } else {
          logToFile("DESPLIEGUE COMPLETADO EXITOSAMENTE");
          resolve();
        }
      });
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logToFile(`ERROR FATAL: ${errorMessage}`);
    throw error;
  }
}

// Ejecutar el despliegue
runDeploy()
  .then(() => {
    logToFile("Script de despliegue finalizado correctamente");
    process.exit(0);
  })
  .catch((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logToFile(`Script de despliegue finalizado con error: ${errorMessage}`);
    process.exit(1);
  });
