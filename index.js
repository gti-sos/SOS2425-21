import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { loadBackendAGB } from "./src/back/public-transit.js";
import { loadBackendPRG } from "./src/back/cultural-event.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 16078;

const BASE_API = "/api/v1";
app.use(express.json());
app.use("/", express.static(__dirname));

app.get("/", (request, response) => {
  response.send(`Este es el servidor del <a href="/about">grupo 21</a><br>
        <a href="https://sos2425-21.onrender.com/api/v1/public-transit-stats">API Andrea Gómez</a><br>
        <a href="https://sos2425-21.onrender.com/api/v1/cultural-events">API Paula Ruiz</a><br>
        <a href="">API Laura Eraso</a><br>`);
});

loadBackendAGB(app);
loadBackendPRG(app); // 👈 NUEVA LÍNEA

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// //====================================================================================

// //LEL
// const calcularMediaLEL = require("./samples/LEL/index-LEL.js");
// let homeBuyingSellingStats = [];
// app.get("/samples/LEL", async (request, response) => {
//     const prov = "Madrid";
//     try {
//         const media = await calcularMediaLEL(prov);
//         response.send(`<!DOCTYPE html>
//             <html lang="en">
//             <head>
//                 <meta charset="UTF-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                 <title>INDEX-LEL</title>
//             </head>
//             <body>
//                 <h1>INDEX-LEL</h1>
//                 <p id="res">Media de transacciones en ${prov}: ${media.toFixed(2)}</p><br>
//                 <a href="/">Volver</a>
//             </body>
//             </html>`);
//     } catch (error) {
//         console.error("Error al calcular la media:", error);
//         response.status(500).send("Error interno del servidor.");
//     }
// });

// //L05 - LEL
// const RESOURCE_LEL = "home-buying-selling-stats";
// // Función para leer datos del CSV
// const readCSVDataLEL = () => {
//     return new Promise((resolve, reject) => {
//         const results = [];
//         fs.createReadStream("samples/LEL/SOS2425-21-Propuesta - Laura.csv")
//             .pipe(csv())
//             .on("data", (row) => {
//                 try {
//                     const formattedRow = {
//                         year: parseInt(row.year),
//                         province: row.province,
//                         transaction_total: parseInt(row.transaction_total.replace(/\D/g, "")),
//                         transaction_protected_housing: parseInt(row.transaction_protected_housing.replace(/\D/g, "")),
//                         transaction_new_housing: parseInt(row.transaction_new_housing.replace(/\D/g, "")),
//                         transaction_secondhand_housing: parseInt(row.transaction_secondhand_housing.replace(/\D/g, ""))
//                     };
//                     results.push(formattedRow);
//                 } catch (error) {
//                     console.error("Error procesando fila:", row, error);
//                 }
//             })
//             .on("end", () => resolve(results))
//             .on("error", (err) => reject(err));
//     });
// };
// // Endpoint para cargar los datos iniciales desde el CSV
// app.get(`${BASE_API}/${RESOURCE_LEL}/loadInitialData`, async (req, res) => {
//     if (homeBuyingSellingStats.length > 0) {
//         return res.status(409).json({ error: "Los datos ya están cargados." });
//     }

//     try {
//         homeBuyingSellingStats = await readCSVDataLEL();
//         res.status(201).json({ message: "Datos iniciales cargados correctamente." });
//     } catch (error) {
//         console.error("Error al leer CSV:", error);
//         res.status(500).json({ error: "Error interno al cargar los datos." });
//     }
// });

// // GET - Obtener todos los datos
// app.get(`${BASE_API}/${RESOURCE_LEL}`, (req, res) => {
//     res.status(200).json(homeBuyingSellingStats);
// });

// // GET - Obtener datos de una provincia específica
// app.get(`${BASE_API}/${RESOURCE_LEL}/:province`, (req, res) => {
//     const { province } = req.params;
//     const result = homeBuyingSellingStats.find(item => item.province.toLowerCase() === province.toLowerCase());

//     if (result) {
//         res.status(200).json(result);
//     } else {
//         res.status(404).json({ error: "Provincia no encontrada." });
//     }
// });

// // POST - Agregar un nuevo dato
// app.post(`${BASE_API}/${RESOURCE_LEL}`, (req, res) => {
//     const newData = req.body;

//     if (!newData.year || !newData.province || !newData.transaction_total || !newData.transaction_protected_housing || !newData.transaction_new_housing || !newData.transaction_secondhand_housing) {
//         return res.status(400).json({ error: "Faltan campos requeridos." });
//     }

//     if (homeBuyingSellingStats.some(item => item.province.toLowerCase() === newData.province.toLowerCase())) {
//         return res.status(409).json({ error: "El recurso ya existe." });
//     }

//     homeBuyingSellingStats.push(newData);
//     res.status(201).json(newData);
// });

// // PUT - Actualizar datos de una provincia
// app.put(`${BASE_API}/${RESOURCE_LEL}/:province`, (req, res) => {
//     const { province } = req.params;
//     const newData = req.body;

//     if (!newData.year || !newData.province || !newData.transaction_total || !newData.transaction_protected_housing || !newData.transaction_new_housing || !newData.transaction_secondhand_housing) {
//         return res.status(400).json({ error: "Faltan campos requeridos." });
//     }

//     if (newData.province.toLowerCase() !== province.toLowerCase()) {
//         return res.status(400).json({ error: "El ID de la URL y del cuerpo deben coincidir." });
//     }

//     const index = homeBuyingSellingStats.findIndex(item => item.province.toLowerCase() === province.toLowerCase());

//     if (index !== -1) {
//         homeBuyingSellingStats[index] = newData;
//         res.status(200).json(newData);
//     } else {
//         res.status(404).json({ error: "Provincia no encontrada." });
//     }
// });

// // DELETE - Eliminar todos los datos
// app.delete(`${BASE_API}/${RESOURCE_LEL}`, (req, res) => {
//     homeBuyingSellingStats = [];
//     res.status(200).json({ message: "Todos los datos han sido eliminados." });
// });

// // DELETE - Eliminar una provincia específica
// app.delete(`${BASE_API}/${RESOURCE_LEL}/:province`, (req, res) => {
//     const province = req.params.province.trim().toLowerCase(); // Elimina espacios y normaliza a minúsculas
//     const index = homeBuyingSellingStats.findIndex(item => item.province.trim().toLowerCase() === province);

//     if (index !== -1) {
//         homeBuyingSellingStats.splice(index, 1);
//         res.status(200).json({ message: `Datos de ${province} eliminados correctamente.` });
//     } else {
//         res.status(404).json({ error: `Provincia '${province}' no encontrada.` });
//     }
// });

// // Manejo de métodos no permitidos
// app.all(`${BASE_API}/${RESOURCE_LEL}`, (req, res) => {
//     if (!["GET", "POST", "DELETE"].includes(req.method)) {
//         return res.status(405).json({ error: "Método no permitido." });
//     }
// });

// app.all(`${BASE_API}/${RESOURCE_LEL}/:province`, (req, res) => {
//     if (!["GET", "PUT", "DELETE"].includes(req.method)) {
//         return res.status(405).json({ error: "Método no permitido." });
//     }
// });
