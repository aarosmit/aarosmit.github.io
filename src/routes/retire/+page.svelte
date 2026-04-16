<svelte:head>
    <title>Retire</title> 
</svelte:head>

<svelte:options runes={false} />

<script>

import Highcharts from 'highcharts';
// import ExportingModule from 'highcharts/modules/exporting';
import { Chart } from '@highcharts/svelte';

// ExportingModule(Highcharts);

let ageCurrent = 30;
let currentRetireNum = 100000;
let beforeStraightROR = 0.06;
let afterStraightROR = 0.03;
let contributions = 10000;
let ageStopContributions = 60;
let ageStartContributions = 30;
let ageRetire = 60;
let withdrawals = 50000;
let ageFinal = 90;
let marketAdjustment = 0;
let haveSimsRan = false;

let stockPercentage = 80;
let bondPercentage = 20;
let cashPercentage = 0;

let SPY = [-0.3685,-0.2341,-0.2315,-0.1310,-0.1270,-0.0635,-0.0222,-0.0104,0.0050,0.0101,0.0136,0.0623,0.0721,0.0973,0.1261,0.1300,0.1336,0.1401,0.1465,0.1674,0.1724,0.1863,0.1919,0.2027,0.2139,0.2209,0.2300,0.2581,0.2665,0.2829,0.3035,0.3124,0.3461]
let FBNDX = [-0.1894,-0.0776,-0.0741,-0.0691,-0.0407,-0.0358,-0.0321,-0.0228,-0.0223,-0.0140,-0.0092,-0.0050,-0.0022,-0.0003,0.0135,0.0196,0.0227,0.0281,0.0300,0.0302,0.0345,0.0444,0.0454,0.0479,0.0506,0.0532,0.0550,0.0631,0.0684,0.0684,0.0710,0.0720,0.0725,0.0739,0.0814,0.0846,0.1270,0.1300,0.1314,0.1547]
let VBMFX = [-0.1847,-0.0823,-0.0513,-0.0371,-0.0271,-0.0232,-0.0203,-0.0169,-0.0098,-0.0065,-0.0045,0.0029,0.0045,0.0099,0.0134,0.0175,0.0199,0.0220,0.0231,0.0244,0.0275,0.0288,0.0314,0.0424,0.0426,0.0444,0.0476,0.0498,0.0500,0.0592,0.0619,0.0622,0.0674,0.0679,0.0692,0.0764,0.0779,0.0867,0.1190,0.1531]
let VWELX = [-0.3541,-0.2643,-0.2230,-0.2121,-0.1773,-0.1432,-0.1183,-0.0783,-0.0690,-0.0661,-0.0517,-0.0438,-0.0430,-0.0391,-0.0347,-0.0342,-0.0281,-0.0241,-0.0182,-0.0049,0.0006,0.0016,0.0187,0.0228,0.0290,0.0385,0.0385,0.0419,0.0441,0.0443,0.0517,0.0532,0.0544,0.0640,0.0682,0.0683,0.0791,0.0793,0.0816,0.0834,0.0886,0.0888,0.0982,0.1031,0.1040,0.1060,0.1070,0.1085,0.1094,0.1099,0.1099,0.1101,0.1117,0.1192,0.1206,0.1232,0.1257,0.1269,0.1352,0.1354,0.1433,0.1472,0.1476,0.1497,0.1554,0.1611,0.1619,0.1648,0.1650,0.1662,0.1840,0.1897,0.1901,0.1911,0.1937,0.1966,0.2033,0.2075,0.2160,0.2220,0.2251,0.2258,0.2313,0.2323,0.2336,0.2357,0.2365,0.2455,0.2488,0.2518,0.2847,0.2853,0.3086,0.3133,0.3292,0.3533]
let VFINX = [-0.3708,-0.2398,-0.2321,-0.1606,-0.1337,-0.1204,-0.0836,-0.0633,-0.0226,-0.0146,-0.0098,-0.0046,-0.0025,0.0050,0.0124,0.0130,0.0520,0.0720,0.0724,0.0813,0.0956,0.1008,0.1267,0.1277,0.1281,0.1321,0.1369,0.1385,0.1465,0.1488,0.1714,0.1792,0.1809,0.1892,0.1914,0.2007,0.2135,0.2203,0.2267,0.2317,0.2613,0.2658,0.2813,0.2840,0.3022,0.3095,0.3405]

$: stock = VWELX;
$: bond = FBNDX;

$: console.log(stock, bond)

$: yearlyValue = [currentRetireNum]

let fireSim = [{
    age: ageCurrent,            
    contribution: 0,
    withdrawal: 0,
    portfolioValue: currentRetireNum,
    stockYear: 0,
    bondYear: 0,
    totalReturn: 0
}]

let i = 0;
let j = 0;

let allSims = [];
let allGrowth = [];
let allContributions = {name: 'Contributions', type: 'column', opacity: 0.5, color: 'green', data: []}
let allWithdrawals = {name: 'Withdrawals', type: 'column', opacity: 0.5, color: 'red', data: []}

let simsRan = 0;
let simsSucceeded = 0;
let simsFailed = 0;

