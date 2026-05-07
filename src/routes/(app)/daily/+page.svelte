<svelte:head>
    <title>Daily</title> 
</svelte:head>

<script>

import PocketBase from 'pocketbase';
import { onMount, onDestroy, tick } from 'svelte';

const pb = new PocketBase('https://db.aarosmit.com');

let notes = $state(null);
let error = $state(null);
let tzOffset = new Date().getTimezoneOffset() * 60 * 1000;
let today = new Date()
let todayString = new Date((today * 1 - tzOffset)).toISOString().split("T")[0]
let selectedDateArray = $state(today.toString().split(' '))
let selectedDate = $state(todayString)

console.log(selectedDateArray)

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
        notes.splice(i + 1, 0, {
            "date": selectedDate,
            "index": newIndex,
            "indent": notes[i].indent,
            "note": "",
            "saved": "no"
        })
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
        let divs = Array.from(document.querySelectorAll('div'));
        let currentIndex = divs.indexOf(document.activeElement);
        await tick()
        let nextElement = divs[currentIndex + 1];
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
    if (event.key === "Backspace" && notes[i].note === "") {
        let divs = Array.from(document.querySelectorAll('div'));
        let currentIndex = divs.indexOf(document.activeElement);
        notes.splice(i, 1)
        notes = notes
        if (id) {
            pb.collection('notes').delete(id)
        }
        await tick()
        let prevElement = divs[currentIndex - 1];
        if (prevElement) prevElement.focus();
    }
}

function checkIndex (array, ind) {
    if (ind < 0 || ind >= notes.length) {
        return null
    } else {
        return notes[ind].index
    }
}

function nextDay () {
    let nextDay = new Date(new Date(selectedDate) * 1 + tzOffset + 24 * 60 * 60 * 1000)
    selectedDate = nextDay.toISOString().split("T")[0]
    getNotes()
}

function prevDay () {
    let prevDay = new Date(new Date(selectedDate) * 1 + tzOffset - 24 * 60 * 60 * 1000)
    selectedDate = prevDay.toISOString().split("T")[0]
    getNotes()
}

</script>

{#if notes}

<div style="text-align:center;font-weight:bold;">
    <p>
        <button onclick={() => prevDay()}>PREV</button>
        {selectedDateArray[0]}, {selectedDateArray[1]} {selectedDateArray[2]} {selectedDateArray[3]}
        <button onclick={() => nextDay()}>NEXT</button>
    </p>
    <input type="date" style="font-family:sans-serif;font-weight:bold;font-size:1em;" bind:value={selectedDate} onchange={() => getNotes()}>
</div>

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