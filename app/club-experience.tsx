'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { CLUB_CONFIG } from './config';

function DigitalRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const characters = 'AI01<>/{}[]+*=#$%&?';
    let columns: number[] = [];
    let animationFrame = 0;
    let lastFrame = 0;
    let width = 0;
    let height = 0;
    let fontSize = 17;

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      fontSize = width < 600 ? 15 : 18;
      columns = Array.from(
        { length: Math.ceil(width / fontSize) },
        () => Math.random() * (-height / fontSize),
      );
      context.fillStyle = '#020806';
      context.fillRect(0, 0, width, height);
    };

    const draw = (time: number) => {
      if (time - lastFrame < 48) {
        animationFrame = requestAnimationFrame(draw);
        return;
      }
      lastFrame = time;
      context.fillStyle = 'rgba(1, 8, 5, 0.13)';
      context.fillRect(0, 0, width, height);
      context.font = `500 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;

      columns.forEach((position, index) => {
        const character = characters[Math.floor(Math.random() * characters.length)];
        const x = index * fontSize;
        const y = position * fontSize;
        const isLead = Math.random() > 0.94;
        context.fillStyle = isLead ? '#d9ffe8' : '#18ff65';
        context.globalAlpha = isLead ? 0.92 : 0.34 + Math.random() * 0.28;
        context.fillText(character, x, y);
        context.globalAlpha = 1;

        const speed = 0.58 + (index % 7) * 0.075;
        columns[index] =
          y > height && Math.random() > 0.975
            ? Math.random() * -24
            : position + speed;
      });

      animationFrame = requestAnimationFrame(draw);
    };

    const start = () => {
      cancelAnimationFrame(animationFrame);
      if (!reducedMotion.matches) animationFrame = requestAnimationFrame(draw);
    };

    resize();
    start();
    window.addEventListener('resize', resize, { passive: true });
    reducedMotion.addEventListener('change', start);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      reducedMotion.removeEventListener('change', start);
    };
  }, []);

  return <canvas ref={canvasRef} className="digital-rain" aria-hidden="true" />;
}

const LOCAL_REGISTRATION_KEY = 'ai-club-registration';
const SESSION_KEY = 'ai-club-session-key';
const SESSION_SUBMITTED_KEY = 'ai-club-session-submitted';

function isConfigured(value: string) {
  return !value.endsWith('_TO_BE_ADDED');
}

function getDestination() {
  return isConfigured(CLUB_CONFIG.address)
    ? CLUB_CONFIG.address
    : `${CLUB_CONFIG.venueName}, ${CLUB_CONFIG.venueArea}`;
}

function getGoogleMapsUrl() {
  return isConfigured(CLUB_CONFIG.googleMapsUrl)
    ? CLUB_CONFIG.googleMapsUrl
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getDestination())}`;
}

function getAppleMapsUrl() {
  return isConfigured(CLUB_CONFIG.appleMapsUrl)
    ? CLUB_CONFIG.appleMapsUrl
    : `https://maps.apple.com/?q=${encodeURIComponent(getDestination())}`;
}

