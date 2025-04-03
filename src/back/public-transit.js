const BASE_API = "/api/v1";
import DataStore from "nedb";
import fs from "fs";
import csv from "csv-parser";

let db_AGB = new DataStore({ filename: "publicTransitStats.db", autoload: true });
const calcularMedia = require("./samples/AGB/index-AGB.js");
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

function loadBackendAGB(app) {
    // Redireccionar a la documentación (se coloca antes que el endpoint dinámico)
    app.get(`${BASE_API}/${RESOURCE}/docs`, (req, res) => {
        res.redirect("https://documenter.getpostman.com/view/41997974/2sB2cSi4as");
    });

    // Endpoint para cargar los datos iniciales desde el CSV
    app.get(`${BASE_API}/${RESOURCE}/loadInitialData`, async (req, res) => {
        db_AGB.count({}, async (err, count) => {
            if (count > 0) {
                return res.status(409).json({ error: "Los datos ya están cargados." });
            }
            try {
                const data = await readCSVData();
                db_AGB.insert(data, (err) => {
                    if (err) return res.status(500).json({ error: "Error al insertar datos." });
                    res.status(201).json({ message: "Datos iniciales cargados correctamente." });
                });
            } catch (error) {
                res.status(500).json({ error: "Error interno al cargar los datos." });
            }
        });
    });

    // GET - Obtener todos los datos sin _id
    app.get(`${BASE_API}/${RESOURCE}`, (req, res) => {
        db_AGB.find({}, (err, docs) => {
            if (err) return res.status(500).json({ error: "Error al obtener datos." });
            res.status(200).json(docs.map(doc => {
                delete doc._id;
                return doc;
            }));
        });
    });

    // GET - Obtener datos de una provincia específica sin _id
    app.get(`${BASE_API}/${RESOURCE}/:province`, (req, res) => {
        db_AGB.findOne({ province: new RegExp(`^${req.params.province}$`, "i") }, (err, doc) => {
            if (err) return res.status(500).json({ error: "Error al obtener datos." });
            if (!doc) return res.status(404).json({ error: "Provincia no encontrada." });
            delete doc._id;
            res.status(200).json(doc);
        });
    });

    // POST - Agregar un nuevo dato
    app.post(`${BASE_API}/${RESOURCE}`, (req, res) => {
        const newData = req.body;
        db_AGB.insert(newData, (err, doc) => {
            if (err) return res.status(500).json({ error: "Error al insertar datos." });
            res.status(201).json(doc);
        });
    });

    // PUT - Actualizar datos de una provincia
    app.put(`${BASE_API}/${RESOURCE}/:province`, (req, res) => {
        db_AGB.update(
            { province: new RegExp(`^${req.params.province}$`, "i") },
            { $set: req.body },
            {},
            (err, numReplaced) => {
                if (err) return res.status(500).json({ error: "Error al actualizar datos." });
                if (numReplaced === 0) return res.status(404).json({ error: "Provincia no encontrada." });
                res.status(200).json(req.body);
            }
        );
    });

    // DELETE - Eliminar todos los datos
    app.delete(`${BASE_API}/${RESOURCE}`, (req, res) => {
        db_AGB.remove({}, { multi: true }, (err, numRemoved) => {
            if (err) return res.status(500).json({ error: "Error al eliminar datos." });
            res.status(200).json({ message: "Todos los datos han sido eliminados." });
        });
    });

    // DELETE - Eliminar una provincia específica
    app.delete(`${BASE_API}/${RESOURCE}/:province`, (req, res) => {
        db_AGB.remove({ province: new RegExp(`^${req.params.province}$`, "i") }, {}, (err, numRemoved) => {
            if (err) return res.status(500).json({ error: "Error al eliminar datos." });
            if (numRemoved === 0) return res.status(404).json({ error: "Provincia no encontrada." });
            res.status(200).json({ message: `Datos de ${req.params.province} eliminados correctamente.` });
        });
    });
}

export { loadBackendAGB };
