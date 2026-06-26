import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerClient, getApiErrorMessage } from "../utils/ApiFunctions";
import { useAuth } from "../../hooks/useAuth";
import { authPageStyles as styles } from "./authPageStyles";

const Register = () => {
    const [form, setForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        nom: "",
        prenom: "",
        telephone: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { refresh } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (form.password !== form.confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }
        if (form.password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }
        setLoading(true);
        try {
            const data = await registerClient({
                email: form.email.trim(),
                password: form.password,
                nom: form.nom.trim() || undefined,
                prenom: form.prenom.trim() || undefined,
                telephone: form.telephone.trim() || undefined,
            });
            if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("userEmail", data.email ?? "");
                localStorage.setItem("userRole", data.role ?? "");
            }
            refresh();
            navigate("/", { replace: true });
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
                    <h1 style={styles.hotelTitle}>Rejoignez-nous</h1>
                    <p style={styles.hotelSubtitle}>
                        Créez un compte client pour réserver plus vite et retrouver vos séjours.
                    </p>
                </div>
            </div>

            <div className="login-right-panel" style={styles.rightPanel}>
                <div style={styles.formCard}>
                    <div style={styles.iconWrapper}>
                        <span style={styles.icon}>✨</span>
                    </div>
                    <h2 style={styles.title}>Inscription</h2>
                    <p style={styles.subtitle}>Compte client — email et mot de passe obligatoires</p>

                    {error && (
                        <div style={styles.alert}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Email</label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                                style={styles.inputNoIcon}
                                onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                            />
                        </div>
                        <div style={{ ...styles.fieldGroup, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div>
                                <label style={styles.label}>Nom</label>
                                <input
                                    name="nom"
                                    value={form.nom}
                                    onChange={handleChange}
                                    style={styles.inputNoIcon}
                                    onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                                />
                            </div>
                            <div>
                                <label style={styles.label}>Prénom</label>
                                <input
                                    name="prenom"
                                    value={form.prenom}
                                    onChange={handleChange}
                                    style={styles.inputNoIcon}
                                    onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                                />
                            </div>
                        </div>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Téléphone (optionnel)</label>
                            <input
                                name="telephone"
                                value={form.telephone}
                                onChange={handleChange}
                                autoComplete="tel"
                                style={styles.inputNoIcon}
                                onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                            />
                        </div>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Mot de passe (min. 6 caractères)</label>
                            <div style={styles.inputWrapper}>
                                <span style={styles.inputIcon}>🔒</span>
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
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
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Confirmer le mot de passe</label>
                            <div style={styles.inputWrapper}>
                                <span style={styles.inputIcon}>🔒</span>
                                <input
                                    name="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                    style={styles.input}
                                    onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={
                                loading ? { ...styles.submitBtn, opacity: 0.7 } : styles.submitBtn
                            }
                        >
                            {loading ? "Création du compte…" : "S'inscrire"}
                        </button>
                    </form>

                    <p style={styles.backLink}>
                        <Link to="/login" style={{ ...styles.link, marginRight: "12px" }}>
                            Déjà un compte ? Connexion
                        </Link>
                        · <Link to="/" style={styles.link}>← Accueil</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
