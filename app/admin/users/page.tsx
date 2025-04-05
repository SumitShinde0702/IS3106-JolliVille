"use client";

import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import AdminNav from "../../components/AdminNav";
import withAdminOnly from "../../utils/preventUser";

function AdminPage() {
  return (
    <div>
      <AdminNav />
      <h1>View Users</h1>
      <p>Welcome, Admin!</p>
    </div>
  );
}

export default withAdminOnly(AdminPage);
