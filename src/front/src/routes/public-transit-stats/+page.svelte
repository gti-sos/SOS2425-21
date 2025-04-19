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

    async function getData() {
        resultStatus = result = "";
        try {
            const res = await fetch(API,{method:"GET"});
  
            const data = await res.json();
            result = JSON.stringify(data,null,2);

            transitData = data;
            console.log(`Response received:\n${JSON.stringify(transitData,null,2)}`);

        } catch (error){
            console.log(`ERROR:  GET from ${API}: ${error}`);
        }
    }

    async function deleteTrip(province,year) {
        resultStatus = result = "";
        try {
            const res = await fetch(API+"/"+province+"/"+year,{method:"DELETE"});
            const status =  await res.status;
            resultStatus =status
            result = JSON.stringify(data,null,2);
            if (status== 200){
                console.log(`Trip ${province,year} deleted `);
                getData();
            }else{
                console.log(`ERROR deleting trip ${province,year}:\n ${status}`);
            }
            
        } catch (error){
            console.log(`ERROR: GET from ${API}: ${error}`);
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
        result = await res.text(); // para capturar cualquier respuesta del backend
        if (status == 201) {
            console.log(`Trip created`);
            getData();
        } else {
            console.log(`ERROR creating trip:\n ${status}`);
        }

    } catch (error) {
        console.log(`ERROR: POST to ${API}: ${error}`);
    }
}

    onMount(async () => {
        getData();
    })
</script>
<h2>Trips List</h2>

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
                <input bind:value={newProvince}>
            </td>
            <td>
                <input bind:value={newYear}>
            </td>
            <td>
                <input bind:value={newPrice}>
            </td>
            <td>
                <input bind:value={newTrips}>
            </td>
            <td>
                <input bind:value={newLength}>
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
                    <Button color="danger" on:click={() => deleteTrip(trip.province, trip.year)}>Delete</Button>
                </td>
            </tr>
        {/each}
    </tbody>
</Table>
