<script>
  // @ts-nocheck
  import { onMount } from 'svelte';
  import zingchart from 'zingchart/es6';
  import 'zingchart/es6';

  const API = import.meta.env.DEV
    ? 'http://localhost:16078/api/v1/cultural-event'
    : '/api/v1/cultural-event';

  let chartData = [];
  let selectedYear = '';
  let uniqueYears = [];

  async function fetchData() {
    try {
      const res = await fetch(API);
      const data = await res.json();
      chartData = data;
      uniqueYears = [...new Set(data.map((d) => d.year))];
      if (!selectedYear && uniqueYears.length > 0) selectedYear = uniqueYears[0];
      renderCharts();
    } catch (err) {
      console.error('Error fetching data', err);
    }
  }

  function renderCharts() {
    const filtered = chartData.filter((d) => d.year == selectedYear);
    const provinces = [...new Set(filtered.map((d) => d.province))];

    // Bubble Chart
    const bubbleSeries = filtered.map((d) => ({
      text: d.province,
      values: [[Math.random() * 100, Math.random() * 100, d.total_event]]
    }));

    zingchart.render({
      id: 'bubbleChart',
      width: '100%',
      height: 400,
      data: {
        type: 'bubble',
        title: { text: `Total de eventos por provincia` },
        scaleX: { label: { text: 'X (aleatorio)' } },
        scaleY: { label: { text: 'Y (aleatorio)' } },
        series: bubbleSeries,
        animation: { effect: 5, method: 0, speed: 800 }
      }
    });

    // Radar Chart
    const attendanceData = provinces.map((p) =>
      filtered.filter((d) => d.province === p).reduce((sum, d) => sum + d.total_attendance, 0)
    );

    zingchart.render({
      id: 'attendanceChart',
      width: '100%',
      height: 400,
      data: {
        type: 'radar',
        title: { text: 'Asistencia total por provincia' },
        scaleK: { values: provinces, labels: provinces },
        scaleV: { label: { text: 'Asistentes' } },
        series: [{
          values: attendanceData,
          text: 'Asistencia',
          lineColor: '#007bff',
          backgroundColor: '#007bff',
          alpha: 0.5
        }],
        animation: { effect: 2, method: 3, speed: 500 }
      }
    });

    // Gauge Chart
    const avgPrice = (
      filtered.reduce((sum, d) => sum + d.avg_ticket_price, 0) / filtered.length
    ).toFixed(2);

    zingchart.render({
      id: 'gaugeChart',
      width: '100%',
      height: 300,
      data: {
        type: 'gauge',
        title: { text: 'Precio Medio de Entrada' },
        scaleR: {
          aperture: 180,
          values: '0:50:5',
          center: { size: 5 },
          ring: {
            size: 10,
            rules: [
              { rule: '%v < 15', backgroundColor: '#f44336' },
              { rule: '%v >= 15 && %v < 25', backgroundColor: '#ff9800' },
              { rule: '%v >= 25', backgroundColor: '#4caf50' }
            ]
          }
        },
        series: [{ values: [parseFloat(avgPrice)] }],
        animation: { effect: 4, method: 1, speed: 700 }
      }
    });
  }

  onMount(() => fetchData());
</script>

<svelte:head>
  <title>Gráficas Interactivas - Eventos Culturales</title>
</svelte:head>

<section class="container">
  <h2 class="title">Visualización Interactiva de Eventos Culturales</h2>
  <div class="selector">
    <label for="year">Selecciona un año:</label>
    <select id="year" bind:value={selectedYear} on:change={renderCharts}>
      {#each uniqueYears as year}
        <option value={year}>{year}</option>
      {/each}
    </select>
  </div>

  <div id="bubbleChart" class="chart"></div>
  <div id="attendanceChart" class="chart"></div>
  <div id="gaugeChart" class="chart"></div>
</section>

<style>
  .container {
    max-width: 1000px;
    margin: 2rem auto;
    padding: 1rem;
    border-radius: 1rem;
    background: #f9fafb;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  }

  .title {
    text-align: center;
    font-size: 1.8rem;
    color: #1e3a8a;
    margin-bottom: 2rem;
  }

  .selector {
    text-align: center;
    margin-bottom: 2rem;
  }

  .selector select {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 1rem;
  }

  .chart {
    margin-bottom: 2.5rem;
    border-radius: 0.75rem;
    overflow: hidden;
    background: white;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  }
</style>
