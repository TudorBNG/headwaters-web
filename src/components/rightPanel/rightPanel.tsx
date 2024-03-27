import React from "react"

const RightPanel = ({
    selectedNote,
    saveNote,
    triggerDeleteNote,
    setSelectedNote,
    labels }) => {
    return (
        <div>
            <div className={"highlights-notes-popup"}>
                <div className={"notes-popup-body"}>
                    <p className={"notes-popup-preview"}>{selectedNote?.quote}</p>

                    <span>Notes:</span>
                    <textarea className={"notes-popup-textarea"} placeholder={"Add a note..."} value={selectedNote?.content || ''} onChange={(event) => setSelectedNote(previousValue => ({ ...previousValue, content: event.target.value }))} />
                </div>

                <select
                    name="label"
                    value={selectedNote?.label}
                    onChange={(event) => setSelectedNote(previousValue => ({ ...previousValue, label: event.target.value }))}
                    className={'right-panel-labels-dropdown'}
                >
                    {labels.map((label, index) => (
                        <option value={label} key={index}>{label}</option>
                    )
                    )}
                </select>

                <div className={"notes-popup-buttons-container"}>
                    <button className={"notes-popup-button save-button"} onClick={() => saveNote()}>Save</button>
                    <button className={"notes-popup-button delete-button"} onClick={() => triggerDeleteNote()}>Remove</button>
                    <button className={"notes-popup-button cancel-button"} onClick={() => setSelectedNote(null)}>Cancel</button>
                </div>
            </div>
        </div>
    )
}

export default RightPanel