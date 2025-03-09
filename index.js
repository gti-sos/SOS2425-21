
const express = require('express');
const cool = require('cool-ascii-faces');
const dataLEL = require('./index-LEL.js');
const app = express();
const PORT = process.env.PORT || 16078;

app.get('/', (request, response) =>{
    response.send(`Este es el servidor del <a href="/about">grupo 21</a><br>
        <a href="/cool">Cool</a><br>
        <a href="/samples/LEL">Algoritmo LEL</a><br>
        <a href="/samples/AGB">Algoritmo AGB</a>`);
}
);

app.get('/cool', (req, res) => {
    let caritas = cool();
    res.send(`${caritas}<br><a href="/">Volver</a>`);
});

app.get("/about", (req, res) => {
    res.sendFile(__dirname + "/about.html");
});

app.get("/samples/LEL", (req, res) => {
    console.log("Accediendo a /samples/LEL");
    const result = dataLEL();
    res.json(result);
})

//AGB
const calcularMedia = require("./samples/AGB/index-AGB.js");
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
                <p id="res">Media de transaction_total en ${prov}: ${media.toFixed(2)}</p><br>
                <a href="/">Volver</a>   
            </body>
            </html>`);
    } catch (error) {
        console.error("Error al calcular la media:", error);
        response.status(500).send("Error interno del servidor.");
    }
});app.get("/samples/AGB", async (request, response) => {
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
                <p id="res">Media de total_trips en ${prov}: ${parseFloat(media).toFixed(2)}</p>
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

