const fs = require("fs");
const csv = require("csv-parser");

function calcularMedia(provincia) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream("samples/PRG/SOS2425-21-Propuesta - Paula.csv") 
      .pipe(csv())
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", () => {
        const field = "total_attendance"; // El campo que deseas calcular la media
        const filteredRows = results.filter(row => row.province === provincia);

        const numericValues = filteredRows
            .map(row => {
              // Eliminar cualquier carácter que no sea número, punto o coma
              const cleanValue = row[field].replace(/[^\d,]/g, "").replace(",", ".");
              const num = parseFloat(cleanValue);
              return isNaN(num) ? null : num;
            })
            .filter(value => value !== null);

        // Calcula la media
        const sum = numericValues.reduce((acc, val) => acc + val, 0);
        const mean = numericValues.length > 0 ? sum / numericValues.length : 0;

        resolve(mean); 
      })
      .on("error", (err) => reject(err));
  });
}

module.exports = calcularMedia;
