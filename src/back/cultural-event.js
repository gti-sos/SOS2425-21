import DataStore from "nedb";
import request from "request";

const BASE_API = "/api/v1";
let db_PRG = new DataStore({ filename: "culturalevent.db", autoload: true });
const RESOURCE = "cultural-event";

const initialData = [
  {
    year: 2024,
    month: "febrero",
    province: "alicante",
    total_event: 50,
    avg_ticket_price: 20,
    total_attendance: 10000,
    local_attendance: 7000,
    foreign_attendance: 3000,
    event_type: "Conciertos, Teatro, Exposiciones",
    avg_event_duration: 2,
  },
  {
    year: 2024,
    month: "febrero",
    province: "las palmas",
    total_event: 45,
    avg_ticket_price: 18,
    total_attendance: 9000,
    local_attendance: 5500,
    foreign_attendance: 3500,
    event_type: "Conciertos, Festivales, Teatro",
    avg_event_duration: 2.5,
  },
  {
    year: 2024,
    month: "febrero",
    province: "madrid",
    total_event: 120,
    avg_ticket_price: 25,
    total_attendance: 30000,
    local_attendance: 20000,
    foreign_attendance: 10000,
    event_type: "Conciertos, Teatro, Danza",
    avg_event_duration: 2.5,
  },
  {
    year: 2024,
    month: "febrero",
    province: "malaga",
    total_event: 60,
    avg_ticket_price: 22,
    total_attendance: 12000,
    local_attendance: 8000,
    foreign_attendance: 4000,
    event_type: "Conciertos, Exposiciones, Teatro",
    avg_event_duration: 2,
  },
  {
    year: 2024,
    month: "julio",
    province: "alicante",
    total_event: 70,
    avg_ticket_price: 22,
    total_attendance: 15000,
    local_attendance: 90000,
    foreign_attendance: 6000,
    event_type: "Festivales, Conciertos, Teatro",
    avg_event_duration: 3,
  },
  {
    year: 2024,
    month: "julio",
    province: "las palmas",
    total_event: 65,
    avg_ticket_price: 20,
    total_attendance: 14000,
    local_attendance: 7500,
    foreign_attendance: 6500,
    event_type: "Festivales, Conciertos, Danza",
    avg_event_duration: 3,
  },
  {
    year: 2024,
    month: "julio",
    province: "madrid",
    total_event: 130,
    avg_ticket_price: 26,
    total_attendance: 32000,
    local_attendance: 21000,
    foreign_attendance: 11000,
    event_type: "Conciertos, Teatro, Danza",
    avg_event_duration: 2.5,
  },
  {
    year: 2024,
    month: "julio",
    province: "malaga",
    total_event: 80,
    avg_ticket_price: 24,
    total_attendance: 18000,
    local_attendance: 10000,
    foreign_attendance: 8000,
    event_type: "Festivales, Conciertos, Teatro",
    avg_event_duration: 3,
  },
  {
    year: 2019,
    month: "febrero",
    province: "alicante",
    total_event: 45,
    avg_ticket_price: 19,
    total_attendance: 9500,
    local_attendance: 6500,
    foreign_attendance: 3000,
    event_type: "Conciertos, Teatro, Exposiciones",
    avg_event_duration: 2,
  },
  {
    year: 2019,
    month: "febrero",
    province: "las palmas",
    total_event: 40,
    avg_ticket_price: 17,
    total_attendance: 8500,
    local_attendance: 5000,
    foreign_attendance: 3500,
    event_type: "Conciertos, Festivales, Teatro",
    avg_event_duration: 2.5,
  },
  {
    year: 2019,
    month: "febrero",
    province: "madrid",
    total_event: 110,
    avg_ticket_price: 23,
    total_attendance: 28000,
    local_attendance: 18000,
    foreign_attendance: 10000,
    event_type: "Conciertos, Teatro, Danza",
    avg_event_duration: 2.5,
  },
  {
    year: 2019,
    month: "febrero",
    province: "malaga",
    total_event: 55,
    avg_ticket_price: 21,
    total_attendance: 11000,
    local_attendance: 7000,
    foreign_attendance: 4000,
    event_type: "Conciertos, Exposiciones, Teatro",
    avg_event_duration: 2,
  },
  {
    year: 2019,
    month: "julio",
    province: "alicante",
    total_event: 65,
    avg_ticket_price: 21,
    total_attendance: 14000,
    local_attendance: 8500,
    foreign_attendance: 5500,
    event_type: "Festivales, Conciertos, Teatro",
    avg_event_duration: 3,
  },
  {
    year: 2019,
    month: "julio",
    province: "las palmas",
    total_event: 60,
    avg_ticket_price: 19,
    total_attendance: 13000,
    local_attendance: 7000,
    foreign_attendance: 6000,
    event_type: "Festivales, Conciertos, Danza",
    avg_event_duration: 3,
  },
  {
    year: 2019,
    month: "julio",
    province: "madrid",
    total_event: 115,
    avg_ticket_price: 24,
    total_attendance: 29000,
    local_attendance: 19000,
    foreign_attendance: 10000,
    event_type: "Conciertos, Teatro, Danza",
    avg_event_duration: 2.5,
  },
  {
    year: 2019,
    month: "julio",
    province: "malaga",
    total_event: 75,
    avg_ticket_price: 23,
    total_attendance: 17000,
    local_attendance: 9500,
    foreign_attendance: 7500,
    event_type: "Festivales, Conciertos, Teatro",
    avg_event_duration: 3,
  },
  {
    year: 2015,
    month: "febrero",
    province: "alicante",
    total_event: 40,
    avg_ticket_price: 18,
    total_attendance: 8500,
    local_attendance: 6000,
    foreign_attendance: 2500,
    event_type: "Conciertos, Teatro, Exposiciones",
    avg_event_duration: 2,
  },
  {
    year: 2015,
    month: "febrero",
    province: "las palmas",
    total_event: 35,
    avg_ticket_price: 16,
    total_attendance: 7500,
    local_attendance: 4500,
    foreign_attendance: 3000,
    event_type: "Conciertos, Festivales, Teatro",
    avg_event_duration: 2.5,
  },
  {
    year: 2015,
    month: "febrero",
    province: "madrid",
    total_event: 100,
    avg_ticket_price: 22,
    total_attendance: 25000,
    local_attendance: 16000,
    foreign_attendance: 9000,
    event_type: "Conciertos, Teatro, Danza",
    avg_event_duration: 2.5,
  },
  {
    year: 2015,
    month: "febrero",
    province: "malaga",
    total_event: 50,
    avg_ticket_price: 20,
    total_attendance: 10000,
    local_attendance: 6500,
    foreign_attendance: 3500,
    event_type: "Conciertos, Exposiciones, Teatro",
    avg_event_duration: 2,
  },
  {
    year: 2015,
    month: "julio",
    province: "alicante",
    total_event: 60,
    avg_ticket_price: 20,
    total_attendance: 13000,
    local_attendance: 8000,
    foreign_attendance: 5000,
    event_type: "Festivales, Conciertos, Teatro",
    avg_event_duration: 3,
  },
  {
    year: 2015,
    month: "julio",
    province: "las palmas",
    total_event: 55,
    avg_ticket_price: 18,
    total_attendance: 12000,
    local_attendance: 6500,
    foreign_attendance: 5500,
    event_type: "Festivales, Conciertos, Danza",
    avg_event_duration: 3,
  },
  {
    year: 2015,
    month: "julio",
    province: "madrid",
    total_event: 105,
    avg_ticket_price: 23,
    total_attendance: 27000,
    local_attendance: 17000,
    foreign_attendance: 10000,
    event_type: "Conciertos, Teatro, Danza",
    avg_event_duration: 2.5,
  },
  {
    year: 2015,
    month: "julio",
    province: "malaga",
    total_event: 70,
    avg_ticket_price: 22,
    total_attendance: 16000,
    local_attendance: 9000,
    foreign_attendance: 7000,
    event_type: "Festivales, Conciertos, Teatro",
    avg_event_duration: 3,
  },
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
