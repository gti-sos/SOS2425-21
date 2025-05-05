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

    .highcharts-description {
        margin: 0 10px;
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

    #button-bar {
        min-width: 310px;
        max-width: 800px;
        margin: 0 auto;
    }

    .highcharts-demo-button {
        background: #f2f2f2;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        display: inline-block;
        font-size: 0.8rem;
        padding: 0.5rem 1.5rem;
        margin: 0.5rem -5px 0.5rem 10px;
        transition: background 250ms;
    }

    .highcharts-demo-button:hover {
        background: #e6e6e6;
}

</style>

<script>
    import { onMount } from "svelte";
    import { dev } from '$app/environment';

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
        } catch (error) {
            console.log(`ERROR: GET from ${API}: ${error}`);
        }
    }
    onMount(async () => {
        await getData();
        // @ts-ignore
        const chart = Highcharts.chart('container', {

        chart: {
            type: 'column'
        },

        title: {
            text: 'Born persons, by girls\' name'
        },

        subtitle: {
            text: 'Resize the frame or click buttons to change appearance'
        },

        legend: {
            align: 'right',
            verticalAlign: 'middle',
            layout: 'vertical'
        },

        xAxis: {
            categories: ['2021', '2022', '2023'],
            labels: {
                x: -10
            }
        },

        yAxis: {
            allowDecimals: false,
            title: {
                text: 'Amount'
            }
        },

        series: [{
            name: 'Data',
            data: [34, 39, 53]
        }, {
            name: 'Data',
            data: [27, 21, 22]
        }, {
            name: 'Data',
            data: [41, 34, 32]
        }],

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal'
                    },
                    yAxis: {
                        labels: {
                            align: 'left',
                            x: 0,
                            y: -5
                        },
                        title: {
                            text: null
                        }
                    },
                    subtitle: {
                        text: null
                    },
                    credits: {
                        enabled: false
                    }
                }
            }]
        }
        });


    })
</script>

<figure class="highcharts-figure">
    <div id="container"></div>
</figure>

<div id="button-bar">
    <button id="small" class="highcharts-demo-button">Small</button>
    <button id="large" class="highcharts-demo-button">Large</button>
    <button id="auto" class="highcharts-demo-button">Auto</button>
</div>