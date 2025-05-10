<script>
	// @ts-nocheck
	import { Button, Alert, Table } from '@sveltestrap/sveltestrap';
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';
	import 'bootstrap/dist/css/bootstrap.min.css';
	import { goto } from '$app/navigation';

	const DEVEL_HOST = 'http://localhost:16078';
	let API = '/api/v1/cultural-event';
	if (dev) {
		API = DEVEL_HOST + API;
	}

	let culturalData = [];
	let result = '';
	let resultStatus = '';

	let newProvince = '',
		newYear = '',
		newMonth = '',
		newTotalEvents = '',
		newAvgPrice = '',
		newTotalAtt = '',
		newLocalAtt = '',
		newForeignAtt = '',
		newType = '',
		newDuration = '';
	let searchProvince = '',
		searchYear = '',
		searchMonth = '',
		searchType = '';

	let alertMessage = '',
		alertType = '',
		showAlert = false;

	function showUserAlert(message, type = 'info') {
		alertMessage = message;
		alertType = type;
		showAlert = true;
		setTimeout(() => (showAlert = false), 4000);
	}

	async function getData(filters = {}) {
		resultStatus = result = '';
		try {
			let url = new URL(API, window.location.origin);
			Object.entries(filters).forEach(([k, v]) => {
				if (v) url.searchParams.append(k, v);
			});
			const res = await fetch(url.toString(), { method: 'GET' });
			const data = await res.json();
			result = JSON.stringify(data, null, 2);
			culturalData = Array.isArray(data) ? data : data.data;
		} catch (error) {
			console.log(`ERROR: GET from ${API}: ${error}`);
			showUserAlert('Error al obtener los datos del servidor', 'danger');
		}
	}

	async function deleteEntry(province, year, month) {
		try {
			const res = await fetch(`${API}/${province}/${year}`, { method: 'DELETE' });
			if (res.status === 200) {
				showUserAlert('Registro eliminado correctamente', 'success');
				getData();
			} else {
				showUserAlert('No se encontró el registro', 'warning');
			}
		} catch (error) {
			showUserAlert('Error de conexión al eliminar el registro', 'danger');
		}
	}

	async function createEntry() {
		try {
			const res = await fetch(API, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					province: newProvince,
					year: parseInt(newYear),
					month: newMonth,
					total_event: parseInt(newTotalEvents),
					avg_ticket_price: parseFloat(newAvgPrice),
					total_attendance: parseInt(newTotalAtt),
					local_attendance: parseInt(newLocalAtt),
					foreign_attendance: parseInt(newForeignAtt),
					event_type: newType,
					avg_event_duration: parseFloat(newDuration)
				})
			});

			if (res.status === 201) {
				showUserAlert('Registro creado', 'success');
				getData();
				newProvince = newYear = newMonth = newTotalEvents = newAvgPrice = '';
				newTotalAtt = newLocalAtt = newForeignAtt = newType = newDuration = '';
			} else {
				showUserAlert('Error al crear el registro', 'danger');
			}
		} catch (error) {
			showUserAlert('Error de conexión al crear el registro', 'danger');
		}
	}

	async function deleteAll() {
		try {
			const res = await fetch(API, { method: 'DELETE' });
			if (res.status === 200) {
				showUserAlert('Todos los registros eliminados', 'success');
				getData();
			} else {
				showUserAlert('Error al eliminar registros', 'danger');
			}
		} catch (error) {
			showUserAlert('Error de conexión al eliminar todos', 'danger');
		}
	}

	function applyFilters() {
		getData({
			province: searchProvince,
			year: searchYear,
			month: searchMonth,
			event_type: searchType
		});
	}

	onMount(() => getData());
</script>

<svelte:head>
	<title>Cultural Events Manager</title>
</svelte:head>

{#if showAlert}
	<Alert color={alertType}>{alertMessage}</Alert>
{/if}

<h2>Cultural Events List</h2>
<div class="mb-3">
	<Button color="success" on:click={() => goto('/cultural-event/pie-graph')} class="me-2">
		Data Graph
	</Button>
	<Button color="primary" on:click={() => goto('/cultural-event/bar-graph')}>Bar Graph</Button>
</div>

<h3>Filtros</h3>
<div class="mb-3">
	<label>Provincia:</label>
	<input bind:value={searchProvince} placeholder="Ej. Madrid" />
	<label>Año:</label>
	<input bind:value={searchYear} placeholder="Ej. 2024" />
	<label>Mes:</label>
	<input bind:value={searchMonth} placeholder="Ej. julio" />
	<Button color="info" on:click={applyFilters}>Buscar</Button>
	<Button color="secondary" on:click={() => getData()}>Limpiar</Button>
</div>

<Table>
	<thead>
		<tr>
			<th>Provincia</th>
			<th>Año</th>
			<th>Mes</th>
			<th>Total Eventos</th>
			<th>Precio Medio</th>
			<th>Asistencia Total</th>
			<th>Acciones</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><input bind:value={newProvince} /></td>
			<td><input bind:value={newYear} /></td>
			<td><input bind:value={newMonth} /></td>
			<td><input bind:value={newTotalEvents} /></td>
			<td><input bind:value={newAvgPrice} /></td>
			<td><input bind:value={newTotalAtt} /></td>
			<td><Button on:click={createEntry}>Crear</Button></td>
		</tr>

		{#each culturalData as item}
			<tr>
				<td>{item.province}</td>
				<td>{item.year}</td>
				<td>{item.month}</td>
				<td>{item.total_event}</td>
				<td>{item.avg_ticket_price}</td>
				<td>{item.total_attendance}</td>
				<td>
					<Button
						color="primary"
						on:click={() => goto(`/cultural-event/${item.province}/${item.year}`)}>Editar</Button
					>
					<Button color="danger" on:click={() => deleteEntry(item.province, item.year, item.month)}
						>Eliminar</Button
					>
				</td>
			</tr>
		{/each}
		<tr>
			<td colspan="7">
				<Button color="danger" on:click={deleteAll}>Borrar Todo</Button>
			</td>
		</tr>
	</tbody>
</Table>
