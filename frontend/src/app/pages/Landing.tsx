import { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useMotionValueEvent, MotionValue } from 'motion/react';
import { Link } from 'react-router';
import { Nav } from '../components/landing/Nav';
import { TowerCamera, Window } from '../components/landing/TowerCamera';

// Seven scenes. Scene 01 is silent — only the tower with its rooftop marquee.
// Each later scene's foreground panel receives the section-local progress so
// its choreography (e.g. the QR pass under the scanner in Scene 04) scrubs
// to scroll instead of playing once.

type Scene = {
  num: string;
  eyebrow: string;
  window: Window | 'full';
  side: 'left' | 'right';
  panel?: (p: { localProgress: MotionValue<number> }) => JSX.Element;
};

const scenes: Scene[] = [
  // 01 — SILENT OPENING: just the tower, mysterious. Marquee reads on the roof.
  {
    num: '01',
    eyebrow: 'Arrive',
    window: 'full',
    side: 'left',
    // no panel — nothing in the foreground.
  },

  // 02 — Manifesto reveal
  {
    num: '02',
    eyebrow: 'Residence OS',
    window: 'full',
    side: 'left',
    panel: () => (
      <Panel side="left">
        <Eyebrow num="02" label="Residence OS · Dhaka · BDT · bKash" />
        <h2 className="display text-[clamp(2.4rem,5.4vw,4.6rem)] leading-[1.02] mt-6">
          Run your building<br/>
          <span className="italic font-light text-[var(--accent)]">like a residence,</span><br/>
          not a spreadsheet.
        </h2>
        <p className="mt-8 text-[var(--ink-muted)] leading-relaxed max-w-md">
          Five stakeholders, one ledger. Service charges that collect themselves, gate passes that scan in under two seconds, a building that knows itself flat by flat.
        </p>
        <div className="mt-10 flex items-center gap-6">
          <Link to="/signup" className="group relative inline-flex items-center gap-3 px-6 h-12 bg-[var(--ink)] text-[var(--bg-raised)] mono uppercase tracking-[0.2em] text-[0.7rem] overflow-hidden">
            <span className="relative z-10">Enter the lobby</span>
            <span className="relative z-10">→</span>
            <span className="absolute inset-0 bg-[var(--accent)] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(.7,0,.2,1)]" />
          </Link>
          <Link to="/login" className="mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ink-muted)] hover:text-[var(--accent)] border-b border-transparent hover:border-[var(--accent)] pb-1 transition">
            Try a demo role →
          </Link>
        </div>
      </Panel>
    ),
  },

  // 03 — Finance, window 12A
  {
    num: '03',
    eyebrow: 'Finance · Window 12A',
    window: { floor: 12, unit: 0 },
    side: 'right',
    panel: () => (
      <Panel side="right">
        <Eyebrow num="03" label="Finance · Window 12A" />
        <h2 className="display text-[clamp(2rem,4.6vw,3.8rem)] leading-[1.02] mt-6">
          Service charges<br/>
          <span className="italic font-light text-[var(--accent)]">that collect</span><br/>
          themselves.
        </h2>
        <p className="mt-6 text-[var(--ink-muted)] leading-relaxed max-w-md">
          Issue, remind, reconcile. Every invoice generates itself on the first, takes bKash, and stamps the books.
        </p>
        <div className="mt-8"><InvoiceDetail /></div>
      </Panel>
    ),
  },

  // 04 — Gate / Scanner. SCRUBBED — the QR pass moves with scroll.
  {
    num: '04',
    eyebrow: 'Security · Gate A',
    window: { floor: 1, unit: 2 },
    side: 'left',
    panel: ({ localProgress }) => (
      <Panel side="left">
        <Eyebrow num="04" label="Security · Gate A" />
        <h2 className="display text-[clamp(2rem,4.6vw,3.8rem)] leading-[1.02] mt-6">
          Two seconds<br/>
          <span className="italic font-light text-[var(--accent)]">at the gate.</span>
        </h2>
        <p className="mt-6 text-[var(--ink-muted)] leading-relaxed max-w-md">
          Residents pre-register. The guard's tablet scans the QR. The log writes itself.
        </p>
        <div className="mt-8"><ScrubbedScanner progress={localProgress} /></div>
      </Panel>
    ),
  },

  // 05 — Operations / Triage, window 7C
  {
    num: '05',
    eyebrow: 'Operations · Window 7C',
    window: { floor: 7, unit: 2 },
    side: 'right',
    panel: () => (
      <Panel side="right">
        <Eyebrow num="05" label="Operations · Window 7C" />
        <h2 className="display text-[clamp(2rem,4.6vw,3.8rem)] leading-[1.02] mt-6">
          Tickets that<br/>
          <span className="italic font-light text-[var(--accent)]">route themselves.</span>
        </h2>
        <p className="mt-6 text-[var(--ink-muted)] leading-relaxed max-w-md">
          A ticket is born with a category and a candidate assignee, proposed by Triage. A human taps to confirm.
        </p>
        <div className="mt-8"><TicketDetail /></div>
      </Panel>
    ),
  },

  // 06 — Community / Notice Scribe, window 9D
  {
    num: '06',
    eyebrow: 'Community · Window 9D',
    window: { floor: 9, unit: 3 },
    side: 'left',
    panel: () => (
      <Panel side="left">
        <Eyebrow num="06" label="Community · Window 9D" />
        <h2 className="display text-[clamp(2rem,4.6vw,3.8rem)] leading-[1.02] mt-6">
          A notice for<br/>
          <span className="italic font-light text-[var(--accent)]">every voice.</span>
        </h2>
        <p className="mt-6 text-[var(--ink-muted)] leading-relaxed max-w-md">
          Drafted by Notice Scribe from a one-line brief. Published in Bangla and English, side by side.
        </p>
        <div className="mt-8"><NoticeDetail /></div>
      </Panel>
    ),
  },

  // 07 — Five keys, panoramic
  {
    num: '07',
    eyebrow: 'Five Keys, One Building',
    window: 'full',
    side: 'right',
    panel: () => (
      <Panel side="right">
        <Eyebrow num="07" label="Five Keys, One Building" />
        <h2 className="display text-[clamp(2rem,4.6vw,3.8rem)] leading-[1.02] mt-6">
          The same tower,<br/>
          <span className="italic font-light text-[var(--accent)]">five views of it.</span>
        </h2>
        <p className="mt-6 text-[var(--ink-muted)] leading-relaxed max-w-md">
          Admin, Committee, Resident, Guard, Staff — same shell, different defaults.
        </p>
        <div className="mt-8"><RoleStrip /></div>
      </Panel>
    ),
  },
];

