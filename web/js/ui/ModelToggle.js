// ModelToggle.js
const ModelToggle = ({ currentModel, onModelChange }) => {
    const equations = {
        classic: "N = R* × fp × ne × fl × fi × fc × L",
        "rare-earth": "N = R* × fp × fpm × ne × fg × ft × fi × fc × fl × fm × fj × L"
    };

    const descriptions = {
        classic: "The original Drake Equation estimates the number of communicating civilizations in our galaxy.",
        "rare-earth": "The Rare Earth hypothesis extends the Drake Equation to include additional factors that might make complex life rare."
    };

    return (
        <div className="model-selector">
            <div className="toggle-container">
                <div className={`toggle-slider ${currentModel}`}></div>
                <span 
                    className={`toggle-option ${currentModel === 'classic' ? 'active' : ''}`}
                    onClick={() => onModelChange('classic')}
                >
                    Classic Drake
                </span>
                <span 
                    className={`toggle-option ${currentModel === 'rare-earth' ? 'active' : ''}`}
                    onClick={() => onModelChange('rare-earth')}
                >
                    Rare Earth
                </span>
            </div>
            
            <div className="model-description">
                <div className="equation-display">
                    {equations[currentModel]}
                </div>
                <div className="model-info">
                    {descriptions[currentModel]}
                </div>
            </div>
        </div>
    );
};

// Render the component when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for the DrakeExplorer instance to be created
    const checkForExplorer = setInterval(() => {
        if (window.drakeExplorer) {
            clearInterval(checkForExplorer);
            
            const modelToggleRoot = document.getElementById('model-toggle-root');
            if (modelToggleRoot) {
                ReactDOM.render(
                    <ModelToggle 
                        currentModel={window.drakeExplorer.calculator.getCurrentModel()} 
                        onModelChange={(model) => window.drakeExplorer.handleModelChange(model)}
                    />,
                    modelToggleRoot
                );
            }
        }
    }, 100);
});

// Attach to window for browser usage
window.ModelToggle = ModelToggle;