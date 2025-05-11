<svelte:head>
  <script src="https://code.jscharting.com/latest/jscharting.js"></script>
</svelte:head>

<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { dev, browser } from '$app/environment';

  const BASE    = dev ? 'http://localhost:16078' : '';
  const TRA_API = `${BASE}/api-proxy/api/v1/home-buying-selling-stats`;
  const DEP_API = `${BASE}/api-proxy/api/v1/autonomy-dependence-applications`;

  interface Trans  { year: number; transaction_total: number }
  interface DepApp { year: number; dependent_population: number }

  let chartDiv: HTMLDivElement;

  onMount(async () => {
    if (!browser) return;

    const [rT, rD] = await Promise.all([ fetch(TRA_API), fetch(DEP_API) ]);
    if (!rT.ok || !rD.ok) {
      console.error('Fetch error', rT.status, rD.status);
      return;
    }

    const trData : Trans[]  = await rT.json();
    const depData: DepApp[] = await rD.json();


    const yearsT = new Set(trData.map(d => d.year));
    const yearsD = new Set(depData.map(d => d.year));
    const years  = [...yearsT].filter(y => yearsD.has(y)).sort((a,b)=>a-b);

    const serieTrans = years.map(y => ({
      x: String(y),
      y: trData.filter(t => t.year===y).reduce((s,t)=>s+t.transaction_total,0)
    }));
    const serieDep   = years.map(y => ({
      x: String(y),
      y: depData.filter(d => d.year===y).reduce((s,d)=>s+d.dependent_population,0)
    }));

    console.log('Trans:', serieTrans, Array.isArray(serieTrans));
    console.log('Dep:',   serieDep,   Array.isArray(serieDep));

    await tick();

    // @ts-ignore
    new window.JSC.Chart(chartDiv, {
      title: {
        label: { text: `Comparativa por Año (${years[0]}–${years.at(-1)})` }
      },
      legend: {
        position: 'inside top right'
      },
      xAxis: {
        scale: { type: 'category' },
        label: { text: 'Año' }
      },
      yAxis: {
        label: { text: 'Cantidad' },
        defaultTick: { label_text: '{%value:fmt number}' }
      },
      series: [
        {
          name: 'Transacciones',
          type: 'column',
          points: serieTrans,      
          defaultPoint: {
            fill: '#5B9BD5'
          }
        },
        {
          name: 'Población dependiente',
          type: 'column',
          points: serieDep,        
          defaultPoint: {
            fill: '#ED7D31'
          }
        }
      ]
    });
  });
</script>

{#if browser}
  <div
    bind:this={chartDiv}
    style="
      width:100%;
      max-width:900px;
      height:400px;
      margin:2rem auto;
      background:#fafafa;
      border-radius:8px;
      box-shadow:0 2px 8px rgba(0,0,0,0.1);
    ">
  </div>
{/if}

<button
    on:click={() => (window.location.href = '/integrations/LEL')}
    style="display:block;margin:20px auto;padding:8px 12px;
           background:#36A2EB;border:none;border-radius:4px;cursor:pointer;">
    Volver
  </button>