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
  import CircleLayer from 'svelte-maplibre/CircleLayer.svelte';

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

$: showAltitude = false

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

// $: data = {
//     type: 'Feature',
//     properties: {
//         name: 'Test'
//     },
//     geometry: {
//         type: 'MultiPoint',
//         coordinates: []
//     }
// }

$: pointData = []

$: minLat = 1000
$: maxLat = -1000
$: minLon = 1000
$: maxLon = -1000

$: dataBounds = []

$: data = {
  "type": "FeatureCollection",
  "features": []
}

$: altitudeData = []

$: accuracyData = []

$: console.log(start, end, data)

async function getGPSData (startDate, endDate) {
    data = {
      "type": "FeatureCollection",
      "features": []
    }
    altitudeData = []
    accuracyData = []
    let resultList = await pb.collection('gps').getFullList({
        filter: `tst >= "${startDate}" && tst <= "${endDate}"`,
        sort: "tst"
    });
    console.log(resultList)
    minLat = 1000
    maxLat = -1000
    minLon = 1000
    maxLon = -1000
    for (let i = 0; i < resultList.length; i++) {
        resultList[i].date = new Date(resultList[i].tst * 1000).toISOString()
        resultList[i].alt = resultList[i].alt * 3.28084

        if (resultList[i].alt < 0) {
          continue
        } else {
          altitudeData.push({
            date: resultList[i].date,
            value: Math.round(resultList[i].alt)
          })
        }

        accuracyData.push({
          date: resultList[i].date,
          value: resultList[i].acc
        })

        data.features.push({
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [resultList[i].lon, resultList[i].lat]
          },
          "properties": {
            "name": new Date(resultList[i].tst * 1000).toLocaleString()
          }
        })

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
          label: new Date(resultList[i].tst * 1000).toLocaleString(),
          name: 'asdf'
        })

    }

    dataBounds[0] = minLon - 0.1
    dataBounds[1] = minLat - 0.1
    dataBounds[2] = maxLon + 0.1
    dataBounds[3] = maxLat + 0.1
    
    // data = resultList
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
    <CircleLayer
			paint={{
				'circle-radius': 5,
				'circle-color': "#7189ea",
				'circle-stroke-width': 0,
				'circle-stroke-color': '#ffffff'
			}} 
    />
 </GeoJSON>
  <!-- {#each pointData as {lngLat, label}}
    <Marker
      {lngLat}
      class="asdf"
      color="red"
    >
    </Marker>
    <DefaultMarker {lngLat}>

    </DefaultMarker>
  {/each} -->
</MapLibre>

{#if showAltitude}

<div>

    <LineChart data={altitudeData} x="date" y="value" padding={defaultChartPadding({ right: 10 })} height={300}/>
</div>

{/if}

</div>
    
{/await}

<p>

Start <input type="date" bind:value={startString}>

End <input type="date" bind:value={endString}>

</p>

{#if !showAltitude}

<button onclick={() => showAltitude = true}>Show altitude</button>

{:else}

<button onclick={() => showAltitude = false}>Hide altitude</button>

{/if}

<br>





{/if}


<style>
    :global(.map) {
        height: 80vh;
        width: 100%;
    }

    :global(.asdf) {
        display: grid;
        height: 0.5rem;
        width: 0.5rem;
        place-items: center;
        border-radius: 9999px;
        border-width: 0px;
        border-style: solid;
        /* background-color: #7189ea; */
        color: #000000;
    }
</style>

