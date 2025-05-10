
<svelte:head>
    <title>Home Buying Selling Manager</title>
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
    let searchTotal = "";
    let searchProtected = "";
    let searchNew = "";
    let searchSecond = "";

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
    // Reiniciamos estados de resultado
        resultStatus = result = "";
        try {
            // Hacemos la petición GET a la API
            const res  = await fetch(API, { method: "GET" });
            const json = await res.json();
            // Guardamos el JSON completo para depuración (opcional)
            result = JSON.stringify(json, null, 2);
            // Sobrescribimos homeData con el array de registros
            // (ajusta a json.data si tu API envuelve los resultados en { data: […] })
            homeData = Array.isArray(json) ? json : json.data;
            console.log(`Datos recibidos:\n${JSON.stringify(homeData, null, 2)}`);
        } catch (error) {
            console.error(`ERROR al obtener datos de ${API}:`, error);
            showUserAlert("Error al obtener los datos del servidor", "danger");
        }
    }

    async function deleteStat(province, year) {
    // Reiniciamos estados
        resultStatus = result = "";

        try {
            // Llamada DELETE al endpoint de tu API
            const res = await fetch(`${API}/${province}/${year}`, {
                method: "DELETE"
            });
            const status = res.status;
            resultStatus = status;
            result = await res.text();

            if (status === 200) {
                console.log(`Registro ${province} / ${year} eliminado`);
                showUserAlert(`Registro de ${province} en ${year} eliminado correctamente`, "success");
                // Recargamos la lista automáticamente
                await getData();
            }
            else if (status === 404) {
                console.log(`No se encontró registro ${province} / ${year}`);
                showUserAlert(`No existe un registro de ${province} en ${year}`, "warning");
            }
            else {
                console.log(`Error al eliminar registro ${province} / ${year}: ${status}`);
                showUserAlert(`Error al eliminar el registro (código ${status})`, "danger");
            }

        } catch (error) {
            console.error(`Error de conexión al eliminar registro:`, error);
            showUserAlert("Error de conexión al eliminar el registro", "danger");
        }
    }


    async function createStat() {
    // Reiniciamos estados de resultado
        resultStatus = result = "";
        try {
            const res = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    province: newProvince,
                    year: parseInt(newYear, 10),
                    transaction_total: parseInt(newTotal, 10),
                    transaction_protected_housing: parseInt(newProtected, 10),
                    transaction_new_housing: parseInt(newNew, 10),
                    transaction_secondhand_housing: parseInt(newSecondhand, 10)
                })
            });

            const status = res.status;
            resultStatus = status;
            result = await res.text();

            if (status === 201) {
                console.log("Stat created");
                showUserAlert("Registro creado correctamente", "success");
                await getData();  // recarga la tabla
                // Limpiamos el formulario
                newProvince = "";
                newYear = "";
                newTotal = "";
                newProtected = "";
                newNew = "";
                newSecondhand = "";
            }
            else if (status === 409) {
                console.log(`ERROR creating stat: ${status}`);
                showUserAlert("Ya existe un registro con esos datos", "warning");
            }
            else {
                console.log(`ERROR creating stat: ${status}`);
                showUserAlert("Error al crear el registro", "danger");
            }
        }
        catch (error) {
            console.error(`ERROR POST to ${API}:`, error);
            showUserAlert("Error de conexión al crear el registro", "danger");
        }
    }
    async function clearFilters() {
        searchFrom     = "";
        searchTo       = "";
        searchProvince = "";
        searchTotal = "";
        searchProtected = "";
        searchNew = "";
        searchSecond = "";
        getData();
    }


    // Borra todos los registros de vivienda
    async function deleteAllStats() {
        // Reiniciamos estados de resultado
        resultStatus = result = "";
        try {
            const res = await fetch(API, { method: "DELETE" });
            const status = res.status;
            resultStatus = status;
            result = await res.text();

            if (status === 200) {
                console.log(`All stats deleted`);
                showUserAlert("Todos los registros fueron eliminados", "success");
                await getData();   // recarga automáticamente la lista
            } else {
                console.log(`ERROR deleting all stats: ${status}`);
                showUserAlert("Error al eliminar todos los registros", "danger");
            }
        } catch (error) {
            console.error(`ERROR: DELETE all from ${API}:`, error);
            showUserAlert("Error de conexión al eliminar todos los registros", "danger");
        }
    }

    // Busca registros según filtros “from”, “to” y “province”
    async function searchStats() {
        // Reiniciamos estados
        resultStatus = result = "";
        try {
            // Construimos URL absoluta para usar searchParams
            const url = new URL(API, window.location.origin);

            if (searchFrom)     url.searchParams.append("from",     searchFrom);
            if (searchTo)       url.searchParams.append("to",       searchTo);
            if (searchProvince) url.searchParams.append("province", searchProvince);
            if (searchTotal) url.searchParams.append("transaction_total", searchTotal);
            if (searchProtected) url.searchParams.append("transaction_protected_housing", searchProtected);
            if (searchNew) url.searchParams.append("transaction_new_housing", searchNew);
            if (searchSecond) url.searchParams.append("transaction_secondhand_housing", searchSecond);

            const res = await fetch(url.toString(), { method: "GET" });
            resultStatus = res.status;
            const json = await res.json();

            // Asignamos el array de registros devuelto
            homeData = Array.isArray(json) ? json : json.data;

            console.log("Filtered stats:", homeData);
            if (homeData.length === 0) {
                showUserAlert("No se encontraron registros con los filtros aplicados", "warning");
            } else {
                showUserAlert("Búsqueda realizada correctamente", "info");
            }
        } catch (error) {
            console.error(`ERROR: filtered GET from ${API}:`, error);
            showUserAlert("Error de conexión al realizar la búsqueda", "danger");
        }
    }
    async function loadInitialData() {
        const res = await fetch(`${API}/loadInitialData`);
        const status = res.status;

        if (status === 201 || status === 200) {
            showUserAlert("✅ Datos iniciales cargados correctamente", "ok");
            await getData();
        } else if (status === 400) {
            showUserAlert("⚠️ Los datos ya estaban cargados", "error");
        } else {
            showUserAlert("❌ Error al cargar los datos iniciales", "error");
        }
    }


    onMount(async () => {
        getData();
    })
