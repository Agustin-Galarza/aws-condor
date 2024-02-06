import { Navigate, Outlet } from "react-router-dom";
import userStore from "../store/userStore";

function Protected() {
  const { token, email } = userStore();

  if (!token || !email) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default Protected;
