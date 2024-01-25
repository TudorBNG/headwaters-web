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

import { INote } from "../pages";

import {Button as IconButton} from 'antd'

import { DislikeTwoTone, LikeTwoTone } from "@ant-design/icons";
import { useCallback } from "react";

interface HighlightExampleProps {
    fileUrl: string;
    initialNotes: INote[];
    setInitialNotes: Function;
    notes: INote[];
    setNotes: Function;
    labels: string[];
}



const HighlightExample: React.FC<HighlightExampleProps> = ({ fileUrl, initialNotes, setInitialNotes, notes, setNotes, labels = [] }) => {
    const [message, setMessage] = useState("");
    const [selectedId, setSelectedId] = useState(-1);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [currentFilter, setCurrentFilter] = useState<string>('All');

    const noteEles: Map<number, HTMLElement> = new Map();
    const notesContainerRef = useRef<HTMLDivElement | null>(null);
    const [currentDoc, setCurrentDoc] = useState<PdfJs.PdfDocument | null>(null);
    const [highlightLabel, setHighlightLabel] = useState(labels[0] || '');

    let noteId = initialNotes.length;

    const filterNotes = useCallback((filter: string) => {
        switch (filter) {
            case 'All':
                setNotes([...initialNotes]);
                break;
            case 'Liked':
                setNotes([...initialNotes.filter(note => note.rating === 1)]);
                break;
            case 'Disliked':
                setNotes([...initialNotes.filter(note => note.rating === -1)]);
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
                    Download,
                    EnterFullScreen,
                    GoToNextPage,
                    GoToPreviousPage,
                    NumberOfPages,
                    Print,
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
                                    <option value={'Liked'} key={labels.length + 1}>{'Liked'}</option>
                                    <option value={'Disliked'} key={labels.length + 2}>{'Disliked'}</option>
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
                        {/* <div style={{ padding: '0px 2px', marginLeft: 'auto' }}>
                            <EnterFullScreen />
                        </div>
                        <div style={{ padding: '0px 2px' }}>
                            <Download />
                        </div>
                        <div style={{ padding: '0px 2px' }}>
                            <Print />
                        </div> */}
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
            setNotes([]);
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

    const renderHighlightContent = (props: RenderHighlightContentProps) => {

        const addNote = () => {
            if (message !== "") {
                const note: INote = {
                    id: ++noteId,
                    content: message,
                    highlightAreas: props.highlightAreas,
                    quote: props.selectedText,
                    label: highlightLabel,
                };
                setHighlightLabel(labels[0]);
                setInitialNotes(initialNotes.concat([note]));
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
                    zIndex: 121
                }}
            >
                <div className={"highlight-modal"}>
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
                    <span className={"highlight-modal-title"}>Add description: </span>
                    <textarea
                        rows={3}
                        className={"highlight-modal-textarea"}
                        onChange={(e) => setMessage(e.target.value)}
                    ></textarea>
                </div>
                <div
                    style={{
                        display: "flex",
                        marginTop: "8px",
                        justifyContent: 'space-between'
                    }}
                >
  
                    <PrimaryButton onClick={addNote}>Add</PrimaryButton>
  
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

    const noteRating = ({rating, noteId}) => {
        console.log(rating === -1 ? 'Disliked': 'Liked', 'id', noteId);

        setInitialNotes([...initialNotes?.map(note => note.id === noteId ? {...note, rating } : note)]);
    }

    useEffect(()=>{
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
                                        background: "yellow",
                                        opacity: 0.4,
                                        zIndex: 100,
                                        // cursor: 'pointer'
                                    },
                                    props.getCssProperties(area, props.rotation)
                                )}
                                onClick={() => jumpToNote(note)}
                            >
                                <div className={`buttons-container ${!note.rating ? 'buttons-container-display' : ''}`}>
                                    <IconButton className={`icon-button ${note.rating === -1 ? 'icon-button-red' : ''}`} icon={<DislikeTwoTone className="button-icon" twoToneColor={'#ff0000'} />} onClick={() => noteRating({rating: -1, noteId: note.id})} />
                                    <IconButton className={`icon-button ${note.rating === 1 ? 'icon-button-green' : ''}`} icon={<LikeTwoTone className="button-icon" twoToneColor={'#00b00c'} />} onClick={() => noteRating({rating: 1, noteId: note.id})} />
                                </div>
                            </div>
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
            setInitialNotes([...initialNotes].filter((note) => { return note.id !== id }));
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
                        <div className="note-content" onClick={(e) => { handleNoteClick(e, note.highlightAreas[0]) }}>
                            <div>
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
                                {note.content}
                            </div>
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
