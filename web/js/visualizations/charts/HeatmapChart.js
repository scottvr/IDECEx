import { BaseChart } from './BaseChart.js';

export class GalaxyDensityHeatmap extends BaseChart {
    render(data, model) {
        if (!data || !data.densityValues || data.densityValues.length === 0) {
            return;
        }
        
        const heatmapData = [{
            z: data.densityValues,
            type: 'heatmap',
            colorscale: 'Viridis',
            showscale: true,
            hoverongaps: false
        }];
        
        const layout = {
            title: 'Exploration Density',
            xaxis: { 
                title: data.xLabel || 'X',
                showgrid: false
            },
            yaxis: { 
                title: data.yLabel || 'Y',
                showgrid: false
            }
        };
        
        const config = {
            responsive: true
        };
        
        Plotly.newPlot(this.container.id, heatmapData, layout, config);
        this.chart = { destroy: () => Plotly.purge(this.container.id) };
    }
    
    highlightFactor(factor) {
        // Heatmap doesn't support highlighting
    }
}