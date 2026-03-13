import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TagSelector from '../components/TagSelector';
import { TECH_STACK_OPTIONS } from '../constants/options';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', skills: [], bio: '', github: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  if (isLoggedIn) return <Navigate to="/" replace />;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        skills: form.skills,
      };
      await register(payload);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <h1>Join CollabHub</h1>
          <p>Create your account and start collaborating</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Username</label>
              <input id="name" type="text" name="name" placeholder="johndoe" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="github">GitHub URL</label>
              <input id="github" type="url" name="github" placeholder="https://github.com/you" value={form.github} onChange={handleChange}  />
            </div>
          </div>

          <TagSelector 
            label="Skills"
            placeholder="Search and select your skills..."
            options={TECH_STACK_OPTIONS}
            selectedTags={form.skills} 
            onChange={(selected) => setForm({ ...form, skills: selected })}
            required
          />

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea id="bio" name="bio" placeholder="Tell us about yourself..." rows="3" value={form.bio} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner-sm"></span> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
