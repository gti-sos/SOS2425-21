<svelte:head>
	<title>Home Buying Selling Manager</title>
</svelte:head>

<script>
	// @ts-nocheck
	import { Button, Alert, Table } from '@sveltestrap/sveltestrap';
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';
	import 'bootstrap/dist/css/bootstrap.min.css';
	import { goto } from '$app/navigation';

	const DEVEL_HOST = 'http://localhost:16078';
	let API = '/api/v1/home-buying-selling-stats';
	if (dev) API = DEVEL_HOST + API;

	let homeData = [];
	let newProvince = '', newYear = '', newTotal = '', newProtected = '', newNew = '', newSecondhand = '';
	let searchFrom = '', searchTo = '', searchProvince = '', searchTotal = '', searchProtected = '', searchNew = '', searchSecond = '';
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
			homeData = await res.json();
		} catch (error) {
			showUserAlert('Error al obtener los datos del servidor', 'danger');
		}
	}

	async function deleteStat(province, year) {
		try {
			const res = await fetch(`${API}/${province}/${year}`, { method: 'DELETE' });
			if (res.status === 200) {
				showUserAlert('Registro eliminado correctamente', 'success');
				getData();
			} else {
				showUserAlert('No se encontró el registro', 'warning');
			}
		} catch (error) {
			showUserAlert('Error al eliminar el registro', 'danger');
		}
	}

	async function createStat() {
		try {
			const res = await fetch(API, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					province: newProvince,
					year: +newYear,
					transaction_total: +newTotal,
					transaction_protected_housing: +newProtected,
					transaction_new_housing: +newNew,
					transaction_secondhand_housing: +newSecondhand
				})
			});
			if (res.status === 201) {
				showUserAlert('Registro creado correctamente', 'success');
				getData();
				newProvince = newYear = newTotal = newProtected = newNew = newSecondhand = '';
			} else {
				showUserAlert('Error al crear el registro', 'danger');
			}
		} catch (error) {
			showUserAlert('Error de conexión', 'danger');
		}
	}

	function clearFilters() {
		searchFrom = searchTo = searchProvince = searchTotal = searchProtected = searchNew = searchSecond = '';
		getData();
	}

	async function deleteAllStats() {
		try {
			const res = await fetch(API, { method: 'DELETE' });
			if (res.status === 200) {
				showUserAlert('Todos los registros eliminados', 'success');
				getData();
			} else {
				showUserAlert('Error al eliminar registros', 'danger');
			}
		} catch (error) {
			showUserAlert('Error al eliminar todos', 'danger');
		}
	}

	async function searchStats() {
		try {
			const url = new URL(API, window.location.origin);
			if (searchFrom) url.searchParams.append('from', searchFrom);
			if (searchTo) url.searchParams.append('to', searchTo);
			if (searchProvince) url.searchParams.append('province', searchProvince);
			if (searchTotal) url.searchParams.append('transaction_total', searchTotal);
			if (searchProtected) url.searchParams.append('transaction_protected_housing', searchProtected);
			if (searchNew) url.searchParams.append('transaction_new_housing', searchNew);
			if (searchSecond) url.searchParams.append('transaction_secondhand_housing', searchSecond);
			homeData = await (await fetch(url.toString())).json();
			showUserAlert('Búsqueda completada', 'info');
		} catch (e) {
			showUserAlert('Error de búsqueda', 'danger');
		}
	}

	onMount(getData);
</script>

<section class="hero">
	<h1>🏡 Home Buying & Selling Manager</h1>
	<p>Estadísticas por provincia y tipo de vivienda</p>
</section>

{#if showAlert}
	<Alert color={alertType} class="my-3">{alertMessage}</Alert>
{/if}

<section class="actions">
	<Button color="primary" on:click={() => goto('/home-buying-selling-stats/pie-highchart')}>
		Transacciones Totales
	</Button>
	<Button color="primary" on:click={() => goto('/home-buying-selling-stats/bar-amcharts')}>
		Viviendas Nuevas
	</Button>
</section>

<section class="filters">
	<h3>Filtros</h3>
	<div>
		<input bind:value={searchFrom} placeholder="Desde..." />
		<input bind:value={searchTo} placeholder="Hasta..." />
		<input bind:value={searchProvince} placeholder="Provincia..." />
		<input bind:value={searchTotal} placeholder="Total..." />
		<input bind:value={searchProtected} placeholder="Protegidas..." />
		<input bind:value={searchNew} placeholder="Nuevas..." />
		<input bind:value={searchSecond} placeholder="2ª Mano..." />
		<Button on:click={searchStats} color="info">Buscar</Button>
		<Button on:click={clearFilters} color="secondary">Limpiar</Button>
	</div>
</section>
<section class="table">
<Table class="table table-hover">
	<thead class="table-light">
		<tr>
			<th>Provincia</th>
			<th>Año</th>
			<th>Total</th>
			<th>Protegidas</th>
			<th>Nuevas</th>
			<th>2ª Mano</th>
			<th>Acciones</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><input bind:value={newProvince} /></td>
			<td><input bind:value={newYear} /></td>
			<td><input bind:value={newTotal} /></td>
			<td><input bind:value={newProtected} /></td>
			<td><input bind:value={newNew} /></td>
			<td><input bind:value={newSecondhand} /></td>
			<td><Button on:click={createStat}>Crear</Button></td>
		</tr>
		{#each homeData as stat}
			<tr>
				<td>{stat.province}</td>
				<td>{stat.year}</td>
				<td>{stat.transaction_total}</td>
				<td>{stat.transaction_protected_housing}</td>
				<td>{stat.transaction_new_housing}</td>
				<td>{stat.transaction_secondhand_housing}</td>
				<td>
					<Button color="primary" on:click={() => goto(`/home-buying-selling-stats/${stat.province}/${stat.year}`)}>Editar</Button>
					<Button color="danger" on:click={() => deleteStat(stat.province, stat.year)}>Eliminar</Button>
				</td>
			</tr>
		{/each}
		<tr>
			<td colspan="7" class="text-center">
				<Button color="danger" on:click={deleteAllStats}>Borrar Todo</Button>
			</td>
		</tr>
	</tbody>
</Table>
</section>


<style>
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