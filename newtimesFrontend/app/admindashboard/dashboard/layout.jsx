import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Layout({ children }) {
  // children = Outlet equivalent in Next.js App Router
  return <DashboardLayout>{children}</DashboardLayout>;
}