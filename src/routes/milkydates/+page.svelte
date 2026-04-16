<svelte:head>
    <title>{title}</title>
    <meta charset="UTF-8">
    <meta name="description" content={title}>
    <meta name="keywords" content="astronomy, milky way, astrophotography">
</svelte:head>

<script>

import { base } from '$app/paths';

const title = "Milky dates"

// IMPORTING PACKAGES USED IN THE 'MILKY' CODE
import { SearchMoonQuarter, NextMoonQuarter, Observer, SearchRiseSet, Horizon, MakeTime, Equator } from 'astronomy-engine';
import tzlookup from 'tz-lookup';
import { DateTime } from 'luxon';
// import ImageButton from '$lib/components/ImageButton.svelte';

// DEFINING SOME VARIABLES
let firstMoon = SearchMoonQuarter(new Date());
let moonPhases = [firstMoon];
// console.log(moonPhases);
let allData = [];
let coords = '';

$: lat = coords.substring(0, coords.indexOf(',')) * 1;
$: long = coords.substring(coords.indexOf(',') + 1, coords.length) * 1;

// lat = lat ?? 0;
// long = long ?? 0;

let observer = new Observer(0, 0, 0);
let coreRA = 17 + 45 / 60 + 40.04 / 3600;
let coreDec = -29 - 0 / 60 - 28.1 / 3600;
let queryTZ = tzlookup(0, 0);

// VERIFYING THAT THE COORDINATE INPUTTED IS A NUMBER
// $: if (typeof lat === 'number' && typeof long === 'number') {
$: if (lat > -90 && lat < 90 && long > -180 && long < 180) {
  observer = new Observer(lat, long, 0);
  queryTZ = tzlookup(lat, long);

// FINDING MOON PHASES OVER THE NEXT FOUR YEARS, THEN FILTERING ONLY NEW MOONS
let j = 0;
for (let i = 1; i < 97; i++) {
  moonPhases.push(NextMoonQuarter(moonPhases[i - 1]));
  // FILTERING ONLY NEW MOONS
  if (moonPhases[i].quarter === 0) {
      allData[j] = {}
      // USING 'LUXON' TO DETERMINE THE TIMEZONE OFFSET OF THE QUERY
      allData[j].tzOffset = DateTime.fromJSDate(moonPhases[i].time.date).setZone(queryTZ).o / 60,
      // CALCULATING MIDNIGHT ON THE DATE OF THE NEW MOON TO USE IN CALCULATIONS FOR SUN, MOON, AND MILKY WAY LATER ON
      allData[j].newMoonDate = MakeTime(Math.trunc(moonPhases[i].time.tt) + 0.5 - DateTime.fromJSDate(moonPhases[i].time.date).setZone(queryTZ).o / 60 / 24)
      j++;
  }
}

// ADDING DATA TO THE ALL-ENCOMPASSING 'allData' OBJECT
for (let i = 0; i < 24; i++) {
  allData[i].sunRiseTime = SearchRiseSet('Sun', observer, 1, allData[i].newMoonDate, 1);
  allData[i].sunSetTime = SearchRiseSet('Sun', observer, -1, allData[i].newMoonDate, 1);
  allData[i].moonRiseTime = SearchRiseSet('Moon', observer, 1, allData[i].newMoonDate, 1);
  allData[i].moonSetTime = SearchRiseSet('Moon', observer, -1, allData[i].newMoonDate, 1);
  allData[i].milkyTimes = [allData[i].newMoonDate.tt];
  allData[i].milkyData = [Horizon(allData[i].newMoonDate.tt, observer, coreRA, coreDec, 'normal')];
  for (let j = 1; j < 25; j++) {
    allData[i].milkyTimes.push(allData[i].newMoonDate.tt + (j / 24))
    allData[i].milkyData.push(Horizon(allData[i].milkyTimes[j], observer, coreRA, coreDec, 'normal'))
    if (allData[i].milkyData[j - 1].altitude / allData[i].milkyData[j].altitude < 0) {
      if (allData[i].milkyData[j - 1].altitude < 0) {
        allData[i].milkyRise = MakeTime(interpolate(allData[i].milkyData[j - 1].altitude, allData[i].milkyData[j].altitude) / 24 + (j - 1) / 24 + allData[i].newMoonDate.tt);
      } else if (allData[i].milkyData[j - 1].altitude > 0) {
        allData[i].milkySet = MakeTime(interpolate(allData[i].milkyData[j - 1].altitude, allData[i].milkyData[j].altitude) / 24 + (j - 1) / 24 + allData[i].newMoonDate.tt);
      }
    }
  };
  if (allData[i].milkySet.tt > allData[i].milkyRise.tt) {
    allData[i].milkyMaxTime = MakeTime((allData[i].milkySet.tt - allData[i].milkyRise.tt) / 2 + allData[i].milkyRise.tt);
  } else {
    allData[i].milkyMaxTime = MakeTime((1 - (allData[i].milkyRise.tt - allData[i].milkySet.tt)) / 2 + allData[i].milkyRise.tt);
  }
}
}

function interpolate (first, second) {
	return ((0 - first) / (second - first)) * 1
};

</script>


<h1>{title}</h1>

<div class='inputs'>
<form method="GET">
    <input name="coords" bind:value={coords} placeholder='XX.XXX,-YY.YYY'> <button>Get link</button>
</form>
<!-- <input type=number bind:value={lat} min=-90 max=90 placeholder='XX.XXX'>
<input type=number bind:value={long} min=-180 max=180 placeholder='-YY.YYY'> -->
</div>

