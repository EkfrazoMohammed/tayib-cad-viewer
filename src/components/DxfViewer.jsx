import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { DxfViewer as DXFViewer } from "dxf-viewer";
import LayersList from "./LayersList";
import { getByACI } from "./color"; // ACI map util

const DxfViewer = ({ dxfUrl, fonts = [], onLoaded }) => {
  const canvasContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [progressText, setProgressText] = useState(null);
  const [error, setError] = useState(null);
  const [layers, setLayers] = useState([]);
  const dxfViewer = useRef(null);

  useEffect(() => {
    if (canvasContainerRef.current && !dxfViewer.current) {
      dxfViewer.current = new DXFViewer(canvasContainerRef.current, {
        clearColor: new THREE.Color("#fff"),
        autoResize: true,
        colorCorrection: true,
        sceneOptions: {
          wireframeMesh: true,
        },
      });

      const subscribe = (eventName) => {
        dxfViewer.current.Subscribe(eventName, (e) => {
          console.log(`Event: ${eventName}`, e);
          if (eventName === "loaded") {
            const viewer = dxfViewer.current;
            const loadedLayers = viewer.GetLayers();

            loadedLayers.forEach((layer) => {
              layer.isVisible = true;

              let hexColor = "#FFFFFF";

              try {
                if (typeof layer.trueColor === "number") {
                  const val = layer.trueColor;
                  const r = (val >> 16) & 0xff;
                  const g = (val >> 8) & 0xff;
                  const b = val & 0xff;
                  hexColor = `rgb(${r}, ${g}, ${b})`;
                } else if (typeof layer.colorIndex === "number") {
                  const aciColor = getByACI(layer.colorIndex);
                  if (aciColor?.rgb) hexColor = aciColor.rgb;
                }
              } catch (err) {
                console.warn(`Failed to compute color for layer ${layer.name}`, err);
              }

              layer.rgbColor = hexColor;

              try {
                viewer.SetLayerColor?.(layer.name, hexColor);
              } catch (err) {
                console.warn(`SetLayerColor error for ${layer.name}`, err);
              }
            });

            setLayers(loadedLayers);
            if (onLoaded) onLoaded(viewer);
          }
        });
      };

      [
        "loaded",
        "cleared",
        "destroyed",
        "resized",
        "pointerdown",
        "pointerup",
        "viewChanged",
        "message",
      ].forEach(subscribe);
    }
  }, [onLoaded]);

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

  const handleProgress = (phase, size, totalSize) => {
    if (phase !== progressText) {
      const phaseTextMap = {
        font: "Fetching fonts...",
        fetch: "Fetching file...",
        parse: "Parsing file...",
        prepare: "Preparing rendering data...",
      };
      setProgressText(phaseTextMap[phase] || "");
    }

    if (totalSize === null) {
      setProgress(-1);
    } else {
      setProgress(size / totalSize);
    }
  };

  useEffect(() => {
    if (dxfUrl) {
      loadDxfFile(dxfUrl);
    }
  }, [dxfUrl]);

  const toggleLayer = (layer, newState) => {
    const viewer = dxfViewer.current;
    viewer.ShowLayer(layer.name, newState);
    layer.isVisible = newState;
    setLayers([...layers]);
  };

  const toggleAll = (newState) => {
    layers.forEach((layer) => {
      toggleLayer(layer, newState);
    });
  };

  return (
    <div style={{ display: "flex", gap: "2rem" }}>
      <div
        className="canvasContainer"
        ref={canvasContainerRef}
        style={{ position: "fixed", top: 0, left: 0 }}
      >
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

      {layers.length > 0 && (
        <div className="layersContainer">
          <LayersList
            layers={layers}
            toggleLayer={toggleLayer}
            toggleAll={toggleAll}
          />
        </div>
      )}
    </div>
  );
};

export default DxfViewer;
