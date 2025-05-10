<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/non-cartesian-zoom.js"></script>
    <script src="https://code.highcharts.com/modules/mouse-wheel-zoom.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js"></script>
</svelte:head>

<script lang="ts">
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';

    // @ts-ignore
    const Highcharts = window.Highcharts;

    interface Stat {
        province: string;
        transaction_total: number;
    }

    const DEVEL_HOST = 'http://localhost:16078';
    let API = '/api/v1/home-buying-selling-stats';
    if (dev) {
        API = DEVEL_HOST + API;
    }

    let chart: any;

    async function fetchAndRender() {
        const res = await fetch(API);
        const data: Stat[] = await res.json();

        const grouped = data.reduce<Record<string, number>>((acc, row) => {
        const prov = row.province;
        acc[prov] = (acc[prov] || 0) + row.transaction_total;
        return acc;
        }, {});

        const seriesData = Object.entries(grouped).map(([province, total]) => ({
        name: province,
        y: total
        }));

        if (!chart) {
        chart = Highcharts.chart({
            chart: {
                type: 'pie',
            },
            title: {
                text: 'Distribución de Transacciones Totales por Provincia'
            },
            tooltip: {
                pointFormat: '<b>{point.y}</b> transacciones ({point.percentage:.1f}%)'
            },
            accessibility: {
                point: {
                    valueSuffix: ' transacciones'
                }
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                    enabled: true,
                    format: '{point.name}: {point.y}'
                    }
                }
            },
            series: [{
                type: "pie",
                name: 'Total transacciones',
                data: seriesData
            }]
        });
        } else {
            chart.series[0].setData(seriesData, true);
        }
    }

    onMount(() => {
        fetchAndRender();
        const interval = setInterval(fetchAndRender, 5000);
        return () => clearInterval(interval);
    });
</script>

<figure class="highcharts-figure">
    <div id="pie-container" style="width:100%; height:400px;"></div>
    <p class="highcharts-description">
        Este gráfico muestra cuántas transacciones totales hubo en cada provincia,
        agrupadas y sumadas desde la API de compraventa de viviendas.
    </p>
</figure>

<style>
    .highcharts-figure,
    .highcharts-data-table table {
        min-width: 320px;
        max-width: 800px;
        margin: 1em auto;
    }

    .highcharts-data-table table {
        font-family: Verdana, sans-serif;
        border-collapse: collapse;
        border: 1px solid #ebebeb;
        margin: 10px auto;
        text-align: center;
        width: 100%;
        max-width: 500px;
    }

    .highcharts-data-table caption {
        padding: 1em 0;
        font-size: 1.2em;
        color: #555;
    }

    .highcharts-data-table th {
        font-weight: 600;
        padding: 0.5em;
    }

    .highcharts-data-table td,
    .highcharts-data-table th,
    .highcharts-data-table caption {
        padding: 0.5em;
    }

    .highcharts-data-table thead tr,
    .highcharts-data-table tbody tr:nth-child(even) {
        background: #f8f8f8;
    }

    .highcharts-data-table tr:hover {
        background: #f1f7ff;
    }

    input[type="number"] {
        min-width: 50px;
    }

    .highcharts-description {
        margin: 0.3rem 10px;
    }
</style>