export function Landing() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  const highlight = useMotionValue<Window | null>(null);
  useMotionValueEvent(scrollYProgress, 'change', p => {
    const segment = 1 / scenes.length;
    const idx = Math.min(scenes.length - 1, Math.floor(p / segment));
    const s = scenes[idx];
    highlight.set(s.window === 'full' ? null : s.window);
  });

  const cameraScenes = scenes.map((s, i) => ({ at: (i + 0.5) / scenes.length, window: s.window }));

  return (
    <div className="grain bg-[var(--bg)] text-[var(--ink)]">
      <Nav />

      <section ref={sectionRef} id="platform" style={{ position: 'relative', height: `${scenes.length * 100}vh` }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="absolute inset-0 !top-16">
            <TowerCamera progress={scrollYProgress} scenes={cameraScenes} highlight={highlight} />
          </div>

          {scenes.map((s, i) => (
            <ScenePanel key={i} scene={s} index={i} total={scenes.length} progress={scrollYProgress} />
          ))}

          {/* Silent opening hint — bottom-left mono caption, fades out after scene 01 */}
          <SilentCaption progress={scrollYProgress} totalScenes={scenes.length} />

          <ScrollIndicator progress={scrollYProgress} count={scenes.length} />

          {[['top-6 left-6'], ['top-6 right-6'], ['bottom-6 left-6'], ['bottom-6 right-6']].map(([p], i) => (
            <Crosshair key={i} pos={p} />
          ))}
        </div>
      </section>

      <Stakeholders />
      <Agents />
      <Pricing />
      <Footer />
    </div>
  );
}

