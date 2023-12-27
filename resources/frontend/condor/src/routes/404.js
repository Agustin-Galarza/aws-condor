import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
function NotFound() {
    const navigate = useNavigate();
    return (_jsxs("div", { className: "flex flex-col items-center justify-center min-h-screen gap-8", children: [_jsxs("div", { className: "flex flex-col gap-2 items-center", children: [_jsx("h1", { className: "text-[7rem] leading-[8rem] font-bold", children: "404" }), _jsx("span", { className: "text-xl", children: "Page not found" })] }), _jsx("button", { onClick: () => navigate("/"), className: "px-3 py-2 rounded  bg-red-500 font-extrabold", children: "Go Home" })] }));
}
export default NotFound;
