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
let entries = $state(null);
let initialEntries;
let changes = false;
let i = $state(null);
let j = $state(null);
let k = $state(null);

let test = [
    {
        "note": "Announcements",
            "sub": [{
                "note": "May 3 after service - Deacon Installation",
                "sub": [{
                    "note": "Compassion",
                }]
            }],
    },
    {
        "note": "Church on Mission: Agents of Renewal",
            "sub": [{
                "note": "Text: Matthew 9:35-11:1",
                }]

    },
    {
        "note": "Big Idea: If you are a follower of Jesus, you are one of his agents of renewal."
    }]

function testUpdate (test) {
    let entries1 = {
        entries: test
    }
    pb.collection("daily").update("91yy283i0vccojv", entries1)
}

// testUpdate(test)

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
    console.log(entries)
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

// function addNote (array, index) {
//     array.splice(index + 1, 0, {
//         note: "",
//         sub: []
//     })
//     // array.push({
//     //     note: "",
//     //     sub: []
//     // })
//     array = array
// }

// addNote(entries)

// function deleteNote (array, index) {
//     array.splice(index, 1)
//     array = array
// }

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

function testing (i,j,k) {
    console.log(i,j,k)
}

function addNote (i,j,k) {
    if (event.key === "Enter") {
        if (k !== null) {
            entries[i].sub[j].sub.splice(k + 1, 0, {
                note: "",
                sub: []
            })
        } else if (j !== null) {
            entries[i].sub.splice(j + 1, 0, {
                note: "",
                sub: []
            })
        } else if (i !== null) {
            entries.splice(i + 1, 0, {
                note: "",
                sub: []
            })
        }
    }
}

</script>


<!-- {#await getDailies()} -->

{#if !entries}

<p>Getting dailies...</p>

{/if}

<p>
{#each dailies as daily, i}
        {#if new Date(daily.date).toLocaleDateString() === selectedDate}
            <button style="font-weight:bold;" onclick={() => changeDate(i)}>{new Date(daily.date).toLocaleDateString()}</button>&nbsp;
        {:else}
            <button style="font-size:1.2em;" onclick={() => changeDate(i)}>{new Date(daily.date).toLocaleDateString()}</button>&nbsp;
        {/if}

{/each}
</p>

<!-- <div style="height:75vh;display:flex;align-items:flex-end;overflow:auto;flex-direction:column-reverse;"> -->
<!-- <div style="height:300px;position:relative;overflow:auto;"> -->


<!-- {:then dailies}  -->

<!-- {#each dailies[0].entries } -->

<div style="width:100%;overflow-y:auto;margin-top:auto;">

<table>

<thead></thead>

<tbody>


{#each entries as note, i}

<tr>

<td contenteditable 
    style="font-family:sans-serif;width:90%;field-sizing:content;resize:none;border-bottom:1px solid gray;background:#f8f9fa" 
    bind:textContent={note.note} 
    onfocus={() => testing(i,j,k)}
    onkeypress={() => addNote(i,j,k)}></td>
<td>
<button onclick={() => deleteNote(entries, i)}>-</button>
<button onclick={() => addNote(entries, i)}>+</button>
<button onclick={() => addNote(note.sub, i)}>></button>
</td>

</tr>

{#each note.sub as sub, j}

<tr>


<td contenteditable 
    style="padding-left:1em;font-family:sans-serif;width:90%;field-sizing:content;resize:none;border-bottom:1px solid gray;background:#e9ecef;" 
    bind:textContent={sub.note} 
    onfocus={() => testing(i,j,k)}
    onkeypress={() => addNote(i,j,k)}></td>
<td>
<button onclick={() => deleteNote(note.sub, j)}>-</button>
<button onclick={() => addNote(note.sub, j)}>+</button>
<button onclick={() => addNote(sub.sub, j)}>></button>
</td>

</tr>

{#each sub.sub as subsub, k}

<tr>


<td contenteditable 
    style="padding-left:2em;margin-left:5em;font-family:sans-serif;width:90%;field-sizing:content;resize:none;border-bottom:1px solid gray;background:#dee2e6;" 
    bind:textContent={subsub.note} 
    onfocus={() => testing(i,j,k)}
    onkeypress={() => addNote(i,j,k)}></td>
<td>
<button onclick={() => deleteNote(sub.sub, k)}>-</button>
<button onclick={() => addNote(sub.sub, k)}>+</button>
</td>

</tr>

{/each}

{/each}

{/each}

</tbody>
</table>

    <!-- <div style="position:sticky;width:100%;bottom:0;left:0;overflow:auto;">
{#each entries as entry, index}
    {#if index === entries.length - 1}
        <button style="font-family:sans-serif;" onclick={() => deleteEntry(index)}>x</button><span contenteditable style="font-family:sans-serif;width:90%;field-sizing:content;resize:none;display:block;" type="text" bind:textContent={entry}></span><br>
    {:else}
        <button style="font-family:sans-serif;" onclick={() => deleteEntry(index)}>x</button><span contenteditable style="font-family:sans-serif;width:90%;field-sizing:content;resize:none;display:block;" type="text" bind:textContent={entry}></span><br>
    {/if}

{/each}
</div>

</div>

<div style="text-align:center;">

<br>
<button style="font-size:1.2em;" onclick={() => addEntry()}>ADD</button> -->

<div style="text-align:center;">

<button onclick={() => deleteNote(entries, i)}>-</button>
<button onclick={() => addNote(i,j,k)}>+</button>
<button onclick={() => addNote(note.sub, i)}>></button>

<button style="font-size:1.2em;" onclick={save}>SAVE</button>
</div>
</div>
<!-- </div> -->
    
<!-- {/await} -->

<!-- {#if !authData}

<div style="text-align: center;">
    <input type="password" bind:textContent={password}>
    <button onclick={login}>LOGIN</button>
</div>

{/if} -->

{#if authData}

<p>Testing!</p>

{/if}

{#if error}

<p>{error}</p>

{/if}