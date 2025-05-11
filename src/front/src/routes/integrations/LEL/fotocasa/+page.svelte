<svelte:head>
  <script src="https://cdn.amcharts.com/lib/5/index.js"></script>
  <script src="https://cdn.amcharts.com/lib/5/percent.js"></script>
  <script src="https://cdn.amcharts.com/lib/5/themes/Animated.js"></script>
</svelte:head>

<script lang="ts">
  import { onMount } from 'svelte';

  /* ───────── 1) Credenciales ───────────────────────────────── */
  const F_HOST = 'fotocasa3.p.rapidapi.com';
  const F_KEY  = '30dc95fca9msh69341c1646ebba5p10258ajsne34d0462ecf4';

  /* ───────── 2) Parámetros obligatorios + filtro zona ──────── */
  const queryParams = new URLSearchParams({
    combinedLocations: '724,14,28,173,0,28079,0,0,0',
    latitude:          '40.4096',
    longitude:         '-3.68624',
    transactionType:   'BUY',
    propertyType:      'HOMES',
    pageNumber:        '1',
    pageSize:          '150',

    sortType:          'PRICE',       
    order:             'DESC',         
    publicationDate:   'INDIFFERENT'   
  });

  /* ───────── 3) Referencia a AmCharts ─────────────────────── */
  let root: any;

  /* ───────── 4) Lógica de descarga + render ───────────────── */
  async function fetchAndRenderPyramid() {
    const url = `https://${F_HOST}/searchads?${queryParams}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Host': F_HOST,
        'X-RapidAPI-Key':  F_KEY
      }
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error('Fotocasa', res.status, txt);
      alert(`Fotocasa ${res.status}: ${txt}`);
      return;
    }

    const items = (await res.json()).data?.items ?? [];

    /* Agrupar por código postal */
    const grouped: Record<string, number> = {};
    items.forEach((ad: any) => {
      const zip = ad.zipCode || 'desconocido';
      grouped[zip] = (grouped[zip] || 0) + 1;
    });

    const data = Object.entries(grouped)
      .map(([zip, value]) => ({ category: zip, value }))
      .sort((a, b) => a.value - b.value);

    /* Redibujar con AmCharts 5 */
    if (root) root.dispose();

    const { am5, am5percent, am5themes_Animated } = window as any;

    root = am5.Root.new('pyramid-container');
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.SlicedChart.new(root, { layout: root.verticalLayout })
    );

    const series = chart.series.push(
      am5percent.FunnelSeries.new(root, {
        categoryField: 'category',
        valueField:    'value',
        orientation:   'vertical',
        alignLabels:   true
      })
    );

    series.labels.template.setAll({ text: '{category}' });
    series.slices.template.setAll({
      tooltipText: '{category}: {value} anuncios',
      interactive: true
    });

    series.data.setAll(data);
  }

  onMount(() => {
    fetchAndRenderPyramid();
    const id = setInterval(fetchAndRenderPyramid, 60000);
    return () => { clearInterval(id); root?.dispose(); };
  });
</script>

<figure>
  <h2 style="text-align:center; margin-top:1rem;">
    Pirámide de anuncios Fotocasa por código postal
  </h2>

  <div id="pyramid-container"
       style="width:100%; height:600px; max-width:820px; margin:0 auto;">
  </div>

  <p style="text-align:center; color:#555; margin:1rem 0;">
    Número de anuncios <strong>BUY / HOMES</strong> agrupados por código postal
    (datos de Fotocasa – RapidAPI). Se actualiza cada minuto.
  </p>
  <br>
  <button
    on:click={() => (window.location.href = '/integrations/LEL')}
    style="display:block;margin:20px auto;padding:8px 12px;
           background:#36A2EB;border:none;border-radius:4px;cursor:pointer;">
    Volver
  </button>
</figure>
