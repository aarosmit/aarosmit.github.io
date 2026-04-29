<svelte:head>
    <title>Drive</title> 
</svelte:head>

<svelte:options runes={false} />

<script>

import { page } from '$app/state';

import Geolocation from "svelte-geolocation";
import PocketBase from 'pocketbase';
const pb = new PocketBase('https://db.aarosmit.com');


async function importData () {
   const response = await fetch('/src/lib/assets/fuel_4Runner_all.json')
   const data = await response.json();
   console.log(data)
   let newRecord;
   let makeRecord;

//    for (let i=0; i < data.length; i++) {
//        console.log(data[i])
//        if (data[i].vehicle === "Cross" || data[i].vehicle === "Fit") {
//            newRecord = {
//                vehicle: data[i].vehicle,
//                date: new Date(data[i].date),
//                odometer: data[i].distance,
//                cost: data[i].cost,
//                notes: data[i].notes
//            }
//            console.log(newRecord)
//            makeRecord = await pb.collection('vehicles').create(newRecord)
//        }
//     }
}

// importData()












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

$: console.log(saveCoords, loggedCoords)

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
    records = await pb.collection('vehicles').getFullList({
        sort: '-created',
        filter: `date >= "${oneMonthAgo}"`
    });
    for (let i = 0; i < records.length; i++) {
        if (records[i].vehicle === "Cross") {
            prevCrossRecord = records[i]
            break
        }
    }
    for (let i = 0; i < records.length; i++) {
        if (records[i].vehicle === "Fit") {
            prevFitRecord = records[i]
            break
        }
    }

    // console.log(records)
    // console.log(prevCrossRecord, prevFitRecord)
    return records
}

// $: console.log(prevSelectedRecord)

</script>

<Geolocation getPosition bind:coords />

<h1>Driving</h1>

{#await getRecords()}

<p>Getting data</p>
    
{:then records} 

<form style="height:100vh;">

<table style="margin:0px auto;">
<tbody>

<tr>
    {#if selectedVehicle === "Cross"}
    <td style="text-align:center;">
        <button on:click={() => selectedVehicle = "Cross"}><b>Cross</b></button>
    </td>
    <td style="text-align:center;">
        <button on:click={() => selectedVehicle = "Fit"}>Fit</button>
    </td>
    {:else}
    <td style="text-align:center;">
        <button on:click={() => selectedVehicle = "Cross"}>Cross</button>
        </td>
    <td style="text-align:center;">
        <button on:click={() => selectedVehicle = "Fit"}><b>Fit</b></button>
    </td>
    {/if}
</tr>

<tr>
    <td>Date</td>
    <td><input type="date" bind:value={date}></td>
    <td>{date.toLocaleString()}</td>
</tr>

<tr>
    <td>Odometer</td>
    <td><input type="number" bind:value={odometer} min={prevSelectedRecord.odometer} placeholder={prevSelectedRecord.odometer}></td>
    <td>Drove {odometer - prevSelectedRecord.odometer || 0} miles</td>
</tr>

<tr>
    <td>Cost</td>
    <td><input type="number" min=0 bind:value={cost} placeholder={prevSelectedRecord.cost}></td>
    <td>{cost}</td>
</tr>

<tr>
    <td>Notes</td>
    <td><input type="text" bind:value={notes} placeholder={prevSelectedRecord.notes}></td>
    <td>{notes}</td>
</tr>

<tr>
    <td>Location</td>
    <td><input style="text-align=center" type="checkbox" bind:checked={saveCoords}></td>
    <td>{loggedCoords}</td>
</tr>

</tbody></table>

<p style="text-align:center;"><button type="submit" on:click={createRecord(newRecord)}>Submit</button></p>

{#if recordSubmitted}

<p style="text-align:center;">Record submitted!</p>

{/if}

</form>

<h2>Last 30 days</h2>

<table style="margin:0px auto;font-family:monospace;font-size:0.9rem;">
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
        <td style="text-align:right;">$ {record.cost.toLocaleString()}</td>
        <td>{record.notes}</td>
    </tr>
    {/each}
    </tbody>
</table>
    
{/await}

<style>

button {
    font-size:1em;
    width: 6em;
}

input {
    font-size:1em;
}

form {
    margin:0px auto;
}


</style>