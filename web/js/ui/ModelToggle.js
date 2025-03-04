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
    console.log('ModelToggle: DOM content loaded');
    const modelToggleRoot = document.getElementById('model-toggle-root');
    
    if (!modelToggleRoot) {
        console.error('ModelToggle: Cannot find root element #model-toggle-root');
        return;
    }
    
    console.log('ModelToggle: Found root element');
    
    // First render a simple toggle to show something
    try {
        console.log('ModelToggle: Initial render with default state');
        ReactDOM.render(
            <div className="model-selector">
                <div className="toggle-container">
                    <div className="toggle-slider classic"></div>
                    <span className="toggle-option active">Classic Drake</span>
                    <span className="toggle-option">Rare Earth</span>
                </div>
                <div className="model-description">
                    <div className="equation-display">
                        N = R* × fp × ne × fl × fi × fc × L
                    </div>
                    <div className="model-info">
                        Loading model data...
                    </div>
                </div>
            </div>,
            modelToggleRoot
        );
        console.log('ModelToggle: Initial render successful');
    } catch (error) {
        console.error('ModelToggle: Error during initial render:', error);
    }
    
    // Wait for the DrakeExplorer instance to be created
    console.log('ModelToggle: Setting up interval to check for explorer');
    const checkForExplorer = setInterval(() => {
        try {
            console.log('ModelToggle: Checking for DrakeExplorer...');
            
            if (window.drakeExplorer) {
                console.log('ModelToggle: Found DrakeExplorer!', window.drakeExplorer);
                clearInterval(checkForExplorer);
                
                console.log('ModelToggle: Getting current model...');
                const currentModel = window.drakeExplorer.calculator.getCurrentModel() || 'classic';
                console.log('ModelToggle: Current model is', currentModel);
                
                console.log('ModelToggle: Final render with real data');
                ReactDOM.render(
                    <ModelToggle 
                        currentModel={currentModel} 
                        onModelChange={(model) => {
                            console.log('ModelToggle: Model changed to', model);
                            window.drakeExplorer.handleModelChange(model);
                        }}
                    />,
                    modelToggleRoot
                );
                console.log('ModelToggle: Final render complete');
            }
        } catch (error) {
            console.error('ModelToggle: Error checking for DrakeExplorer:', error);
        }
    }, 500);
    
    // Safety timeout after 10 seconds
    setTimeout(() => {
        clearInterval(checkForExplorer);
        console.warn('ModelToggle: Timed out waiting for DrakeExplorer after 10 seconds');
    }, 10000);
});

// Attach to window for browser usage
window.ModelToggle = ModelToggle;