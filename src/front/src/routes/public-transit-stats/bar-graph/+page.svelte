<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/export-data.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js"></script>
</svelte:head>

<style>
    .highcharts-figure,
    .highcharts-data-table table {
        min-width: 310px;
        max-width: 800px;
        margin: 1em auto;
    }

    #container {
        height: 400px;
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

    .highcharts-description {
        margin: 0.3rem 10px;
    }

</style>

<script>
    import {onMount} from "svelte";
    import { dev } from '$app/environment';

    // @ts-ignore
    let transitData = [];
    let result = "";
    let resultStatus = "";

    let API = `/api/v1/public-transit-stats/`;
    if (dev) {
        API = `http://localhost:16078` + API;
    }


    async function getData() {
        resultStatus = result = "";
        try {
            const res = await fetch(API, { method: "GET" });
            const data = await res.json();
            transitData = data;
            result = JSON.stringify(data, null, 2);
            transitData = data;
            console.log(`Response received:\n${JSON.stringify(transitData, null, 2)}`);
            drawChart();
        } catch (error) {
            console.log(`ERROR: GET from ${API}: ${error}`);
        }
    }

    function drawChart(){
        const provincesSet = new Set();
        const yearsSet = new Set();

        // @ts-ignore
        transitData.forEach(item=>{
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
                    const found = transitData.find(item => item.year === year && item.province === province);
                    return found ? found.total_trips / 1000000 : 0; // Valor en millones
                })
            }
        });
    
        // @ts-ignore
        Highcharts.chart('container', {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Viajes en autobús urbano en España'
        },
        xAxis: {
            categories: provinces,
            title: {
                text: null
            },
            gridLineWidth: 1,
            lineWidth: 0
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Viajes (millones)',
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            },
            gridLineWidth: 0
        },
        tooltip: {
            valueSuffix: ' millions'
        },
        plotOptions: {
            bar: {
                borderRadius: '50%',
                dataLabels: {
                    enabled: true
                },
                groupPadding: 0.1
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: -40,
            y: 80,
            floating: true,
            borderWidth: 1,
            backgroundColor:
                // @ts-ignore
                Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
            shadow: true
        },
        credits: {
            enabled: false
        },
        series: series
    });
    }

    onMount(async () => {
        await getData();
    });
</script>

<figure class="highcharts-figure">
    <div id="container"></div>
    
</figure>