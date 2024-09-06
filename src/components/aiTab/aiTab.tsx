import React from "react";

import "./aiTab.scss";
import Comments from "./comments/comments";

import { ReactComponent as DeleteButton } from './../../assets/images/png/deleteicon.svg';
import { Division, Section } from "../../utils/interfaces";
import { KeyProps } from "../../pages/main/main";

interface AITabProps {
    openDivision: Division;
    openSection: Section;
    keys: KeyProps[];
    selectedAIKey: KeyProps;
    setSelectedAIKey: Function;
    saveKey: Function;
}

const AITab = ({ openDivision, openSection, keys, selectedAIKey, setSelectedAIKey, saveKey }: AITabProps) => {

    const removeComment = (aiComments, index) => {
        if (aiComments) {
            selectedAIKey.aiComments?.splice(index, 1);

        } else {
            selectedAIKey.comments?.splice(index, 1);
        }
        saveKey({ ...selectedAIKey })
    }

    return (
        <div className={"ai-tab-container"}>
            <div className={"key-path-container"}>
                <div className={"key-path-division"}>
                    <div className={"key-path-division-header"}>Select A Division:</div>
                    <div className={"key-path-division-content"}>{openDivision?.title}</div>
                </div>
                <div className={"key-path-section"}>
                    <div className={"key-path-division-header"}>Select A Section:</div>
                    <div className={"key-path-division-content"}>{openSection?.title}</div>
                </div>
                <div className={"keys"}>
                    <div className={"key-path-division-header"}>Select A Key:</div>
                    <div className={"ai-keys-container"}>
                        {keys.map((key, index) => (
                            <div className={`key-element ${selectedAIKey?.id === key.id && "key-element-selected"}`} key={index}>
                                <div className="key-content" onClick={() => setSelectedAIKey({ ...key, index })}>
                                    <div className={"key-content-body"}>
                                        <div className={"key-index"}>{index + 1}</div>
                                        <div
                                            className={"key-quote"}
                                        >
                                            {key.quote}
                                        </div>
                                    </div>

                                    <div className="x-trash" onClick={() => { }}>
                                        <div className={""}>
                                            <DeleteButton />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className={"comments"}>
                <Comments aiComments={true} selectedAIKey={selectedAIKey} header={"AI:"} inputPlaceholder={"Add AI comments..."} removeComment={removeComment} saveKey={saveKey} setSelectedAIKey={setSelectedAIKey} />
                <Comments aiComments={false} selectedAIKey={selectedAIKey} header={"Job Comments:"} inputPlaceholder={"Add job comments..."} removeComment={removeComment} saveKey={saveKey} setSelectedAIKey={setSelectedAIKey} />
            </div>
        </div>
    )
}

export default AITab;