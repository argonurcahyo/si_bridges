import { createBrowserRouter, Navigate } from "react-router";
import { OpsLayout } from "@/layouts/OpsLayout";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { OpsDashboardPage } from "@/pages/OpsDashboardPage";
import { PlannerPage } from "@/pages/PlannerPage";
import { WargaPage } from "@/pages/WargaPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/ops" replace /> },
  {
    path: "/ops",
    element: <OpsLayout />,
    children: [{ index: true, element: <OpsDashboardPage /> }],
  },
  {
    path: "/rencana",
    element: <OpsLayout />,
    children: [{ index: true, element: <PlannerPage /> }],
  },
  { path: "/warga", element: <WargaPage /> },
  { path: "*", element: <NotFoundPage /> },
]);
