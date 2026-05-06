<svelte:head>
    <title>Daily</title> 
</svelte:head>

<script>

import PocketBase from 'pocketbase';
import { onMount, onDestroy, tick } from 'svelte';

const pb = new PocketBase('https://db.aarosmit.com');

let notes = $state(null);
let error = $state(null);
let today = new Date().toISOString().split("T")[0]
let selectedDate = $state(today)

let dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// $inspect(notes)

onMount(async () => {
    await getNotes()

    pb.collection('daily').subscribe('*', async (e) => {
        await getNotes()
    })
    


})

async function getNotes () {
    // console.log(selectedDate)
    try {
        notes = await pb.collection('notes').getFullList({
            sort:'index',
            filter:`date="${selectedDate}"`
        })

    } catch (err) {
        error = err.message
        console.log(err.message)
    }

    if (notes.length === 0) {
        notes = [...notes, {
            "date": selectedDate,
            "index": 0,
            "indent": 0,
            "note": "",
            "saved": "no"
        }]
    }
}

// async function save () {
//     let update = {
//         note: entries
//     }
//     await pb.collection('notes').update(selectedID, update)
// }

async function handleKeyPress (curIndex, nextIndex, indent, id, i) {
    if (event.key === "Enter") {
        event.preventDefault()
        let newIndex = 0
        if (nextIndex) {
            newIndex = (curIndex + nextIndex) / 2
        } else {
            newIndex = curIndex + 256
        }
        if (id) {
            pb.collection('notes').update(id, {
                "note": notes[i].note,
                "indent": notes[i].indent
            })
            notes[i].saved = "yes"
        } else {
            pb.collection('notes').create({
                "date": selectedDate,
                "index": newIndex,
                "indent": notes[i].indent,
                "note": notes[i].note
            })
            notes[i].saved = "yes"
        }
        notes.splice(i + 1, 0, {
            "date": selectedDate,
            "index": newIndex,
            "indent": notes[i].indent,
            "note": "",
            "saved": "no"
        })
        await tick()
        const inputs = Array.from(document.querySelectorAll('div'));
        const currentIndex = inputs.indexOf(document.activeElement);
        const nextElement = inputs[currentIndex + 1];
        if (nextElement) nextElement.focus();

    }
    if (event.key === "ArrowRight") {
        event.preventDefault()
        if(notes[i].indent < 10) {
            notes[i].indent = notes[i].indent + 1
        }
        // console.log(indent)
    }
    if (event.key === "ArrowLeft") {
        event.preventDefault()
        if(notes[i].indent >= 1) {
            notes[i].indent = notes[i].indent - 1
        }
        // console.log(indent)
    }
}

function checkIndex (array, ind) {
    if (ind < 0 || ind >= notes.length) {
        return null
    } else {
        return notes[ind].index
    }
}

</script>

{#if notes}

<p style="text-align:right;font-weight:bold;">
    {dayNames[new Date(selectedDate).getDay()]},
    <input type="date" style="font-family:sans-serif;font-weight:bold;font-size:1em;" bind:value={selectedDate} onchange={() => getNotes()}>
</p>

<form>

{#each notes as note, i}

{#if note.saved === "no"}

<div contenteditable 
    style="width:{97 - note.indent * 5}%;min-height:1.5em;display:flex;align-items:flex-end;border-top:none;border-left:none;border-right:none;border-bottom:1px solid #C0C0C0;overflow-wrap:break-word;margin-left:{note.indent * 5}%;background:#FFFDD0;padding-left:0.25em;padding-right:0.25em;"
    role="textbox"
    onkeydown={() => handleKeyPress(note.index, checkIndex(notes, i + 1), note.indent, note.id, i)}
    bind:textContent={note.note}
    >
</div>

{:else}

<div contenteditable 
    style="width:{97 - note.indent * 5}%;min-height:1.5em;display:flex;align-items:flex-end;border-top:none;border-left:none;border-right:none;border-bottom:1px solid #C0C0C0;overflow-wrap:break-word;margin-left:{note.indent * 5}%;padding-left:0.25em;padding-right:0.25em;"
    role="textbox"
    onkeydown={() => handleKeyPress(note.index, checkIndex(notes, i + 1), note.indent, note.id, i)}
    bind:textContent={note.note}
    >
</div>

{/if}

{/each}

</form>

{:else}

{#if !error}

<p>Getting notes...</p>

{:else}

<p>{error}</p>

{/if}

{/if}