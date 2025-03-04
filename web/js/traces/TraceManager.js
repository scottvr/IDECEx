// TraceManager.js
export class TraceManager {
    constructor(maxTraces = 5) {
        this.maxTraces = maxTraces;
        this.calculationHistory = {
            traces: [
                {
                    id: 1,
                    name: "Trace 1",
                    calculations: [
                        // Will be populated with calculations
                    ]
                }
            ],
            currentTraceIndex: 0
        };
        
        this.initializeUI();
    }
    
    /**
     * Initialize trace UI controls
     */
    initializeUI() {
        const newTraceButton = document.getElementById('new-trace-button');
        const clearTraceButton = document.getElementById('clear-trace-button');
        const traceSelect = document.getElementById('trace-select');
        
        if (newTraceButton) {
            newTraceButton.addEventListener('click', () => this.startNewTrace());
        }
        
        if (clearTraceButton) {
            clearTraceButton.addEventListener('click', () => this.clearCurrentTrace());
        }
        
        if (traceSelect) {
            traceSelect.addEventListener('change', (e) => this.switchTrace(parseInt(e.target.value)));
            this.updateTraceSelector();
        }
    }
    
    /**
     * Add a calculation to the current trace
     */
    addCalculation(calculationResult) {
        this.ensureTraceExists();
        
        // Add timestamp if not provided
        if (!calculationResult.timestamp) {
            calculationResult.timestamp = Date.now();
        }
        
        this.calculationHistory.traces[this.calculationHistory.currentTraceIndex].calculations.push(calculationResult);
        return calculationResult;
    }
    
    /**
     * Start a new trace
     */
    startNewTrace() {
        if (this.calculationHistory.traces.length >= this.maxTraces) {
            // Show message about max traces
            this.showMessage(`Maximum number of traces (${this.maxTraces}) reached. Please clear a trace first.`);
            return;
        }
        
        const newTraceId = this.calculationHistory.traces.length + 1;
        this.calculationHistory.traces.push({
            id: newTraceId,
            name: `Trace ${newTraceId}`,
            calculations: []
        });
        
        this.calculationHistory.currentTraceIndex = this.calculationHistory.traces.length - 1;
        this.updateTraceSelector();
        this.showMessage(`Started new trace: Trace ${newTraceId}`);
    }
    
    /**
     * Clear the current trace
     */
    clearCurrentTrace() {
        const currentTrace = this.calculationHistory.traces[this.calculationHistory.currentTraceIndex];
        
        if (currentTrace) {
            currentTrace.calculations = [];
            this.showMessage(`Cleared trace: ${currentTrace.name}`);
        }
    }
    
    /**
     * Switch to a different trace
     */
    switchTrace(index) {
        if (index >= 0 && index < this.calculationHistory.traces.length) {
            this.calculationHistory.currentTraceIndex = index;
        }
    }
    
    /**
     * Get the current trace
     */
    getCurrentTrace() {
        this.ensureTraceExists();
        return this.calculationHistory.traces[this.calculationHistory.currentTraceIndex];
    }
    
    /**
     * Get all traces
     */
    getAllTraces() {
        return this.calculationHistory.traces;
    }
    
    /**
     * Ensure at least one trace exists
     */
    ensureTraceExists() {
        if (this.calculationHistory.traces.length === 0) {
            this.calculationHistory.traces.push({
                id: 1,
                name: "Trace 1",
                calculations: []
            });
            this.calculationHistory.currentTraceIndex = 0;
        }
    }
    
    /**
     * Update the trace selector dropdown
     */
    updateTraceSelector() {
        const traceSelect = document.getElementById('trace-select');
        if (!traceSelect) return;
        
        // Clear existing options
        traceSelect.innerHTML = '';
        
        // Add options for each trace
        this.calculationHistory.traces.forEach((trace, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = trace.name;
            if (index === this.calculationHistory.currentTraceIndex) {
                option.selected = true;
            }
            traceSelect.appendChild(option);
        });
    }
    
    /**
     * Show a message to the user
     */
    showMessage(message, isError = false) {
        const messageContainer = document.getElementById('message-container');
        if (messageContainer) {
            messageContainer.textContent = message;
            messageContainer.className = isError ? 'error' : 'success';
            messageContainer.style.display = 'block';
            
            // Hide after 3 seconds
            setTimeout(() => {
                messageContainer.style.display = 'none';
            }, 3000);
        }
    }
}