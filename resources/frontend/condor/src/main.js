import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Root from "./routes/Root.tsx";
import Signup from "./routes/Signup.tsx";
import Login from "./routes/Login.tsx";
import NotFound from "./routes/404.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./routes/Layout.tsx";
import Neighborhood from "./routes/Neighborhood.tsx";
const router = createBrowserRouter([
    {
        element: _jsx(Layout, {}),
        children: [
            {
                path: "/",
                element: _jsx(Root, {}),
                // element: <Protected />,
                // children: [{ path: "/", element: <Root /> }],
            },
            { path: "/login", element: _jsx(Login, {}) },
            { path: "/signup", element: _jsx(Signup, {}) },
            { path: "/neighborhood", element: _jsx(Neighborhood, {}) },
        ],
    },
    { path: "*", element: _jsx(NotFound, {}) },
]);
const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(React.StrictMode, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(RouterProvider, { router: router }) }) }));
