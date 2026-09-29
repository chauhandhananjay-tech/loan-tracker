import { useEffect, useMemo, useState } from "react";
import {
  createLoan,
  fetchBanks,
  fetchLoans,
  fetchUsers,
  login,
  register,
  removeLoan,
  removeUser,
  updateUser,
  updateLoanStatus,
} from "./api/loans";
import "./styles.css";

const initialForm = {
  applicantName: "",
  loanAmount: "",
  tenureMonths: "",
  purpose: "",
  bankName: "",
};

function App() {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("loan-session")) || null;
    } catch {
      return null;
    }
  });

  function AuthScreen({ onAuthenticated }) {
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    function handleChange(event) {
      setForm((currentForm) => ({ ...currentForm, [event.target.name]: event.target.value }));
    }

    async function handleSubmit(event) {
      event.preventDefault();
      setLoading(true);
      setError("");
      try {
        const authSession = mode === "login" ? await login(form) : await register(form);
        onAuthenticated(authSession);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Authentication failed.");
      } finally {
        setLoading(false);
      }
    }

    return (
      <main className="auth-shell">
        <section className="auth-panel">
          <div className="auth-visual">
            <div className="auth-logo"><span>LT</span> LoanTrack</div>
            <div className="auth-visual-copy">
              <p className="auth-kicker">A clearer way forward</p>
              <h1>Stay ahead of every loan decision.</h1>
              <p>One calm workspace for applications, reviews, and the details that keep your plans moving.</p>
            </div>
            <div className="auth-proof">
              <div className="proof-mark">✓</div>
              <div><strong>Everything in one place</strong><span>Secure application tracking</span></div>
            </div>
            <div className="auth-orbit orbit-one" />
            <div className="auth-orbit orbit-two" />
          </div>
          <div className="auth-form-side">
            <div className="auth-form-topline">
              <span>{mode === "login" ? "Welcome back" : "Get started"}</span>
              <span className="auth-step">01 <i /> 02</span>
            </div>
            <div className="auth-heading">
              <p className="eyebrow">LOAN MANAGEMENT</p>
              <h2>{mode === "login" ? "Sign in to your account" : "Create your account"}</h2>
              <p>{mode === "login" ? "Enter your details to continue." : "Start managing your loan applications in minutes."}</p>
            </div>
            <div className="auth-mode-toggle" role="tablist" aria-label="Authentication mode">
              <button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }} type="button">Sign in</button>
              <button className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(""); }} type="button">Create account</button>
            </div>
            {error && <p className="alert">{error}</p>}
            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === "register" && (
                <label className="form-field">Full name<input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required /></label>
              )}
              <label className="form-field">Email address<input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required /></label>
              <label className="form-field">Password
                <span className="password-field">
                  <input name="password" type={showPassword ? "text" : "password"} minLength="6" value={form.password} onChange={handleChange} placeholder="At least 6 characters" required />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? "Hide" : "Show"}</button>
                </span>
              </label>
              <button className="primary-button auth-submit" disabled={loading} type="submit">
                {loading ? "Please wait..." : mode === "login" ? "Continue to dashboard" : "Create my account"}<span>→</span>
              </button>
            </form>
            <p className="auth-footer">{mode === "login" ? "New to LoanTrack?" : "Already have an account?"} <button className="auth-switch" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} type="button">{mode === "login" ? "Create an account" : "Sign in"}</button></p>
          </div>
        </section>
      </main>
    );
  }
  const [loans, setLoans] = useState([]);
  const [users, setUsers] = useState([]);
  const [banks, setBanks] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [view, setView] = useState(() => session?.user?.role === "admin" ? "admin" : "applicant");
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.token) {
      loadLoans(session.token);
      if (session.user.role === "admin") {
        loadUsers(session.token);
      }
    } else {
      setLoading(false);
    }
  }, [session?.token]);

  useEffect(() => {
    fetchBanks().then(setBanks).catch(() => setBanks([]));
  }, []);

  const pendingCount = useMemo(
    () => loans.filter((loan) => loan.status === "Pending").length,
    [loans]
  );

  async function loadLoans(token = session?.token) {
    try {
      setError("");
      setLoans(await fetchLoans(token));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Loans load nahi ho paaye. Backend check karein."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers(token = session?.token) {
    try {
      setUsersLoading(true);
      setError("");
      setUsers(await fetchUsers(token));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Users load nahi ho paaye.");
    } finally {
      setUsersLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      const newLoan = await createLoan({
        ...form,
        loanAmount: Number(form.loanAmount),
        tenureMonths: Number(form.tenureMonths),
      }, session.token);
      setLoans((currentLoans) => [newLoan, ...currentLoans]);
      setForm(initialForm);
      setView("applicant");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Loan save nahi hua. Please details check karein."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(id, status) {
    try {
      setUpdatingId(id);
      setError("");
      const updatedLoan = await updateLoanStatus(id, status, session.token);
      setLoans((currentLoans) =>
        currentLoans.map((loan) => (loan._id === id ? updatedLoan : loan))
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Status update nahi hua."
      );
    } finally {
      setUpdatingId("");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Kya aap is application ko delete karna chahte hain?")) {
      return;
    }

    try {
      setError("");
      await removeLoan(id, session.token);
      setLoans((currentLoans) => currentLoans.filter((loan) => loan._id !== id));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Application delete nahi hui."
      );
    }
  }

  async function handleUserUpdate(id, userData) {
    try {
      setError("");
      const updatedUser = await updateUser(id, userData, session.token);
      setUsers((currentUsers) => currentUsers.map((user) => user._id === id ? updatedUser : user));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "User update nahi hua.");
    }
  }

  async function handleUserDelete(id) {
    if (!window.confirm("User aur uski loan applications delete karni hain?")) return;
    try {
      setError("");
      await removeUser(id, session.token);
      setUsers((currentUsers) => currentUsers.filter((user) => user._id !== id));
      setLoans((currentLoans) => currentLoans.filter((loan) => loan.userId?._id !== id));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "User delete nahi hua.");
    }
  }

  async function handleEmailLoan(loan) {
    const recipient = loan.userId?.email;
    if (!recipient) return;

    const subject = `Loan application update - ${loan.applicantName}`;
    const message = [
      `Hello ${loan.applicantName},`,
      "",
      "There is an update regarding your loan application.",
      `Status: ${loan.status}`,
      `Amount: ₹${loan.loanAmount.toLocaleString("en-IN")}`,
      `Tenure: ${loan.tenureMonths} months`,
      "",
      "Regards,",
      "LoanTrack Admin",
    ].join("\\n");

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.open(gmailUrl, "_blank", "noopener,noreferrer");
  }

  function handleLogin(authSession) {
    localStorage.setItem("loan-session", JSON.stringify(authSession));
    setSession(authSession);
    setView(authSession.user.role === "admin" ? "admin" : "applicant");
    setError("");
  }

  function handleLogout() {
    localStorage.removeItem("loan-session");
    setSession(null);
    setLoans([]);
  }

  if (!session) {
    return <AuthScreen onAuthenticated={handleLogin} />;
  }

  return (
    <main className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">LOAN MANAGEMENT</p>
          <h1>Loan Application Tracker</h1>
          <p className="subtitle">
            User application submit kare, admin review karke decision le.
          </p>
        </div>
        <div className="hero-actions">
          <button className="logout-button" onClick={handleLogout} type="button">
            Logout
          </button>
          <div className="summary-badge">
          <strong>{pendingCount}</strong>
          <span>Pending review</span>
          </div>
        </div>
      </header>

      <nav className="view-switcher" aria-label="Application view">
        {session.user.role !== "admin" && (
          <button
            className={view === "applicant" ? "active" : ""}
            onClick={() => setView("applicant")}
            type="button"
          >
            Applicant
          </button>
        )}
        {session.user.role === "admin" && (
          <button
            className={view === "admin" ? "active" : ""}
            onClick={() => setView("admin")}
            type="button"
          >
            Admin dashboard
            {pendingCount > 0 && <span className="pending-dot">{pendingCount}</span>}
          </button>
        )}
      </nav>

      {error && <p className="alert">{error}</p>}

      {session.user.role !== "admin" && view === "applicant" ? (
        <section className="content-grid">
          <form className="panel loan-form" onSubmit={handleSubmit}>
            <div className="section-heading">
              <h2>Apply for a loan</h2>
              <span>All fields required</span>
            </div>
            <label>
              Applicant name
              <input
                name="applicantName"
                value={form.applicantName}
                onChange={handleChange}
                placeholder="e.g. Priya Sharma"
                required
              />
            </label>
            <div className="two-columns">
              <label>
                Loan amount (₹)
                <input
                  name="loanAmount"
                  type="number"
                  min="1"
                  value={form.loanAmount}
                  onChange={handleChange}
                  placeholder="500000"
                  required
                />
              </label>
              <label>
                Tenure (months)
                <input
                  name="tenureMonths"
                  type="number"
                  min="1"
                  value={form.tenureMonths}
                  onChange={handleChange}
                  placeholder="24"
                  required
                />
              </label>
            </div>
            <label>
              Purpose
              <textarea
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                placeholder="Home renovation, education..."
                rows="4"
                required
              />
            </label>
            <label>
              Bank name
              <select name="bankName" value={form.bankName} onChange={handleChange} required>
                <option value="">Select your bank</option>
                {banks.map((bank) => <option key={bank} value={bank}>{bank}</option>)}
              </select>
            </label>
            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit loan application"}
            </button>
          </form>

          <LoanList
            loans={loans}
            loading={loading}
            onDelete={handleDelete}
            onRefresh={loadLoans}
            title="My applications"
          />
        </section>
      ) : (
        <section className="panel admin-panel">
          <div className="section-heading">
            <div>
              <h2>Admin dashboard</h2>
              <p className="section-description">
                Pending applications ko review karke approve ya reject karein.
              </p>
            </div>
            <button className="refresh-button" onClick={loadLoans} type="button">
              Refresh
            </button>
          </div>
          {loading ? (
            <p className="empty-state">Loading applications...</p>
          ) : loans.length === 0 ? (
            <p className="empty-state">Abhi koi application nahi hai.</p>
          ) : (
            <div className="loan-list admin-list">
              {loans.map((loan) => (
                <LoanCard
                  key={loan._id}
                  loan={loan}
                  admin
                  updating={updatingId === loan._id}
                  onDelete={handleDelete}
                  onEmail={handleEmailLoan}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
          <AdminUsers
            users={users}
            loading={usersLoading}
            currentUserId={session.user.id}
            onRefresh={() => loadUsers()}
            onUpdate={handleUserUpdate}
            onDelete={handleUserDelete}
          />
        </section>
      )}
    </main>
  );
}

function LoanList({ loans, loading, onDelete, onRefresh, title }) {
  return (
    <section className="panel applications">
      <div className="section-heading">
        <h2>{title}</h2>
        <button className="refresh-button" onClick={onRefresh} type="button">
          Refresh
        </button>
      </div>
      {loading ? (
        <p className="empty-state">Loading applications...</p>
      ) : loans.length === 0 ? (
        <p className="empty-state">Abhi koi loan application nahi hai.</p>
      ) : (
        <div className="loan-list">
          {loans.map((loan) => (
            <LoanCard key={loan._id} loan={loan} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  );
}

function LoanCard({
  loan,
  admin = false,
  updating = false,
  onDelete,
  onEmail,
  onStatusChange,
}) {
  return (
    <article className="loan-card">
      <div className="loan-card-header">
        <div>
          <h3>{loan.applicantName}</h3>
          <p>{loan.purpose}</p>
        </div>
        <span className={`status status-${loan.status.toLowerCase()}`}>
          {loan.status}
        </span>
      </div>
      <div className="loan-details">
        <span>
          <small>Bank</small>{loan.bankName || "Not specified"}
        </span>
        <span>
          <small>Amount</small>₹{loan.loanAmount.toLocaleString("en-IN")}
        </span>
        <span>
          <small>Tenure</small>
          {loan.tenureMonths} months
        </span>
      </div>
      {admin && loan.status === "Pending" && (
        <div className="admin-actions">
          <button
            className="approve-button"
            disabled={updating}
            onClick={() => onStatusChange(loan._id, "Approved")}
          >
            Approve
          </button>
          <button
            className="reject-button"
            disabled={updating}
            onClick={() => onStatusChange(loan._id, "Rejected")}
          >
            Reject
          </button>
        </div>
      )}
      {admin && (
        <div className="admin-card-actions">
          <button className="email-button" disabled={!loan.userId?.email} onClick={() => onEmail(loan)}>
            Email applicant
          </button>
          <button className="delete-button" onClick={() => onDelete(loan._id)}>
            Delete application
          </button>
        </div>
      )}
    </article>
  );
}

function AdminUsers({ users, loading, currentUserId, onRefresh, onUpdate, onDelete }) {
  const [drafts, setDrafts] = useState({});

  useEffect(() => {
    setDrafts(Object.fromEntries(users.map((user) => [user._id, { name: user.name, email: user.email, role: user.role }])));
  }, [users]);

  function updateDraft(id, field, value) {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [id]: { ...currentDrafts[id], [field]: value },
    }));
  }

  return (
    <section className="admin-users">
      <div className="section-heading">
        <div><h2>User management</h2><p className="section-description">User information, roles aur access manage karein.</p></div>
        <button className="refresh-button" onClick={onRefresh} type="button">Refresh</button>
      </div>
      {loading ? <p className="empty-state">Loading users...</p> : users.length === 0 ? <p className="empty-state">Abhi koi user nahi hai.</p> : (
        <div className="user-list">
          {users.map((user) => {
            const draft = drafts[user._id] || user;
            return (
              <div className="user-row" key={user._id}>
                <div className="user-fields">
                  <input value={draft.name} onChange={(event) => updateDraft(user._id, "name", event.target.value)} aria-label={`${user.email} name`} />
                  <input value={draft.email} onChange={(event) => updateDraft(user._id, "email", event.target.value)} aria-label={`${user.email} email`} type="email" />
                  <select value={draft.role} onChange={(event) => updateDraft(user._id, "role", event.target.value)} disabled={user._id === currentUserId} aria-label={`${user.email} role`}>
                    <option value="user">User</option><option value="admin">Admin</option>
                  </select>
                </div>
                <div className="user-actions">
                  <button className="save-button" onClick={() => onUpdate(user._id, draft)} type="button">Save</button>
                  <button className="delete-button" disabled={user._id === currentUserId} onClick={() => onDelete(user._id)} type="button">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default App;
