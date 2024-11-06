// import React, { useState, useRef, useEffect } from "react";
// import * as THREE from "three";
// import { DxfViewer as DXFViewer } from "dxf-viewer";

// const DxfViewer = ({ dxfUrl, fonts = [], onLoaded }) => {
//   const canvasContainerRef = useRef(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [progress, setProgress] = useState(null);
//   const [progressText, setProgressText] = useState(null);
//   const [error, setError] = useState(null);
//   const dxfViewer = useRef(null);

//   // Initialize the DXF Viewer
//   useEffect(() => {
//     if (canvasContainerRef.current) {
//       // Initialize the DXF viewer only once if it's not already initialized
//       if (!dxfViewer.current) {
//         dxfViewer.current = new DXFViewer(canvasContainerRef.current, {
//           clearColor: new THREE.Color("#fff"),
//           autoResize: true,
//           colorCorrection: true,
//           sceneOptions: {
//             wireframeMesh: true,
//           },
//         });

//         // Subscribe to events for DXFViewer
//         const subscribe = (eventName) => {
//           dxfViewer.current.Subscribe(eventName, (e) => {
//             console.log(`Event: ${eventName}`, e);
//             if (eventName === "loaded") {
//               // Trigger the onLoaded callback once the viewer is loaded
//               if (onLoaded) onLoaded(dxfViewer.current);
//             }
//           });
//         };

//         const eventNames = [
//           "loaded",
//           "cleared",
//           "destroyed",
//           "resized",
//           "pointerdown",
//           "pointerup",
//           "viewChanged",
//           "message",
//         ];
//         eventNames.forEach(subscribe);
//       }
//     }
//   }, [onLoaded]);

//   // Load DXF file and handle progress
//   const loadDxfFile = async (url) => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       await dxfViewer.current.Load({
//         url,
//         fonts,
//         progressCbk: handleProgress,
//       });
//     } catch (e) {
//       setError(e.toString());
//     } finally {
//       setIsLoading(false);
//       setProgressText(null);
//       setProgress(null);
//     }
//   };

//   // Handle progress of DXF file loading
//   const handleProgress = (phase, size, totalSize) => {
//     if (phase !== progressText) {
//       switch (phase) {
//         case "font":
//           setProgressText("Fetching fonts...");
//           break;
//         case "fetch":
//           setProgressText("Fetching file...");
//           break;
//         case "parse":
//           setProgressText("Parsing file...");
//           break;
//         case "prepare":
//           setProgressText("Preparing rendering data...");
//           break;
//         default:
//           break;
//       }
//     }

//     if (totalSize === null) {
//       setProgress(-1); // Indeterminate progress
//     } else {
//       setProgress(size / totalSize);
//     }
//   };

//   // Load the DXF file when component mounts or dxfUrl changes
//   useEffect(() => {
//     if (dxfUrl) {
//       loadDxfFile(dxfUrl);
//     }
//   }, [dxfUrl]);

//   return (
//     <div className="canvasContainer" ref={canvasContainerRef}>
//       {isLoading && <div className="loading">Loading...</div>}
//       {progress !== null && (
//         <div className="progress">
//           <div className="progressText">{progressText}</div>
//           <progress value={progress} max={1}></progress>
//         </div>
//       )}
//       {error && (
//         <div className="error">
//           <span>Error: {error}</span>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DxfViewer;

import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { DxfViewer as DXFViewer } from "dxf-viewer";
import LayersList from "./LayersList";

const DxfViewer = ({ dxfUrl, fonts = [], onLoaded }) => {
  const canvasContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [progressText, setProgressText] = useState(null);
  const [error, setError] = useState(null);
  const [layers, setLayers] = useState([]);
  const dxfViewer = useRef(null);

  // Initialize the DXF Viewer and handle cleanup
  useEffect(() => {
    if (canvasContainerRef.current) {
      // Initialize the DXF viewer only once if it's not already initialized
      if (!dxfViewer.current) {
        dxfViewer.current = new DXFViewer(canvasContainerRef.current, {
          clearColor: new THREE.Color("#fff"),
          autoResize: true,
          colorCorrection: true,
          sceneOptions: {
            wireframeMesh: true,
          },
        });

        // Subscribe to events for DXFViewer
        const subscribe = (eventName) => {
          dxfViewer.current.Subscribe(eventName, (e) => {
            console.log(`Event: ${eventName}`, e);
            if (eventName === "loaded") {
              // Trigger the onLoaded callback once the viewer is loaded
              if (onLoaded) onLoaded(dxfViewer.current);
              // Get and set the layers when the DXF is loaded
              const viewer = dxfViewer.current;
              const loadedLayers = viewer.GetLayers();
              setLayers(loadedLayers);
              loadedLayers.forEach((layer) => {
                layer.isVisible = true; // Set default visibility to true
              });
            }
          });
        };

        const eventNames = [
          "loaded",
          "cleared",
          "destroyed",
          "resized",
          "pointerdown",
          "pointerup",
          "viewChanged",
          "message",
        ];
        eventNames.forEach(subscribe);
      }
    }
  }, [onLoaded]);

  // Load DXF file and handle progress
  const loadDxfFile = async (url) => {
    setIsLoading(true);
    setError(null);
    try {
      await dxfViewer.current.Load({
        url,
        fonts,
        progressCbk: handleProgress,
      });
    } catch (e) {
      setError(e.toString());
    } finally {
      setIsLoading(false);
      setProgressText(null);
      setProgress(null);
    }
  };

  // Handle progress of DXF file loading
  const handleProgress = (phase, size, totalSize) => {
    if (phase !== progressText) {
      switch (phase) {
        case "font":
          setProgressText("Fetching fonts...");
          break;
        case "fetch":
          setProgressText("Fetching file...");
          break;
        case "parse":
          setProgressText("Parsing file...");
          break;
        case "prepare":
          setProgressText("Preparing rendering data...");
          break;
        default:
          break;
      }
    }

    if (totalSize === null) {
      setProgress(-1); // Indeterminate progress
    } else {
      setProgress(size / totalSize);
    }
  };

  // Load the DXF file when component mounts or dxfUrl changes
  useEffect(() => {
    if (dxfUrl) {
      loadDxfFile(dxfUrl);
    }
  }, [dxfUrl]);

  // Toggle visibility of a single layer
  const toggleLayer = (layer, newState) => {
    const viewer = dxfViewer.current;
    viewer.ShowLayer(layer.name, newState); // Show or hide the layer
    layer.isVisible = newState; // Update the layer state
    setLayers([...layers]); // Force re-render with updated layers
  };

  // Toggle visibility of all layers
  const toggleAll = (newState) => {
    layers.forEach((layer) => {
      toggleLayer(layer, newState);
    });
  };

  return (
    <div>
      <div className="canvasContainer" ref={canvasContainerRef}>
        {isLoading && <div className="loading">Loading...</div>}
        {progress !== null && (
          <div className="progress">
            <div className="progressText">{progressText}</div>
            <progress value={progress} max={1}></progress>
          </div>
        )}
        {error && (
          <div className="error">
            <span>Error: {error}</span>
          </div>
        )}
      </div>

      {/* Layers List */}
      {layers.length > 0 && (
        <div className="layersContainer">
          <LayersList layers={layers} toggleLayer={toggleLayer} toggleAll={toggleAll} />
        </div>
      )}
    </div>
  );
};

export default DxfViewer;
