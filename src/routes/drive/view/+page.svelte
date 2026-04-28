<script>

import Highcharts from 'highcharts';
import { Chart } from '@highcharts/svelte';

import PocketBase from 'pocketbase';
const pb = new PocketBase('https://db.aarosmit.com');

let records;
$: selectedVehicle = "Fit";

let odometerDataFit = {
    type: "line",
    data: []
};
let costDataFit = {
    type: "line",
    data: []
};

let odometerDataCross = {
    type: "line",
    data: []
};
let costDataCross = {
    type: "line",
    data: []
};

async function getRecords () {
    records = await pb.collection('vehicles').getFullList({
        sort: 'date'
    });
    let cumCostCross = 0;
    let cumCostFit = 0;
    for (let i = 0; i < records.length; i++) {
        if (records[i].vehicle === "Fit") {
            if (records[i].odometer > 0) {
            odometerDataFit.data.push({
                x: new Date(records[i].date),
                y: records[i].odometer
            })
        }}
        if (records[i].vehicle === "Cross") {
            if (records[i].odometer > 0) {
            odometerDataCross.data.push({
                x: new Date(records[i].date),
                y: records[i].odometer
            })
        }}
        if (records[i].vehicle === "Cross") {
            if (records[i].cost > 0) {
                cumCostCross = cumCostCross + records[i].cost
                costDataCross.data.push({
                    x: new Date(records[i].date),
                    y: Math.round(cumCostCross)
                })
            }
        }
        if (records[i].vehicle === "Fit") {
            if (records[i].cost > 0) {
                cumCostFit = cumCostFit + records[i].cost
                costDataFit.data.push({
                    x: new Date(records[i].date),
                    y: Math.round(cumCostFit)
                })
            }
        }
    }
    
    return records
}

$: chartOdometerOptions = {
    title: {
        text: "Odometer"
    },
    plotOptions: {
        series: {
            enableMouseTracking: true,
            lineWidth: 1,
            label: {
                enabled: false
            },
            marker: {
                enabled: false
            },
            pointWidth: 10
        }
    },
    xAxis: [{
        type: "datetime"
    }],
    series: [odometerDataCross, odometerDataFit],
    legend: {enabled: false}
}

$: chartCostOptions = {
    title: {
        text: "Cost"
    },
    plotOptions: {
        series: {
            enableMouseTracking: true,
            lineWidth: 1,
            label: {
                enabled: false
            },
            marker: {
                enabled: false
            },
            pointWidth: 10
        }
    },
    xAxis: [{
        type: "datetime"
    }],
    series: [costDataCross, costDataFit],
    legend: {enabled: false}
}

</script>

{#await getRecords()}
    <p>Getting data</p>
{:then records} 
    <Chart 
        options={chartOdometerOptions} 
        highcharts={Highcharts}
    />
    <Chart 
        options={chartCostOptions} 
        highcharts={Highcharts}
    />

{/await}