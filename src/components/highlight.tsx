import React, { useState, useEffect, useRef, ReactElement } from "react";
import {
    Button,
    DocumentLoadEvent,
    PdfJs,
    Position,
    PrimaryButton,
    Tooltip,
    Viewer,
    RenderPageProps,
    Worker
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

import { KeyProps } from "../pages/main/main";

import { useCallback } from "react";
import Modal from "./modal/modal";
import HighlightModal from "./modal/highlightModal";

import './highlight/highlight.scss'
import SidePanel from "./sidePanel/sidePanel";
import Tabs from "./tabs/tabs";
import CommentsPanel from "./commentsPanel/commentsPanel";
import AITab from "./aiTab/aiTab";
import { Division, Section } from "../utils/interfaces";


const Highlights = ({
    fileUrl,
    initialKeys,
    setInitialKeys,
    keys,
    setKeys,
    labels = [],
    selectedKey,
    setSelectedKey,
    selectedAIKey,
    setSelectedAIKey,
    filename,
    saveKey,
    extractedSections
}) => {
    const [message, setMessage] = useState("");
    const [selectedId, setSelectedId] = useState(-1);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [selectedLabel, setSelectedLabel] = useState<string>('');
    const [currentTab, setCurrentTab] = useState<number>(0);

    const noteEles: Map<number, HTMLElement> = new Map();
    const notesContainerRef = useRef<HTMLDivElement | null>(null);
    const [currentDoc, setCurrentDoc] = useState<PdfJs.PdfDocument | null>(null);
    const [highlightLabel, setHighlightLabel] = useState(labels[0] || '');
    const [showCommentInput, setShowCommentInput] = useState<boolean>(false);

    const [showModal, setShowModal] = useState(false);

    const [showHighlightModal, setShowHighlightModal] = useState(false);
    const [highlightProps, setHighlightProps] = useState(null);

    const [openDivision, setOpenDivision] = useState<Division>(null);
    const [openSection, setOpenSection] = useState<Section>(null);

    let noteId = initialKeys.length;

    // const filterNotes = useCallback((filter: string) => {
    //     switch (filter) {
    //         case 'All':
    //             setKeys([...initialKeys]);
    //             break;
    //         default:
    //             setKeys([...initialKeys].filter((note) => note.label === filter));
    //             break;
    //     }

    //     setSelectedLabel(filter);
    // }, [initialKeys, setKeys])

    // const renderToolbar = (Toolbar: (props: ToolbarProps) => ReactElement) => (
    //     <Toolbar>
    //         {(props: ToolbarSlot) => {
    //             const {
    //                 CurrentPageInput,
    //                 GoToNextPage,
    //                 GoToPreviousPage,
    //                 NumberOfPages,
    //                 ShowSearchPopover,
    //                 Zoom,
    //                 ZoomIn,
    //                 ZoomOut,
    //             } = props;
    //             return (
    //                 <>
    //                     <div style={{ padding: '0px 2px' }}>
    //                         <ShowSearchPopover />
    //                     </div>
    //                     <div style={{ padding: '0px 2px' }}>
    //                         <ZoomOut />
    //                     </div>
    //                     <div style={{ padding: '0px 2px' }}>
    //                         <Zoom />
    //                     </div>
    //                     <div style={{ padding: '0px 2px' }}>
    //                         <ZoomIn />
    //                     </div>

    //                     {labels.length && (
    //                         <div>
    //                             <select
    //                                 name="filter"
    //                                 value={currentFilter}
    //                                 onChange={(event) => filterNotes(event.target.value)}
    //                                 className='filter-dropdown'
    //                             >
    //                                 <option value={'All'} key={labels.length}>{'All'}</option>
    //                                 {labels.map((label, index) => (
    //                                     <option value={label} key={index}>{label}</option>
    //                                 )
    //                                 )}
    //                             </select>
    //                         </div>
    //                     )
    //                     }

    //                     <div style={{ padding: '0px 2px', marginLeft: 'auto' }}>
    //                         <GoToPreviousPage />
    //                     </div>
    //                     <div style={{ padding: '0px 2px', width: '4rem' }}>
    //                         <CurrentPageInput />
    //                     </div>
    //                     <div style={{ padding: '0px 2px' }}>
    //                         / <NumberOfPages />
    //                     </div>
    //                     <div style={{ padding: '0px 2px' }}>
    //                         <GoToNextPage />
    //                     </div>
    //                 </>
    //             );
    //         }}
    //     </Toolbar>
    // );


    // const defaultLayoutPluginInstance = defaultLayoutPlugin({
    //     sidebarTabs: (defaultTabs) =>
    //         [defaultTabs[0], defaultTabs[1]],
    //     setInitialTab: () => Promise.resolve(2),
    //     renderToolbar,
    // });
    // const { activateTab } = defaultLayoutPluginInstance;
    // const { toggleTab } = defaultLayoutPluginInstance;
    // toggleTab(2)

    const handleDocumentLoad = (e: DocumentLoadEvent) => {
        setCurrentDoc(e.doc);
        if (currentDoc && currentDoc !== e.doc) {
            // User opens new document
        }
        // activateTab(2);
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

    const saveHighlight = (note: KeyProps) => {
        let newIndex = 0;

        for (let index = 0; index < initialKeys.length; index++) {
            if (initialKeys[index].highlightAreas[0].pageIndex === note.highlightAreas[0].pageIndex && initialKeys[index].highlightAreas[0].top < note.highlightAreas[0].top) {
                newIndex = index + 1;
            } else if (initialKeys[index].highlightAreas[0].pageIndex > note.highlightAreas[0].pageIndex) {
                break;
            } else if (initialKeys[index].highlightAreas[0].pageIndex < note.highlightAreas[0].pageIndex) {
                newIndex = index + 1;
            }
        }

        if (newIndex === initialKeys.length) {
            setInitialKeys(initialKeys.concat([note]));
        } else {
            const tempNoteArray = [...initialKeys]
            tempNoteArray.splice(newIndex, 0, note)
            setInitialKeys(tempNoteArray);
        }

    }

    const triggerSave = () => {
        const note: KeyProps = {
            id: ++noteId,
            content: message,
            highlightAreas: highlightProps.highlightAreas,
            quote: highlightProps.selectedText,
            label: highlightLabel,
            section: ''
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

    // useEffect(() => {
    //     filterNotes(selectedLabel)
    // }, [initialKeys, selectedLabel])

    useEffect(() => {
        setHighlightLabel(labels[0])
    }, [labels])

    const renderHighlights = (props: RenderHighlightsProps) => (
        <div>
            {keys.map((note) => (
                <React.Fragment key={note.id}>
                    {note.highlightAreas
                        .filter((area) => area.pageIndex === props.pageIndex)
                        .map((area, index) => (
                            <div
                                className="highlight-container"
                                key={index}
                                style={Object.assign(
                                    {},
                                    {
                                        backgroundColor: "rgba(218, 228, 107, 0.4)",
                                        zIndex: 100,
                                        // cursor: 'pointer'
                                    },
                                    props.getCssProperties(area, props.rotation)
                                )}
                                onClick={() => {
                                    jumpToNote(note)
                                    setSelectedKey({ ...note, index })
                                }}
                                onDoubleClick={() => setSelectedKey({ ...note, index })}
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

    const jumpToNote = (note: KeyProps) => {
        // activateTab(3);

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

    const handleKeyClick = (event: any, area: any, note: KeyProps) => {
        event.preventDefault();
        if (isMenuOpen) {
            setIsMenuOpen(false);
        } else {
            jumpToHighlightArea(area);
            setSelectedKey(note);
        }
    }

    const triggerDeleteKey = (id: number) => {
        setSelectedId(id);
        setShowModal(true);
        setIsMenuOpen(false);
    }

    const onDelete = () => {
        if (selectedId !== -1) {
            setInitialKeys([...initialKeys].filter((note) => { return note.id !== selectedId }));
            setIsMenuOpen(false);
            setSelectedId(-1);
            setShowModal(false);
            setSelectedKey(null);
            if (selectedId === selectedAIKey?.id) {
                setSelectedAIKey(null);
            }
        }
    }

    useEffect(() => {
        return () => {
            noteEles.clear();
        };
    }, []);

    return (<div className={"highlight-page-container"} >
        <SidePanel
            jobName={filename}
            keys={keys}
            initialKeys={initialKeys}
            setKeys={setKeys}
            keysRef={noteEles}
            handleContextMenu={handleContextMenu}
            handleKeyClick={handleKeyClick}
            triggerKeyDelete={triggerDeleteKey}
            menuPosition={menuPosition}
            selectedKey={selectedKey}
            setSelectedAIKey={setSelectedAIKey}
            selectedId={selectedId}
            isMenuOpen={isMenuOpen}
            currentTab={currentTab}
            selectedLabel={selectedLabel}
            setSelectedLabel={setSelectedLabel}
            openDivision={openDivision}
            setOpenDivision={setOpenDivision}
            openSection={openSection}
            setOpenSection={setOpenSection}
            extractedSections={extractedSections}
        />
        <div className={"main-view"}>
            <Tabs currentTab={currentTab} setCurrentTab={setCurrentTab} />
            {
                currentTab === 0 && <div className={"viewer-container"}>
                    <Worker workerUrl="/pdf.worker.min.js">
                        <Viewer
                            defaultScale={1}
                            enableSmoothScroll={true}
                            fileUrl={fileUrl}
                            plugins={[highlightPluginInstance]}
                            onDocumentLoad={handleDocumentLoad}
                        />
                    </Worker>
                </div>}
            {
                currentTab === 1 &&
                <AITab
                    openDivision={openDivision}
                    openSection={openSection}
                    keys={keys}
                    selectedAIKey={selectedAIKey}
                    setSelectedAIKey={setSelectedAIKey}
                    saveKey={saveKey}
                />
            }
        </div>

        {selectedAIKey && currentTab === 0 &&
            <CommentsPanel
                labels={labels}
                saveKey={saveKey}
                selectedAIKey={selectedAIKey}
                setSelectedAIKey={setSelectedAIKey}
                triggerDeleteKey={triggerDeleteKey}
                setCurrentTab={setCurrentTab}
            />}

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
    </div>
    );
};

export default Highlights;
