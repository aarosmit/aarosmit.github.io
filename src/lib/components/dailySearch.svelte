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
    <button type="submit" onclick={() => searchFor()}>SEARCH</button>
</form>
</div>

<br>
<!-- <p>{selectedDate}</p> -->

<table style="text-align:left;margin-left:auto;margin-right:auto;">
<thead></thead>
<tbody>
    {#each results as result}
    <tr>
        <td><button onclick={() => changeDate(result.date)}>{result.date}</button></td>
        <td>{result.note}</td>
    </tr>
    {/each}

</tbody>
</table>

</div>