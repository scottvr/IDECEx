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

// Attach to window for browser usage
window.ModelToggle = ModelToggle;