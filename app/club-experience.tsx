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

function FoodHighlight({
  className = '',
  message = 'LIGHT SNACKS PROVIDED.',
}: {
  className?: string;
  message?: string;
}) {
  return (
    <article className={`food-card ${className}`.trim()}>
      <img
        src="/hawkers-menu.jpg"
        alt="A spread of dishes from the Hawkers menu"
        width="1920"
        height="1280"
        loading="lazy"
        decoding="async"
      />
      <div className="food-card-shade" aria-hidden="true" />
      <div className="food-card-content">
        <strong>{message}</strong>
        <a href="https://eathawkers.com/menus/dining/" target="_blank" rel="noreferrer">
          VIEW HAWKERS MENU <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}

function LocationCard({
  headingId,
  label,
  mapPreviewUrl,
  primaryMapsUrl,
  googleMapsUrl,
  className = '',
}: {
  headingId: string;
  label: string;
  mapPreviewUrl: string;
  primaryMapsUrl: string;
  googleMapsUrl: string;
  className?: string;
}) {
  return (
    <article className={`location-card ${className}`.trim()} aria-labelledby={headingId}>
      <div className="section-heading-row">
        <div>
          <p className="step-label">{label}</p>
          <h2 id={headingId}>WHERE WE MEET</h2>
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
  );
}

const TOPICS = [
  {
    number: '01',
    art: 'learn',
    title: 'USE AI TO LEARN BETTER',
    text: 'Turn AI into a personal tutor. Create practice tests, question banks, study tools, explanations, and better ways to understand difficult subjects.',
    wide: true,
  },
  {
    number: '02',
    art: 'build',
    title: 'BUILD WITH AI',
    text: 'Take an idea and turn it into something real. Build websites, apps, games, study tools, automations, and more—even while you are still learning to code.',
  },
  {
    number: '03',
    art: 'works',
    title: 'HOW DOES AI ACTUALLY WORK?',
    text: 'Go beyond just using ChatGPT. Explore neural networks, machine learning, tokens, training, models, and how AI learns patterns.',
  },
  {
    number: '04',
    art: 'agents',
    title: 'AI THAT CAN DO THINGS',
    text: 'Learn how AI can search, use tools, work with files, call APIs, and complete multi-step tasks. Meet the idea behind AI agents.',
    wide: true,
  },
  {
    number: '05',
    art: 'tools',
    title: 'CREATE YOUR OWN AI TOOLS',
    text: 'See something useful online? Understand the idea, recreate the functionality, and improve it for what YOU need.',
    examples: ['Question banks', 'Flashcards', 'Study websites', 'Personal tutors', 'Productivity tools'],
    note: 'Study useful ideas—not proprietary code, branding, or copyrighted material.',
    wide: true,
  },
] as const;

function ExploreSection({
  registered,
  onJoin,
}: {
  registered: boolean;
  onJoin: () => void;
}) {
  return (
    <section className="explore-section" aria-labelledby="explore-title">
      <div className="content-shell explore-shell">
        <header className="explore-header" data-reveal>
          <div className="explore-index" aria-hidden="true">// 05 SIGNALS</div>
          <p className="step-label">THE CLUB // BEYOND THE PROMPT</p>
          <h2 id="explore-title">WHAT WE&apos;LL<br /><span>EXPLORE</span></h2>
          <p className="explore-intro">
            AI is changing how we learn, create, build, and solve problems.
            This club is about understanding how to actually use it.
          </p>
          <div className="explore-scanline" aria-hidden="true"><span /></div>
        </header>

        <div className="topic-grid">
          {TOPICS.map((topic) => (
            <article
              className={`topic-card${'wide' in topic && topic.wide ? ' topic-card--wide' : ''}`}
              data-reveal
              key={topic.number}
            >
              <div
                className={`topic-visual topic-visual--${topic.art}`}
                aria-hidden="true"
              >
                <span className="topic-corner topic-corner--top" />
                <span className="topic-corner topic-corner--bottom" />
              </div>
              <div className="topic-copy">
                <span className="topic-number">{topic.number}</span>
                <h3>{topic.title}</h3>
                <p>{topic.text}</p>
                {'examples' in topic && (
                  <ul className="topic-tags" aria-label="Example projects">
                    {topic.examples.map((example) => <li key={example}>{example}</li>)}
                  </ul>
                )}
                {'note' in topic && <p className="topic-note">{topic.note}</p>}
              </div>
            </article>
          ))}
        </div>

        <section className="curiosity-panel" data-reveal>
          <div className="curiosity-orbit" aria-hidden="true">
            <i /><i /><i />
          </div>
          <div className="curiosity-copy">
            <p className="step-label">OPEN INVITATION // ALL SKILL LEVELS</p>
            <h2>YOU DON&apos;T NEED TO<br />ALREADY KNOW AI.</h2>
            <p>You just need to be curious.</p>
          </div>
          <button className="primary-button curiosity-button" type="button" onClick={onJoin}>
            <span>I&apos;M IN</span>
            <span aria-hidden="true">{registered ? '↑' : '→'}</span>
          </button>
        </section>

        <div className="first-meeting-grid" data-reveal>
          <section className="meeting-teaser" aria-labelledby="meeting-teaser-title">
            <p className="step-label">FIRST MEETING // A PREVIEW</p>
            <h2 id="meeting-teaser-title">WHAT WILL WE<br />ACTUALLY DO?</h2>
            <p className="meeting-teaser-intro">
              At meetings we&apos;ll explore real AI tools, build things together,
              break down how the technology works, and figure out how students
              can use AI more effectively.
            </p>
            <p className="evolving-note">
              <span aria-hidden="true" /> NOT A FIXED CURRICULUM. BUILT TO EVOLVE.
            </p>
          </section>

          <FoodHighlight className="food-card--explore" />
        </div>
      </div>
    </section>
  );
}

export default function ClubExperience() {
  const registrationSectionRef = useRef<HTMLElement>(null);
  const confirmationSectionRef = useRef<HTMLElement>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const resetRequested =
      new URLSearchParams(window.location.search).get('register') === '1';

    if (resetRequested) {
      window.localStorage.removeItem(LOCAL_REGISTRATION_KEY);
      window.sessionStorage.removeItem(SESSION_KEY);
      window.sessionStorage.removeItem(SESSION_SUBMITTED_KEY);
      window.history.replaceState({}, '', window.location.pathname);
    }

    setRegistered(
      !resetRequested &&
        Boolean(window.localStorage.getItem(LOCAL_REGISTRATION_KEY)),
    );
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

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -9% 0px', threshold: 0.08 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const openSignup = () => {
    setSignupOpen(true);
    window.setTimeout(() => {
      registrationSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('student-name')?.focus({ preventScroll: true });
    }, 0);
  };

  const handleJoin = () => {
    if (!registered) {
      openSignup();
      return;
    }

    confirmationSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedName = name.trim().replace(/\s+/g, ' ');
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail) {
      setError('Please complete all fields.');
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
        body: JSON.stringify({
          name: normalizedName,
          email: normalizedEmail,
          sessionKey,
        }),
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
      setSignupOpen(false);
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
  const mapPreviewUrl = `https://www.google.com/maps?q=${encodeURIComponent(getDestination())}&output=embed&maptype=roadmap`;

  return (
    <main className="site-shell">
      <DigitalRain />
      <div className="rain-overlay" aria-hidden="true" />

      <section
        className="confirmation-wrap screen-enter"
        aria-labelledby="confirmation-title"
        ref={confirmationSectionRef}
      >
        <div className="content-shell">
            <header className="confirmation-brand">
              <div>
                <p className="compact-brand">{CLUB_CONFIG.clubName}</p>
                <p>{CLUB_CONFIG.subtitle}</p>
              </div>
              <span className={`status-chip${registered ? '' : ' status-chip--pending'}`}>
                <i aria-hidden="true" /> {registered ? 'REGISTERED' : 'NOT REGISTERED'}
              </span>
            </header>

            <article className="confirmation-card">
              <div className={registered ? 'success-icon' : 'signup-icon'} aria-hidden="true">
                {registered ? '✓' : '+'}
              </div>
              <p className="step-label">{registered ? 'REGISTRATION COMPLETE' : 'AI CLUB // STUDENT SUCCESS'}</p>
              <h1 id="confirmation-title">
                {registered ? <>YOU&apos;RE<br />REGISTERED.</> : <>REGISTER<br />NOW.</>}
              </h1>
              <p className="welcome-copy">
                {registered
                  ? 'Welcome to AI Club.'
                  : 'No pressure—registering just lets us know you’re interested.'}
              </p>

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

              {!registered && (
                <button className="primary-button signup-reset-button" type="button" onClick={openSignup}>
                  <span>SIGN UP</span>
                  <span aria-hidden="true">→</span>
                </button>
              )}
            </article>

            {!registered && signupOpen && (
              <section
                className="registration-wrap registration-wrap--inline"
                aria-labelledby="registration-title"
                ref={registrationSectionRef}
              >
                <div className="registration-card">
                  <form className="registration-form" onSubmit={handleSubmit} noValidate>
                    <div>
                      <p className="step-label">REGISTRATION // 01</p>
                      <h2 id="registration-title">YOUR NAME</h2>
                      <p className="form-hint">That&apos;s all we need.</p>
                    </div>

                    <div className="field-group">
                      <label htmlFor="student-name">Your name</label>
                      <input
                        id="student-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        enterKeyHint="go"
                        placeholder="First Name"
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

                    <div className="field-group">
                      <label htmlFor="student-email">Personal email</label>
                      <input
                        id="student-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        aria-describedby={error ? 'name-error' : undefined}
                        aria-invalid={Boolean(error)}
                        maxLength={254}
                        disabled={submitting}
                      />
                    </div>

                    <button className="primary-button" type="submit" disabled={submitting}>
                      <span>{submitting ? 'SAVING…' : 'CONTINUE'}</span>
                      <span aria-hidden="true">→</span>
                    </button>
                  </form>

                  <p className="privacy-note">
                    <span aria-hidden="true">●</span> Your details are used only for club registration and are not publicly visible.
                  </p>
                </div>
              </section>
            )}

            <FoodHighlight
              className="food-card--confirmation"
              message="LIGHT SNACKS PROVIDED."
            />

            <LocationCard
              headingId="location-title"
              label="MEETING POINT // 01"
              mapPreviewUrl={mapPreviewUrl}
              primaryMapsUrl={primaryMapsUrl}
              googleMapsUrl={googleMapsUrl}
            />

        </div>
      </section>

      <ExploreSection registered={registered} onJoin={handleJoin} />

      <footer className="site-footer global-footer">
        <span>{CLUB_CONFIG.clubName}</span>
        <a className="organizer-access" href="/admin">ORGANIZER ACCESS</a>
        <span>SEE YOU THERE.</span>
      </footer>
    </main>
  );
}
