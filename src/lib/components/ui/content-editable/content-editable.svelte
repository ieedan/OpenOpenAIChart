<script lang="ts" generics="TagName extends keyof HTMLElementTagNameMap">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type Element = HTMLAttributes<HTMLElementTagNameMap[TagName]>;

	type Props = {
		this: TagName;
		content: string;
	} & Omit<Element, 'children'>;

	let { content = $bindable(''), this: tagName, class: className, ...rest }: Props = $props();
</script>

<svelte:element
	this={tagName}
	onblur={(e: any) => {
		content = e.currentTarget.innerText;
	}}
	class={cn('outline-none', className)}
	contenteditable="true"
	{...rest as any}
>
	{content}
</svelte:element>
