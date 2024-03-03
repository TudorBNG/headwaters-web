import React, { useState, useEffect, useRef } from 'react';

import axios from 'axios';
import { Worker } from "@react-pdf-viewer/core";
import {
  HighlightArea,
} from "@react-pdf-viewer/highlight";

import FileUploadForm from '../components/fileUploadForm';
import HighlightExample from "../components/highlight";

import { ConvertNoteObject } from '../utils';
import FileDropdown from '../components/fileDropdown';

export interface INote {
  id: number;
  content: string;
  quote: string;
  highlightAreas: HighlightArea[];
  label?: string;
}

const Main = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState<INote[]>([]);
  const [initialNotes, setInitialNotes] = useState<INote[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingCurrentHighlights, setSavingCurrentHighlights] = useState(false);
  const [fileIsLoading, setFileIsLoading] = useState(false);
  const [processCompleted, setProcessCompleted] = useState(false);
  const [processFailed, setProcessFailed] = useState(false);
  const [files, setUserFiles] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const inputRef = useRef(null);

  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('keystone-auth'))?.user;

  const server = 'https://tk64sfyklbku3h6cviltbs7xde0vxdqm.lambda-url.us-east-1.on.aws';

  const getUserLibrary = async () => {
    await axios.get(`${server}/api/get_user_library?user=${user}`)
      .then(responseFiles => setUserFiles(responseFiles.data))
      .catch((error) => {
        console.error('Error on receiving library ', error)
      })
  }

  const getPdfFile = async ({ filename }: { filename: string }) => {
    setFileIsLoading(true);
    inputRef.current.value = null;
    await fetch(`${server}/api/get_pdf_file?user=${user}&filename=${filename}`)
      .then(response => response.blob())
      .then((pdf) => {
        const pdfFile = new File([pdf], filename)
        setFile(pdfFile)

        const pdfUrl = window.URL.createObjectURL(pdf);
        setPdfFile(pdfUrl)
      }).catch(error => {
        console.error('Error on receiving the PDF ', error);
        setFileIsLoading(false);
      })

    await axios.get(`${server}/api/get_pdf_highlights?user=${user}&filename=${filename}`)
      .then(response => response.data)
      .then(highlights => {
        try {
          const parsedHighlights = JSON.parse(highlights);

          const extractedLabels = [...new Set<string>(parsedHighlights.map((highlight: { label: string }) => highlight?.label))]
          extractedLabels.push(extractedLabels.splice(extractedLabels.indexOf('None'), 1)[0])

          setInitialNotes(parsedHighlights);
          setNotes(parsedHighlights);
          setLabels(extractedLabels);
          setFileIsLoading(false);
        } catch (error) {
          console.error('Error on parsing the highlights ', error);
          setFileIsLoading(false);
        }

      }).catch(error => {
        console.error('Error on receiving the highlights ', error);
        setFileIsLoading(false);
      })
  }

  useEffect(() => {
    getUserLibrary();
  }, [user])

  const processPDF = () => {
    setProcessing(true);
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
          const { notes: convertedNotes, labels: notesLabels } = ConvertNoteObject(response.data);
          notesLabels.push(notesLabels.splice(notesLabels.indexOf('None'), 1)[0])

          setInitialNotes(convertedNotes);
          setNotes(convertedNotes);
          setLabels(notesLabels);
          setProcessing(false);
          setProcessCompleted(true);
          setProcessFailed(false);
        })
        .catch(error => {
          console.log(error);
          setProcessing(false);
          setProcessFailed(true);
        });
    }
  }

  const savePDF = () => {
    setSaving(true);
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
          setSaving(false);
        })
        .catch(error => {
          console.log(error);
          setSaving(false);
        });
    }
  }

  const saveCurrentHighlights = async () => {
    if (pdfFile) {
      setSavingCurrentHighlights(true);

      // Save Highlights to S3
      const highlightsFormData = new FormData();
      highlightsFormData.append('highlight', JSON.stringify(initialNotes));

      await axios.post(`${server}/api/save_highlights?user=${user}&pdf_filename=${file?.name}`, highlightsFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Access-Control-Allow-Origin': '*',
        },
      })
        .catch(error => {
          console.error('Error on saving highlights ', error)
          setSavingCurrentHighlights(false);
        })

      // Save PDF to S3
      const pdfFormData = new FormData();
      pdfFormData.append('file', file);

      await axios.post(`${server}/api/save_pdf_s3?user=${user}&pdf_filename=${file?.name}`, pdfFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Access-Control-Allow-Origin': '*',
        },
      })
        .then(() => {
          setSavingCurrentHighlights(false);
          getUserLibrary();
        })
        .catch(error => {
          console.error('Error on saving pdf to S3 ', error)
          setSavingCurrentHighlights(false);
        })
    }
  }

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  return (
    <div className="container">
      <FileUploadForm setPdfFile={setPdfFile} setFile={setFile} setInitialNotes={setInitialNotes} inputRef={inputRef} />

      {!!files.length && <FileDropdown files={files} getPdfFile={getPdfFile} fileIsLoading={fileIsLoading} dropdownRef={dropdownRef} isOpen={dropdownOpen} setIsOpen={setDropdownOpen} />}

      <h5 className='py-3'>
        View PDF
        <span className='float-end'>
          <button
            className={`btn ${processCompleted ? 'btn-success' : processFailed ? 'btn-danger' : 'btn-outline-secondary'} mx-2`}
            onClick={processPDF}
            disabled={processing}
          >
            {processing ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span className="sr-only"> Processing...</span>
              </>
            ) : (
              processCompleted ? (
                <>
                  <span className="mr-2">&#10003;</span> {/* Check mark symbol */}
                  Process Completed
                </>
              ) : processFailed ? (
                <>
                  <span className="mr-2">&#10060;</span> {/* Cross mark symbol */}
                  Process Failed
                </>
              ) : (
                'Process PDF'
              )
            )}
          </button>
          <button
            className='btn btn-outline-secondary'
            onClick={savePDF}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span className="sr-only"> Saving...</span>
              </>
            ) : (
              'Save PDF'
            )}
          </button>
          <button
            className='btn btn-outline-secondary'
            style={{ marginLeft: '8px' }}
            onClick={saveCurrentHighlights}
            disabled={savingCurrentHighlights}
          >
            {savingCurrentHighlights ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span className="sr-only"> Saving...</span>
              </>
            ) : (
              'Save Current Highlights'
            )}
          </button>
        </span>
      </h5>
      <div className="viewer">
        {/* render this if we have a pdf file */}
        {pdfFile && (
          <Worker workerUrl="/pdf.worker.min.js">
            <HighlightExample fileUrl={pdfFile} notes={notes} setNotes={setNotes} initialNotes={initialNotes} setInitialNotes={setInitialNotes} labels={labels}></HighlightExample>
          </Worker>
        )}

        {/* render this if we have pdfFile state null   */}
        {!pdfFile && <>No file is selected yet</>}
      </div>
    </div>
  )
}

export default Main;
