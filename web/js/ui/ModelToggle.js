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
        
        // Define a standalone version that doesn't require DrakeExplorer
        class StandaloneModelToggle extends React.Component {
            constructor(props) {
                super(props);
                this.state = {
                    currentModel: 'classic'
                };
            }
            
            handleModelChange = (model) => {
                console.log('StandaloneModelToggle: Model changed to', model);
                this.setState({ currentModel: model });
                
                // Update equation display
                const equationDisplay = document.getElementById('equation-display');
                if (equationDisplay) {
                    if (model === 'classic') {
                        equationDisplay.innerHTML = 'N = R<sub>*</sub> × f<sub>p</sub> × n<sub>e</sub> × f<sub>l</sub> × f<sub>i</sub> × f<sub>c</sub> × L';
                    } else {
                        equationDisplay.innerHTML = 'N = R<sub>*</sub> × f<sub>p</sub> × f<sub>pm</sub> × n<sub>e</sub> × f<sub>g</sub> × f<sub>t</sub> × f<sub>i</sub> × f<sub>c</sub> × f<sub>l</sub> × f<sub>m</sub> × f<sub>j</sub> × L';
                    }
                }
                
                // If DrakeExplorer is available, use it too
                if (window.drakeExplorer && window.drakeExplorer.handleModelChange) {
                    window.drakeExplorer.handleModelChange(model);
                }
            }
            
            render() {
                return (
                    <ModelToggle 
                        currentModel={this.state.currentModel}
                        onModelChange={this.handleModelChange}
                    />
                );
            }
        }
        
        // Render the standalone version
        ReactDOM.render(
            <StandaloneModelToggle />,
            modelToggleRoot
        );
        
        console.log('ModelToggle: Initial render successful');
    } catch (error) {
        console.error('ModelToggle: Error during render:', error);
    }
});

// Attach to window for browser usage
window.ModelToggle = ModelToggle;