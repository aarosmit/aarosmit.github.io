<svelte:head>
    <title>{title}</title>
    <meta charset="UTF-8">
    <meta name="description" content={title}>
    <meta name="keywords" content="astronomy, milky way, astrophotography">
</svelte:head>

<script>

import { base } from '$app/paths';

const title = "Milky times";

// IMPORTING PACKAGES USED IN THE 'MILKY' CODE
import { SearchMoonQuarter, NextMoonQuarter, Observer, SearchRiseSet, Horizon, MakeTime, Equator } from 'astronomy-engine';
import tzlookup from 'tz-lookup';
import { DateTime } from 'luxon';
import highcharts from '$lib/js/highcharts.js';

let coreRA = 17 + 45 / 60 + 40.04 / 3600;
let coreDec = -29 - 0 / 60 - 28.1 / 3600;

let startDateStr = DateTime.fromJSDate(new Date).toISODate();
// $: startDate = MakeTime((new Date(startDateStr)));
// $: startDateChart = startDate.date * 1;
let tzOffset = 0;
let coords = '';
let period = 3;
// let observer = new Observer(35, -85, 0);
let times = [];
let milkyAlts = [];
let sunAlts = [];
let moonAlts = [];
let milkyOnly = [];
let weather = false;
let clouds = 'OFF';

$: startDate = MakeTime(new Date(startDateStr));
// $: console.log(startDate.date * 1)

function makeWeatherChart (period, startDate, coords, tzOffset, weatherPromise) {

times = [];
milkyAlts = [];
sunAlts = [];
moonAlts = [];
milkyOnly = [];

let lat = coords.substring(0, coords.indexOf(',')) * 1 ?? 0;
let long = coords.substring(coords.indexOf(',') + 1, coords.length) * 1 ?? 0;

if (lat > -90 && lat < 90 && long > -180 && long < 180) {

// let lat = coords.substring(0, coords.indexOf(',')) * 1 ?? 0;
// let long = coords.substring(coords.indexOf(',') + 1, coords.length) * 1 ?? 0;
let observer = new Observer(lat, long, 0);
tzOffset = DateTime.fromJSDate(startDate.date).setZone(tzlookup(lat, long)).o;
// startDateChart = startDate.date * 1 + tzOffset * 60 * 1000;

for (let i = 0; i < 24 * 4 * period; i++) {
  let time = MakeTime(startDate.tt + i / (24 * 4));  let milkyAlt = Math.trunc(Horizon(time, observer, coreRA, coreDec, 'normal').altitude * 10) / 10;
  let sunRADec = Equator('Sun', time, observer, true, true);
  let moonRADec = Equator('Moon', time, observer, true, true);
  times.push(time);
  milkyAlts.push([milkyAlt]);
  sunAlts.push([Math.trunc(Horizon(time, observer, sunRADec.ra, sunRADec.dec, 'normal').altitude * 10) / 10]);
  moonAlts.push([Math.trunc(Horizon(time, observer, moonRADec.ra, moonRADec.dec, 'normal').altitude * 10) / 10]);
  // if (milkyAlt > 0) {
  //   milkyOnly.push([0, milkyAlt]);
  // } else {
  //   milkyOnly.push([0, 0])
  // }
}
};


let configWeather = {
  title: {
    text: undefined
  },
  series: [{
    type: 'area',
    name: 'temp',
    data: weatherPromise.hourlyTemp,
    color: '#f6bd60',
    marker: {
      enabled: false
    },
    yAxis: 1
  },{
    type: 'area',
    name: 'clouds',
    data: weatherPromise.hourlyClouds,
    color: '#cfdbd5',
    marker: {
      enabled: false
    },
    yAxis: 1
  },{
    type: 'area',
    name: 'rain',
    data: weatherPromise.hourlyRain,
    color: '#7189ea',
    marker: {
      enabled: false
    },
    yAxis: 1
  },{
    name: 'milky',
    data: milkyAlts,
    marker: {
      enabled: false
    },
    yAxis: 0
  },{
    name: 'sun',
    data: sunAlts,
    color: 'orange',
    marker: {
      enabled: false
    },
    yAxis: 0
  },{
    name: 'moon',
    data: moonAlts,
    color: 'gray',
    marker: {
      enabled: false
    },
    yAxis: 0
  }
  // },{
  //   name: 'milky-up',
  //   data: milkyOnly,
  //   color: '#7cb5ec',
  //   opacity: 0.5,
  //   type: 'arearange',
  //   marker: {
  //     enabled: false
  //   }
  ],
  xAxis: {
    type: 'datetime',
  },
  yAxis: [{
    title: {
      text: `Altitude (${String.fromCharCode(176)})`
    },
    height: '50%',
    min: 0
  },{
    title: {
      text: `Temp (${String.fromCharCode(176)}F) / %`
    },
    opposite: true,
    max: 100,
    height: '50%',
    top: '50%'
  }],
  time: {
    timezoneOffset: tzOffset * -1
  },
  plotOptions: {
    series: {
      pointStart: startDate.date * 1,
      pointInterval: 1000 * 60 * 15
    }
  },
  tooltip: {
    shared: true
  },
  responsive: {
    rules: [{
      condition: {
        maxWidth: 500
      },
      chartOptions: {
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom'
        }
      }
    }]
  }
}
return configWeather;
};

