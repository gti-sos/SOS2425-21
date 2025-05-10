<script>
    // @ts-nocheck
    import { onMount } from 'svelte';
    import 'bootstrap/dist/css/bootstrap.min.css';
    import Highcharts from 'highcharts';
    import { dev } from '$app/environment';

    let transitData = [];
    let homeData = [];
    let culturalData = [];
    let chartContainer;

    const DEVEL_HOST = "http://localhost:16078";

    let APILEL = "/api/v1/home-buying-selling-stats";
    let APIAGB = "/api/v1/public-transit-stats";
    let APIPRG = "/api/v1/cultural-event";

    if (dev) {
        APILEL = DEVEL_HOST + APILEL;
        APIAGB = DEVEL_HOST + APIAGB;
        APIPRG = DEVEL_HOST + APIPRG;
    }

    async function getDataAGB() {
        try {
            const res = await fetch(APIAGB);
            const data = await res.json();
            transitData = Array.isArray(data) ? data : data.data;
        } catch (error) {
            console.error(`ERROR: GET from ${APIAGB}: ${error}`);
        }
    }

    async function getDataLEL() {
        try {
            const res = await fetch(APILEL);
            const data = await res.json();
            homeData = Array.isArray(data) ? data : data.data;
        } catch (error) {
            console.error(`ERROR: GET from ${APILEL}: ${error}`);
        }
    }

    async function getDataPRG() {
        try {
            const res = await fetch(APIPRG);
            const data = await res.json();
            culturalData = Array.isArray(data) ? data : data.data;
        } catch (error) {
            console.error(`ERROR: GET from ${APIPRG}: ${error}`);
        }
    }

    function renderChart(commonData) {
        Highcharts.chart(chartContainer, {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Comparativa 2024: Transporte, Vivienda y Eventos Culturales'
            },
            xAxis: {
                categories: commonData.map(d => d.province),
                crosshair: true
            },
            yAxis: [
                {
                    title: { text: 'Total de viajes' },
                    opposite: false
                },
                {
                    title: { text: 'Transacciones de vivienda' },
                    opposite: true
                },
                {
                    title: { text: 'Asistencia a eventos' },
                    opposite: true
                }
            ],
            tooltip: {
                shared: true,
                formatter: function () {
                    let tooltip = `<b>${this.x}</b><br/>`;
                    this.points.forEach(point => {
                        tooltip += `<span style="color:${point.color}">●</span> ${point.series.name}: <b>${point.y.toLocaleString()}</b><br/>`;
                    });
                    return tooltip;
                }
            },
            plotOptions: {
                column: {
                    grouping: true,
                    shadow: false,
                    borderWidth: 0
                }
            },
            series: [
                {
                    name: 'Total de viajes',
                    data: commonData.map(d => d.total_trips),
                    yAxis: 0
                },
                {
                    name: 'Transacciones de vivienda',
                    data: commonData.map(d => d.transaction_total),
                    yAxis: 1
                },
                {
                    name: 'Asistencia a eventos',
                    data: commonData.map(d => d.total_attendance),
                    yAxis: 2
                }
            ]
        });
    }

    onMount(async () => {
        await getDataAGB();
        await getDataLEL();
        await getDataPRG();

        const filteredTransit = transitData.filter(d => d.year === 2024).map(d => ({
            ...d,
            province: d.province.toLowerCase()
        }));

        const filteredHome = homeData.filter(d => d.year === 2024).map(d => ({
            ...d,
            province: d.province.toLowerCase()
        }));

        const filteredCultural = culturalData.filter(d => d.year === 2024).map(d => ({
            ...d,
            province: d.province.toLowerCase()
        }));

        const commonData = [];

        for (const t of filteredTransit) {
            const matchHome = filteredHome.find(h => h.province === t.province);
            const matchCulture = filteredCultural.find(c => c.province === t.province);

            if (matchHome && matchCulture) {
                commonData.push({
                    province: t.province.charAt(0).toUpperCase() + t.province.slice(1),
                    total_trips: parseInt(t.total_trips),
                    transaction_total: parseInt(matchHome.transaction_total),
                    total_attendance: parseInt(matchCulture.total_attendance?.toString().replace(/,/g, '')) || 0
                });
            }
        }

        renderChart(commonData);
    });
</script>

<div bind:this={chartContainer}></div>
