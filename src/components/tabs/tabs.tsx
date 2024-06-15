import React from "react"

import './tabs.scss'

const Tabs = ({ currentTab, setCurrentTab }) => {

    return (
        <div className={"tabs-container"}>
            <div>
                <button className={`tab-button ${currentTab === 0 && "tab-button-selected"}`} onClick={() => setCurrentTab(0)}>Spec Tab</button>
                {/* <button className={`tab-button ${currentTab === 2 && "tab-button-selected"}`} onClick={() => { }}>Keys Tab</button> */}
            </div>
            <button className={`tab-button ${currentTab === 1 && "tab-button-selected"}`} onClick={() => setCurrentTab(1)}>AI Tab</button>
        </div>
    )
}

export default Tabs