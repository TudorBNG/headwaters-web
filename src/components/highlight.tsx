import React, { useState, useEffect, useRef } from "react";
import {
    Button,
    DocumentLoadEvent,
    PdfJs,
    Position,
    PrimaryButton,
    Tooltip,
    Viewer,
    RenderPageProps
} from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import {
    highlightPlugin,
    MessageIcon,
    RenderHighlightContentProps,
    RenderHighlightTargetProps,
    RenderHighlightsProps
} from "@react-pdf-viewer/highlight";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import { INote } from "../pages";

interface HighlightExampleProps {
    fileUrl: string;
    notes: INote[];
    setNotes: Function
}

const HighlightExample: React.FC<HighlightExampleProps> = ({ fileUrl, notes, setNotes }) => {
    const [message, setMessage] = useState("");
    const [selectedId, setSelectedId] = useState(-1);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    const noteEles: Map<number, HTMLElement> = new Map();
    const notesContainerRef = useRef<HTMLDivElement | null>(null);
    const [currentDoc, setCurrentDoc] = useState<PdfJs.PdfDocument | null>(null);

    let noteId = notes.length;

    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: (defaultTabs) =>
            defaultTabs.concat({
                content: sidebarNotes,
                icon: <MessageIcon />,
                title: "Notes"
            })
    });
    const { activateTab } = defaultLayoutPluginInstance;

    const handleDocumentLoad = (e: DocumentLoadEvent) => {
        setCurrentDoc(e.doc);
        if (currentDoc && currentDoc !== e.doc) {
            // User opens new document
            setNotes([]);
        }
    };

    const renderHighlightTarget = (props: RenderHighlightTargetProps) => (
        <div
            style={{
                background: "#eee",
                display: "flex",
                position: "absolute",
                left: `${props.selectionRegion.left}%`,
                top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
                transform: "translate(0, 8px)",
                zIndex: 1
            }}
        >
            <Tooltip
                position={Position.TopCenter}
                target={
                    <Button onClick={props.toggle}>
                        <MessageIcon />
                    </Button>
                }
                content={() => <div style={{ width: "100px" }}>Add a note</div>}
                offset={{ left: 0, top: -8 }}
            />
        </div>
    );

    const renderHighlightContent = (props: RenderHighlightContentProps) => {
        const addNote = () => {
            if (message !== "") {
                const note: INote = {
                    id: ++noteId,
                    content: message,
                    highlightAreas: props.highlightAreas,
                };
                setNotes(notes.concat([note]));
                props.cancel();
            }
        };

        return (
            <div
                style={{
                    background: "#fff",
                    border: "1px solid rgba(0, 0, 0, .3)",
                    borderRadius: "2px",
                    padding: "8px",
                    position: "absolute",
                    left: `${props.selectionRegion.left}%`,
                    top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
                    zIndex: 1
                }}
            >
                <div>
                    <textarea
                        rows={3}
                        style={{
                            border: "1px solid rgba(0, 0, 0, .3)"
                        }}
                        onChange={(e) => setMessage(e.target.value)}
                    ></textarea>
                </div>
                <div
                    style={{
                        display: "flex",
                        marginTop: "8px"
                    }}
                >
                    <div style={{ marginRight: "8px" }}>
                        <PrimaryButton onClick={addNote}>Add</PrimaryButton>
                    </div>
                    <Button onClick={props.cancel}>Cancel</Button>
                </div>
            </div>
        );
    };

    const renderPage = (props: RenderPageProps) => {
        return (
            <>
                {props.canvasLayer.children}
                <div style={{ userSelect: 'none' }}>
                    {props.textLayer.children}
                </div>
                {props.annotationLayer.children}
            </ >
        );
    };

    const renderHighlights = (props: RenderHighlightsProps) => (
        <div>
            {notes.map((note) => (
                <React.Fragment key={note.id}>
                    {note.highlightAreas
                        .filter((area) => area.pageIndex === props.pageIndex)
                        .map((area, idx) => (
                            <div
                                key={idx}
                                style={Object.assign(
                                    {},
                                    {
                                        background: "yellow",
                                        opacity: 0.4,
                                        // zIndex: 100,
                                        // cursor: 'pointer'
                                    },
                                    props.getCssProperties(area, props.rotation)
                                )}
                                onClick={() => jumpToNote(note)}
                            />
                        ))}
                </React.Fragment>
            ))}
        </div>
    );

    const highlightPluginInstance = highlightPlugin({
        renderHighlightTarget,
        renderHighlightContent,
        renderHighlights
    });

    const { jumpToHighlightArea } = highlightPluginInstance;

    const jumpToNote = (note: INote) => {
        activateTab(3);
        const notesContainer = notesContainerRef.current;
        if (noteEles.has(note.id) && notesContainer) {
            notesContainer.scrollTop = noteEles
                .get(note.id)
                .getBoundingClientRect().top;
        }
    };

    const handleContextMenu = (event: any, id: number) => {
        console.log('Mouse clicked = ', id);

        event.preventDefault();
        setMenuPosition({ x: event.clientX, y: event.clientY });
        setIsMenuOpen(true);
        setSelectedId(id);
    };

    const handleNoteClick = (event: any, area: any) => {
        event.preventDefault();

        if (isMenuOpen) {
            setIsMenuOpen(false);
        } else {
            jumpToHighlightArea(area);
        }
    }

    const deleteNote = (id: number) => {
        console.log('delete = ', id);
        if (id !== -1) {
            setSelectedId(-1);
            setNotes([...notes].filter((note) => { return note.id !== id }));
            setIsMenuOpen(false);
        }
    }

    const RightClickMenu = ({ x, y, isOpen }) => {
        return (
            <div
                className={`right-click-menu ${isOpen && 'open'}`}
                style={{ top: y, left: x }}
            >
                <ul>
                    <li onClick={() => deleteNote(selectedId)}>Delete</li>
                </ul>
            </div>
        );
    };

    const sidebarNotes = (
        <div
            ref={notesContainerRef}
            style={{
                overflow: "auto",
                width: "100%",
                position: "relative"
            }}
        >
            {notes.length === 0 && (
                <div style={{ textAlign: "center" }}>There is no note</div>
            )}
            {notes.map((note) => {
                return (
                    <div
                        key={note.id}
                        className="note-element"
                        onContextMenu={(e) => handleContextMenu(e, note.id)}

                        ref={(ref): void => {
                            noteEles.set(note.id, ref as HTMLElement);
                        }}
                    >
                        <div className="note-content" onClick={(e) => { handleNoteClick(e, note.highlightAreas[0]) }}>
                            <div>{note.content}</div>
                        </div>

                        <div className="x-trash" onClick={() => { deleteNote(note.id) }}>
                            <i className="bi bi-trash"></i>
                        </div>
                    </div>
                );
            })}
            <RightClickMenu x={menuPosition.x} y={menuPosition.y} isOpen={isMenuOpen} />
        </div>
    );

    useEffect(() => {
        return () => {
            noteEles.clear();
        };
    }, []);

    return (
        // <div
        //   style={{
        //     height: "100%"
        //   }}
        // >
        <Viewer
            fileUrl={fileUrl}
            plugins={[highlightPluginInstance, defaultLayoutPluginInstance]}
            onDocumentLoad={handleDocumentLoad}
        // renderPage={renderPage}
        />
        // </div > 
    );
};

export default HighlightExample;
