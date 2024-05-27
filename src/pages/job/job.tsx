import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import DragDrop from "../../components/dropzone/dropzone";
import FileList from "../../components/fileList/fileList";
import JobListOptions from "../../components/jobListOptions/jobListOptions";
import CornerLogo from './../../assets/images/png/keystonelogo.png';
import { uploadFileToPresignedUrl } from "../../utils/pdfManager";

import './job.scss'

const Job = () => {

    const { state } = useLocation()
    const navigate = useNavigate();

    const [userLibrary, setUserLibrary] = useState([]);
    const [currentTab, setCurrentTab] = useState(state?.tab || 0);
    const [selectedFileIndex, setSelectedFileIndex] = useState(-1);
    const [selectedFile, setSelectedFile] = useState();
    const [droppedFile, setDroppedFile] = useState<File>();
    const [fileList, setFileList] = useState([]);

    const [loading, setLoading] = useState(false);

    const user = useMemo(() => {
        return JSON.parse(localStorage.getItem('keystone-auth'))?.user;
    }, [localStorage])

    const server = 'https://tk64sfyklbku3h6cviltbs7xde0vxdqm.lambda-url.us-east-1.on.aws';

    const getUserLibrary = async () => {
        await axios.get(`${server}/api/get_user_library?user=${user}`)
            .then(responseFiles => {
                setUserLibrary(responseFiles.data)

                const parsedFiles = responseFiles.data?.map((file: string, index) => {
                    const splitIndex = file.lastIndexOf('/');
                    const location = file.substring(0, splitIndex) || '~';
                    const name = file.substring(splitIndex);

                    return { id: index, name, location, status: 'Uploaded' }
                })

                setFileList(parsedFiles)

            })
            .catch((error) => {
                console.error('Error on receiving library ', error)
            })
    }

    const handleFileSelect = (index) => {
        setSelectedFile(userLibrary[index])
        setSelectedFileIndex(index);
    }

    const handleOpenFile = () => {
        navigate('/keystone', { state: { filename: selectedFile } })
    }

    const handleOpenDroppedFile = async () => {
        if (droppedFile) {
            setLoading(true);
            await uploadFileToPresignedUrl({ user, file: droppedFile, server })
                .then(() => {
                    navigate('/keystone', { state: { filename: droppedFile?.name || '' } })
                    setLoading(false);
                }).catch(() => {
                    setLoading(false);
                })
        }
    }

    useEffect(() => {
        getUserLibrary();
    }, [])

    useEffect(() => {
        setCurrentTab(state.tab)
    }, [state])

    return (
        <div className={"job-page-container"}>
            <JobListOptions currentTab={currentTab} setCurrentTab={setCurrentTab} />
            <div className={"job-container"}>

                <div className={"body-container"}>
                    {currentTab === 0 ?
                        <FileList
                            files={fileList}
                            handleFileSelect={handleFileSelect}
                            selectedFileIndex={selectedFileIndex}
                            handleOpenFile={handleOpenFile}
                        />
                        :
                        <DragDrop droppedFile={droppedFile} setDroppedFile={setDroppedFile} handleOpenDroppedFile={handleOpenDroppedFile} loading={loading} />
                    }
                    <img src={CornerLogo} className={"logo"} />
                </div>
            </div>
        </div>
    )
}

export default Job;