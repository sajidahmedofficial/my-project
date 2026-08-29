// agent-notes: { ctx: "Rolemint Landing page with hero screenplay mockup card and 3-scene overview", deps: ["react-router-dom"], state: "active", last: "anti@2026-08-29" }

import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div>
      <section className="hero">
        <div className="eyebrow">Practice out loud before it's real</div>
        <h1>Rehearse the conversation before it counts.</h1>
        <p className="sub">
          Rolemint drops you into a live scene with an AI character who argues back,
          hesitates, and pushes — then hands you a real script review of what to say
          differently next time.
        </p>
        <div className="hero-cta">
          <Link to="/signup" className="btn btn-primary">Start rehearsing — free</Link>
          <Link to="/login" className="btn btn-ghost">I already have an account</Link>
        </div>

        <div className="script-card">
          <div className="slug">INT. COLD CALL — SKEPTICAL IT DIRECTOR — DAY</div>
          <div className="script-line">
            <div className="cue">PRIYA (IT DIRECTOR)</div>
            <p>I've got four minutes and I've heard this pitch before. What's different here?</p>
          </div>
          <div className="script-line trainee">
            <div className="cue">YOU</div>
            <p>Fair — I'll skip the pitch. What's actually breaking in your current setup right now?</p>
          </div>
          <div className="script-line">
            <div className="cue">PRIYA (IT DIRECTOR)</div>
            <p>...Okay. Our ticket backlog has doubled since the merger. Go on.</p>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <div className="num">Scene 01</div>
          <h3>Pick or write the scenario</h3>
          <p>Sales calls, interviews, tough customer conversations, or a custom persona you build yourself.</p>
        </div>
        <div className="feature">
          <div className="num">Scene 02</div>
          <h3>Play it live</h3>
          <p>An AI character responds in character — skeptical, distracted, or hostile, exactly as briefed.</p>
        </div>
        <div className="feature">
          <div className="num">Scene 03</div>
          <h3>Get the notes</h3>
          <p>A scored breakdown of what worked, what to cut, and what to try in the next take.</p>
        </div>
      </section>

      <div className="footer-note">Rolemint — practice rooms for hard conversations.</div>
    </div>
  );
}
