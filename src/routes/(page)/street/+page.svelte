<svelte:head>
    <title>{title}</title>
    <meta charset="UTF-8">
    <meta name="description" content={title}>
    <meta name="keywords" content="street, costs, infrastructure, property taxes">
</svelte:head>

<script>

const title = "The cost of a street"

// import ImageButton from "$lib/components/ImageButton.svelte";

let periods = ['month', 'year'];
let lotROW;
let streetWidth;
let startDate = new Date('2023-09-22');
let currentDate = new Date();
let diffDate = (currentDate - startDate) / 1000 / 60 / 60 / 24;
console.log(diffDate)
let costsPerLaneMile = Math.round(200000 * ((1 + 0.02)**(diffDate / 365)));
let cost;
$: cost20 = Math.round(cost * 1.02**20);
let area;
let propValue;
let state;
let tax;
let taxMonthly;
$: tax20 = Math.round((taxMonthly * 12) * (((1.02**20) - 1) / 0.02));
$: difference = cost20 - tax20;
let period;
let streetOrStroad = 'street';
let problem = false;
let serious = false;

$: if (streetWidth > 30) {
  streetOrStroad = 'stroad';
} else {
  streetOrStroad = 'street';
}

$: cost = Math.round((costsPerLaneMile / 5280 / 10) * lotROW * (streetWidth / 2))

$: if (period === 'month') {
  taxMonthly = tax;
} else if (period === 'year') {
  taxMonthly = tax / 12;
}

function handleClick () {
  problem = true;
}

function handleClick2 () {
  serious = true;
}

</script>

<h1>The cost of a {streetOrStroad}</h1>

<p>My property shares <input type="number" bind:value={lotROW}> feet with the {streetOrStroad} I live on. 

The {streetOrStroad} I live on is <input type="number" bind:value={streetWidth}> feet wide.</p>

<small>In the US, a typical suburban street is 28 feet wide and a typical lane width is approximately 10-11 feet.</small> 

<div id="svg">
  <svg width="100%" height="100%">
    <rect x="30%" y="22.5%" width="40%" height="30%" fill="gray"></rect>
    <text x="40%" y="40%" fill="#FFFFFF">HOUSE</text>
    <text x="35%" y="17%" fill="gray">PROPERTY</text>
    <line x1="10%" y1="65%" x2="90%" y2="65%" style="stroke:gray;stroke-width:2" stroke-dasharray="5,5"/>
    <line x1="10%" y1="10%" x2="90%" y2="10%" style="stroke:gray;stroke-width:2" stroke-dasharray="5,5"/>
    <line x1="10%" y1="10%" x2="10%" y2="65%" style="stroke:gray;stroke-width:2" stroke-dasharray="5,5"/>
    <line x1="90%" y1="10%" x2="90%" y2="65%" style="stroke:gray;stroke-width:2" stroke-dasharray="5,5"/>
    <line x1="0%" y1="70%" x2="100%" y2="70%" style="stroke:rgb(0,0,0);stroke-width:2" />
    <line x1="0%" y1="80%" x2="100%" y2="80%" style="stroke:#fdcd01;stroke-width:2" stroke-dasharray="20,20" />
    <line x1="0%" y1="90%" x2="100%" y2="90%" style="stroke:rgb(0,0,0);stroke-width:2" />
    {#if lotROW}
      <line x1="10%" y1="65%" x2="90%" y2="65%" style="stroke:red;stroke-width:2" />
      <text x="45%" y="63%" fill="red">{lotROW} ft</text>
    {/if}
    {#if streetWidth}
      <line x1="50%" y1="70%" x2="50%" y2="90%" style="stroke:red;stroke-width:2" />
      <text x="52%" y="78%" fill="red">{streetWidth} ft</text>
    {/if}
  </svg>
</div>

<p>I pay <input type="number" bind:value={tax}> dollars in property tax every <select bind:value={period}><option>{periods[0]}</option><option>{periods[1]}</option></select>.</p>

{#if cost > 0}
<p>The cost <b>today</b> to reconstruct the portion of {streetOrStroad} in front of my property is ${cost.toLocaleString("en-US")}.</p>

<p><sup>(The average lifespan of an asphalt {streetOrStroad} is 20-30 years.)</sup></p>
{/if}

{#if tax}
<p>Over 20 years, I will pay ${tax20.toLocaleString("en-US")} in property tax.</p>

<p>After 20 years, the {streetOrStroad} I live on will cost ${cost20.toLocaleString("en-US")} to resurface.</p>

<b>So, {Math.round(cost20/tax20 * 100)}% of my property tax needs to be dedicated to {streetOrStroad} maintenance.</b>

<!-- <p><a href="" on:click={() => handleClick()}><i>Is this a problem?</i></a></p> -->

{/if}

<!-- {#if problem === true}

Probably.

Please ensure this proportion of your property tax is being allocated for {streetOrStroad} maintenance by confirming with your local government representative.

{#if cost20/tax20 > 1}

<p><a href="" on:click={() => handleClick2()}><i>Are you serious?</i></a></p>

{#if serious === true}

<p>Unfortunately, yes.</p>

<p>Additionally, since the reconstruction costs more than you contribute in property tax, please send a check for ${difference.toLocaleString("en-US")} to your local municipality when they plan to start reconstruction along your {streetOrStroad}.</p>

{/if}
{/if}
{/if} -->

<br>

<h2>Notes</h2>

<ol>
  <li>This tool does <b>NOT</b> account for any other services your local municipality may offer/maintain, such as:</li>
    <ul>
      <li>other streets/roads</li>
      <li>education</li>
      <li>police</li>
      <li>fire</li>
      <li>water</li>
      <li>sewer</li>
      <li>health services</li>
      <li>housing services</li>
      <li>power</li>
      <li>internet</li>
      <li>public transit</li>
      <li>parks</li>
      <li>waste</li>
    </ul>
  <li>The current cost being used is ${costsPerLaneMile.toLocaleString()} per lane-mile. This will automatically adjust for inflation over time.</li>
  <li>An inflation rate of 2% per year was assumed for future costs and taxes.</li>
  <li>If you have any questions or would like to offer any suggestions, please <a href="mailto:aaron@aarosmit.com">email me</a>!</li>
</ol>

<style>

/* h1 {
    text-align: center;
} */

input {
    width: 6em;
    font-size: 1em;
}

select {
    font-size: 1em;
}

#svg {
  max-width: 300px;
  height: 300px;
  margin-left: auto;
  margin-right: auto;
  font-family: sans-serif;
}

</style>