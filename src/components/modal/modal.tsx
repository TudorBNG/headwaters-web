import React, { useRef } from "react";
import './modal.scss'


const Modal = ({ visible, setVisible, onDelete }) => {
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
                    <div className={"modal"} ref={modalRef}>
                        <span className={"modal-content"}>Are you sure you want to remove the highlight?</span>
                        <div className={"modal-footer"}>
                            <button className={"modal-button modal-button-delete"} onClick={() => onDelete()}>Remove</button>
                            <button className={"modal-button modal-button-cancel"} onClick={() => setVisible(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            ) : (
                <></>
            )}
        </>
    );
}

export default Modal;