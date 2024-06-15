import React from "react";
import { KeyProps } from "../../pages/main/main";
import { ReactComponent as DeleteButton } from './../../assets/images/png/deleteicon.svg';

import './keys.scss'

interface KeysProps {
    keys: KeyProps[],
    selectedKey: KeyProps,
    [key: string]: any,
}

const Keys = ({ keys,
    keysRef,
    handleContextMenu,
    handleKeyClick,
    triggerKeyDelete,
    menuPosition,
    selectedId,
    selectedKey,
    setSelectedAIKey,
    isMenuOpen
}: KeysProps) => {


    const RightClickMenu = ({ x, y, isOpen }) => {
        return (
            <div
                className={`right-click-menu ${isOpen && 'open'}`}
                style={{ top: y, left: x }}
            >
                <ul>
                    <li onClick={() => triggerKeyDelete(selectedId)}>Delete</li>
                </ul>
            </div>
        );
    };

    return (
        <div
            className={"keys-container"}
        >
            {keys.length === 0 && (
                <div style={{ textAlign: "center" }}>There is no note</div>
            )}
            {keys.map((key: KeyProps, index) => {
                return (
                    <div
                        key={key.id}
                        className={`key-element ${selectedKey?.id === key.id && "key-element-selected"}`}
                        onContextMenu={(e) => handleContextMenu(e, key.id)}

                        ref={(ref): void => {
                            keysRef.set(key.id, ref as HTMLElement);
                        }}
                    >
                        <div
                            className="key-content"
                            onClick={(event) => { handleKeyClick(event, key.highlightAreas[0], { ...key, index }) }}
                            onDoubleClick={(event) => {
                                handleKeyClick(event, key.highlightAreas[0], { ...key, index });
                                setSelectedAIKey({ ...key, index })
                            }}
                        >
                            <div className={"key-content-body"}>
                                <div className={"key-index"}>{index + 1}</div>
                                <div
                                    className={"key-quote"}
                                >
                                    {key.quote}
                                </div>
                            </div>
                        </div>

                        <div className="x-trash" onClick={() => { triggerKeyDelete(key.id) }}>
                            <div className={`${selectedKey?.id === key.id ? 'white' : ''}`}>
                                <DeleteButton />
                            </div>
                        </div>
                    </div>
                );
            })}
            <RightClickMenu x={menuPosition?.x} y={menuPosition?.y} isOpen={isMenuOpen} />
        </div>
    )
}

export default Keys;