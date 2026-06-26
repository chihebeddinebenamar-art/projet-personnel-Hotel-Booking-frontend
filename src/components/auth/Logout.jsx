import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Logout = () => {
  const navigate = useNavigate();
  const { refresh } = useAuth();

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    refresh();
    navigate("/", { replace: true });
  }, [navigate, refresh]);

  return (
    <div className="container mt-5">
      <p>Déconnexion…</p>
    </div>
  );
};

export default Logout;
