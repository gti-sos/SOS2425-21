
const express = require('express');
const cool = require('cool-ascii-faces');
const app = express();
const PORT = process.env.PORT || 16078;

const BASE_API="/api/v1";

app.use("/",express.static(__dirname));

app.get('/', (request, response) => {
    response.send(`Este es el servidor del <a href="/about">grupo 21</a><br>
        <a href="/cool">Cool</a><br>
        <a href="/samples/LEL">Algoritmo LEL</a><br>
        <a href="/samples/AGB">Algoritmo AGB</a><br>
        <a href="/samples/PRG">Algoritmo PRG</a>`);  
});


app.get('/cool', (req, res) => {
    let caritas = cool();
    res.send(`${caritas}<br><a href="/">Volver</a>`);
});



//AGB
const calcularMedia = require("./samples/AGB/index-AGB.js");
let publicTransitStats = [];

app.get("/samples/AGB", async (request, response) => {
    const prov = "Madrid";
    try {
        const media = await calcularMedia(prov);
        response.send(`<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>INDEX-AGB</title>
            </head>
            <body>
                <h1>INDEX-AGB</h1>
                <p id="res">Media de total_trips en ${prov}: ${media.toFixed(2)}</p><br>
                <a href="/">Volver</a>   
            </body>
            </html>`);
    } catch (error) {
        console.error("Error al calcular la media:", error);
        response.status(500).send("Error interno del servidor.");
    }
});

app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});

//L05
const RESOURCE = "public-transit-stats";
// Función para leer datos del CSV
const readCSVData = () => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream("samples/AGB/SOS2425-21-Propuesta - Andrea.csv")
            .pipe(csv())
            .on("data", (row) => {
                try {
                    const formattedRow = {
                        year: parseInt(row.year),
                        province: row.province,
                        ticket_price: parseFloat(row.ticket_price.replace(",", ".")),
                        total_trips: parseInt(row.total_trips.replace(/\D/g, "")),
                        route_length: parseFloat(row.route_length.replace(",", "."))
                    };
                    results.push(formattedRow);
                } catch (error) {
                    console.error("Error procesando fila:", row, error);
                }
            })
            .on("end", () => resolve(results))
            .on("error", (err) => reject(err));
    });
};

// Endpoint para cargar los datos iniciales desde el CSV
app.get(`${BASE_API}/${RESOURCE}/loadInitialData`, async (req, res) => {
    if (publicTransitStats.length > 0) {
        return res.status(409).json({ error: "Los datos ya están cargados." });
    }

    try {
        publicTransitStats = await readCSVData();
        res.status(201).json({ message: "Datos iniciales cargados correctamente." });
    } catch (error) {
        console.error("Error al leer CSV:", error);
        res.status(500).json({ error: "Error interno al cargar los datos." });
    }
});

// GET - Obtener todos los datos
app.get(`${BASE_API}/${RESOURCE}`, (req, res) => {
    res.status(200).json(publicTransitStats);
});

// GET - Obtener datos de una provincia específica
app.get(`${BASE_API}/${RESOURCE}/:province`, (req, res) => {
    const { province } = req.params;
    const result = publicTransitStats.find(item => item.province.toLowerCase() === province.toLowerCase());

    if (result) {
        res.status(200).json(result);
    } else {
        res.status(404).json({ error: "Provincia no encontrada." });
    }
});

// POST - Agregar un nuevo dato
app.post(`${BASE_API}/${RESOURCE}`, (req, res) => {
    const newData = req.body;

    if (!newData.year || !newData.province || !newData.ticket_price || !newData.total_trips || !newData.route_length) {
        return res.status(400).json({ error: "Faltan campos requeridos." });
    }

    if (publicTransitStats.some(item => item.province.toLowerCase() === newData.province.toLowerCase())) {
        return res.status(409).json({ error: "El recurso ya existe." });
    }

    publicTransitStats.push(newData);
    res.status(201).json(newData);
});

