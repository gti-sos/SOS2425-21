const fs = require("fs");
const csv = require("csv-parser");

const results = [];

fs.createReadStream("SOS2425-21-Propuesta - Laura.csv") 
  .pipe(csv())
  .on("data", (row) => {
    results.push(row);
  })
  .on("end", () => {
    // Provincia y campo a calcular
    const targetProvince = "Madrid"; // Cambia según la provincia deseada
    const field = "total_attendance"; // Campo a calcular la media

    // Filtra por provincia
    const filteredRows = results.filter(row => row.province.toLowerCase() === targetProvince.toLowerCase());

    // Convierte valores a números y excluye valores no numéricos
    const numericValues = filteredRows
      .map(row => parseInt(row[field], 10))
      .filter(value => !isNaN(value));

    // Calcula la media
    const sum = numericValues.reduce((acc, val) => acc + val, 0);
    const mean = numericValues.length > 0 ? sum / numericValues.length : 0;

    console.log(`Media de ${field} en ${targetProvince}:`, mean.toFixed(2));
  });
