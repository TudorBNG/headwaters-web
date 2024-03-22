import React from "react"

import './tabs.scss'

const Tabs = ({ currentTab, setCurrentTab }) => {

    return (
        <div className={"tabs-container"}>
            <button className={`tab-button ${currentTab === 0 && "tab-button-selected"}`} onClick={() => setCurrentTab(0)}>Upload</button>
            <button className={`tab-button ${currentTab === 1 && "tab-button-selected"}`} onClick={() => setCurrentTab(1)}>Job List</button>
        </div>
    )
}

export default Tabs