function ScenePanel({ scene, index, total, progress }: { scene: Scene; index: number; total: number; progress: MotionValue<number> }) {
  const segStart = index / total;
  const segEnd = (index + 1) / total;
  const segMid = (segStart + segEnd) / 2;

  const opacity = useTransform(progress, [segStart, segStart + 0.04, segEnd - 0.04, segEnd], [0, 1, 1, 0]);
  const y = useTransform(progress, [segStart, segMid, segEnd], [40, 0, -40]);

  // localProgress: 0 → 1 as scroll moves through this scene's segment
  const localProgress = useTransform(progress, [segStart, segEnd], [0, 1]);

  if (!scene.panel) return null;

  return (
    <motion.div
      style={{ opacity, y }}
      className={`absolute inset-0 flex items-center pointer-events-none`}
    >
      <div className="pointer-events-auto w-full max-w-[1440px] mx-auto px-6 lg:px-12 grid grid-cols-12 gap-6">
        <div className={`col-span-12 lg:col-span-5 ${scene.side === 'right' ? 'lg:col-start-8' : ''}`}>
          {scene.panel({ localProgress })}
        </div>
      </div>
    </motion.div>
  );
}

function Panel({ side, children }: { side: 'left' | 'right'; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--bg)]/85 backdrop-blur-sm p-6 lg:p-10 border border-[var(--line)]">
      {children}
    </div>
  );
}

function Eyebrow({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="mono text-[0.7rem] tracking-[0.22em] uppercase text-[var(--accent)]">{num}</span>
      <span className="mono text-[0.7rem] tracking-[0.22em] uppercase text-[var(--ink-muted)]">{label}</span>
      <span className="flex-1 h-px bg-[var(--line)]" />
    </div>
  );
}

