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

:global(body) {
	/* overflow:hidden;  */
	/* background-color: #1d3040;
	color: white; */
}

:global(body.darkmode) {
	/* overflow:hidden;  */
	background-color: #1d3040;
}

a {
	color: #000000;
}

a:hover {
	color: #00000067;
}

</style>