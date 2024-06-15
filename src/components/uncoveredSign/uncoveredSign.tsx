import React from "react";

import './uncoveredSign.scss';

const UncoveredSign = ({ uncoveredItemsNumber }) => {

    return <div className={"uncovered-container"}>
        <span className={"uncovered-sign-content"}>{uncoveredItemsNumber}</span>
    </div>
}

export default UncoveredSign;