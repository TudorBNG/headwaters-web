import React, { useEffect, useState } from 'react';
import "./login.scss";
import users from './../../utils/users.json'
import { useNavigate } from 'react-router';
import moment from 'moment';

const Login = () => {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [incorrectLoginAttempt, setIncorrectLoginAttempt] = useState(false)

    useEffect(() => {
        const rawAuthData = localStorage.getItem('keystone-auth');

        const authData = JSON.parse(rawAuthData);

        if (authData && authData?.user && authData?.timeToGo > moment().unix()) {
            navigate('/job', { state: { tab: 0 } })
        }

    }, []);


    const triggerLogin = () => {
        const user = users.find(user => user.username === username && user.password === password);
        if (user) {
            setIncorrectLoginAttempt(false);
            const authItem = {
                user: user.username,
                timeToGo: moment().add(10, 'hours').unix().toString(),
            }

            localStorage.setItem('keystone-auth', JSON.stringify(authItem));
            navigate('/job', { state: { tab: 0 } })
        } else {
            setIncorrectLoginAttempt(true);
        }
    }

    return (
        <div className={'login'}>
            <span className={'login-header'}>Keystone</span>
            <div className={'login-form'}>
                <div className={'login-form-inputs'}>
                    <input className={`login-form-username ${incorrectLoginAttempt && 'login-form-incorrect'}`} type={"text"} placeholder={"username"} value={username} onChange={(event) => setUsername(event.target.value)} />
                    <input className={`login-form-password ${incorrectLoginAttempt && 'login-form-incorrect'}`} type={"password"} placeholder={"password"} value={password} onChange={(event) => setPassword(event.target.value)} />
                </div>
                <button className={'login-form-button'} onClick={triggerLogin}>Log in</button>
            </div>
        </div>
    )
}

export default Login