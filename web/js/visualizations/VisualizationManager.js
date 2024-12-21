import { ComparativeBarChart } from './charts/BarChart.js';
import { RelationshipGraph } from './charts/RelationshipGraph.js';
import { DistributionCurve } from './charts/DistributionCurve.js';
import { GalaxyDensityHeatmap } from './charts/HeatmapChart.js';
import { SolarSystem } from './solar/SolarSystem.js';

export class VisualizationManager {
    constructor() {
        this.charts = new Map();
        this.currentModel = 'classic';
        this.initializeCharts();
    }

    initializeCharts() {
        this.charts.set('barChart', new ComparativeBarChart('comparativeBarChart'));
        this.charts.set('relationshipGraph', new RelationshipGraph('variableRelationshipGraph'));
        this.charts.set('distributionCurve', new DistributionCurve('probabilityDistributionCurve'));
        this.charts.set('densityHeatmap', new GalaxyDensityHeatmap('galaxyDensityHeatmap'));
        this.charts.set('solarSystem', new SolarSystem('solarSystemMap'));
    }

    updateAllCharts(data, model = this.currentModel) {
        this.currentModel = model;
        this.charts.forEach(chart => {
            chart.update(data, model);
        });
    }

    clearAllCharts() {
        this.charts.forEach(chart => chart.clear());
    }

    highlightFactor(factor) {
        this.charts.forEach(chart => {
            if (typeof chart.highlightFactor === 'function') {
                chart.highlightFactor(factor);
            }
        });
    }

    setModel(model) {
        this.currentModel = model;
        this.charts.forEach(chart => {
            if (typeof chart.onModelChange === 'function') {
                chart.onModelChange(model);
            }
        });
    }
}
