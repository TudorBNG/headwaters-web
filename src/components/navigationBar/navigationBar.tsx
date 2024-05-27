import React from "react"
import { Outlet, useNavigate } from "react-router"
import Logo from './../../assets/images/png/logo.png'

import './navigationBar.scss'

const NavigationBar = () => {

    const navigate = useNavigate();

    const handleNavigation = () => {
        if (window.location.pathname === '/job') {
            navigate(0)
        } else {
            navigate('/job', { replace: true, state: { tab: 0 } })
        }
    }

    return (
        <div className={'navigation-bar-container'}>
            <div className={'navigation-bar'}>
                <img src={Logo} className={"logo"} onClick={() => handleNavigation()} />
                <button className={"upload-pdf-button"} onClick={() => handleNavigation()}>Upload Specification</button>
            </div>
            <div className={"page-content"}>
                <Outlet />
            </div>
        </div>
    )
}

export default NavigationBar