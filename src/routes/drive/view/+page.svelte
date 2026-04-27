<script>

import { Line, LineChart, defaultChartPadding } from 'layerchart';
import PocketBase from 'pocketbase';
const pb = new PocketBase('https://db.aarosmit.com');

let records;
let chartData = [];

async function getRecords () {
    records = await pb.collection('vehicles').getFullList({
        sort: 'created'
    });
    
    for (let i = 0; i < records.length; i++) {
        if (records[i].vehicle === "Cross") {
            if (records[i].odometer > 0) {
            chartData.push({
                date: records[i].date,
                odometer: records[i].odometer
            })
        }}
    }

    console.log(chartData)
    // console.log(prevCrossRecord, prevFitRecord)
    return records
}

</script>

{#await getRecords()}
    <p>Getting data</p>
{:then records} 
    <p>Testing</p>
    <LineChart {chartData} x="date" y="value" padding={defaultChartPadding({ right: 10 })} height={300} />
{/await}