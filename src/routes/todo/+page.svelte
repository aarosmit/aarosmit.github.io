<svelte:head>
    <title>Todo</title> 
</svelte:head>

<script>

import PocketBase from 'pocketbase';

const pb = new PocketBase('https://db.aarosmit.com');

let authData;
let password;
let error;

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

</script>

{#if !authData}

<input type="password" bind:value={password}>
<button on:click={login}>LOGIN</button>

{/if}

{#if authData}

<p>Testing!</p>

{/if}

{#if error}

<p>{error}</p>

{/if}