{#if lat > -90 && lat < 90 && long > -180 && long < 180}

<p class='info'>At coordinates <b>{lat},{long}</b>: the milky way rises at an azimuth of {Math.trunc(Horizon(allData[0].milkyRise, observer, coreRA, coreDec, 'normal').azimuth) + String.fromCharCode(176)}, sets at an azimuth of {Math.trunc(Horizon(allData[0].milkySet, observer, coreRA, coreDec, 'normal').azimuth) + String.fromCharCode(176)}, and <b>rises to an altitude of {Math.trunc(Horizon(allData[0].milkyMaxTime, observer, coreRA, coreDec, 'normal').altitude) + String.fromCharCode(176)}</b>.</p>


<table class='milkydata'>
<thead>
  <tr>
  <th>date-new-moon</th>
  <th>sun</th>
  <th>milky</th>
  <th>milky-max</th>
  <!-- <th>tz-offset</th> -->
  </tr>
</thead>
<tbody>
{#each allData as data}
{#if data.milkyMaxTime.tt < data.sunSetTime.tt && data.milkyMaxTime.tt > data.sunRiseTime.tt}
  <tr>
    <td>{DateTime.fromJSDate(data.newMoonDate.date).setZone(queryTZ).toFormat("ccc LLL dd yyyy")}</td>
    <td>{DateTime.fromJSDate(data.sunRiseTime.date).setZone(queryTZ).toLocaleString(DateTime.TIME_24_SIMPLE) + "-" + DateTime.fromJSDate(data.sunSetTime.date).setZone(queryTZ).toLocaleString(DateTime.TIME_24_SIMPLE)}</td>
    <td>{DateTime.fromJSDate(data.milkyRise.date).setZone(queryTZ).toLocaleString(DateTime.TIME_24_SIMPLE) + "-" + DateTime.fromJSDate(data.milkySet.date).setZone(queryTZ).toLocaleString(DateTime.TIME_24_SIMPLE)}</td>
    <td>{DateTime.fromJSDate(data.milkyMaxTime.date).setZone(queryTZ).toLocaleString(DateTime.TIME_24_SIMPLE)}</td>
  </tr>
{:else}
  <tr class="best">
  <td>{DateTime.fromJSDate(data.newMoonDate.date).setZone(queryTZ).toFormat("ccc LLL dd yyyy")}</td>
  <td class='best'>{DateTime.fromJSDate(data.sunRiseTime.date).setZone(queryTZ).toLocaleString(DateTime.TIME_24_SIMPLE) + "-" + DateTime.fromJSDate(data.sunSetTime.date).setZone(queryTZ).toLocaleString(DateTime.TIME_24_SIMPLE)}</td>
  <td>{DateTime.fromJSDate(data.milkyRise.date).setZone(queryTZ).toLocaleString(DateTime.TIME_24_SIMPLE) + "-" + DateTime.fromJSDate(data.milkySet.date).setZone(queryTZ).toLocaleString(DateTime.TIME_24_SIMPLE)}</td>
  <td>{DateTime.fromJSDate(data.milkyMaxTime.date).setZone(queryTZ).toLocaleString(DateTime.TIME_24_SIMPLE)}</td>
</tr>
{/if}
{/each}
</tbody>
</table>

<p class='info'>Timezone: {queryTZ}</p>

{:else}

<h3>Please input valid coordinates</h3>

{/if}

<h2>Notes</h2>

<ol>
<li>Created using <a href="https://www.npmjs.com/package/astronomy-engine">Astronomy Engine</a>, <a href="https://www.npmjs.com/package/tz-lookup">tz-lookup</a>, and <a href="https://www.npmjs.com/package/luxon">Luxon</a>.</li>
<li>All times shown are local to the query.</li>
<li>The <a style="color:#e1515a">**bold and red**</a> rows indicate the best new moons to possibly view the milky way.</li>
<li>After choosing the best dates, you can use <a href="{base}/milkytimes">MILKY TIMES</a> to pinpoint the best times to view the milky way.</li>
</ol>

<!-- <h2>Photos</h2>

[Two Hearted River Campground](https://goo.gl/maps/6QVS7mCEoEVm8zUg6) in August of 2020 <ImageButton link="https://file.aarosmit.com/file/aarosmit-site/media/two-hearted-milky-way.jpg" alt="Milky Way at Two Hearted River Campground" />

[Tater Knob Fire Tower](https://goo.gl/maps/Zdh7FGMBe6LPyCE58) in April of 2018 <ImageButton link="https://file.aarosmit.com/file/aarosmit-site/media/tater-knob-milky-way.jpg" alt="Milky Way at Tater Knob Fire Tower" />

[Cedar Creek Lake](https://goo.gl/maps/5KurHojgFZqE2Dqo8) in June of 2017 <ImageButton link="https://file.aarosmit.com/file/aarosmit-site/media/milky-way-lake.jpg" alt="Milky Way at Cedar Creek Lake" /> -->


<style>

h3 {
  text-align: center;
  color: #e1515a;
}

.inputs {
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

input {
  text-align: center;
}

.info {
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  width: 75%;
}

.milkydata {
    font-family: 'Source Code Pro'; 
    text-align: center; 
    margin-left: auto; 
    margin-right: auto;
    font-size: 0.9rem;
}

.best {
  color: #e1515a;
  font-weight: bold;
}

th, td {
  padding-left: 7px;
  padding-right: 7px;
}

/* th {
  border-bottom-style: solid;
  border-bottom-width: 1px;
} */

img {
  max-width: 100%;
}

</style>