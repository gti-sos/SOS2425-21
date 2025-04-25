<svelte:head>
    <title>Public Transit Manager</title>
</svelte:head>

<script>
    // @ts-nocheck
    import { Button, Alert, Input, Table } from '@sveltestrap/sveltestrap';
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';
	import 'bootstrap/dist/css/bootstrap.min.css';
	import { goto } from '$app/navigation';

    const DEVEL_HOST = "http://localhost:16078";
    let API = "/api/v1/public-transit-stats";
    if (dev) {
        API = DEVEL_HOST + API;
    }

    let transitData= [];
    let result= "";
    let resultStatus= "";

    let newProvince= "";
    let newYear="";
    let newPrice= "";
    let newTrips = "";
    let newLength= "";

    let searchFrom = "";
    let searchTo = "";
    let searchProvince = "";

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
        resultStatus = result = "";
        try {
            const res = await fetch(API,{method:"GET"});
  
            const data = await res.json();
            result = JSON.stringify(data,null,2);

            transitData = Array.isArray(data) ? data : data.data;

            console.log(`Response received:\n${JSON.stringify(transitData,null,2)}`);

        } catch (error){
            console.log(`ERROR:  GET from ${API}: ${error}`);
            showUserAlert("Error al obtener los datos del servidor", "danger");
        }
    }

    async function deleteTrip(province,year) {
        resultStatus = result = "";
        try {
            const res = await fetch(API + "/" + province + "/" + year, { method: "DELETE" });
            const status = await res.status;
            resultStatus = status;
            result = ""; 
            if (status == 200) {
                console.log(`Trip ${province}, ${year} deleted`);
                showUserAlert(`Viaje de ${province} en ${year} eliminado correctamente`, "success");
                getData();
            } else if (status == 404) {
                showUserAlert(`No existe un viaje para ${province} en ${year}`, "warning");
                console.log(`ERROR deleting trip ${province}, ${year}: ${status}`);
            } else {
                showUserAlert(`Error al eliminar el viaje (${status})`, "danger");
                console.log(`ERROR deleting trip ${province}, ${year}: ${status}`);
            }
            
        } catch (error) {
            console.log(`ERROR: GET from ${API}: ${error}`);
            showUserAlert("Error de conexión al intentar eliminar el viaje", "danger");
        }
    }

    async function createTrip() {
        resultStatus = result = "";
        try {
            const res = await fetch(API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    province: newProvince,
                    year: parseInt(newYear),
                    ticket_price: parseFloat(newPrice),
                    total_trips: parseInt(newTrips),
                    route_length: parseFloat(newLength)
                })
            });

            const status = await res.status;
            resultStatus = status;
            result = await res.text();
            if (status == 201) {
                console.log(`Trip created`);
                showUserAlert("Viaje creado correctamente", "success");
                await getData();
                newProvince = "";
                newYear = "";
                newPrice = "";
                newTrips = "";
                newLength = "";
            } else if (status == 409) {
                showUserAlert("Ya existe un viaje con esos datos", "warning");
                console.log(`ERROR creating trip:\n ${status}`);
            } else {
                showUserAlert("Error al crear el viaje", "danger");
                console.log(`ERROR creating trip:\n ${status}`);
            }

        } catch (error) {
            console.log(`ERROR: POST to ${API}: ${error}`);
            showUserAlert("Error de conexión al crear el viaje", "danger");
        }
    }

    async function deleteAllTrips() {
        resultStatus = result = "";
        try {
            const res = await fetch(API, { method: "DELETE" });
            const status = await res.status;
            resultStatus = status;
            result = await res.text();

            if (status === 200) {
                console.log(`All trips deleted`);
                showUserAlert("Todos los viajes fueron eliminados", "success");
                getData();
            } else {
                showUserAlert("Error al eliminar los viajes", "danger");
                console.log(`ERROR deleting all trips: ${status}`);
            }
        } catch (error) {
            console.log(`ERROR: DELETE all from ${API}: ${error}`);
            showUserAlert("Error de conexión al eliminar los viajes", "danger");
        }
    }

    async function searchTrips() {
        resultStatus = result = "";
        try {
            let url = new URL(API);

            if (searchFrom) url.searchParams.append("from", searchFrom);
            if (searchTo) url.searchParams.append("to", searchTo);
            if (searchProvince) url.searchParams.append("province", searchProvince);

            const res = await fetch(url.toString(), { method: "GET" });
            const data = await res.json();
            resultStatus = res.status;
            result = JSON.stringify(data, null, 2);
            transitData = data.data;

            console.log("Filtered trips:", transitData);
            if (transitData.length === 0) {
                showUserAlert("No se encontraron viajes con los filtros aplicados", "warning");
            } else {
                showUserAlert("Búsqueda realizada correctamente", "info");
            }
        } catch (error) {
            console.log(`ERROR: filtered GET from ${API}: ${error}`);
            showUserAlert("Error al buscar los viajes", "danger");
        }
    }

    onMount(async () => {
        getData();
    })
</script>

{#if showAlert}
    <Alert color={alertType}>
        {alertMessage}
    </Alert>
{/if}

<h2>Trips List</h2>
<h3>Búsqueda</h3>
<div class="mb-3">
    <label for="fromYear">Desde el año:</label>
    <input id="fromYear" bind:value={searchFrom} placeholder="Ej. 2000">

    <label for="toYear">Hasta el año:</label>
    <input id="toYear" bind:value={searchTo} placeholder="Ej. 2017">

    <label for="provinceSearch">Provincia:</label>
    <input id="provinceSearch" bind:value={searchProvince} placeholder="Ej. Sevilla">

    <Button color="info" on:click={searchTrips}>Buscar</Button>
    <Button color="secondary" on:click={getData}>Limpiar</Button>
</div>
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
            <td>
                <input id="Province" bind:value={newProvince}>
            </td>
            <td>
                <input id="Year" bind:value={newYear}>
            </td>
            <td>
                <input id="Price" bind:value={newPrice}>
            </td>
            <td>
                <input id="Trips" bind:value={newTrips}>
            </td>
            <td>
                <input id="Length" bind:value={newLength}>
            </td>
            <td>
                <Button color="primary" on:click={createTrip}>Create</Button>
            </td>
        </tr>
        {#each transitData as trip}
            <tr>
                <td>{trip.province}</td>
                <td>{trip.year}</td>
                <td>{trip.ticket_price}</td>
                <td>{trip.total_trips}</td>
                <td>{trip.route_length}</td>
                <td>
                    <Button color="primary" on:click={() => goto(`/public-transit-stats/${trip.province}/${trip.year}`)}>Edit</Button>
                    <Button color="danger" on:click={() => deleteTrip(trip.province, trip.year)}>Delete</Button>
                </td>
            </tr>
        {/each}
        <tr>
            <td colspan="6">
                <Button color="danger" on:click={deleteAllTrips}>Borrar Todo</Button>
            </td>
        </tr>
    </tbody>
</Table>
