import { Navigate, Outlet } from "react-router-dom";
import userStore from "../store/userStore";

function Protected() {
  const { token } = userStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default Protected;
