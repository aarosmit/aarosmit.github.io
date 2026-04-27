<svelte:head>
    <title>Racko</title> 
</svelte:head>

<svelte:options runes={false} />

<script>

import { page } from '$app/state';

import PocketBase from 'pocketbase';
const pb = new PocketBase('https://db.aarosmit.com');

let records;
let games;
let timeFirstHand;
let dateFirstHand;
let numberInARowArray = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
let array = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
let bestLatestHand;

async function getRecords () {
    records = await pb.collection('racko').getFullList({
        sort: '-created',
    });
    timeFirstHand = new Date(records[records.length - 1].created).toLocaleTimeString()
    dateFirstHand = new Date(records[records.length - 1].created).toLocaleDateString()
    console.log(records, timeFirstHand)
    for (let i = 0; i < records.length; i++) {
        array[records[i].numberInARow]++;
    }
    for (let i = 15; i > -1; i--) {
        if (array[i] > 0) {
            for (let j = 0; j < records.length; j++) {
                if (i === records[j].numberInARow) {
                    bestLatestHand = records[j]
                    console.log(bestLatestHand)
                    break;
                }
            }
            break;
        }

    }

    return records;
}

</script>

<h1>Dealing Racko</h1>

{#await getRecords()}
    <p style="text-align: center;">Getting data...</p>
{:then records} 

<p>I have dealt {records.length} hands of Racko. I started dealing Racko hands on {dateFirstHand} at {timeFirstHand}.</p>

<p>I dealt the latest best hand so far at {new Date(bestLatestHand.created).toLocaleTimeString()} on {new Date(bestLatestHand.created).toLocaleDateString()}.</p>

<table style="font-family: monospace;text-align: center;margin-left: auto;margin-right: auto;font-size: 0.9rem;width:50%;">
    <thead>
        <tr>
            {#each numberInARowArray as num}
                <th>{num}</th>
            {/each}
        </tr>
    </thead>
    <tbody>
        <tr>
            {#each array as times}
                <td>{times}</td>
            {/each}
        </tr>
    </tbody>
</table>

<svg width="100%" height="60vh">
    {#each bestLatestHand.rack.reverse() as card, i}
        <text style="font-weight:bold;" x="{card / 1.5 + 30}%" y="{i * 5 + 10}%" fill="black">| {card} |</text>
    {/each}
</svg>
    
{/await}