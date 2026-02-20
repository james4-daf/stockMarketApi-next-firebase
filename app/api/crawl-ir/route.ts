import { IRReport, IRCrawlResult } from '@/lib/types';
import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export const dynamic = 'force-dynamic';

// In-memory cache: ticker -> { data, timestamp }
const cache = new Map<string, { data: IRCrawlResult; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const REQUEST_TIMEOUT = 5000; // 5s per request
const MAX_REQUESTS = 25;
let requestCount = 0;

const COMMON_IR_PATHS = [
  '/investors',
  '/investor-relations',
  '/ir',
  '/investors/overview',
  '/investor-relations/overview',
  '/investors/default.aspx',
  '/investor',
  '/shareholders',
];

const IRRELEVANT_KEYWORDS = [
  'privacy',
  'governance',
  'proxy',
  'cookie',
  'terms-of-service',
  'terms-of-use',
  'code-of-conduct',
  'bylaws',
  'charter',
  'committee',
  'board-of-directors',
  'whistleblower',
  'anti-corruption',
  'supplier',
];

async function fetchWithTimeout(
  url: string,
  timeout = REQUEST_TIMEOUT,
): Promise<Response | null> {
  if (requestCount >= MAX_REQUESTS) return null;
  requestCount++;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    clearTimeout(timer);
    return res;
  } catch {
    return null;
  }
}

async function fetchWithBrowser(url: string): Promise<string | null> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    );
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
    const html = await page.content();
    return html;
  } catch (err) {
    console.error('Browser fetch error:', err);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

function extractDomain(website: string): string {
  try {
    const url = new URL(
      website.startsWith('http') ? website : `https://${website}`,
    );
    return url.hostname.replace(/^www\./, '');
  } catch {
    return website;
  }
}

function extractFilename(href: string): string {
  try {
    const pathname = new URL(href, 'https://x.com').pathname;
    return decodeURIComponent(pathname.split('/').pop() || '');
  } catch {
    return href.split('/').pop() || '';
  }
}

function extractYearAndQuarter(
  text: string,
  href: string,
): { year?: number; quarter?: number } {
  const filename = extractFilename(href);
  // Sources to search, in priority order: link text, then filename
  const sources = [text.toLowerCase(), filename.toLowerCase()];

  let quarter: number | undefined;
  let year: number | undefined;

  // 1. Find quarter first (from any source)
  for (const src of [...sources, href.toLowerCase()]) {
    if (quarter) break;
    const qMatch = src.match(/q([1-4])/i);
    if (qMatch) {
      quarter = parseInt(qMatch[1]);
    } else if (src.includes('first quarter')) {
      quarter = 1;
    } else if (src.includes('second quarter')) {
      quarter = 2;
    } else if (src.includes('third quarter')) {
      quarter = 3;
    } else if (src.includes('fourth quarter')) {
      quarter = 4;
    }
  }

  // 2. Try to find year adjacent to quarter indicator (e.g. "Q4-2022", "Q1 2023")
  for (const src of sources) {
    if (year) break;
    const qYearMatch = src.match(/q[1-4][\s\-_.]*(20[12]\d)/i);
    if (qYearMatch) {
      year = parseInt(qYearMatch[1]);
      continue;
    }
    const yearQMatch = src.match(/(20[12]\d)[\s\-_.]*q[1-4]/i);
    if (yearQMatch) {
      year = parseInt(yearQMatch[1]);
    }
  }

  // 3. Fall back to year from link text
  if (!year) {
    const textMatch = text.toLowerCase().match(/20[12]\d/);
    if (textMatch) year = parseInt(textMatch[0]);
  }

  // 4. Fall back to year from filename (NOT the full URL path which has upload dates)
  if (!year) {
    const filenameMatch = filename.toLowerCase().match(/20[12]\d/);
    if (filenameMatch) year = parseInt(filenameMatch[0]);
  }

  return { year, quarter };
}

function classifyReport(
  text: string,
  href: string,
): { type: IRReport['type']; year?: number; quarter?: number } {
  const combined = `${text} ${href}`.toLowerCase();

  const { year, quarter } = extractYearAndQuarter(text, href);

  // Determine type
  let type: IRReport['type'] = 'other';
  if (
    combined.includes('annual') ||
    combined.includes('yearly') ||
    combined.includes('full year') ||
    combined.includes('year-end') ||
    combined.includes('10-k')
  ) {
    type = 'annual';
  } else if (
    quarter ||
    combined.includes('quarterly') ||
    combined.includes('quarter') ||
    combined.includes('10-q')
  ) {
    type = 'quarterly';
  }

  return { type, year, quarter };
}

function isRelevantPdf(text: string, href: string): boolean {
  const combined = `${text} ${href}`.toLowerCase();
  return !IRRELEVANT_KEYWORDS.some((kw) => combined.includes(kw));
}

function isFinancialReport(text: string, href: string): boolean {
  const combined = `${text} ${href}`.toLowerCase();
  const financialKeywords = [
    'annual report',
    'quarterly',
    'quarter',
    'earnings',
    'financial',
    'results',
    'report',
    '10-k',
    '10-q',
    'investor',
    'fiscal',
    'revenue',
    'income',
  ];
  return financialKeywords.some((kw) => combined.includes(kw));
}

const REPORT_SUBPAGE_KEYWORDS = [
  'quarterly-results',
  'quarterly-reports',
  'annual-reports',
  'annual-results',
  'financial-results',
  'financial-reports',
  'sec-filings',
  'earnings',
  'press-releases',
  'reports-and-filings',
  'financial-information',
  'results-reports',
];

function findReportSubPages(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const subPages: string[] = [];
  const seen = new Set<string>();

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().toLowerCase();
    const hrefLower = href.toLowerCase();

    const isReportLink = REPORT_SUBPAGE_KEYWORDS.some(
      (kw) => hrefLower.includes(kw) || text.includes(kw.replace(/-/g, ' ')),
    );

    if (!isReportLink) return;
    // Skip PDF links — we want HTML pages
    if (hrefLower.endsWith('.pdf')) return;

    try {
      const fullUrl = new URL(href, baseUrl).toString();
      if (!seen.has(fullUrl) && fullUrl !== baseUrl) {
        seen.add(fullUrl);
        subPages.push(fullUrl);
      }
    } catch {
      // skip malformed
    }
  });

  return subPages;
}