function createSessionKey() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export default function ClubExperience() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setRegistered(Boolean(window.localStorage.getItem(LOCAL_REGISTRATION_KEY)));
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    );
  }, []);

  useEffect(() => {
    if (!registered) return;
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  }, [registered]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedName = name.trim().replace(/\s+/g, ' ');

    if (!normalizedName) {
      setError('Please enter your first and last name.');
      return;
    }

    if (window.sessionStorage.getItem(SESSION_SUBMITTED_KEY) === 'true') {
      setRegistered(true);
      return;
    }

    setError('');
    setSubmitting(true);

    let sessionKey = window.sessionStorage.getItem(SESSION_KEY);
    if (!sessionKey) {
      sessionKey = createSessionKey();
      window.sessionStorage.setItem(SESSION_KEY, sessionKey);
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: normalizedName, sessionKey }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || 'Registration could not be saved.');
      }

      window.sessionStorage.setItem(SESSION_SUBMITTED_KEY, 'true');
      window.localStorage.setItem(
        LOCAL_REGISTRATION_KEY,
        JSON.stringify({ name: normalizedName, savedAt: new Date().toISOString() }),
      );
      setRegistered(true);
    } catch (registrationError) {
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const googleMapsUrl = getGoogleMapsUrl();
  const primaryMapsUrl = isIOS ? getAppleMapsUrl() : googleMapsUrl;
  const mapPreviewUrl = `https://www.google.com/maps?q=${encodeURIComponent(getDestination())}&output=embed`;

  return (
    <main className="site-shell">
      <DigitalRain />
      <div className="rain-overlay" aria-hidden="true" />

      {!registered ? (
        <section className="registration-wrap screen-enter" aria-labelledby="registration-title">
          <div className="registration-card">
            <header className="brand-lockup">
              <p className="brand-mark">{CLUB_CONFIG.clubName}</p>
              <p className="brand-subtitle">{CLUB_CONFIG.subtitle}</p>
            </header>

            <div className="signal-line" aria-hidden="true"><span /></div>

            <form className="registration-form" onSubmit={handleSubmit} noValidate>
              <div>
                <p className="step-label">REGISTRATION // 01</p>
                <h1 id="registration-title">WHAT&apos;S YOUR NAME?</h1>
                <p className="form-hint">One name. That&apos;s it.</p>
              </div>

              <div className="field-group">
                <label htmlFor="student-name">First and last name</label>
                <input
                  id="student-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  enterKeyHint="go"
                  placeholder="First and Last Name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  aria-describedby={error ? 'name-error' : undefined}
                  aria-invalid={Boolean(error)}
                  maxLength={100}
                  autoFocus
                  disabled={submitting}
                />
                <p className="field-error" id="name-error" role="alert">{error}</p>
              </div>

              <button className="primary-button" type="submit" disabled={submitting}>
                <span>{submitting ? 'SAVING…' : 'CONTINUE'}</span>
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <p className="privacy-note">
              <span aria-hidden="true">●</span> Your name is used only for club registration.
            </p>
          </div>
        </section>
      ) : (
        <section className="confirmation-wrap screen-enter" aria-labelledby="confirmation-title">
          <div className="content-shell">
            <header className="confirmation-brand">
              <div>
                <p className="compact-brand">{CLUB_CONFIG.clubName}</p>
                <p>{CLUB_CONFIG.subtitle}</p>
              </div>
              <span className="status-chip"><i aria-hidden="true" /> REGISTERED</span>
            </header>

            <article className="confirmation-card">
              <div className="success-icon" aria-hidden="true">✓</div>
              <p className="step-label">REGISTRATION COMPLETE</p>
              <h1 id="confirmation-title">YOU&apos;RE<br />REGISTERED.</h1>
              <p className="welcome-copy">Welcome to AI Club.</p>

              <dl className="event-grid">
                <div>
                  <dt>DATE</dt>
                  <dd>{CLUB_CONFIG.eventDate}</dd>
                </div>
                <div>
                  <dt>TIME</dt>
                  <dd>{CLUB_CONFIG.eventTime}</dd>
                </div>
              </dl>
            </article>

            <aside className="food-callout">
              <span aria-hidden="true">🍱</span>
              <strong>THERE WILL BE FOOD!</strong>
            </aside>

            <article className="location-card" aria-labelledby="location-title">
              <div className="section-heading-row">
                <div>
                  <p className="step-label">MEETING POINT // 01</p>
                  <h2 id="location-title">WHERE WE MEET</h2>
                </div>
                <span className="location-ping" aria-hidden="true" />
              </div>

              <div className="venue-block">
                <p className="venue-name">{CLUB_CONFIG.venueName}</p>
                <p className="venue-area">{CLUB_CONFIG.venueArea}</p>
                <p className="venue-note">{CLUB_CONFIG.venueDescription}</p>
              </div>

              <div className="map-frame">
                <iframe
                  src={mapPreviewUrl}
                  title={`Map showing ${CLUB_CONFIG.venueName}, ${CLUB_CONFIG.venueArea}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                {!isConfigured(CLUB_CONFIG.address) && (
                  <p className="map-pending">EXACT ADDRESS COMING SOON</p>
                )}
              </div>

              <div className="directions-stack">
                <a className="primary-button directions-button" href={primaryMapsUrl} target="_blank" rel="noreferrer">
                  <span>GET DIRECTIONS</span>
                  <span aria-hidden="true">↗</span>
                </a>
                <a className="secondary-button" href={googleMapsUrl} target="_blank" rel="noreferrer">
                  OPEN IN GOOGLE MAPS
                </a>
              </div>
            </article>

            <footer className="site-footer">
              <span>{CLUB_CONFIG.clubName}</span>
              <span>SEE YOU THERE.</span>
            </footer>
          </div>
        </section>
      )}
    </main>
  );
}
