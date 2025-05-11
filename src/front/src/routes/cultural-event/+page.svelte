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
		try {
			let url = new URL(API, window.location.origin);
			Object.entries(filters).forEach(([k, v]) => {
				if (v) url.searchParams.append(k, v);
			});
			const res = await fetch(url.toString());
			culturalData = await res.json();
		} catch (e) {
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
		} catch (e) {
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
		} catch (e) {
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
		} catch (e) {
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

<section class="hero">
	<h1>🎭 Cultural Events Manager</h1>
	<p>Estadísticas de eventos culturales por provincia</p>
</section>

{#if showAlert}
	<Alert color={alertType} class="my-3">{alertMessage}</Alert>
{/if}

<section class="cards-container">
	<div class="card-box">
		<h3>📊 Gráficas</h3>
		<div class="chart-buttons">
			<Button color="success" on:click={() => goto('/cultural-event/pie-graph')}
				>Gráfico Circular</Button
			>
			<Button color="primary" on:click={() => goto('/cultural-event/bar-graph')}
				>Gráfico de Barras</Button
			>
		</div>
	</div>

	<div class="card-box">
		<h3>🔗 Integraciones</h3>
		<div class="chart-buttons">
			<Button color="success" on:click={() => goto('/integrations/PRG')}>Externas</Button>
			<Button color="primary" on:click={() => goto('/integrations/PRG/sos')}>Internas</Button>
		</div>
	</div>
</section>

<section class="filters">
	<h3>🔎 Filtros</h3>
	<div>
		<input bind:value={searchProvince} placeholder="Provincia..." />
		<input bind:value={searchYear} placeholder="Año..." />
		<input bind:value={searchMonth} placeholder="Mes..." />
		<input bind:value={searchType} placeholder="Tipo..." />
		<Button on:click={applyFilters} color="info">Buscar</Button>
		<Button on:click={() => getData()} color="secondary">Limpiar</Button>
	</div>
</section>

<section class="table">
	<Table class="table table-hover">
		<thead class="table-light">
			<tr>
				<th>Provincia</th>
				<th>Año</th>
				<th>Mes</th>
				<th>Total</th>
				<th>Precio Medio</th>
				<th>Asistencia</th>
				<th>Acciones</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td><input bind:value={newProvince} data-testid="input-province" /></td>
				<td><input bind:value={newYear} data-testid="input-year" /></td>
				<td><input bind:value={newMonth} data-testid="input-month" /></td>
				<td><input bind:value={newTotalEvents} data-testid="input-total" /></td>
				<td><input bind:value={newAvgPrice} data-testid="input-price" /></td>
				<td><input bind:value={newTotalAtt} data-testid="input-attendance" /></td>
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
						<Button
							color="danger"
							on:click={() => deleteEntry(item.province, item.year, item.month)}>Eliminar</Button
						>
					</td>
				</tr>
			{/each}
			<tr>
				<td colspan="7" class="text-center">
					<Button color="danger" on:click={deleteAll}>Borrar Todo</Button>
				</td>
			</tr>
		</tbody>
	</Table>
</section>

<style>
	.charts-section {
		background: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		border-radius: 1rem;
		padding: 2rem;
		margin: 3rem auto;
		max-width: 1000px;
		text-align: center;
	}

	.charts-section h3 {
		color: var(--primary, #1e3a8a);
		margin-bottom: 1.5rem;
	}

	.chart-buttons {
		display: flex;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.cards-container {
		display: flex;
		flex-wrap: wrap;
		gap: 2rem;
		justify-content: center;
		margin: 3rem auto;
		max-width: 1000px;
	}

	.card-box {
		background: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		border-radius: 1rem;
		padding: 2rem;
		width: 100%;
		max-width: 460px;
		text-align: center;
	}

	.card-box h3 {
		color: var(--primary, #1e3a8a);
		margin-bottom: 1.5rem;
	}

	.hero {
		text-align: center;
		padding: 2rem 1rem;
		background: linear-gradient(135deg, #1e3a8a 10%, #60a5fa 100%);
		color: white;
	}
	.actions,
	.filters {
		max-width: 100%;
		padding: 1rem 2rem;
	}
	.filters input {
		margin-right: 0.5rem;
		margin-bottom: 0.5rem;
		padding: 0.4rem 0.8rem;
		border-radius: 8px;
		border: 1px solid #ccc;
	}
	.table {
		padding: 1rem 2rem;
	}
</style>
