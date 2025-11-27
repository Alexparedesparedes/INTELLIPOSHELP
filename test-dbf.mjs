import { DBFFile } from "dbffile";

const run = async () => {
  try {
    const dbf = await DBFFile.open("C:/BootDrv/Aloha/20250927/VENTAS.DBF");
    const records = await dbf.readRecords(5); // lee solo 5
    console.log("✅ Primeros registros:", records);
  } catch (err) {
    console.error("❌ Error leyendo DBF:", err);
  }
};

run();
