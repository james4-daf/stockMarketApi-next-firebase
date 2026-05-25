export const TAPE_ITEMS = [
  { sym: 'AMD', val: '$467.51', chg: '+3.99%', pos: true },
  { sym: 'NVO', val: '$44.96', chg: '+1.28%', pos: true },
  { sym: 'MSCI', val: '$588.55', chg: '+1.07%', pos: true },
  { sym: 'META', val: '$610.26', chg: '+0.47%', pos: true },
  { sym: 'OZK', val: '$48.14', chg: '−0.06%', pos: false },
  { sym: 'MSFT', val: '$418.57', chg: '−0.12%', pos: false },
  { sym: 'LMND', val: '$56.52', chg: '−0.93%', pos: false },
  { sym: 'COIN', val: '$184.99', chg: '−4.43%', pos: false },
] as const;

export const FAQ_ITEMS = [
  {
    q: 'Where does your price & filing data come from?',
    a: "End-of-day pricing is licensed from IEX Cloud. Intraday and real-time quotes (Pro) are sourced from the listed exchange's official feed. SEC filings are pulled directly from EDGAR within a minute of being filed.",
  },
  {
    q: 'Are the AI summaries trustworthy?',
    a: 'Every sentence in a summary links back to the paragraph in the SEC document it came from — open the source with one click. Treat them as a starting point, not the verdict.',
  },
  {
    q: 'Can I import a watchlist from another app?',
    a: "Yes — paste a comma-separated list of tickers anywhere on the watchlist page and we'll resolve and add them. CSV imports work for portfolios with positions.",
  },
  {
    q: 'Is this a brokerage? Can I trade?',
    a: "No. TIKR check is a research and journaling tool. We don't take orders, hold custody, or earn payment for order flow. The job here is to help you slow down, not speed up.",
  },
  {
    q: 'Do my notes stay private?',
    a: "Yes. Notes are encrypted at rest and only visible to you. They're never used to train models. Export to Markdown or PDF whenever you want them out.",
  },
  {
    q: 'What happens if I cancel Pro?',
    a: 'You drop back to Free at the end of your billing period. Your notes, lists and history stay; you just lose AI summaries, real-time data, and lists past 25 tickers.',
  },
] as const;
