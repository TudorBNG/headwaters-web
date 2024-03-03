import React, { MutableRefObject } from "react";
import './fileDropdown.scss'

interface FileDropdownInput {
    files: string[];
    getPdfFile: Function;
    fileIsLoading: boolean;
    dropdownRef: MutableRefObject<any>;
    isOpen: boolean;
    setIsOpen: Function;
}

const FileDropdown = ({ dropdownRef, files = [], getPdfFile, fileIsLoading = false, isOpen = false, setIsOpen }: FileDropdownInput) => {



    const triggerGetFile = (filename: string) => {
        setIsOpen(false);
        getPdfFile({ filename });
    }


    return (
        <div ref={dropdownRef} className={'file-dropdown'}>
            <button className={'file-dropdown-header'} onClick={() => setIsOpen(!isOpen)} disabled={fileIsLoading}>{fileIsLoading ? 'Your file is loading' : 'Select a file'}</button>
            {isOpen && (
                <div className={'file-dropdown-list'}>
                    {files.map((filename, index) => (
                        <button className={'file-dropdown-list-item'} key={index} onClick={() => triggerGetFile(filename)}>
                            {filename}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

}

export default FileDropdown;