const BASE_API = "/api/v1";
import DataStore from "nedb";
import fs from "fs";
import csv from "csv-parser";

let db_AGB = new DataStore({ filename: "publicTransitStats.db", autoload: true });
const RESOURCE = "public-transit-stats";

// Función para leer datos del CSV
const readCSVData = () => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream("data/SOS2425-21-Propuesta - Andrea.csv")
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
    app.get(`${BASE_API}/${RESOURCE}/loadInitialData`, async (req, res) => {
        db_AGB.count({}, async (err, count) => {
            if (err) return res.status(500).json({ error: "Error al contar registros." });
            if (count > 0) return res.status(409).json({ error: "Los datos ya están cargados." });
    
            try {
                const data = await readCSVData();
                db_AGB.insert(data, (err) => {
                    if (err) return res.status(500).json({ error: "Error al insertar los datos." });
                    res.status(201).json({ message: "Datos iniciales cargados correctamente." });
                });
            } catch (error) {
                console.error("Error al leer CSV:", error);
                res.status(500).json({ error: "Error interno al cargar los datos." });
            }
        });
    });
    
    // GET - Obtener todos los datos
    app.get(`${BASE_API}/${RESOURCE}`, (req, res) => {
        db_AGB.find({}, (err, docs) => {
            if (err) return res.status(500).json({ error: "Error al obtener los datos." });
    
            const cleanDocs = docs.map(({ _id, ...rest }) => rest);
            res.status(200).json(cleanDocs);
        });
    });
    
    // GET - Obtener datos de una provincia específica
    app.get(`${BASE_API}/${RESOURCE}/:province`, (req, res) => {
        const province = req.params.province.toLowerCase();
    
        db_AGB.findOne({ province: new RegExp(`^${province}$`, "i") }, (err, doc) => {
            if (err) return res.status(500).json({ error: "Error al buscar la provincia." });
            if (!doc) return res.status(404).json({ error: "Provincia no encontrada." });
    
            const { _id, ...cleanDoc } = doc;
            res.status(200).json(cleanDoc);
        });
    });
    
    // POST - Agregar un nuevo dato
    app.post(`${BASE_API}/${RESOURCE}`, (req, res) => {
        const newData = req.body;
    
        if (!newData.year || !newData.province || !newData.ticket_price || !newData.total_trips || !newData.route_length) {
            return res.status(400).json({ error: "Faltan campos requeridos." });
        }
    
        db_AGB.findOne({ province: new RegExp(`^${newData.province}$`, "i") }, (err, existing) => {
            if (err) return res.status(500).json({ error: "Error al comprobar duplicados." });
            if (existing) return res.status(409).json({ error: "El recurso ya existe." });
    
            db_AGB.insert(newData, (err, inserted) => {
                if (err) return res.status(500).json({ error: "Error al insertar el dato." });
    
                const { _id, ...cleanInserted } = inserted;
                res.status(201).json(cleanInserted);
            });
        });
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
    
        db_AGB.update(
            { province: new RegExp(`^${province}$`, "i") },
            newData,
            {},
            (err, numReplaced) => {
                if (err) return res.status(500).json({ error: "Error al actualizar." });
                if (numReplaced === 0) return res.status(404).json({ error: "Provincia no encontrada." });
    
                res.status(200).json(newData);
            }
        );
    });
    
    // DELETE - Eliminar todos los datos
    app.delete(`${BASE_API}/${RESOURCE}`, (req, res) => {
        db_AGB.remove({}, { multi: true }, (err, numRemoved) => {
            if (err) return res.status(500).json({ error: "Error al eliminar." });
            res.status(200).json({ message: `Se eliminaron ${numRemoved} registros.` });
        });
    });
    
    // DELETE - Eliminar una provincia específica
    app.delete(`${BASE_API}/${RESOURCE}/:province`, (req, res) => {
        const province = req.params.province.trim().toLowerCase();
    
        db_AGB.remove({ province: new RegExp(`^${province}$`, "i") }, {}, (err, numRemoved) => {
            if (err) return res.status(500).json({ error: "Error al eliminar la provincia." });
    
            if (numRemoved === 0) {
                res.status(404).json({ error: `Provincia '${province}' no encontrada.` });
            } else {
                res.status(200).json({ message: `Datos de ${province} eliminados correctamente.` });
            }
        });
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
}

export { loadBackendAGB };