</script>

{#if showAlert}
    <Alert color={alertType}>{alertMessage}</Alert>
{/if}

<h2>Estadísticas de compraventa de viviendas</h2>
<h3>Graficos</h3>
    <Button color="primary" on:click={() => goto('/home-buying-selling-stats/pie-highchart')}>
    Transacciones Totales
    </Button>
    <Button color="primary" on:click={() => goto('/home-buying-selling-stats/pyramid-amcharts')}>
    Viviendas Nuevas
    </Button>
<hr>
<h3>Búsqueda</h3>
<div class="mb-3">
    <label for="fromYear">Desde el año:</label>
    <input id="fromYear" bind:value={searchFrom} placeholder="Ej. 2010">
    <label for="toYear">Hasta el año:</label>
    <input id="toYear" bind:value={searchTo} placeholder="Ej. 2020">
    <label for="provinceSearch">Provincia:</label>
    <input id="provinceSearch" bind:value={searchProvince} placeholder="Ej. Málaga">
    <label for="totalSearch">Transaccion Total:</label>
    <input id="totalSearch" bind:value={searchTotal} placeholder="Ej. 3457">
    <label for="protectedSearch">Transaccion Casas Protegidas:</label>
    <input id="protectedSearch" bind:value={searchProtected} placeholder="Ej. 3456">
    <label for="newSearch">Transaccion Casas Nuevas:</label>
    <input id="newSearch" bind:value={searchNew} placeholder="Ej. 4598">
    <label for="secondSearch">Transaccion Casas Segunda Mano:</label>
    <input id="secondSearch" bind:value={searchSecond} placeholder="Ej. 3456">

    <Button color="info" on:click={searchStats}>Buscar</Button>
    <Button color="secondary" on:click={clearFilters}>Limpiar</Button>
</div>

<Table>
    <thead>
        <tr>
            <th>Province</th>
            <th>Year</th>
            <th>Total</th>
            <th>Protected</th>
            <th>New</th>
            <th>Secondhand</th>
            <th>Actions</th>
        </tr>
    </thead>

    <tbody>
        <tr>
            <td><input id="Province" bind:value={newProvince}></td>
            <td><input id="Year" bind:value={newYear}></td>
            <td><input id="Total" bind:value={newTotal}></td>
            <td><input id="Protected" bind:value={newProtected}></td>
            <td><input id="New" bind:value={newNew}></td>
            <td><input id="Secondhand" bind:value={newSecondhand}></td>
            <td><Button color="primary" on:click={createStat}>Create</Button></td>
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
                    <Button color="primary" on:click={() => goto(`/home-buying-selling-stats/${stat.province}/${stat.year}`)}>Edit</Button>
                    <Button color="danger" on:click={() => deleteStat(stat.province, stat.year)}>Delete</Button>
                </td>
            </tr>
        {/each}

        <tr>
            <td colspan="7">
                <Button color="danger" on:click={deleteAllStats}>Borrar Todo</Button>
                <Button color="secondary" on:click={loadInitialData}>Cargar datos iniciales</Button>
            </td>
        </tr>
    </tbody>
</Table>
