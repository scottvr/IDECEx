export class BaseChart {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.chart = null;
    }

    clear() {
        if (this.chart) {
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

    render(data, model) {
        // Implemented by child classes
        throw new Error('render method must be implemented');
    }
}