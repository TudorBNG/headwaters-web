import React, { useMemo } from 'react';
import Filters from '../filters/filters';
import Keys from '../keys/keys';

import UploadButton from "./../../assets/images/png/upload.png";

import './sidePanel.scss';

const SidePanel = ({
    jobName = '',
    initialKeys,
    keys,
    setKeys,
    keysRef,
    handleContextMenu,
    handleKeyClick,
    triggerKeyDelete,
    menuPosition,
    selectedId,
    selectedKey,
    setSelectedAIKey,
    isMenuOpen,
    currentTab,
    selectedLabel,
    setSelectedLabel,
    openDivision,
    setOpenDivision,
    openSection,
    setOpenSection
}) => {

    const parsedJobName = useMemo(() => {
        const splitIndex = jobName.lastIndexOf('/');

        return jobName.substring(splitIndex + 1);
    }, [])

    return (
        <div className={"side-panel-container"}>
            <div className={"side-panel-top"}>
                <div className={"side-panel-top-header"}>
                    <span className={"side-panel-title"}>Job Name:</span>
                    <img className={"side-panel-edit-button"} src={require("./../../assets/images/png/editbuttons.svg").default} />
                </div>
                <span className={"job-name"}>{parsedJobName.replace(".pdf", "")}</span>
            </div>
            <div className={`side-panel-middle ${(keys.length || currentTab === 1) && 'side-panel-middle-resized'}`}>
                <Filters
                    initialKeys={initialKeys}
                    setKeys={setKeys}
                    selectedLabel={selectedLabel}
                    setSelectedLabel={setSelectedLabel}
                    openDivision={openDivision}
                    setOpenDivision={setOpenDivision}
                    openSection={openSection}
                    setOpenSection={setOpenSection}
                />
            </div>
            <div className={"side-panel-bottom"}>
                {currentTab === 0 ? <Keys
                    keys={keys}
                    keysRef={keysRef}
                    handleContextMenu={handleContextMenu}
                    handleKeyClick={handleKeyClick}
                    triggerKeyDelete={triggerKeyDelete}
                    menuPosition={menuPosition}
                    selectedId={selectedId}
                    selectedKey={selectedKey}
                    setSelectedAIKey={setSelectedAIKey}
                    isMenuOpen={isMenuOpen}
                />
                    :
                    <div className={"comments-container"}>
                        <div className={"comments-header"}>
                            <span className={"comments-title"}>Talk To Spec:</span>
                        </div>

                        <div className={"comments-body"}>
                            <div className={"comments"}>
                                {/* set AI comments here */}
                            </div>
                            <div className={"input-container"}>
                                <input className={"comments-input"} placeholder={"Ask a question..."} />
                                <img className={"comments-input-icon"} src={UploadButton} onClick={() => { }} />
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default SidePanel;