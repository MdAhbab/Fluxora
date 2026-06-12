// Notice Scribe — bilingual notice composer (AGENTS.md §2.4).
//
// Turns a one-line brief into a structured notice with a tone preset and a faithful
// Bangla⇄English pair, suggests a category + urgency, and lints for missing info.
// Translation here is a best-effort domain template; the Bangla body is flagged for
// human review on publish (the spec's human-edit step).

export type Tone = 'Formal' | 'Friendly' | 'Urgent';

export type NoticeDraft = {
  title: string;
  bodyEn: string;
  bodyBn: string;
  category: string;
  urgent: boolean;
  lint: string[];        // missing-info / readability warnings
  tone: Tone;
};

// Curated term map for common Dhaka building-notice vocabulary.
const TERMS: [RegExp, string][] = [
  [/water\s*(supply)?/gi, 'পানি সরবরাহ'], [/shut[- ]?off|shutdown|cut/gi, 'বন্ধ'],
  [/lift|elevator/gi, 'লিফট'], [/electric(ity)?|power/gi, 'বিদ্যুৎ'],
  [/generator|diesel/gi, 'জেনারেটর'], [/gas/gi, 'গ্যাস'],
  [/maintenance|servicing|service/gi, 'রক্ষণাবেক্ষণ'], [/cleaning/gi, 'পরিষ্কার'],
  [/parking/gi, 'পার্কিং'], [/security/gi, 'নিরাপত্তা'], [/meeting|agm/gi, 'সভা'],
  [/tank/gi, 'ট্যাংক'], [/roof(top)?/gi, 'ছাদ'], [/garbage|waste/gi, 'আবর্জনা'],
  [/notice/gi, 'নোটিশ'], [/tomorrow/gi, 'আগামীকাল'], [/today/gi, 'আজ'],
];

const TONE_FRAME: Record<Tone, { en: (b: string) => string; bn: (b: string) => string }> = {
  Formal: {
    en: b => `Dear Residents,\n\nPlease be informed that ${b}. We request your kind cooperation and apologise for any inconvenience caused.\n\n— Building Management`,
    bn: b => `প্রিয় বাসিন্দাগণ,\n\nএতদ্বারা জানানো যাচ্ছে যে, ${b}। আপনাদের সহযোগিতা কামনা করছি এবং সাময়িক অসুবিধার জন্য দুঃখ প্রকাশ করছি।\n\n— ভবন কর্তৃপক্ষ`,
  },
  Friendly: {
    en: b => `Hello neighbours! 👋\n\nJust a quick heads-up: ${b}. Thanks for your understanding — see you around the building!\n\n— Building Management`,
    bn: b => `প্রিয় প্রতিবেশীগণ,\n\nছোট্ট একটি তথ্য: ${b}। আপনাদের সহযোগিতার জন্য ধন্যবাদ!\n\n— ভবন কর্তৃপক্ষ`,
  },
  Urgent: {
    en: b => `URGENT NOTICE\n\n${b}. Immediate attention is requested. Please follow the instructions of building staff.\n\n— Building Management`,
    bn: b => `জরুরি নোটিশ\n\n${b}। অনুগ্রহ করে দ্রুত মনোযোগ দিন এবং ভবন কর্মীদের নির্দেশনা অনুসরণ করুন।\n\n— ভবন কর্তৃপক্ষ`,
  },
};

function toBangla(brief: string): string {
  let out = brief;
  for (const [re, bn] of TERMS) out = out.replace(re, bn);
  return out;
}

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function suggestCategory(t: string): string {
  if (/water|lift|electric|power|generator|gas|maintenance|service|tank|cleaning/.test(t)) return 'Maintenance';
  if (/security|gate|cctv|theft|guard|fire|evacuat/.test(t)) return 'Security';
  if (/charge|fee|payment|bill|due|invoice|fund/.test(t)) return 'Finance';
  if (/event|eid|party|gathering|meeting|agm|celebration/.test(t)) return 'Event';
  return 'General';
}

export function runScribe(brief: string, tone: Tone): NoticeDraft {
  const clean = brief.trim().replace(/\.$/, '');
  const t = clean.toLowerCase();
  const urgent = tone === 'Urgent' || /urgent|emergency|immediately|evacuat|shut[- ]?off|danger/.test(t);

  const frame = TONE_FRAME[tone];
  const bodyEn = frame.en(clean);
  const bodyBn = frame.bn(toBangla(clean));

  // Title: lift the subject; cap length.
  const subject = clean.split(/ for | due to | because /i)[0];
  const title = titleCase(subject).slice(0, 80);

  // Lint: missing date / time / contact, plus readability.
  const lint: string[] = [];
  if (!/\b(\d{1,2}\s*(am|pm|:|–|-)|\d{1,2}\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(t))
    lint.push('No date or day detected — add when this takes effect.');
  if (!/\b\d{1,2}\s*(?::\d{2})?\s*(am|pm)\b|\b\d{1,2}[–-]\d{1,2}\b/i.test(t))
    lint.push('No time window detected — residents will ask "until when?".');
  if (!/contact|office|call|\+?\d{4,}|committee/i.test(t))
    lint.push('No contact point — consider adding the office number.');
  if (clean.length < 12) lint.push('Brief is very short — the notice may read as terse.');
  lint.push('Verify the Bangla draft before publishing.');

  return { title, bodyEn, bodyBn, category: suggestCategory(t), urgent, lint, tone };
}