function getSurroundingContext($: cheerio.CheerioAPI, el: Element): string {
  // Look for year context in parent elements, preceding headings, and nearby text
  let context = '';

  // Check parent and grandparent text/class/id for year hints
  const $el = $(el);
  const parents = $el.parents('div, section, li, tr, td, article').slice(0, 3);
  parents.each((_, parent) => {
    const id = $(parent).attr('id') || '';
    const cls = $(parent).attr('class') || '';
    const dataAttrs = Object.entries($(parent).attr() || {})
      .filter(([k]) => k.startsWith('data-'))
      .map(([, v]) => v)
      .join(' ');
    context += ` ${id} ${cls} ${dataAttrs}`;
  });

  // Look for the nearest preceding heading (h1-h4) within the same section
  const closestSection = $el.closest('div, section, article');
  if (closestSection.length) {
    closestSection.find('h1, h2, h3, h4').each((_, heading) => {
      context += ` ${$(heading).text()}`;
    });
  }

  // Check the closest list item or table row for text
  const closestRow = $el.closest('li, tr');
  if (closestRow.length) {
    context += ` ${closestRow.text()}`;
  }

  return context;
}

function extractPdfLinks(html: string, baseUrl: string): IRReport[] {
  const $ = cheerio.load(html);
  const reports: IRReport[] = [];
  const seenUrls = new Set<string>();

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;

    const isPdf =
      href.toLowerCase().endsWith('.pdf') ||
      href.toLowerCase().includes('.pdf');
    if (!isPdf) return;

    // Resolve relative URLs
    let fullUrl: string;
    try {
      fullUrl = new URL(href, baseUrl).toString();
    } catch {
      return;
    }

    if (seenUrls.has(fullUrl)) return;
    seenUrls.add(fullUrl);

    const text = $(el).text().trim();
    if (!isRelevantPdf(text, href)) return;
    if (!isFinancialReport(text, href)) return;

    // Get surrounding context for better year/quarter extraction
    const context = getSurroundingContext($, el);
    const { type, year, quarter } = classifyReport(text, `${href} ${context}`);

    reports.push({
      title: text || href.split('/').pop()?.replace('.pdf', '') || 'Report',
      url: fullUrl,
      type,
      year,
      quarter,
    });
  });

  return reports;
}

interface DiscoverResult {
  page: { url: string; html: string } | null;
  blocked: boolean;
}

