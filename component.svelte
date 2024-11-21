<script lang="ts">
	let { submit, items }: { submit: Function; items: string[] } = $props();

	function strip_task(task: string): string {
		const regex = /^\s*- \[ \] (.*)/;
		const match = task.match(regex);
		if (match) {
			return match[1];
		} else {
			return task;
		}
	}

	const item_objects = items.map((item, index) => ({
		display: strip_task(item),
		val: item,
		id: index.toString(),
	}));

	let selected = $state([]);
	let focused_index = $state(-1);

	const checkboxes = Array(item_objects.length);

	function keydownNav(e: KeyboardEvent) {
		if (e.key == "j") {
			let next_index =
				focused_index === item_objects.length - 1
					? 0
					: focused_index + 1;
			checkboxes[next_index].focus();
		} else if (e.key == "k") {
			let next_index =
				focused_index <= 0
					? item_objects.length - 1
					: focused_index - 1;
			checkboxes[next_index].focus();
		}
	}
</script>

<div onkeydown={keydownNav}>
	<ul>
		{#each item_objects as item, index}
			<li>
				<input
					bind:this={checkboxes[index]}
					onfocusin={() => (focused_index = index)}
					id={item.id}
					type="checkbox"
					class="sr-only"
					name="items"
					value={item.val}
					bind:group={selected}
				/>
				<label for={item.id}>
					{item.display}
				</label>
			</li>
		{/each}
	</ul>
	<button
		onclick={() => submit(selected)}
		onfocusin={() => (focused_index = item_objects.length)}>Submit</button
	>
</div>

<style>
	label {
		display: block;
		padding: 0.5rem;
	}

	li {
		border-radius: 3px;
		margin: 0.25rem;
	}

	li:focus-within {
		border: blue 1px solid;
	}

	li:has(input:checked) {
		background: #dce7f1;
	}

	.sr-only {
		position: absolute;
		left: -10000px;
		top: auto;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}

	ul {
		list-style: none;
		padding: 0;
	}
</style>
