<svelte:head>
    <title>Drive</title> 
</svelte:head>

<svelte:options runes={false} />

<script>

import { page } from '$app/state';
import { base } from '$app/paths';
import { onMount } from 'svelte';

import PocketBase from 'pocketbase';
const pb = new PocketBase('https://db.aarosmit.com');

let fixtures;

onMount(async () => {

    fixtures = await pb.collection('futbolMatches').getFullList({
        sort: 'datetime'
    })

    for (let i = 0; i < fixtures.length; i++) {
        if (fixtures[i].grade > 74) {
            fixtures[i].background = "#ffec70"
        }
        if (new Date(fixtures[i].datetime) * 1 < new Date() * 1) {
            fixtures[i].background = "#d9d9d9"
        }
        if (fixtures[i].grade === 0) {
            fixtures[i].grade = ""
        }
        fixtures[i].time = new Date(fixtures[i].datetime).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit'
        });

    }

    console.log(fixtures)


})


</script>

<h1>Today</h1>
    
<table>
    <thead>
    <tr>
        <th>Home</th>
        <th>Away</th>
        <th>League</th>
        <th>Time</th>
        <th>Grade</th>
    </tr>
    </thead>
    <tbody>
    {#each fixtures as fixture}
        {#if fixture.day === "today"}
            <tr style="background-color:{fixture.background};">
                <td>{fixture.homeTeam}</td>
                <td>{fixture.awayTeam}</td>
                <td>{fixture.league}</td>
                <td style="text-align:center;">{fixture.time}</td>
                <td style="text-align:center;">{fixture.grade}</td>
            </tr>
        {/if}
    {/each}
    </tbody>
</table>

<h1>Tomorrow</h1>

<table>
    <thead>
    <tr>
        <th>Home</th>
        <th>Away</th>
        <th>League</th>
        <th>Time</th>
        <th>Grade</th>
    </tr>
    </thead>
    <tbody>
    {#each fixtures as fixture}
        {#if fixture.day === "tomorrow"}
            <tr style="background-color:{fixture.background};">
                <td>{fixture.homeTeam}</td>
                <td>{fixture.awayTeam}</td>
                <td>{fixture.league}</td>
                <td style="text-align:center;">{fixture.time}</td>
                <td style="text-align:center;">{fixture.grade}</td>
            </tr>
        {/if}
    {/each}
    </tbody>
</table>

<h1>The Day After Tomorrow</h1>

<table>
    <thead>
    <tr>
        <th>Home</th>
        <th>Away</th>
        <th>League</th>
        <th>Time</th>
        <th>Grade</th>
    </tr>
    </thead>
    <tbody>
    {#each fixtures as fixture}
        {#if fixture.day === "theDayAfterTomorrow"}
            <tr style="background-color:{fixture.background};">
                <td>{fixture.homeTeam}</td>
                <td>{fixture.awayTeam}</td>
                <td>{fixture.league}</td>
                <td style="text-align:center;">{fixture.time}</td>
                <td style="text-align:center;">{fixture.grade}</td>
            </tr>
        {/if}
    {/each}
    </tbody>
</table>


<style>

table {
    margin:0px auto;
    font-size:1rem;
    border-collapse:collapse;
}

th, td {
    padding-left: 0.5em;
    padding-right: 0.5em;
}

</style>