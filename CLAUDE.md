# IDECEx AI Assistant Guide

## Project Overview
Interactive Drake Equation Calculator/Explorer - A web-based tool for exploring possible values of the Drake Equation and visualizing the outcomes. The application supports both the classic Drake Equation and an extended Rare Earth model.

## Environment Setup
- This is a static website with React components (loaded via CDN)
- Serve locally: `python -m http.server` in the `web/` directory
- Live demo: [killsignal.net/IDECEx](https://www.killsignal.net/IDECEx/web/)

## Code Style Guidelines
- **JavaScript**:
  - ES6+ class-based component architecture
  - 4-space indentation
  - camelCase for variables and functions
  - PascalCase for classes and components
  - Arrow functions preferred for callbacks
  - Modern DOM APIs and event listeners
  - Debounce event handlers for input changes
  - Class-based component structure with clear separation of concerns

- **React Components**:
  - Functional components with hooks
  - JSX syntax for UI elements
  - Props for component configuration

- **HTML/CSS**:
  - BEM-like naming conventions
  - Class-based styling
  - Responsive design principles
  - CSS transitions for smooth UI effects

## Project Structure
- `/web/index.html`: Main application page
- `/web/js/main.js`: Application entry point
- `/web/js/calculator/DrakeCalculator.js`: Core equation calculation logic
- `/web/js/ui/UIManager.js`: UI event handling and state management
- `/web/js/ui/ModelToggle.js`: React component for model selection
- `/web/js/traces/TraceManager.js`: Manages calculation traces/history
- `/web/js/visualizations/`: Visualization components directory
  - `/charts/`: Chart implementations (Bar, Relationship, Distribution, Heatmap)
  - `/solar/`: Solar system visualization using D3 and React
- `/web/styles/main.css`: Styling for the application

## Visualization Libraries
- Chart.js for bar charts and line charts
- Plotly.js for scatter plots and heatmaps
- D3.js for custom solar system visualization
- React for interactive components

## Application Architecture
- Main entry point creates core components:
  - DrakeCalculator: Handles equation calculations for both models
  - UIManager: Manages UI interactions and state
  - TraceManager: Tracks calculation history
  - VisualizationManager: Creates and updates visualizations