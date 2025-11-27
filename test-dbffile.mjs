import { DBFFile } from "dbffile";

const run = async () => {
  try {
    // Ruta correcta de tu DBF
    const dbf = await DBFFile.open("C:/BootDrv/Aloha/20250926/GNDTNDR.dbf");

    // Leer solo 5 registros de prueba
    const records = await dbf.readRecords(5);
    console.log("✅ Primeros registros del DBF:", records);
  } catch (err) {
    console.error("❌ Error leyendo DBF:", err);
  }
};

run();
