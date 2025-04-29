<svelte:head>
    <script src="https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js"></script>
</svelte:head>

<script>
    // @ts-nocheck
    import { onMount } from "svelte";
    import { dev } from "$app/environment";

    let API = "/api/v1/public-transit-stats/";
    if (dev) {
        API = "http://localhost:16078" + API;
    }

    onMount(async () => {
        try {
            const res = await fetch(API);
            const data = await res.json();

            // Calcular ingresos por provincia: ticket_price * total_trips
            const revenueByProvince = {};
            data.forEach(item => {
                const ingreso = item.ticket_price * item.total_trips;
                if (!revenueByProvince[item.province]) {
                    revenueByProvince[item.province] = 0;
                }
                revenueByProvince[item.province] += ingreso;
            });

            const chartData = Object.entries(revenueByProvince).map(([province, euros]) => ({
                name: province,
                value: +(euros / 1_000_000).toFixed(2) // en millones de euros, redondeado a 2 decimales
            }));

            const chartDom = document.getElementById('revenueChart');
            const myChart = echarts.init(chartDom);

            const option = {
                title: {
                    text: 'Ingresos por Provincia (echarts)',
                    subtext: 'En millones de €',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c}M € ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left'
                },
                series: [
                    {
                        name: 'Ingresos',
                        type: 'pie',
                        radius: ['40%', '70%'],
                        avoidLabelOverlap: false,
                        label: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: '18',
                                fontWeight: 'bold'
                            }
                        },
                        labelLine: {
                            show: false
                        },
                        data: chartData
                    }
                ]
            };

            myChart.setOption(option);

        } catch (err) {
            console.error("Error al cargar o procesar los datos:", err);
        }
    });
</script>

<figure>
    <div id="revenueChart" style="width: 600px; height: 600px; margin: auto;"></div>
</figure>

<style>
    figure {
        margin-top: 2rem;
        text-align: center;
    }
</style>
