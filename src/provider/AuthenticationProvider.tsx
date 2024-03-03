import moment from "moment";
import React, { useEffect } from "react"
import { useNavigate } from "react-router";

const AuthenticationProvider = ({ children }) => {

    const navigate = useNavigate();

    useEffect(() => {
        const rawAuthData = localStorage.getItem('keystone-auth');

        const authData = JSON.parse(rawAuthData);

        if (!authData || !authData?.user || authData?.timeToGo < moment().unix()) {
            localStorage.removeItem('keystone-auth');
            navigate('/')
        }

    }, []);


    return (
        <>
            {children}
        </>
    )
}

export default AuthenticationProvider;