<script lang="ts">
	let { submit, items }: { submit: Function; items: string[] } = $props();

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
	<button onclick={() => submit(selected)}>Submit</button>
</div>
