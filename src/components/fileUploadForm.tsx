import React, { useState } from 'react';

interface IProps {
  setPdfFile: Function
  setFile: Function
}

const FileUploadForm = (props: IProps) => {
  // pdf file error state
  const [pdfError, setPdfError] = useState('');

  // handle file onChange event
  const allowedFiles = ['application/pdf'];

  const handleFile = (e: any) => {
    let selectedFile = e.target.files[0];
    // console.log(selectedFile.type);
    if (selectedFile) {
      if (selectedFile && allowedFiles.includes(selectedFile.type)) {
        props.setFile(selectedFile);

        let reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onloadend = (e: any) => {
          setPdfError('');
          props.setPdfFile(e.target.result);
        };
      } else {
        setPdfError("Not a valid pdf: Please select only PDF");
        props.setPdfFile(null);
      }
    } else {
      console.log("please select a PDF");
    }
  };

  return (
    <form>
      <label><h5>Upload PDF</h5></label>
      <br></br>
      <input
        type="file"
        className="form-control"
        onChange={handleFile}
      />

      {/* we will display error message in case user select some file other than pdf */}
      {pdfError && <span className="text-danger">{pdfError}</span>}
    </form>
  )
}

export default FileUploadForm;