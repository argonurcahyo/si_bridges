import { createBrowserRouter, Navigate } from "react-router";
import { OpsLayout } from "@/layouts/OpsLayout";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { OpsDashboardPage } from "@/pages/OpsDashboardPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/ops" replace /> },
  {
    path: "/ops",
    element: <OpsLayout />,
    children: [{ index: true, element: <OpsDashboardPage /> }],
  },
  { path: "*", element: <NotFoundPage /> },
]);
