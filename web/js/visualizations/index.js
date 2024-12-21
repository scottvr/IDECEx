// visualizations/index.js
import { ComparativeBarChart } from './charts/BarChart.js';
import { RelationshipGraph } from './charts/RelationshipGraph.js';
import { DistributionCurve } from './charts/DistributionCurve.js';
import { GalaxyDensityHeatmap } from './charts/HeatmapChart.js';
import { SolarSystem } from './solar/SolarSystem.js';
import { 
    processDataForBarChart,
    processDataForRelationshipGraph,
    processDataForDistributionCurve,
    processDataForHeatmap 
} from '../data/DataProcessor.js';

// Keep track of chart instances
let chartInstances = {
    barChart: null,
    relationshipGraph: null,
    distributionCurve: null,
    densityHeatmap: null,
    solarSystem: null
};

export function createOrUpdateComparativeBarChart(data) {
    const ctx = document.getElementById('comparativeBarChart').getContext('2d');
    
    if (chartInstances.barChart) {
        chartInstances.barChart.destroy();
    }
    
    chartInstances.barChart = new ComparativeBarChart(ctx);
    chartInstances.barChart.render(data);
}

export function createOrUpdateVariableRelationshipGraph(data) {
    if (chartInstances.relationshipGraph) {
        Plotly.purge('variableRelationshipGraph');
    }
    
    chartInstances.relationshipGraph = new RelationshipGraph('variableRelationshipGraph');
    chartInstances.relationshipGraph.render(data);
}

export function createOrUpdateProbabilityDistributionCurve(data) {
    const ctx = document.getElementById('probabilityDistributionCurve').getContext('2d');
    
    if (chartInstances.distributionCurve) {
        chartInstances.distributionCurve.destroy();
    }
    
    chartInstances.distributionCurve = new DistributionCurve(ctx);
    chartInstances.distributionCurve.render(data);
}

export function createOrUpdateGalaxyDensityHeatmap(data) {
    if (chartInstances.densityHeatmap) {
        Plotly.purge('galaxyDensityHeatmap');
    }
    
    chartInstances.densityHeatmap = new GalaxyDensityHeatmap('galaxyDensityHeatmap');
    chartInstances.densityHeatmap.render(data);
}

export function createOrUpdateSolarSystemMap(data, model) {
    if (chartInstances.solarSystem) {
        chartInstances.solarSystem.clear();
    }
    
    chartInstances.solarSystem = new SolarSystem('solarSystemMap');
    chartInstances.solarSystem.render(data, model);
}

export function clearAllCharts() {
    Object.values(chartInstances).forEach(instance => {
        if (instance) {
            if (instance.destroy) instance.destroy();
            if (instance.clear) instance.clear();
        }
    });
    
    chartInstances = {
        barChart: null,
        relationshipGraph: null,
        distributionCurve: null,
        densityHeatmap: null,
        solarSystem: null
    };
}

export function highlightRelatedFactors(factor) {
    Object.values(chartInstances).forEach(instance => {
        if (instance && instance.highlightFactor) {
            instance.highlightFactor(factor);
        }
    });
}