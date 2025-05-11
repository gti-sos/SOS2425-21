<svelte:head>
  <title>Integración Grupo 20 (Reaviz)</title>
</svelte:head>

<script lang="ts">
  import { onMount } from 'svelte';
  import { dev, browser } from '$app/environment';

  // Interfaces
  interface Transaction {
    year: number | string;
    province: string;
    transaction_total: number;
  }
  interface Fine {
    year: number | string;
    province: string;
    itv: number;
  }


  let years: number[] = [];
  let selectedYear!: number;
  let reactContainer: HTMLDivElement;

  const transactionByYear  = new Map<number, number>();
  const multasByYear = new Map<number, number>();

  async function loadData() {
    const API_TRA = dev
      ? 'http://localhost:16078/api/v1/home-buying-selling-stats'
      : '/api/v1/home-buying-selling-stats';
    const API_REG = dev
      ? 'http://localhost:16078/api-proxy/api/v1/fines'
      : '/api-proxy/api/v1/fines';

    const [resTra, resReg] = await Promise.all([
      fetch(API_TRA),
      fetch(API_REG)
    ]);

    const transData: Transaction[]    = await resTra.json();
    const regData: Fine[]     = await resReg.json();

    years = Array.from(
      new Set<number>([
        ...transData.map(d => Number(d.year)),
        ...regData.map(d => Number(d.year))
      ])
    ).sort((a, b) => a - b);

    selectedYear = years[years.length - 1]!;

    years.forEach(y => {
      const sumT = transData
        .filter(d => Number(d.year) === y)
        .reduce((sum, d) => sum + d.transaction_total, 0);
      const sumR = regData
        .filter(d => Number(d.year) === y)
        .reduce((sum, d) => sum + d.itv, 0);

      transactionByYear.set(y, sumT);
      multasByYear.set(y, sumR);
    });
  }

  async function renderFunnel() {
    const React    = (await import('react')).default;
    const { createRoot } = await import('react-dom/client');
    const {
      FunnelChart,
      FunnelSeries,
      FunnelArc,
      FunnelAxis,
      FunnelAxisLine,
      FunnelAxisLabel
    } = await import('reaviz');

    const data = [
      { key: 'Multas ITV',    data: multasByYear.get(selectedYear) || 0 },
      { key: 'Transacciones totales', data: transactionByYear.get(selectedYear)  || 0 }
    ];

    const funnelElement = React.createElement(
      FunnelChart,
      {
        height: 300,
        data,
        series: React.createElement(FunnelSeries, {
          arc: React.createElement(FunnelArc, {
            colorScheme: ['#5B14C5']
          })
        }),
        axis: React.createElement(FunnelAxis, {
          label: React.createElement(FunnelAxisLabel, { fill: '#000', style: { fontWeight: 'bold' } }),
          line:  React.createElement(FunnelAxisLine,  { strokeColor: '#000' })
        })
      }
    );

    const root = createRoot(reactContainer);
    root.render(funnelElement);
  }

  function update() {
    renderFunnel();
  }

  if (browser) {
    onMount(async () => {
      await loadData();
      await renderFunnel();
    });
  }
</script>

{#if browser}
  <figure class="reaviz-figure">
    <label class="year-label">
      Año:
      <select bind:value={selectedYear} on:change={update}>
        {#each years as y}
          <option value={y}>{y}</option>
        {/each}
      </select>
    </label>

    <div bind:this={reactContainer} class="funnel-container"></div>

    <p class="description">
      Comparativa de multas de ITV vs transacciones totales por año (Reaviz + React dentro de Svelte).
    </p>
    <br>
    <button
    on:click={() => (window.location.href = '/integrations/LEL')}
    style="display:block;margin:20px auto;padding:8px 12px;
           background:#36A2EB;border:none;border-radius:4px;cursor:pointer;">
    Volver
  </button>
  </figure>
{/if}

<style>
  .reaviz-figure {
    max-width: 800px;
    margin: 2rem auto;
    background: #a7a2e0;
    padding: 1.5rem;
    border-radius: 8px;
  }
  .year-label {
    display: block;
    text-align: center;
    margin-bottom: 1em;
    font-weight: bold;
  }
  select {
    margin-left: 0.5em;
    padding: 0.3em 0.6em;
  }
  .funnel-container {
    width: 100%;
    height: 300px;
  }
  .description {
    text-align: center;
    margin-top: 1rem;
    color: #555;
  }
</style>