// ───────── Scrubbed scanner — the QR pass moves under the scanline, driven by scroll ─────────
function ScrubbedScanner({ progress }: { progress: MotionValue<number> }) {
  // Pass crosses the frame between local progress 0.15–0.85.
  // Scanline flashes when the pass is centered, around 0.5.
  const passLeft = useTransform(progress, [0.15, 0.85], ['-30%', '110%']);
  const scanOpacity = useTransform(progress, [0.42, 0.5, 0.58], [0, 1, 0]);
  const verifiedOpacity = useTransform(progress, [0.6, 0.7, 0.95, 1], [0, 1, 1, 0]);

  return (
    <div className="bg-[#0D0C0A] border border-[#2A2722] p-4 max-w-md">
      <div className="flex items-center justify-between mono text-[0.6rem] uppercase tracking-[0.18em] text-[#9A938A] pb-3 border-b border-[#2A2722]">
        <span>Gate A · viewfinder</span>
        <span className="flex items-center gap-2 text-[#7E9B6E]">
          <span className="w-1.5 h-1.5 bg-[#7E9B6E] rounded-full animate-pulse" />
          LIVE
        </span>
      </div>

      <div className="relative mt-3 h-36 bg-[#0A0908] overflow-hidden border border-[#2A2722]">
        {/* corner brackets */}
        {[
          ['top-1 left-1', 'border-t border-l'],
          ['top-1 right-1', 'border-t border-r'],
          ['bottom-1 left-1', 'border-b border-l'],
          ['bottom-1 right-1', 'border-b border-r'],
        ].map(([pos, b], i) => (
          <span key={i} className={`absolute ${pos} w-4 h-4 ${b} border-[#C9A36A]`} />
        ))}

        {/* center scan label, fades when pass approaches */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 mono text-[0.5rem] tracking-[0.2em] uppercase text-[#9A938A]">SCAN</div>

        {/* scrubbed pass */}
        <motion.div
          style={{ left: passLeft, top: '50%', y: '-50%' }}
          className="absolute w-28 h-20 border border-[#C9A36A] bg-[#161412] p-2"
        >
          <div className="mono text-[0.5rem] tracking-[0.18em] uppercase text-[#C9A36A]">Visitor pass</div>
          <div className="mono text-[0.62rem] text-[#EDE8DF] mt-1">Flat 7C</div>
          <div className="mono text-[0.56rem] text-[#9A938A] mt-0.5">F. Hasan</div>
          {/* mini QR */}
          <svg viewBox="0 0 12 12" className="absolute bottom-1 right-1 w-7 h-7">
            <rect width="12" height="12" fill="#0D0C0A" />
            {Array.from({ length: 12 }).map((_, r) =>
              Array.from({ length: 12 }).map((_, c) => {
                const on = ((r * 7 + c * 5) % 11) < 4 || (r < 3 && c < 3) || (r < 3 && c > 8) || (r > 8 && c < 3);
                return on ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#C9A36A" /> : null;
              })
            )}
          </svg>
        </motion.div>

        {/* vertical scanline */}
        <motion.div
          style={{ opacity: scanOpacity }}
          className="absolute top-0 bottom-0 left-1/2 w-px bg-[#C9A36A]"
        >
          <span className="absolute inset-0 -mx-2 bg-[#C9A36A] blur-md opacity-50" />
        </motion.div>

        {/* verified stamp emerging post-scan */}
        <motion.div
          style={{ opacity: verifiedOpacity }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <span className="display text-[1.6rem] text-[#7E9B6E] tracking-[0.08em] border border-[#7E9B6E] px-3 py-1">
            VERIFIED
          </span>
        </motion.div>
      </div>

      <div className="mt-3 mono text-[0.6rem] tracking-[0.18em] uppercase text-[#9A938A] flex justify-between">
        <span>FLX-V901 · F. Hasan → 7C</span>
        <span>00:01.7</span>
      </div>
    </div>
  );
}

// ───────── Silent opening caption: fades out after scene 01 ─────────
function SilentCaption({ progress, totalScenes }: { progress: MotionValue<number>; totalScenes: number }) {
  const opacity = useTransform(progress, [0, 1 / totalScenes * 0.6, 1 / totalScenes], [1, 1, 0]);
  return (
    <motion.div
      style={{ opacity }}
      className="absolute bottom-10 left-6 lg:left-12 pointer-events-none z-10"
    >
      <div className="mono text-[0.62rem] uppercase tracking-[0.22em] text-[var(--ink-muted)]">
        Begin scrolling
      </div>
      <div className="display text-[0.95rem] italic text-[var(--ink-muted)] mt-1">to enter the building</div>
      <div className="mt-3 w-12 h-px bg-[var(--accent)]" />
    </motion.div>
  );
}

function InvoiceDetail() {
  const rows = [['Service charge', '12,000'], ['Water', '2,400'], ['Lift AMC', '1,600'], ['Security', '2,400']];
  return (
    <div className="bg-[var(--bg-raised)] border border-[var(--line)] p-5 max-w-sm">
      <div className="flex justify-between mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] pb-3 border-b border-[var(--line)]">
        <span>INV-2605-008</span><span>Due 12 May</span>
      </div>
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between mono text-[0.8rem] py-2 border-b border-[var(--line)] last:border-0">
          <span className="text-[var(--ink-muted)]">{k}</span>
          <span className="tabular-nums">৳ {v}</span>
        </div>
      ))}
      <div className="flex justify-between mt-3 pt-3 border-t border-[var(--line)]">
        <span className="mono text-[0.74rem] uppercase tracking-[0.18em]">Total</span>
        <span className="display text-[1.4rem] tabular-nums">৳ 18,400</span>
      </div>
      <div className="mt-4 flex items-center gap-2 mono text-[0.66rem] uppercase tracking-[0.18em]">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--positive)]" />
        <span className="text-[var(--positive)]">PAID · bKash · 19:42</span>
      </div>
    </div>
  );
}

