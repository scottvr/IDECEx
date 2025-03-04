import { BaseChart } from './BaseChart.js';
import { generateColorScale } from '../utils/ChartUtils.js';

export class DistributionCurve extends BaseChart {
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
                    },
                    tooltip: {
                        callbacks: {
                            title: (tooltipItems) => {
                                const item = tooltipItems[0];
                                const index = item.dataIndex;
                                const x = data.xValues[index];
                                return `${data.xLabel || 'Value'}: ${x.toFixed(4)}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    highlightFactor(factor) {
        // Distribution curve doesn't support highlighting
    }
}