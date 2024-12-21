import { BaseChart } from './BaseChart.js';
import { normalizeValues, generateColorScale } from '../utils/ChartUtils.js';

export class ComparativeBarChart extends BaseChart {
    render(data, model) {
        const normalizedData = normalizeValues(data.values);
        const colors = generateColorScale(data.labels.length);

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
            options: this.getChartOptions(data)
        });
    }

    getChartOptions(data) {
        return {
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
        };
    }

    highlightFactor(factor) {
        if (!this.chart) return;
        
        const dataset = this.chart.data.datasets[0];
        dataset.backgroundColor = dataset.backgroundColor.map((color, i) => {
            const relatedToFactor = this.isRelatedToFactor(this.chart.data.labels[i], factor);
            return relatedToFactor ? color : this.fadeColor(color);
        });
        
        this.chart.update();
    }

    isRelatedToFactor(label, factor) {
        // Implement factor relationship logic
        return factor ? label.toLowerCase().includes(factor.toLowerCase()) : true;
    }

    fadeColor(color) {
        return color.replace('0.6)', '0.2)');
    }
}