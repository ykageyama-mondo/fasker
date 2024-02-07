/* eslint-disable import/no-extraneous-dependencies */
import fs from 'fs';
import path from 'path';
import vega from 'vega';
const themes = [
  {
    name: 'light',
    text: '#2e2e2e',
  },
  {
    name: 'dark',
    text: '#f0f0f0',
  },
];
const barHeight = 100;

export async function exportAverageToGraph(average: Record<string, number>) {
  const numMethods = Object.keys(average).length;
  for (const theme of themes) {
    const view = new vega.View(
      vega.parse({
        $schema: 'https://vega.github.io/schema/vega/v5.json',
        width: 1000,
        height: barHeight * numMethods,
        padding: 5,
        config: {
          axis: {
            labelColor: theme.text,
            labelFontSize: 20,
          },
          text: {
            fill: theme.text,
            fontSize: 20,
          },
        },
        autosize: 'fit',
        data: [
          {
            name: 'benchmarks',
            values: Object.keys(average).map((k) => ({
              method: k,
              time: average[k],
            })),
            transform: [
              {
                type: 'formula',
                as: 'time_s',
                expr: 'format(datum.time, ".2f") + "s"',
              },
            ],
          },
        ],
        marks: [
          {
            type: 'rect',
            from: { data: 'benchmarks' },
            encode: {
              update: {
                x: { scale: 'x', value: 0 },
                x2: { scale: 'x', field: 'time' },
                y: { scale: 'y', field: 'method' },
                height: { scale: 'y', band: 1 },
                fill: { value: '#FFE066' },
              },
            },
          },
          {
            type: 'text',
            from: { data: 'benchmarks' },
            encode: {
              update: {
                x: { scale: 'x', field: 'time', offset: 5 },
                y: { scale: 'y', field: 'method', band: 0.5 },
                text: { field: 'time_s' },
                align: { value: 'left' },
                baseline: { value: 'middle' },
              },
            },
          },
        ],
        scales: [
          {
            name: 'x',
            type: 'linear',
            domain: { data: 'benchmarks', field: 'time' },
            range: 'width',
            nice: true,
          },
          {
            name: 'y',
            type: 'band',
            domain: {
              data: 'benchmarks',
              field: 'method',
              sort: { op: 'max', field: 'time', order: 'ascending' },
            },
            range: 'height',
            padding: 0.1,
          },
        ],
        axes: [
          {
            scale: 'x',
            orient: 'bottom',
          },
          {
            scale: 'y',
            orient: 'left',
          },
        ],
      }),
      {
        renderer: 'none',
      },
    );

    const svg = await view.toSVG();
    fs.writeFileSync(
      path.resolve(process.cwd(), 'assets', `benchmark-${theme.name}.svg`),
      svg,
    );
  }
}
