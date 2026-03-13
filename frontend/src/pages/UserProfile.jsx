import { useLocation, useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const user = state?.user;

  if (!user) {
    return (
      <div className="page">
        <div className="form-page">
          <div className="form-card">
            <div className="empty-state">
              <h3>User Not Found</h3>
              <p>This user profile is unavailable.</p>
              <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="form-page">
        <div className="form-card">
          <button className="btn btn-outline btn-sm back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <div className="form-header" style={{ marginTop: '16px' }}>
            <div className="auth-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h1>{user.name || 'Unknown User'}</h1>
            <p>Team Member Profile</p>
          </div>

          <div className="profile-view">
            <div className="profile-field">
              <span className="profile-label">Name</span>
              <span className="profile-value">{user.name || 'N/A'}</span>
            </div>

            {user.email && (
              <div className="profile-field">
                <span className="profile-label">Email</span>
                <span className="profile-value">{user.email}</span>
              </div>
            )}

            {user.role && (
              <div className="profile-field">
                <span className="profile-label">Role in Project</span>
                <span className="tag tag-role" style={{ alignSelf: 'flex-start' }}>{user.role}</span>
              </div>
            )}

            {user.skills?.length > 0 && (
              <div className="profile-field">
                <span className="profile-label">Skills</span>
                <div className="project-tags">
                  {user.skills.map((s, i) => (
                    <span key={i} className="tag tag-tech">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {user.bio && (
              <div className="profile-field">
                <span className="profile-label">Bio</span>
                <span className="profile-value">{user.bio}</span>
              </div>
            )}

            {user.github && (
              <div className="profile-field">
                <span className="profile-label">GitHub</span>
                <a href={user.github} target="_blank" rel="noreferrer" className="profile-value">
                  {user.github}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
