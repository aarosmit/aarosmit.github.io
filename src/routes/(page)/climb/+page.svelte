<svelte:head>
    <title>Climb</title> 
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

let coords = [];
let loggedCoords = [];
let saveCoords = true;
let selectedType = "toprope";
let date = new Date();
let grade = ""
$: selectedDate = date;
let recordSubmitted = false;

$: console.log(newRecord)

$: if (saveCoords) {
    loggedCoords = [Math.round(coords[1]* 1000) / 1000, Math.round(coords[0]* 1000) / 1000]
} else {
    loggedCoords = null
}

$: newRecord = {
    datetime: selectedDate,
    type: selectedType,
    coords: loggedCoords,
    grade: returnGrade(grade)
}

function returnGrade (grade) {
    if (selectedType === "Boulder") {
        return "V" + grade
    } else {
        return "5." + grade
    }
}

async function createRecord (record) {
    await pb.collection('climb').create(record);
    recordSubmitted = true;
}

</script>

<Geolocation getPosition bind:coords />

<h1>Log climb</h1>

<table style="margin:0px auto;">
    <tbody>
        <tr>
            <td style="text-align:center;font-weight:bold;"><button onclick={() => selectedType = "Toprope"}>Toprope</button></td>
            <td style="text-align:center;font-weight:bold;"><button onclick={() => selectedType = "Boulder"}>Boulder</button></td>
            <td style="text-align:center;font-weight:bold;"><button onclick={() => selectedType = "Sport"}>Sport</button></td>
        </tr>
        <tr>
            <td colspan="3" style="text-align:center;font-size:1em;"><input style="width:12.5em;" type="date" bind:value={selectedDate}><br>{date.toLocaleString()}</td>
        </tr>
        <tr>
            {#if selectedType === "Boulder"}
                <td style="font-size:2em;text-align:center;font-weight:bold;" colspan="3">V<input style="width:10%;font-weight:bold;" bind:value={grade}></td>
            {:else}
                <td style="font-size:2em;text-align:center;font-weight:bold;" colspan="3">5.<input style="width:10%;font-weight:bold;" bind:value={grade}></td>
            {/if}
        </tr>
        <tr>
            <td colspan="3" style="text-align:center;"><input style="margin-left:auto;margin-right:auto;" type="checkbox" bind:checked={saveCoords}>&nbsp;&nbsp;&nbsp;&nbsp;{loggedCoords}</td>
        </tr>
    </tbody>
</table>

<p style="text-align:center;font-size:1.5em;"><button type="submit" onclick={createRecord(newRecord)}>SUBMIT</button></p>

{#if recordSubmitted}

<p style="text-align:center;">Record submitted!</p>

{/if}