<script>
    // @ts-nocheck
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { Button, Table, Alert } from '@sveltestrap/sveltestrap';
    import { page } from '$app/stores';

    let province = $page.params.province;
    let year = $page.params.year;
    let housingData = {};
    let resultStatus = "";

    let newTotal = "";
    let newProtected = "";
    let newNew = "";
    let newSecondhand = "";

    const API = `/api/v1/home-buying-selling-stats/${province}/${year}`;

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
            const res = await fetch(API);
            const data = await res.json();
            housingData = data;
            newTotal = housingData.transaction_total;
            newProtected = housingData.transaction_protected_housing;
            newNew = housingData.transaction_new_housing;
            newSecondhand = housingData.transaction_secondhand_housing;
        } catch (error) {
            showUserAlert("Error al obtener los datos", "danger");
        }
    }

    async function editHousingData() {
        try {
            const res = await fetch(API, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    province,
                    year: parseInt(year),
                    transaction_total: parseInt(newTotal),
                    transaction_protected_housing: parseInt(newProtected),
                    transaction_new_housing: parseInt(newNew),
                    transaction_secondhand_housing: parseInt(newSecondhand)
                })
            });
            resultStatus = res.status;
            if (res.status == 200) {
                showUserAlert("Datos actualizados correctamente", "success");
                setTimeout(() => goto(`/home-buying-selling-stats`), 1500);
            } else {
                showUserAlert("Error al actualizar los datos", "danger");
            }
        } catch (error) {
            showUserAlert("Error de conexión al actualizar", "danger");
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

<h2>Editar datos de vivienda en {province} - {year}</h2>

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
            <td>{housingData.province}</td>
            <td>{housingData.year}</td>
            <td><input bind:value={newTotal} type="number" placeholder="Total" /></td>
            <td><input bind:value={newProtected} type="number" placeholder="Protegida" /></td>
            <td><input bind:value={newNew} type="number" placeholder="Nueva" /></td>
            <td><input bind:value={newSecondhand} type="number" placeholder="2ª Mano" /></td>
            <td>
                <Button color="primary" on:click={editHousingData}>Actualizar</Button>
                <Button color="secondary" on:click={() => goto('/home-buying-selling-stats')}>Cancelar</Button>
            </td>
        </tr>
    </tbody>
</Table>
