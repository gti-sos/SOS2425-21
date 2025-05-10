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
	let selectedProvince = 'Todas';
	let uniqueYears = [];
	let uniqueProvinces = [];

	async function fetchData() {
		try {
			const res = await fetch(API);
			const data = await res.json();
			chartData = data;
			uniqueYears = [...new Set(data.map((d) => d.year))];
			uniqueProvinces = [...new Set(data.map((d) => d.province))];
			if (!selectedYear && uniqueYears.length > 0) selectedYear = uniqueYears[0];
			renderCharts();
		} catch (err) {
			console.error('Error fetching data', err);
		}
	}

	function renderCharts() {
		const filtered = chartData.filter(
			(d) =>
				d.year == selectedYear && (selectedProvince === 'Todas' || d.province === selectedProvince)
		);
		if (filtered.length === 0) {
			zingchart.exec('barChart1', 'destroy');
			zingchart.exec('barChart2', 'destroy');
			zingchart.exec('barChart3', 'destroy');
			return;
		}

		const provinces = [...new Set(filtered.map((d) => d.province))];

		const totalEventsByProvince = provinces.map((p) =>
			filtered.filter((d) => d.province === p).reduce((sum, d) => sum + d.total_event, 0)
		);
		const avgPriceByProvince = provinces.map((p) => {
			const values = filtered.filter((d) => d.province === p).map((d) => d.avg_ticket_price);
			return values.reduce((a, b) => a + b, 0) / values.length;
		});
		const avgAttendanceByProvince = provinces.map((p) => {
			const values = filtered.filter((d) => d.province === p).map((d) => d.total_attendance);
			return values.reduce((a, b) => a + b, 0) / values.length;
		});

		zingchart.render({
			id: 'barChart1',
			width: '100%',
			height: 300,
			data: {
				type: 'bar',
				title: { text: 'Total de eventos' },
				scaleX: { values: provinces },
				scaleY: { label: { text: 'Eventos' } },
				series: [{ values: totalEventsByProvince }]
			}
		});

		zingchart.render({
			id: 'barChart2',
			width: '100%',
			height: 300,
			data: {
				type: 'bar',
				title: { text: 'Precio medio de entradas' },
				scaleX: { values: provinces },
				scaleY: { label: { text: 'Euros' } },
				series: [{ values: avgPriceByProvince }]
			}
		});

		zingchart.render({
			id: 'barChart3',
			width: '100%',
			height: 300,
			data: {
				type: 'bar',
				title: { text: 'Asistencia media total' },
				scaleX: { values: provinces },
				scaleY: { label: { text: 'Personas' } },
				series: [{ values: avgAttendanceByProvince }]
			}
		});
	}

	onMount(() => fetchData());
</script>

<svelte:head>
	<title>Bar Graph - Eventos culturales</title>
</svelte:head>

<h2>Gráficas de Barras: Eventos Culturales</h2>
<div class="mb-3">
	<label>Año:</label>
	<select bind:value={selectedYear} on:change={renderCharts}>
		{#each uniqueYears as year}
			<option value={year}>{year}</option>
		{/each}
	</select>
</div>
<div id="barChart1" class="mb-5"></div>
<div id="barChart2" class="mb-5"></div>
<div id="barChart3" class="mb-5"></div>
