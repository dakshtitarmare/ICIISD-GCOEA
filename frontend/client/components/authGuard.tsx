// /src/components/AuthGuard.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function AuthGuard({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode;
  requiredRole?: string;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      toast.error("Please login to access this page");
      navigate("/login");
      return;
    }

    if (requiredRole && role !== requiredRole) {
      toast.error(`Access denied. Requires ${requiredRole.replace("_", " ")} role`);
      navigate("/login");
    }
  }, [navigate, requiredRole]);

  return <>{children}</>;
}