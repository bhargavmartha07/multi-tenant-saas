import React from "react";
import NavBar from "./NavBar";
import "./AppLayout.css";

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <NavBar />
      <main className="app-main">
        <div className="app-container">
          {children}
        </div>
      </main>
    </div>
  );
}
