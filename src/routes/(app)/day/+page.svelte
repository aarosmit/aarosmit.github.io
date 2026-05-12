<svelte:head>
    <title>Day</title> 
</svelte:head>

<script>



import PocketBase from 'pocketbase';
import { onMount, onDestroy, tick } from 'svelte';
// import { useSwipe } from 'svelte-gestures';

import DaySearch from '$lib/components/DaySearch.svelte';
// import Login from '$lib/components/Login.svelte';

const pb = new PocketBase('https://db.aarosmit.com');

let notes = $state(null);
let error = $state(null);
let tzOffset = new Date().getTimezoneOffset() * 60 * 1000;
let today = new Date()
let todayString = new Date((today * 1 - tzOffset)).toISOString().split("T")[0]
let selectedDateArray = $state(today.toString().split(' '))
let selectedDate = $state(todayString)
let prevIndex = 1;
let search = $state(false)

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

    // console.log(authData)

    // console.log(pb.authStore.isValid);
    // console.log(pb.authStore.token);
    // console.log(pb.authStore.record.id);
}

// console.log(selectedDateArray)

let dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// $inspect(notes)

onMount(async () => {

    if (pb.authStore.isValid) {
        authData = true
    }

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
            if (nextIndex - curIndex > 64) {
                newIndex = curIndex + 64
            } else if (nextIndex - curIndex > 8) {
                newIndex = curIndex + 8
            } else {
                newIndex = (curIndex + nextIndex) / 2
            }
        } else {
            newIndex = curIndex + 512
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
    if (event.key === ">") {
        event.preventDefault()
        if(notes[i].indent < 10) {
            notes[i].indent = notes[i].indent + 1
        }
        // console.log(indent)
    }
    if (event.key === "<") {
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
    if (event.key === "`" || event.key === "~") {
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

function toggleSearch () {
    if (search) {
        search = false
    } else {
        search = true
    }
}

async function changeDateToToday () {
    selectedDate = todayString
    let newDay = new Date(new Date(selectedDate) * 1 + tzOffset)
    selectedDateArray = newDay.toString().split(' ')
    console.log(selectedDate, selectedDateArray)
    await getNotes()
}

function swipeHandler () {
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

</script>

{#if !authData}

<!-- LOGIN -->

<div style="text-align:center;position:absolute;bottom:10%;width:100%;">
    <p>{error}</p>
    <input style="background-color:#e9e9ed;border:none;font-size:1em;border:none;border-radius:5px;" type="password" bind:value={password}>
    <br><br>
    <button style="padding:0.5em;padding-left:1em;padding-right:1em;font-size:1.2em;border:none;border-radius:5px;" onclick={() => login()}>LOGIN</button>
</div>

<!-- <Login password={password} error={error} login={login} /> -->

{:else}

{#if notes}

<div style="text-align:center;font-weight:bold;font-family:'Google Sans';">
    <p>
        <button style="padding-left:1em;padding-right:1em;font-size:1.2em;border:none;border-radius:10px;" onclick={() => prevDay()}>◄</button>
        &nbsp;{selectedDateArray[0]}, {selectedDateArray[1]} {selectedDateArray[2]} {selectedDateArray[3]}&nbsp;
        <button style="padding-left:1em;padding-right:1em;font-size:1.2em;border:none;border-radius:10px;" onclick={() => nextDay()}>►</button>
        &nbsp;&nbsp;&nbsp;&nbsp;

    </p>
    <!-- <input type="date" style="font-family:sans-serif;font-weight:bold;font-size:1em;" bind:value={selectedDate} onchange={() => getNotes()}> -->
</div>

{#if selectedDate === todayString}
<button style="font-size:1em;height:3em;width:3em;position:fixed;bottom:12%;right:10%;background-color:#84b76680;" onclick={() => changeDateToToday()}>
    <svg width="20" height="20" fill="black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="m5.56,3.79c0-.31,0-.59,0-.88,0-.52.36-.9.85-.92.5-.02.9.36.92.88.01.28,0,.56,0,.87h5.34c0-.27,0-.53,0-.79,0-.56.37-.95.88-.96.52,0,.89.39.9.97,0,.27,0,.54,0,.77.52.13,1.03.18,1.47.38,1.31.59,2.03,1.65,2.05,3.08.04,2.48.05,4.95,0,7.43-.04,1.9-1.47,3.32-3.39,3.35-3.05.04-6.1.04-9.15,0-1.94-.03-3.35-1.43-3.39-3.37-.05-2.45-.05-4.91,0-7.36.04-1.93,1.33-3.23,3.26-3.41.07,0,.15-.02.26-.03Zm-1.77,5.34c0,.12-.01.22-.01.32,0,1.09,0,2.17,0,3.26,0,.68,0,1.37.06,2.05.06.73.62,1.3,1.34,1.39.45.06.9.07,1.36.07,2.57,0,5.15,0,7.72-.02.39,0,.81-.1,1.15-.27.6-.31.81-.89.81-1.54.01-1.69.02-3.37.02-5.06,0-.06-.01-.12-.02-.2H3.79Zm12.41-1.81c0-.68-.26-1.21-.83-1.5-.3-.16-.68-.23-1.03-.24-2.07-.03-4.14-.03-6.21-.03-.99,0-1.99,0-2.97.07-.8.06-1.41.88-1.32,1.69h12.36Z" stroke-width="0"></path></svg>
</button>
{:else}
<button style="font-size:1em;height:3em;width:3em;position:fixed;bottom:12%;right:10%;background-color:#e9e9ed80;" onclick={() => changeDateToToday()}>
    <svg width="20" height="20" fill="black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="m5.56,3.79c0-.31,0-.59,0-.88,0-.52.36-.9.85-.92.5-.02.9.36.92.88.01.28,0,.56,0,.87h5.34c0-.27,0-.53,0-.79,0-.56.37-.95.88-.96.52,0,.89.39.9.97,0,.27,0,.54,0,.77.52.13,1.03.18,1.47.38,1.31.59,2.03,1.65,2.05,3.08.04,2.48.05,4.95,0,7.43-.04,1.9-1.47,3.32-3.39,3.35-3.05.04-6.1.04-9.15,0-1.94-.03-3.35-1.43-3.39-3.37-.05-2.45-.05-4.91,0-7.36.04-1.93,1.33-3.23,3.26-3.41.07,0,.15-.02.26-.03Zm-1.77,5.34c0,.12-.01.22-.01.32,0,1.09,0,2.17,0,3.26,0,.68,0,1.37.06,2.05.06.73.62,1.3,1.34,1.39.45.06.9.07,1.36.07,2.57,0,5.15,0,7.72-.02.39,0,.81-.1,1.15-.27.6-.31.81-.89.81-1.54.01-1.69.02-3.37.02-5.06,0-.06-.01-.12-.02-.2H3.79Zm12.41-1.81c0-.68-.26-1.21-.83-1.5-.3-.16-.68-.23-1.03-.24-2.07-.03-4.14-.03-6.21-.03-.99,0-1.99,0-2.97.07-.8.06-1.41.88-1.32,1.69h12.36Z" stroke-width="0"></path></svg>
</button>
{/if}

{#if search}
<button 
    style="font-size:1em;height:3em;width:3em;position:fixed;bottom:5%;right:10%;background-color:#84b76680;" 
    onclick={() => toggleSearch()}>
    <svg width="20" height="20" fill="black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="m17.74,16.48l-4.54-4.54c.78-1.04,1.24-2.32,1.24-3.72,0-3.44-2.79-6.22-6.22-6.22s-6.22,2.79-6.22,6.22,2.79,6.22,6.22,6.22c1.4,0,2.68-.47,3.72-1.24l4.54,4.54c.35.35.91.35,1.26,0,.35-.35.35-.91,0-1.26ZM3.78,8.22c0-2.45,1.99-4.44,4.44-4.44s4.44,1.99,4.44,4.44-1.99,4.44-4.44,4.44-4.44-1.99-4.44-4.44Z" fill-rule="evenodd" stroke-width="0"></path></svg>
</button>
{:else}
<button 
    style="font-size:1em;height:3em;width:3em;position:fixed;bottom:5%;right:10%;background-color:#e9e9ed80;" 
    onclick={() => toggleSearch()}>
    <svg width="20" height="20" fill="black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="m17.74,16.48l-4.54-4.54c.78-1.04,1.24-2.32,1.24-3.72,0-3.44-2.79-6.22-6.22-6.22s-6.22,2.79-6.22,6.22,2.79,6.22,6.22,6.22c1.4,0,2.68-.47,3.72-1.24l4.54,4.54c.35.35.91.35,1.26,0,.35-.35.35-.91,0-1.26ZM3.78,8.22c0-2.45,1.99-4.44,4.44-4.44s4.44,1.99,4.44,4.44-1.99,4.44-4.44,4.44-4.44-1.99-4.44-4.44Z" fill-rule="evenodd" stroke-width="0"></path></svg>
</button>
{/if}

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
    // {...useSwipe(swipeHandler, () => ({timeframe: 300, minSwipeDistance: 50}))}
    >
</div>

{:else}

<!-- <div style="width:2%;min-height:1.5em;display:flex;align-items:flex-start;"></div> -->

<div contenteditable 
    style="width:{97 - note.indent * 5}%;min-height:1.5em;display:flex;align-items:flex-end;border-top:none;border-left:1px solid #C0C0C0;border-right:none;border-bottom:1px solid #C0C0C0;overflow-wrap:break-word;margin-left:{note.indent * 5}%;padding-left:0.25em;padding-right:0.25em;padding-top:0.25em;background-color:rgba(0,0,0,{note.indent * 0.02});font-weight:{checkIndent(note.indent)};color:{checkDone(note.done)};font-family:'Google Sans'"
    role="textbox"
    onkeydown={() => handleKeyPress(note.index, checkIndex(notes, i + 1), note.indent, note.id, i)}
    bind:textContent={note.note}
    // {...useSwipe(swipeHandler, () => ({timeframe: 300, minSwipeDistance: 50}))}
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

{#if search}

<DaySearch bind:selectedDate={selectedDate} bind:selectedDateArray={selectedDateArray} tzOffset={tzOffset} getNotes={getNotes} />

{/if}

{/if}

<br><br><br><br><br><br><br><br>

<style>

div {
    font-family:'Google Sans', sans-serif;
}

button {
    font-family:'Google Sans', sans-serif;
    border:none;
    border-radius:5px;
    font-weight:bold;
}

button:hover {
    background-color: #84b76680;
}

input {
    background-color:#e9e9ed80;
    border:none;
    font-size:1em;
    border:none;
    border-radius:5px;
}

</style>