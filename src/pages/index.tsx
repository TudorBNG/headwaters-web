import React, { useState, useEffect } from 'react';

// Import Worker
import { Worker } from "@react-pdf-viewer/core";
import {
  HighlightArea,
} from "@react-pdf-viewer/highlight";

import FileUploadForm from '../components/fileUploadForm';
import HighlightExample from "../components/highlight";

import { ConvertNoteObject } from '../utils';

export interface INote {
  id: number;
  content: string;
  highlightAreas: HighlightArea[];
}

const Main = () => {
  // pdf file onChange state
  const [pdfFile, setPdfFile] = useState(null);
  const [notes, setNotes] = useState<INote[]>([]);
  // const [highLightData, setHighLightData] = useState(null);

  const processPDF = () => {
    if (pdfFile) {
      fetch('/response.txt')
        .then(response => response.json())
        .then(async (data) => {
          if (data) {
            setNotes(ConvertNoteObject(data));
          }
        })
        .catch(error => console.log(error));
    }
  }

  useEffect(() => {
    console.log(notes);
  }, [notes])

  return (
    <div className="container">
      <FileUploadForm setPdfFile={setPdfFile} />

      <h5 className='py-2'>View PDF<button className='btn btn-outline-secondary float-end' onClick={processPDF}>Process PDF</button></h5>
      <div className="viewer">
        {/* render this if we have a pdf file */}
        {pdfFile && (
          <Worker workerUrl="/pdf.worker.min.js">
            <HighlightExample fileUrl={pdfFile} notes={notes} setNotes={setNotes}></HighlightExample>
          </Worker>
        )}

        {/* render this if we have pdfFile state null   */}
        {!pdfFile && <>No file is selected yet</>}
      </div>
    </div>
  )
}

export default Main;