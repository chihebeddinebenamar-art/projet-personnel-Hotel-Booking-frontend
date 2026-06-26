import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProfile, updateMyProfile, getApiErrorMessage } from "../utils/ApiFunctions";
import { useAuth } from "../../hooks/useAuth";
import { authPageStyles as styles } from "./authPageStyles";

const emptyForm = () => ({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
});

const Profile = () => {
    const [form, setForm] = useState(emptyForm);
    const [originalEmail, setOriginalEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { refresh } = useAuth();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError("");
            try {
                const p = await getMyProfile();
                if (!cancelled) {
                    const em = p.email ?? "";
                    setOriginalEmail(em);
                    setForm((f) => ({
                        ...f,
                        nom: p.nom ?? "",
                        prenom: p.prenom ?? "",
                        telephone: p.telephone ?? "",
                        email: em,
                    }));
                }
            } catch (err) {
                if (!cancelled) setError(getApiErrorMessage(err));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const emailChanged =
            form.email.trim().toLowerCase() !== originalEmail.trim().toLowerCase();
        const wantsPasswordChange =
            Boolean(form.newPassword?.trim()) || Boolean(form.confirmNewPassword?.trim());

        if (wantsPasswordChange) {
            if (form.newPassword !== form.confirmNewPassword) {
                setError("Les nouveaux mots de passe ne correspondent pas.");
                return;
            }
            if (form.newPassword.length < 6) {
                setError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
                return;
            }
        }

        if ((emailChanged || wantsPasswordChange) && !form.currentPassword) {
            setError(
                "Indiquez votre mot de passe actuel pour modifier l’email ou le mot de passe."
            );
            return;
        }

        const payload = {
            nom: form.nom,
            prenom: form.prenom,
            telephone: form.telephone,
            email: form.email.trim(),
            currentPassword: form.currentPassword || undefined,
            newPassword: wantsPasswordChange ? form.newPassword : undefined,
        };

        setSaving(true);
        try {
            const data = await updateMyProfile(payload);
            if (data.token) {
                localStorage.setItem("token", data.token);
            }
            if (data.email) {
                localStorage.setItem("userEmail", data.email);
            }
            refresh();
            const nextEmail = data.email ?? form.email;
            setOriginalEmail(nextEmail);
            setForm((f) => ({
                ...f,
                email: nextEmail,
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: "",
            }));
            setSuccess(data.message || "Profil mis à jour.");
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.page}>
                <div className="login-right-panel" style={{ ...styles.rightPanel, width: "100%" }}>
                    <p className="text-muted mb-0">Chargement du profil…</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div className="login-left-panel" style={styles.leftPanel}>
                <div style={styles.overlay} />
                <div style={styles.leftContent}>
                    <div style={styles.hotelBadge}>★ COMPTE</div>
                    <h1 style={styles.hotelTitle}>Mon profil</h1>
                    <p style={styles.hotelSubtitle}>
                        Mettez à jour vos informations et la sécurité de votre compte.
                    </p>
                </div>
            </div>

            <div className="login-right-panel" style={{ ...styles.rightPanel, width: "min(520px, 100%)" }}>
                <div style={styles.formCard}>
                    <div style={styles.iconWrapper}>
                        <span style={styles.icon}>👤</span>
                    </div>
                    <h2 style={styles.title}>Informations personnelles</h2>
                    <p style={styles.subtitle}>Nom, coordonnées et mot de passe</p>

                    {error && (
                        <div style={styles.alert}>
                            <span>⚠️</span> {error}
                        </div>
                    )}
                    {success && (
                        <div
                            className="alert alert-success py-2 small mb-3"
                            role="status"
                            style={{ borderRadius: "12px" }}
                        >
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={{ ...styles.fieldGroup, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div>
                                <label style={styles.label}>Nom</label>
                                <input
                                    name="nom"
                                    value={form.nom}
                                    onChange={handleChange}
                                    autoComplete="family-name"
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
                                    autoComplete="given-name"
                                    style={styles.inputNoIcon}
                                    onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                                />
                            </div>
                        </div>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Téléphone</label>
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

                        <hr className="my-2 border-secondary-subtle" />
                        <p className="small text-muted mb-2">
                            Pour changer l’email ou le mot de passe, saisissez votre mot de passe actuel.
                        </p>

                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Mot de passe actuel</label>
                            <div style={styles.inputWrapper}>
                                <span style={styles.inputIcon}>🔒</span>
                                <input
                                    name="currentPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={form.currentPassword}
                                    onChange={handleChange}
                                    autoComplete="current-password"
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
                                            ? "Masquer les mots de passe"
                                            : "Afficher les mots de passe"
                                    }
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Nouveau mot de passe (optionnel)</label>
                            <input
                                name="newPassword"
                                type={showPassword ? "text" : "password"}
                                value={form.newPassword}
                                onChange={handleChange}
                                autoComplete="new-password"
                                style={styles.inputNoIcon}
                                onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                            />
                        </div>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Confirmer le nouveau mot de passe</label>
                            <input
                                name="confirmNewPassword"
                                type={showPassword ? "text" : "password"}
                                value={form.confirmNewPassword}
                                onChange={handleChange}
                                autoComplete="new-password"
                                style={styles.inputNoIcon}
                                onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            style={
                                saving ? { ...styles.submitBtn, opacity: 0.7 } : styles.submitBtn
                            }
                        >
                            {saving ? "Enregistrement…" : "Enregistrer les modifications"}
                        </button>
                    </form>

                    <p style={styles.backLink}>
                        <Link to="/" style={styles.link}>
                            ← Accueil
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Profile;
