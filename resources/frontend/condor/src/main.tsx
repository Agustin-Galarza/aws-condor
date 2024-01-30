//@ts-nocheck
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Root from "./routes/Root.tsx";
import Signup from "./routes/Signup.tsx";
import Login from "./routes/Login.tsx";
import NotFound from "./routes/404.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import Protected from './routes/Protected.tsx';
import Layout from "./routes/Layout.tsx";
import Neighborhood from "./routes/Neighborhood.tsx";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Root />,
        // element: <Protected />,
        // children: [{ path: "/", element: <Root /> }],
      },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/neighborhood", element: <Neighborhood /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
