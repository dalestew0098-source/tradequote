export default function Landing() {
  return (
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Free HVAC Quote Generator — Professional Quotes in 30 Seconds</title>
  <meta name="description" content="Free HVAC quote and invoice generator built for HVAC contractors. Create professional quotes on your phone in 30 seconds. No sign up. No ads. Works offline." />
  <meta name="keywords" content="HVAC quote generator, HVAC invoice app, free HVAC estimate tool, HVAC contractor software, HVAC quote template" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    :root {
      --orange: #E8440A; --orange-light: #FF5A1F;
      --dark: #0E0E0E; --dark2: #1A1A1A; --dark3: #242424;
      --mid: #3A3A3A; --muted: #888; --light: #F0EDE8; --white: #FAFAF8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { font-family: 'Barlow', sans-serif; background: var(--dark); color: var(--white); overflow-x: hidden; }

    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 24px; background: rgba(14,14,14,0.92);
      backdrop-filter: blur(12px); border-bottom: 1px solid #222;
    }
    .nav-logo { font-family: 'Barlow Condensed', sans-serif; font-weight: 900; font-size: 22px; }
    .nav-logo span { color: var(--orange); }
    .nav-cta {
      background: var(--orange); color: #fff; border: none;
      font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 15px;
      letter-spacing: 0.04em; padding: 10px 20px; border-radius: 6px;
      cursor: pointer; text-decoration: none; text-transform: uppercase; transition: background 0.15s;
    }
    .nav-cta:hover { background: var(--orange-light); }

    .hero {
      min-height: 100vh; display: flex; flex-direction: column; justify-content: center;
      padding: 120px 24px 80px; position: relative; overflow: hidden;
    }
    .hero-bg {
      position: absolute; inset: 0; z-index: 0;
      background: radial-gradient(ellipse 60% 50% at 70% 50%, #E8440A18 0%, transparent 70%),
                  radial-gradient(ellipse 40% 40% at 20% 80%, #FF5A1F0A 0%, transparent 60%);
    }
    .hero-grid {
      position: absolute; inset: 0; z-index: 0; opacity: 0.04;
      background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .hero-content { position: relative; z-index: 1; max-width: 680px; }
    .hero-eyebrow {
      display: inline-flex; align-items: center; gap: 8px;
      background: #E8440A18; border: 1px solid #E8440A40;
      color: var(--orange); font-size: 12px; font-weight: 600;
      letter-spacing: 0.12em; text-transform: uppercase;
      padding: 6px 14px; border-radius: 20px; margin-bottom: 24px;
    }
    .hero-eyebrow::before { content: "●"; font-size: 8px; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
    h1 {
      font-family: 'Barlow Condensed', sans-serif; font-weight: 900;
      font-size: clamp(48px, 10vw, 88px); line-height: 0.95;
      letter-spacing: -0.02em; text-transform: uppercase; margin-bottom: 24px;
    }
    h1 em { color: var(--orange); font-style: normal; }
    h1 .outline { -webkit-text-stroke: 2px var(--white); color: transparent; }
    .hero-sub { font-size: clamp(16px, 2.5vw, 20px); color: #A0A0A0; line-height: 1.6; max-width: 520px; margin-bottom: 40px; }
    .hero-sub strong { color: var(--white); }
    .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-primary {
      background: var(--orange); color: #fff;
      font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 18px;
      letter-spacing: 0.06em; text-transform: uppercase; padding: 16px 32px;
      border-radius: 8px; text-decoration: none; border: none; cursor: pointer;
      transition: all 0.15s; display: inline-block;
    }
    .btn-primary:hover { background: var(--orange-light); transform: translateY(-1px); }
    .btn-secondary {
      background: transparent; color: var(--white);
      font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 18px;
      letter-spacing: 0.06em; text-transform: uppercase; padding: 16px 32px;
      border-radius: 8px; text-decoration: none; border: 1.5px solid #333; cursor: pointer;
      transition: all 0.15s; display: inline-block;
    }
    .btn-secondary:hover { border-color: #555; }
    .hero-proof { margin-top: 48px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .proof-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); }
    .proof-item::before { content: "✓"; color: var(--orange); font-weight: 700; }
    .proof-divider { width: 1px; height: 16px; background: #333; }

    .ticker { background: var(--orange); padding: 12px 0; overflow: hidden; white-space: nowrap; }
    .ticker-inner { display: inline-flex; animation: ticker 22s linear infinite; }
    .ticker-item { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 15px; letter-spacing: 0.08em; text-transform: uppercase; color: #fff; padding: 0 32px; }
    .ticker-dot { color: rgba(255,255,255,0.5); }
    @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }

    section { padding: 80px 24px; }
    .container { max-width: 960px; margin: 0 auto; }
    .section-label { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--orange); margin-bottom: 16px; }
    h2 { font-family: 'Barlow Condensed', sans-serif; font-weight: 900; font-size: clamp(36px, 6vw, 60px); line-height: 1; letter-spacing: -0.02em; text-transform: uppercase; margin-bottom: 20px; }
    h2 em { color: var(--orange); font-style: normal; }
    .section-sub { font-size: 17px; color: var(--muted); line-height: 1.6; max-width: 520px; margin-bottom: 48px; }

    .problem { background: var(--dark2); }
    .problem-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1px; background: #2A2A2A; border: 1px solid #2A2A2A; border-radius: 12px; overflow: hidden; margin-top: 48px; }
    .problem-item { background: var(--dark2); padding: 28px 24px; }
    .problem-icon { font-size: 28px; margin-bottom: 12px; }
    .problem-title { font-weight: 600; font-size: 15px; margin-bottom: 6px; }
    .problem-desc { font-size: 13px; color: var(--muted); line-height: 1.5; }

    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 16px; }
    .feature-card { background: var(--dark2); border: 1px solid #2A2A2A; border-radius: 12px; padding: 28px 24px; transition: border-color 0.2s; }
    .feature-card:hover { border-color: var(--orange); }
    .feature-num { font-family: 'Barlow Condensed', sans-serif; font-weight: 900; font-size: 48px; color: #2A2A2A; line-height: 1; margin-bottom: 12px; }
    .feature-title { font-weight: 700; font-size: 17px; margin-bottom: 8px; }
    .feature-desc { font-size: 14px; color: var(--muted); line-height: 1.6; }
    .feature-tag { display: inline-block; margin-top: 12px; background: #E8440A15; color: var(--orange); font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; }

    .how { background: var(--dark2); }
    .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0; margin-top: 48px; }
    .step { padding: 32px 24px; text-align: center; }
    .step-num { width: 52px; height: 52px; border-radius: 50%; background: var(--orange); color: #fff; font-family: 'Barlow Condensed', sans-serif; font-weight: 900; font-size: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
    .step-title { font-weight: 700; font-size: 16px; margin-bottom: 8px; }
    .step-desc { font-size: 13px; color: var(--muted); line-height: 1.5; }

    .who-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-top: 40px; }
    .who-card { background: var(--dark2); border: 1px solid #2A2A2A; border-radius: 10px; padding: 20px 16px; text-align: center; }
    .who-icon { font-size: 32px; margin-bottom: 10px; }
    .who-name { font-weight: 700; font-size: 14px; }

    .compare-table { width: 100%; border-collapse: collapse; margin-top: 40px; }
    .compare-table th { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 16px; letter-spacing: 0.06em; text-transform: uppercase; padding: 16px 20px; text-align: left; background: var(--dark3); border-bottom: 2px solid #333; }
    .compare-table th.hl { color: var(--orange); background: #E8440A12; }
    .compare-table td { padding: 14px 20px; font-size: 14px; border-bottom: 1px solid #1E1E1E; }
    .compare-table td.hl { background: #E8440A08; }
    .compare-table tr:last-child td { border-bottom: none; }
    .check { color: var(--orange); font-weight: 700; }
    .cross { color: #444; }

    .faq-list { margin-top: 40px; display: flex; flex-direction: column; gap: 2px; }
    .faq-item { background: var(--dark2); border: 1px solid #222; border-radius: 10px; overflow: hidden; }
    .faq-q { width: 100%; text-align: left; background: none; border: none; color: var(--white); font-family: 'Barlow', sans-serif; font-weight: 600; font-size: 15px; padding: 20px 24px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
    .faq-q::after { content: "+"; color: var(--orange); font-size: 22px; }
    .faq-q.open::after { content: "−"; }
    .faq-a { display: none; padding: 0 24px 20px; font-size: 14px; color: var(--muted); line-height: 1.7; }
    .faq-a.open { display: block; }

    .cta-banner { background: var(--orange); padding: 64px 24px; text-align: center; }
    .cta-banner h2 { color: #fff; }
    .cta-banner p { color: rgba(255,255,255,0.8); font-size: 18px; margin: 12px 0 32px; }
    .btn-white { background: #fff; color: var(--orange); font-family: 'Barlow Condensed', sans-serif; font-weight: 900; font-size: 20px; letter-spacing: 0.06em; text-transform: uppercase; padding: 18px 40px; border-radius: 8px; text-decoration: none; display: inline-block; transition: transform 0.15s; }
    .btn-white:hover { transform: translateY(-2px); }
    .cta-small { color: rgba(255,255,255,0.6); font-size: 13px; margin-top: 16px; }

    footer { background: var(--dark); border-top: 1px solid #1E1E1E; padding: 32px 24px; text-align: center; font-size: 13px; color: #555; }
    footer strong { color: #777; }

    @media(max-width:600px) {
      .hero { padding: 100px 20px 60px; }
      section { padding: 60px 20px; }
      .steps { grid-template-columns: 1fr; }
      .compare-table { font-size: 12px; }
      .compare-table th, .compare-table td { padding: 10px 12px; }
    }
  </style>
</head>
<body>

<nav>
  <div class="nav-logo">Trade<span>Quote</span></div>
  <a href="YOUR_VERCEL_URL_HERE" class="nav-cta">Try it free →</a>
</nav>

<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-grid"></div>
  <div class="hero-content">
    <div class="hero-eyebrow">Built for HVAC contractors</div>
    <h1>Stop <em>losing jobs</em><br>to slow <span class="outline">quotes</span></h1>
    <p class="hero-sub"><strong>TradeQuote</strong> is a free quote and invoice generator built specifically for HVAC techs. Tap a template, add your client, send a professional PDF — in under 30 seconds. No sign up. No ads.</p>
    <div class="hero-actions">
      <a href="YOUR_VERCEL_URL_HERE" class="btn-primary">Create your first quote →</a>
      <a href="#how" class="btn-secondary">See how it works</a>
    </div>
    <div class="hero-proof">
      <span class="proof-item">100% free</span>
      <div class="proof-divider"></div>
      <span class="proof-item">No account needed</span>
      <div class="proof-divider"></div>
      <span class="proof-item">Works on your phone</span>
      <div class="proof-divider"></div>
      <span class="proof-item">PDF in one tap</span>
    </div>
  </div>
</section>

<div class="ticker">
  <div class="ticker-inner">
    <span class="ticker-item">AC Install Quotes <span class="ticker-dot">●</span></span>
    <span class="ticker-item">Furnace Replacement <span class="ticker-dot">●</span></span>
    <span class="ticker-item">Service Contracts <span class="ticker-dot">●</span></span>
    <span class="ticker-item">Parts Markup Calculator <span class="ticker-dot">●</span></span>
    <span class="ticker-item">PDF Invoices <span class="ticker-dot">●</span></span>
    <span class="ticker-item">Saved Clients <span class="ticker-dot">●</span></span>
    <span class="ticker-item">Free Forever <span class="ticker-dot">●</span></span>
    <span class="ticker-item">AC Install Quotes <span class="ticker-dot">●</span></span>
    <span class="ticker-item">Furnace Replacement <span class="ticker-dot">●</span></span>
    <span class="ticker-item">Service Contracts <span class="ticker-dot">●</span></span>
    <span class="ticker-item">Parts Markup Calculator <span class="ticker-dot">●</span></span>
    <span class="ticker-item">PDF Invoices <span class="ticker-dot">●</span></span>
    <span class="ticker-item">Saved Clients <span class="ticker-dot">●</span></span>
    <span class="ticker-item">Free Forever <span class="ticker-dot">●</span></span>
  </div>
</div>

<section class="problem">
  <div class="container">
    <div class="section-label">The problem</div>
    <h2>Every HVAC tech <em>feels</em> this</h2>
    <p class="section-sub">Generic apps weren't built for HVAC. You waste time on things that should take seconds.</p>
    <div class="problem-grid">
      <div class="problem-item"><div class="problem-icon">📝</div><div class="problem-title">Hand-writing estimates on the job</div><div class="problem-desc">Scribbled on paper or texted from notes. Looks unprofessional. Clients don't trust it.</div></div>
      <div class="problem-item"><div class="problem-icon">🐌</div><div class="problem-title">Losing jobs to faster quotes</div><div class="problem-desc">The contractor who sends a clean PDF in 10 minutes wins the job. Slow quotes cost you money.</div></div>
      <div class="problem-item"><div class="problem-icon">🧮</div><div class="problem-title">Guessing your parts markup</div><div class="problem-desc">Mental math on materials means you leave money on the table or overprice and lose the job.</div></div>
      <div class="problem-item"><div class="problem-icon">📄</div><div class="problem-title">No service contract system</div><div class="problem-desc">Maintenance agreements saved nowhere, impossible to track. Recurring revenue slips away.</div></div>
    </div>
  </div>
</section>

<section>
  <div class="container">
    <div class="section-label">What you get</div>
    <h2>Built for <em>HVAC</em>, not everyone</h2>
    <p class="section-sub">Every feature exists because an HVAC tech needs it.</p>
    <div class="features-grid">
      <div class="feature-card"><div class="feature-num">01</div><div class="feature-title">HVAC Quick-Fill Templates</div><div class="feature-desc">Tap AC Install, Furnace Replace, Service Call, or Annual Tune-Up — line items fill in instantly with standard rates.</div><span class="feature-tag">Saves 5 min per quote</span></div>
      <div class="feature-card"><div class="feature-num">02</div><div class="feature-title">Parts Markup Calculator</div><div class="feature-desc">Enter your cost price, set your markup %, sell price calculates automatically. See exact parts margin on every job.</div><span class="feature-tag">Never underprice parts again</span></div>
      <div class="feature-card"><div class="feature-num">03</div><div class="feature-title">Service Contracts</div><div class="feature-desc">Create annual maintenance agreements with equipment list, service checklist, and signature lines.</div><span class="feature-tag">Recurring revenue</span></div>
      <div class="feature-card"><div class="feature-num">04</div><div class="feature-title">One-tap PDF</div><div class="feature-desc">Hit Preview, then Save as PDF. A clean branded document your client will trust — on your phone, on the job site.</div><span class="feature-tag">Looks professional</span></div>
      <div class="feature-card"><div class="feature-num">05</div><div class="feature-title">Saved Clients</div><div class="feature-desc">Every client is remembered. Tap their name and address, email, and job site autofill. Repeat jobs take seconds.</div><span class="feature-tag">Repeat jobs 10x faster</span></div>
      <div class="feature-card"><div class="feature-num">06</div><div class="feature-title">Outstanding Tracker</div><div class="feature-desc">Dashboard shows exactly how much you're owed and how much you've won. Know your numbers at a glance.</div><span class="feature-tag">Always know what you're owed</span></div>
    </div>
  </div>
</section>

<section class="how" id="how">
  <div class="container">
    <div class="section-label">How it works</div>
    <h2>Quote sent in <em>30 seconds</em></h2>
    <div class="steps">
      <div class="step"><div class="step-num">1</div><div class="step-title">Tap a template</div><div class="step-desc">Choose AC Install, Furnace Replace, Service Call, or start blank. Line items fill in instantly.</div></div>
      <div class="step"><div class="step-num">2</div><div class="step-title">Add your client</div><div class="step-desc">Type their name or tap a saved client. Address and email autofill in 5 seconds.</div></div>
      <div class="step"><div class="step-num">3</div><div class="step-title">Set your markup</div><div class="step-desc">Toggle markup mode, enter your cost price, and the sell price calculates with your margin shown.</div></div>
      <div class="step"><div class="step-num">4</div><div class="step-title">Send the PDF</div><div class="step-desc">Tap Preview → Save as PDF. A branded quote lands in your client's inbox before you leave the driveway.</div></div>
    </div>
  </div>
</section>

<section>
  <div class="container">
    <div class="section-label">Who uses it</div>
    <h2>Any HVAC business, <em>any size</em></h2>
    <div class="who-grid">
      <div class="who-card"><div class="who-icon">🧑‍🔧</div><div class="who-name">Solo techs</div></div>
      <div class="who-card"><div class="who-icon">🏢</div><div class="who-name">Small contractors</div></div>
      <div class="who-card"><div class="who-icon">🏠</div><div class="who-name">Residential HVAC</div></div>
      <div class="who-card"><div class="who-icon">🏭</div><div class="who-name">Commercial HVAC</div></div>
      <div class="who-card"><div class="who-icon">🔁</div><div class="who-name">Maintenance contracts</div></div>
      <div class="who-card"><div class="who-icon">🚐</div><div class="who-name">Mobile service vans</div></div>
    </div>
  </div>
</section>

<section style="background:var(--dark2)">
  <div class="container">
    <div class="section-label">Comparison</div>
    <h2>Why not just use <em>Excel?</em></h2>
    <div style="overflow-x:auto">
      <table class="compare-table">
        <thead>
          <tr>
            <th>Feature</th>
            <th class="hl">TradeQuote ✦</th>
            <th>Excel / Word</th>
            <th>Generic invoice apps</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Works on your phone</td><td class="hl"><span class="check">✓</span></td><td><span class="cross">✗</span></td><td><span class="check">✓</span></td></tr>
          <tr><td>HVAC job templates</td><td class="hl"><span class="check">✓</span></td><td><span class="cross">✗</span></td><td><span class="cross">✗</span></td></tr>
          <tr><td>Parts markup calculator</td><td class="hl"><span class="check">✓</span></td><td><span class="cross">✗</span></td><td><span class="cross">✗</span></td></tr>
          <tr><td>Service contract builder</td><td class="hl"><span class="check">✓</span></td><td><span class="cross">✗</span></td><td><span class="cross">✗</span></td></tr>
          <tr><td>One-tap PDF</td><td class="hl"><span class="check">✓</span></td><td><span class="cross">✗</span></td><td><span class="check">✓</span></td></tr>
          <tr><td>Free forever</td><td class="hl"><span class="check">✓</span></td><td><span class="check">✓</span></td><td><span class="cross">✗</span></td></tr>
          <tr><td>No account needed</td><td class="hl"><span class="check">✓</span></td><td><span class="check">✓</span></td><td><span class="cross">✗</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

<section>
  <div class="container">
    <div class="section-label">FAQ</div>
    <h2>Questions <em>answered</em></h2>
    <div class="faq-list">
      <div class="faq-item"><button class="faq-q" onclick="toggleFaq(this)">Is it really free?</button><div class="faq-a">Yes, completely free. No credit card, no trial, no ads. Unlimited quotes and invoices at no cost.</div></div>
      <div class="faq-item"><button class="faq-q" onclick="toggleFaq(this)">Do I need to create an account?</button><div class="faq-a">No account needed. Enter your business details once and start quoting. Data saves automatically in your browser.</div></div>
      <div class="faq-item"><button class="faq-q" onclick="toggleFaq(this)">Does it work on iPhone / Android?</button><div class="faq-a">Yes. It works in any mobile browser — Safari, Chrome, Firefox. No app store download needed.</div></div>
      <div class="faq-item"><button class="faq-q" onclick="toggleFaq(this)">Where does my data go?</button><div class="faq-a">Your data stays on your device in your browser. Nothing is sent to a server. Your client info and quotes are private.</div></div>
      <div class="faq-item"><button class="faq-q" onclick="toggleFaq(this)">How do I send the quote to my client?</button><div class="faq-a">Tap Preview, then Save as PDF in your browser's print dialog. Email, text, or share it however you normally would.</div></div>
    </div>
  </div>
</section>

<div class="cta-banner">
  <div class="container">
    <h2 style="color:#fff">Your next quote takes 30 seconds</h2>
    <p>Free. No account. Works on your phone right now.</p>
    <a href="YOUR_VERCEL_URL_HERE" class="btn-white">Create a free quote →</a>
    <p class="cta-small">No sign up · No credit card · No ads</p>
  </div>
</div>

<footer>
  <strong>TradeQuote</strong> — Free HVAC Quote &amp; Invoice Generator · Built for HVAC contractors · Free forever
</footer>

<script>
  function toggleFaq(btn) {
    const a = btn.nextElementSibling, open = btn.classList.contains('open');
    document.querySelectorAll('.faq-q').forEach(b => { b.classList.remove('open'); b.nextElementSibling.classList.remove('open'); });
    if (!open) { btn.classList.add('open'); a.classList.add('open'); }
  }
</script>
</body>
</html>
  )
}
