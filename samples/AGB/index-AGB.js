const fs = require("fs");
const csv = require("csv-parser");

function calcularMedia(provincia) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream("samples/AGB/SOS2425-21-Propuesta - Andrea.csv") 
      .pipe(csv())
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", () => {
        const field = "total_trips"; 

        // Filtra las filas por provincia
        const filteredRows = results.filter(row => row.province === provincia);

        // Convierte los valores a número
        const numericValues = filteredRows
          .map(row => parseFloat(row[field].replace(/\./g, "").replace(",", ".")))
          .filter(value => !isNaN(value));

        // Calcula la media
        const sum = numericValues.reduce((acc, val) => acc + val, 0);
        const mean = numericValues.length > 0 ? sum / numericValues.length : 0;

        resolve(mean);
      })
      .on("error", (err) => reject(err));
  });
}

module.exports = calcularMedia;