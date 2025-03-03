
const express = require('express');
const cool = require('cool-ascii-faces');

const app = express();
const PORT = process.env.PORT || 16078;


app.use("/about", express.static(__dirname + "/public"));


app.get('/', (req, res) => {
    res.send(`
        <h1>Bienvenido al servidor del Grupo XX</h1>
        <p><a href="/about">Información del grupo</a></p>
        <p><a href="/cool">Cool</a></p>
    `);
});

app.get('/cool', (req, res) => {
    res.send(`
        <pre>${cool()}</pre>
        <br><a href="/">Volver</a>
    `);
});


app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});

