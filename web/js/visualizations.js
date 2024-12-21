import { Chart } from 'chart.js';
import Plotly from 'plotly.js-dist';

export class DrakeVisualizations {
  constructor() {
    this.chartInstances = {
      barChart: null,
      relationshipGraph: null,
      distributionCurve: null,
      densityHeatmap: null
    };
  }

  createComparativeBarChart(data, model) {
    const ctx = document.getElementById('comparativeBarChart').getContext('2d');
    
    // Normalize values for better visualization
    const normalizedValues = this.normalizeValues(data.values);
    
    if (this.chartInstances.barChart) {
      this.chartInstances.barChart.destroy();
    }

    this.chartInstances.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Variable Values (Normalized)',
          data: normalizedValues,
          backgroundColor: this.generateColorScale(data.labels.length),
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            type: 'logarithmic',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Value (log scale)'
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

  createVariableRelationshipGraph(data, model) {
    const trace = {
      x: data.xValues,
      y: data.yValues,
      mode: 'markers',
      type: 'scatter',
      marker: {
        size: 8,
        color: data.xValues,
        colorscale: 'Viridis',
        showscale: true
      }
    };

    const layout = {
      title: `Relationship between ${data.xLabel} and ${data.yLabel}`,
      xaxis: {
        title: data.xLabel,
        type: 'log',
        autorange: true
      },
      yaxis: {
        title: data.yLabel,
        type: 'log',
        autorange: true
      },
      showlegend: false,
      margin: { t: 50, l: 60, r: 40, b: 50 }
    };

    Plotly.newPlot('variableRelationshipGraph', [trace], layout);
  }

  createProbabilityDistributionCurve(data, model) {
    const ctx = document.getElementById('probabilityDistributionCurve').getContext('2d');
    
    if (this.chartInstances.distributionCurve) {
      this.chartInstances.distributionCurve.destroy();
    }

    // Calculate proper probability distribution
    const { bins, frequencies } = this.calculateDistribution(data.values);

    this.chartInstances.distributionCurve = new Chart(ctx, {
      type: 'line',
      data: {
        labels: bins,
        datasets: [{
          label: 'Probability Distribution',
          data: frequencies,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'linear',
            title: {
              display: true,
              text: data.xLabel
            }
          },
          y: {
            title: {
              display: true,
              text: 'Probability Density'
            },
            beginAtZero: true
          }
        }
      }
    });
  }

  // Helper methods
  normalizeValues(values) {
    const max = Math.max(...values.filter(v => isFinite(v)));
    return values.map(v => v / max);
  }

  generateColorScale(n) {
    return Array(n).fill().map((_, i) => 
      `hsla(${(i * 360) / n}, 70%, 50%, 0.6)`
    );
  }

  calculateDistribution(values) {
    const binCount = Math.ceil(Math.sqrt(values.length));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / binCount;

    const bins = Array(binCount).fill().map((_, i) => 
      min + (i + 0.5) * binWidth
    );

    const frequencies = Array(binCount).fill(0);
    values.forEach(v => {
      const binIndex = Math.min(
        Math.floor((v - min) / binWidth),
        binCount - 1
      );
      frequencies[binIndex