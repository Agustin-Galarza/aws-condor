import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import UserPool from '../UserPool.js';
import { Form, useNavigate } from 'react-router-dom';
import Label from '../components/Label.js';
const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [signed, setSigned] = useState(false);
    user.getUserAttributes(function (err, res) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(result);
    });
    const onSubmit = (e) => {
        e.preventDefault();
        UserPool.signUp(email, password, [], null, (err, data) => {
            if (err) {
                console.log(err);
                setError(err.message);
            }
            console.log(data);
            setUser(data.user);
            setSigned(true);
        });
    };
    const handleConfirm = (e) => {
        e.preventDefault();
        console.log('Event', e.target[0].value);
        const res = user.confirmRegistration(e.target[0].value);
        console.log(res);
        if (!res) {
            setError('There was a problem while confirming the account');
            return;
        }
        navigate('/login');
    };
    return (_jsxs("section", { className: "flex flex-col w-full items-center justify-center min-h-[calc(100vh-112px)] gap-10", children: [_jsx("h1", { className: "text-4xl font-bold", children: "Signup" }), _jsxs(Form, { onSubmit: onSubmit, className: "flex flex-col gap-4", children: [_jsx(Label, { email: email, onChange: setEmail, id: "email", type: "text", label: "Email" }), _jsx(Label, { email: password, onChange: setPassword, id: "password", type: "password", label: "Password" }), _jsx("button", { type: "submit", className: "px-3 py-2 bg-red-500 font-extrabold rounded", children: "Signup" }), _jsx("div", { className: "w-full flex justify-end", children: _jsx("button", { onClick: () => navigate('/login'), className: "text-sm text-red-500 ", children: "I already have an account" }) })] }), error && _jsx("p", { className: "text-red-500", children: error }), !!signed ? (_jsxs("div", { children: ["Confirm with the code sent to the given email.", _jsx("form", { onSubmit: handleConfirm, children: _jsx("input", { type: "text" }) })] })) : (_jsx(_Fragment, {}))] }));
};
export default Signup;
