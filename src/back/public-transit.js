import DataStore from "nedb";
import express from 'express';
import request from 'request';

const BASE_API = "/api/v1";
let db_AGB = new DataStore({ filename: "publicTransitStats.db", autoload: true });
const RESOURCE = "public-transit-stats";

const initialData = [
    { year: 2024, province: "Madrid", ticket_price: 1.5, total_trips: 727780000, route_length: 26090.2 },
    { year: 2024, province: "Barcelona", ticket_price: 2.5, total_trips: 408601000, route_length: 27454.7 },
    { year: 2024, province: "Valencia", ticket_price: 1.5, total_trips: 115640000, route_length: 2729 },
    { year: 2024, province: "Sevilla", ticket_price: 1.5, total_trips: 88160000, route_length: 3515.1 },
    { year: 2024, province: "Bizkaia", ticket_price: 1.4, total_trips: 49007000, route_length: 547 },
    { year: 2024, province: "Malaga", ticket_price: 1.55, total_trips: 51300000, route_length: 4915.4 },
    { year: 2024, province: "Alicante", ticket_price: 1.35, total_trips: 19950000, route_length: 694 },

    { year: 2023, province: "Madrid", ticket_price: 1.5, total_trips: 694490000, route_length: 25159.7 },
    { year: 2023, province: "Barcelona", ticket_price: 2.2, total_trips: 404590000, route_length: 26885.2 },
    { year: 2023, province: "Valencia", ticket_price: 1.5, total_trips: 107100000, route_length: 2473.9 },
    { year: 2023, province: "Sevilla", ticket_price: 1.5, total_trips: 91420000, route_length: 3474.1 },
    { year: 2023, province: "Bizkaia", ticket_price: 1.4, total_trips: 55710000, route_length: 547 },
    { year: 2023, province: "Malaga", ticket_price: 1.55, total_trips: 65390000, route_length: 5824.7 },
    { year: 2023, province: "Alicante", ticket_price: 1.35, total_trips: 25120000, route_length: 691.4 },

    { year: 2015, province: "Madrid", ticket_price: 1.5, total_trips: 609900000, route_length: 24465.8 },
    { year: 2015, province: "Barcelona", ticket_price: 2.15, total_trips: 342300000, route_length: 27731 },
    { year: 2015, province: "Valencia", ticket_price: 1.5, total_trips: 98500000, route_length: 2947.1 },
    { year: 2015, province: "Sevilla", ticket_price: 1.5, total_trips: 86500000, route_length: 3234.1 },
    { year: 2015, province: "Bizkaia", ticket_price: 1.4, total_trips: 53000000, route_length: 514 },
    { year: 2015, province: "Malaga", ticket_price: 1.55, total_trips: 58600000, route_length: 5275.8 },
    { year: 2015, province: "Alicante", ticket_price: 1.35, total_trips: 22040000, route_length: 635.2 }
];

db_AGB.find({}, (err, trips) => {
    if (err) {
        console.error(`ERROR: ${err}`);
    } else if (trips.length < 1) {
        db_AGB.insert(initialData);
    }
});


