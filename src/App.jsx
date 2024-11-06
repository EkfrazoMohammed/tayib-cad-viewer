import React, { useState } from "react";
import ViewerPage from "./components/ViewerPage";

function App() {
  const [dxfUrl, setDxfUrl] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Create a URL object for the uploaded file
      const fileUrl = URL.createObjectURL(file);
      setDxfUrl(fileUrl);
    }
  };

  return (
    <div>
      <h1>DXF VIEWER</h1>
      <input
        type="file"
        accept=".dxf"
        onChange={handleFileChange}
        style={{ margin: "20px 0" }}
      />
      {dxfUrl && <ViewerPage dxfUrl={dxfUrl} />}
    </div>
  );
}

export default App;
