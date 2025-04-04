const BASE_API = "/api/v1";
import DataStore from "nedb";
import fs from "fs";
import csv from "csv-parser";


let db_LEL = new DataStore({ filename: "homeBuyingSellingStats.db", autoload: true });
const RESOURCE = "home-buying-selling-stats";

//Función para leer datos del CSV
const readCSVDataLEL = () => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream("samples/LEL/SOS2425-21-Propuesta - Laura.csv") 
            .pipe(csv())
            .on("data", (row) => {
                try {
                    const formattedRow = {
                        year: parseInt(row.year),
                        province: row.province,
                        transaction_total: parseInt(row.transaction_total.replace(/\D/g, "")),
                        transaction_protected_housing: parseInt(row.transaction_protected_housing.replace(/\D/g, "")),
                        transaction_new_housing: parseInt(row.transaction_new_housing.replace(/\D/g, "")),
                        transaction_secondhand_housing: parseInt(row.transaction_secondhand_housing.replace(/\D/g, ""))
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

function loadBackendLEL(app){
    // Endpoint para cargar los datos iniciales desde el CSV
    app.get(`${BASE_API}/${RESOURCE_LEL}/loadInitialData`, async (req, res) => {
        db_LEL.count({}, async(err, count) => {
            if (count > 0) {
                return res.status(409).json({ error: "Los datos ya están cargados." });
            }
            try {
                const data = await readCSVDataLEL();
                db_LEL.insert(data, (err) => {
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
        db_LEL.find({}, (err, docs) => {
            if (err) return res.status(500).json({ error: "Error al obtener datos." });
            res.status(200).json(docs.map(doc => {
                delete doc._id;
                return doc;
            }));
        });
    });
    // Redireccionar a la documentación (se coloca antes que el endpoint dinámico)
    app.get(`${BASE_API}/${RESOURCE}/docs`, (req, res) => {
        res.redirect("https://documenter.getpostman.com/view/42241739/2sB2cUANcY");
    });
    // GET - Obtener datos de una provincia específica sin _id
    app.get(`${BASE_API}/${RESOURCE}/:province`, (req, res) => {
        const provinceQuery = new RegExp(`^${req.params.province}$`, "i");
        db_LEL.findOne({ province: provinceQuery }, (err, doc) => {
            if (err) return res.status(500).json({ error: "Error al obtener datos." });
            if (!doc) return res.status(404).json({ error: "Provincia no encontrada." });
            delete doc._id;
            res.status(200).json(doc);
        });
    });
    // POST - Agregar un nuevo dato
    app.post(`${BASE_API}/${RESOURCE}`, (req, res) => {
        const newData = req.body;
        db_LEL.insert(newData, (err, doc) => {
            if (err) return res.status(500).json({ error: "Error al insertar datos." });
            res.status(201).json(doc);
        });
    });
    // PUT - Actualizar datos de una provincia
    app.put(`${BASE_API}/${RESOURCE}/:province`, (req, res) => {
        db_LEL.update(
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
        db_LEL.remove({}, { multi: true }, (err, numRemoved) => {
            if (err) return res.status(500).json({ error: "Error al eliminar datos." });
            res.status(200).json({ message: "Todos los datos han sido eliminados." });
        });
    });
    // DELETE - Eliminar una provincia específica
    app.delete(`${BASE_API}/${RESOURCE}/:province`, (req, res) => {
        db_LEL.remove({ province: new RegExp(`^${req.params.province}$`, "i") }, {}, (err, numRemoved) => {
            if (err) return res.status(500).json({ error: "Error al eliminar datos." });
            if (numRemoved === 0) return res.status(404).json({ error: "Provincia no encontrada." });
            res.status(200).json({ message: `Datos de ${req.params.province} eliminados correctamente.` });
        });
    });
}