// PUT - Actualizar datos de una provincia
app.put(`${BASE_API}/${RESOURCE}/:province`, (req, res) => {
    const { province } = req.params;
    const newData = req.body;

    if (!newData.year || !newData.province || !newData.ticket_price || !newData.total_trips || !newData.route_length) {
        return res.status(400).json({ error: "Faltan campos requeridos." });
    }

    if (newData.province.toLowerCase() !== province.toLowerCase()) {
        return res.status(400).json({ error: "El ID de la URL y del cuerpo deben coincidir." });
    }

    const index = publicTransitStats.findIndex(item => item.province.toLowerCase() === province.toLowerCase());

    if (index !== -1) {
        publicTransitStats[index] = newData;
        res.status(200).json(newData);
    } else {
        res.status(404).json({ error: "Provincia no encontrada." });
    }
});

// DELETE - Eliminar todos los datos
app.delete(`${BASE_API}/${RESOURCE}`, (req, res) => {
    publicTransitStats = [];
    res.status(200).json({ message: "Todos los datos han sido eliminados." });
});

// DELETE - Eliminar una provincia específica
app.delete(`${BASE_API}/${RESOURCE}/:province`, (req, res) => {
    const { province } = req.params;
    const index = publicTransitStats.findIndex(item => item.province.toLowerCase() === province.toLowerCase());

    if (index !== -1) {
        publicTransitStats.splice(index, 1);
        res.status(200).json({ message: `Datos de ${province} eliminados correctamente.` });
    } else {
        res.status(404).json({ error: "Provincia no encontrada." });
    }
});

// Manejo de métodos no permitidos
app.all(`${BASE_API}/${RESOURCE}`, (req, res) => {
    if (!["GET", "POST", "DELETE"].includes(req.method)) {
        return res.status(405).json({ error: "Método no permitido." });
    }
});

app.all(`${BASE_API}/${RESOURCE}/:province`, (req, res) => {
    if (!["GET", "PUT", "DELETE"].includes(req.method)) {
        return res.status(405).json({ error: "Método no permitido." });
    }
});


//====================================================================================

// PRG - NUEVO CÓDIGO AGREGADO
const fs = require("fs");
const csv = require("csv-parser");

app.get("/samples/PRG", (req, res) => {
    const results = [];
    fs.createReadStream("samples/PRG/SOS2425-21-Propuesta - Paula.csv")
        .pipe(csv())
        .on("data", (row) => {
            results.push(row);
        })
        .on("end", () => {
            const targetProvince = "alicante";
            const field = "total_event";  // ✅ Usa un campo existente del CSV

            const filteredRows = results.filter(
                row => row.province.trim().toLowerCase() === targetProvince.toLowerCase()
            );

            const numericValues = filteredRows
                .map(row => parseFloat(row[field].replace(/,/g, "")))  // ✅ Limpia las comas en los números
                .filter(value => !isNaN(value));

            const sum = numericValues.reduce((acc, val) => acc + val, 0);
            const mean = numericValues.length > 0 ? sum / numericValues.length : 0;

            res.send(`<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>INDEX-PRG</title>
                </head>
                <body>
                    <h1>INDEX-PRG</h1>
                    <p id="res">Media de ${field} en ${targetProvince}: ${mean.toFixed(2)}</p><br>
                    <a href="/">Volver</a>   
                </body>
                </html>`);
        })
        .on("error", (err) => {
            console.error("Error al procesar el CSV:", err);
            res.status(500).send("Error al procesar el archivo CSV.");
        });
});

//LEL
const calcularMediaLEL = require("./samples/LEL/index-LEL.js");
app.get("/samples/LEL", async (request, response) => {
    const prov = "Madrid";
    try {
        const media = await calcularMediaLEL(prov);
        response.send(`<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>INDEX-LEL</title>
            </head>
            <body>
                <h1>INDEX-LEL</h1>
                <p id="res">Media de transacciones en ${prov}: ${media.toFixed(2)}</p><br>
                <a href="/">Volver</a>   
            </body>
            </html>`);
    } catch (error) {
        console.error("Error al calcular la media:", error);
        response.status(500).send("Error interno del servidor.");
    }
});