<meta name="viewport" content="width=device-width, initial-scale=1.0">

<script>

import Highcharts from 'highcharts';
import { Chart } from '@highcharts/svelte';

import PocketBase from 'pocketbase';
const pb = new PocketBase('https://db.aarosmit.com');

let records;
$: selectedVehicle = "Fit";

let odometerDataFit = {
    type: "line",
    data: [],
    name: "2008 Fit"
};
let costDataFit = {
    type: "line",
    data: [],
    name: "2008 Fit"
};

let odometerDataCross = {
    type: "line",
    data: [],
    name: "2023 Cross"
};
let costDataCross = {
    type: "line",
    data: [],
    name: "2023 Cross"
};

let odometerDataCorolla = {
    type: "line",
    data: [],
    name: "2008 Corolla"
};
let costDataCorolla = {
    type: "line",
    data: [],
    name: "2008 Corolla"
};

let odometerData4Runner = {
    type: "line",
    data: [],
    name: "2014 4Runner"
};
let costData4Runner = {
    type: "line",
    data: [],
    name: "2014 4Runner"
};

let odometerDataCRV = {
    type: "line",
    data: [],
    name: "2000 CRV"
};
let costDataCRV = {
    type: "line",
    data: [],
    name: "2000 CRV"
};

async function getRecords () {
    records = await pb.collection('vehicles').getFullList({
        sort: 'date'
    });
    let cumCostCross = 0;
    let cumCostFit = 0;
    let cumCostCorolla = 0;
    let cumCost4Runner = 0;
    let cumCostCRV = 0;
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
        if (records[i].vehicle === "2008 Corolla") {
            if (records[i].odometer > 0) {
            odometerDataCorolla.data.push({
                x: new Date(records[i].date),
                y: records[i].odometer
            })
        }}
        if (records[i].vehicle === "4Runner") {
            if (records[i].odometer > 0) {
            odometerData4Runner.data.push({
                x: new Date(records[i].date),
                y: records[i].odometer
            })
        }}
        if (records[i].vehicle === "2000 CRV") {
            if (records[i].odometer > 0) {
            odometerDataCRV.data.push({
                x: new Date(records[i].date),
                y: records[i].odometer
            })
        }}

        // CREATE COST DATA
        if (records[i].vehicle === "Cross") {
            if (records[i].cost) {
                cumCostCross = cumCostCross + records[i].cost
                costDataCross.data.push({
                    x: new Date(records[i].date),
                    y: Math.round(cumCostCross)
                })
            }
        }
        if (records[i].vehicle === "Fit") {
            if (records[i].cost) {
                cumCostFit = cumCostFit + records[i].cost
                costDataFit.data.push({
                    x: new Date(records[i].date),
                    y: Math.round(cumCostFit)
                })
            }
        }
        if (records[i].vehicle === "2008 Corolla") {
            if (records[i].cost) {
                cumCostCorolla = cumCostCorolla + records[i].cost
                costDataCorolla.data.push({
                    x: new Date(records[i].date),
                    y: Math.round(cumCostCorolla)
                })
            }
        }
        if (records[i].vehicle === "4Runner") {
            if (records[i].cost) {
                cumCost4Runner = cumCost4Runner + records[i].cost
                costData4Runner.data.push({
                    x: new Date(records[i].date),
                    y: Math.round(cumCost4Runner)
                })
            }
        }
        if (records[i].vehicle === "2000 CRV") {
            if (records[i].cost) {
                cumCostCRV = cumCostCRV + records[i].cost
                costDataCRV.data.push({
                    x: new Date(records[i].date),
                    y: Math.round(cumCostCRV)
                })
            }
        }
    }
    
    return records
}

$: chartOdometerOptions = {
    chart: {
        height: "90%"
    },
    title: {
        text: "Odometer"
    },
    plotOptions: {
        series: {
            enableMouseTracking: true,
            lineWidth: 2,
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
    series: [odometerDataCRV, odometerDataCorolla, odometerDataFit, odometerData4Runner, odometerDataCross],
    legend: {enabled: true}
}

$: chartCostOptions = {
    chart: {
        height: "75%"
    },
    title: {
        text: "Cost"
    },
    plotOptions: {
        series: {
            enableMouseTracking: true,
            lineWidth: 2,
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
    series: [costDataCRV, costDataCorolla, costDataFit, costData4Runner, costDataCross],
    legend: {enabled: true}
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

<style>

</style>