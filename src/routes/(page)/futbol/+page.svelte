<svelte:head>
    <title>Drive</title> 
</svelte:head>

<svelte:options runes={false} />

<script>

import { page } from '$app/state';
import { base } from '$app/paths';
import { onMount } from 'svelte';
import { closestMatch } from 'closest-match';
import Fuse from 'fuse.js';

import PocketBase from 'pocketbase';
const pb = new PocketBase('https://db.aarosmit.com');

const currentDate = new Date().toLocaleDateString('en-CA').replace(/-/g, '');

let selectedDate;
let queryDate;

let fuse;

async function queryNewDate () {
    queryDate = selectedDate.replace(/-/g, '');
    fixtures = await getESPNFixtures(queryDate);

    for (let i = 0; i < fixtures.length; i++) {
        fixtures[i].homeMatch = fuse.search(fixtures[i].homeTeam)[0]
        fixtures[i].awayMatch = fuse.search(fixtures[i].awayTeam)[0]
        fixtures[i].matchGrade = Math.round((fixtures[i].homeMatch.item.points + fixtures[i].awayMatch.item.points) / (maxPoints * 2) * 100)
    }
}

$: console.log(selectedDate, queryDate)

let clubs;
let clubsArray = [0];

let maxPoints;

let fixtures;

onMount(async () => {

    clubs = await pb.collection('futbol').getFullList({
        sort: 'rank'
    })
    // console.log(clubs)

    maxPoints = clubs[0].points

    fixtures = await getESPNFixtures(currentDate);
    fuse = new Fuse(clubs, {
        keys: ['club'],
        includeScore: true
    })
    for (let i = 0; i < fixtures.length; i++) {
        fixtures[i].homeMatch = fuse.search(fixtures[i].homeTeam)[0]
        fixtures[i].awayMatch = fuse.search(fixtures[i].awayTeam)[0]
        fixtures[i].matchGrade = Math.round((fixtures[i].homeMatch.item.points + fixtures[i].awayMatch.item.points) / (maxPoints * 2) * 100)
    }
})


async function getESPNFixtures (date) {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard?dates=${date}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
    
        // Parse fixtures/events
        const fixtures = data.events.map(event => {
        const competition = event.season?.slug || event.league?.name || 'Soccer';
        const competitionName = event.competitions[0];
        const status = competitionName.status.type.shortDetail;
        
        const homeTeam = competitionName.competitors.find(c => c.homeAway === 'home');
        const awayTeam = competitionName.competitors.find(c => c.homeAway === 'away');

        return {
            id: event.id,
            date: event.date,
            league: event.season?.slug?.replace(/-/g, ' '),
            homeTeam: homeTeam?.team?.displayName,
            // homeScore: homeTeam?.score || '0',
            awayTeam: awayTeam?.team?.displayName,
            // awayScore: awayTeam?.score || '0',
            status: status, // e.g. "FT", "7:00 PM", "HT"
        };
        });

        return fixtures;

    } catch (error) {
        console.error('Failed to fetch fixtures:', error);
    }
}

// let fixtures = getESPNFixtures(dateString)

// console.log(getESPNFixtures(dateString))

// getESPNFixtures(dateString).then(fixtures => {
//     console.log(JSON.stringify(fixtures, null, 2));
// });

</script>

<!-- <input type="date" bind:value={selectedDate}> -->

<h1>Today's matches</h1>

<table style="margin:0px auto;font-size:1rem;">
    <thead>
    <tr>
        <th>Home</th>
        <th>Away</th>
        <th>Time</th>
        <th>Grade</th>
    </tr>
    </thead>
    <tbody>
    {#each fixtures as fixture}
        {#if !fixture.league.includes("ncaa")}
        {#if fixture.homeMatch.score < 0.25}
        {#if fixture.awayMatch.score < 0.25}
        {#if fixture.matchGrade > 75}
            <tr style="background-color:#ffec70;border-spacing:0px;">
                <td>{fixture.homeTeam} ({fixture.homeMatch.item.rank})</td>
                <td>{fixture.awayTeam} ({fixture.awayMatch.item.rank})</td>

                <td style="text-align:center;">{new Date(fixture.date).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                    })}
                </td>
                <td style="text-align:center;">{fixture.matchGrade}</td>
            </tr>
        {:else}
            <tr>
                <td>{fixture.homeTeam} ({fixture.homeMatch.item.rank})</td>
                <td>{fixture.awayTeam} ({fixture.awayMatch.item.rank})</td>

                <td style="text-align:center;">{new Date(fixture.date).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                    })}
                </td>
                <td style="text-align:center;">{fixture.matchGrade}</td>
            </tr>
        {/if}
        {/if}
        {/if}
        {/if}
    {/each}
    </tbody>
</table>