import { useState, type FormEvent } from "react";
import Navbar from "../components/public/Navbar";
import Footer from "../components/public/Footer";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Please enter your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = "Please enter a valid email address";
    if (message.trim().length < 10)
      next.message = "Please write at least 10 characters";

    setErrors(next);
    if (Object.keys(next).length === 0) {
      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
    }
  };

  return (
    <>
      <Navbar />
      <main className="section">
        <div className="container">
          <h1 className="section-title">Contact</h1>

          <div className="prose" style={{ marginBottom: 24 }}>
            <p>
              There is no mail backend wired up yet, so this form validates
              locally and confirms inline. Point it at a real endpoint when one
              exists.
            </p>
          </div>

          <form className="contact-form" onSubmit={submit} noValidate>
            <div className="field">
              <label className="label" htmlFor="c-name">
                Name
              </label>
              <input
                id="c-name"
                className="input"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((p) => ({ ...p, name: "" }));
                }}
                aria-invalid={errors.name ? true : undefined}
              />
              {errors.name && <p className="hint err">{errors.name}</p>}
            </div>

            <div className="field">
              <label className="label" htmlFor="c-email">
                Email
              </label>
              <input
                id="c-email"
                className="input"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((p) => ({ ...p, email: "" }));
                }}
                aria-invalid={errors.email ? true : undefined}
              />
              {errors.email && <p className="hint err">{errors.email}</p>}
            </div>

            <div className="field">
              <label className="label" htmlFor="c-message">
                Message
              </label>
              <textarea
                id="c-message"
                className="textarea"
                style={{ minHeight: 140 }}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setErrors((p) => ({ ...p, message: "" }));
                }}
                aria-invalid={errors.message ? true : undefined}
              />
              {errors.message && <p className="hint err">{errors.message}</p>}
            </div>

            <button type="submit" className="btn btn-primary">
              Send message
            </button>

            {sent && (
              <p className="form-msg" role="status">
                Thanks — your message has been recorded.
              </p>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
