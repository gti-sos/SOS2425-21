import DataStore from "nedb";
import request from "request";

const BASE_API = "/api/v1";
let db_PRG = new DataStore({ filename: "culturalevent.db", autoload: true });
const RESOURCE = "cultural-event";

const initialData = [
  /* ... tus datos ... */
];

function loadBackendPRG(app) {
  db_PRG.find({}, (err, docs) => {
    if (err) console.error(`ERROR: ${err}`);
    else if (docs.length === 0) db_PRG.insert(initialData);
  });

  app.get(`${BASE_API}/${RESOURCE}/loadInitialData`, (req, res) => {
    db_PRG.find({}, (err, docs) => {
      if (err) return res.status(500).send("Error interno");
      if (docs.length > 0) return res.sendStatus(200);
      db_PRG.insert(initialData);
      res.sendStatus(200);
    });
  });

  app.get(`${BASE_API}/${RESOURCE}`, (req, res) => {
    let query = {};
    const fields = [
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

    fields.forEach((f) => {
      if (req.query[f] !== undefined) {
        query[f] = isNaN(req.query[f])
          ? req.query[f]
          : parseFloat(req.query[f]);
      }
    });

    let offset = parseInt(req.query.offset) || 0;
    let limit = parseInt(req.query.limit) || 0;
    let selectedFields = req.query.fields ? req.query.fields.split(",") : null;

    db_PRG
      .find(query)
      .skip(offset)
      .limit(limit)
      .exec((err, docs) => {
        if (err) return res.status(500).send("Error interno");
        if (!docs.length) return res.status(200).json([]);

        const sanitized = docs.map((d) => {
          delete d._id;
          if (selectedFields) {
            Object.keys(d).forEach((k) => {
              if (!selectedFields.includes(k)) delete d[k];
            });
          }
          return d;
        });
        res.json(sanitized);
      });
  });

  app.get(`${BASE_API}/${RESOURCE}/:province/:year?/:month?`, (req, res) => {
    const { province, year, month } = req.params;
    let query = { province };

    if (year) query.year = parseInt(year);
    if (month) query.month = month;

    db_PRG.find(query, (err, docs) => {
      if (err) return res.status(500).send("Error interno");
      if (!docs.length) return res.status(200).json([]);
      docs.forEach((d) => delete d._id);
      res.json(docs);
    });
  });

  app.post(`${BASE_API}/${RESOURCE}`, (req, res) => {
    const newEntry = req.body;
    const requiredFields = [
      "province",
      "year",
      "month",
      "total_event",
      "avg_ticket_price",
      "total_attendance",
    ];

    const missing = requiredFields.filter(
      (f) => newEntry[f] === undefined || newEntry[f] === ""
    );
    if (missing.length > 0)
      return res.status(400).json({ error: "Missing fields", missing });

    db_PRG.findOne(
      { province: newEntry.province, year: newEntry.year },
      (err, found) => {
        if (err) return res.status(500).send("Error interno");
        if (found) return res.sendStatus(409);
        db_PRG.insert(newEntry);
        res.sendStatus(201);
      }
    );
  });

  app.put(`${BASE_API}/${RESOURCE}/:province/:year`, (req, res) => {
    const { province, year } = req.params;
    const update = req.body;

    if (province !== update.province || parseInt(year) !== update.year) {
      return res.status(400).send("Identificadores no coinciden");
    }

    db_PRG.update(
      { province, year: parseInt(year) },
      {
        $set: {
          avg_ticket_price: update.avg_ticket_price,
          total_event: update.total_event,
          total_attendance: update.total_attendance,
          local_attendance: update.local_attendance,
          foreign_attendance: update.foreign_attendance,
          event_type: update.event_type,
          avg_event_duration: update.avg_event_duration,
        },
      },
      {},
      (err, numUpdated) => {
        if (err) return res.status(500).send("Error interno");
        if (numUpdated === 0) return res.sendStatus(404);
        res.sendStatus(200);
      }
    );
  });

  app.delete(`${BASE_API}/${RESOURCE}`, (req, res) => {
    db_PRG.remove({}, { multi: true }, (err, numRemoved) => {
      if (err) return res.status(500).send("Error interno");
      res.sendStatus(numRemoved ? 200 : 404);
    });
  });

  app.delete(`${BASE_API}/${RESOURCE}/:province/:year`, (req, res) => {
    const { province, year } = req.params;
    db_PRG.remove({ province, year: parseInt(year) }, {}, (err, numRemoved) => {
      if (err) return res.status(500).send("Error interno");
      if (numRemoved === 0) return res.sendStatus(404);
      res.sendStatus(200);
    });
  });
}

export { loadBackendPRG };
