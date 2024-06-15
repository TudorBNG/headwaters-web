import React from "react";
import "./comments.scss";

import UploadButton from "./../../../assets/images/png/upload.png";
import { ReactComponent as DeleteButton } from './../../../assets/images/png/deleteicon.svg';

const Comments = ({ selectedAIKey, header, inputPlaceholder, aiComments, removeComment }) => {

    return (
        <div className={"comments-component-container"}>
            <span className={"comments-header"}>{header}</span>
            <div className={"comments-body"}>
                <div className={"comments-list"}>
                    {[...((aiComments ? selectedAIKey?.aiComments : selectedAIKey?.comments) || [])]
                        .map((comment, index) => (
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

                                    <div className="x-trash" onClick={() => removeComment(aiComments, index)}>
                                        <div className={""}>
                                            <DeleteButton />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
                <div className={"input-container"}>
                    <input className={"comments-input"} placeholder={inputPlaceholder} />
                    <img className={"comments-input-icon"} src={UploadButton} onClick={() => { }} />
                </div>
            </div>
        </div>
    )
}

export default Comments;