function TicketDetail() {
  return (
    <div className="bg-[var(--bg-raised)] border border-[var(--line)] p-5 max-w-sm">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
        <span className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">T-014</span>
        <span className="mono text-[0.6rem] uppercase tracking-[0.18em] text-[var(--accent)]">2h ago</span>
      </div>
      <div className="mt-3 display text-[1.2rem]">Kitchen sink leaking</div>
      <div className="mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ink-muted)] mt-1">Flat 7C</div>
      <div className="mt-4 border border-dashed border-[var(--accent)] p-3">
        <div className="mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--accent)] mb-2">Triage proposes</div>
        <div className="text-[0.86rem]">PLUMBING · Rahim Uddin · MEDIUM</div>
        <div className="mono text-[0.62rem] text-[var(--ink-muted)] mt-1">confidence 96%</div>
        <div className="flex gap-2 mt-3">
          <button className="h-7 px-3 mono text-[0.62rem] uppercase tracking-[0.18em] bg-[var(--ink)] text-[var(--bg-raised)]">Confirm</button>
          <button className="h-7 px-3 mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">Override</button>
        </div>
      </div>
    </div>
  );
}

function NoticeDetail() {
  return (
    <div className="bg-[var(--bg-raised)] border border-[var(--line)] p-5 max-w-md">
      <div className="grid grid-cols-2 gap-px bg-[var(--line)]">
        <div className="bg-[var(--bg-raised)] p-4">
          <div className="mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--accent)] mb-2">English</div>
          <div className="display text-[0.95rem] leading-snug">Lift B planned maintenance — 14 May, 06:00–10:00. Lift A operational.</div>
        </div>
        <div className="bg-[var(--bg-raised)] p-4">
          <div className="mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--accent)] mb-2">বাংলা</div>
          <div className="display text-[0.95rem] leading-snug">লিফট বি ১৪ মে রক্ষণাবেক্ষণে বন্ধ থাকবে। লিফট এ চালু থাকবে।</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between mono text-[0.6rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">
        <span>Drafted · Notice Scribe</span><span>Tone · Formal</span>
      </div>
    </div>
  );
}

function RoleStrip() {
  const roles = [
    { k: 'Admin', m: '06 modules' },
    { k: 'Committee', m: 'Approvals' },
    { k: 'Resident', m: 'Mobile-first' },
    { k: 'Guard', m: 'Tablet kiosk' },
    { k: 'Staff', m: 'Phone-first' },
  ];
  return (
    <div className="flex divide-x divide-[var(--line)] border-y border-[var(--line)]">
      {roles.map((r, i) => (
        <div key={i} className="flex-1 p-3">
          <div className="display text-[0.95rem] italic">{r.k}</div>
          <div className="mono text-[0.56rem] uppercase tracking-[0.16em] text-[var(--ink-muted)] mt-1">{r.m}</div>
        </div>
      ))}
    </div>
  );
}

function ScrollIndicator({ progress, count }: { progress: MotionValue<number>; count: number }) {
  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
      {Array.from({ length: count }).map((_, i) => {
        const lo = i / count;
        const hi = (i + 1) / count;
        
        let inputs = [lo - 0.02, lo, hi, hi + 0.02];
        let outputs = [0.3, 1, 1, 0.3];
        
        if (i === 0) {
          inputs = [0, hi, hi + 0.02];
          outputs = [1, 1, 0.3];
        } else if (i === count - 1) {
          inputs = [lo - 0.02, lo, 1];
          outputs = [0.3, 1, 1];
        }

        const opacity = useTransform(progress, inputs, outputs);
        return (
          <motion.div key={i} className="flex items-center gap-2" style={{ opacity }}>
            <span className="mono text-[0.6rem] tracking-[0.2em] text-[var(--ink-muted)]">{String(i + 1).padStart(2, '0')}</span>
            <span className="w-8 h-px bg-[var(--accent)]" />
          </motion.div>
        );
      })}
    </div>
  );
}

function Crosshair({ pos }: { pos: string }) {
  return (
    <div className={`absolute ${pos} pointer-events-none z-10`}>
      <svg width="14" height="14"><line x1="0" y1="7" x2="14" y2="7" stroke="var(--ink-muted)" strokeWidth="0.5" /><line x1="7" y1="0" x2="7" y2="14" stroke="var(--ink-muted)" strokeWidth="0.5" /></svg>
    </div>
  );
}

