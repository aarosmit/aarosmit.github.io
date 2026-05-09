<svelte:head>
    <title>Daily</title> 
</svelte:head>

<script>

import PocketBase from 'pocketbase';
import { onMount, onDestroy, tick } from 'svelte';
import DailySearch from '$lib/components/dailySearch.svelte';

const pb = new PocketBase('https://db.aarosmit.com');

let notes = $state(null);
let error = $state(null);
let tzOffset = new Date().getTimezoneOffset() * 60 * 1000;
let today = new Date()
let todayString = new Date((today * 1 - tzOffset)).toISOString().split("T")[0]
let selectedDateArray = $state(today.toString().split(' '))
let selectedDate = $state(todayString)
let prevIndex = 1;

let password = $state(null);
let authData = $state(null);

async function login () {
    try {
        authData = await pb.collection("users").authWithPassword('aaron', password);
        error = null;
    } catch (err) {
        error = err.message
        console.log(err.message)
    }

    console.log(authData)

    // console.log(pb.authStore.isValid);
    // console.log(pb.authStore.token);
    // console.log(pb.authStore.record.id);
}

// console.log(selectedDateArray)

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
            newIndex = curIndex + 1000
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
                "index": curIndex,
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
        // await tick()
        let divs = Array.from(document.querySelectorAll('div'));
        let currentIndex = divs.indexOf(document.activeElement);
        console.log(divs)
        await tick()
        divs = Array.from(document.querySelectorAll('div'))
        console.log(divs)
        // await tick()
        // console.log(divs)
        let nextElement;
        prevIndex = prevIndex + 1
        nextElement = divs[currentIndex + 1];
        console.log(currentIndex, prevIndex, divs, nextElement)
        nextElement.focus();

    }
    if (event.key === "ArrowRight" || event.key === ">") {
        event.preventDefault()
        if(notes[i].indent < 10) {
            notes[i].indent = notes[i].indent + 1
        }
        // console.log(indent)
    }
    if (event.key === "ArrowLeft" || event.key === "<") {
        event.preventDefault()
        if(notes[i].indent >= 1) {
            notes[i].indent = notes[i].indent - 1
        }
        // console.log(indent)
    }
    if (event.key === "Backspace" && notes[i].note === "") {
        event.preventDefault()
        let divs = Array.from(document.querySelectorAll('div'));
        let currentIndex = divs.indexOf(document.activeElement);
        await getNotes()
        notes.splice(i, 1)
        if (id) {
            pb.collection('notes').delete(id)
        }
        await tick()
        let prevElement = divs[currentIndex - 1];
        if (prevElement) prevElement.focus();
        let range = document.createRange()
        range.selectNodeContents(prevElement)
        range.collapse(false)
        let selection = window.getSelection();
        selection.removeAllRanges()
        selection.addRange(range);
    }
    if (event.key === "~") {
        event.preventDefault();
        if (notes[i].done === false) {
            notes[i].done = true
            if (id) {
                pb.collection('notes').update(id, {
                    "done": true,
                })
                notes[i].saved = "yes"
            }
        } else {
            notes[i].done = false
            if (id) {
                pb.collection('notes').update(id, {
                    "done": false,
                })
                notes[i].saved = "yes"
            }
        }
    }
}

function checkIndex (array, ind) {
    if (ind < 0 || ind >= notes.length) {
        return null
    } else {
        return notes[ind].index
    }
}

async function nextDay () {
    let nextDay = new Date(new Date(selectedDate) * 1 + tzOffset + 24 * 60 * 60 * 1000)
    console.log(nextDay)
    selectedDate = nextDay.toISOString().split("T")[0]
    selectedDateArray = nextDay.toString().split(' ')
    await getNotes()
}

async function prevDay () {
    let prevDay = new Date(new Date(selectedDate) * 1 + tzOffset - 24 * 60 * 60 * 1000)
    console.log(prevDay)
    selectedDate = prevDay.toISOString().split("T")[0]
    selectedDateArray = prevDay.toString().split(' ')
    await getNotes()
}

function checkIndent (indent) {
    if (indent === 0) {
        return "bold"
    }
}

function checkDone (done) {
    if (done) {
        return "gray"
    }
}

</script>

{#if !authData}

<div style="text-align:center;padding-top:2em;">
    <input type="password" bind:value={password}>
    <br><br>
    <button onclick={() => login()}>LOGIN</button>
</div>

{:else}

{#if notes}

<div style="text-align:center;font-weight:bold;font-family:'Google Sans';">
    <p>
        <button style="padding-left:1em;padding-right:1em;font-size:1.2em;border:none;border-radius:10px;background-color:#ec8c93;" onclick={() => prevDay()}>◄</button>
        &nbsp;{selectedDateArray[0]}, {selectedDateArray[1]} {selectedDateArray[2]} {selectedDateArray[3]}&nbsp;
        <button style="padding-left:1em;padding-right:1em;font-size:1.2em;border:none;border-radius:10px;background-color:#b5d5a3;" onclick={() => nextDay()}>►</button>
    </p>
    <!-- <input type="date" style="font-family:sans-serif;font-weight:bold;font-size:1em;" bind:value={selectedDate} onchange={() => getNotes()}> -->
</div>

<form>

<!-- <div
    style="text-align:right;width:{97}%;min-height:1.5em;align-items:flex-end;border-top:none;border-left:none;border-right:none;border-bottom:1px solid #C0C0C0;overflow-wrap:break-word;margin-left:0%;padding-left:0.25em;padding-right:0.25em;font-weight:bold;font-family:'Google Sans'"
    >
    {selectedDateArray[0]}, {selectedDateArray[1]} {selectedDateArray[2]} {selectedDateArray[3]}
</div> -->

{#each notes as note, i}

{#if note.saved === "no"}

<div contenteditable 
    style="width:{97 - note.indent * 5}%;min-height:1.6em;display:flex;align-items:flex-end;border-top:none;border-left:none;border-right:none;border-bottom:1px solid #C0C0C0;overflow-wrap:break-word;margin-left:{note.indent * 5}%;background:#FFFDD0;padding-left:0.25em;padding-right:0.25em;font-weight:{checkIndent(note.indent)};color:{checkDone(note.done)};font-family:'Google Sans'"
    role="textbox"
    onkeydown={() => handleKeyPress(note.index, checkIndex(notes, i + 1), note.indent, note.id, i)}
    bind:textContent={note.note}
    >
</div>

{:else}

<div contenteditable 
    style="width:{97 - note.indent * 5}%;min-height:1.5em;display:flex;align-items:flex-end;border-top:none;border-left:none;border-right:none;border-bottom:1px solid #C0C0C0;overflow-wrap:break-word;margin-left:{note.indent * 5}%;padding-left:0.25em;padding-right:0.25em;background-color:rgba(0,0,0,{note.indent * 0.02});font-weight:{checkIndent(note.indent)};color:{checkDone(note.done)};font-family:'Google Sans'"
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

<p style="text-align:center;font-weight:bold;font-family:'Google Sans';">Getting notes...</p>

{:else}

<p>{error}</p>

{/if}

{/if}

<DailySearch bind:selectedDate={selectedDate} bind:selectedDateArray={selectedDateArray} tzOffset={tzOffset} getNotes={getNotes} />

{/if}

