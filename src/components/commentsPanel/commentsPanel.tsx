import React, { useState } from "react";

import './commentsPanel.scss';

import CloseButton from './../../assets/images/png/closebutton.png';
import UploadButton from "./../../assets/images/png/upload.png";
import { ReactComponent as DeleteButton } from './../../assets/images/png/deleteicon.svg';
import { KeyProps } from "../../pages/main/main";

const CommentsPanel = ({
    saveKey,
    triggerDeleteKey,
    selectedAIKey,
    setSelectedAIKey,
    setCurrentTab
}: { [key: string]: any, selectedAIKey: KeyProps }) => {

    const [comment, setComment] = useState<string>('');

    const coverKey = (covered: boolean) => {
        saveKey({ ...selectedAIKey, covered });
        setSelectedAIKey(previousValue => ({ ...previousValue, covered }));
    }

    const handleSubmitComment = () => {
        if (comment) {
            const tempKey = { ...selectedAIKey, comments: selectedAIKey?.comments?.concat([comment]) };

            saveKey({ ...tempKey });
            setSelectedAIKey({ ...tempKey });
            setComment('')
        }
    }

    return (
        <div>
            <div className={"comments-panel-container"}>
                <div className={"comments-panel-header"}>
                    <img className={"comments-panel-close-button"} src={CloseButton} onClick={() => setSelectedAIKey(null)} />
                </div>

                <div className={"ai-comments-container"}>
                    <div className={"ai-comments-header"}>
                        <span className={"ai-comments-title"}>AI</span>
                    </div>

                    <div className={"key-element key-element-selected"}>
                        <div className="key-content"
                            onDoubleClick={() => setCurrentTab(1)}>
                            <div className={"key-content-body"}>
                                <div className={"key-index"}>{!isNaN(selectedAIKey?.index) ? selectedAIKey.index + 1 : 'X'}</div>
                                <div
                                    className={"key-quote"}
                                >
                                    {selectedAIKey.quote}
                                </div>
                            </div>
                        </div>

                        <div className="x-trash" onClick={() => { triggerDeleteKey(selectedAIKey.id) }}>
                            <div className={"white"}>
                                <DeleteButton />
                            </div>
                        </div>
                    </div>


                    <div className={"ai-comments"}>
                        {selectedAIKey?.aiComments?.map((aiComment, index) => (
                            <div className={"key-element"} key={index}>
                                <div className="key-content">
                                    <div className={"key-content-body"}>
                                        <div className={"key-index"}>{index + 1}</div>
                                        <div
                                            className={"key-quote"}
                                        >
                                            {aiComment}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={"covered-status-container"}>
                    <div className={"covered-status-buttons"}>
                        <button className={`${selectedAIKey.covered && "covered"}`} onClick={() => coverKey(true)}>Covered</button>
                        <button className={`${!selectedAIKey.covered && "not-covered"}`} onClick={() => coverKey(false)}>Not Covered</button>
                    </div>
                </div>

                <div className={"comments-container"}>
                    <div className={"comments-header"}>
                        <span className={"comments-title"}>Job Comments</span>
                    </div>

                    <div className={"comments-body"}>
                        <div className={"comments"}>
                            {selectedAIKey.comments?.map((comment, index) => (
                                <div className={"key-element"} key={index}>
                                    <div className="key-content">
                                        <div className={"key-content-body"}>
                                            <div className={"key-index"}>{index + 1}</div>
                                            <div
                                                className={"key-quote"}
                                            >
                                                {comment}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className={"input-container"}>
                            <input className={"comments-input"} placeholder={"Add job comments..."} value={comment} onChange={event => setComment(event.target.value)} />
                            <img className={"comments-input-icon"} src={UploadButton} onClick={handleSubmitComment} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CommentsPanel