import React, { useState, useEffect } from 'react';

// Import Worker
import { Worker } from "@react-pdf-viewer/core";

import FileUploadForm from '../components/fileUploadForm';
import HighlightExample from "../components/highlight";

import { ConvertNoteObject } from '../utils';

const Main = () => {
  // pdf file onChange state
  const [pdfFile, setPdfFile] = useState(null);
  const [highLightData, setHighLightData] = useState(null);

  useEffect(() => {
    fetch('/response.txt')
      .then(response => response.json())
      .then(async (data) => {
        if (data) {
          setHighLightData(ConvertNoteObject(data));
        }
      })
      .catch(error => console.log(error));
  }, [])

  useEffect(() => {
    console.log(highLightData);
  }, [highLightData])

  return (
    <div className="container">
      <FileUploadForm setPdfFile={setPdfFile} />

      <h5>View PDF</h5>
      <div className="viewer">
        {/* render this if we have a pdf file */}
        {pdfFile && (
          <Worker workerUrl="/pdf.worker.min.js">
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