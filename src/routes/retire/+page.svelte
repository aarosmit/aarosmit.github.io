<svelte:head>
    <title>Retire</title> 
</svelte:head>

<svelte:options runes={false} />

<script>

import { page } from '$app/state';
import { onMount } from 'svelte';

import Highcharts from 'highcharts';
// import ExportingModule from 'highcharts/modules/exporting';
import { Chart } from '@highcharts/svelte';

// ExportingModule(Highcharts);

let ageCurrent = null;
let currentRetireNum = 0
let contributions = 0
let ageStopContributions = null
let ageStartContributions = null
let ageRetire = null
let withdrawals = 0
let ageFinal = null
let marketAdjustment = null
let stockPercentage = null
let bondPercentage = null
let cashPercentage = null

onMount(() => {
    ageCurrent = 1 * page.url.searchParams.get('ageCurrent') || 30;
    ageCurrent = 1 * page.url.searchParams.get('ageCurrent') || 30;
    currentRetireNum = 1 * page.url.searchParams.get('currentRetireNum') || 100000;
    contributions = 1 * page.url.searchParams.get('contributions') || 10000;
    ageStopContributions = 1 * page.url.searchParams.get('ageStopContributions') || 60;
    ageStartContributions = 1 * page.url.searchParams.get('ageStartContributions') || 30;
    ageRetire = 1 * page.url.searchParams.get('ageRetire') || 60;
    withdrawals = 1 * page.url.searchParams.get('withdrawals') || 50000;
    ageFinal = 1 * page.url.searchParams.get('ageFinal') || 90;
    marketAdjustment = 1 * page.url.searchParams.get('marketAdjustment') || 0;
    stockPercentage = 1 * page.url.searchParams.get('stockPercentage') || 80;
    bondPercentage = 1 * page.url.searchParams.get('bondPercentage') || 20;
    cashPercentage = 1 * page.url.searchParams.get('cashPercentage') || 0;
})



let haveSimsRan = false;

