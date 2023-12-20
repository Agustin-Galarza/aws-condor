import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate } from "react-router-dom";
import userStore from "../store/userStore";
import { useState } from "react";
const neighborhoodList = [
    "Quilmes",
    "Bernal",
    "Don Bosco",
    "Ezpeleta",
    "Avellaneda",
    "Lomas de Zamora",
    "Berazategui",
    "Wilde",
];
function Neighborhood() {
    const { neighborhood, setNeighborhood } = userStore();
    const [neighborhoodState, setNeighborhoodState] = useState("");
    const handleOnChange = (e) => {
        setNeighborhoodState(e.target.value);
    };
    const handleOnClick = () => {
        setNeighborhood(neighborhoodState);
    };
    if (neighborhood)
        return _jsx(Navigate, { to: "/" });
    return (_jsx("section", { className: "min-h-[calc(100vh-112px)] flex items-center justify-center", children: _jsxs("div", { className: "flex flex-col items-center gap-4", children: [_jsx("h1", { className: "font-bold text-2xl", children: "Select your Neighborhood" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("select", { onChange: handleOnChange, className: " h-12 py-3 px-4 pe-9 block w-full border-[1px] text-zinc-300  bg-zinc-800 border-zinc-500 rounded-lg text-sm focus:border-zinc-300 focus:ring-zinc-500 disabled:opacity-50 disabled:pointer-events-none ", children: neighborhoodList.map((neighborhood) => (_jsx("option", { value: neighborhood, children: neighborhood }, neighborhood))) }), _jsx("button", { onClick: handleOnClick, className: "px-3 py-2 bg-red-500 font-extrabold rounded h-12", children: "go" })] })] }) }));
}
export default Neighborhood;
