const { app, BrowserWindow } = require("electron");

let mainWindow;

function createWindow() {
  console.log("📂 Creando ventana...");

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false, // 👈 primero oculta
    autoHideMenuBar: true, // 👈 oculta barra superior
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // 🚀 Carga Google (después pondremos tu dist/index.html)
  mainWindow.loadURL("https://google.com");

  // 👇 mostrar ventana cuando esté lista
  mainWindow.once("ready-to-show", () => {
    console.log("✅ Ventana lista → mostrándola");
    mainWindow.show();      // 👈 aquí la forzamos a mostrarse
    mainWindow.focus();     // 👈 y le damos foco
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  console.log("⚡ Evento ready ejecutado");
  createWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});