let SandP = [0.1318,0.2083,0.1767,-0.1862,0.1217,0.1413,0.2268,-0.0797,0.2014,0.1569,-0.0668,0.1139,0.2119,0.1204,-0.0148,0.1232,0.2649,-0.3724,-0.0716,0.0911,0.0409,0.0131,0.2403,-0.2342,-0.156,-0.0968,0.1112,0.275,0.2378,0.2102,0.2856,-0.0432,0.06,0.013,0.2459,-0.0938,0.1323,0.0885,-0.0898,0.2521,0.1679,-0.0039,0.1068,0.1862,-0.1863,0.0725,-0.0236,0.011,-0.1862,0.0185,0.2509,-0.3247,-0.2579,0.1058,0.07,-0.0168,-0.1661,0.028,0.0858,-0.1253,0.0632,0.1157,0.1561,-0.0705,0.1489,0.0118,0.0327,0.334,-0.1265,-0.0008,0.2355,0.4088,-0.0384,0.0782,0.0932,0.1625,0.1224,0.0228,-0.1155,-0.2855,0.3065,0.1128,0.1407,0.0497,-0.2398,-0.1544,-0.0089,0.121,-0.3615,0.2511,0.4644,-0.1473,0.4528,-0.0531,-0.4225,-0.2084,-0.1267,0.4347,0.3233,0.0835,0.1556,0.1982,-0.0366,0.2265,0.1543,-0.1821,-0.0383,-0.0762,-0.3704,-0.0882,0.2114,-0.1152,-0.118,-0.05,-0.0054,-0.0136,0.0047,0.2812,-0.2678,-0.073,0.1708,0.2337,-0.1742,-0.0496,0.1209,0.1876,-0.1415,0.2275,0.1234,0.0173,-0.0089,0.0257,-0.1119,-0.0553,0.2114,-0.1223,0.078,0.0338,-0.0916,0.0731,0.271,-0.0876,-0.035,0.0001,-0.1151,0.2847,0.183,0.2279,0.0852,-0.2106,0.0422,0.047,-0.046,0.0278,0.0782]
let SPY = [-0.3685,-0.2341,-0.2315,-0.1310,-0.1270,-0.0635,-0.0222,-0.0104,0.0050,0.0101,0.0136,0.0623,0.0721,0.0973,0.1261,0.1300,0.1336,0.1401,0.1465,0.1674,0.1724,0.1863,0.1919,0.2027,0.2139,0.2209,0.2300,0.2581,0.2665,0.2829,0.3035,0.3124,0.3461]
let FBNDX = [-0.1894,-0.0776,-0.0741,-0.0691,-0.0407,-0.0358,-0.0321,-0.0228,-0.0223,-0.0140,-0.0092,-0.0050,-0.0022,-0.0003,0.0135,0.0196,0.0227,0.0281,0.0300,0.0302,0.0345,0.0444,0.0454,0.0479,0.0506,0.0532,0.0550,0.0631,0.0684,0.0684,0.0710,0.0720,0.0725,0.0739,0.0814,0.0846,0.1270,0.1300,0.1314,0.1547]
let VBMFX = [-0.1847,-0.0823,-0.0513,-0.0371,-0.0271,-0.0232,-0.0203,-0.0169,-0.0098,-0.0065,-0.0045,0.0029,0.0045,0.0099,0.0134,0.0175,0.0199,0.0220,0.0231,0.0244,0.0275,0.0288,0.0314,0.0424,0.0426,0.0444,0.0476,0.0498,0.0500,0.0592,0.0619,0.0622,0.0674,0.0679,0.0692,0.0764,0.0779,0.0867,0.1190,0.1531]
let VWELX = [-0.3541,-0.2643,-0.2230,-0.2121,-0.1773,-0.1432,-0.1183,-0.0783,-0.0690,-0.0661,-0.0517,-0.0438,-0.0430,-0.0391,-0.0347,-0.0342,-0.0281,-0.0241,-0.0182,-0.0049,0.0006,0.0016,0.0187,0.0228,0.0290,0.0385,0.0385,0.0419,0.0441,0.0443,0.0517,0.0532,0.0544,0.0640,0.0682,0.0683,0.0791,0.0793,0.0816,0.0834,0.0886,0.0888,0.0982,0.1031,0.1040,0.1060,0.1070,0.1085,0.1094,0.1099,0.1099,0.1101,0.1117,0.1192,0.1206,0.1232,0.1257,0.1269,0.1352,0.1354,0.1433,0.1472,0.1476,0.1497,0.1554,0.1611,0.1619,0.1648,0.1650,0.1662,0.1840,0.1897,0.1901,0.1911,0.1937,0.1966,0.2033,0.2075,0.2160,0.2220,0.2251,0.2258,0.2313,0.2323,0.2336,0.2357,0.2365,0.2455,0.2488,0.2518,0.2847,0.2853,0.3086,0.3133,0.3292,0.3533]
let VFINX = [-0.3708,-0.2398,-0.2321,-0.1606,-0.1337,-0.1204,-0.0836,-0.0633,-0.0226,-0.0146,-0.0098,-0.0046,-0.0025,0.0050,0.0124,0.0130,0.0520,0.0720,0.0724,0.0813,0.0956,0.1008,0.1267,0.1277,0.1281,0.1321,0.1369,0.1385,0.1465,0.1488,0.1714,0.1792,0.1809,0.1892,0.1914,0.2007,0.2135,0.2203,0.2267,0.2317,0.2613,0.2658,0.2813,0.2840,0.3022,0.3095,0.3405]

$: stock = SandP;
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

<h1>Retirement simulator</h1>

