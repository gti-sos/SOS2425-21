const fs = require("fs");
const csv = require("csv-parser");

const results = [];

fs.createReadStream("SOS2425-21-Propuesta - Andrea.csv") 
  .pipe(csv())
  .on("data", (row) => {
    results.push(row);
  })
  .on("end", () => {
    // Selecciona la provincia y el campo a calcular
    const targetProvince = "Madrid"; // Cambia esto según la provincia deseada
    const field = "total_trips"; // Nombre del campo a promediar

    // Filtra las filas que corresponden a la provincia seleccionada
    const filteredRows = results.filter(row => row.province === targetProvince);

    // Convierte los valores a número (reemplaza comas por puntos si es necesario)
    const numericValues = filteredRows
      .map(row => parseFloat(row[field].replace(/\./g, "").replace(",", "."))) // Convierte a número
      .filter(value => !isNaN(value)); // Excluye valores no numéricos

    // Calcula la media
    const sum = numericValues.reduce((acc, val) => acc + val, 0);
    const mean = numericValues.length > 0 ? sum / numericValues.length : 0;

    console.log(`Media de ${field} en ${targetProvince}:`, mean.toFixed(2));
  });