function makeChart (period, startDate, coords, tzOffset) {

times = [];
milkyAlts = [];
sunAlts = [];
moonAlts = [];
milkyOnly = [];

let lat = coords.substring(0, coords.indexOf(',')) * 1 ?? 0;
let long = coords.substring(coords.indexOf(',') + 1, coords.length) * 1 ?? 0;

if (lat > -90 && lat < 90 && long > -180 && long < 180) {

// let lat = coords.substring(0, coords.indexOf(',')) * 1 ?? 0;
// let long = coords.substring(coords.indexOf(',') + 1, coords.length) * 1 ?? 0;
let observer = new Observer(lat, long, 0);
tzOffset = DateTime.fromJSDate(startDate.date).setZone(tzlookup(lat, long)).o;
// startDateChart = startDate.date * 1 + tzOffset * 60 * 1000;

for (let i = 0; i < 24 * 4 * period; i++) {
  let time = MakeTime(startDate.tt + i / (24 * 4));  let milkyAlt = Math.trunc(Horizon(time, observer, coreRA, coreDec, 'normal').altitude * 10) / 10;
  let sunRADec = Equator('Sun', time, observer, true, true);
  let moonRADec = Equator('Moon', time, observer, true, true);
  times.push(time);
  milkyAlts.push([milkyAlt]);
  sunAlts.push([Math.trunc(Horizon(time, observer, sunRADec.ra, sunRADec.dec, 'normal').altitude * 10) / 10]);
  moonAlts.push([Math.trunc(Horizon(time, observer, moonRADec.ra, moonRADec.dec, 'normal').altitude * 10) / 10]);
  // if (milkyAlt > 0) {
  //   milkyOnly.push([0, milkyAlt]);
  // } else {
  //   milkyOnly.push([0, 0])
  // }
}
};


let config = {
  title: {
    text: undefined
  },
  series: [{
    name: 'milky',
    data: milkyAlts,
    marker: {
      enabled: false
    }
  },{
    name: 'sun',
    data: sunAlts,
    color: 'orange',
    marker: {
      enabled: false
    }
  },{
    name: 'moon',
    data: moonAlts,
    color: 'gray',
    marker: {
      enabled: false
    }
  }
  // },{
  //   name: 'milky-up',
  //   data: milkyOnly,
  //   color: '#7cb5ec',
  //   opacity: 0.5,
  //   type: 'arearange',
  //   marker: {
  //     enabled: false
  //   }
  ],
  xAxis: {
    type: 'datetime',
  },
  yAxis: {
    title: {
      text: `Altitude (${String.fromCharCode(176)})`
    },
    max: 90
  },
  time: {
    timezoneOffset: tzOffset * -1
  },
  plotOptions: {
    series: {
      pointStart: startDate.date * 1,
      pointInterval: 1000 * 60 * 15
    }
  },
  tooltip: {
    shared: true
  },
  responsive: {
    rules: [{
      condition: {
        maxWidth: 500
      },
      chartOptions: {
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom'
        }
      }
    }]
  }
}
return config;
};

