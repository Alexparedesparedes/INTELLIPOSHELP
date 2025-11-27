import express from "express";
import cors from "cors";
import sql from "mssql";
import { DBFFile } from "dbffile";

const app = express();
app.use(cors());

// Configuración de conexión a SQL Server
const dbConfig = {
  user: "sa",
  password: "Soporte23",
  server: "localhost\\SQLEXPRESS",
  database: "DBFISCAL_PERU",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Ruta comparar
app.get("/comparar", async (req, res) => {
  const { fecha } = req.query;
  if (!fecha) {
    return res.status(400).json({ error: "Falta el parámetro fecha" });
  }

  try {
    // 🔹 Leer archivo DBF de Aloha
    const dbfPath = `C:\\BootDrv\\Aloha\\${fecha.replace(/-/g, "")}\\GNDTNDR.dbf`;
    const dbf = await DBFFile.open(dbfPath, { encoding: "utf-8" });
    const records = await dbf.readRecords();

    // 🔹 Filtrar SOLO TYPE = 1
    const filtrados = records.filter((r) => r.TYPE === 1);

    // 🔹 Agrupar por CHECK consolidando AMOUNT
    const agrupados = {};
    filtrados.forEach((r) => {
      const check = r.CHECK;
      if (!agrupados[check]) {
        agrupados[check] = {
          CHECK: r.CHECK,
          DATE: r.DATE,
          AMOUNT: 0,
          EMPLOYEE: r.EMPLOYEE,
          NAME: r.NAME,
        };
      }
      agrupados[check].AMOUNT += Number(r.AMOUNT) || 0;
    });

    // 🔹 Convertir a array limpio
    const datosAloha = Object.values(agrupados).map((item) => ({
      CHECK: item.CHECK,
      DATE: item.DATE,
      AMOUNT: item.AMOUNT,
      EMPLOYEE: item.EMPLOYEE,
      NAME: item.NAME,
    }));

    // 🔹 Consultar SQL Server con ajuste de Tipo
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("fecha", sql.Date, fecha)
      .query(`
        SELECT 
          CheckNumber, 
          DOB, 
          CASE 
            WHEN Tipo IN (7,8) THEN VentaTotal * -1 
            ELSE VentaTotal 
          END AS VentaTotal
        FROM HInvoice
        WHERE CAST(DOB AS DATE) = @fecha
      `);

    const datosSQL = result.recordset;

    // 🔹 Comparar Aloha vs Intellipos
    const comparacion = datosAloha.map((aloha) => {
      const sqlRow = datosSQL.find((row) => row.CheckNumber == aloha.CHECK);

      if (sqlRow) {
        const dif = Number(aloha.AMOUNT) - Number(sqlRow.VentaTotal || 0);
        return {
          checkAloha: aloha.CHECK,
          importeAloha: Number(aloha.AMOUNT),
          checkIntellipos: sqlRow.CheckNumber,
          importeIntellipos: Number(sqlRow.VentaTotal || 0),
          diferencia: dif,
        };
      } else {
        return {
          checkAloha: aloha.CHECK,
          importeAloha: Number(aloha.AMOUNT),
          checkIntellipos: null,
          importeIntellipos: 0,
          diferencia: Number(aloha.AMOUNT),
        };
      }
    });

    res.json(comparacion);
  } catch (err) {
    console.error("❌ Error al comparar datos:", err);
    res.status(500).json({ error: "Error al comparar datos", detalle: err.message });
  }
});

// Iniciar servidor
app.listen(4000, () => {
  console.log("✅ Servidor backend corriendo en http://localhost:4000");
});
