import type { HTMLAttributes } from 'svelte/elements';
import GitHub from './github.svelte';
import Twitter from './twitter.svelte';

export interface Props extends HTMLAttributes<SVGElement> {
	class?: string;
	width?: number;
	height?: number;
}

export { GitHub, Twitter };
