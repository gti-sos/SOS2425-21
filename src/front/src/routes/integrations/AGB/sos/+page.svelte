<svelte:head>
  <script src="https://code.highcharts.com/highcharts.js"></script>
  <script src="https://code.highcharts.com/modules/heatmap.js"></script>
  <script src="https://code.highcharts.com/modules/exporting.js"></script>
  <script src="https://code.highcharts.com/modules/export-data.js"></script>
  <script src="https://code.highcharts.com/modules/accessibility.js"></script>

  <script src="https://cdn.plot.ly/plotly-2.27.1.min.js"></script>

  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>

  <link rel="stylesheet" href="https://unpkg.com/uplot@1.6.21/dist/uPlot.min.css">
  <script src="https://unpkg.com/uplot@1.6.21/dist/uPlot.iife.min.js"></script>

</svelte:head>

<script>
// @ts-nocheck
  import { onMount, tick } from 'svelte';

  let cargandoTransporte = true;
  let cargandoContratos = true;
  let cargandoTemperaturas = true;
  let cargandoUniversidad = true;
  let cargandoAccidentes = true;

  let chartContainer;
  let plotContainer;
  let radarContainer;
  let streamContainer;

  let transporte = [];
  let contratos = [];
  let temperatura = [];
  let universidad = [];
  let accidentes = [];

  const provinciasMap = {
    "Alicante/Alacant": "Alicante",
    "Valencia/València": "Valencia"
  };
  const provinciasObjetivo = ["Alicante", "Valencia"];
  const añoObjetivo = 2024;

  // Para temperaturas y transporte 
  const provinciasObjetivoTemp = ["Sevilla", "Málaga"];
  const añoObjetivoTemp = 2020;

  async function getData21() {
    try {
      const miapi = await fetch('https://sos2425-21.onrender.com/api/v1/public-transit-stats');
      transporte = await miapi.json();

    } catch (error) {
      console.error("ERROR: GET data 21", error);
    } finally {
      cargandoTransporte = false;
    }
  }
  async function getData18() {
    try {
      const api18 = await fetch('https://sos2425-18.onrender.com/api/v2/contr-mun-stats');
      contratos = await api18.json();
    } catch(err){
      console.error("ERROR: GET data 18", error);
    } finally{
      cargandoContratos = false;
      await tick();
      if (chartContainer) {
        dibujarHeatmap();
      }
    }
  }
  async function getData15() {
    try {
      const api15 = await fetch('https://sos2425-15.onrender.com/api/v1/temperature-stats');
      temperatura = await api15.json();
    } catch(err){
      console.error("ERROR: GET data 15", error);
    } finally {
      cargandoTemperaturas = false;
      await tick();
      if (plotContainer){
        dibujarViolinPlot();
      }
    }
  }

  async function getData17() {
    try {
      await fetch("https://sos2425-17.onrender.com/api/v2/university-demands/loadInitialData");
    } catch (err) {
      console.warn("Los datos iniciales ya estaban cargados o hubo otro aviso:", err);
    }
    try {
      const api17 = await fetch("https://sos2425-17.onrender.com/api/v2/university-demands");
      universidad = await api17.json();
    } catch (err) {
      console.error("ERROR: GET data 17", err);
    } finally {
      cargandoUniversidad = false;
      await tick();
      if (radarContainer) {
        dibujarPolarChart();
      }
    }
  }

  async function getData20() {
    try {
      await fetch("https://sos2425-20.onrender.com/api/v1/accidents-with-animals/loadInitialData");
    } catch (err) {
      console.warn("Los datos iniciales ya estaban cargados o hubo otro aviso:", err);
    }
    try {
      const api20 = await fetch('https://sos2425-20.onrender.com/api/v1/accidents-with-animals');
      accidentes = await api20.json();
    } catch(err){
      console.error("ERROR: GET data 20", error);
    } finally {
      cargandoAccidentes = false;
      await tick();
      if (streamContainer){
        console.log('Dibujando el gráfico de scatter');
        dibujarStreamGraph();
      }
    }
  }
  
  function dibujarHeatmap() {
    const contratosPorProvincia = {};
    contratos.forEach(c => {
      const nombre = provinciasMap[c.prov_name];
      if (provinciasObjetivo.includes(nombre) && c.year === añoObjetivo) {
        contratosPorProvincia[nombre] = (contratosPorProvincia[nombre] || 0) + c.num_contracts;
      }
    });

    const viajesPorProvincia = {};
    transporte.forEach(t => {
      if (provinciasObjetivo.includes(t.province)) {
        viajesPorProvincia[t.province] = (viajesPorProvincia[t.province] || 0) + t.total_trips;
      }
    });
    const categoriasY = ["Viajes", "Contratos"];
    const categoriasX = provinciasObjetivo;

    const data = [];

    provinciasObjetivo.forEach((prov, xIndex) => {
      data.push([xIndex, 0, viajesPorProvincia[prov] || 0]);      // viajes
      data.push([xIndex, 1, contratosPorProvincia[prov] || 0]);   // contratos
    });

    Highcharts.chart(chartContainer, {
      chart: {
        type: 'heatmap',
        plotBorderWidth: 1
      },
      xAxis: {
        categories: categoriasX,
        title: { text: 'Provincia' }
      },
      yAxis: {
        categories: categoriasY,
        title: { text: 'Tipo de dato' },
        reversed: true
      },
      colorAxis: {
        min: 0,
        minColor: '#FFFFFF',
        maxColor: Highcharts.getOptions().colors[0]
      },
      legend: {
        align: 'right',
        layout: 'vertical',
        margin: 0,
        verticalAlign: 'top',
        y: 25,
        symbolHeight: 280
      },
      tooltip: {
        formatter: function () {
          return `<b>${this.series.yAxis.categories[this.point.y]}</b> en <b>${this.series.xAxis.categories[this.point.x]}</b>: <b>${this.point.value.toLocaleString()}</b>`;
        }
      },
      series: [{
        name: 'Cantidad',
        borderWidth: 1,
        data: data,
        dataLabels: {
          enabled: true,
          color: '#000000'
        }
      }]
    });
  }

  function dibujarViolinPlot() {
    const provinciasObjetivo = ["Sevilla", "Málaga"];

    const datosTransporte = transporte
      .filter(item =>
        provinciasObjetivo.includes(item.province) && item.year === 2024
      )
      .map(item => item.total_trips);

    const datosTemperatura = temperatura
      .filter(item =>
        provinciasObjetivo.includes(item.province) && item.year === 2023
      )
      .map(item => item.average_temperature);

    const data = [
      {
        type: 'violin',
        y: datosTransporte,
        x: Array(datosTransporte.length).fill('Viajes (2024)'),
        name: 'Viajes (2024)',
        box: { visible: true },
        line: { color: 'blue' },
        meanline: { visible: true }
      },
      {
        type: 'violin',
        y: datosTemperatura,
        x: Array(datosTemperatura.length).fill('Temperatura (2023)'),
        name: 'Temperatura (2023)',
        box: { visible: true },
        line: { color: 'red' },
        meanline: { visible: true }
      }
    ];

    const layout = {
      yaxis: { zeroline: false },
      xaxis: { title: 'Categoría' },
      margin: {
        l: 80,
        r: 80, 
        t: 100, 
        b: 100  
      },
      height: 600, 
      //width: 800,  
      showlegend: true,
      xaxis: {
        title: {
          text: 'Categoría',
          font: { size: 14 },
          standoff: 10
        },
        tickangle: -45,  
      },
      yaxis: {
        title: {
          text: 'Valor',
          font: { size: 14 }
        }
      }
    };

    Plotly.newPlot(plotContainer, data, layout);
  }

