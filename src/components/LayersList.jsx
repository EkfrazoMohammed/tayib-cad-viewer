import React from "react";

const LayersList = ({ layers, toggleLayer, toggleAll }) => {
  return (
    <div className="layersList">
      <button onClick={() => toggleAll(true)}>Show All</button>
      <button onClick={() => toggleAll(false)}>Hide All</button>
      <ul>
        {layers && layers.map((layer) => (
          <li key={layer.name}>
            <label>
              <input
                type="checkbox"
                checked={layer.isVisible}
                onChange={() => toggleLayer(layer, !layer.isVisible)}
              />
              {layer.name}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LayersList;
