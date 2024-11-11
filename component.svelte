<script lang="ts">
	const items = ["Hello", "All you people", "what", "are"];

	let selected = $state([]);
</script>

<div>
	{#each items as item}
		<label style="display: block;">
			<input
				type="checkbox"
				name="items"
				value={item}
				bind:group={selected}
			/>
			{item}
		</label>
	{/each}
</div>