function runSims () {

if (!stock || !bond || stockPercentage + bondPercentage + cashPercentage != 100) {
    alert('Fix asset allocations')
} else {
    haveSimsRan = false;
    allSims = []
    allGrowth = []
    j = 0
    simsRan = 0;
    simsSucceeded = 0;
    simsFailed = 0;
    while (j < 500) {
        allGrowth.push({type: 'line', data: [currentRetireNum]})
        allContributions.data = [0]
        allWithdrawals.data = [0]
        i = 0
        fireSim = [{
            age: ageCurrent,            
            contribution: 0,
            withdrawal: 0,
            portfolioValue: currentRetireNum,
            stockYear: 0,
            bondYear: 0,
            totalReturn: 0
        }]
        while (i < ageFinal - ageCurrent) {
            i++;
            let stockReturn = stock[Math.round(Math.random() * (stock.length - 1))]
            let bondReturn = bond[Math.round(Math.random() * (bond.length - 1))]
            let portfolioGrowth = (fireSim[i - 1].portfolioValue * (1 + stockReturn + marketAdjustment / 100) * stockPercentage / 100) + (fireSim[i - 1].portfolioValue * (1 + bondReturn + marketAdjustment / 100) * bondPercentage / 100) + (fireSim[i - 1].portfolioValue * cashPercentage / 100)
            let contribution;
            let withdrawal;
            if (i + ageCurrent >= ageStartContributions && i + ageCurrent < ageStopContributions) {
                contribution = contributions;
            } else {
                contribution = 0
            }
            if (i + ageCurrent >= ageRetire) {
                withdrawal = withdrawals;
            } else {
                withdrawal = 0
            }
            // console.log(stockReturn)
            // yearlyValue[i + 1 - ageCurrent] = yearlyValue[i - ageCurrent] * (1 + stockReturn)
            // console.log(stock.length)
            fireSim.push({
                age: i + ageCurrent,
                contribution: contribution,
                withdrawal: withdrawal,
                portfolioValue: Math.round(portfolioGrowth + contribution - withdrawal),
                stockYear: Math.round(stockReturn * 1000) / 10,
                bondYear: Math.round(bondReturn * 1000) / 10,
                totalReturn: 0
            })
            fireSim[i].totalReturn = Math.round(fireSim[i].portfolioValue / fireSim[0].portfolioValue)
            allGrowth[j].data.push(fireSim[i].portfolioValue)
            allContributions.data.push(fireSim[i].contribution)
            allWithdrawals.data.push(fireSim[i].withdrawal)
        }
        allSims.push(allGrowth[j])
        console.log(fireSim)
        simsRan++;

        if (fireSim[i].portfolioValue > 0) {
            simsSucceeded++;
        } else {
            simsFailed++;
        }
    j++;
    }
    allSims.push(allContributions)
    allSims.push(allWithdrawals)
    haveSimsRan = true;
    console.log(allGrowth, allContributions, allWithdrawals)
    console.log(allSims)
    console.log(simsRan, simsSucceeded, simsFailed)

}

// CHART OPTIONS



}


$: chartOptions = {
    title: {
        text: "Simulations"
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
            pointStart: ageCurrent,
            pointWidth: 10
        }
    },
    yAxis: {type: 'logarithmic'},
    series: allSims,
    legend: {enabled: false}
}


</script>

<div>Age: <input type="range" min="10" max="100" required bind:value={ageCurrent}>{ageCurrent}</div>
<div>Current retirement funds:  <input type="range" min="0" max="3000000" step="100000" required bind:value={currentRetireNum}>{currentRetireNum.toLocaleString()}</div>
<div>Yearly contributions: <input type="range" min="0" max="300000" step="5000" required bind:value={contributions}>{contributions.toLocaleString()}</div>
<div>Age start contributions: <input type="range" min="10" max="100" required bind:value={ageStartContributions}>{ageStartContributions}</div>
<div>Age stop contributions: <input type="range" min="10" max="100" required bind:value={ageStopContributions}>{ageStopContributions}</div>
<div>Retirement age: <input type="range" min="10" max="100" required bind:value={ageRetire}>{ageRetire}</div>
<div>Yearly withdrawals: <input type="range" min="0" max="300000" step="5000" required bind:value={withdrawals}>{withdrawals.toLocaleString()}</div>
<div>Final age: <input type="range" min="10" max="100" required bind:value={ageFinal}>{ageFinal}</div>
<div>Market Adjustment (%): <input type="range" min="-10" max="10" required bind:value={marketAdjustment}>{marketAdjustment}%</div>

<div>Cash: <input type="range" min="0" max="100" step="5" required bind:value={cashPercentage}>{cashPercentage}%</div>

<div>
    Stocks: 
    <select bind:value={stock}>
        <option value={SPY}>SPY ({SPY.length} years)</option>
        <option value={VFINX}>VFINX ({VFINX.length} years)</option>
        <option value={VWELX}>VWELX ({VWELX.length} years)</option>
    </select>
    <input type="range" min="0" max="100" step="5" required bind:value={stockPercentage}>{stockPercentage}%
</div>

<div>
    Bonds:
    <select bind:value={bond}>
        <option value={FBNDX}>FBNDX ({FBNDX.length} years)</option>
        <option value={VBMFX}>VBMFX ({VBMFX.length} years)</option>
    </select>
    <input type="range" min="0" max="100" step="5" required bind:value={bondPercentage}>{bondPercentage}%
</div>

<button on:click={runSims}>RUN</button>

<table>
<thead>
        <tr>
            <th>Sims Ran</th>
            <th>Sims Succeeded</th>
            <th>Sims Failed</th>
            <th>Success Rate</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>{simsRan}</td>
            <td>{simsSucceeded}</td>
            <td>{simsFailed}</td>
            <td>{Math.round(simsSucceeded / simsRan * 100)}%</td>
        </tr>
    </tbody>
</table>

{#if !haveSimsRan}

{:else}

<Chart 
    options={chartOptions} 
    highcharts={Highcharts}
/>

{/if}