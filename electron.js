const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let backend;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // 🔹 Aquí cargamos el build de React
  mainWindow.loadFile(path.join(__dirname, "dist/index.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", () => {
  // 🔹 Levantar backend automáticamente
  backend = spawn("node", ["server.js"], {
    cwd: __dirname,
    shell: true,
  });

  backend.stdout.on("data", (data) => {
    console.log(`Backend: ${data}`);
  });

  backend.stderr.on("data", (data) => {
    console.error(`Backend error: ${data}`);
  });

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
  if (backend) backend.kill();
});

