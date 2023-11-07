import React, { useState } from 'react';

// Import Worker
import { Worker } from "@react-pdf-viewer/core";

import FileUploadForm from '../components/fileUploadForm';
import HighlightExample from "../components/highlight";

const Main = () => {
  // pdf file onChange state
  const [pdfFile, setPdfFile] = useState(null);

  return (
    <div className="container">
      <FileUploadForm setPdfFile={setPdfFile} />

      <h5>View PDF</h5>
      <div className="viewer">
        {/* render this if we have a pdf file */}
        {pdfFile && (
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.12.313/build/pdf.worker.min.js">
            <HighlightExample fileUrl={pdfFile}></HighlightExample>
          </Worker>
        )}

        {/* render this if we have pdfFile state null   */}
        {!pdfFile && <>No file is selected yet</>}
      </div>
    </div>
  )
}

export default Main;