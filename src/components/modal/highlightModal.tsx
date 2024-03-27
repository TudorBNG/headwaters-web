import React, { useRef } from "react";
import './modal.scss'


const HighlightModal = ({
    visible,
    setVisible,
    onAction,
    highlightLabel,
    setHighlightLabel,
    labels,
    showCommentInput,
    setShowCommentInput,
    setMessage,
    highlightProps,
}) => {
    const modalRef = useRef(null);

    return (
        <>
            {visible ? (
                <div
                    className={"modal-cover"}
                    onClick={(e) => {
                        if (modalRef.current.contains(e.target)) {
                            return;
                        }
                        setVisible(false);
                    }}
                >

                    <div className={"highlight-modal"} ref={modalRef}>

                        <div className={"highlight-modal-body"}>
                            <span className={"highlight-modal-title"}>Highlight: </span>
                            <span className={"highlight-content"}>{highlightProps.selectedText}</span>
                            <span className={"highlight-modal-title"}>Choose a label: </span>
                            <select
                                name="label"
                                value={highlightLabel}
                                onChange={(event) => setHighlightLabel(event.target.value)}
                                className={'filter-dropdown highlight-modal-dropdown'}
                            >
                                {labels.map((label, index) => (
                                    <option value={label} key={index}>{label}</option>
                                )
                                )}
                            </select>
                            <span className={"highlight-modal-title"}>
                                <input type={"checkbox"} className={"highlight-modal-checkbox"} checked={showCommentInput} onChange={() => setShowCommentInput(!showCommentInput)} />
                                Add a comment
                            </span>
                            {showCommentInput && (
                                <>
                                    <span className={"highlight-modal-title"}>Write a comment: </span>
                                    <textarea
                                        rows={3}
                                        className={"highlight-modal-textarea"}
                                        onChange={(e) => setMessage(e.target.value)}
                                    ></textarea>
                                </>
                            )
                            }
                        </div>

                        <div className={"highlight-modal-footer"}>
                            <button className={"highlight-modal-footer-button highlight-modal-footer-button-save"} onClick={() => onAction()}>Save</button>
                            <button className={"highlight-modal-footer-button highlight-modal-footer-button-cancel"} onClick={() => { setVisible(false); }}>Cancel</button>
                        </div>
                    </div>
                </div>
            ) : (
                <></>
            )}
        </>
    );
}

export default HighlightModal;