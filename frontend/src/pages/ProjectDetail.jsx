import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../services/api';
import { useState, useEffect } from 'react';

export default function ProjectDetail() {
  const { id } = useParams();
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await projectAPI.getById(id);
        setProject(res.data.project);
      } catch {
        setProject(null);
      } finally {
        setFetching(false);
      }
    };
    fetchProject();
  }, [id]);

  const isCreator = user && project && (
    String(user._id) === String(project.created_by?._id) || String(user._id) === String(project.created_by)
  );

  const isMember = user && project?.members?.some(
    m => String(m.user?._id || m.user) === String(user._id)
  );

  if (fetching) {
    return (
      <div className="page">
        <div className="loading-screen"><div className="spinner"></div></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page">
        <div className="detail-page">
          <div className="empty-state">
            <h3>Project Not Found</h3>
            <p>This project may have been removed or the link is invalid.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Explore</button>
          </div>
        </div>
      </div>
    );
  }

  const handleJoin = async () => {
    setMessage('');
    setLoading(true);
    try {
      const res = await projectAPI.requestJoin(project._id);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="detail-page">
        <button className="btn btn-outline btn-sm back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="detail-card">
          <div className="detail-meta">
            <span className="project-author">
              by {project.created_by?.name || 'Unknown'}
            </span>
          </div>

          <h1 className="detail-title">{project.title}</h1>

          {project.description && (
            <p className="detail-description">{project.description}</p>
          )}

          {project.tech_stack?.length > 0 && (
            <div className="detail-section">
              <h4>Tech Stack</h4>
              <div className="project-tags">
                {project.tech_stack.map((t, i) => (
                  <span key={i} className="tag tag-tech">{t}</span>
                ))}
              </div>
            </div>
          )}

          {project.roles_needed?.length > 0 && (
            <div className="detail-section">
              <h4>Roles Needed</h4>
              <div className="project-tags">
                {project.roles_needed.map((r, i) => (
                  <span key={i} className="tag tag-role">{r}</span>
                ))}
              </div>
            </div>
          )}

          {project.members?.length > 0 && (
            <div className="detail-section">
              <h4>Team Members</h4>
              <div className="members-list">
                {project.members.map((m, i) => (
                  <span key={i} className="member-chip">
                    {m.user?.name || 'Unknown'} — {m.role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {message && (
            <div className={`alert ${message.includes('lacking') || message.includes('already') || message.includes('failed') ? 'alert-error' : 'alert-success'}`}>
              {message}
            </div>
          )}

          {isLoggedIn && isCreator && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '16px' }}>
              This is your project. Manage it from <a href="/my-projects">My Projects</a>.
            </p>
          )}

          {isLoggedIn && isMember && !isCreator && (
            <div className="alert alert-success" style={{ marginTop: '16px' }}>
              ✓ You are already a member of this project
            </div>
          )}

          {isLoggedIn && !isCreator && !isMember && (
            <button
              className="btn btn-primary btn-full"
              onClick={handleJoin}
              disabled={loading}
            >
              {loading ? <span className="spinner-sm"></span> : 'Request to Join'}
            </button>
          )}

          {!isLoggedIn && (
            <p className="detail-login-hint">
              <a href="/login">Sign In</a> to Request to Join this project
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
