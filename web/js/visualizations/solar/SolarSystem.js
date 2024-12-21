//import React, { useEffect, useRef, useState } from 'react';
import { select, forceSimulation, forceManyBody, forceCenter, forceCollide, forceRadial } from 'd3';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

const SolarSystemViz = ({ model, variables, onFactorHighlight }) => {
    const svgRef = React.useRef(null);
    const [highlightedFactor, setHighlightedFactor] = React.useState(null);
    const [showLabels, setShowLabels] = React.useState(true);
    const [animationSpeed, setAnimationSpeed] = React.useState(1);
    const simulationRef = React.useRef(null);
    const [showGalacticZone, setShowGalacticZone] = React.useState(true);
    const [selectedBody, setSelectedBody] = React.useState(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const width = 800;
    const height = 600;
    const svg = select(svgRef.current);
    
    // Clear previous content
    svg.selectAll("*").remove();
    
    // Create definitions for gradients and filters
    const defs = svg.append("defs");
    
    // Galactic habitable zone gradient
    const zoneGradient = defs.append("radialGradient")
      .attr("id", "habitable-zone")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");
      
    zoneGradient.append("stop")
      .attr("offset", "0%")
      .attr("style", "stop-color: #4CAF50; stop-opacity: 0.2");
    zoneGradient.append("stop")
      .attr("offset", "100%")
      .attr("style", "stop-color: #4CAF50; stop-opacity: 0");
    
    // Star glow effect
    const starGlow = defs.append("filter")
      .attr("id", "star-glow");
    
    starGlow.append("feGaussianBlur")
      .attr("stdDeviation", "4")
      .attr("result", "coloredBlur");
    
    const feMerge = starGlow.append("feMerge");
    feMerge.append("feMergeNode")
      .attr("in", "coloredBlur");
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");
    
    // Background starfield
    const starGroup = svg.append("g")
      .attr("class", "starfield");
    
    for (let i = 0; i < 200; i++) {
      starGroup.append("circle")
        .attr("cx", Math.random() * width)
        .attr("cy", Math.random() * height)
        .attr("r", Math.random() * 1.5)
        .attr("fill", "#fff")
        .attr("opacity", Math.random() * 0.8 + 0.2);
    }
    
    // Galactic habitable zone if using Rare Earth model
    if (model === 'rare-earth' && showGalacticZone) {
      const zone = svg.append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", height * 0.3)
        .attr("fill", "url(#habitable-zone)")
        .attr("class", "habitable-zone")
        .attr("opacity", 0)
        .transition()
        .duration(1000)
        .attr("opacity", 1);
    }
    
    // Create central star
    const centralStar = svg.append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", 20)
      .attr("fill", "#FFD700")
      .attr("filter", "url(#star-glow)")
      .attr("class", "central-star");
    
    // Create orbital paths
    const orbitalPaths = svg.append("g")
      .attr("class", "orbital-paths");
    
    const generateOrbitalPath = (radius) => {
      const points = 100;
      let pathData = "M ";
      
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const x = width/2 + radius * Math.cos(angle);
        const y = height/2 + radius * Math.sin(angle);
        pathData += `${x},${y} ${i === 0 ? 'L' : ''}`;
      }
      
      return pathData + "Z";
    };
    
    // Add planets based on model
    const planetData = model === 'rare-earth' ? [
      { name: "Rocky Planet", radius: 8, orbit: 100, color: "#8B4513", type: "habitable" },
      { name: "Jupiter-like", radius: 25, orbit: 200, color: "#CD853F", type: "jupiter" },
      { name: "Moon Host", radius: 12, orbit: 150, color: "#6B8E23", type: "moon", hasMoon: true }
    ] : [
      { name: "Planet", radius: 10, orbit: 150, color: "#8B4513", type: "habitable" }
    ];
    
    planetData.forEach((planet, i) => {
      // Add orbital path
      orbitalPaths.append("path")
        .attr("d", generateOrbitalPath(planet.orbit))
        .attr("fill", "none")
        .attr("stroke", "#ffffff20")
        .attr("stroke-dasharray", "5,5");
      
      const planetGroup = svg.append("g")
        .attr("class", `planet-group ${planet.type}`);
      
      // Add planet
      planetGroup.append("circle")
        .attr("r", planet.radius)
        .attr("fill", planet.color)
        .attr("class", "planet")
        .on("mouseover", () => {
          setSelectedBody(planet);
          onFactorHighlight(planet.type);
        })
        .on("mouseout", () => {
          setSelectedBody(null);
          onFactorHighlight(null);
        });
      
      // Add moon if applicable
      if (planet.hasMoon) {
        const moonOrbit = planetGroup.append("circle")
          .attr("r", planet.radius * 2)
          .attr("fill", "none")
          .attr("stroke", "#ffffff20");
        
        planetGroup.append("circle")
          .attr("cx", planet.radius * 2)
          .attr("r", planet.radius * 0.3)
          .attr("fill", "#ccc")
          .attr("class", "moon");
      }
      
      // Initial position on orbit
      const angle = (i / planetData.length) * Math.PI * 2;
      planetGroup.attr("transform", `translate(
        ${width/2 + planet.orbit * Math.cos(angle)},
        ${height/2 + planet.orbit * Math.sin(angle)}
      )`);
    });
    
    // Animation loop
    let lastTime = 0;
    const animate = (currentTime) => {
      if (lastTime === 0) lastTime = currentTime;
      const delta = (currentTime - lastTime) * animationSpeed;
      
      svg.selectAll(".planet-group").each(function(d, i) {
        const group = select(this);
        const planet = planetData[i];
        const angle = (currentTime * 0.0001 * animationSpeed) + (i * Math.PI * 2 / planetData.length);
        
        group
          .attr("transform", `translate(
            ${width/2 + planet.orbit * Math.cos(angle)},
            ${height/2 + planet.orbit * Math.sin(angle)}
          )`);
        
        if (planet.hasMoon) {
          const moonAngle = angle * 4;
          group.select(".moon")
            .attr("cx", planet.radius * 2 * Math.cos(moonAngle))
            .attr("cy", planet.radius * 2 * Math.sin(moonAngle));
        }
      });
      
      lastTime = currentTime;
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
    
    return () => {
      // Cleanup
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [model, showGalacticZone, animationSpeed]);
};


    // ... rest of the component logic ...
  
    return (
      <div className="viz-container">
        <div className="viz-header">
          <h2 className="viz-title">Solar System Visualization</h2>
        </div>
        <div className="viz-content">
          <div className="viz-controls">
            <div className="slider-container">
              <label className="slider-label">Animation Speed</label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                className="custom-slider"
              />
            </div>
            
            {model === 'rare-earth' && (
              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                />
                Show Labels
              </label>
            )}
          </div>
          
          <div className="solar-container">
            <svg
              ref={svgRef}
              width="800"
              height="600"
              className="w-full h-auto"
            />
          </div>
          
          {highlightedFactor && (
            <div className="info-panel">
              <h4>{getFactorName(highlightedFactor)}</h4>
              <p>{getFactorDescription(highlightedFactor)}</p>
            </div>
          )}
        </div>
      </div>
    );
  
// Helper functions
function getFactorName(factor) {
  const names = {
    habitable: "Habitable Zone Planet",
    jupiter: "Jupiter-like Protector",
    moon: "Planet with Large Moon"
  };
  return names[factor] || factor;
}
  
function getFactorDescription(factor) {
  const descriptions = {
    habitable: "A planet orbiting in the zone where liquid water could exist on its surface.",
    jupiter: "A large gas giant that helps protect inner planets from asteroid impacts.",
    moon: "A planet with a large moon that helps stabilize its axial tilt and creates tides."
  };
  return descriptions[factor] || "";
}
  
window.SolarSystemViz = SolarSystemViz;
