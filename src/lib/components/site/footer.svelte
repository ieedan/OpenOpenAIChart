<script lang="ts">
	import * as Icons from '$lib/components/icons';
	import { Button } from '../ui/button';
</script>

<footer
	class="sticky bottom-0 flex h-16 w-full place-items-center justify-center border-t border-border"
>
	<div class="w-full max-w-[804px]">
		<div class="flex place-items-center justify-end gap-2">
			<Button href="https://x.com/ieeeedan" target="_blank" variant="ghost" size="icon">
				<Icons.Twitter />
			</Button>
			<Button href="https://github.com/ieedan" target="_blank" variant="ghost" size="icon">
				<Icons.GitHub />
			</Button>
		</div>
	</div>
</footer>
