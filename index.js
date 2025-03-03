
const express = require('express');
const cool = require('cool-ascii-faces');

const app = express();
const PORT = process.env.PORT || 16078;


app.use("/about", express.static(__dirname + "/public/about.html"));

app.get('/', (request, response) =>{
    response.send(`Este es el servidor del <a href="/about">grupo 21</a><br>
        <a href="/cool">Cool</a><br>
        <a href="/samples/LEL">Algoritmo LEL</a>`);
}
);



app.get('/cool', (req, res) => {
    let caritas = cool();
    reponse.send(`${caritas}<br><a href="/">Volver</a>`);
});


app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});

