
const express = require('express');
const cool = require('cool-ascii-faces');
const app = express();
const PORT = process.env.PORT || 16078;

app.get('/', (request, response) => {
    response.send(`Este es el servidor del <a href="/about">grupo 21</a><br>
        <a href="/cool">Cool</a><br>
        <a href="/samples/LEL">Algoritmo LEL</a><br>
        <a href="/samples/AGB">Algoritmo AGB</a><br>
        <a href="/samples/PRG">Algoritmo PRG</a>`);  
});


app.get('/cool', (req, res) => {
    let caritas = cool();
    res.send(`${caritas}<br><a href="/">Volver</a>`);
});

app.get("/about", (req, res) => {
    res.sendFile(__dirname + "/about.html");
});


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
                <p id="res">Media de total_trips en ${prov}: ${media.toFixed(2)}</p><br>
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

// PRG - NUEVO CÓDIGO AGREGADO
const fs = require("fs");
const csv = require("csv-parser");

app.get("/samples/PRG", (req, res) => {
    const results = [];
    fs.createReadStream("samples/PRG/SOS2425-21-Propuesta - Paula.csv")
        .pipe(csv())
        .on("data", (row) => {
            results.push(row);
        })
        .on("end", () => {
            const targetProvince = "alicante";
            const field = "total_event";  // ✅ Usa un campo existente del CSV

            const filteredRows = results.filter(
                row => row.province.trim().toLowerCase() === targetProvince.toLowerCase()
            );

            const numericValues = filteredRows
                .map(row => parseFloat(row[field].replace(/,/g, "")))  // ✅ Limpia las comas en los números
                .filter(value => !isNaN(value));

            const sum = numericValues.reduce((acc, val) => acc + val, 0);
            const mean = numericValues.length > 0 ? sum / numericValues.length : 0;

            res.send(`<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>INDEX-PRG</title>
                </head>
                <body>
                    <h1>INDEX-PRG</h1>
                    <p id="res">Media de ${field} en ${targetProvince}: ${mean.toFixed(2)}</p><br>
                    <a href="/">Volver</a>   
                </body>
                </html>`);
        })
        .on("error", (err) => {
            console.error("Error al procesar el CSV:", err);
            res.status(500).send("Error al procesar el archivo CSV.");
        });
});

//LEL
const calcularMedia = require("./samples/LEL/index-LEL.js");
app.get("/samples/LEL", async (request, response) => {
    const prov = "Madrid";
    try {
        const media = await calcularMedia(prov);
        response.send(`<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>INDEX-LEL</title>
            </head>
            <body>
                <h1>INDEX-LEL</h1>
                <p id="res">Media de transacciones en ${prov}: ${media.toFixed(2)}</p><br>
                <a href="/">Volver</a>   
            </body>
            </html>`);
    } catch (error) {
        console.error("Error al calcular la media:", error);
        response.status(500).send("Error interno del servidor.");
    }
});app.get("/samples/LEL", async (request, response) => {
    const prov = "Madrid";
    try {
        const media = await calcularMedia(prov);
        response.send(`<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>INDEX-LEL</title>
            </head>
            <body>
                <h1>INDEX-AGB</h1>
                <p id="res">Media de transacciones en ${prov}: ${parseFloat(media).toFixed(2)}</p>
                <a href="/">Volver</a>   
            </body>
            </html>`);
    } catch (error) {
        console.error("Error al calcular la media:", error);
        response.status(500).send("Error interno del servidor.");
    }
});