<form method="get">
    <table style="margin:0px auto;">
        <tbody>
            <tr>
                <td>Age</td>
                <td style="width:15em;"><input style="width:95%;" type="range" min="10" max="100" name="ageCurrent" required bind:value={ageCurrent}></td>
                <td>{ageCurrent}</td>
            </tr>
            <tr>
                <td>Current retirement funds</td>
                <td style="width:15em;"><input style="width:95%;" type="range" min="0" max="3000000" step="100000" name="currentRetireNum" required bind:value={currentRetireNum}></td>
                <td>${currentRetireNum.toLocaleString()}</td>
            </tr>
            <tr>
                <td>Yearly contributions</td>
                <td style="width:15em;"><input style="width:95%;" type="range" min="0" max="300000" step="5000" name="contributions" required bind:value={contributions}></td>
                <td>${contributions.toLocaleString()}</td>
            </tr>
            <tr>
                <td>Age start contributions</td>
                <td style="width:15em;"><input style="width:95%;" type="range" min="10" max="100" name="ageStartContributions" required bind:value={ageStartContributions}></td>
                <td>{ageStartContributions}</td>
            </tr>
            <tr>
                <td>Age stop contributions</td>
                <td style="width:15em;"><input style="width:95%;" type="range" min="10" max="100" name="ageStopContributions" required bind:value={ageStopContributions}></td>
                <td>{ageStopContributions}</td>
            </tr>
            <tr>
                <td>Retirement age</td>
                <td style="width:15em;"><input style="width:95%;" type="range" min="10" max="100" name="ageRetire" required bind:value={ageRetire}></td>
                <td>{ageRetire}</td>
            </tr>
            <tr>
                <td>Yearly withdrawals</td>
                <td style="width:15em;"><input style="width:95%;" type="range" min="0" max="300000" step="5000" name="withdrawals" required bind:value={withdrawals}></td>
                <td>${withdrawals.toLocaleString()}</td>
            </tr>
            <tr>
                <td>Final age</td>
                <td style="width:15em;"><input style="width:95%;" type="range" min="10" max="100" name="ageFinal" required bind:value={ageFinal}></td>
                <td>{ageFinal}</td>
            </tr>
            <tr>
                <td>Market Adjustment (%)</td>
                <td style="width:15em;"><input style="width:95%;" type="range" min="-10" max="10" name="marketAdjustment" required bind:value={marketAdjustment}></td>
                <td>{marketAdjustment}%</td>
            </tr>
            <tr>
                <td>Cash (%)</td>
                <td style="width:15em;"><input style="width:95%;" type="range" min="0" max="100" step="5" name="cashPercentage" required bind:value={cashPercentage}></td>
                <td>{cashPercentage}%</td>
            </tr>
            <tr>
                <td>
                    Stocks (%)
                    <select bind:value={stock}>
                        <option value={SandP}>S&P 500 ({SandP.length} years)</option>
                        <option value={SPY}>SPY ({SPY.length} years)</option>
                        <option value={VFINX}>VFINX ({VFINX.length} years)</option>
                        <option value={VWELX}>VWELX ({VWELX.length} years)</option>
                    </select>
                </td>
                <td style="width:15em;"><input style="width:95%;" type="range" min="0" max="100" step="5" name="stockPercentage" required bind:value={stockPercentage}></td>
                <td>{stockPercentage}%</td>
            </tr>
            <tr>
                <td>
                    Bonds:
                    <select bind:value={bond}>
                        <option value={FBNDX}>FBNDX ({FBNDX.length} years)</option>
                        <option value={VBMFX}>VBMFX ({VBMFX.length} years)</option>
                    </select>
                </td>
                <td style="width:15em;"><input style="width:95%;" type="range" min="0" max="100" step="5" name="bondPercentage" required bind:value={bondPercentage}></td>
                <td>{bondPercentage}%</td>
            </tr>
        </tbody>
    </table>
    <p style="text-align:center;"><button type="submit" on:click={runSims}>RUN</button></p>
</form>




<table style="margin:0px auto;">
    <thead>
        <tr>
            <th>Ran</th>
            <th>Succeeded</th>
            <th>Failed</th>
            <th>Rate</th>
        </tr>
    </thead>
    <tbody>
        <tr style="text-align: center;">
            <td>{simsRan}</td>
            <td>{simsSucceeded}</td>
            <td>{simsFailed}</td>
            <td>{Math.round(simsSucceeded / simsRan * 100) || 0}%</td>
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

<h2>Notes</h2>

<ol>
    <li>All returns are inflation adjusted.</li>
    <li>Data sources for returns:</li>
    <ul>
        <li><a href="https://www.multpl.com/inflation-adjusted-s-p-500">S&P 500</a></li>
        <li><a href="https://totalrealreturns.com/s/VFINX,SPY,FBNDX,VBMFX,VWELX">VFINX, SPY, FBNDX, VBMFX, & VWELX</a></li>
    </ul>
</ol>