function dibujarPolarChart() {
  // Graduados en Badajoz 2017-2018
  const demanda = universidad.find(u =>
    u.location === "BADAJOZ" &&
    u.academicYear === "2017-2018" &&
    u.degree === "GRADO EN EDUCACIÓN PRIMARIA"
  );

  // Ruta en Alicante 2024
  const transporteAlicante = transporte.find(t =>
    t.province === "Alicante" && t.year === 2024
  );

  const graduados = demanda?.graduated ?? 0;
  const ruta = transporteAlicante?.route_length ?? 0;

  const options = {
    chart: {
      type: 'polarArea',
      height: 500
    },
    labels: ['Graduados Badajoz (2017-18)', 'Longitud ruta Alicante (2024)'],
    series: [graduados, ruta],
    stroke: {
      colors: ['#fff']
    },
    fill: {
      opacity: 0.8
    }
  };

  new ApexCharts(radarContainer, options).render();
}

function dibujarStreamGraph() {
  const añoObjetivo = 2023;

  // Ticket price por provincia
  const ticketData = transporte
    .filter(d => d.year === añoObjetivo)
    .reduce((acc, curr) => {
      if (!acc[curr.province]) acc[curr.province] = [];
      acc[curr.province].push(curr.ticket_price);
      return acc;
    }, {});

  const avgTicketByProvince = Object.entries(ticketData).map(([prov, precios]) => ({
    label: `Precio: ${prov}`,
    value: precios.reduce((a, b) => a + b, 0) / precios.length
  }));

  // Accidentes por animal_group
  const accidentData = accidentes
    .filter(d => d.year === añoObjetivo)
    .reduce((acc, curr) => {
      acc[curr.animal_group] = (acc[curr.animal_group] || 0) + 1;
      return acc;
    }, {});

  const animalSeries = Object.entries(accidentData).map(([animal, count]) => ({
    label: `Animal: ${animal}`,
    value: count
  }));

  const labels = [...avgTicketByProvince, ...animalSeries];
  const categories = labels.map(e => e.label);
  const values = labels.map(e => e.value);

  const opts = {
    width: streamContainer.clientWidth,
    height: 400,
    series: [
      {
        label: "Categoría",
      },
      {
        label: "Valor",
        stroke: "blue",
        fill: "rgba(0, 100, 255, 0.3)"
      }
    ],
    scales: {
      x: { time: false },
      y: { auto: true }
    },
    axes: [
      {
        stroke: "#333",
        grid: { show: false },
        values: categories,
        space: 100
      },
      {}
    ]
  };

  const data = [
    categories.map((_, i) => i),
    values
  ];

  new uPlot(opts, data, streamContainer);
}

onMount(async () => {
  await getData21();
  await getData18();
  await getData15();
  await getData17();
  await getData20();
});

</script>

<section>
  <h2>Transporte y Contratos</h2>
  {#if cargandoContratos || cargandoTransporte}
    <p>Cargando datos...</p>
  {:else}
    <div bind:this={chartContainer} style="width: 100%; height: 500px;"></div>
  {/if}
</section>

<section>
  <h2>Transporte y Temperatura</h2>
  {#if cargandoTemperaturas || cargandoTransporte}
    <p>Cargando datos...</p>
  {:else}
    <div bind:this={plotContainer} style="width: 100%; height: 500px; overflow: hidden;"></div>
  {/if}
</section>

<section>
  <h2>Transporte y Universidades</h2>
  {#if cargandoTransporte || cargandoUniversidad}
    <p>Cargando datos...</p>
  {:else}
    <div bind:this={radarContainer} style="width: 100%; height: 500px;"></div>
  {/if}
</section>

<section>
  <h2>Transporte y Accidentes animales</h2>
  {#if cargandoTransporte || cargandoAccidentes}
    <p>Cargando datos...</p>
  {:else}
    <div bind:this={streamContainer} style="width: 100%; height: 400px;"></div>
  {/if}
</section>