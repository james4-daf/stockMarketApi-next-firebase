import Link from 'next/link';
import { FAQ_ITEMS } from './data';
import {
  ArrowRight,
  DocIcon,
  LogoMark,
  PlusIcon,
  SearchIcon,
} from './icons';
import { TapeTrack } from './TapeTrack';

const LOGIN = '/login';

function Logo({ size = 17 }: { size?: number }) {
  return (
    <span className="logo" style={size !== 17 ? { fontSize: size } : undefined}>
      TIKR <LogoMark />
    </span>
  );
}

function PeekTableRow({
  sym,
  name,
  price,
  chg,
  pos,
  rangeLow,
  rangeHigh,
  fillWidth,
  markerLeft,
  cap,
}: {
  sym: string;
  name: string;
  price: string;
  chg: string;
  pos: boolean;
  rangeLow: string;
  rangeHigh: string;
  fillWidth: string;
  markerLeft: string;
  cap: string;
}) {
  return (
    <tr>
      <td>
        <div className="peek-sym">{sym}</div>
        <div className="peek-name">{name}</div>
      </td>
      <td className="right mono">{price}</td>
      <td className={`right mono ${pos ? 'pos' : 'neg'}`}>{chg}</td>
      <td>
        <div className="range-labels">
          <span className="mono">{rangeLow}</span>
          <span className="mono">{rangeHigh}</span>
        </div>
        <div className="range-bar">
          <div className="fill" style={{ width: fillWidth }} />
          <div className="marker" style={{ left: markerLeft }} />
        </div>
      </td>
      <td className="right mono" style={{ color: 'var(--fg-muted)' }}>
        {cap}
      </td>
    </tr>
  );
}

