<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/non-cartesian-zoom.js"></script>
    <script src="https://code.highcharts.com/modules/mouse-wheel-zoom.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js"></script>
</svelte:head>
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
<script>
    import {onMount} from "svelte";
    import { dev } from '$app/environment';
    // @ts-ignore
    let homeData = [];
    let result = "";
    let resultStatus = "";

    let API = `/api/v1/home-buying-selling-stats/`;
    if (dev) {
        API = `http://localhost:16078` + API;
    }

    async function getData() {
    // Reiniciamos estados de resultado
        resultStatus = result = "";
        try {
            // Hacemos la petición GET a la API
            const res  = await fetch(API, { method: "GET" });
            const json = await res.json();
            // Guardamos el JSON completo para depuración (opcional)
            result = JSON.stringify(json, null, 2);
            // Sobrescribimos homeData con el array de registros
            // (ajusta a json.data si tu API envuelve los resultados en { data: […] })
            homeData = Array.isArray(json) ? json : json.data;
            console.log(`Datos recibidos:\n${JSON.stringify(homeData, null, 2)}`);
            drawChart();
        } catch (error) {
            console.error(`ERROR al obtener datos de ${API}:`, error);
        }
    }
    function drawChart(){
        const provincesSet = new Set();
        const yearsSet = new Set();

        // @ts-ignore
        homeData.forEach(item=>{
            provincesSet.add(item.province);
            yearsSet.add(item.year);
        })

        const provinces = Array.from(provincesSet);
        const years = Array.from(yearsSet).sort(); 

        const series = years.map(year => {
            return {
                name: `Year ${year}`,
                data: provinces.map(province => {
                    
                    // @ts-ignore
                    const found = homeData.find(item => item.year === year && item.province === province);
                    return found ? found.transaction_total / 1000000 : 0; 
                })
            }
        });
    

    // @ts-ignore
    Highcharts.chart('container', {
    chart: {
        type: 'pie',
        zooming: {
            type: 'xy'
        },
        panning: {
            enabled: true,
            type: 'xy'
        },
        panKey: 'shift'
    },
    title: {
        text: 'Egg Yolk Composition'
    },
    tooltip: {
        valueSuffix: '%'
    },
    subtitle: {
        text:
        'Source:<a href="https://www.mdpi.com/2072-6643/11/3/684/htm" target="_default">MDPI</a>'
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: [{
                enabled: true,
                distance: 20
            }, {
                enabled: true,
                distance: -40,
                format: '{point.percentage:.1f}%',
                style: {
                    fontSize: '1.2em',
                    textOutline: 'none',
                    opacity: 0.7
                },
                filter: {
                    operator: '>',
                    property: 'percentage',
                    value: 10
                }
            }]
        }
    },
    series: series
});
    onMount(async () => {
        await getData();
    });
</script>
<figure class="highcharts-figure">
    <div id="container"></div>
</figure>