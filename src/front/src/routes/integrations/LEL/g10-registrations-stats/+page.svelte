<svelte:head>
  <script src="https://code.highcharts.com/highcharts.js"></script>
  <script src="https://code.highcharts.com/modules/exporting.js"></script>
  <script src="https://code.highcharts.com/modules/export-data.js"></script>
  <script src="https://code.highcharts.com/modules/accessibility.js"></script>
</svelte:head>

<script lang="ts">
  import { onMount } from 'svelte';
  import { dev, browser } from '$app/environment';
  // @ts-ignore
  const Highcharts = window.Highcharts;

  interface Transaction  { year: number; transaction_total: number; }
  interface Registration { year: number; total_general:   number; }

  let chart: any;
  let years: number[] = [];

  // Mapas año → suma
  const registrationByYear = new Map<number,number>();
  const transactionByYear  = new Map<number,number>();

  function drawChart() {
    // categorías: todos los años
    const categories = years.map(String);

    // datos: recorremos years para mantener el mismo orden
    const regData = years.map(y => registrationByYear.get(y) || 0);
    const trnData = years.map(y => transactionByYear .get(y) || 0);

    if (!chart) {
      chart = Highcharts.chart('container', {
        chart: { type: 'area' },
        title: { text: `Matriculaciones vs Transacciones Totales (${years[0]}–${years[years.length-1]})` },
        xAxis: { categories, title: { text: 'Año' } },
        yAxis: { title: { text: 'Cantidad' } },
        plotOptions: {
          area: {
            marker: { enabled: false, radius: 2 }
          }
        },
        series: [
          { name: 'Matriculaciones', data: regData, type: 'area' },
          { name: 'Transacciones',   data: trnData, type: 'area' }
        ],
        credits: { enabled: false }
      });
    } else {
      chart.update({
        xAxis: { categories },
        series: [
          { data: regData },
          { data: trnData }
        ]
      }, true, true);
    }
  }

  if (browser) {
    onMount(async () => {
      const REG_API = dev
        ? 'http://localhost:16078/api-proxy/api/v1/registrations-stats'
        : '/api-proxy/api/v1/registrations-stats';
      const TRN_API = dev
        ? 'http://localhost:16078/api/v1/home-buying-selling-stats'
        : '/api/v1/home-buying-selling-stats';

      const [resReg, resTrn] = await Promise.all([
        fetch(REG_API),
        fetch(TRN_API)
      ]);

      const registrations: Registration[] = await resReg.json();
      const transactions:  Transaction[]  = await resTrn.json();

      // sacamos todos los años únicos y los ordenamos
      years = Array.from(new Set([
        ...registrations.map(r => r.year),
        ...transactions .map(t => t.year)
      ])).sort((a,b) => a - b);

      // acumulamos por año
      years.forEach(y => {
        const sumReg = registrations
          .filter(r => r.year === y)
          .reduce((acc,r) => acc + (r.total_general||0), 0);
        const sumTrn = transactions
          .filter(t => t.year === y)
          .reduce((acc,t) => acc + (t.transaction_total||0), 0);

        registrationByYear.set(y, sumReg);
        transactionByYear .set(y, sumTrn);
      });

      drawChart();
    });
  }
</script>

{#if browser}
<figure class="highcharts-figure">
  <div id="container" style="width:100%; height:400px;"></div>
  <p class="highcharts-description">
    Evolución de matriculaciones vs transacciones totales por año.
  </p>
</figure>
{/if}

<style>
  .highcharts-figure { max-width:800px; margin:1em auto; }
  .highcharts-description { text-align:center; color:#555; margin-top:0.5rem; }
</style>