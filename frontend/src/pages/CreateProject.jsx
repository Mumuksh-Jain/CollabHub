import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../services/api';
import TagSelector from '../components/TagSelector';
import { TECH_STACK_OPTIONS, ROLE_OPTIONS } from '../constants/options';

export default function CreateProject() {
  const [form, setForm] = useState({
    title: '', description: '', tech_stack: [], roles_needed: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        tech_stack: form.tech_stack,
        roles_needed: form.roles_needed,
      };
      await projectAPI.create(payload);
      navigate('/my-projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="form-page">
        <div className="form-card">
          <div className="form-header">
            <div className="auth-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                <line x1="12" y1="11" x2="12" y2="17"/>
                <line x1="9" y1="14" x2="15" y2="14"/>
              </svg>
            </div>
            <h1>Create a Project</h1>
            <p>Describe your project and find collaborators</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="title">Project Title</label>
              <input id="title" type="text" name="title" placeholder="My Awesome Project" value={form.title} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" placeholder="What's the project about? What problem does it solve?" rows="4" value={form.description} onChange={handleChange} required minLength={40}/>
            </div>

            <TagSelector 
              label="Tech Stack"
              placeholder="Select technologies..."
              options={TECH_STACK_OPTIONS}
              selectedTags={form.tech_stack} 
              onChange={(selected) => setForm({ ...form, tech_stack: selected })}
              required
            />
            
            <TagSelector 
              label="Roles Needed"
              placeholder="Select roles..."
              options={ROLE_OPTIONS}
              selectedTags={form.roles_needed} 
              onChange={(selected) => setForm({ ...form, roles_needed: selected })}
              required
            />

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <span className="spinner-sm"></span> : 'Create Project'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
