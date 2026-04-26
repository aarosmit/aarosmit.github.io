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
let numberInARowArray = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
let array = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

async function getRecords () {
    records = await pb.collection('racko').getFullList({
        sort: 'created',
    });
    timeFirstHand = new Date(records[0].created).toLocaleTimeString()
    dateFirstHand = new Date(records[0].created).toLocaleDateString()
    console.log(records, timeFirstHand)
    for (let i = 0; i < records.length; i++) {
        array[records[i].numberInARow]++;
    }
    console.log(array)
    return records;
}

</script>

<h1>Dealing Racko</h1>

{#await getRecords()}
    <p style="text-align: center;">Getting data...</p>
{:then records} 

<p>I have dealt {records.length} hands of Racko. I started dealing Racko hands on {dateFirstHand} at {timeFirstHand}.</p>

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
    
{/await}