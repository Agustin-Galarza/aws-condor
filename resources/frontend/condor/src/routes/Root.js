import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import userStore from '../store/userStore';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { addUser } from '../api/api';
import { v4 as uuidv4 } from 'uuid';
function Root() {
    const { neighborhood } = userStore();
    const [error, setError] = useState('');
    const reports = useQuery({
        queryKey: ['reports'],
        queryFn: () => fetch('https://api.thecatapi.com/v1/images/search?limit=10').then(res => res.json()),
    });
    const user = useQuery({
        queryKey: ['dfsdfdsfdsfcvxfd'],
        queryFn: () => addUser('galar-' + uuidv4()).then(res => console.log('User response: ', res)),
    });
    console.log('User', user);
    const handleSendReport = (e) => {
        e.preventDefault();
        const file = e.target.file_input.files[0];
        if (!file)
            return setError('No file selected');
        if (file.size > 1000000)
            return setError('File too large');
        if (!file.type.includes('image') && !file.type.includes('video'))
            return setError('Invalid file type');
        console.log(file);
        // Post to API
    };
    if (!neighborhood)
        return _jsx(Navigate, { to: "/neighborhood" });
    return (_jsxs("section", { className: "min-h-[calc(100vh-112px)] flex flex-col gap-10 items-center py-10", children: [_jsxs("h1", { className: "text-zinc-500 text-4xl font-bold", children: ["Alertas de ", _jsx("span", { className: "text-zinc-300", children: neighborhood })] }), _jsxs("form", { className: "flex flex-col items-center gap-4 min-w-[15rem] w-1/2", onSubmit: handleSendReport, children: [_jsxs("div", { className: "w-full", children: [_jsx("label", { className: "block mb-2 text-sm font-medium text-zinc-200", htmlFor: "file_input", children: "Report" }), _jsx("input", { className: "appearance-none block w-full text-sm text-gray-300 border-gray-500 border-[1px] rounded-lg cursor-pointer bg-zinc-800 focus:outline-none", id: "file_input", type: "file" }), _jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-300", id: "file_input_help", children: "PNG, JPG, Mp4" }), error && _jsx("p", { className: "mt-1 text-sm text-red-500", children: error })] }), _jsx("button", { type: "submit", className: "px-3 py-2 bg-red-500 font-extrabold rounded w-full", children: "Send" })] }), _jsx("div", { className: "overflow-hidden h-full", children: _jsx("ul", { className: "w-auto", children: reports.data?.map((report) => (_jsxs("li", { className: "w-full flex items-center flex-col", children: [_jsx("img", { src: report.url, alt: "cat", className: "w-1/2 h-1/2" }), report.id] }, report.id))) }) })] }));
}
export default Root;
