import React from "react";

import './fileList.scss'

const FileList = ({ files, handleFileSelect, selectedFileIndex = -1, handleOpenFile }) => {

    return (
        <div className={"filelist-container"}>
            <table>
                <tr>
                    <th style={{ flex: 1 }}>Job No.</th>
                    <th style={{ flex: 1 }}>Job Name</th>
                    <th style={{ flex: 1 }}>Location</th>
                    <th style={{ flex: 5 }}>Specification uploaded</th>
                    <th style={{ flex: 1 }}>Status</th>
                </tr>
                {files.map((file, index) => {
                    return <tr className={`${index === selectedFileIndex && 'tr-selected'}`} key={index} onClick={() => handleFileSelect(index)} >
                        <td style={{ flex: 1 }}>{index + 1}</td>
                        <td style={{ flex: 1 }}></td>
                        <td style={{ flex: 1 }}>{file.location}</td>
                        <td style={{ flex: 5 }}><span>{file.name}</span></td>
                        <td style={{ flex: 1, fontWeight: 600 }}>{file.status}</td>
                    </tr>
                })}
            </table>
            <div className={"filelist-footer"}>
                <button className={"select-file-button"} disabled={selectedFileIndex === -1} onClick={() => handleOpenFile()}>Open file</button>
            </div>
        </div>
    )
}

export default FileList