/**
 * Non-module version of visualization components
 */

// Simple version of BaseChart
class BaseChart {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.chart = null;
    }

    clear() {
        if (this.chart && this.chart.destroy) {
            this.chart.destroy();
            this.chart = null;
        }
    }

    update(data, model) {
        this.clear();
        if (this.container) {
            this.render(data, model);
        }
    }

    render() {
        // Implemented by subclasses
        console.warn('BaseChart render method not implemented');
    }
}

// Bar chart implementation
class ComparativeBarChart extends BaseChart {
    render(data, model) {
        if (!data || !data.labels || !data.values || data.values.length === 0) {
            return;
        }
        
        // Normalize values for better display
        const normalizedData = window.dataProcessor ? 
            window.dataProcessor.normalizeValues(data.values) : 
            data.values;
        
        // Generate colors
        const colors = Array(data.labels.length).fill().map((_, i) => {
            const hue = (i * 360) / data.labels.length;
            return `hsla(${hue}, 70%, 50%, 0.6)`;
        });
        
        this.chart = new Chart(this.container.getContext('2d'), {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Variable Values (Normalized)',
                    data: normalizedData,
                    backgroundColor: colors,
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Value'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `Original value: ${data.values[context.dataIndex]}`;
                            }
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }
}

// Relationship graph
class RelationshipGraph extends BaseChart {
    render(data, model) {
        if (!data || !data.xValues || !data.yValues || data.xValues.length === 0) {
            return;
        }
        
        const useLogScale = data.yValues.length > 0 && 
            Math.max(...data.yValues) / Math.min(...data.yValues.filter(v => v > 0)) > 100;
        
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
}

// Distribution curve chart
class DistributionCurve extends BaseChart {
    render(data, model) {
        if (!data || !data.xValues || !data.yValues || data.xValues.length === 0) {
            return;
        }
        
        const ctx = this.container.getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.xValues.map(x => x.toFixed(2)),
                datasets: [{
                    label: data.label || 'Distribution',
                    data: data.yValues,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { 
                        title: { 
                            display: true, 
                            text: data.xLabel || 'Value' 
                        } 
                    },
                    y: { 
                        title: { 
                            display: true, 
                            text: 'Frequency' 
                        },
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }
}

// Heatmap implementation
class GalaxyDensityHeatmap extends BaseChart {
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
        
        Plotly.newPlot(this.container.id, heatmapData, layout);
        this.chart = { destroy: () => Plotly.purge(this.container.id) };
    }
}

// Main visualization manager
class VisualizationManager {
    constructor() {
        this.charts = new Map();
        this.currentModel = 'classic';
        this.initializeCharts();
    }

    initializeCharts() {
        const chartContainers = [
            'comparativeBarChart',
            'variableRelationshipGraph',
            'probabilityDistributionCurve',
            'galaxyDensityHeatmap',
            'solarSystemMap'
        ];
        
        // Check which containers exist
        chartContainers.forEach(id => {
            const container = document.getElementById(id);
            if (!container) return;
            
            // Create appropriate chart based on ID
            if (id === 'comparativeBarChart') {
                this.charts.set('barChart', new ComparativeBarChart(id));
            } else if (id === 'variableRelationshipGraph') {
                this.charts.set('relationshipGraph', new RelationshipGraph(id));
            } else if (id === 'probabilityDistributionCurve') {
                this.charts.set('distributionCurve', new DistributionCurve(id));
            } else if (id === 'galaxyDensityHeatmap') {
                this.charts.set('densityHeatmap', new GalaxyDensityHeatmap(id));
            }
            // Solar system is handled separately through React
        });
    }

    updateAllCharts(data, model = this.currentModel) {
        this.currentModel = model;
        this.charts.forEach(chart => {
            try {
                chart.update(data, model);
            } catch (e) {
                console.warn('Failed to update chart:', e);
            }
        });
    }

    clearAllCharts() {
        this.charts.forEach(chart => {
            try {
                chart.clear();
            } catch (e) {
                console.warn('Failed to clear chart:', e);
            }
        });
    }

    setModel(model) {
        this.currentModel = model;
    }
}

// Make components globally available
window.BaseChart = BaseChart;
window.ComparativeBarChart = ComparativeBarChart;
window.RelationshipGraph = RelationshipGraph;
window.DistributionCurve = DistributionCurve;
window.GalaxyDensityHeatmap = GalaxyDensityHeatmap;
window.VisualizationManager = VisualizationManager;