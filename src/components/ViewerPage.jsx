import React, { useState, useEffect, useRef } from "react";
import { getByACI } from "./color"; // your color map util
import DxfViewer from "./DxfViewer";
import mainFont from "./../assets/fonts/Roboto-LightItalic.ttf";
import aux1Font from "./../assets/fonts/NotoSansDisplay-SemiCondensedLightItalic.ttf";
import aux2Font from "./../assets/fonts/HanaMinA.ttf";
import aux3Font from "./../assets/fonts/NanumGothic-Regular.ttf";

const ViewerPage = ({ dxfUrl }) => {
  const [layers, setLayers] = useState(null);
  const viewerRef = useRef(null);
  const fonts = [mainFont, aux1Font, aux2Font, aux3Font];
 
  const extractPlainText = (rawText) => {
    if (!rawText) return "";
    return rawText
      .replace(/\\[cC]\d+;?/g, "")        // color override
      .replace(/;/g, "")                  // leftover semicolons
      .replace(/\\[fF][^;]*;/g, "")       // font override
      .replace(/\\[Hh][^;]*;/g, "")       // height override
      .replace(/\\[lL]/g, "")             // underline
      .replace(/\\[oO]/g, "")             // overline
      .replace(/\\[qQ][^;]*;/g, "")       // alignment
      .replace(/\\[a-zA-Z0-9]+;/g, "")    // misc codes
      .replace(/\\P/g, "\n")              // paragraph breaks
      .replace(/\\~/g, " ")               // non-breaking space
      .trim();
  };
  
  const handleLoaded = (viewerInstance) => {
    console.log(viewerInstance)
    const allEntities = viewerInstance._entities || [];
    console.log(allEntities)
    allEntities.forEach((entity) => {
      if ((entity.type === "MTEXT" || entity.type === "TEXT") && typeof entity.text === "string") {
        entity.text = extractPlainText(entity.text);
        console.log("Raw Text:", entity.text);

      }
      if (Array.isArray(entity.textChunks)) {
        entity.textChunks.forEach(chunk => {
          console.log("Raw Text:", chunk.text);

          if (chunk.text) chunk.text = extractPlainText(chunk.text);
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
    
      let hexColor = "#FFFFFF"; // default fallback
    
      try {
        if (typeof layer.trueColor === "number") {
          const val = layer.trueColor;
          const r = (val >> 16) & 0xff;
          const g = (val >> 8) & 0xff;
          const b = val & 0xff;
          hexColor = `rgb(${r}, ${g}, ${b})`;
        } else if (typeof layer.colorIndex === "number") {
          const colorACI = getByACI(layer.colorIndex);
          if (colorACI?.rgb) {
            hexColor = colorACI.rgb;
          }
        } else if (typeof layer.color === "number") {
          const r = (layer.color >> 16) & 0xff;
          const g = (layer.color >> 8) & 0xff;
          const b = layer.color & 0xff;
          hexColor = `rgb(${r}, ${g}, ${b})`;
        }
      } catch (e) {
        console.warn(`Failed to compute color for layer "${layer.name}"`, e);
      }
    
      layer.rgbColor = hexColor; // ✅ Store the computed color for external use
    
      try {
        viewer.SetLayerColor?.(layer.name, hexColor);
      } catch (err) {
        console.warn(`Failed to apply color for layer "${layer.name}"`, err);
      }
    });
    
  }, [layers]);

  return (
    <div className="viewerPage">
      <div className="dxfViewerContainer">
        <DxfViewer
          ref={viewerRef}
          dxfUrl={dxfUrl}
          fonts={fonts}
          onLoaded={handleLoaded}
          onCleared={() => setLayers(null)}
        />
      </div>
    </div>
  );
};

export default ViewerPage;
