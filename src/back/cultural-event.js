const BASE_API = "/api/v1";
import DataStore from "nedb";
import fs from "fs";
import csv from "csv-parser";

const RESOURCE = "cultural-event";
const db_PRG = new DataStore({ filename: "culturalevent.db", autoload: true });

// Leer CSV
const readCSVData = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream("data/SOS2425-21-Propuesta - Paula.csv")
      .pipe(csv())
      .on("data", (row) => {
        try {
          const formattedRow = {
            year: parseInt(row.year),
            month: row.month,
            province: row.province,
            total_event: parseInt(row.total_event),
            avg_ticket_price: parseFloat(
              row.avg_ticket_price.replace(",", ".")
            ),
            total_attendance: parseInt(row.total_attendance.replace(/\D/g, "")),
            local_attendance: parseInt(row.local_attendance.replace(/\D/g, "")),
            foreign_attendance: parseInt(
              row.foreign_attendance.replace(/\D/g, "")
            ),
            event_type: row.event_type,
            avg_event_duration: parseFloat(
              row.avg_event_duration.replace(",", ".")
            ),
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

function loadBackendPRG(app) {
  // Cargar datos iniciales
  app.get(`${BASE_API}/${RESOURCE}/loadInitialData`, async (req, res) => {
    db_PRG.count({}, async (err, count) => {
      if (count > 0)
        return res.status(409).json({ error: "Datos ya cargados." });

      try {
        const data = await readCSVData();
        db_PRG.insert(data, (err) => {
          if (err) return res.status(500).json({ error: "Error al insertar." });
          res
            .status(201)
            .json({ message: "Datos iniciales cargados correctamente." });
        });
      } catch (error) {
        console.error("Error al leer CSV:", error);
        res.status(500).json({ error: "Error interno." });
      }
    });
  });

  // GET con filtros y paginación
  app.get(`${BASE_API}/${RESOURCE}`, (req, res) => {
    const limit = parseInt(req.query.limit) || 0;
    const offset = parseInt(req.query.offset) || 0;
    const query = {};

    if (req.query.province)
      query.province = new RegExp(`^${req.query.province}$`, "i");
    if (req.query.year) query.year = parseInt(req.query.year);
    if (req.query.month) query.month = req.query.month;
    if (req.query.total_event)
      query.total_event = parseInt(req.query.total_event);
    if (req.query.avg_ticket_price)
      query.avg_ticket_price = parseFloat(req.query.avg_ticket_price);
    if (req.query.total_attendance)
      query.total_attendance = parseInt(req.query.total_attendance);
    if (req.query.local_attendance)
      query.local_attendance = parseInt(req.query.local_attendance);
    if (req.query.foreign_attendance)
      query.foreign_attendance = parseInt(req.query.foreign_attendance);
    if (req.query.event_type) query.event_type = req.query.event_type;
    if (req.query.avg_event_duration)
      query.avg_event_duration = parseFloat(req.query.avg_event_duration);

    db_PRG.count(query, (err, totalCount) => {
      if (err) return res.status(500).json({ error: "Error al contar." });

      db_PRG
        .find(query)
        .skip(offset)
        .limit(limit)
        .exec((err, docs) => {
          if (err)
            return res.status(500).json({ error: "Error al obtener datos." });

          const cleanDocs = docs.map(({ _id, ...rest }) => rest);
          res
            .status(200)
            .json({ total: totalCount, limit, offset, data: cleanDocs });
        });
    });
  });

  // GET - Por provincia y año
  app.get(`${BASE_API}/${RESOURCE}/:province/:year`, (req, res) => {
    const province = req.params.province;
    const year = parseInt(req.params.year);

    db_PRG.findOne(
      { province: new RegExp(`^${province}$`, "i"), year },
      (err, doc) => {
        if (err) return res.status(500).json({ error: "Error al buscar." });
        if (!doc) return res.status(404).json({ error: "No encontrado." });

        const { _id, ...cleanDoc } = doc;
        res.status(200).json(cleanDoc);
      }
    );
  });

  // POST - Insertar
  app.post(`${BASE_API}/${RESOURCE}`, (req, res) => {
    const newData = req.body;

    const requiredFields = [
      "year",
      "month",
      "province",
      "total_event",
      "avg_ticket_price",
      "total_attendance",
      "local_attendance",
      "foreign_attendance",
      "event_type",
      "avg_event_duration",
    ];
    for (let field of requiredFields) {
      if (newData[field] === undefined)
        return res.status(400).json({ error: `Falta el campo: ${field}` });
    }

    db_PRG.findOne(
      {
        province: new RegExp(`^${newData.province}$`, "i"),
        year: newData.year,
      },
      (err, existing) => {
        if (existing) return res.status(409).json({ error: "Ya existe." });

        delete newData._id;
        db_PRG.insert(newData, (err, inserted) => {
          if (err) return res.status(500).json({ error: "Error al insertar." });

          const { _id, ...cleanInserted } = inserted;
          res.status(201).json(cleanInserted);
        });
      }
    );
  });

  // PUT - Actualizar
  app.put(`${BASE_API}/${RESOURCE}/:province/:year`, (req, res) => {
    const province = req.params.province;
    const year = parseInt(req.params.year);
    const newData = req.body;

    if (
      newData.province.toLowerCase() !== province.toLowerCase() ||
      newData.year !== year
    ) {
      return res
        .status(400)
        .json({ error: "ID de URL y cuerpo no coinciden." });
    }

    delete newData._id;
    db_PRG.update(
      { province: new RegExp(`^${province}$`, "i"), year },
      newData,
      {},
      (err, numReplaced) => {
        if (numReplaced === 0)
          return res.status(404).json({ error: "No encontrado." });
        res.status(200).json(newData);
      }
    );
  });

  // DELETE todos
  app.delete(`${BASE_API}/${RESOURCE}`, (req, res) => {
    db_PRG.remove({}, { multi: true }, (err, numRemoved) => {
      res.status(200).json({ message: `Eliminados ${numRemoved} registros.` });
    });
  });

  // DELETE uno
  app.delete(`${BASE_API}/${RESOURCE}/:province/:year`, (req, res) => {
    const province = req.params.province;
    const year = parseInt(req.params.year);

    db_PRG.remove(
      { province: new RegExp(`^${province}$`, "i"), year },
      {},
      (err, numRemoved) => {
        if (numRemoved === 0)
          return res.status(404).json({ error: "No encontrado." });
        res.status(200).json({ message: `Registro eliminado.` });
      }
    );
  });

  // Redirección a documentación
  app.get(`${BASE_API}/${RESOURCE}/docs`, (req, res) => {
    res.redirect("https://documenter.getpostman.com/view/42397783/2sB2cUBNpz"); // pon tu enlace aquí
  });
}

export { loadBackendPRG };
