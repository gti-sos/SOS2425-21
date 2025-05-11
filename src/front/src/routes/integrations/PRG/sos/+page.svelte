<script>
	import { onMount } from 'svelte';
	import zingchart from 'zingchart/es6';
	import 'zingchart/es6';

	const API1 = 'https://sos2425-10.onrender.com/api/v1/radars-stats';
	let radarData = [],
		radarYears = [],
		selectedRadarYear = '';

	async function loadRadarData() {
		const res = await fetch(API1);
		radarData = await res.json();
		radarYears = [...new Set(radarData.map((d) => d.year))].sort((a, b) => b - a);
		selectedRadarYear = radarYears[0];
		renderRadarChart();
	}

	function renderRadarChart() {
		const filtered = radarData.filter((d) => d.year === parseInt(selectedRadarYear));
		const map = new Map();
		for (const item of filtered) {
			const key = item.autonomousCommunity;
			if (!map.has(key)) map.set(key, []);
			map.get(key).push(item.averageSpeedFined);
		}
		const comunidades = [...map.keys()];
		const velocidades = comunidades.map((c) => {
			const arr = map.get(c);
			return parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2));
		});
		const multas = comunidades.map((c) => map.get(c).length);

		zingchart.render({
			id: 'chart1',
			width: '100%',
			height: 400,
			data: {
				type: 'pie',
				title: {
					text: `Distribución de multas por comunidad (${selectedRadarYear})`,
					fontSize: 16
				},
				legend: { draggable: true, layout: 'auto', align: 'center', verticalAlign: 'bottom' },
				series: comunidades.map((c, i) => ({
					text: `${c} (${velocidades[i]} km/h)`,
					values: [multas[i]]
				}))
			}
		});
	}

	const API2 = 'https://sos2425-14.onrender.com/api/v1/cybercrime-data';
	let cyberData = [];

	async function loadCyberData() {
		const res = await fetch(API2);
		cyberData = await res.json();
		const filtered = cyberData.filter((d) => d.autonomous_community !== 'TOTAL');
		const years = [...new Set(cyberData.map((d) => d.year))].sort();
		const totalByYear = years.map((y) => {
			const filtered = cyberData.filter((d) => d.year === y && d.autonomous_community !== 'TOTAL');
			return {
				year: y,
				delitos: filtered.reduce((sum, d) => sum + d.criminal_ofense, 0),
				ciber: filtered.reduce((sum, d) => sum + d.cybersecurity, 0),
				detenidos: filtered.reduce((sum, d) => sum + d.arrested_investigated, 0)
			};
		});

		zingchart.render({
			id: 'chart2',
			width: '100%',
			height: 400,
			data: {
				type: 'line',
				title: { text: 'Tendencia de cibercriminalidad en España (Total)', fontSize: 16 },
				scaleX: { label: { text: 'Años' }, labels: totalByYear.map((d) => d.year.toString()) },
				scaleY: { label: { text: 'Casos' } },
				legend: { draggable: true, align: 'center', verticalAlign: 'bottom' },
				series: [
					{ text: 'Delitos informáticos', values: totalByYear.map((d) => d.delitos) },
					{ text: 'Incidentes de ciberseguridad', values: totalByYear.map((d) => d.ciber) },
					{ text: 'Detenidos / Investigados', values: totalByYear.map((d) => d.detenidos) }
				]
			}
		});
	}

	const API3 = 'https://sos2425-19.onrender.com/api/v1/sanctions-and-points-stats';
	let sanctionsData = [];

	async function loadSanctionsData() {
		const res = await fetch(API3);
		sanctionsData = await res.json();
		const map = new Map();
		for (const item of sanctionsData) {
			const key = item.autonomous_community;
			if (!map.has(key)) map.set(key, []);
			map.get(key).push(item);
		}
		const comunidades = [...map.keys()];
		const puntos = comunidades.map((c) =>
			map.get(c).reduce((a, b) => a + b.total_points_deducted, 0)
		);
		const sanciones = comunidades.map((c) =>
			map.get(c).reduce((a, b) => a + b.total_sanctions_with_points, 0)
		);
		const porcentajes = comunidades.map((c, i) =>
			puntos[i] > 0 ? parseFloat(((sanciones[i] / puntos[i]) * 100).toFixed(2)) : 0
		);

		zingchart.render({
			id: 'chart3',
			width: '100%',
			height: 400,
			data: {
				type: 'scatter',
				title: { text: 'Sanciones con puntos vs puntos retirados', fontSize: 16 },
				scaleX: { labels: comunidades, label: { text: 'Comunidad Autónoma' } },
				scaleY: { label: { text: 'Porcentaje de sanciones con puntos (%)' } },
				series: [
					{
						text: 'Relación puntos/sanciones',
						values: comunidades.map((c, i) => [i, porcentajes[i]])
					}
				]
			}
		});
	}

	const API4 = 'https://sos2425-17.onrender.com/api/v2/students_satisfaction';
	let satisfactionData = [];

	async function loadSatisfactionData() {
		const res = await fetch(API4);
		satisfactionData = await res.json();
		const map = new Map();
		for (const item of satisfactionData) {
			const ciudad = item.ciudad;
			if (!map.has(ciudad)) map.set(ciudad, []);
			map.get(ciudad).push(item.satisfaccion_total);
		}
		const ciudades = [...map.keys()];
		const medias = ciudades.map((c) => {
			const arr = map.get(c);
			return parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2));
		});

		zingchart.render({
			id: 'chart4',
			width: '100%',
			height: 400,
			data: {
				type: 'area',
				title: { text: 'Satisfacción media por ciudad universitaria', fontSize: 16 },
				scaleX: { labels: ciudades, label: { text: 'Ciudad Universitaria' } },
				scaleY: { label: { text: 'Satisfacción media (0-5)' } },
				series: [
					{
						text: 'Satisfacción media',
						values: medias
					}
				]
			}
		});
	}

	const API5 = 'https://sos2425-13.onrender.com/api/v1/water-supply-improvements';
	let waterData = [];

	async function loadWaterData() {
		const res = await fetch(API5);
		waterData = await res.json();

		const map = new Map();
		for (const item of waterData) {
			const comunidad = item.autonomous_community;
			if (!map.has(comunidad)) map.set(comunidad, []);
			map.get(comunidad).push(item.benefited_population);
		}
		const comunidades = [...map.keys()];
		const medias = comunidades.map((c) => {
			const values = map.get(c);
			const avg = values.reduce((a, b) => a + b, 0) / values.length;
			return parseFloat(avg.toFixed(2));
		});

		Highcharts.chart('chart5', {
			chart: {
				type: 'column'
			},
			title: {
				text: 'Población beneficiada media por comunidad autónoma'
			},
			xAxis: {
				categories: comunidades,
				title: { text: 'Comunidad Autónoma' },
				labels: { rotation: -45 }
			},
			yAxis: {
				min: 0,
				title: { text: 'Población beneficiada media (personas)' }
			},
			tooltip: {
				pointFormat: 'Media de beneficiados: <b>{point.y:.0f}</b> personas'
			},
			series: [
				{
					name: 'Población beneficiada',
					data: medias
				}
			]
		});
	}

	onMount(() => {
		loadRadarData();
		loadWaterData();
		loadCyberData();
		loadSanctionsData();
		loadSatisfactionData();
	});
