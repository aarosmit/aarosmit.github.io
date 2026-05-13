<svelte:head>
    <title>Drive</title> 
</svelte:head>

<svelte:options runes={false} />

<script>

import { page } from '$app/state';
import { base } from '$app/paths';

import Geolocation from "svelte-geolocation";
import PocketBase from 'pocketbase';
import { onMount } from 'svelte';
const pb = new PocketBase('https://db.aarosmit.com');

let password;
let authData;
let error;

onMount(async () => {

    if (pb.authStore.isValid) {
        authData = true
    } 
})

async function login () {
    try {
        authData = await pb.collection("users").authWithPassword('aaron', password);
        error = null;
    } catch (err) {
        error = err.message
        console.log(err.message)
    }
}

// IF MASS IMPORT NEEDED

// async function importData () {
//    const response = await fetch('/src/lib/assets/car.json')
//    const data = await response.json();
//    console.log(data)
//    let newRecord;
//    let makeRecord;
//    let odo;
//    let notesImport;

//    for (let i=0; i < data.length; i++) {
//     //    console.log(data[i])
//     if (data[i].Fit) {
//         newRecord = {
//             vehicle: "Fit",
//             date: new Date(data[i].Date),
//             cost: Math.round((data[i].Fit) * 100) / 100,
//         }
//         console.log(newRecord)
//     }
//         // makeRecord = await pb.collection('vehicles').create(newRecord)
//     }
// }

// onMount(() => {
//     importData()
// }
// )



let records;
let selectedVehicle = "Cross";
let date = new Date()
let oneMonthAgo = new Date(date - 2592000000).toISOString()
let odometer;
let cost;
let notes;
let coords = [];
let saveCoords = true;
let loggedCoords = [];
let prevCrossRecord;
let prevFitRecord;
let prevSelectedRecord;
let recordSubmitted = false;
// let password;
// let error;

// $: console.log(saveCoords, loggedCoords)

$: if (saveCoords) {
    loggedCoords = [Math.round(coords[1]* 1000) / 1000, Math.round(coords[0]* 1000) / 1000]
} else {
    loggedCoords = null
}

$: if (selectedVehicle === "Cross") {
    prevSelectedRecord = prevCrossRecord;
} else {
    prevSelectedRecord = prevFitRecord;
}

$: newRecord = {
    vehicle: selectedVehicle,
    date: date,
    odometer: odometer,
    cost: cost,
    location: loggedCoords,
    notes: notes
}

async function createRecord (record) {
    await pb.collection('vehicles').create(record);
    recordSubmitted = true;
}



async function getRecords () {
    try {
        records = await pb.collection('vehicles').getFullList({
            sort: '-date',
            filter: `date >= "${oneMonthAgo}"`
        })
    } catch (err) {
        error = err.message
        console.log(err.message)
    }
    // console.log(records)
    for (let i = 0; i < records.length; i++) {
        if (records[i].vehicle === "Cross" && records[i].odometer > 0) {
            prevCrossRecord = records[i]
            break
        }
    }
    for (let i = 0; i < records.length; i++) {
        if (records[i].vehicle === "Fit" && records[i].odometer > 0) {
            prevFitRecord = records[i]
            break
        }
    }


    // console.log(prevCrossRecord, prevFitRecord)
    return records
}

// $: console.log(prevSelectedRecord)

</script>

{#if !authData}

<!-- LOGIN -->

<div style="text-align:center;position:fixed;bottom:10%;width:100%;">
    <p>{error}</p>
    <input style="background-color:#e9e9ed;border:none;font-size:1em;border:none;border-radius:5px;" type="password" bind:value={password}>
    <br><br>
    <button style="padding:0.5em;padding-left:1em;padding-right:1em;font-size:1.2em;border:none;border-radius:5px;" onclick={() => login()}>LOGIN</button>
</div>

{:else}

<Geolocation getPosition bind:coords />

<h1>Log drive</h1>

{#await getRecords()}

<p>Getting data</p>
    
{:then records} 

<form style="position:fixed;bottom:10%;">

<table style="margin:0px auto;">
<tbody>

<tr>
    {#if selectedVehicle === "Cross"}
    <td colspan="3" style="text-align:center;">
        <button style="background-color: #84b76680;" onclick={() => selectedVehicle = "Cross"}><b>Cross</b></button>
        <button onclick={() => selectedVehicle = "Fit"}>Fit</button>
    </td>
    {:else}
    <td colspan="3" style="text-align:center;">
        <button onclick={() => selectedVehicle = "Cross"}>Cross</button>
        <button style="background-color: #84b76680;" onclick={() => selectedVehicle = "Fit"}><b>Fit</b></button>
        </td>
    {/if}
</tr>

<tr>
    <td>Date</td>
    <td style="font-size:1em;"><input style="width:12.5em;" type="date" bind:value={date}><br>{date.toLocaleString()}</td>
    <td></td>
</tr>

<tr>
    <td>Odometer</td>
    <td><input type="number" bind:value={odometer} min={prevSelectedRecord.odometer} placeholder={prevSelectedRecord.odometer}><br>Drove {odometer - prevSelectedRecord.odometer || 0} miles</td>
    <td></td>
</tr>

<tr>
    <td>Cost</td>
    <td><input type="number" min=0 bind:value={cost} placeholder={prevSelectedRecord.cost}></td>
    <!-- <td>{cost}</td> -->
</tr>

<tr>
    <td>Notes</td>
    <td><input type="text" bind:value={notes} placeholder={prevSelectedRecord.notes}></td>
</tr>

<tr>
    <td>Location</td>
    <td><input style="margin-left:auto;margin-right:auto;" type="checkbox" bind:checked={saveCoords}>&nbsp;&nbsp;&nbsp;&nbsp;{loggedCoords}</td>
</tr>

</tbody></table>

<p style="text-align:center;"><button type="submit" onclick={createRecord(newRecord)}>Submit</button></p>

{#if recordSubmitted}

<p style="text-align:center;">Record submitted!</p>

{/if}

</form>

<h2><a href="{base}/drive/history">Last 30 days</a></h2>

<table style="margin:0px auto;font-family:monospace;font-size:1rem;">
    <thead>
    <tr>
        <th>Vehicle</th>
        <th>Date</th>
        <th>Odometer</th>
        <th>Cost</th>
        <th>Notes</th>
    </tr></thead>
    <tbody>
    {#each records as record}
        <tr>
            <td style="text-align:center;">{record.vehicle}</td>
            <td style="text-align:center;">{new Date(record.date).toLocaleDateString()}</td>
            <td style="text-align:right;">{record.odometer.toLocaleString()}</td>
            <td style="text-align:right;">${record.cost.toLocaleString()}</td>
            <td>{record.notes}</td>
        </tr>
    {/each}
    </tbody>
</table>

{:catch}

<p>{error}</p>
    
{/await}

{/if}

<style>

button {
    font-size:1.2em;
    width: 6em;
}

input {
    font-size:1.2em;
}

form {
    margin:0px auto;
}

td {
    padding:0.2em;
}


</style>