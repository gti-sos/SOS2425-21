<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import zingchart from 'zingchart/es6';
	import 'zingchart/es6';

	const API = import.meta.env.DEV
		? 'http://localhost:16078/api/v1/cultural-event'
		: '/api/v1/cultural-event';

	let chartData = [];
	let selectedYear = '';
	let uniqueYears = [];

	async function fetchData() {
		try {
			const res = await fetch(API);
			const data = await res.json();
			chartData = data;
			uniqueYears = [...new Set(data.map((d) => d.year))];
			if (!selectedYear && uniqueYears.length > 0) selectedYear = uniqueYears[0];
			renderCharts();
		} catch (err) {
			console.error('Error fetching data', err);
		}
	}

	function renderCharts() {
		const filtered = chartData.filter((d) => d.year == selectedYear);

		const provinces = [...new Set(filtered.map((d) => d.province))];

		// 1. Bubble Chart - Eventos por provincia (tamaño por número de eventos)
		const bubbleSeries = filtered.map((d) => ({
			text: d.province,
			values: [[Math.random() * 100, Math.random() * 100, d.total_event]]
		}));

		zingchart.render({
			id: 'bubbleChart',
			width: '100%',
			height: 400,
			data: {
				type: 'bubble',
				title: { text: `Total de eventos por provincia (burbuja)` },
				scaleX: { label: { text: 'Valor X (aleatorio)' } },
				scaleY: { label: { text: 'Valor Y (aleatorio)' } },
				series: bubbleSeries
			}
		});

		// 2. Radar Chart - Asistencia total por provincia
		const attendanceData = provinces.map((p) =>
			filtered.filter((d) => d.province === p).reduce((sum, d) => sum + d.total_attendance, 0)
		);

		zingchart.render({
			id: 'attendanceChart',
			width: '100%',
			height: 400,
			data: {
				type: 'radar',
				title: { text: 'Asistencia total por provincia' },
				scaleK: {
					values: provinces,
					labels: provinces
				},
				scaleV: {
					label: { text: 'Asistentes' }
				},
				series: [
					{
						values: attendanceData,
						text: 'Asistencia',
						lineColor: '#007bff',
						backgroundColor: '#007bff',
						alpha: 0.5
					}
				]
			}
		});

		// 3. Gauge - Precio medio de entradas
		const avgPrice = (
			filtered.reduce((sum, d) => sum + d.avg_ticket_price, 0) / filtered.length
		).toFixed(2);

		zingchart.render({
			id: 'gaugeChart',
			width: '100%',
			height: 300,
			data: {
				type: 'gauge',
				title: { text: 'Precio Medio de Entrada' },
				scaleR: {
					aperture: 180,
					values: '0:50:5',
					center: { size: 5 },
					ring: {
						size: 10,
						rules: [
							{ rule: '%v < 15', backgroundColor: '#f44336' },
							{ rule: '%v >= 15 && %v < 25', backgroundColor: '#ff9800' },
							{ rule: '%v >= 25', backgroundColor: '#4caf50' }
						]
					}
				},
				series: [{ values: [parseFloat(avgPrice)] }]
			}
		});
	}

	onMount(() => fetchData());
</script>

<svelte:head>
	<title>Gráficas Avanzadas - ZingChart</title>
</svelte:head>

<h2>Visualización Avanzada con ZingChart</h2>

<div class="mb-3">
	<label>Año:</label>
	<select bind:value={selectedYear} on:change={renderCharts}>
		{#each uniqueYears as year}
			<option value={year}>{year}</option>
		{/each}
	</select>
</div>

<div id="bubbleChart" class="mb-5"></div>
<div id="attendanceChart" class="mb-5"></div>
<div id="gaugeChart" class="mb-5"></div>
