

<script>
    // @ts-nocheck
    
        import { onMount } from 'svelte';
        import 'bootstrap/dist/css/bootstrap.min.css';
        import Highcharts from 'highcharts';
        import { dev } from '$app/environment';
    
        let transitData = [];
        let homeData = [];
    
        let chartContainer;
    
        const DEVEL_HOST = "http://localhost:16078";
        let APILEL ="/api/v1/home-buying-selling-stats";
        if (dev) {
            APILEL = DEVEL_HOST + APILEL;
        }

        let APIAGB = "/api/v1/public-transit-stats";
        if (dev) {
            APIAGB = DEVEL_HOST + APIAGB;
        }
    
        async function getDataAGB() {
            try {
                const res = await fetch(APIAGB);
                const data = await res.json();
                transitData = Array.isArray(data) ? data : data.data;
            } catch (error){
                console.error(`ERROR: GET from ${APIAGB}: ${error}`);
            }
        }
    
        async function getDataLEL() {
            try {
                const res = await fetch(APILEL);
                const data = await res.json();
                homeData = Array.isArray(data) ? data : data.data;
            } catch (error){
                console.error(`ERROR: GET from ${APILEL}: ${error}`);
            }
        }
    
        function renderChart(commonData) {
            Highcharts.chart(chartContainer, {
                chart: {
                    type: 'bar'
                },
                title: {
                    text: 'Comparativa de transporte público y transacciones de vivienda (2024)'
                },
                xAxis: {
                    categories: commonData.map(d => d.province),
                    title: {
                        text: 'Provincia'
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Cantidad',
                        align: 'high'
                    },
                    labels: {
                        overflow: 'justify'
                    }
                },
                tooltip: {
                    valueSuffix: ''
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                series: [{
                    name: 'Total de viajes',
                    data: commonData.map(d => d.total_trips)
                }, {
                    name: 'Transacciones de vivienda',
                    data: commonData.map(d => d.transaction_total)
                }]
            });
        }
    
        onMount(async () => {
            await getDataAGB();
            await getDataLEL();
    
            // Normaliza los nombres de provincias a minúsculas
            const filteredTransit = transitData.filter(d => d.year === 2024).map(d => ({
                ...d,
                province: d.province.toLowerCase()
            }));
            const filteredHome = homeData.filter(d => d.year === 2024).map(d => ({
                ...d,
                province: d.province.toLowerCase()
            }));
    
            const commonData = [];
    
            for (const t of filteredTransit) {
                const match = filteredHome.find(h => h.province === t.province);
                if (match) {
                    commonData.push({
                        province: t.province.charAt(0).toUpperCase() + t.province.slice(1),
                        total_trips: t.total_trips,
                        transaction_total: match.transaction_total
                    });
                }
            }
    
            renderChart(commonData);
        });
    </script>
    
    <div bind:this={chartContainer}></div>
    