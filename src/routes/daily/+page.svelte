<svelte:head>
    <title>Todo</title> 
</svelte:head>

<script>
  import { add } from 'layerchart';


import PocketBase from 'pocketbase';
  import { onMount } from 'svelte';

const pb = new PocketBase('https://db.aarosmit.com');

let dailies;
let authData;
let password;
let error;
$: entries = null;

// async function login () {
//     try {
//         authData = await pb.collection("users").authWithPassword('aaron', password);
//         error = null;
//     } catch (err) {
//         error = err.message
//         console.log(err.message)
//     }
// }

// onMount(() => {
//     pb.collection('daily').subscribe("*", function (e) {
//         console.log(e.action);
//         console.log(e.record);
//     })
// })

async function getDailies () {
    dailies = await pb.collection('daily').getFullList({
        sort:'-date',
    })
    console.log(dailies)
    entries = dailies[0].entries

    return dailies
}

async function save () {
    let update = {
        entries: entries
    }
    await pb.collection('daily').update(dailies[0].id, update)
}

function addEntry () {
    entries = [...entries, ""]
}
// getDailies();

function deleteEntry (index) {
    entries.splice(index, 1)
    entries = entries
}





</script>


{#await getDailies()}

<p>Getting dailies...</p>

{:then dailies} 

<!-- {#each dailies[0].entries } -->

<div>
{#each entries as entry, index}
    <button on:click={() => deleteEntry(index)}>-</button><input style="width:100%;" type="text" bind:value={entry}><br>
{/each}
</div>

<button on:click={addEntry}>ADD</button>
<button on:click={save}>SAVE</button>




<h2>Dailies</h2>
<ul>
{#each dailies as daily}
    <li>{new Date(daily.date).toLocaleDateString()}</li>
{/each}
</ul>
    
{/await}

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