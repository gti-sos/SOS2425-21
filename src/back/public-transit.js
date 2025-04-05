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

    // GET - Obtener todos los datos con paginación y filtrado por todos los campos
    app.get(`${BASE_API}/${RESOURCE}`, (req, res) => {
        const limit = parseInt(req.query.limit) || 0;   // 0 significa sin límite
        const offset = parseInt(req.query.offset) || 0;

        // Filtro dinámico por todos los campos
        const query = {};
        if (req.query.province) query.province = new RegExp(`^${req.query.province}$`, "i");
        if (req.query.year) query.year = parseInt(req.query.year);
        if (req.query.ticket_price) query.ticket_price = parseFloat(req.query.ticket_price);
        if (req.query.total_trips) query.total_trips = parseInt(req.query.total_trips);
        if (req.query.route_length) query.route_length = parseFloat(req.query.route_length);

        db_AGB.count(query, (err, totalCount) => {
            if (err) return res.status(500).json({ error: "Error al contar registros." });

            db_AGB.find(query)
                .skip(offset)
                .limit(limit)
                .exec((err, docs) => {
                    if (err) return res.status(500).json({ error: "Error al obtener los datos." });

                    const cleanDocs = docs.map(({ _id, ...rest }) => rest);
                    res.status(200).json({
                        total: totalCount,
                        limit,
                        offset,
                        data: cleanDocs
                    });
                });
        });
    });

    // Redireccionar a la documentación
    app.get(`${BASE_API}/${RESOURCE}/docs`, (req, res) => {
        res.redirect("https://documenter.getpostman.com/view/41997974/2sB2cSi4as");
    });

    // GET - Obtener datos por una provincia
    app.get(`${BASE_API}/${RESOURCE}/:province`, (req, res) => {
        const province = req.params.province;
        db_AGB.findOne({ province: new RegExp(`^${province}$`, "i") }, (err, doc) => {
            if (err) return res.status(500).json({ error: "Error al buscar la provincia." });
            if (!doc) return res.status(404).json({ error: "Provincia no encontrada." });
            const { _id, ...cleanDoc } = doc;
            res.status(200).json(cleanDoc);
        });
    });
    
    // GET - Obtener datos por identificador compuesto (province + year)
    app.get(`${BASE_API}/${RESOURCE}/:province/:year`, (req, res) => {
        const province = req.params.province.toLowerCase();
        const year = parseInt(req.params.year);

        db_AGB.findOne({ province: new RegExp(`^${province}$`, "i"), year }, (err, doc) => {
            if (err) return res.status(500).json({ error: "Error al buscar la estadística." });
            if (!doc) return res.status(404).json({ error: "Estadística no encontrada." });

            const { _id, ...cleanDoc } = doc;
            res.status(200).json(cleanDoc);
        });
    });

    // POST - Agregar un nuevo dato
    app.post(`${BASE_API}/${RESOURCE}`, (req, res) => {
        const newData = req.body;

        if (
            typeof newData.year !== "number" ||
            typeof newData.province !== "string" ||
            typeof newData.ticket_price !== "number" ||
            typeof newData.total_trips !== "number" ||
            typeof newData.route_length !== "number"
        ) {
            return res.status(400).json({ error: "Faltan campos requeridos o son incorrectos." });
        }

        db_AGB.findOne({ province: new RegExp(`^${newData.province}$`, "i"), year: newData.year }, (err, existing) => {
            if (err) return res.status(500).json({ error: "Error al comprobar duplicados." });
            if (existing) return res.status(409).json({ error: "El recurso ya existe." });

            db_AGB.insert(newData, (err, inserted) => {
                if (err) return res.status(500).json({ error: "Error al insertar el dato." });

                const { _id, ...cleanInserted } = inserted;
                res.status(201).json(cleanInserted);
            });
        });
    });

    // PUT - Actualizar datos por identificador compuesto (province + year)
    app.put(`${BASE_API}/${RESOURCE}/:province/:year`, (req, res) => {
        const province = req.params.province.toLowerCase();
        const year = parseInt(req.params.year);
        const newData = req.body;

        if (
            typeof newData.year !== "number" ||
            typeof newData.province !== "string" ||
            typeof newData.ticket_price !== "number" ||
            typeof newData.total_trips !== "number" ||
            typeof newData.route_length !== "number"
        ) {
            return res.status(400).json({ error: "Faltan campos requeridos o son incorrectos." });
        }

        if (newData.province.toLowerCase() !== province || newData.year !== year) {
            return res.status(400).json({ error: "El identificador de la URL y del cuerpo deben coincidir." });
        }

        db_AGB.update(
            { province: new RegExp(`^${province}$`, "i"), year },
            newData,
            {},
            (err, numReplaced) => {
                if (err) return res.status(500).json({ error: "Error al actualizar." });
                if (numReplaced === 0) return res.status(404).json({ error: "Estadística no encontrada." });

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

    // DELETE - Eliminar una estadística por identificador compuesto (province + year)
    app.delete(`${BASE_API}/${RESOURCE}/:province/:year`, (req, res) => {
        const province = req.params.province.trim().toLowerCase();
        const year = parseInt(req.params.year);

        db_AGB.remove({ province: new RegExp(`^${province}$`, "i"), year }, {}, (err, numRemoved) => {
            if (err) return res.status(500).json({ error: "Error al eliminar la estadística." });

            if (numRemoved === 0) {
                res.status(404).json({ error: `Estadística de ${province} en ${year} no encontrada.` });
            } else {
                res.status(200).json({ message: `Datos de ${province} en ${year} eliminados correctamente.` });
            }
        });
    });

    // Manejo de métodos no permitidos
    app.all(`${BASE_API}/${RESOURCE}`, (req, res) => {
        if (!["GET", "POST", "DELETE"].includes(req.method)) {
            return res.status(405).json({ error: "Método no permitido." });
        }
    });

    app.all(`${BASE_API}/${RESOURCE}/:province/:year`, (req, res) => {
        if (!["GET", "PUT", "DELETE"].includes(req.method)) {
            return res.status(405).json({ error: "Método no permitido." });
        }
    });
}

export { loadBackendAGB };
