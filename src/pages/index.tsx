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
  quote: string;
  highlightAreas: HighlightArea[];
}

const Main = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState<INote[]>([]);

  const server = 'http://localhost:8000';

  const processPDF = () => {
    if (pdfFile) {
      const formData = new FormData();
      formData.append('file', file);

      axios.post(`${server}/api/highlight`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Access-Control-Allow-Origin': '*',
        }
      })
        .then(response => {
          console.log('response = ', response);
          setNotes(ConvertNoteObject(response.data));
        })
        .catch(error => {
          console.log(error);
        });
    }
  }

  const savePDF = () => {
    if (pdfFile) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('highlight', JSON.stringify(notes));

      axios.post(`${server}/api/save_pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Access-Control-Allow-Origin': '*',
        },
        responseType: 'blob'
      })
        .then(response => {
          // Handle success
          const file = new Blob(
            [response.data],
            { type: 'application/pdf' }
          );
          const fileURL = URL.createObjectURL(file);

          const link = document.createElement('a');
          link.href = fileURL;
          link.setAttribute(
            'download',
            `highlight.pdf`,
          );

          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
        })
        .catch(error => {
          console.log(error);
        });
    }
  }

  useEffect(() => {
    console.log('-------------------- Highlight Data ---------------------- ');
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