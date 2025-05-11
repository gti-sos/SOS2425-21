<script>
	import { onMount } from 'svelte';
	import zingchart from 'zingchart/es6';
	import 'zingchart/es6';
	import { dev } from '$app/environment';

	// Gráfico 1: Idiomas más hablados del mundo (usando proxy)
	const API_LANGUAGES_PROXY = dev
		? 'http://localhost:16078/proxy/restcountries'
		: '/proxy/restcountries';

	// Gráfico 2: Terremotos por continente → AREA
	const API_EARTHQUAKES =
		'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson';

	function getContinent(lat, lon) {
		if (lat >= -60 && lat <= 90 && lon >= -170 && lon <= -30) return 'América';
		if (lat >= -35 && lat <= 37 && lon >= -10 && lon <= 50) return 'África';
		if (lat >= 35 && lat <= 70 && lon >= -10 && lon <= 60) return 'Europa';
		if (lat >= 5 && lat <= 55 && lon >= 60 && lon <= 180) return 'Asia';
		if (lat >= -50 && lat <= 0 && lon >= 110 && lon <= 180) return 'Oceanía';
		if (lat <= -60) return 'Antártida';
		return 'Otros';
	}

	async function loadEarthquakeData() {
		const res = await fetch(API_EARTHQUAKES);
		const data = await res.json();

		const continentMap = new Map();

		for (const feature of data.features) {
			const magnitude = feature.properties.mag;
			const [lon, lat] = feature.geometry.coordinates;
			const continent = getContinent(lat, lon);
			if (!continentMap.has(continent)) continentMap.set(continent, []);
			continentMap.get(continent).push(magnitude);
		}

		const continents = [...continentMap.keys()];
		const series = [
			{
				text: 'Magnitud media',
				values: continents.map((c) => {
					const mags = continentMap.get(c);
					const avg = mags.reduce((a, b) => a + b, 0) / mags.length;
					return parseFloat(avg.toFixed(2));
				})
			}
		];

		zingchart.render({
			id: 'chart-earthquakes',
			width: '100%',
			height: 500,
			data: {
				type: 'area',
				scaleX: {
					labels: continents,
					label: { text: 'Continente' }
				},
				scaleY: {
					label: { text: 'Magnitud' }
				},
				plot: {
					tooltip: { text: '%t: %v' },
					valueBox: { text: '%v', placement: 'top' }
				},
				series
			}
		});
	}

	// Gráfico 3: Vuelos en espacio aéreo español → FUNNEL
	const lamin = 35.0,
		lamax = 44.0,
		lomin = -10.0,
		lomax = 5.0;

	async function loadFlightsData() {
		const res = await fetch(
			`https://opensky-network.org/api/states/all?lamin=${lamin}&lamax=${lamax}&lomin=${lomin}&lomax=${lomax}`
		);
		const data = await res.json();

		const countryCounts = {};
		data.states.forEach((s) => {
			const country = s[2] || 'Desconocido';
			countryCounts[country] = (countryCounts[country] || 0) + 1;
		});

		const sorted = Object.entries(countryCounts)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10);

		const series = sorted.map(([country, count]) => ({
			text: country,
			values: [count]
		}));

		zingchart.render({
			id: 'chart-flights',
			width: '100%',
			height: 500,
			data: {
				type: 'funnel',
				plot: {
					tooltip: { text: '%text: %v vuelos' },
					valueBox: { text: '%v', placement: 'top' }
				},
				series
			}
		});
	}

	// Gráfico 4: Precio medio de alquiler por comunidad → BAR
	const comunidades = {
		Andalucía: ['0-EU-ES-01-001-29067'], // Málaga
		Madrid: ['0-EU-ES-28-001-28079'], // Madrid
		'Comunidad Valenciana': ['0-EU-ES-10-001-46250'], // Valencia
		Cataluña: ['0-EU-ES-09-001-08019'], // Barcelona
		Galicia: ['0-EU-ES-12-001-15030'], // A Coruña
		'Castilla y León': ['0-EU-ES-07-001-47002'], // Valladolid
		Canarias: ['0-EU-ES-05-001-38038'] // Santa Cruz
	};

	async function loadHousingData() {
		const baseProxy = dev ? 'http://localhost:16078/proxy/idealista' : '/proxy/idealista';
		const results = [];

		for (const [comunidad, locationIds] of Object.entries(comunidades)) {
			let total = 0,
				count = 0;

			for (const locationId of locationIds) {
				try {
					const url = `${baseProxy}?locationId=${locationId}&operation=rent&locale=es&country=es&numPage=1&maxItems=40`;
					const res = await fetch(url);
					const data = await res.json();

					const prices = data?.elementList?.map((item) => item.price).filter(Boolean) || [];

					if (prices.length > 0) {
						total += prices.reduce((a, b) => a + b, 0);
						count += prices.length;
					}
				} catch (error) {
					console.error(`Error con ${comunidad}:`, error);
				}
			}

			if (count > 0) {
				results.push({
					text: comunidad,
					values: [parseFloat((total / count).toFixed(2))]
				});
			}
		}

		zingchart.render({
			id: 'chart-housing',
			width: '100%',
			height: 500,
			data: {
				type: 'bar',
				title: { text: '💶 Precio medio del alquiler por comunidad autónoma' },
				scaleX: {
					labels: results.map((r) => r.text),
					label: { text: 'Comunidad Autónoma' }
				},
				scaleY: {
					label: { text: 'Precio medio (€)' }
				},
				plot: {
					tooltip: { text: '%t: %v €' },
					valueBox: { text: '%v €', placement: 'top' }
				},
				series: [
					{
						text: 'Precio medio',
						values: results.map((r) => r.values[0])
					}
				]
			}
		});
	}

	onMount(() => {
		loadEarthquakeData();
		loadFlightsData();
		loadHousingData();
	});
</script>

<section class="graph-wrapper">
	<h1>📊 Visualizaciones Integradas con ZingChart</h1>

	<h2 class="chart-title">🌐 Idiomas más hablados del mundo</h2>
	<div class="chart-card"><div id="chart-languages"></div></div>

	<h2 class="chart-title">🌍 Terremotos por continente</h2>
	<div class="chart-card"><div id="chart-earthquakes"></div></div>

	<h2 class="chart-title">✈️ Vuelos por país de origen</h2>
	<div class="chart-card"><div id="chart-flights"></div></div>

	<h2 class="chart-title">🏘️ Precio medio de alquiler por comunidad</h2>
	<div class="chart-card"><div id="chart-housing"></div></div>
</section>

<style>
	.graph-wrapper {
		padding: 2rem 1rem;
		max-width: 1200px;
		margin: auto;
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
