const fs = require("fs");
const csv = require("csv-parser");

const results = [];

fs.createReadStream("SOS2425-21-Propuesta - Paula.csv")
  .pipe(csv())
  .on("data", (row) => {
    results.push(row);
  })
  .on("end", () => {
    // Provincia y campo a calcular
    const targetProvince = "alicante"; // Usar la provincia que existe en el CSV
    const field = "transaction_total"; // Usar un campo que realmente existe

    // Filtra por provincia, usando trim() para evitar espacios extra
    const filteredRows = results.filter(
      row => row.province.trim().toLowerCase() === targetProvince.toLowerCase()
    );

    // Convierte valores a números y excluye valores no numéricos
    const numericValues = filteredRows
      .map(row => parseFloat(row[field]))
      .filter(value => !isNaN(value));

    // Calcula la media
    const sum = numericValues.reduce((acc, val) => acc + val, 0);
    const mean = numericValues.length > 0 ? sum / numericValues.length : 0;

    console.log(`Media de ${field} en ${targetProvince}:`, mean.toFixed(2));
  });
