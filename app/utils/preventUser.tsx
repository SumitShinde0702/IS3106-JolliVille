import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const withAdminOnly = (WrappedComponent: React.ComponentType) => {
  return function ProtectedAdminPage(props: any) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (loading) return;

      if (!user?.admin) {
        // Redirect non-admins to a user page
        router.push("/");
      }
    }, [user, loading, router]);

    if (loading || !user?.admin) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAdminOnly;
