<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';


  const YEAR    = 2015;                                       
  const TX_API  = `/api/v1/home-buying-selling-stats?year=${YEAR}`;
  const HPI_API = `/api-proxy/eurostat-hpi?year=${YEAR}`;

  let canvas!: HTMLCanvasElement;
  let chart : Chart | undefined;
  let errorMsg: string | null = null;


  async function getData() {
    const txRows = await (await fetch(TX_API)).json();
    const rowsCount = Array.isArray(txRows) ? txRows.length : 0;
    const { hpi } = await (await fetch(HPI_API)).json();

    return { rowsCount, hpi: Number(hpi) || 0 };
  }

  
  onMount(async () => {
    try {
      const { rowsCount, hpi } = await getData();

      
      const max = Math.max(rowsCount, hpi);
      const data = [rowsCount / max * 100, hpi / max * 100];

      if (chart) chart.destroy();
      chart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: ['Registros', 'HPI (2015=100)'],
          datasets: [{
            data,
            backgroundColor: ['#36A2EB', '#FF6384']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            tooltip: {
              callbacks: {
                label(ctx) {
                  return ctx.dataIndex === 0
                    ? `Registros: ${rowsCount}`
                    : `HPI: ${hpi}`;
                }
              }
            }
          }
        }
      });
    } catch (e: any) {
      errorMsg = e.message ?? 'Error inesperado';
      console.error(e);
    }
  });
</script>

<main class="p-4 mx-auto max-w-lg">
  <h2 class="text-center text-xl font-semibold mb-4">
    Registros vs. Índice&nbsp;HPI — {YEAR}
  </h2>

  {#if errorMsg}
    <p class="text-red-600 text-center">{errorMsg}</p>
  {:else}
    <div style="width:480px;height:480px;margin:0 auto;position:relative;">
      <canvas bind:this={canvas}></canvas>
      <div style="position:absolute;bottom:8px;right:12px;
                  background:#fff8;padding:2px 6px;font-size:12px;
                  border-radius:4px;color:#555;">
        chartjs:doughnut
      </div>
    </div>
    <p class="chart-desc">
      El doughnut compara dos magnitudes del año {YEAR}:<br />
      <strong>Registros</strong> —número de filas disponibles en tu API
      <code>home-buying-selling-stats</code>— y el
      <strong>Índice de Precios de Vivienda&nbsp;(HPI)</strong>
      que publica Eurostat (base&nbsp;2015&nbsp;=&nbsp;100).<br />
      Ambos valores se normalizan al porcentaje del mayor, de modo que
      cada sector muestra su peso relativo y el tooltip revela el valor
      real.
    </p>
  {/if}

  <button
    on:click={() => (window.location.href = '/integrations/LEL')}
    style="display:block;margin:20px auto;padding:8px 12px;
           background:#36A2EB;border:none;border-radius:4px;cursor:pointer;">
    Volver
  </button>
</main>

<style>
  .chart-container {
    background:#fff; padding:1rem; border-radius:8px;
    box-shadow:0 2px 8px rgba(0,0,0,0.1);
  }
  main { font-family:system-ui,sans-serif; }
    .chart-desc {
    max-width: 480px;
    margin: 12px auto 0;
    font-size: 0.9rem;
    line-height: 1.35;
    text-align: center;
    color: #444;
  }
</style>
