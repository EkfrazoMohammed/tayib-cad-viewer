import React, { useState, useRef } from "react";
import DxfViewer from "./DxfViewer";

const ViewerPage = ({ dxfUrl }) => {
  const [layers, setLayers] = useState(null);
  const viewerRef = useRef(null);

  // Get layers from DXF viewer when it's loaded
  const handleLoaded = (viewerInstance) => {
    const layers = viewerInstance.GetLayers();
    setLayers(layers);
    layers.forEach((layer) => {
      layer.isVisible = true; // Set default visibility
    });
  };

  const handleCleared = () => {
    setLayers(null);
  };

  const toggleLayer = (layer, newState) => {
    const viewer = viewerRef.current.GetViewer();
    viewer.ShowLayer(layer.name, newState); // Show or hide the layer
    layer.isVisible = newState; // Update the layer state
  };

  const toggleAll = (newState) => {
    layers.forEach((layer) => {
      toggleLayer(layer, newState);
    });
  };

  return (
    <div className="viewerPage">
      <div className="dxfViewerContainer">
        <DxfViewer
          ref={viewerRef}
          dxfUrl={dxfUrl}
          onLoaded={handleLoaded}
          onCleared={handleCleared}
        />
      </div>
     
    </div>
  );
};

export default ViewerPage;
