<svelte:head>
	<title>Public Transit Manager</title>
</svelte:head>

<script>
	// @ts-nocheck
	import { Button, Alert, Table } from '@sveltestrap/sveltestrap';
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';
	import 'bootstrap/dist/css/bootstrap.min.css';
	import { goto } from '$app/navigation';

	const DEVEL_HOST = 'http://localhost:16078';
	let API = '/api/v1/public-transit-stats';
	if (dev) {
		API = DEVEL_HOST + API;
	}

	let transitData = [];
	let newProvince = '', newYear = '', newPrice = '', newTrips = '', newLength = '';
	let searchProvince = '', searchYear = '', searchPrice = '', searchTrip = '', searchLength = '';

	let alertMessage = '', alertType = '', showAlert = false;

	function showUserAlert(message, type = 'info') {
		alertMessage = message;
		alertType = type;
		showAlert = true;
		setTimeout(() => (showAlert = false), 4000);
	}

	async function getData() {
		try {
			const res = await fetch(API);
			transitData = await res.json();
		} catch (e) {
			showUserAlert('Error al obtener los datos del servidor', 'danger');
		}
	}

	async function deleteTrip(province, year) {
		try {
			const res = await fetch(`${API}/${province}/${year}`, { method: 'DELETE' });
			if (res.status === 200) {
				showUserAlert('Viaje eliminado correctamente', 'success');
				getData();
			} else {
				showUserAlert('No se encontró el viaje', 'warning');
			}
		} catch (e) {
			showUserAlert('Error de conexión al eliminar el viaje', 'danger');
		}
	}

	async function createTrip() {
		try {
			const res = await fetch(API, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					province: newProvince,
					year: parseInt(newYear),
					ticket_price: parseFloat(newPrice),
					total_trips: parseInt(newTrips),
					route_length: parseFloat(newLength)
				})
			});

			if (res.status === 201) {
				showUserAlert('Viaje creado', 'success');
				getData();
				newProvince = newYear = newPrice = newTrips = newLength = '';
			} else {
				showUserAlert('Error al crear el viaje', 'danger');
			}
		} catch (e) {
			showUserAlert('Error de conexión al crear el viaje', 'danger');
		}
	}

	async function deleteAllTrips() {
		try {
			const res = await fetch(API, { method: 'DELETE' });
			if (res.status === 200) {
				showUserAlert('Todos los viajes eliminados', 'success');
				getData();
			} else {
				showUserAlert('Error al eliminar todos los viajes', 'danger');
			}
		} catch (e) {
			showUserAlert('Error de conexión al eliminar todos los viajes', 'danger');
		}
	}

	async function searchTrips() {
		try {
			let url = new URL(API, window.location.origin);
			if (searchProvince) url.searchParams.append('province', searchProvince);
			if (searchYear) url.searchParams.append('year', searchYear);
			if (searchPrice) url.searchParams.append('ticket_price', searchPrice);
			if (searchTrip) url.searchParams.append('total_trips', searchTrip);
			if (searchLength) url.searchParams.append('route_length', searchLength);

			const res = await fetch(url.toString());
			transitData = await res.json();
			if (!transitData.length) {
				showUserAlert('No se encontraron coincidencias', 'warning');
			} else {
				showUserAlert('Búsqueda realizada correctamente', 'info');
			}
		} catch (e) {
			showUserAlert('Error al buscar los datos', 'danger');
		}
	}

	onMount(() => getData());
</script>

<section class="hero">
	<h1>🚌 Public Transit Manager</h1>
	<p>Estadísticas de transporte público por provincia</p>
</section>

{#if showAlert}
	<Alert color={alertType} class="my-3">{alertMessage}</Alert>
{/if}

<section class="actions">
	<Button color="success" on:click={() => goto('/public-transit-stats/pie-graph')} class="me-2">Pie Graph</Button>
	<Button color="primary" on:click={() => goto('/public-transit-stats/bar-graph')}>Bar Graph</Button>
</section>

<section class="filters">
	<h3>🔍 Filtros</h3>
	<div>
		<input bind:value={searchProvince} placeholder="Provincia..." />
		<input bind:value={searchYear} placeholder="Año..." />
		<input bind:value={searchPrice} placeholder="Precio..." />
		<input bind:value={searchTrip} placeholder="Viajes..." />
		<input bind:value={searchLength} placeholder="Longitud..." />
		<Button on:click={searchTrips} color="info">Buscar</Button>
		<Button on:click={getData} color="secondary">Limpiar</Button>
	</div>
</section>

<Table class="table table-hover">
	<thead class="table-light">
		<tr>
			<th>Provincia</th>
			<th>Año</th>
			<th>Precio</th>
			<th>Viajes</th>
			<th>Longitud</th>
			<th>Acciones</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><input bind:value={newProvince} /></td>
			<td><input bind:value={newYear} /></td>
			<td><input bind:value={newPrice} /></td>
			<td><input bind:value={newTrips} /></td>
			<td><input bind:value={newLength} /></td>
			<td><Button on:click={createTrip}>Crear</Button></td>
		</tr>
		{#each transitData as trip}
			<tr>
				<td>{trip.province}</td>
				<td>{trip.year}</td>
				<td>{trip.ticket_price}</td>
				<td>{trip.total_trips}</td>
				<td>{trip.route_length}</td>
				<td>
					<Button color="primary" on:click={() => goto(`/public-transit-stats/${trip.province}/${trip.year}`)}>Editar</Button>
					<Button color="danger" on:click={() => deleteTrip(trip.province, trip.year)}>Eliminar</Button>
				</td>
			</tr>
		{/each}
		<tr>
			<td colspan="6" class="text-center">
				<Button color="danger" on:click={deleteAllTrips}>Borrar Todo</Button>
			</td>
		</tr>
	</tbody>
</Table>

<style>
	.hero {
		text-align: center;
		padding: 2rem 1rem;
		background: linear-gradient(135deg, #1e3a8a 10%, #60a5fa 100%);
		color: white;
	}
	.actions,
	.filters {
		max-width: 1000px;
		margin: auto;
		padding: 1rem 2rem;
	}
	.filters input {
		margin-right: 0.5rem;
		margin-bottom: 0.5rem;
		padding: 0.4rem 0.8rem;
		border-radius: 8px;
		border: 1px solid #ccc;
	}
</style>