const fs = require("fs");
const csv = require("csv-parser");


function calcularMediaLEL(provincia){
  return new Promise((resolve, reject) => {
    const results = [];

  fs.createReadStream("samples/LEL/SOS2425-21-Propuesta - Laura.csv") 
    .pipe(csv())
    .on("data", (row) => {
      results.push(row);
    })
    .on("end", () => {
      // Provincia y campo a calcular
      const field = "transaction_total"; // Campo a calcular la media
      const filteredRows = results.filter(row => row.province.toLowerCase() === provincia.toLowerCase());

      // Convierte valores a números y excluye valores no numéricos
      const numericValues = filteredRows
      .map(row => parseInt(row[field], 10))
      .filter(value => !isNaN(value));

      // Calcula la media
      const sum = numericValues.reduce((acc, val) => acc + val, 0);
      const mean = numericValues.length > 0 ? sum / numericValues.length : 0;

      resolve(mean);
    })
    .on("error", (err) => reject(err));
  });
}

module.exports = calcularMediaLEL;
