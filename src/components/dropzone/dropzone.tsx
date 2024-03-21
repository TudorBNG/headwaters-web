import React from "react";
import { useDropzone } from 'react-dropzone';

import './dropzone.scss'

const DragDrop = ({ droppedFile, setDroppedFile, handleOpenDroppedFile, loading }) => {

    const { getRootProps, getInputProps } = useDropzone({
        maxFiles: 1,
        onDrop: (acceptedFiles) => {
            setDroppedFile(acceptedFiles[0])
        }
    });

    return (

        <div className={"dropzone-container"} >
            <div className={"dropzone-body"}>
                <div {...getRootProps()} className={"dropzone"}>
                    <input {...getInputProps()} />
                    <p style={{ backgroundColor: 'lightgray', padding: '10px', borderRadius: '20px' }}>Drag and drop files here or click to browse.</p>
                </div>
                <aside>
                    {!!droppedFile && <h5>Uploaded file:
                        <li key={droppedFile.name}>
                            {droppedFile.name}
                        </li>
                    </h5>
                    }
                </aside>
            </div>
            <div className={"dropzone-footer"}>
                <button className={"process-file-button"} disabled={!droppedFile || loading} onClick={handleOpenDroppedFile}>
                    {
                        loading ?
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span className="sr-only"> Loading...</span>
                            </>
                            :
                            'Open file'
                    }
                </button>
            </div>
        </div>
    );
}

export default DragDrop;