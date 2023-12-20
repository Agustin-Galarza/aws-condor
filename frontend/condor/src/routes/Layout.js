import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, useNavigate } from 'react-router-dom';
import userStore from '../store/userStore.js';
function Layout() {
    const navigate = useNavigate();
    const { token, cleanToken } = userStore();
    return (_jsxs("main", { className: "bg-zinc-800 min-h-screen flex flex-col justify-between items-center", children: [_jsxs("div", { className: "w-full", children: [_jsxs("nav", { className: "flex h-16 gap-4 justify-between w-full border-b-[1px] border-zinc-700 px-10", children: [_jsxs("button", { onClick: () => navigate('/'), className: "flex items-center gap-1", children: [_jsx("img", { src: "/condor.svg", alt: "logo", className: "h-10" }), _jsx("span", { className: "text-xl font-bold font-logo", children: "Condor" })] }), token ? (_jsx("div", { className: "flex gap-4", children: _jsx("button", { onClick: () => {
                                        cleanToken();
                                        navigate('/login');
                                    }, children: "Logout" }) })) : (_jsxs("div", { className: "flex gap-4", children: [_jsx("button", { onClick: () => navigate('login'), children: "Login" }), _jsx("button", { onClick: () => navigate('signup'), children: "Signup" })] }))] }), _jsx("div", { className: "h-full", children: _jsx(Outlet, {}) })] }), _jsx("footer", { className: "bg-zinc-900 text-zinc-500 text-sm flex h-12 w-full items-center justify-center", children: "Condor 2023 ITBA" })] }));
}
export default Layout;