function loadBackendAGB(app) {
    // Endpoint para cargar los datos iniciales desde el CSV
    app.get(`${BASE_API}/${RESOURCE}/loadInitialData`, (req, response) => {
        db_AGB.find({}, (err, tripsData) => {
            if (err) {
                response.status(500).send("Error code 01 (please contact admin)");
                console.error(`ERROR:${err}`);
            } else if (tripsData.length > 0) {
                response.sendStatus(200);
            } else if(tripsData.length < 1){
                db_AGB.insert(initialData);
                response.sendStatus(200);
            }
        });
    })
    // GET - Obtener todos los datos con paginación y filtrado por todos los campos
    app.get(`${BASE_API}/${RESOURCE}`, (req, response) => {
        let paramProvince = req.query.province;
        // Parámetros opcionales
        let paramYear = parseInt(req.query.year);
        let paramTicketPrice = parseFloat(req.query.ticket_price);
        let paramTotalTrips = parseInt(req.query.total_trips);
        let paramRouteLength = parseFloat(req.query.route_length);
        let paramOffset = req.query.offset;
        let paramLimit = req.query.limit;
        let paramFields = req.query.fields;

        let query = {};  // Creamos la variable donde iremos almacenando los filtros.

        if (paramProvince) {
            query.province = paramProvince;
        }
        if (paramYear) {
            query.year = paramYear;
        }
        if (paramTicketPrice) {
            query.ticket_price = paramTicketPrice;
        }
        if (paramTotalTrips) {
            query.total_trips = paramTotalTrips;
        }
        if (paramRouteLength) {
            query.route_length = paramRouteLength;
        }
        if (paramFields) {
            paramFields = paramFields.split(',');
        }
        if (paramOffset) {
            paramOffset = parseInt(paramOffset);
        } else {
            paramOffset = 0;
        }
        if (paramLimit) {
            paramLimit = parseInt(paramLimit);
        } else {
            paramLimit = 0;
        }

        db_AGB.find(query).sort({ province: 1 }).skip(paramOffset).limit(paramLimit).exec(function(err, docs){
            if (err) {
                response.status(500).send("Error code 01 (please contact admin)");
                console.error(`ERROR: ${err}`);
            } else if (!docs.length) {  // Si no existen 404
                return response.sendStatus(404);
            } else {
                response.send(JSON.stringify(docs.map((c) => {
                    delete c._id;
                    Object.keys(c).forEach(field => {  // Eliminamos los campos que no se incluyen en fields
                        if (paramFields != undefined && !paramFields.includes(field)) {
                            delete c[field];
                        }
                    });
                    return c;
                }), null, 2));
            }
        })
    });

    //proxy coste de vida
    const paths = '/proxy/cost-of-living';
    const apiServerHost = 'https://cost-of-living-and-prices.p.rapidapi.com';

    app.use(paths, function(req, res) {
        const url = apiServerHost + req.url;
        console.log('Proxying to:', url);
        const options = {
            url,
            headers: {
                'X-RapidAPI-Key': '2a354653a3mshe8b0c196513d19bp11ac11jsn5c666ee93581',
                'X-RapidAPI-Host': 'cost-of-living-and-prices.p.rapidapi.com'
            }
        };
        req.pipe(request(options)).pipe(res);
    });

    //proxy temperatura g15
    const temperatureProxyPath = '/proxy/temperature-stats';
    const temperatureApiHost = 'https://sos2425-15.onrender.com';

    app.use(temperatureProxyPath, function(req, res) {
        const url = temperatureApiHost + req.url;
        console.log('Proxying temperature-stats to:', url);
        const options = { url };
        req.pipe(request(options)).pipe(res);
    });

    // Redireccionar a la documentación
    app.get(`${BASE_API}/${RESOURCE}/docs`, (req, response) => {
        response.redirect("https://documenter.getpostman.com/view/41997974/2sB2cSi4as");
    });
    // GET - Obtener datos por una provincia
    app.get(`${BASE_API}/${RESOURCE}/:province`, (req, response) => {
        let paramProvince = req.params.province;
        db_AGB.find({ province: paramProvince }, function(err, docs) {
            if (err) {
                response.status(500).send("Error code 01 (please contact admin)");
                console.error(`ERROR: ${err}`);
            } else if(!docs.length){
                return response.sendStatus(404);
            } else {
                docs = docs.map(d => {
                    delete d._id;
                    return d;
                });
                response.send(JSON.stringify(docs, null, 2));
            }
        });
    });

    // GET - Obtener datos por identificador compuesto (province + year)
    app.get(`${BASE_API}/${RESOURCE}/:province/:year`, (req, response) => {
        let paramProvince = req.params.province;
        let paramYear = parseInt(req.params.year);
        
        db_AGB.findOne({ province: paramProvince, year:paramYear }, function(err, docs) {
            if (err) {
                response.status(500).send("Error code 01 (please contact admin)");
                console.error(`ERROR: ${err}`);
            } else if(!docs){
                return response.sendStatus(404);
            } else {
                delete docs._id;
                response.send(JSON.stringify(docs, null, 2))
            }
        });
    });

    // POST - Agregar un nuevo dato
    app.post(`${BASE_API}/${RESOURCE}`, (req, response) => {
        let postBody = req.body;
        let requiredFields = ["province", "year", "ticket_price", "total_trips", "route_length"];
        
        // Comprobar que estén todos los campos requeridos
        let missingFields = requiredFields.filter(field => !(field in postBody));
        // Comprobar que los valores no estén vacíos o nulos
        let invalidValues = requiredFields.filter(field => (
            postBody[field] === "" || postBody[field] === null || postBody[field] === undefined
        ));

    if (missingFields.length > 0 || invalidValues.length > 0){
        return response.status(400).json({
            error: "Bad Request",
            missingFields,
            invalidValues
        });
    }
        db_AGB.find({ province: postBody.province, year: parseInt(postBody.year)}, function(err, docs){
            if (err) {
                response.sendStatus(500).send("Error code 01 (please contact admin)");
                console.error(`ERROR: ${err}`);
            } else if (docs.length > 0) {
                return response.sendStatus(409); //El dato ya existe, hay conflicto
            } else{
                db_AGB.insert(postBody);
                response.sendStatus(201);
            }
        });        
    });

    // PUT - Actualizar datos por identificador compuesto (province + year)
    app.put(`${BASE_API}/${RESOURCE}/:province/:year`, (req, response) => {
        let paramProvince = req.params.province;
        let paramYear = parseInt(req.params.year);
        let postBody = req.body;

        let ticket_price = parseFloat(postBody.ticket_price);
        let total_trips = parseInt(postBody.total_trips);
        let route_length = parseFloat(postBody.route_length);

        let allowedFields = ["province", "year", "ticket_price", "total_trips", "route_length"];
        let invalidFields = Object.keys(postBody).filter(f => !allowedFields.includes(f));
        let invalidValues = Object.values(postBody).filter(
            f => ((f === "") || (f === null) || (f === undefined))
        );

        if (invalidFields.length > 0 || invalidValues.length > 0){
            return response.sendStatus(400);
        } else if(!((postBody.province === paramProvince) && (parseInt(postBody.year) === paramYear))){
            return response.sendStatus(400);
        } else {
            db_AGB.find({ province: paramProvince, year:paramYear }, function(err, docs) {
                if (err) {
                    response.status(500).send("Error code 01 (please contact admin)");
                    console.error(`ERROR: ${err}`);
                } else if (docs.length === 0) {
                    return response.sendStatus(404);
                } else {
                    db_AGB.update({ _id: docs[0]._id}, //Buscamos el id en la base de datos
                        { //Indicamos los campos a modificar con $set
                            $set: {
                                ticket_price: ticket_price, 
                                total_trips: total_trips, 
                                route_length: route_length
                            }
                        }, 
                        {}, 
                        function(err, numReplaced){
                            if(err){
                               response.sendStatus(500);
                               console.error(`ERROR: ${err}`);
                            }
                            else{
                                response.sendStatus(200);
                            }
                        });
                }
            });
        }

    });

    // DELETE - Eliminar todos los datos
    app.delete(`${BASE_API}/${RESOURCE}`, (req, response) => {
        db_AGB.remove({}, { multi: true }, (err, numRemoved) => {
            if (err){
                response.status(500).send("Error code 01 (please contact admin)");
                console.error(`ERROR: ${err}`); 
            } else if (numRemoved === 0){
                return response.status(404).send("No hay datos para eliminar.");
            } else{
            response.sendStatus(200);
            }
        });
    });

    // DELETE - Eliminar una estadística por identificador compuesto (province + year)
    app.delete(`${BASE_API}/${RESOURCE}/:province/:year`, (req, response) => {
        let paramProvince = req.params.province;
        let paramYear = parseInt(req.params.year);

        db_AGB.remove({ province: paramProvince, year:paramYear }, function(err, numRemoved){
            if(err){
                response.sendStatus(500).send("Error code 01 (please contact admin)");
                console.error(`ERROR: ${err}`);
            } else if (numRemoved === 0) {
                return response.status(404).send("Ese dato no existe.");
            } else {
                response.sendStatus(200);
            }
        });
    });

    // Manejo de métodos no permitidos
    app.put(`${BASE_API}/${RESOURCE}`, (req, response) => {
        response.sendStatus(405);
    });

    app.post(`${BASE_API}/${RESOURCE}/:province/:year`, (req, response) => {
        response.sendStatus(405);
    });
}

export { loadBackendAGB };
