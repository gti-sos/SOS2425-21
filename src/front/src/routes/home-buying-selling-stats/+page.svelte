
<svelte:head>
    <title>Home Buying/Selling Manager</title>
</svelte:head>

<script>
    // @ts-nocheck
    import { Button, Alert, Input, Table } from '@sveltestrap/sveltestrap';
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';
	import 'bootstrap/dist/css/bootstrap.min.css';
	import { goto } from '$app/navigation';

    const DEVEL_HOST = "http://localhost:16078";
    let API = "/api/v1/home-buying-selling-stats";
    if (dev) {
        API = DEVEL_HOST + API;
    }

    let homeData = [];
    let result = "";
    let resultStatus = "";

    let newProvince = "";
    let newYear = "";
    let newTotal = "";
    let newProtected = "";
    let newNew = "";
    let newSecondhand = "";

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
            const res = await fetch(API);
            const data = await res.json();
            result = JSON.stringify(data, null, 2);
            homeData = data;
        } catch (error){
            showUserAlert("Error al obtener los datos del servidor", "danger");
        }
    }

    async function deleteStat(province, year) {
        try {
            const res = await fetch(`${API}/${province}/${year}`, { method: "DELETE" });
            if (res.status === 200) {
                showUserAlert(`Registro eliminado correctamente`, "success");
                getData();
            } else if (res.status === 404) {
                showUserAlert(`No existe el registro solicitado`, "warning");
            } else {
                showUserAlert(`Error al eliminar el registro`, "danger");
            }
        } catch (error) {
            showUserAlert("Error de conexión al eliminar", "danger");
        }
    }

    async function createStat() {
        try {
            const res = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    province: newProvince,
                    year: parseInt(newYear),
                    transaction_total: parseInt(newTotal),
                    transaction_protected_housing: parseInt(newProtected),
                    transaction_new_housing: parseInt(newNew),
                    transaction_secondhand_housing: parseInt(newSecondhand)
                })
            });
            if (res.status === 201) {
                showUserAlert("Registro creado correctamente", "success");
                getData();
                newProvince = newYear = newTotal = newProtected = newNew = newSecondhand = "";
            } else if (res.status === 409) {
                showUserAlert("Ya existe un registro con esos datos", "warning");
            } else {
                showUserAlert("Error al crear el registro", "danger");
            }
        } catch (error) {
            showUserAlert("Error de conexión al crear", "danger");
        }
    }

    async function deleteAllStats() {
        try {
            const res = await fetch(API, { method: "DELETE" });
            if (res.status === 200) {
                showUserAlert("Todos los registros fueron eliminados", "success");
                getData();
            } else {
                showUserAlert("Error al eliminar todos los registros", "danger");
            }
        } catch (error) {
            showUserAlert("Error de conexión al eliminar todo", "danger");
        }
    }

    async function searchStats() {
        try {
            let url = new URL(API);
            if (searchFrom) url.searchParams.append("from", searchFrom);
            if (searchTo) url.searchParams.append("to", searchTo);
            if (searchProvince) url.searchParams.append("province", searchProvince);

            const res = await fetch(url.toString());
            const data = await res.json();
            homeData = data;

            if (homeData.length === 0) {
                showUserAlert("No se encontraron resultados", "warning");
            } else {
                showUserAlert("Búsqueda realizada correctamente", "info");
            }
        } catch (error) {
            showUserAlert("Error al realizar la búsqueda", "danger");
        }
    }

    onMount(() => getData());
</script>

{#if showAlert}
    <Alert color={alertType}>{alertMessage}</Alert>
{/if}

<h2>Estadísticas de compraventa de viviendas</h2>

<h3>Búsqueda</h3>
<div class="mb-3">
    <label for="fromYear">Desde el año:</label>
    <input id="fromYear" bind:value={searchFrom} placeholder="Ej. 2010">
    <label for="toYear">Hasta el año:</label>
    <input id="toYear" bind:value={searchTo} placeholder="Ej. 2020">
    <label for="provinceSearch">Provincia:</label>
    <input id="provinceSearch" bind:value={searchProvince} placeholder="Ej. Málaga">

    <Button color="info" on:click={searchStats}>Buscar</Button>
    <Button color="secondary" on:click={getData}>Limpiar</Button>
</div>

<Table>
    <thead>
        <tr>
            <th>Provincia</th>
            <th>Año</th>
            <th>Total</th>
            <th>Protegida</th>
            <th>Nueva</th>
            <th>2ª Mano</th>
            <th>Acciones</th>
        </tr>
    </thead>

    <tbody>
        <tr>
            <td><input bind:value={newProvince}></td>
            <td><input bind:value={newYear}></td>
            <td><input bind:value={newTotal}></td>
            <td><input bind:value={newProtected}></td>
            <td><input bind:value={newNew}></td>
            <td><input bind:value={newSecondhand}></td>
            <td><Button color="primary" on:click={createStat}>Crear</Button></td>
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
            <td colspan="7">
                <Button color="danger" on:click={deleteAllStats}>Borrar Todo</Button>
            </td>
        </tr>
    </tbody>
</Table>