// ───────── Below the pin ─────────
function Stakeholders() {
  const roles = [
    { k: 'Admin', l: 'The complete command desk — every taka, every visitor, every ticket. Architect Mode reshapes the building.', m: '12 / 84', s: 'open tickets' },
    { k: 'Committee', l: 'Approvals in one queue. Read the Pulse. Sign off in seconds.', m: '04', s: 'awaiting sign-off' },
    { k: 'Resident', l: 'Pay in two taps. Book the rooftop. Register a guest. Open a ticket.', m: '৳ 18,400', s: 'due 12 May' },
    { k: 'Guard', l: 'Scan a pass in two seconds. SOS arrives as a takeover. Built tablet-first.', m: '47', s: 'scans today' },
    { k: 'Staff', l: 'Worklist, photo proof, hold-to-clock-in. One thumb, on the move.', m: '08', s: 'closed today' },
  ];
  return (
    <section id="stakeholders" className="relative py-32 lg:py-48 border-t border-[var(--line)]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <div className="flex items-center gap-3 mb-12">
          <span className="mono text-[0.7rem] tracking-[0.22em] uppercase text-[var(--accent)]">08</span>
          <span className="mono text-[0.7rem] tracking-[0.22em] uppercase text-[var(--ink-muted)]">Stakeholders</span>
          <span className="flex-1 h-px bg-[var(--line)]" />
        </div>
        <div className="grid grid-cols-12 gap-10 mb-16">
          <h2 className="col-span-12 lg:col-span-7 display text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.02]">Same shell.<br/><span className="italic font-light text-[var(--accent)]">Five experiences.</span></h2>
          <p className="col-span-12 lg:col-span-5 text-[var(--ink-muted)] leading-relaxed lg:pt-4">Each role's screens are designed deliberately. Try any of them with the demo accounts on the sign-in page.</p>
        </div>
        <div className="-mx-6 lg:-mx-10 overflow-x-auto no-scrollbar">
          <div className="flex px-6 lg:px-10 gap-px bg-[var(--line)]" style={{ width: 'max-content' }}>
            {roles.map((r, i) => (
              <motion.article key={r.k}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                className="bg-[var(--bg)] w-[320px] md:w-[380px] flex-shrink-0 p-8 lg:p-10 group">
                <div className="flex items-baseline justify-between">
                  <span className="mono text-[0.65rem] tracking-[0.22em] uppercase text-[var(--accent)]">{String(i + 1).padStart(2, '0')}</span>
                  <span className="mono text-[0.6rem] tracking-[0.2em] uppercase text-[var(--ink-muted)]">Role</span>
                </div>
                <h3 className="display text-[2.4rem] mt-6">The <span className="italic font-light">{r.k}</span></h3>
                <p className="mt-6 text-[var(--ink-muted)] leading-relaxed min-h-[88px]">{r.l}</p>
                <div className="mt-8 pt-6 border-t border-[var(--line)] flex items-end justify-between">
                  <div>
                    <div className="display text-[1.8rem] tabular-nums">{r.m}</div>
                    <div className="mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--ink-muted)] mt-1">{r.s}</div>
                  </div>
                  <Link to="/login" className="mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] group-hover:text-[var(--accent)] transition">view →</Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Agents() {
  const agents = [
    { n: 'I', name: 'Concierge', l: 'A voice at the front desk. Answers, books, pays, files — for every role.' },
    { n: 'II', name: 'Triage', l: 'Reads incoming tickets, proposes category and assignee. Confirmed by a tap.' },
    { n: 'III', name: 'Pulse', l: 'A monthly editorial digest. Anomalies in plain language. Print-ready.' },
    { n: 'IV', name: 'Scribe', l: 'Drafts notices from a brief. Bangla and English, side by side.' },
  ];
  return (
    <section id="intelligence" className="relative py-32 lg:py-48 border-t border-[var(--line)] overflow-hidden">
      <span aria-hidden className="pointer-events-none absolute -left-4 top-10 display text-[26vw] leading-none opacity-[0.04] select-none">09</span>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <div className="flex items-center gap-3 mb-12">
          <span className="mono text-[0.7rem] tracking-[0.22em] uppercase text-[var(--accent)]">09</span>
          <span className="mono text-[0.7rem] tracking-[0.22em] uppercase text-[var(--ink-muted)]">Intelligence</span>
          <span className="flex-1 h-px bg-[var(--line)]" />
        </div>
        <div className="grid grid-cols-12 gap-10 mb-16">
          <h2 className="col-span-12 lg:col-span-6 display text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.02]">Quiet help,<br/><span className="italic font-light text-[var(--accent)]">where the work is.</span></h2>
          <p className="col-span-12 lg:col-span-5 lg:col-start-8 text-[var(--ink-muted)] leading-relaxed lg:pt-4">Bring your own keys, self-host on Gemma, or take Fluxora Managed. The agents stay on the surface where they earn their keep.</p>
        </div>
        <div>
          {agents.map((a, i) => (
            <motion.div key={a.name}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group grid grid-cols-12 gap-6 items-baseline py-8 lg:py-10 border-t border-[var(--line)]">
              <div className="col-span-2 lg:col-span-1 mono text-[0.75rem] tracking-[0.2em] text-[var(--accent)]">{a.n}</div>
              <h3 className="col-span-10 lg:col-span-5 display text-[clamp(1.8rem,3.4vw,3rem)] leading-none">Flux <span className="italic font-light">{a.name}</span></h3>
              <p className="col-span-12 lg:col-span-5 text-[var(--ink-muted)] leading-relaxed">{a.l}</p>
              <span className="col-span-12 lg:col-span-1 text-right mono text-[0.62rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] group-hover:text-[var(--accent)] transition">→</span>
            </motion.div>
          ))}
          <div className="border-t border-[var(--line)]" />
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    { name: 'Foundation', sub: 'Smaller buildings finding their feet.', price: '4,500', features: ['Up to 40 flats', 'Finance · Notices · Visitors', 'Bring your own AI keys', 'Email support'] },
    { name: 'Residence', sub: 'The full operating system.', price: '9,800', features: ['Up to 120 flats', 'All six modules', 'Building Explorer · Architect Mode', 'Concierge + Triage agents', 'Priority support'], feature: true },
    { name: 'Estate', sub: 'Portfolio operators · luxury towers.', price: '—', features: ['Unlimited · multi-building', 'Fluxora Managed AI', 'White-glove onboarding', 'Custom integrations', 'Dedicated success'] },
  ];
  return (
    <section id="pricing" className="relative py-32 lg:py-48 border-t border-[var(--line)]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <div className="flex items-center gap-3 mb-12">
          <span className="mono text-[0.7rem] tracking-[0.22em] uppercase text-[var(--accent)]">10</span>
          <span className="mono text-[0.7rem] tracking-[0.22em] uppercase text-[var(--ink-muted)]">Tenancy</span>
          <span className="flex-1 h-px bg-[var(--line)]" />
        </div>
        <div className="grid grid-cols-12 gap-10 mb-16">
          <h2 className="col-span-12 lg:col-span-7 display text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.02]">Three plans.<br/><span className="italic font-light text-[var(--accent)]">No surprises.</span></h2>
          <p className="col-span-12 lg:col-span-5 text-[var(--ink-muted)] leading-relaxed lg:pt-4">Per building per month in BDT. Cancel any time — your data exports as a CSV bundle.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-b border-[var(--line)]">
          {plans.map((p, i) => (
            <motion.div key={p.name}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`p-10 lg:p-12 relative ${i > 0 ? 'md:border-l border-[var(--line)]' : ''} ${p.feature ? 'bg-[var(--bg-raised)]' : ''}`}>
              {p.feature && <span className="absolute top-0 left-0 right-0 h-px bg-[var(--accent)]" />}
              <div className="flex items-baseline justify-between">
                <span className="mono text-[0.65rem] tracking-[0.22em] uppercase text-[var(--accent)]">{String(i + 1).padStart(2, '0')}</span>
                {p.feature && <span className="mono text-[0.6rem] tracking-[0.2em] uppercase text-[var(--accent)]">Recommended</span>}
              </div>
              <h3 className="display text-[2.4rem] mt-6">{p.name}</h3>
              <p className="mt-2 text-[var(--ink-muted)] text-[0.92rem] leading-relaxed">{p.sub}</p>
              <div className="mt-10 flex items-baseline gap-2">
                <span className="mono text-[0.85rem] text-[var(--ink-muted)]">৳</span>
                <span className="display text-[3.6rem] tabular-nums leading-none">{p.price}</span>
                {p.price !== '—' && <span className="mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">/ mo</span>}
              </div>
              <ul className="mt-10 space-y-3">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-[0.92rem]"><span className="text-[var(--accent)] mono mt-1">+</span><span>{f}</span></li>
                ))}
              </ul>
              <Link to="/signup" className={`mt-10 inline-flex items-center justify-between gap-3 px-5 h-11 mono uppercase tracking-[0.18em] text-[0.7rem] transition-colors w-full ${
                p.feature ? 'bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[var(--ink)] hover:text-[var(--bg-raised)]' : 'border border-[var(--line)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
              }`}>
                <span>{p.price === '—' ? 'Talk to sales' : 'Begin tenancy'}</span><span>→</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-[var(--line)] pt-20 pb-0 overflow-hidden bg-[var(--bg-raised)]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 lg:col-span-5">
            <div className="mono text-[0.7rem] tracking-[0.22em] uppercase text-[var(--ink-muted)] mb-6">Built in Dhaka · for the towers of South Asia</div>
            <p className="display text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.15]">A building is not a spreadsheet. <span className="italic font-light text-[var(--accent)]">আপনার ভবন, আপনার ভাষায়।</span></p>
          </div>
          {[
            ['Platform', ['Finance', 'Operations', 'Security', 'Community', 'Estate']],
            ['Intelligence', ['Concierge', 'Triage', 'Pulse', 'Scribe', 'Managed AI']],
          ].map(([h, items]: any, i) => (
            <div key={i} className="col-span-6 lg:col-span-2">
              <div className="mono text-[0.66rem] uppercase tracking-[0.22em] text-[var(--ink-muted)] mb-4">{h}</div>
              <ul className="space-y-2 mono text-[0.78rem]">{items.map((it: string) => <li key={it}><a className="hover:text-[var(--accent)]" href="#">{it}</a></li>)}</ul>
            </div>
          ))}
          <div className="col-span-12 lg:col-span-3">
            <div className="mono text-[0.66rem] uppercase tracking-[0.22em] text-[var(--ink-muted)] mb-4">Contact</div>
            <ul className="space-y-2 mono text-[0.78rem]">
              <li>House 14, Road 7 · Gulshan-1, Dhaka</li>
              <li>concierge@fluxora.bd</li>
              <li>+880 1700 000 000</li>
            </ul>
            <div className="flex gap-2 mt-6">
              <Link to="/login" className="px-3 h-9 inline-flex items-center mono text-[0.66rem] uppercase tracking-[0.18em] border border-[var(--line)] hover:border-[var(--accent)]">Residents</Link>
              <Link to="/login" className="px-3 h-9 inline-flex items-center mono text-[0.66rem] uppercase tracking-[0.18em] border border-[var(--line)] hover:border-[var(--accent)]">Boards</Link>
            </div>
          </div>
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-between mono text-[0.64rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] pb-8 border-t border-[var(--line)] pt-6">
          <span>© 2026 Fluxora Operations Ltd.</span>
          <div className="flex gap-6"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Status</a><a href="#">Press</a></div>
        </div>
      </div>
      <div className="relative overflow-hidden">
        <div aria-hidden className="text-center display select-none pointer-events-none leading-[0.75] tracking-[-0.04em]" style={{ fontSize: 'clamp(8rem, 22vw, 22rem)', color: 'var(--ink)', opacity: 0.08, marginBottom: '-0.18em' }}>FLUXORA</div>
      </div>
    </footer>
  );
}
