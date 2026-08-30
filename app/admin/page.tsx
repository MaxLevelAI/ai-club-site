import { CLUB_CONFIG } from '@/app/config';
import { chatGPTSignOutPath, requireChatGPTUser } from '@/app/chatgpt-auth';
import { listRegistrations } from '@/db/registrations';

export const dynamic = 'force-dynamic';

function configuredAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isAuthorizedAdmin(email: string) {
  const normalizedEmail = email.toLowerCase();
  const configuredEmails = configuredAdminEmails();
  const localPreviewAdmin =
    process.env.NODE_ENV !== 'production' && normalizedEmail === 'seedy@sites.test';

  return configuredEmails.includes(normalizedEmail) || localPreviewAdmin;
}

function formatDate(timestamp: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeZone: CLUB_CONFIG.timeZone,
  }).format(new Date(timestamp));
}

function formatTime(timestamp: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeStyle: 'short',
    timeZone: CLUB_CONFIG.timeZone,
  }).format(new Date(timestamp));
}

export default async function AdminPage() {
  const user = await requireChatGPTUser('/admin');

  if (!isAuthorizedAdmin(user.email)) {
    return (
      <main className="admin-shell">
        <section className="admin-panel access-panel">
          <p className="admin-kicker">AI CLUB // ORGANIZER</p>
          <h1>ACCESS NOT AUTHORIZED</h1>
          <p>
            You are signed in as {user.email}, but this address is not on the
            organizer allowlist.
          </p>
          <a className="secondary-button admin-link" href={chatGPTSignOutPath('/admin')}>
            SIGN IN WITH ANOTHER ACCOUNT
          </a>
        </section>
      </main>
    );
  }

  const registrations = await listRegistrations();

  return (
    <main className="admin-shell">
      <section className="admin-panel">
        <header className="admin-header">
          <div>
            <p className="admin-kicker">AI CLUB // ORGANIZER</p>
            <h1>REGISTRATIONS</h1>
            <p>{registrations.length} student{registrations.length === 1 ? '' : 's'} registered</p>
          </div>
          <a href={chatGPTSignOutPath('/')} className="admin-signout">SIGN OUT</a>
        </header>

        {registrations.length ? (
          <div className="registration-table-wrap">
            <table className="registration-table">
              <thead>
                <tr>
                  <th scope="col">STUDENT NAME</th>
                  <th scope="col">DATE</th>
                  <th scope="col">TIME</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((registration) => (
                  <tr key={registration.id}>
                    <td>{registration.name}</td>
                    <td>{formatDate(registration.registered_at)}</td>
                    <td>{formatTime(registration.registered_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">No registrations yet.</p>
        )}
      </section>
    </main>
  );
}