</script>

<svelte:head>
	<script src="https://code.highcharts.com/highcharts.js"></script>
</svelte:head>

<section class="graph-wrapper">
	<h1>📊 Integraciones de Grupos - Visualización con ZingChart y otras bibliotecas</h1>

	<div class="controls">
		<label for="year">Seleccionar año para Radar Stats:</label>
		<select id="year" bind:value={selectedRadarYear} on:change={renderRadarChart}>
			{#each radarYears as y}<option value={y}>{y}</option>{/each}
		</select>
	</div>

	<h2 class="chart-title">📌 Grupo 10 - Radar Stats</h2>
	<div class="chart-card"><div id="chart1"></div></div>

	<h2 class="chart-title">📌 Grupo 13 - Water Supply Improvements (Highcharts)</h2>
	<div class="chart-card"><div id="chart5"></div></div>

	<h2 class="chart-title">📌 Grupo 14 - Cybercrime</h2>
	<div class="chart-card"><div id="chart2"></div></div>

  <h2 class="chart-title">📌 Grupo 17 - Students Satisfaction</h2>
	<div class="chart-card"><div id="chart4"></div></div>

	<h2 class="chart-title">📌 Grupo 19 - Sanctions and Points</h2>
	<div class="chart-card"><div id="chart3"></div></div>

	
</section>

<style>
	.graph-wrapper {
		padding: 2rem 1rem;
		max-width: 1200px;
		margin: auto;
	}
	.controls {
		text-align: center;
		margin-bottom: 2rem;
	}
	.chart-title {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
		color: #333;
		border-left: 6px solid #007acc;
		padding-left: 12px;
		margin-top: 2rem;
	}
	.chart-card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		padding: 1rem;
		margin-bottom: 3rem;
	}
</style>
