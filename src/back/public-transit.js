const BASE_API = "/api/v1";
import DataStore from "nedb";

let db_AGB = new DataStore({ filename: "publicTransitStats.db", autoload: true });
const RESOURCE = "public-transit-stats";

const initialData = [
    { year: 2024, province: "Madrid", ticket_price: 1, total_trips: 5, route_length: 727.780, extra: 2 },
    { year: 2024, province: "Barcelona", ticket_price: 2, total_trips: 50, route_length: 408.601, extra: 7 },
    { year: 2024, province: "Valencia", ticket_price: 1, total_trips: 5, route_length: 115.640, extra: 0 },
    { year: 2024, province: "Sevilla", ticket_price: 1, total_trips: 5, route_length: 88.160, extra: 1 },
    { year: 2024, province: "Bizkaia", ticket_price: 1, total_trips: 4, route_length: 49.007, extra: 0 },
    { year: 2024, province: "Malaga", ticket_price: 1, total_trips: 55, route_length: 51.300, extra: 4 },
    { year: 2024, province: "Alicante", ticket_price: 1, total_trips: 35, route_length: 19.950, extra: 0 },
    { year: 2019, province: "Madrid", ticket_price: 1, total_trips: 5, route_length: 694.490, extra: 7 },
    { year: 2019, province: "Barcelona", ticket_price: 2, total_trips: 2, route_length: 404.590, extra: 2 },
    { year: 2019, province: "Valencia", ticket_price: 1, total_trips: 5, route_length: 107.100, extra: 9 },
    { year: 2019, province: "Sevilla", ticket_price: 1, total_trips: 5, route_length: 91.420, extra: 1 },
    { year: 2019, province: "Bizkaia", ticket_price: 1, total_trips: 4, route_length: 55.710, extra: 0 },
    { year: 2019, province: "Malaga", ticket_price: 1, total_trips: 55, route_length: 65.390, extra: 7 },
    { year: 2019, province: "Alicante", ticket_price: 1, total_trips: 35, route_length: 25.120, extra: 0 },
    { year: 2015, province: "Madrid", ticket_price: 1, total_trips: 5, route_length: 609.900, extra: 8 },
    { year: 2015, province: "Barcelona", ticket_price: 2, total_trips: 15, route_length: 342.300, extra: 0 },
    { year: 2015, province: "Valencia", ticket_price: 1, total_trips: 5, route_length: 98.500, extra: 1 },
    { year: 2015, province: "Sevilla", ticket_price: 1, total_trips: 5, route_length: 86.500, extra: 1 },
    { year: 2015, province: "Bizkaia", ticket_price: 1, total_trips: 4, route_length: 53.300, extra: 0 },
    { year: 2015, province: "Malaga", ticket_price: 1, total_trips: 55, route_length: 58.600, extra: 8 },
    { year: 2015, province: "Alicante", ticket_price: 1, total_trips: 35, route_length: 22.040, extra: 2 }
];

db_AGB.find({}, (err, trips) => {
    if (err) {
        console.error("Error al obtener los registros: ", err);
        return;
    }
    if (trips.length < 1) {
        console.log("Insertando datos iniciales...");
        db_AGB.insert(initialData, (err) => {
            if (err) {
                console.error("Error al insertar los datos iniciales:", err);
            } else {
                console.log("Datos iniciales insertados correctamente.");
            }
        });
    } else {
        console.log("Datos ya presentes en la base de datos.");
    }
});

function loadBackendAGB(app) {
    // Endpoint para cargar los datos iniciales desde el CSV
    /*app.get(`${BASE_API}/${RESOURCE}/loadInitialData`, async (req, res) => {
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
    });*/
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
        db_AGB.find({ province: new RegExp(`^${province}$`, "i") }, (err, doc) => {
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

        db_AGB.find({ province: new RegExp(`^${province}$`, "i"), year }, (err, doc) => {
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

        db_AGB.find({ province: new RegExp(`^${newData.province}$`, "i"), year: newData.year }, (err, existing) => {
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
