<svelte:head>
    <title>Futbol</title> 
</svelte:head>

<svelte:options runes={false} />

<script>

import { page } from '$app/state';
import { base } from '$app/paths';
import { onMount } from 'svelte';

import PocketBase from 'pocketbase';
const pb = new PocketBase('https://db.aarosmit.com');

$: fixtures = [];
let leagues = [];
let filtered = false;
$: filteredFixtures = []
let search;
let allFixtures;
$: minGrade = 80;

let today = new Date().toDateString()
let tomorrow = new Date(new Date() * 1 + 86400000).toDateString()

console.log(today, tomorrow)

onMount(async () => {

    getFixtures()
    
})

function filterLeague (chosenLeague) {
    if (!filtered) {
        fixtures = fixtures.filter((fixture) => fixture.league === chosenLeague)
        filtered = true
    } else {
        getFixtures()
        filtered = false
    }
    // console.log(fixtures)
}

function calcBackground (grade) {
    if (grade < 80) {
        return ""
    } else {
        let transparency = (grade * grade) / 10000
        return "rgb(255, 236, 112, " + transparency + ")"
    }
}

async function getFixtures () {
    fixtures = await pb.collection('futbolFixtures').getFullList({
        sort: 'datetime'
    })
    allFixtures = fixtures
    // console.log(fixtures)

    for (let i = 0; i < fixtures.length; i++) {
        // console.log(new Date(fixtures[i].datetime).toDateString())

        if (new Date(fixtures[i].datetime).toDateString() === today) {
            fixtures[i].day = today
        } else if (new Date(fixtures[i].datetime).toDateString() === tomorrow) {
            fixtures[i].day = tomorrow
        }

        fixtures[i].ended = false
        if (fixtures[i].matchGrade > 79) {
            fixtures[i].background = "#ffec70"
        }
        if (new Date(fixtures[i].datetime) * 1 + 7200000 < new Date() * 1) {
            fixtures[i].background = "#d9d9d9"
            fixtures[i].ended = true
        }
        if (new Date(fixtures[i].datetime) * 1 < new Date() * 1 && new Date(fixtures[i].datetime) * 1 + 7200000 > new Date() * 1) {
            fixtures[i].style = "bold"
        }
        fixtures[i].time = new Date(fixtures[i].datetime).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit'
        });


        leagues.push(fixtures[i].league)

    }

    leagues = leagues.filter((item, index) => leagues.indexOf(item) === index).sort();

    filterGrade(minGrade)

    console.log(fixtures)

}

function filterTeam (searchTerm) {
    fixtures = allFixtures
    fixtures = fixtures.filter((fixture) => fixture.homeTeam.toLowerCase().includes(searchTerm) || fixture.awayTeam.toLowerCase().includes(searchTerm))
    // console.log(fixtures)
}

function filterGrade (grade) {
    fixtures = allFixtures
    fixtures = fixtures.filter((fixture) => fixture.matchGrade >= grade)
}

function parseDay (modifier) {
    let day = new Date(new Date() * 1 + (modifier * 86400000)).getDay()
    switch (day) {
        case 0:
            return "Sun"
            break
        case 1:
            return "Mon"
            break
        case 2:
            return "Tue"
            break
        case 3:
            return "Wed"
            break
        case 4:
            return "Thu"
            break
        case 5:
            return "Fri"
            break
        case 6:
            return "Sat"
            break
    }
}

function reset () {
    fixtures = allFixtures
    search = ""
    minGrade = 80
    filterGrade(minGrade)
}

</script>

<div style="text-align:center;position: fixed; bottom: 70px; right: 30px; z-index: 1000;display: flex;align-items: center;">
    <input type="range" step="5" min="0" max="100" bind:value={minGrade} oninput={() => filterGrade(minGrade)}>
    <input type="button" value={minGrade}>
</div>

<div style="text-align:center;position: fixed; bottom: 30px; right: 30px; z-index: 1000;">
    <input oninput={() => filterTeam(search)} bind:value={search} placeholder="Search team">
    <input type="submit" value="Reset" onclick={() => reset()}>
</div>

<!-- <div style="position: fixed; bottom: 20px; right: 20px; z-index: 1000; background: white; padding: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
  I am a floating widget!
</div> -->

<h2>Today ({parseDay(0)}, {new Date(new Date() * 1).toLocaleDateString()})</h2>
    
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
        {#if fixture.day === today && !fixture.ended}
            <tr style="background-color:{calcBackground(fixture.matchGrade)};font-weight:{fixture.style};">
                <td>{fixture.homeTeam} ({Math.round(fixture.homeRating)})</td>
                <td>{fixture.awayTeam} ({Math.round(fixture.awayRating)})</td>
                <td><a style="color:#2246D9;font-weight:normal;text-decoration:underline;" onclick={() => filterLeague(fixture.league)}>{fixture.league}</a></td>
                <td style="text-align:center;">{fixture.time}</td>
                <td style="text-align:center;">{fixture.matchGrade} ({Math.round(fixture.homeRating) - Math.round(fixture.awayRating)})</td>
            </tr>
        {/if}
    {/each}
    </tbody>
</table>

<h2>Tomorrow ({parseDay(1)}, {new Date(new Date() * 1 + 86400000).toLocaleDateString()})</h2>

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
        {#if fixture.day === tomorrow && !fixture.ended}
            <tr style="background-color:{calcBackground(fixture.matchGrade)};font-weight:{fixture.style};">
                <td>{fixture.homeTeam} ({Math.round(fixture.homeRating)})</td>
                <td>{fixture.awayTeam} ({Math.round(fixture.awayRating)})</td>
                <td><a style="color:#2246D9;font-weight:normal;text-decoration:underline;" onclick={() => filterLeague(fixture.league)}>{fixture.league}</a></td>
                <td style="text-align:center;">{fixture.time}</td>
                <td style="text-align:center;">{fixture.matchGrade} ({Math.round(fixture.homeRating) - Math.round(fixture.awayRating)})</td>
            </tr>
        {/if}
    {/each}
    </tbody>
</table>

<h2>Data sources</h2>
<ol>
    <li>Team power rankings from <a href="https://globalfootballrankings.com/rankings/teams/men">Global Football Rankings</a>.</li>
    <li>Match data from <a href="https://www.api-football.com/">API-FOOTBALL</a>.</li>
</ol>

<br>

<style>

table {
    margin:0px auto;
    font-size:0.8rem;
    border-collapse:collapse;
}

tr {
    max-width: 50rem;

}

th, td {
    padding-left: 0.5em;
    padding-right: 0.5em;
}

input {
    padding: 0.25em;
    padding-left: 0.5em;
    padding-right: 0.5em;
    background-color:#e9e9ed;
}

a {
    color: #2246D9;
}

</style>