import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { api, getApiErrorMessage } from "../utils/ApiFunctions";
import { useAuth } from "../../hooks/useAuth";
import { authPageStyles as styles } from "./authPageStyles";

function isStaffOnlyPath(pathname) {
    if (!pathname) return false;
    return (
        pathname.startsWith("/admin") ||
        pathname.startsWith("/reception") ||
        pathname === "/add-room" ||
        pathname === "/existing-rooms" ||
        pathname.startsWith("/edit-room")
    );
}

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { refresh } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { data } = await api.post("/api/auth/login", { email, password });
            const role = data.role;
            if (
                role !== "ADMIN" &&
                role !== "RECEPTIONIST" &&
                role !== "CLIENT" &&
                role !== "STAFF"
            ) {
                setError("Ce type de compte ne peut pas se connecter ici.");
                return;
            }
            if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("userEmail", data.email ?? "");
                localStorage.setItem("userRole", data.role ?? "");
            }
            refresh();
            const from = location.state?.from?.pathname;

            if (role === "RECEPTIONIST") {
                navigate("/reception", { replace: true });
                return;
            }
            if (role === "ADMIN") {
                const adminDest =
                    from && from !== "/login" && !from.startsWith("/reception")
                        ? from
                        : "/admin";
                navigate(adminDest, { replace: true });
                return;
            }
            if (role === "CLIENT" || role === "STAFF") {
                if (from && from !== "/login" && !isStaffOnlyPath(from)) {
                    navigate(from, { replace: true });
                } else {
                    navigate("/", { replace: true });
                }
                return;
            }
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div className="login-left-panel" style={styles.leftPanel}>
                <div style={styles.overlay} />
                <div style={styles.leftContent}>
                    <div style={styles.hotelBadge}>★ HÔTEL LUXE</div>
                    <h1 style={styles.hotelTitle}>Bienvenue</h1>
                    <p style={styles.hotelSubtitle}>
                        Connexion client, réception ou administration — un seul compte par email.
                    </p>
                </div>
            </div>

            <div className="login-right-panel" style={styles.rightPanel}>
                <div style={styles.formCard}>
                    <div style={styles.iconWrapper}>
                        <span style={styles.icon}>🏨</span>
                    </div>
                    <h2 style={styles.title}>Connexion</h2>
                    <p style={styles.subtitle}>Email et mot de passe</p>

                    {error && (
                        <div style={styles.alert}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Adresse email</label>
                            <div style={styles.inputWrapper}>
                                <span style={styles.inputIcon}>✉️</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="username"
                                    placeholder="vous@exemple.com"
                                    style={styles.input}
                                    onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                                />
                            </div>
                        </div>

                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Mot de passe</label>
                            <div style={styles.inputWrapper}>
                                <span style={styles.inputIcon}>🔒</span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    style={{ ...styles.input, paddingRight: "48px" }}
                                    onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={styles.eyeBtn}
                                    aria-label={
                                        showPassword
                                            ? "Masquer le mot de passe"
                                            : "Afficher le mot de passe"
                                    }
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={
                                loading ? { ...styles.submitBtn, opacity: 0.7 } : styles.submitBtn
                            }
                        >
                            {loading ? "Connexion en cours..." : "Se connecter"}
                        </button>
                    </form>

                    <p style={styles.backLink}>
                        <Link to="/register" style={{ ...styles.link, marginRight: "12px" }}>
                            Créer un compte
                        </Link>
                        ·{" "}
                        <Link to="/" style={styles.link}>
                            ← Accueil
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
