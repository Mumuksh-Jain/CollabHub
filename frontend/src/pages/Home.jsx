import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AdvancedFilter from '../components/AdvancedFilter';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState({ tech_stack: [], roles: [] });
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isLoggedIn } = useAuth();

  const fetchProjects = async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const hasQuery = params.q && params.q.trim() !== '';
      const hasFilters = (params.tech_stack && params.tech_stack.length > 0) || 
                         (params.roles && params.roles.length > 0);

      const res = (hasQuery || hasFilters)
        ? await projectAPI.search(params)
        : await projectAPI.getAll();
        
      setProjects(res.data.projects || []);
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 400) {
        setProjects([]);
      } else {
        setError(err.response?.data?.message || 'Failed to load projects');
      }
    } finally {
      setLoading(false);
    }
  };

  // Combined search and filter effect
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = { q: search };
      if (activeFilters.tech_stack.length > 0) params.tech_stack = activeFilters.tech_stack;
      if (activeFilters.roles.length > 0) params.roles = activeFilters.roles;
      
      fetchProjects(params);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, activeFilters]);

  const handleSearch = (e) => {
    e.preventDefault();
    // fetchProjects will be triggered by useEffect
  };

  const handleApplyFilter = (filters) => {
    setActiveFilters(filters);
    setShowFilter(false);
  };

  return (
    <div className="page">
      {/* Hero */}
      <section className="hero fade-up" style={{ position: 'relative', zIndex: 10 }}>
        <div className="hero-content">
          <h1 className="hero-title">
            Find Your Next <span className="gradient-text">Collaboration</span>
          </h1>
          <p className="hero-subtitle">
            Discover projects, join teams, and build something amazing together.
          </p>
          
          <div className="search-container scale-in" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
            <form onSubmit={handleSearch} className="search-bar" style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                <svg className="search-icon" style={{ left: '16px' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  id="search-input"
                  style={{ paddingLeft: '48px' }}
                />
              </div>
              <button 
                type="button" 
                className={`btn ${showFilter || activeFilters.tech_stack.length > 0 || activeFilters.roles.length > 0 ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setShowFilter(!showFilter)}
                style={{ minWidth: '100px' }}
              >
                {showFilter ? 'Hide Filter' : 'Filter'}
                {(activeFilters.tech_stack.length + activeFilters.roles.length) > 0 && (
                  <span style={{ marginLeft: '6px', padding: '1px 6px', background: 'var(--accent-red)', color: '#fff', fontSize: '10px', borderRadius: '10px' }}>
                    {activeFilters.tech_stack.length + activeFilters.roles.length}
                  </span>
                )}
              </button>
              <button type="submit" className="btn btn-primary">Search</button>
            </form>

            {showFilter && (
              <AdvancedFilter 
                onFilter={handleApplyFilter} 
                onClose={() => setShowFilter(false)} 
              />
            )}

            {(activeFilters.tech_stack.length > 0 || activeFilters.roles.length > 0) && (
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {activeFilters.tech_stack.map(s => (
                  <span key={s} className="tag tag-tech" style={{ padding: '2px 10px', fontSize: '11px' }}>{s}</span>
                ))}
                {activeFilters.roles.map(r => (
                  <span key={r} className="tag tag-role" style={{ padding: '2px 10px', fontSize: '11px' }}>{r}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="section">
        <div className="section-header">
          <h2>
            {search ? `Results for "${search}"` : 'Explore Projects'}
          </h2>
          {isLoggedIn && (
            <Link to="/create-project" className="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Project
            </Link>
          )}
        </div>

        {loading && (
          <div className="loading-screen">
            <div className="spinner"></div>
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {!loading && projects.length === 0 && (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
              <polyline points="13 2 13 9 20 9"/>
            </svg>
            <h3>No Projects Found</h3>
            <p>Be the first to create a project!</p>
            {isLoggedIn && (
              <Link to="/create-project" className="btn btn-primary">Create Project</Link>
            )}
          </div>
        )}

        <div className="projects-grid stagger-children">
          {projects.map((project) => (
            <Link
              key={project._id}
              to={`/project/${project._id}`}
              state={{ project }}
              className="project-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="project-card-header">
                <h3 className="project-title">{project.title}</h3>
                <span className="project-author">
                  by {project.created_by?.name || 'Unknown'}
                </span>
              </div>
              {project.description && (
                <p style={{ fontSize: '0.8125rem', color: '#555', lineHeight: '1.5' }}>
                  {project.description.length > 100
                    ? project.description.substring(0, 100) + '...'
                    : project.description}
                </p>
              )}
              {project.tech_stack?.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h5 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', color: 'var(--text)' }}>Skills Required:</h5>
                  <div className="project-tags" style={{ marginTop: 0 }}>
                    {project.tech_stack.map((t, i) => (
                      <span key={`tech-${i}`} className="tag tag-tech">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {project.roles_needed?.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h5 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', color: 'var(--text)' }}>Roles Needed:</h5>
                  <div className="project-tags" style={{ marginTop: 0 }}>
                    {project.roles_needed.map((role, i) => (
                      <span key={`role-${i}`} className="tag tag-role">{role}</span>
                    ))}
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
