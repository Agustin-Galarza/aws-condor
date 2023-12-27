import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function Label({ email, onChange, id, type, label }) {
    return (_jsxs("label", { htmlFor: "email", className: "flex flex-col gap-2", children: [_jsx("span", { className: "text-zinc-300 text-sm font-bold", children: label }), _jsx("input", { value: email, onChange: (e) => onChange(e.target.value), className: "appearance-none bg-transparent border-zinc-600 border-[1px] rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline", id: id, type: type })] }));
}
export default Label;
