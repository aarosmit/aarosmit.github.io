<svelte:head>
    <title>Footballs</title> 
</svelte:head>

<script>
    import { onMount } from "svelte";


onMount(async () => {
    const response = await fetch("https://api.sleeper.app/v1/league/1389296169221386240/matchups/3")
    const data = await response.json();

    console.log(data)
})

</script>