export default function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="nav">
        <Link href="/" className="logo">
          <span>TIKR</span>
          <LogoMark />
        </Link>
        <div className="nav-links">
          <a href="#product">Product</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
          <a href="#changelog">Changelog</a>
        </div>
        <div className="nav-right">
          <Link className="btn-text" href={LOGIN}>
            Sign in
          </Link>
          <Link className="btn primary" href={LOGIN}>
            Get started <ArrowRight />
          </Link>
        </div>
      </nav>

      <header className="hero">
        <div className="container">
          <div className="eyebrow">
            <span className="new-chip">New</span> AI summaries on every 10-Q ·
            Q2 2026
          </div>
          <h1 className="hero-title">
            Watch the stocks. Read the <em>filings</em>. Take the notes.
          </h1>
          <p className="hero-lead">
            TIKR check is a calmer way to follow a watchlist — every chart,
            earnings table, SEC filing and journal entry on one quiet page. No
            popups. No noise. No infinite scroll of takes.
          </p>
          <div className="hero-ctas">
            <Link className="btn primary lg" href={LOGIN}>
              Start tracking — it&apos;s free
            </Link>
            <a className="btn lg" href="#product">
              See the product →
            </a>
          </div>
          <div className="hero-meta">
            <span>
              <span className="check">✓</span> Free forever for 25 tickers
            </span>
            <span>
              <span className="check">✓</span> No card required
            </span>
            <span>
              <span className="check">✓</span> EDGAR data, refreshed hourly
            </span>
          </div>
        </div>
        <TapeTrack />
      </header>

      <section className="peek-section" id="product" style={{ borderTop: 'none' }}>
        <div className="container wide">
          <div className="peek-window">
            <div className="peek-chrome">
              <div className="peek-dots">
                <span />
                <span />
                <span />
              </div>
              <div className="peek-url">
                <span className="lock">●</span> www.tikrcheck.com/watchlist
              </div>
              <div style={{ width: 50 }} />
            </div>
            <div className="peek-app">
              <div className="peek-nav">
                <Logo />
                <div className="links">
                  <a>Home</a>
                  <a className="active">Watchlist</a>
                  <a>Notes</a>
                </div>
                <div className="search">
                  <SearchIcon />
                  Search ticker ⌘K
                </div>
                <span className="pill">
                  <span className="dot" />
                  Market closed
                </span>
                <span className="avatar">A</span>
              </div>
              <div className="peek-body">
                <div className="peek-h1">Watchlist</div>
                <div className="peek-sub">8 symbols · Updated 14:23 EDT</div>
                <div className="peek-indices">
                  <div className="peek-idx">
                    <div className="peek-idx-lbl">S&P 500</div>
                    <div className="peek-idx-val mono">5,847.21</div>
                    <div className="peek-idx-chg pos">+0.42%</div>
                  </div>
                  <div className="peek-idx">
                    <div className="peek-idx-lbl">Nasdaq</div>
                    <div className="peek-idx-val mono">18,624.30</div>
                    <div className="peek-idx-chg pos">+0.61%</div>
                  </div>
                  <div className="peek-idx">
                    <div className="peek-idx-lbl">Dow</div>
                    <div className="peek-idx-val mono">42,114.85</div>
                    <div className="peek-idx-chg neg">−0.08%</div>
                  </div>
                  <div className="peek-idx">
                    <div className="peek-idx-lbl">VIX</div>
                    <div className="peek-idx-val mono">14.22</div>
                    <div className="peek-idx-chg neg">−2.14%</div>
                  </div>
                </div>
                <div className="peek-tabs">
                  <button type="button" className="active">
                    Core <span className="count">8</span>
                  </button>
                  <button type="button">
                    AI &amp; Semis <span className="count">5</span>
                  </button>
                  <button type="button">
                    Financials <span className="count">4</span>
                  </button>
                  <button type="button">
                    Speculative <span className="count">3</span>
                  </button>
                  <button type="button" style={{ color: 'var(--fg-faint)' }}>
                    + New list
                  </button>
                </div>
                <table className="peek-table">
                  <thead>
                    <tr>
                      <th>Ticker</th>
                      <th className="right">Price</th>
                      <th className="right">Day %</th>
                      <th style={{ width: 200 }}>52-week range</th>
                      <th className="right">Cap</th>
                    </tr>
                  </thead>
                  <tbody>
                    <PeekTableRow
                      sym="AMD"
                      name="Advanced Micro Devices"
                      price="$467.51"
                      chg="+3.99%"
                      pos
                      rangeLow="108.62"
                      rangeHigh="481.41"
                      fillWidth="96%"
                      markerLeft="96%"
                      cap="762.3B"
                    />
                    <PeekTableRow
                      sym="META"
                      name="Meta Platforms, Inc."
                      price="$610.26"
                      chg="+0.47%"
                      pos
                      rangeLow="520.26"
                      rangeHigh="796.25"
                      fillWidth="33%"
                      markerLeft="33%"
                      cap="1.55T"
                    />
                    <PeekTableRow
                      sym="MSCI"
                      name="MSCI Inc."
                      price="$588.55"
                      chg="+1.07%"
                      pos
                      rangeLow="501.08"
                      rangeHigh="626.28"
                      fillWidth="70%"
                      markerLeft="70%"
                      cap="46.1B"
                    />
                    <PeekTableRow
                      sym="MSFT"
                      name="Microsoft Corp."
                      price="$418.57"
                      chg="−0.12%"
                      pos={false}
                      rangeLow="356.28"
                      rangeHigh="555.45"
                      fillWidth="31%"
                      markerLeft="31%"
                      cap="3.11T"
                    />
                    <PeekTableRow
                      sym="COIN"
                      name="Coinbase Global, Inc."
                      price="$184.99"
                      chg="−4.43%"
                      pos={false}
                      rangeLow="139.36"
                      rangeHigh="444.65"
                      fillWidth="15%"
                      markerLeft="15%"
                      cap="47.2B"
                    />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">What&apos;s in the app</div>
            <h2 className="section-title">
              Three quiet tools, working <em>together</em>.
            </h2>
            <p className="section-lead">
              Most stock apps are designed to make you trade. TIKR check is
              designed to make you wait. The features compose into a single calm
              view of your conviction list.
            </p>
          </div>
          <div className="features">
            <div className="feature">
              <div className="feature-num">/ 01 — Watchlist</div>
              <h3>Quiet by default.</h3>
              <p>
                Group your tickers, sort by anything, scan 52-week ranges at a
                glance. No flashing colours, no doom scroll. Just the numbers
                that matter.
              </p>
              <div className="visual">
                <div className="label">Day % · sorted desc</div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '42px 1fr 70px',
                    gap: 4,
                    fontSize: 11,
                  }}
                >
                  <span className="mono" style={{ fontWeight: 600 }}>
                    AMD
                  </span>
                  <span className="mono" style={{ color: 'var(--fg-faint)' }}>
                    $467.51
                  </span>
                  <span className="mono pos right">+3.99%</span>
                  <span className="mono" style={{ fontWeight: 600 }}>
                    NVO
                  </span>
                  <span className="mono" style={{ color: 'var(--fg-faint)' }}>
                    $44.96
                  </span>
                  <span className="mono pos right">+1.28%</span>
                  <span className="mono" style={{ fontWeight: 600 }}>
                    MSCI
                  </span>
                  <span className="mono" style={{ color: 'var(--fg-faint)' }}>
                    $588.55
                  </span>
                  <span className="mono pos right">+1.07%</span>
                  <span className="mono" style={{ fontWeight: 600 }}>
                    META
                  </span>
                  <span className="mono" style={{ color: 'var(--fg-faint)' }}>
                    $610.26
                  </span>
                  <span className="mono pos right">+0.47%</span>
                  <span className="mono" style={{ fontWeight: 600 }}>
                    OZK
                  </span>
                  <span className="mono" style={{ color: 'var(--fg-faint)' }}>
                    $48.14
                  </span>
                  <span className="mono neg right">−0.06%</span>
                  <span className="mono" style={{ fontWeight: 600 }}>
                    MSFT
                  </span>
                  <span className="mono" style={{ color: 'var(--fg-faint)' }}>
                    $418.57
                  </span>
                  <span className="mono neg right">−0.12%</span>
                  <span className="mono" style={{ fontWeight: 600 }}>
                    COIN
                  </span>
                  <span className="mono" style={{ color: 'var(--fg-faint)' }}>
                    $184.99
                  </span>
                  <span className="mono neg right">−4.43%</span>
                </div>
              </div>
            </div>
            <div className="feature">
              <div className="feature-num">/ 02 — Filings</div>
              <h3>The filings, not the takes.</h3>
              <p>
                Every 10-Q, 10-K and 8-K, fetched directly from EDGAR the moment
                it&apos;s filed. One click opens the document — and your notes
                for that quarter.
              </p>
              <div className="visual">
                <div className="label">AMD · 2026 filings</div>
                <div className="doc-line">
                  <span className="ic">
                    <DocIcon />
                  </span>
                  <span className="name">2026-05-06 · Q1 report</span>
                  <span className="kind">10-Q</span>
                </div>
                <div className="doc-line">
                  <span className="ic">
                    <DocIcon />
                  </span>
                  <span className="name">2026-02-04 · FY 2025 results</span>
                  <span className="kind">10-K</span>
                </div>
                <div className="doc-line">
                  <span className="ic">
                    <DocIcon />
                  </span>
                  <span className="name">2025-11-05 · Q3 report</span>
                  <span className="kind">10-Q</span>
                </div>
                <div className="doc-line">
                  <span className="ic">
                    <DocIcon />
                  </span>
                  <span className="name">2025-08-05 · Q2 report</span>
                  <span className="kind">10-Q</span>
                </div>
              </div>
            </div>
            <div className="feature">
              <div className="feature-num">/ 03 — Notes</div>
              <h3>An investment journal.</h3>
              <p>
                Pin a thesis to a ticker. Add a paragraph after every earnings
                call. Look back six quarters later and see whether you were
                right.
              </p>
              <div className="visual">
                <div className="label">AMD notes · 3</div>
                <div className="note-line">
                  <span className="d">2026-05-06</span>
                  Q1 &apos;26: data-center +47% YoY, MI300 demand strong. Watch
                  gross margin for H2.
                </div>
                <div className="note-line">
                  <span className="d">2026-02-04</span>
                  10-K confirms $2B AI capex. Inventory at 92 days — keep eye on.
                </div>
                <div className="note-line">
                  <span className="d">2025-11-05</span>
                  Mgmt guided FY26 rev to $28-32B. Conservative vs. street.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="row-split">
            <div className="row-text">
              <div className="section-eyebrow">New · Q2 2026</div>
              <h2>
                The 80-page 10-K, in <em>five sentences</em>.
              </h2>
              <p>
                Every quarterly and annual filing gets an AI summary that
                highlights what changed since the last filing — guidance,
                margin, capex, segment splits — alongside its source paragraph so
                you can verify before you trust.
              </p>
              <ul className="row-bullets">
                <li>
                  <span className="bul-mark">●</span>
                  <div>
                    <strong>Change-aware.</strong>
                    <span className="desc">
                      Summaries diff against the previous filing, so you see
                      what&apos;s new — not what you already read.
                    </span>
                  </div>
                </li>
                <li>
                  <span className="bul-mark">●</span>
                  <div>
                    <strong>Source-linked.</strong>
                    <span className="desc">
                      Every sentence points back to the paragraph in the SEC
                      document it came from.
                    </span>
                  </div>
                </li>
                <li>
                  <span className="bul-mark">●</span>
                  <div>
                    <strong>Saved as a note.</strong>
                    <span className="desc">
                      One-click moves the summary into your journal for the
                      ticker.
                    </span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="row-visual">
              <div className="head">
                <div>
                  <div className="ttl">AMD · 10-Q · 2026-05-06</div>
                  <div className="sub">Generated 14m ago · sources verified</div>
                </div>
                <span className="mono" style={{ fontSize: 11, color: 'var(--purple-deep)' }}>
                  AI
                </span>
              </div>
              <div className="ai-vis">
                <span className="badge">✦ AI summary</span>
                <p>
                  Data-center revenue grew 47% YoY in Q1 &apos;26, with MI300 the
                  named driver; client compute was flat.{' '}
                  <strong>Gross margin expanded 280bps to 53.8%</strong>, beating
                  prior guide of 52.5%. Management raised FY26 revenue range to{' '}
                  <strong>$28–32B</strong> from $26–30B, and re-affirmed $2B AI
                  capex through year-end.
                </p>
                <p>
                  Inventory days fell to 92 from 108 last quarter — first
                  sequential drop in four prints. Operating expenses up 11%,
                  mostly R&amp;D for MI400.
                </p>
                <div className="meta-pills">
                  <span className="pill">
                    Source: <strong>10-Q · p. 12</strong>
                  </span>
                  <span className="pill">
                    Diff vs <strong>2026-02-04</strong>
                  </span>
                  <span className="pill">
                    Read time <strong>~38s</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="row-split flip">
            <div className="row-text">
              <div className="section-eyebrow">Insider transactions</div>
              <h2>
                Watch <em>who&apos;s selling</em>, not just what&apos;s moving.
              </h2>
              <p>
                Form 4 filings, surfaced the moment they&apos;re filed, ranked by
                size and role. The CFO buying and the CEO selling are not the same
                signal — TIKR check tells the difference.
              </p>
              <ul className="row-bullets">
                <li>
                  <span className="bul-mark">●</span>
                  <div>
                    <strong>Role-aware ranking.</strong>
                    <span className="desc">
                      C-suite filings float to the top; planned 10b5-1 trades are
                      clearly marked.
                    </span>
                  </div>
                </li>
                <li>
                  <span className="bul-mark">●</span>
                  <div>
                    <strong>Alert on size.</strong>
                    <span className="desc">
                      Set a per-ticker dollar threshold and only hear about it
                      when it matters.
                    </span>
                  </div>
                </li>
                <li>
                  <span className="bul-mark">●</span>
                  <div>
                    <strong>90-day rolling view.</strong>
                    <span className="desc">
                      Net buys vs sells across the whole exec team, at a glance.
                    </span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="row-visual">
              <div className="head">
                <div>
                  <div className="ttl">AMD · Form 4 filings</div>
                  <div className="sub">Last 90 days · 5 transactions</div>
                </div>
                <span className="mono" style={{ fontSize: 11, color: 'var(--neg)' }}>
                  Net −$19.3M
                </span>
              </div>
              <div className="insider-vis">
                <div className="insider-row">
                  <div>
                    <div className="who">Forrest E. Norrod</div>
                    <div className="role">EVP, Data Center · 2026-05-12</div>
                  </div>
                  <span className="insider-kind sell" style={{ marginLeft: 'auto' }}>
                    Sell
                  </span>
                  <span className="mono" style={{ fontSize: 12, width: 60, textAlign: 'right' }}>
                    22,500
                  </span>
                  <span
                    className="mono"
                    style={{ fontSize: 12, color: 'var(--fg-muted)', width: 60, textAlign: 'right' }}
                  >
                    $10.5M
                  </span>
                </div>
                <div className="insider-row">
                  <div>
                    <div className="who">Jean Hu</div>
                    <div className="role">CFO · 2026-05-09</div>
                  </div>
                  <span className="insider-kind sell" style={{ marginLeft: 'auto' }}>
                    Sell
                  </span>
                  <span className="mono" style={{ fontSize: 12, width: 60, textAlign: 'right' }}>
                    8,200
                  </span>
                  <span
                    className="mono"
                    style={{ fontSize: 12, color: 'var(--fg-muted)', width: 60, textAlign: 'right' }}
                  >
                    $3.84M
                  </span>
                </div>
                <div className="insider-row">
                  <div>
                    <div className="who">Mark D. Papermaster</div>
                    <div className="role">CTO · 2026-03-21</div>
                  </div>
                  <span className="insider-kind sell" style={{ marginLeft: 'auto' }}>
                    Sell
                  </span>
                  <span className="mono" style={{ fontSize: 12, width: 60, textAlign: 'right' }}>
                    12,000
                  </span>
                  <span
                    className="mono"
                    style={{ fontSize: 12, color: 'var(--fg-muted)', width: 60, textAlign: 'right' }}
                  >
                    $4.96M
                  </span>
                </div>
                <div className="insider-row">
                  <div>
                    <div className="who">Lisa T. Su</div>
                    <div className="role">CEO · 2026-02-27</div>
                  </div>
                  <span className="insider-kind option" style={{ marginLeft: 'auto' }}>
                    Option
                  </span>
                  <span className="mono" style={{ fontSize: 12, width: 60, textAlign: 'right' }}>
                    50,000
                  </span>
                  <span
                    className="mono"
                    style={{ fontSize: 12, color: 'var(--fg-muted)', width: 60, textAlign: 'right' }}
                  >
                    —
                  </span>
                </div>
                <div className="insider-row">
                  <div>
                    <div className="who">Phil Davis</div>
                    <div className="role">Dir. · 2026-02-04</div>
                  </div>
                  <span className="insider-kind buy" style={{ marginLeft: 'auto' }}>
                    Buy
                  </span>
                  <span className="mono" style={{ fontSize: 12, width: 60, textAlign: 'right' }}>
                    1,500
                  </span>
                  <span
                    className="mono"
                    style={{ fontSize: 12, color: 'var(--fg-muted)', width: 60, textAlign: 'right' }}
                  >
                    $0.62M
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div className="container">
          <div className="stats-strip-inner">
            <div className="stat-item">
              <div className="stat-num">
                <span className="sym">12,400</span>
              </div>
              <div className="stat-cap">
                Public companies covered across US, EU and UK exchanges.
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-num">
                <span className="sym">~38s</span>
              </div>
              <div className="stat-cap">
                Average read time on an AI-summarised 10-Q. Down from ~22 minutes.
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-num">
                <span className="sym">0</span>
              </div>
              <div className="stat-cap">
                Push notifications, by default. We don&apos;t think you need them.
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-num">
                <span className="sym">$0</span>
              </div>
              <div className="stat-cap">
                To get started. Free forever for up to 25 tickers and unlimited
                notes.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing">
        <div className="container narrow">
          <div
            className="section-header"
            style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}
          >
            <div className="section-eyebrow">Pricing</div>
            <h2 className="section-title">
              Free for a starter portfolio. <em>Pro</em> when you grow into it.
            </h2>
            <p className="section-lead">
              No trial, no countdown. Pay yearly to save 20%; cancel any time.
            </p>
          </div>
          <div className="toggle-row" id="pricing-toggle">
            <span className="t-label active" data-bill="monthly">
              Monthly
            </span>
            <span className="switch" id="bill-switch" role="button" tabIndex={0} aria-label="Toggle yearly billing" />
            <span className="t-label" data-bill="yearly">
              Yearly
            </span>
            <span className="save">Save 20%</span>
          </div>
          <div className="pricing">
            <div className="plan">
              <h3>Free</h3>
              <p className="desc">Everything you need to follow a starter watchlist.</p>
              <div className="price-row">
                <span className="price">$0</span>
                <span className="per">/ month, forever</span>
              </div>
              <ul>
                <li>
                  <span className="ck">✓</span> Up to 25 tickers across 3 lists
                </li>
                <li>
                  <span className="ck">✓</span> Daily-close price &amp; 52-week ranges
                </li>
                <li>
                  <span className="ck">✓</span> Last 4 quarters of filings
                </li>
                <li>
                  <span className="ck">✓</span> Unlimited notes &amp; journal
                </li>
                <li>
                  <span className="ck">✓</span> Email digest, weekly
                </li>
              </ul>
              <Link className="btn" href={LOGIN} style={{ width: '100%', justifyContent: 'center' }}>
                Start free
              </Link>
            </div>
            <div className="plan">
              <span className="tag">Pro</span>
              <h3>For the serious watcher</h3>
              <p className="desc">
                Everything in Free, plus the things that took us a year to build.
              </p>
              <div className="price-row">
                <span className="price" data-monthly="$12" data-yearly="$9" id="pro-price">
                  $12
                </span>
                <span className="per">/ month, per seat</span>
              </div>
              <ul>
                <li>
                  <span className="ck">✓</span> Unlimited tickers and watchlists
                </li>
                <li>
                  <span className="ck">✓</span> Real-time pricing &amp; intraday charts
                </li>
                <li>
                  <span className="ck">✓</span> AI summaries on every filing
                </li>
                <li>
                  <span className="ck">✓</span> Insider transaction alerts
                </li>
                <li>
                  <span className="ck">✓</span> Full filing history back to 2001
                </li>
                <li>
                  <span className="ck">✓</span> Export notes to PDF / Markdown
                </li>
              </ul>
              <Link className="btn purple" href={LOGIN} style={{ width: '100%', justifyContent: 'center' }}>
                Start 14-day trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="faq">
        <div className="container narrow">
          <div className="section-header">
            <div className="section-eyebrow">Questions</div>
            <h2 className="section-title">
              Things people ask before they sign up.
            </h2>
          </div>
          <div className="faq-list">
            {FAQ_ITEMS.map((item) => (
              <div key={item.q} className="faq-item">
                <div className="faq-q">{item.q}</div>
                <span className="faq-toggle">
                  <PlusIcon />
                </span>
                <div className="faq-a">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-final">
        <div className="container narrow">
          <h2>
            Make a watchlist. <em>Keep it.</em>
          </h2>
          <p>
            Free forever for 25 tickers. Real data, real filings, real notes —
            without the noise that makes you trade out of a thesis you used to
            believe in.
          </p>
          <div className="btns">
            <Link className="btn primary lg" href={LOGIN}>
              Get started — it&apos;s free
            </Link>
            <a className="btn lg" href="#product">
              See the product →
            </a>
          </div>
          <div className="fine">No card. No countdown. No spam.</div>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="foot-grid">
            <div className="foot-col">
              <Link href="/" className="logo" style={{ fontSize: 18 }}>
                TIKR <LogoMark />
              </Link>
              <p className="foot-blurb">
                A quieter way to follow your conviction list. Made with care from a
                small studio in 2026.
              </p>
            </div>
            <div className="foot-col">
              <h4>Product</h4>
              <a href="#">Watchlist</a>
              <a href="#">Filings</a>
              <a href="#">AI summaries</a>
              <a href="#">Notes</a>
              <a href="#pricing">Pricing</a>
              <a href="#">Changelog</a>
            </div>
            <div className="foot-col">
              <h4>Resources</h4>
              <a href="#">Docs</a>
              <a href="#">API</a>
              <a href="#">Status</a>
              <a href="#">Help</a>
              <a href="#">System</a>
            </div>
            <div className="foot-col">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Contact</a>
              <a href="#">Press</a>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 TIKR check. All rights reserved.</span>
            <span>Data is not investment advice. Don&apos;t trade off vibes.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
