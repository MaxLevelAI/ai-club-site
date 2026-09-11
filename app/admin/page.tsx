import { CLUB_CONFIG } from '@/app/config';
import { getAdminCode, isAdminAuthorized } from '@/app/admin-auth';
import { listRegistrations } from '@/db/registrations';

export const dynamic = 'force-dynamic';

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

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!(await isAdminAuthorized())) {
    const { error } = await searchParams;
    const codeConfigured = getAdminCode() !== null;
    const showError = error === '1';

    return (
      <main className="admin-shell">
        <section className="admin-panel access-panel">
          <p className="admin-kicker">AI CLUB // ORGANIZER</p>
          <h1>ENTER ACCESS CODE</h1>
          <p>
            This area shows every student&apos;s registration details. Enter the
            organizer code to continue.
          </p>

          {codeConfigured ? (
            <form className="admin-login-form" method="post" action="/admin/login">
              <div className="field-group">
                <label htmlFor="admin-code">Organizer code</label>
                <input
                  id="admin-code"
                  name="code"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Access code"
                  aria-invalid={showError}
                  aria-describedby={showError ? 'admin-code-error' : undefined}
                  autoFocus
                  required
                />
                {showError && (
                  <p className="field-error" id="admin-code-error" role="alert">
                    Incorrect code. Please try again.
                  </p>
                )}
              </div>
              <button className="primary-button" type="submit">
                <span>UNLOCK</span>
                <span aria-hidden="true">→</span>
              </button>
            </form>
          ) : (
            <p className="field-error" role="alert">
              The organizer code has not been set up yet. Add an ADMIN_CODE value
              in the site settings to enable access.
            </p>
          )}
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
          <form method="post" action="/admin/logout">
            <button type="submit" className="admin-signout admin-signout-button">
              SIGN OUT
            </button>
          </form>
        </header>

        {registrations.length ? (
          <div className="registration-table-wrap">
            <table className="registration-table">
              <thead>
                <tr>
                  <th scope="col">STUDENT NAME</th>
                  <th scope="col">PERSONAL EMAIL</th>
                  <th scope="col">DATE</th>
                  <th scope="col">TIME</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((registration) => (
                  <tr key={registration.id}>
                    <td>{registration.name}</td>
                    <td>{registration.email ?? '—'}</td>
                    <td>{formatDate(registration.registered_at)}</td>
                    <td>{formatTime(registration.registered_at)}</td>
                    <td className="registration-actions">
                      <form method="post" action="/admin/delete">
                        <input type="hidden" name="id" value={registration.id} />
                        <button
                          type="submit"
                          className="registration-remove"
                          aria-label={`Remove ${registration.name}`}
                        >
                          Remove
                        </button>
                      </form>
                    </td>
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
