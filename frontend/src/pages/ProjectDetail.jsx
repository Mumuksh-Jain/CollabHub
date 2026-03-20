import { useNavigate, useParams } from 'react-router-dom';
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
  const [recommendations, setRecommendations] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

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
    String(user._id) === String(project.created_by?._id) ||
    String(user._id) === String(project.created_by)
  );

  const isMember = user && project?.members?.some(
    m => String(m.user?._id || m.user) === String(user._id)
  );

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

  const handleGetRecommendations = async () => {
    const btn = document.getElementById('ai-btn-match');
    btn.disabled = true;
    btn.innerText = 'Analyzing...';
    setAiLoading(true);
    setRecommendations([]);
    setMessage('');
    try {
      const { aiAPI, authAPI } = await import('../services/api');
      const usersRes = await authAPI.getUsers();
      const payload = {
        project: {
          title: project.title,
          techStack: project.tech_stack,
        },
        developers: usersRes.data.users,
      };
      const matchRes = await aiAPI.match(payload);
      setRecommendations(matchRes.data.topMatches ?? []);
    } catch (err) {
      setMessage('Failed to get AI recommendations. Please try again.');
    } finally {
      btn.disabled = false;
      btn.innerText = '✨ Refresh Recommendations';
      setAiLoading(false);
    }
  };

  const handleInvite = async (developerId, index) => {
    try {
      await projectAPI.inviteDev(project._id, developerId);
      setRecommendations(prev =>
        prev.map((r, i) => i === index ? { ...r, invited: true } : r)
      );
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to send invite');
    }
  };

  // ─── Loading state ────────────────────────────────────────────────────────
  if (fetching) {
    return (
      <div className="page">
        <div className="loading-screen"><div className="spinner"></div></div>
      </div>
    );
  }

  // ─── Not found state ──────────────────────────────────────────────────────
  if (!project) {
    return (
      <div className="page">
        <div className="detail-page">
          <div className="empty-state">
            <h3>Project Not Found</h3>
            <p>This project may have been removed or the link is invalid.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Back to Explore
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="page">
      <div className="detail-page">
        <button className="btn btn-outline btn-sm back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="detail-card">
          {/* Meta */}
          <div className="detail-meta">
            <span className="project-author">by {project.created_by?.name || 'Unknown'}</span>
          </div>

          {/* Title */}
          <h1 className="detail-title">{project.title}</h1>

          {/* Description */}
          {project.description && (
            <p className="detail-description">{project.description}</p>
          )}

          {/* Tech Stack */}
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

          {/* Roles Needed */}
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

          {/* Team Members */}
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

          {/* Alert */}
          {message && (
            <div className={`alert ${
              message.includes('lacking') || message.includes('already') ||
              message.includes('failed') || message.includes('Failed')
                ? 'alert-error' : 'alert-success'
            }`}>
              {message}
            </div>
          )}

          {/* AI Recommendations — creator only */}
          {isLoggedIn && isCreator && (
            <div className="detail-section" style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0 }}>✨ AI Recommended Teammates</h4>
                <button
                  id="ai-btn-match"
                  className="btn-ai"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                  onClick={handleGetRecommendations}
                >
                  Get AI Recommendations
                </button>
              </div>

              {aiLoading && (
                <div className="ai-loading">
                  <div className="spinner-sm"></div>
                  <p style={{ fontSize: '0.9rem' }}>Searching for the best matches...</p>
                </div>
              )}

              {!aiLoading && recommendations.length === 0 && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Click the button above to find AI-matched teammates for this project.
                </p>
              )}

              {/* ✅ Single recommendations list — with Invite button */}
              <div className="stagger-children">
                {recommendations.map((rec, i) => (
                  <div key={i} className="ai-recommendation-card fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong style={{ fontSize: '1rem', color: 'var(--text)' }}>{rec.name}</strong>
                      <span className="ai-badge">{rec.matchScore}% Match</span>
                    </div>
                    <p className="ai-reason">{rec.reason}</p>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: '10px', fontSize: '0.8rem' }}
                      onClick={() => handleInvite(rec.developerId, i)}
                      disabled={rec.invited}
                    >
                      {rec.invited ? '✓ Invited' : '+ Invite'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Creator hint */}
          {isLoggedIn && isCreator && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '16px' }}>
              This is your project. Manage it from{' '}
              <a href="/my-projects">My Projects</a>.
            </p>
          )}

          {/* Already a member */}
          {isLoggedIn && isMember && !isCreator && (
            <div className="alert alert-success" style={{ marginTop: '16px' }}>
              ✓ You are already a member of this project
            </div>
          )}

          {/* Request to join */}
          {isLoggedIn && !isCreator && !isMember && (
            <button
              className="btn btn-primary btn-full"
              onClick={handleJoin}
              disabled={loading}
            >
              {loading ? <span className="spinner-sm"></span> : 'Request to Join'}
            </button>
          )}

          {/* Not logged in */}
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