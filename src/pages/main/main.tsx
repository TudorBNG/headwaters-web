import React, { useState, useEffect, useRef } from 'react';

import axios from 'axios';
import { Worker } from "@react-pdf-viewer/core";
import {
  HighlightArea,
} from "@react-pdf-viewer/highlight";

import Highlights from "../../components/highlight";

import { ConvertNoteObject } from '../../utils';

import { getFileUsingPresignedUrl, getSections, uploadFileToPresignedUrl } from '../../utils/pdfManager';
import { useLocation, useNavigate } from 'react-router';

import './main.scss'
import Modal from '../../components/modal/modal';
import { Oval } from 'react-loader-spinner';

export interface KeyProps {
  id: number;
  content: string;
  quote: string;
  highlightAreas: HighlightArea[];
  label?: string;
  index?: number;
  covered?: boolean;
  section: string;
  comments?: string[];
  aiComments?: string[];
}

const Main = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [file, setFile] = useState(null);
  const [keys, setKeys] = useState<KeyProps[]>([]);
  const [initialKeys, setInitialKeys] = useState<KeyProps[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingCurrentHighlights, setSavingCurrentHighlights] = useState(false);
  const [fileIsLoading, setFileIsLoading] = useState(false);
  const [processCompleted, setProcessCompleted] = useState(false);
  const [processFailed, setProcessFailed] = useState(false);
  const [extractedSections, setExtractedSections] = useState({});

  const [selectedKey, setSelectedKey] = useState<KeyProps>();
  const [selectedAIKey, setSelectedAIKey] = useState<KeyProps>();

  const [triggerProcessing, setTriggerProcessing] = useState<boolean>(false);

  const [showModal, setShowModal] = useState(false);

  const { state } = useLocation();

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('keystone-auth'))?.user;

  const server = process.env.REACT_APP_SERVER_URL;//'https://tk64sfyklbku3h6cviltbs7xde0vxdqm.lambda-url.us-east-1.on.aws';

  const getPdfFile = async ({ filename }: { filename: string }) => {
    setFileIsLoading(true);

    await getFileUsingPresignedUrl({ user, filename, server })
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

    const sections = await getSections({ user, file: filename, server });

    setExtractedSections(sections?.data)

    await axios.get(`${server}api/keys?user=${user}&filename=${filename}`)
      .then(response => response.data)
      .then(highlights => {
        try {
          if (highlights?.message && highlights?.message === 'Spec not found in S3') {
            setFileIsLoading(false);
            setTriggerProcessing(true);
            return;
          }
          const parsedHighlights = JSON.parse(highlights);

          const extractedLabels = [...new Set<string>(parsedHighlights.map((highlight: { label: string }) => highlight?.label))]
          extractedLabels.push(extractedLabels.splice(extractedLabels.indexOf('None'), 1)[0])

          setInitialKeys(parsedHighlights);
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

  const processPDF = async () => {
    setProcessing(true);

    if (pdfFile) {
      await uploadFileToPresignedUrl({ user, file, server }).then(() => {
        axios.post(`${server}api/extract-keys?user=${user}&filename=${file?.name}&division=1`, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Origin': '*',
          }
        })
          .then(response => {
            const { notes: convertedNotes, labels: notesLabels } = ConvertNoteObject(response.data);
            notesLabels.push(notesLabels.splice(notesLabels.indexOf('None'), 1)[0])

            setInitialKeys(convertedNotes);

            setLabels(notesLabels);
            setProcessing(false);
            setProcessCompleted(true);
            setProcessFailed(false);
            navigate('.', { state: { filename: state.filename, status: 'processed' } })
          })
          .catch(error => {
            console.log('Error on processing highlights ', error);
            setProcessing(false);
            setProcessFailed(true);
          });

      })
        .catch(error => {
          console.log('Error on uploading file to presigned url ', error);
          setProcessing(false);
          setProcessFailed(true);
        });
    }
  }

  const savePDF = async () => {
    setSaving(true);
    if (pdfFile) {
      const formData = new FormData();
      formData.append('highlight', JSON.stringify(keys));

      await uploadFileToPresignedUrl({ user, file, server })
        .then(() => axios.post(`${server}api/save_pdf?user=${user}&filename=${file?.name}`, formData, {
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
            console.log('Error on downloading the pdf ', error);
            setSaving(false);
          })
        ).catch((error) => {
          console.error('Error on uploading file to presigned url ', error);
          setSaving(false);
        })
    }
  }

  const saveCurrentHighlights = async () => {
    if (pdfFile) {
      setSavingCurrentHighlights(true);

      // Save Highlights to S3
      const highlightsFormData = new FormData();
      highlightsFormData.append('keys', JSON.stringify(initialKeys));

      await axios.post(`${server}api/keys?user=${user}&filename=${file?.name}`, highlightsFormData, {
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
      await uploadFileToPresignedUrl({ user, file, server })
        .then(() => {
          setSavingCurrentHighlights(false);
        })
        .catch(error => {
          console.error('Error on saving pdf to S3 ', error)
          setSavingCurrentHighlights(false);
        })
    }
  }

  const saveKey = (key: KeyProps) => {
    setInitialKeys([...initialKeys.map((note) => note.id === key.id ? ({ ...key }) : note)]);
  }

  // #TODO
  useEffect(() => {
    saveCurrentHighlights();
  }, [initialKeys])

  const triggerDeleteNote = () => {
    setShowModal(true);
  }

  const deleteNote = () => {
    setInitialKeys([...initialKeys].filter((note) => { return note.id !== selectedKey.id }));
    setSelectedKey(null)
    setShowModal(false);
  }

  useEffect(() => {
    if (!pdfFile) {
      getPdfFile({ filename: state.filename })
    } else {
      if (state.status === 'new') {
        processPDF();
      }
    }
  }, [state?.filename, pdfFile])

  useEffect(() => {

    if (triggerProcessing) {
      setTriggerProcessing(false);
      processPDF();
    }
  }, [triggerProcessing])

  return (<>
    <div className="main-screen-container">
      {fileIsLoading ?
        <div className={"spinner-container"}>
          <Oval
            height="130"
            width="130"
            color="#555555"
            secondaryColor="#bcbcbc"
            ariaLabel="tail-spin-loading"
            strokeWidth={3}
          />
        </div> :
        <>
          {/**disable export to pdf if buttons are added back */}
          {/* <h5 className='py-3'>
        View PDF
        <div className='main-buttons-container'>
          <div className={"wrapper"}>
            <div className={"tooltip"}>Analyses PDF and generates new highlights using AI</div>
            <button
              className={`btn ${processCompleted ? 'btn-success' : processFailed ? 'btn-danger' : 'btn-outline-secondary'} mx-2`}
              onClick={processPDF}
              disabled={processing}
            >
              {processing ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span className="sr-only"> AI Processing...</span>
                </>
              ) : (
                processCompleted ? (
                  <>
                    <span className="mr-2">&#10003;</span>
                    AI Process Completed
                  </>
                ) : processFailed ? (
                  <>
                    <span className="mr-2">&#10060;</span>
                    AI Process Failed
                  </>
                ) : (
                  'Process With AI'
                )
              )}
            </button>
          </div>
          <div className={"wrapper"}>
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
                'Export to PDF'
              )}
            </button>
          </div>
          <div className={"wrapper"}>
            <div className={"tooltip"}>Saves PDF and current highlights</div>
            <button
              className='btn btn-outline-secondary'
              onClick={saveCurrentHighlights}
              disabled={savingCurrentHighlights}
            >
              {savingCurrentHighlights ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span className="sr-only"> Saving...</span>
                </>
              ) : (
                'Save Highlights'
              )}
            </button>
          </div>
        </div>
      </h5> */}
          <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            {/* <div className="viewer"> */}
            {/* render this if we have a pdf file */}
            {pdfFile && (

              <Highlights
                fileUrl={pdfFile}
                keys={keys}
                setKeys={setKeys}
                initialKeys={initialKeys}
                setInitialKeys={setInitialKeys}
                labels={labels}
                selectedKey={selectedKey}
                setSelectedKey={setSelectedKey}
                selectedAIKey={selectedAIKey}
                setSelectedAIKey={setSelectedAIKey}
                filename={state?.filename}
                saveKey={saveKey}
                extractedSections={extractedSections}
              />

            )}


            {/* render this if we have pdfFile state null   */}
            {!pdfFile && <>No file is selected yet</>}
            {/* </div> */}
            {/* {selectedNote &&
          <RightPanel
            labels={labels}
            saveNote={saveNote}
            selectedNote={selectedNote}
            setSelectedNote={setSelectedNote}
            triggerDeleteNote={triggerDeleteNote}
          />} */}
          </div></>}
    </div >
    <Modal visible={showModal} setVisible={setShowModal} onDelete={deleteNote} />
  </>
  )
}

export default Main;
