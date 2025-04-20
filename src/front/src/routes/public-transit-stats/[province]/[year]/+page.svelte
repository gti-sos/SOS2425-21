<script>
    // @ts-nocheck
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { Button, Table, Input, Alert } from '@sveltestrap/sveltestrap';
    import { page } from '$app/stores';

    let province = $page.params.province;
    let year = $page.params.year;
    let transitData = {};
    let result = "";
    let resultStatus = "";

    let newPrice = "";
    let newTrips = "";
    let newLength = "";

    const API = `/api/v1/public-transit-stats/${province}/${year}`;

    let alertMessage = "";
    let alertType = "";
    let showAlert = false;

    function showUserAlert(message, type = "info") {
        alertMessage = message;
        alertType = type;
        showAlert = true;
        setTimeout(() => {
            showAlert = false;
        }, 4000);
    }

    async function getData() {
        try {
            const res = await fetch(API, { method: "GET" });
            const data = await res.json();
            transitData = data;
            newPrice = transitData.ticket_price;
            newTrips = transitData.total_trips;
            newLength = transitData.route_length;
        } catch (error) {
            console.log(`ERROR: GET from ${API}: ${error}`);
            showUserAlert("Error al obtener el viaje del servidor", "danger");
        }
    }

    async function editTrip() {
        try {
            const res = await fetch(API, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    province,
                    year: parseInt(year),
                    ticket_price: parseFloat(newPrice),
                    total_trips: parseInt(newTrips),
                    route_length: parseFloat(newLength)
                })
            });
            const status = await res.status;
            resultStatus = status;
            if (status == 200) {
                console.log(`Trip updated successfully`);
                showUserAlert("Viaje actualizado correctamente", "success");
                setTimeout(() => goto(`/public-transit-stats`), 1500);
            } else {
                console.log(`ERROR updating trip: ${status}`);
                showUserAlert("Error al actualizar el viaje", "danger");
            }
        } catch (error) {
            console.log(`ERROR: PUT to ${API}: ${error}`);
            showUserAlert("Error de conexión al actualizar el viaje", "danger");
        }
    }

    onMount(() => {
        getData();
    });
</script>

{#if showAlert}
    <Alert color={alertType}>
        {alertMessage}
    </Alert>
{/if}

<h2>Edit Trip for {province} in {year}</h2>

<Table>
    <thead>
        <tr>
            <th>Province</th>
            <th>Year</th>
            <th>Price</th>
            <th>Trips</th>
            <th>Length</th>
            <th>Actions</th>
        </tr>
    </thead>

    <tbody>
        <tr>
            <td>{transitData.province}</td>
            <td>{transitData.year}</td>
            <td>
                <input bind:value={newPrice} type="number" placeholder="Ticket price" />
            </td>
            <td>
                <input bind:value={newTrips} type="number" placeholder="Total trips" />
            </td>
            <td>
                <input bind:value={newLength} type="number" placeholder="Route length" />
            </td>
            <td>
                <Button color="primary" on:click={editTrip}>Update</Button>
                <Button color="secondary" on:click={() => goto('/public-transit-stats')}>Cancel</Button>
            </td>
        </tr>
    </tbody>
</Table>
