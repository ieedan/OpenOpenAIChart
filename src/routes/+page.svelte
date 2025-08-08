<script lang="ts">
	import { ContentEditable } from '$lib/components/ui/content-editable';
	import { cn } from '$lib/utils';
	import { PersistedState } from 'runed';

	type ChartConfig = {
		title: string;
		subtitle: string;
		yAxisLabel: string;
		nonPromotedSeriesColor: string;
		categories: {
			label: string;
			color: string;
		}[];
		series: {
			label: string;
			data: {
				allegedData: string;
				bullshitHeight: number;
			}[];
		}[];
	};

	const chartConfig = new PersistedState<ChartConfig>('chart-config', {
		title: 'Developer Productivity',
		subtitle: 'Productivity across different teams',
		yAxisLabel: '# Tickets Completed / Week',
		categories: [
			{
				label: 'At Work',
				color: '#E89ACC'
			},
			{
				label: 'At Home',
				color: '#EFC2D1'
			}
		],
		nonPromotedSeriesColor: '#ffffff',
		series: [
			{
				label: 'Me',
				data: [
					{
						allegedData: '0',
						bullshitHeight: 90
					},
					{
						allegedData: '0',
						bullshitHeight: 70
					}
				]
			},
			{
				label: 'External Contractors',
				data: [
					{
						allegedData: '50',
						bullshitHeight: 30
					}
				]
			},
			{
				label: 'Dev Team',
				data: [
					{
						allegedData: '20',
						bullshitHeight: 30
					}
				]
			}
		]
	});
</script>

<main class="flex h-svh items-center justify-center">
	<div class="flex flex-col gap-8">
		<div class="flex flex-col gap-2">
			<div>
				<ContentEditable
					this="h1"
					bind:content={chartConfig.current.title}
					class="text-2xl font-medium"
				/>
				<ContentEditable this="p" bind:content={chartConfig.current.subtitle} class="text-sm" />
			</div>
			<!-- legend -->
			<div class="flex place-items-center gap-4">
				{#each chartConfig.current.categories as category, i (i)}
					<div class="flex items-center gap-2">
						<div
							class="size-3 rounded-full border border-zinc-600"
							style="background-color: {category.color}"
						></div>
						<span class="text-sm">{category.label}</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- "Chart" -->
		<div class="px-7">
			<div class="relative h-[500px] w-[calc(216px*3+36px)]">
				{#each chartConfig.current.series as series, i (i)}
					{#each series.data as data, j (j)}
						<div
							class="absolute bottom-0 ml-2 h-50 w-52 rounded-sm border border-black"
							style="background-color: {i === 0
								? chartConfig.current.categories[j].color
								: chartConfig.current
										.nonPromotedSeriesColor}; translate: calc(({i} * 100%) + ({i} * 8px)); height: {data.bullshitHeight}%;"
						>
							<div class={cn('absolute -top-7 w-full text-center', j > 0 && 'top-1')}>
								<ContentEditable this="div" bind:content={data.allegedData} />
							</div>
							{#if j === 0}
								<ContentEditable
									this="div"
									class="relative top-[calc(100%+8px)] w-full text-center"
									bind:content={series.label}
								/>
							{/if}
						</div>
					{/each}
				{/each}

				<!-- Y Axis Label -->
				<div
					class="relative top-1/2 left-[calc(-50%-24px)] flex -translate-y-1/2 -rotate-90 place-items-center justify-center"
				>
					<div
						class="min-w-none w-fit max-w-none p-2 text-center outline-none"
						contenteditable="true"
						onblur={(e) => {
							chartConfig.current.yAxisLabel = e.currentTarget.innerText;
						}}
					>
						{chartConfig.current.yAxisLabel}
					</div>
				</div>
			</div>
		</div>
	</div>
</main>
