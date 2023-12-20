import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from "react-router-dom";
import userStore from "../store/userStore";
function Protected() {
    const { token } = userStore();
    if (!token) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(Outlet, {});
}
export default Protected;
