import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, authApi, saveSession } from "../../services/api";
import "../../styles/login.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Mode = "login" | "register";

type FieldErrors = { name?: string; email?: string; password?: string };

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    const value = email.trim();

    if (isRegister && name.trim().length < 2)
      next.name = "Enter your full name";

    if (!value) next.email = "Enter your email address";
    else if (!EMAIL_PATTERN.test(value)) next.email = "Enter a valid email address";

    if (!password) next.password = "Enter a valid password";
    else if (password.length < 6)
      next.password = "Password must be at least 6 characters";

    return next;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    setFormError("");
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);

    try {
      const credentials = { email: email.trim().toLowerCase(), password };

      if (isRegister) {
        // `register` does not return a token, so sign in straight after.
        await authApi.register({ ...credentials, name: name.trim() });
      }

      // `login` returns `{ token }` today; it will also carry `admin` once the
      // backend returns the signed-in user, which saveSession caches.
      const result = await authApi.login(credentials);
      saveSession(result, credentials.email);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(
          err.status === 401
            ? "Email or password is incorrect. Please try again."
            : err.message
        );
      } else {
        setFormError("Unable to reach the server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrors({});
    setFormError("");
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <span className="login-mark" aria-hidden="true">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </span>
          <span className="login-brand-name">Blogify</span>
        </div>

        <h1 className="login-title">
          {isRegister ? "Create your account" : "Welcome back"}
        </h1>
        <p className="login-subtitle">
          {isRegister
            ? "Register a new admin to manage your Blogify workspace."
            : "Sign in to manage your Blogify workspace."}
        </p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {formError && (
            <p className="login-alert" role="alert">
              {formError}
            </p>
          )}

          {isRegister && (
            <div className="login-field">
              <label className="login-label" htmlFor="login-name">
                Full name
              </label>
              <input
                id="login-name"
                className="login-input"
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Ada Lovelace"
                value={name}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? "login-name-error" : undefined}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }}
              />
              {errors.name && (
                <p className="login-hint" id="login-name-error">
                  {errors.name}
                </p>
              )}
            </div>
          )}

          <div className="login-field">
            <label className="login-label" htmlFor="login-email">
              Email address
            </label>
            <input
              id="login-email"
              className="login-input"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "login-email-error" : undefined}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
            />
            {errors.email && (
              <p className="login-hint" id="login-email-error">
                {errors.email}
              </p>
            )}
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="login-password">
              Password
            </label>
            <div
              className={`login-password${errors.password ? " has-error" : ""}`}
            >
              <input
                id="login-password"
                className="login-input"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="••••••••••"
                value={password}
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={
                  errors.password ? "login-password-error" : undefined
                }
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }}
              />
              <button
                type="button"
                className="login-eye"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="login-hint" id="login-password-error">
                {errors.password}
              </p>
            )}
          </div>

          <div className="login-row">
            {isRegister ? (
              <span />
            ) : (
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
            )}
            <button type="button" className="login-forgot">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading && <span className="login-spinner" aria-hidden="true" />}
            {loading
              ? isRegister
                ? "Creating account..."
                : "Signing in..."
              : isRegister
                ? "Create account"
                : "Sign in"}
          </button>

          <p className="login-signup">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              className="login-forgot"
              onClick={() => switchMode(isRegister ? "login" : "register")}
            >
              {isRegister ? "Sign in" : "Sign up"}
            </button>
          </p>

          <p className="login-help">
            Need help? Contact your administrator
          </p>
        </form>
      </section>
    </main>
  );
}
