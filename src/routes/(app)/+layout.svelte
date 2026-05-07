<script>
	import favicon from '$lib/assets/favicon.png';
	import { base } from '$app/paths';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style>

body {
	overflow:hidden; 
}

a {
	color: #000000;
}

a:hover {
	color: #00000067;
}

</style>