async function getData(coords) {
  let lat = coords.substring(0, coords.indexOf(',')) * 1 ?? 0;
  let long = coords.substring(coords.indexOf(',') + 1, coords.length) * 1 ?? 0;

  const response = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${long}&appid=e22b98fa4c61a6221b2b969d7751e14c&units=imperial`)
  const data = await response.json();
    if (response.ok) {
      data.hourlyClouds = [];
      data.hourlyRain = [];
      data.hourlyTemp = [];
      for (let i = 0; i < data.hourly.length; i++) {
        data.hourlyClouds.push([data.hourly[i].dt * 1000, Math.round(data.hourly[i].clouds)])
        data.hourlyRain.push([data.hourly[i].dt * 1000, Math.round(data.hourly[i].pop * 100)])
        data.hourlyTemp.push([data.hourly[i].dt * 1000, Math.round(data.hourly[i].feels_like)])
      }
      return data;
    } else {
      throw new Error('Could not get weather or there are no API calls remaining.');
    }
}

function toggleWeather() {
  if (weather) {
    weather = false;
  } else {
    weather = true;
  }
}

$: weatherPromise = getData(coords);
// console.log(weatherPromise.hourlyClouds)

</script>

<h1>{title}</h1>

<div class="info">

<form method="GET">

<div>For <input name="days" type=number bind:value={period}> day(s) on <input name="date"  type=date bind:value={startDateStr}> at <input name="coords"  bind:value={coords} placeholder='XX.XXX,-YY.YYY'>  <button>Get URL</button></div>

<b>48-hr forecast</b> <input id="clouds" type="checkbox" on:click={toggleWeather}>

</form>

</div>
{#if weather}

{#await weatherPromise}
{:then data}
<div class="chart" use:highcharts={makeWeatherChart(period, startDate, coords, tzOffset, data)}></div>
{:catch error}
<div id="error">{error.message}</div>
{/await}
{:else} 
<div class="chart" use:highcharts={makeChart(period, startDate, coords, tzOffset)}></div>
{/if}

<!-- {#await weatherPromise}

{:then data}
<div class="chart" use:highcharts={data}></div>

{:catch error}

<p>{error.message}</p>

{/await} -->

<h2>Notes</h2>

<ol>
<li>This tool helps pinpoint the best times to view the Milky Way by showing altitudes for the sun, moon, and Milky Way in 15-minute intervals.</li>
<li>It can show an hourly weather forecast for the location over the next 48 hours, sourced from <a href="https://openweathermap.org/">OpenWeatherMap</a>, assuming I have enough API calls left for the day.</li>
<li>Prior to this, the <a href="{base}/milkydates">MILKY DATES</a> tool can be used to get a set of dates for best viewing the milky way.</li>
<li>The chart will automatically correct for any timezone by pushing the chart start time forward or backward the proper hourly offset from UTC.</li>
</ol>

<h2>Issues</h2>

<ol>
<li>The data will update after changing any one of the fields, but in order to update the date label on the x-axis of the chart the "number of days" field must be changed for some reason.</li>
<li>If you encounter an issue or have a question, please <a href="mailto:aaron@aarosmit.com">email me</a>.</li>
</ol>

<style>

.info {
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}
#error {
  text-align: center;
  color: '#e1515a';
  font-family: 'Poppins';
}

</style>