
const express = require('express');
const cool = require('cool-ascii-faces');
const app = express();
const PORT = process.env.PORT || 16078;

const BASE_API="/api/v1";
app.use(express.json())
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
    const province = req.params.province.trim().toLowerCase(); // Elimina espacios y normaliza a minúsculas
    const index = publicTransitStats.findIndex(item => item.province.trim().toLowerCase() === province);

    if (index !== -1) {
        publicTransitStats.splice(index, 1);
        res.status(200).json({ message: `Datos de ${province} eliminados correctamente.` });
    } else {
        res.status(404).json({ error: `Provincia '${province}' no encontrada.` });
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

// PRG 
//PRG
let culturalEvents = [];

// Función para calcular la media de asistencia total (total_attendance) para una provincia
const calcularMediaPRG = (provincia) => {
    const eventosProvincia = culturalEvents.filter(evento => evento.province.toLowerCase() === provincia.toLowerCase());
    if (eventosProvincia.length === 0) return null;

    const totalAsistencia = eventosProvincia.reduce((acc, evento) => acc + evento.total_attendance, 0);
    const media = totalAsistencia / eventosProvincia.length;
    return media;
};

// Endpoint para calcular la media de asistencia total por provincia
app.get("/samples/PRG", (request, response) => {
    const prov = "Madrid";  // Puedes cambiar por otra provincia o hacerlo dinámico con query params
    const media = calcularMediaPRG(prov);

    if (media === null) {
        response.status(404).send("Provincia no encontrada o sin datos disponibles.");
    } else {
        response.send(`<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>INDEX-PRG</title>
            </head>
            <body>
                <h1>INDEX-PRG</h1>
                <p id="res">Media de asistencia total en ${prov}: ${media.toFixed(2)}</p><br>
                <a href="/">Volver</a>   
            </body>
            </html>`);
    }
});

app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});


//L05
const RESOURCE_CULTURAL = "cultural-events";

// Función para leer datos del CSV
const readCSVDataCultural = () => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream("samples/PRG/SOS2425-21-Propuesta - Paula.csv")
            .pipe(csv())
            .on("data", (row) => {
                try {
                    const formattedRow = {
                        year: parseInt(row.year),
                        month: row.month,
                        province: row.province,
                        total_event: parseInt(row.total_event),
                        avg_ticket_price: parseFloat(row.avg_ticket_price),
                        total_attendance: parseInt(row.total_attendance),
                        local_attendance: parseInt(row.local_attendance),
                        foreign_attendance: parseInt(row.foreign_attendance),
                        event_type: row.event_type,
                        avg_event_duration: parseFloat(row.avg_event_duration)
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
app.get(`${BASE_API}/${RESOURCE_CULTURAL}/loadInitialData`, async (req, res) => {
    if (culturalEvents.length > 0) {
        return res.status(409).json({ error: "Los datos ya están cargados." });
    }

    try {
        culturalEvents = await readCSVDataCultural();
        res.status(201).json({ message: "Datos iniciales cargados correctamente." });
    } catch (error) {
        console.error("Error al leer CSV:", error);
        res.status(500).json({ error: "Error interno al cargar los datos." });
    }
});

// GET - Obtener todos los datos
app.get(`${BASE_API}/${RESOURCE_CULTURAL}`, (req, res) => {
    res.status(200).json(culturalEvents);
});

// GET - Obtener datos de una provincia específica
app.get(`${BASE_API}/${RESOURCE_CULTURAL}/:province`, (req, res) => {
    const { province } = req.params;
    const result = culturalEvents.filter(item => item.province.toLowerCase() === province.toLowerCase());

    if (result.length > 0) {
        res.status(200).json(result);
    } else {
        res.status(404).json({ error: "Provincia no encontrada." });
    }
});

// POST - Agregar un nuevo dato
app.post(`${BASE_API}/${RESOURCE_CULTURAL}`, (req, res) => {
    const newData = req.body;

    if (!newData.year || !newData.month || !newData.province || !newData.total_event || !newData.avg_ticket_price ||
        !newData.total_attendance || !newData.local_attendance || !newData.foreign_attendance || !newData.event_type || !newData.avg_event_duration) {
        return res.status(400).json({ error: "Faltan campos requeridos." });
    }

    if (culturalEvents.some(item => item.province.toLowerCase() === newData.province.toLowerCase())) {
        return res.status(409).json({ error: "El recurso ya existe." });
    }

    culturalEvents.push(newData);
    res.status(201).json(newData);
});

// PUT - Actualizar datos de una provincia
app.put(`${BASE_API}/${RESOURCE_CULTURAL}/:province`, (req, res) => {
    const { province } = req.params;
    const newData = req.body;

    if (!newData.year || !newData.month || !newData.province || !newData.total_event || !newData.avg_ticket_price ||
        !newData.total_attendance || !newData.local_attendance || !newData.foreign_attendance || !newData.event_type || !newData.avg_event_duration) {
        return res.status(400).json({ error: "Faltan campos requeridos." });
    }

    if (newData.province.toLowerCase() !== province.toLowerCase()) {
        return res.status(400).json({ error: "El ID de la URL y del cuerpo deben coincidir." });
    }

    const index = culturalEvents.findIndex(item => item.province.toLowerCase() === province.toLowerCase());

    if (index !== -1) {
        culturalEvents[index] = newData;
        res.status(200).json(newData);
    } else {
        res.status(404).json({ error: "Provincia no encontrada." });
    }
});

// DELETE - Eliminar todos los datos
app.delete(`${BASE_API}/${RESOURCE_CULTURAL}`, (req, res) => {
    culturalEvents = [];
    res.status(200).json({ message: "Todos los eventos culturales han sido eliminados." });
});

// DELETE - Eliminar una provincia específica
app.delete(`${BASE_API}/${RESOURCE_CULTURAL}/:province`, (req, res) => {
    const { province } = req.params;
    culturalEvents = culturalEvents.filter(item => item.province.toLowerCase() !== province.toLowerCase());
    res.status(200).json({ message: `Eventos culturales de ${province} eliminados correctamente.` });
});

// Manejo de métodos no permitidos
app.all(`${BASE_API}/${RESOURCE_CULTURAL}`, (req, res) => {
    if (!["GET", "POST", "DELETE"].includes(req.method)) {
        return res.status(405).json({ error: "Método no permitido." });
    }
});

app.all(`${BASE_API}/${RESOURCE_CULTURAL}/:province`, (req, res) => {
    if (!["GET", "PUT", "DELETE"].includes(req.method)) {
        return res.status(405).json({ error: "Método no permitido." });
    }
});


//====================================================================================

//LEL
const calcularMediaLEL = require("./samples/LEL/index-LEL.js");
let homeBuyingSellingStats = [];
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

app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});

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