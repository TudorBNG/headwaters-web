import React, { useState, useEffect, useRef, ReactElement } from "react";
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
import { defaultLayoutPlugin, ToolbarProps, ToolbarSlot } from "@react-pdf-viewer/default-layout";
import {
    highlightPlugin,
    MessageIcon,
    RenderHighlightContentProps,
    RenderHighlightTargetProps,
    RenderHighlightsProps
} from "@react-pdf-viewer/highlight";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import { INote } from "../pages/main/main";

import { useCallback } from "react";
import Modal from "./modal/modal";
import HighlightModal from "./modal/highlightModal";

interface HighlightExampleProps {
    fileUrl: string;
    initialNotes: INote[];
    setInitialNotes: Function;
    notes: INote[];
    setNotes: Function;
    labels: string[];
    setSelectedNote: Function;
}



const Highlights: React.FC<HighlightExampleProps> = ({ fileUrl, initialNotes, setInitialNotes, notes, setNotes, labels = [], setSelectedNote }) => {
    const [message, setMessage] = useState("");
    const [selectedId, setSelectedId] = useState(-1);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [currentFilter, setCurrentFilter] = useState<string>('All');

    const noteEles: Map<number, HTMLElement> = new Map();
    const notesContainerRef = useRef<HTMLDivElement | null>(null);
    const [currentDoc, setCurrentDoc] = useState<PdfJs.PdfDocument | null>(null);
    const [highlightLabel, setHighlightLabel] = useState(labels[0] || '');
    const [showCommentInput, setShowCommentInput] = useState<boolean>(false);

    const [showModal, setShowModal] = useState(false);

    const [showHighlightModal, setShowHighlightModal] = useState(false);
    const [highlightProps, setHighlightProps] = useState(null);

    let noteId = initialNotes.length;

    const filterNotes = useCallback((filter: string) => {
        switch (filter) {
            case 'All':
                setNotes([...initialNotes]);
                break;
            default:
                setNotes([...initialNotes].filter((note) => note.label === filter));
                break;
        }

        setCurrentFilter(filter);
    }, [initialNotes, setNotes])

    const renderToolbar = (Toolbar: (props: ToolbarProps) => ReactElement) => (
        <Toolbar>
            {(props: ToolbarSlot) => {
                const {
                    CurrentPageInput,
                    GoToNextPage,
                    GoToPreviousPage,
                    NumberOfPages,
                    ShowSearchPopover,
                    Zoom,
                    ZoomIn,
                    ZoomOut,
                } = props;
                return (
                    <>
                        <div style={{ padding: '0px 2px' }}>
                            <ShowSearchPopover />
                        </div>
                        <div style={{ padding: '0px 2px' }}>
                            <ZoomOut />
                        </div>
                        <div style={{ padding: '0px 2px' }}>
                            <Zoom />
                        </div>
                        <div style={{ padding: '0px 2px' }}>
                            <ZoomIn />
                        </div>

                        {labels.length && (
                            <div>
                                <select
                                    name="filter"
                                    value={currentFilter}
                                    onChange={(event) => filterNotes(event.target.value)}
                                    className='filter-dropdown'
                                >
                                    <option value={'All'} key={labels.length}>{'All'}</option>
                                    {labels.map((label, index) => (
                                        <option value={label} key={index}>{label}</option>
                                    )
                                    )}
                                </select>
                            </div>
                        )
                        }

                        <div style={{ padding: '0px 2px', marginLeft: 'auto' }}>
                            <GoToPreviousPage />
                        </div>
                        <div style={{ padding: '0px 2px', width: '4rem' }}>
                            <CurrentPageInput />
                        </div>
                        <div style={{ padding: '0px 2px' }}>
                            / <NumberOfPages />
                        </div>
                        <div style={{ padding: '0px 2px' }}>
                            <GoToNextPage />
                        </div>
                    </>
                );
            }}
        </Toolbar>
    );


    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: (defaultTabs) =>
            [defaultTabs[0], defaultTabs[1]].concat({
                content: sidebarNotes,
                icon: <MessageIcon />,
                title: "Notes"
            }),
        setInitialTab: () => Promise.resolve(2),
        renderToolbar,
    });
    const { activateTab } = defaultLayoutPluginInstance;
    const { toggleTab } = defaultLayoutPluginInstance;
    // toggleTab(2)

    const handleDocumentLoad = (e: DocumentLoadEvent) => {
        setCurrentDoc(e.doc);
        if (currentDoc && currentDoc !== e.doc) {
            // User opens new document
        }
        activateTab(2);
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
                zIndex: 120
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

    const saveHighlight = (note: INote) => {
        let newIndex = 0;

        for (let index = 0; index < initialNotes.length; index++) {
            if (initialNotes[index].highlightAreas[0].pageIndex === note.highlightAreas[0].pageIndex && initialNotes[index].highlightAreas[0].top < note.highlightAreas[0].top) {
                newIndex = index + 1;
            } else if (initialNotes[index].highlightAreas[0].pageIndex > note.highlightAreas[0].pageIndex) {
                break;
            } else if (initialNotes[index].highlightAreas[0].pageIndex < note.highlightAreas[0].pageIndex) {
                newIndex = index + 1;
            }
        }

        if (newIndex === initialNotes.length) {
            setInitialNotes(initialNotes.concat([note]));
        } else {
            const tempNoteArray = [...initialNotes]
            tempNoteArray.splice(newIndex, 0, note)
            setInitialNotes(tempNoteArray);
        }

    }

    const triggerSave = () => {
        const note: INote = {
            id: ++noteId,
            content: message,
            highlightAreas: highlightProps.highlightAreas,
            quote: highlightProps.selectedText,
            label: highlightLabel,
        };


        setHighlightLabel(labels[0]);
        saveHighlight(note);
        setShowCommentInput(false);
        setShowHighlightModal(false);
    }

    const setProps = async (props) => {
        setHighlightProps(props);
        setShowHighlightModal(true);
    }

    const renderHighlightContent = useCallback((props: RenderHighlightContentProps) => {
        props.cancel();

        setProps(props);

        return null;

    }, []);

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

    useEffect(() => {
        filterNotes(currentFilter)
    }, [initialNotes])

    useEffect(() => {
        setHighlightLabel(labels[0])
    }, [labels])

    const renderHighlights = (props: RenderHighlightsProps) => (
        <div>
            {notes.map((note) => (
                <React.Fragment key={note.id}>
                    {note.highlightAreas
                        .filter((area) => area.pageIndex === props.pageIndex)
                        .map((area, idx) => (
                            <div
                                className="highlight-container"
                                key={idx}
                                style={Object.assign(
                                    {},
                                    {
                                        backgroundColor: "rgba(255, 255, 0, 0.396)",
                                        zIndex: 100,
                                        // cursor: 'pointer'
                                    },
                                    props.getCssProperties(area, props.rotation)
                                )}
                                onClick={() => {
                                    jumpToNote(note)
                                    setSelectedNote(note)
                                }}
                                onDoubleClick={() => setSelectedNote(note)}
                            />
                        ))}
                </React.Fragment>
            ))}
        </div>
    );

    const highlightPluginInstance = highlightPlugin({
        renderHighlightTarget,
        renderHighlightContent,
        renderHighlights,
    });

    const { jumpToHighlightArea } = highlightPluginInstance;

    const jumpToNote = (note: INote) => {
        activateTab(3);

        if (noteEles.has(note.id)) {
            noteEles.get(note.id).scrollIntoView()
        }
    };

    const handleContextMenu = (event: any, id: number) => {
        console.log('Mouse clicked = ', id);

        event.preventDefault();
        setMenuPosition({ x: event.clientX, y: event.clientY });
        setIsMenuOpen(true);
        setSelectedId(id);
    };

    const handleNoteClick = (event: any, area: any, note: INote) => {
        event.preventDefault();
        if (isMenuOpen) {
            setIsMenuOpen(false);
        } else {
            jumpToHighlightArea(area);
            setSelectedNote(note);
        }
    }

    const triggerDeleteNote = (id: number) => {
        setSelectedId(id);
        setShowModal(true);
    }

    const onDelete = () => {
        if (selectedId !== -1) {
            setInitialNotes([...initialNotes].filter((note) => { return note.id !== selectedId }));
            setIsMenuOpen(false);
            setSelectedId(-1);
            setShowModal(false);
            setSelectedNote(null);
        }
    }

    const RightClickMenu = ({ x, y, isOpen }) => {
        return (
            <div
                className={`right-click-menu ${isOpen && 'open'}`}
                style={{ top: y, left: x }}
            >
                <ul>
                    <li onClick={() => triggerDeleteNote(selectedId)}>Delete</li>
                </ul>
            </div>
        );
    };

    const sidebarNotes = (
        <div
            ref={notesContainerRef}
            className={"notes-container"}
        >
            {notes.length === 0 && (
                <div style={{ textAlign: "center" }}>There is no note</div>
            )}
            {notes.map((note: INote) => {
                return (
                    <div
                        key={note.id}
                        className="note-element"
                        onContextMenu={(e) => handleContextMenu(e, note.id)}

                        ref={(ref): void => {
                            noteEles.set(note.id, ref as HTMLElement);
                        }}
                    >
                        <div className="note-content" onClick={(e) => { handleNoteClick(e, note.highlightAreas[0], note) }}>
                            <div className={"note-content-body"}>
                                <blockquote
                                    style={{
                                        borderLeft: "2px solid rgba(0, 0, 0, 0.2)",
                                        fontSize: ".75rem",
                                        lineHeight: 1.5,
                                        margin: "0 0 8px 0",
                                        paddingLeft: "8px",
                                        textAlign: "justify"
                                    }}
                                >
                                    {note.quote}
                                </blockquote>
                                {note?.content}
                            </div>
                        </div>

                        <div className="x-trash" onClick={() => { triggerDeleteNote(note.id) }}>
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

    return (<>

        <Viewer
            defaultScale={1}
            fileUrl={fileUrl}
            plugins={[highlightPluginInstance, defaultLayoutPluginInstance]}
            onDocumentLoad={handleDocumentLoad}
        />
        <HighlightModal
            visible={showHighlightModal}
            setVisible={setShowHighlightModal}
            onAction={triggerSave}
            labels={labels}
            highlightLabel={highlightLabel}
            setHighlightLabel={setHighlightLabel}
            setMessage={setMessage}
            showCommentInput={showCommentInput}
            setShowCommentInput={setShowCommentInput}
            highlightProps={highlightProps}
        />
        <Modal visible={showModal} setVisible={setShowModal} onDelete={onDelete} />
    </>
    );
};

export default Highlights;
