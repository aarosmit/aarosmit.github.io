<svelte:head>
    <title>Where</title> 
</svelte:head>

<svelte:options runes={false} />

<script module>

import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
maplibregl.setWorkerUrl(maplibreWorkerUrl);

</script>

<script>

  import { MapLibre } from 'svelte-maplibre';
  import GeoJSON from 'svelte-maplibre/GeoJSON.svelte';
  import LineLayer from 'svelte-maplibre/LineLayer.svelte';
  import Marker from 'svelte-maplibre/Marker.svelte';
  import DefaultMarker from 'svelte-maplibre/DefaultMarker.svelte';

import { LineChart, defaultChartPadding } from 'layerchart';
// import { createDateSeries } from '$lib/utils/data.js';

import PocketBase from 'pocketbase';
import { onMount, onDestroy, tick } from 'svelte';
// import { useSwipe } from 'svelte-gestures';

import DaySearch from '$lib/components/DaySearch.svelte';
// import Login from '$lib/components/Login.svelte';

const pb = new PocketBase('https://db.aarosmit.com');

$: password = null;
$: authData = null;
$: error = null;


$: now = new Date() * 1 / 1000
$: oneDayAgo = (new Date() * 1 - 86400000) / 1000
$: oneWeekAgo = (new Date() * 1 - 86400000 * 7) / 1000
let endOfToday = new Date(new Date(new Date().toDateString()) * 1 + 86399000)

$: endString = new Date().toISOString().split('T')[0]
$: startString = new Date(new Date() * 1 - 86400000 * 7).toISOString().split('T')[0]

$: start = new Date(startString) / 1000 + new Date().getTimezoneOffset() * 60
$: end = new Date(endString) / 1000 + 86400 + new Date().getTimezoneOffset() * 60

async function login () {
    try {
        authData = await pb.collection("users").authWithPassword('aaron', password);
        error = null;
    } catch (err) {
        error = err.message
        console.log(err.message)
        }

    // console.log(authData)

    // console.log(pb.authStore.isValid);
    // console.log(pb.authStore.token);
    // console.log(pb.authStore.record.id);
}

onMount(async () => {

    if (pb.authStore.isValid) {
        authData = true
    }

})

// let data = $state(null)

$: data = {
    type: 'Feature',
    properties: {
        name: 'Test'
    },
    geometry: {
        type: 'MultiPoint',
        coordinates: []
    }
}

$: pointData = []

$: minLat = 1000
$: maxLat = -1000
$: minLon = 1000
$: maxLon = -1000

$: dataBounds = []

async function getGPSData (startDate, endDate) {
    let resultList = await pb.collection('gps').getFullList({
        filter: `tst >= "${startDate}" && tst <= "${endDate}"`,
        sort: "tst"
    });
    data.geometry.coordinates = []
    minLat = 1000
    maxLat = -1000
    minLon = 1000
    maxLon = -1000
    for (let i = 0; i < resultList.length; i++) {
        resultList[i].date = new Date(resultList[i].tst * 1000)
        resultList[i].value = resultList[i].alt * 3.28084
        data.geometry.coordinates.push([resultList[i].lon, resultList[i].lat])
        if (resultList[i].lat < minLat) {
          minLat = resultList[i].lat
        }
        if (resultList[i].lat > maxLat) {
          maxLat = resultList[i].lat
        }
        if (resultList[i].lon < minLon) {
          minLon = resultList[i].lon
        }
        if (resultList[i].lon > maxLon) {
          maxLon = resultList[i].lon
        }

        pointData.push({
          lngLat: [resultList[i].lon, resultList[i].lat],
          label: 'asdf',
          name: 'asdf'
        })

    }

    console.log(pointData)

    dataBounds[0] = minLon - 0.1
    dataBounds[1] = minLat - 0.1
    dataBounds[2] = maxLon + 0.1
    dataBounds[3] = maxLat + 0.1
    
    // data = resultList
    // console.log(data)
}

</script>

{#if !authData}

<!-- LOGIN -->

<div style="text-align:center;position:absolute;bottom:10%;">
  <div style="max-width:50rem;">
    <p>{error}</p>
    <input style="background-color:#e9e9ed;border:none;font-size:1em;border:none;border-radius:5px;" type="password" bind:value={password}>
    <br><br>
    <button style="padding:0.5em;padding-left:1em;padding-right:1em;font-size:1.2em;border:none;border-radius:5px;" onclick={() => login()}>LOGIN</button>
  </div>
</div>

<!-- <Login password={password} error={error} login={login} /> -->

{:else}

<!-- <input type="button" value="UPDATE" onclick={() => getGPSData(start, end)}> -->

{#await getGPSData(start, end)}

<p>Loading map</p>
    
{:then} 

<p></p>

<div style="max-width:50rem;">
<MapLibre
  center={[-85.3125499,35.0468944]}
  zoom={7}
  class="map"
  standardControls
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  bounds={[minLon - 0.05, minLat - 0.05, maxLon + 0.05, maxLat + 0.05]}
>
 <GeoJSON id="test" {data}>
    <!-- <LineLayer
      layout={{ 'line-cap': 'round', 'line-join': 'round' }}
      paint={{
        'line-width': 5,
        'line-color': '#008800',
        'line-opacity': 0.8,
      }}
    /> -->
 </GeoJSON>
  {#each pointData as {lngLat}}
    <Marker
      {lngLat}
      class="asdf"
    >
    </Marker>
  {/each}
</MapLibre>

</div>
    
{/await}

<p>

Start <input type="date" bind:value={startString}>

End <input type="date" bind:value={endString}>

</p>

<!-- <div>

    <LineChart {data} x="date" y="value" padding={defaultChartPadding({ right: 10 })} height={300}/>
</div> -->



{/if}


<style>
    :global(.map) {
        height: 90vh;
        width: 100%;
    }

    :global(.asdf) {
        display: grid;
        height: 0.5rem;       /* h-8 (32px) */
        width: 0.5rem;        /* w-8 (32px) */
        place-items: center; /* place-items-center */
        border-radius: 9999px; /* rounded-full */
        border-width: 0px;  /* border */
        border-style: solid;
        background-color: #7189ea; /* bg-red-300 */
        color: #000000;     /* text-black */
    }
</style>

