import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const withUserOnly = (WrappedComponent: React.ComponentType) => {
  return function ProtectedUserPage(props: any) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (loading) return;

      if (user?.admin) {
        // Redirect admins to the admin dashboard if they try to access user-only pages
        router.push("/admin");
      }
    }, [user, loading, router]);

    if (loading || user?.admin) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withUserOnly;
