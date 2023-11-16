import React, { useState, useEffect } from 'react';

import axios from 'axios';
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
  const [pdfFile, setPdfFile] = useState(null);
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState<INote[]>([]);
  // const [highLightData, setHighLightData] = useState(null);

  const server = 'http://localhost:8000';

  const processPDF = () => {
    if (pdfFile) {
      const formData = new FormData();
      formData.append('file', file);

      axios.post(`${server}/api/highlight`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(response => {
          // Handle success
          console.log(response);
        })
        .catch(error => {
          // Handle error
          console.log(error);
        });

      // fetch('/response.txt')
      //   .then(response => response.json())
      //   .then(async (data) => {
      //     if (data) {
      //       setNotes(ConvertNoteObject(data));
      //     }
      //   })
      //   .catch(error => console.log(error));
    }
  }

  const savePDF = () => {

  }

  useEffect(() => {
    console.log(notes);
  }, [notes])

  return (
    <div className="container">
      <FileUploadForm setPdfFile={setPdfFile} setFile={setFile} />

      <h5 className='py-3'>
        View PDF
        <span className='float-end'>
          <button className='btn btn-outline-secondary mx-2' onClick={processPDF}>Process PDF</button>
          <button className='btn btn-outline-secondary' onClick={savePDF}>Save PDF</button>
        </span>
      </h5>
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