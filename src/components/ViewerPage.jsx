import React, { useState,useEffect, useRef } from "react";
import { ACI_COLOR_MAP } from "./aciColorMap"; // or define it in the same file

import DxfViewer from "./DxfViewer";
import mainFont from "./../assets/fonts/Roboto-LightItalic.ttf"
import aux1Font from "./../assets/fonts/NotoSansDisplay-SemiCondensedLightItalic.ttf"
import aux2Font from "./../assets/fonts/HanaMinA.ttf"
import aux3Font from "./../assets/fonts/NanumGothic-Regular.ttf"
const ViewerPage = ({ dxfUrl }) => {
  const [layers, setLayers] = useState(null);
  const viewerRef = useRef(null);
  // Define font URLs (e.g., local or remote TTF files)
  // Define font array using imported TTF files
  const fonts = [mainFont, aux1Font, aux2Font, aux3Font];

  // // Get layers from DXF viewer when it's loaded
  // const handleLoaded = (viewerInstance) => {
  //   const layers = viewerInstance.GetLayers();
  //   setLayers(layers);
  //   layers.forEach((layer) => {
  //     layer.isVisible = true;

  //   // Map ACI to hex color and apply
  //   const aci = layer.colorIndex ?? 7; // default to white if missing
  //   const hexColor = ACI_COLOR_MAP[aci] || "#FFFFFF";
  //   if (!(aci in ACI_COLOR_MAP)) {
  //     console.warn(`Missing ACI mapping for index: ${aci}`);
  //   }
    
  //   try {
  //     const viewer = viewerRef.current.GetViewer();
  //     viewer.SetLayerColor?.(layer.name, hexColor); // Use if supported
  //   } catch (err) {
  //     console.warn(`Could not set color for ${layer.name}`, err);
  //   }

  //   });
  // };

  // const handleLoaded = (viewerInstance) => {
  //   setLayers(viewerInstance.GetLayers());
  // };
  const extractPlainText = (rawText) => {
    if (!rawText) return "";
  
    return rawText
      .replace(/\\[cC]\d+;/g, "") // remove color codes like \c8516343;
      .replace(/\\[fF][^;]+;/g, "") // remove font definitions
      .replace(/\\[Hh][^;]+;/g, "") // remove height
      .replace(/\\[lL]/g, "") // remove underline tags
      .replace(/\\[oO]/g, "") // remove overline tags
      .replace(/\\[qQ][^;]+;/g, "") // remove oblique angle
      .replace(/\\[a-zA-Z0-9]+;/g, "") // catch-all for other escape codes
      .replace(/\\P/g, "\n") // paragraph break
      .trim();
  };
  
  const handleLoaded = (viewerInstance) => {
    const allEntities = viewerInstance._entities || [];
  
    allEntities.forEach((entity) => {
      console.log(entity)
      if ((entity.type === "MTEXT" || entity.type === "TEXT") && typeof entity.text === "string") {
        const clean = extractPlainText(entity.text);
        console.log("Clean text:", clean); // --> e.g., "92/2"
        entity.text = clean; // overwrite if viewer renders this
      }
  
      // Optional: if entity.textChunks exists
      if (entity.textChunks && Array.isArray(entity.textChunks)) {
        entity.textChunks.forEach((chunk) => {
          if (chunk.text) {
            chunk.text = extractPlainText(chunk.text);
          }
        });
      }
    });
  
    setLayers(viewerInstance.GetLayers());
  };
  
  
  
  useEffect(() => {
    if (!layers || !viewerRef.current?.GetViewer) return;
  
    const viewer = viewerRef.current.GetViewer();
  
    layers.forEach((layer) => {
      layer.isVisible = true;
  
      let hexColor = "#FFFFFF"; // default white
  
      const aci = layer.colorIndex;
  
      if (aci != null && ACI_COLOR_MAP[aci]) {
        hexColor = ACI_COLOR_MAP[aci];
      } else if (layer.trueColor) {
        // fallback if layer has true color as decimal
        const value = layer.trueColor;
        const r = (value >> 16) & 0xff;
        const g = (value >> 8) & 0xff;
        const b = value & 0xff;
        hexColor = `rgb(${r}, ${g}, ${b})`;
      }
  
      try {
        viewer.SetLayerColor?.(layer.name, hexColor);
      } catch (err) {
        console.warn(`Could not set color for ${layer.name}`, err);
      }
    });
  }, [layers]);
  
  
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
          fonts={fonts} // Pass fonts to DxfViewer
          onLoaded={handleLoaded}
          onCleared={handleCleared}
        />
      </div>
     
    </div>
  );
};

export default ViewerPage;
