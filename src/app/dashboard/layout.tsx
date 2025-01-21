"use client";
import { Authenticated } from "convex/react";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import { NavigationProvider } from "@/lib/NavigationProvider";

export default function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NavigationProvider>
      <div className="flex h-screen">
        <Authenticated>
          <SideBar></SideBar>
        </Authenticated>
        <div className="flex-1">
          <Header />
          <main>{children}</main>
        </div>
      </div>
    </NavigationProvider>
  );
}
