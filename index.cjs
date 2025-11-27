#!/usr/bin/env node
(async () => {
  try {
    // Importar de forma dinámica tu servidor
    const { default: startServer } = await import("./server.js");
    if (typeof startServer === "function") {
      await startServer();
    } else {
      console.log("✅ Servidor cargado correctamente desde server.js");
    }
  } catch (err) {
    console.error("❌ Error al iniciar servidor:", err);
  }
})();
