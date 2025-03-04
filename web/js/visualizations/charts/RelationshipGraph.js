import { BaseChart } from './BaseChart.js';
import { shouldUseLogScale, generateAxisTicks } from '../utils/ChartUtils.js';

export class RelationshipGraph extends BaseChart {
    render(data, model) {
        if (!data || !data.xValues || !data.yValues || data.xValues.length === 0) {
            return;
        }

        const useLogScale = shouldUseLogScale(data.yValues);
        
        const layout = {
            title: `Relationship between ${data.xLabel} and ${data.yLabel}`,
            xaxis: { title: data.xLabel },
            yaxis: { 
                title: data.yLabel,
                type: useLogScale ? 'log' : 'linear'
            },
            hovermode: 'closest',
            showlegend: false
        };
        
        const plotData = [{
            x: data.xValues,
            y: data.yValues,
            mode: 'markers',
            type: 'scatter',
            marker: {
                size: 10,
                color: 'rgba(75, 192, 192, 0.6)',
                line: {
                    color: 'rgba(75, 192, 192, 1)',
                    width: 1
                }
            },
            text: data.xValues.map((x, i) => `${data.xLabel}: ${x}<br>${data.yLabel}: ${data.yValues[i]}`),
            hoverinfo: 'text'
        }];
        
        Plotly.newPlot(this.container.id, plotData, layout);
        this.chart = { destroy: () => Plotly.purge(this.container.id) };
    }
    
    highlightFactor(factor) {
        // Not implemented for relationship graph
    }
}