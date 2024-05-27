import React from "react";
import './jobListOptions.scss';

const JobListOptions = ({ currentTab, setCurrentTab }) => {

    const tabs = ['Job List', 'Upload', 'Admin', 'Settings'];

    return (
        <div className={"job-list-options-container"}>
            {tabs.map((tab, index) => (
                <button className={`${currentTab === index && 'selected-tab'}`} key={index} onClick={() => setCurrentTab(index)}>{tab}</button>
            ))}
        </div>
    );
};

export default JobListOptions;