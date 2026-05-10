<script>

import PocketBase from 'pocketbase';
const pb = new PocketBase('https://db.aarosmit.com');

let searchTerm = $state(null)
let results = $state([])

let { selectedDate = $bindable(), selectedDateArray = $bindable(), tzOffset, getNotes } = $props()

async function searchFor () {
    let records = await pb.collection('notes').getFullList({
        sort: '-created',
    });
    results = []
    for (let i = 0; i < records.length; i++) {
        if (records[i].note.toLowerCase().includes(searchTerm)) {
            console.log(records[i].date, records[i].note)
            results = [...results, {
                date: records[i].date,
                note: records[i].note
            }]
        }
    }
}

async function changeDate (date) {
    selectedDate = date
    let newDay = new Date(new Date(selectedDate) * 1 + tzOffset)
    selectedDateArray = newDay.toString().split(' ')
    console.log(selectedDate, selectedDateArray)
    await getNotes()
}

</script>

<br>

<div style="text-align:center;">

<div>
<form>
    <input type="text" bind:value={searchTerm}>
    <br><br>
    <button style="border:none;font-size:1.1em;padding:0.5em;padding-left:1em;padding-right:1em;border-radius:5px;" type="submit" onclick={() => searchFor()}>SEARCH</button>
</form>
</div>

<br>
<!-- <p>{selectedDate}</p> -->

<table style="text-align:left;margin-left:auto;margin-right:auto;">
<thead></thead>
<tbody>
    {#each results as result}
    <tr>
        <td><button style="border:none;font-size:1em;" onclick={() => changeDate(result.date)}>{result.date}</button></td>
        <td>{result.note}</td>
    </tr>
    {/each}

</tbody>
</table>

</div>

<style>

button {
    border:none;
    font-size:1em;
    border-radius:5px;
    font-weight:bold;
    font-family:'Google Sans';
}

button:hover {
    background-color:#84b76680;
}

input {
    background-color:#e9e9ed;
    border:none;
    font-size:1em;
    border:none;
    border-radius:5px;
}

</style>