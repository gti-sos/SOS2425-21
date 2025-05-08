<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/export-data.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js"></script>
</svelte:head>



<script>
// @ts-nocheck

    import { onMount } from "svelte";
    import { dev } from '$app/environment';

    let transitData = [];
    let provinces = [];
    let years = [];

    let selectedYear = "";
    let selectedProvince = "";

    let API = `/api/v1/public-transit-stats/`;
    if (dev) {
        API = `http://localhost:16078` + API;
    }

    async function getData() {
        try {
            const res = await fetch(API);
            const data = await res.json();
            transitData = data;

            // Obtener valores únicos
            provinces = Array.from(new Set(data.map(d => d.province))).sort();
            years = Array.from(new Set(data.map(d => d.year))).sort();

            // Valores iniciales por defecto
            selectedYear = years[0];
            selectedProvince = provinces[0];

            drawChart();
        } catch (error) {
            console.error("Error al obtener datos:", error);
        }
    }

    function drawChart() {
        const item = transitData.find(d => d.year === selectedYear && d.province === selectedProvince);

        if (!item) {
            return;
        }

        Highcharts.chart('container', {
            chart: {
                type: 'column'
            },
            title: {
                text: `Datos de transporte en ${selectedProvince} (${selectedYear})`
            },
            xAxis: {
                categories: ['Precio Billete (€)', 'Viajes (millones)', 'Longitud de ruta (km)']
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Valor'
                }
            },
            series: [{
                name: `${selectedProvince} ${selectedYear}`,
                data: [
                    item.ticket_price,
                    item.total_trips / 1_000_000,
                    item.route_length
                ]
            }],
            tooltip: {
                pointFormat: '<b>{point.y:.2f}</b>'
            },
            credits: {
                enabled: false
            }
        });
    }

    function onSelectionChange() {
        drawChart();
    }

    onMount(getData);
</script>

<style>
    select {
        margin: 10px;
        padding: 5px;
        font-size: 1rem;
    }
</style>

<div>
    <label>
        Año:
        <select bind:value={selectedYear} on:change={onSelectionChange}>
            {#each years as year}
                <option value={year}>{year}</option>
            {/each}
        </select>
    </label>

    <label>
        Provincia:
        <select bind:value={selectedProvince} on:change={onSelectionChange}>
            {#each provinces as province}
                <option value={province}>{province}</option>
            {/each}
        </select>
    </label>
</div>

<div id="container"></div>
