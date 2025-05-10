<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Button, Table, Input, Alert } from '@sveltestrap/sveltestrap';
	import { page } from '$app/stores';
	import { dev } from '$app/environment';

	let province = $page.params.province;
	let year = $page.params.year;
	let eventData = {};
	let resultStatus = '';

	let newMonth = '';
	let newTotalEvents = '';
	let newAvgPrice = '';
	let newTotalAtt = '';
	let newLocalAtt = '';
	let newForeignAtt = '';
	let newType = '';
	let newDuration = '';

	let API = `/api/v1/cultural-event/${province}/${year}`;
	if (dev) {
		API = `http://localhost:16078` + API;
	}

	let alertMessage = '';
	let alertType = '';
	let showAlert = false;

	function showUserAlert(message, type = 'info') {
		alertMessage = message;
		alertType = type;
		showAlert = true;
	}
	function closeUserAlert() {
		showAlert = false;
	}

	async function getData() {
		try {
			const res = await fetch(API, { method: 'GET' });
			const data = await res.json();
			eventData = data;
			newMonth = eventData.month;
			newTotalEvents = eventData.total_event;
			newAvgPrice = eventData.avg_ticket_price;
			newTotalAtt = eventData.total_attendance;
			newLocalAtt = eventData.local_attendance;
			newForeignAtt = eventData.foreign_attendance;
			newType = eventData.event_type;
			newDuration = eventData.avg_event_duration;
		} catch (error) {
			console.log(`ERROR: GET from ${API}: ${error}`);
			showUserAlert('Error al obtener el evento', 'danger');
		}
	}

	async function editEvent() {
		try {
			const res = await fetch(API, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					province,
					year: parseInt(year),
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

			resultStatus = res.status;
			if (res.status === 200) {
				showUserAlert('Evento actualizado correctamente', 'success');
			} else {
				showUserAlert('Error al actualizar el evento', 'danger');
			}
		} catch (error) {
			showUserAlert('Error de conexión al actualizar el evento', 'danger');
		}
	}

	onMount(() => getData());
</script>

{#if showAlert}
	<Alert color={alertType} class="mt-3">
		<div style="display: flex; justify-content: space-between; align-items: center;">
			<span>{alertMessage}</span>
			<Button close on:click={closeUserAlert} />
		</div>
	</Alert>
{/if}

<h2>Editar evento de {province} en {year}</h2>

<Table>
	<thead>
		<tr>
			<th>Mes</th>
			<th>Total Eventos</th>
			<th>Precio Medio</th>
			<th>Asistencia Total</th>
			<th>Local</th>
			<th>Foránea</th>
			<th>Tipo Evento</th>
			<th>Duración Media</th>
			<th>Acciones</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><input bind:value={newMonth} /></td>
			<td><input bind:value={newTotalEvents} type="number" /></td>
			<td><input bind:value={newAvgPrice} type="number" step="0.01" /></td>
			<td><input bind:value={newTotalAtt} type="number" /></td>
			<td><input bind:value={newLocalAtt} type="number" /></td>
			<td><input bind:value={newForeignAtt} type="number" /></td>
			<td><input bind:value={newType} /></td>
			<td><input bind:value={newDuration} type="number" step="0.1" /></td>
			<td>
				<Button color="primary" on:click={editEvent}>Actualizar</Button>
				<Button color="secondary" on:click={() => goto('/cultural-event')}>Cancelar</Button>
			</td>
		</tr>
	</tbody>
</Table>