async function discoverIRPage(website: string): Promise<DiscoverResult> {
  const domain = extractDomain(website);
  const baseUrl = `https://${domain}`;
  let sawBlocked = false;

  // 1. Probe common paths
  for (const path of COMMON_IR_PATHS) {
    const url = `${baseUrl}${path}`;
    const res = await fetchWithTimeout(url);
    if (res && res.ok) {
      const html = await res.text();
      const lower = html.toLowerCase();
      if (
        lower.includes('investor') ||
        lower.includes('annual report') ||
        lower.includes('quarterly')
      ) {
        return { page: { url, html }, blocked: false };
      }
    } else if (res && (res.status === 403 || res.status === 401)) {
      sawBlocked = true;
    }
  }

  // 2. Probe subdomains
  const subdomains = [`investor.${domain}`, `ir.${domain}`];
  for (const sub of subdomains) {
    const url = `https://${sub}`;
    const res = await fetchWithTimeout(url);
    if (res && res.ok) {
      const html = await res.text();
      return { page: { url, html }, blocked: false };
    } else if (res && (res.status === 403 || res.status === 401)) {
      sawBlocked = true;
    }
  }

  // 3. Scan homepage for IR links
  const homepageRes = await fetchWithTimeout(baseUrl);
  if (homepageRes && homepageRes.ok) {
    const homepageHtml = await homepageRes.text();
    const $ = cheerio.load(homepageHtml);

    const irKeywords = ['investor', 'shareholders', 'annual report', 'ir'];
    let irLink: string | null = null;

    $('a[href]').each((_, el) => {
      if (irLink) return;
      const href = $(el).attr('href') || '';
      const text = $(el).text().toLowerCase();
      const hrefLower = href.toLowerCase();

      if (irKeywords.some((kw) => text.includes(kw) || hrefLower.includes(kw))) {
        try {
          irLink = new URL(href, baseUrl).toString();
        } catch {
          // skip malformed URLs
        }
      }
    });

    if (irLink) {
      const irRes = await fetchWithTimeout(irLink);
      if (irRes && irRes.ok) {
        const html = await irRes.text();
        return { page: { url: irLink, html }, blocked: false };
      } else if (irRes && (irRes.status === 403 || irRes.status === 401)) {
        sawBlocked = true;
      }
    }

    // If no IR link found, try to extract PDFs from homepage itself
    return { page: { url: baseUrl, html: homepageHtml }, blocked: false };
  } else if (homepageRes && (homepageRes.status === 403 || homepageRes.status === 401)) {
    sawBlocked = true;
  }

  return { page: null, blocked: sawBlocked };
}

export async function POST(req: NextRequest) {
  try {
    const { website, ticker, irPageUrl } = await req.json();

    if (!website && !irPageUrl) {
      return NextResponse.json(
        { error: 'No website or IR page URL provided' },
        { status: 400 },
      );
    }

    // Check cache
    const cacheKey = irPageUrl || ticker || website;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    // Reset request counter for this invocation
    requestCount = 0;

    let irPage: { url: string; html: string } | null = null;

    let blocked = false;

    if (irPageUrl) {
      // User provided a direct IR page URL
      const res = await fetchWithTimeout(irPageUrl);
      if (res && res.ok) {
        irPage = { url: irPageUrl, html: await res.text() };
      } else if (res && (res.status === 403 || res.status === 401)) {
        blocked = true;
      }
    } else {
      const result = await discoverIRPage(website);
      irPage = result.page;
      blocked = result.blocked;
    }

    // Fallback: use headless browser when fetch is blocked
    if (!irPage && blocked) {
      const targetUrl = irPageUrl || `https://ir.${extractDomain(website)}`;
      const html = await fetchWithBrowser(targetUrl);
      if (html) {
        irPage = { url: targetUrl, html };
        blocked = false;
      }
    }

    if (!irPage) {
      const error = blocked
        ? 'This site blocks automated access. Try uploading a PDF directly instead.'
        : 'Could not find investor relations page';
      const result: IRCrawlResult = {
        irPageUrl: '',
        reports: [],
        error,
      };
      return NextResponse.json(result);
    }

    // Extract PDFs from the main IR page
    const reports = extractPdfLinks(irPage.html, irPage.url);
    const seenUrls = new Set(reports.map((r) => r.url));

    // Crawl sub-pages (quarterly-results, annual-reports, etc.) for more PDFs
    const subPages = findReportSubPages(irPage.html, irPage.url);
    for (const subPageUrl of subPages) {
      let subHtml: string | null = null;

      const subRes = await fetchWithTimeout(subPageUrl);
      if (subRes && subRes.ok) {
        subHtml = await subRes.text();
      } else if (subRes && (subRes.status === 403 || subRes.status === 401)) {
        // Fallback to browser for blocked sub-pages
        subHtml = await fetchWithBrowser(subPageUrl);
      }

      if (subHtml) {
        const subReports = extractPdfLinks(subHtml, subPageUrl);
        for (const report of subReports) {
          if (!seenUrls.has(report.url)) {
            seenUrls.add(report.url);
            reports.push(report);
          }
        }
      }
    }

    // Sort by year descending, then by quarter descending
    reports.sort((a, b) => {
      if (a.year && b.year && a.year !== b.year) return b.year - a.year;
      if (a.quarter && b.quarter) return b.quarter - a.quarter;
      return 0;
    });

    const result: IRCrawlResult = {
      irPageUrl: irPage.url,
      reports,
    };

    // Cache result
    cache.set(cacheKey, { data: result, timestamp: Date.now() });

    return NextResponse.json(result);
  } catch (err) {
    console.error('IR crawl error:', err);
    return NextResponse.json(
      {
        irPageUrl: '',
        reports: [],
        error: 'Failed to crawl investor relations page',
      } as IRCrawlResult,
      { status: 500 },
    );
  }
}
