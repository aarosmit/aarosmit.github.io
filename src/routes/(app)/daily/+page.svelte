<svelte:head>
    <title>Daily</title> 
</svelte:head>

<script>

import PocketBase from 'pocketbase';
import { onMount, onDestroy } from 'svelte';

const pb = new PocketBase('https://db.aarosmit.com');

let dailies;
let authData;
let password;
let error;
let today = new Date().toLocaleDateString();
let selectedDate = today;
let selectedID;
$: entries = null;
let initialEntries;
let changes = false;


// async function login () {
//     try {
//         authData = await pb.collection("users").authWithPassword('aaron', password);
//         error = null;
//     } catch (err) {
//         error = err.message
//         console.log(err.message)
//     }
// }

onMount(async () => {
    dailies = await getDailies()

    pb.collection('daily').subscribe('*', async (e) => {
        dailies = await getDailies()
    })

    if (new Date(dailies[0].date).toLocaleDateString() === today) {
        console.log("today exists")
    } else {
        pb.collection('daily').create({
            date: new Date(),
            entries: [""]
        })
    }

    entries = dailies[0].entries
    selectedID = dailies[0].id
})

onDestroy(() => {
    pb.collection('daily').unsubscribe('*');
})

function getDailies () {
    try {
        return pb.collection('daily').getFullList({
            sort:'-date',
        })

    } catch (err) {
        error = err.message
        console.log(err.message)
    }
}

async function save () {
    let update = {
        entries: entries
    }
    await pb.collection('daily').update(selectedID, update)
}

function addEntry () {
    // entries = [...entries, ""]
    entries.push("")
    entries = entries
}

function deleteEntry (index) {
    entries.splice(index, 1)
    entries = entries
}

function changeDate (date) {
    selectedID = dailies[date].id
    selectedDate = new Date(dailies[date].date).toLocaleDateString()
    entries = dailies[date].entries
}

// function handleEnterKey(event) {
//     if (event.key === 'Enter') {
//         addEntry()
//     }
// }



</script>


<!-- {#await getDailies()} -->

{#if !entries}

<p>Getting dailies...</p>

{/if}

<p>
{#each dailies as daily, i}
        {#if new Date(daily.date).toLocaleDateString() === selectedDate}
            <button style="font-weight:bold;font-size:1.2em;" on:click={() => changeDate(i)}>{new Date(daily.date).toLocaleDateString()}</button>&nbsp;
        {:else}
            <button style="font-size:1.2em;" on:click={() => changeDate(i)}>{new Date(daily.date).toLocaleDateString()}</button>&nbsp;
        {/if}

{/each}
</p>

<div style="height:75vh;display:flex;align-items:flex-end;overflow:auto;flex-direction:column-reverse;">
<!-- <div style="height:300px;position:relative;overflow:auto;"> -->


<!-- {:then dailies}  -->

<!-- {#each dailies[0].entries } -->

<div style="width:100%;overflow-y:auto;margin-top:auto;">
<!-- <div style="position:sticky;width:100%;bottom:0;left:0;overflow:auto;"> -->
{#each entries as entry, index}
    {#if index === entries.length - 1}
        <button style="font-family:sans-serif;font-size:1.2em;" on:click={() => deleteEntry(index)}>x</button><textarea style="font-family:sans-serif;font-size:1.2em;width:90%;field-sizing:content;border-left:none;border-top:none;border-right:none;resize:none;" type="text" bind:value={entry}></textarea><br>
    {:else}
        <button style="font-family:sans-serif;font-size:1.2em;" on:click={() => deleteEntry(index)}>x</button><textarea style="font-family:sans-serif;font-size:1.2em;width:90%;field-sizing:content;border-left:none;border-top:none;border-right:none;resize:none;" type="text" bind:value={entry}></textarea><br>
    {/if}

{/each}
</div>

</div>

<div style="text-align:center;">
<br>
<button style="font-size:1.2em;" on:click={() => addEntry()}>ADD</button>
<button style="font-size:1.2em;" on:click={save}>SAVE</button>
</div>
    
<!-- {/await} -->

<!-- {#if !authData}

<div style="text-align: center;">
    <input type="password" bind:value={password}>
    <button on:click={login}>LOGIN</button>
</div>

{/if} -->

{#if authData}

<p>Testing!</p>

{/if}

{#if error}

<p>{error}</p>

{/if}