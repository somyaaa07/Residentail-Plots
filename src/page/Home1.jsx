import { useState, useEffect, useRef } from "react";

function useWindowSize() {
  const [size, setSize] = useState({
    w: typeof window !== "undefined" ? window.innerWidth : 1200,
    h: typeof window !== "undefined" ? window.innerHeight : 800,
  });
  useEffect(() => {
    const handler = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return size;
}

function useBreakpoint() {
  const { w } = useWindowSize();
  return {
    w,
    isXs: w < 480,
    isSm: w >= 480 && w < 640,
    isMd: w >= 640 && w < 900,
    isLg: w >= 900 && w < 1200,
    isXl: w >= 1200,
    isMobile: w < 640,
    isTablet: w >= 640 && w < 900,
    isDesktop: w >= 900,
    isWide: w >= 1024,
  };
}

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { background: #ffffff; color: #07315a; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
:root {
  --navy: #07315a;
  --navy-light: #0d4a87;
  --navy-pale: #e8f0f8;
  --navy-muted: rgba(7,49,90,0.45);
  --green: #55734b;
  --green-light: #6a8f5e;
  --green-pale: #eef3ec;
  --white: #ffffff;
  --off-white: #f8f9fc;
  --border: rgba(7,49,90,0.12);
  --text-muted: rgba(7,49,90,0.5);
  --text-dim: rgba(7,49,90,0.35);
  --serif: 'Cinzel', serif;
  --display: 'Cormorant Garamond', serif;
  --sans: 'DM Sans', sans-serif;
  --nav-h: 72px;
  --shadow-sm: 0 2px 12px rgba(7,49,90,0.08);
  --shadow-md: 0 8px 32px rgba(7,49,90,0.12);
  --shadow-lg: 0 20px 60px rgba(7,49,90,0.15);
  --gold: #c9a84c;
  --gold-pale: #fdf8ee;
  --earth: #8b6f47;
  --river: #1a4a6b;
}
::selection { background: var(--navy); color: #fff; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--off-white); }
::-webkit-scrollbar-thumb { background: var(--navy-light); border-radius: 2px; }
input::placeholder { color: var(--text-dim); }
input { caret-color: var(--navy); }

@keyframes fadeUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes pulse-ring { 0% { transform:scale(0.8); opacity:1; } 100% { transform:scale(2.8); opacity:0; } }
@keyframes slideRight { from { transform:scaleX(0); } to { transform:scaleX(1); } }
@keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
@keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
@keyframes ripple { 0% { transform:scale(1); opacity:0.6; } 100% { transform:scale(3); opacity:0; } }
@keyframes drawLine { from { stroke-dashoffset: 200; } to { stroke-dashoffset: 0; } }
@keyframes amenitySlide { from { opacity:0; transform: translateX(-12px); } to { opacity:1; transform:translateX(0); } }
@keyframes counterSpin { from { transform: rotateY(90deg); opacity:0; } to { transform: rotateY(0deg); opacity:1; } }

/* ── RESPONSIVE UTILITIES ── */
img { max-width: 100%; height: auto; }
input, button, select, textarea { font-family: inherit; }

/* Tap target fix */
@media (max-width: 639px) {
  input, button, a { -webkit-tap-highlight-color: transparent; }
  button { touch-action: manipulation; }
  /* Prevent text overflow */
  h1, h2, h3, h4, p, span, div { word-break: break-word; overflow-wrap: break-word; }
}

/* Landscape phones */
@media (max-width: 896px) and (orientation: landscape) {
  .hero-section { min-height: 100vw !important; }
}

/* Safe areas (notch devices) */
@supports (padding: max(0px)) {
  .safe-bottom { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
  .sticky-bar { padding-bottom: max(0px, env(safe-area-inset-bottom)); }
}

/* Fluid font scaling */
@media (max-width: 360px) {
  html { font-size: 14px; }
}

/* Touch device hover fix */
@media (hover: none) {
  .hover-lift:hover { transform: none !important; box-shadow: var(--shadow-sm) !important; }
}
`;

function vPad(bp) {
  if (bp.isXs) return "40px";
  if (bp.isMobile) return "52px";
  if (bp.isTablet) return "68px";
  return "88px";
}
function hPad(bp) {
  if (bp.isXs) return "1rem";
  if (bp.isMobile) return "1.25rem";
  if (bp.isTablet) return "1.75rem";
  if (bp.isLg) return "2.25rem";
  return "3rem";
}

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let t0 = null;
    const step = ts => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.04 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(24px)",
      transition: `opacity .8s ${delay}s cubic-bezier(.16,1,.3,1), transform .8s ${delay}s cubic-bezier(.16,1,.3,1)`
    }}>{children}</div>
  );
}

function Eyebrow({ label, light = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{ width: 28, height: 2, background: light ? "rgba(255,255,255,0.6)" : "var(--green)", borderRadius: 1, flexShrink: 0 }} />
      <span style={{
        fontFamily: "var(--sans)", fontSize: "0.58rem", letterSpacing: "0.26em",
        textTransform: "uppercase", fontWeight: 600,
        color: light ? "rgba(255,255,255,0.7)" : "var(--green)"
      }}>{label}</span>
    </div>
  );
}

function GreenBtn({ children, onClick, outline = false, small = false, fullWidth = false }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: outline ? "transparent" : (hov ? "#3e5836" : "var(--green)"),
        border: outline ? `2px solid ${hov ? "var(--green)" : "var(--navy)"}` : "2px solid transparent",
        color: outline ? (hov ? "var(--green)" : "var(--navy)") : "#fff",
        fontFamily: "var(--sans)", fontWeight: 600,
        fontSize: small ? "0.6rem" : "0.65rem",
        letterSpacing: "0.14em", textTransform: "uppercase",
        padding: small ? "10px 20px" : "12px 26px",
        cursor: "pointer",
        borderRadius: 4,
        width: fullWidth ? "100%" : "auto",
        transition: "all .22s ease",
        boxShadow: !outline && hov ? "0 6px 20px rgba(85,115,75,0.4)" : "none",
        whiteSpace: "nowrap",
      }}>
      {children}
    </button>
  );
}

/* ══════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════ */
function Navbar({ onEnquire }) {
  const bp = useBreakpoint();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = (!bp.isDesktop && open) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open, bp.isDesktop]);

  useEffect(() => { if (bp.isDesktop && open) setOpen(false); }, [bp.isDesktop]);

  const links = ["Story", "Gallery", "Amenities", "Price List", "Location"];

  const logoSize = scrolled
    ? (bp.isXs ? 100 : 120)
    : (bp.isXs ? 120 : bp.isMobile ? 140 : 160);

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "none",
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
        transition: "all .4s ease",
      }}>
        <div style={{
          maxWidth: 1400, margin: "0 auto",
          padding: bp.isXs ? "0 0.875rem" : `0 ${hPad(bp)}`,
          height: scrolled ? 64 : (bp.isMobile ? 72 : 84),
          display: "flex", alignItems: "center", justifyContent: "space-between",
          transition: "height .4s ease",
          gap: 12,
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <img
              src="/logo2.png"
              alt="Residential Plots"
              style={{ width: logoSize, height: logoSize, objectFit: "contain", transition: "all .4s" }}
              onError={e => { e.currentTarget.style.display = "none"; }}
            />
          </div>

          {/* Desktop links */}
          {bp.isDesktop && (
            <div style={{ display: "flex", gap: bp.isLg ? "1.5rem" : "2.25rem", alignItems: "center" }}>
              {links.map(l => (
                <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`}
                  style={{
                    fontFamily: "var(--sans)", fontSize: ".7rem", fontWeight: 500,
                    letterSpacing: ".06em", color: scrolled ? "var(--navy)" : "#fff",
                    textDecoration: "none", transition: "color .2s", whiteSpace: "nowrap"
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--green)"}
                  onMouseLeave={e => e.currentTarget.style.color = scrolled ? "var(--navy)" : "#fff"}
                >{l}</a>
              ))}
            </div>
          )}

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {bp.isDesktop && <GreenBtn onClick={onEnquire} small>Enquire Now</GreenBtn>}
            {!bp.isDesktop && (
              <button
                onClick={() => setOpen(v => !v)}
                aria-label={open ? "Close menu" : "Open menu"}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  background: open ? "var(--navy)" : (scrolled ? "var(--navy)" : "rgba(255,255,255,0.18)"),
                  backdropFilter: "blur(8px)",
                  border: `1.5px solid ${open ? "var(--navy)" : (scrolled ? "var(--navy)" : "rgba(255,255,255,0.35)")}`,
                  borderRadius: 50,
                  padding: bp.isXs ? "6px 12px 6px 9px" : "7px 14px 7px 10px",
                  cursor: "pointer",
                  transition: "all .3s ease",
                  minHeight: 36,
                }}>
                <div style={{ width: 16, height: 16, position: "relative", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  {[0, 1, 2].map(idx => (
                    <span key={idx} style={{
                      position: "absolute",
                      left: 0,
                      width: idx === 1 ? (open ? 0 : "75%") : "100%",
                      height: 2, borderRadius: 2, background: "#fff",
                      top: idx === 0 ? (open ? "50%" : "20%") : idx === 1 ? "50%" : (open ? "50%" : "80%"),
                      transform: idx === 0 ? (open ? "rotate(45deg) translateY(-50%)" : "none")
                        : idx === 1 ? "translateY(-50%)"
                        : (open ? "rotate(-45deg) translateY(50%)" : "none"),
                      opacity: idx === 1 && open ? 0 : 1,
                      transition: "all .3s ease"
                    }} />
                  ))}
                </div>
                <span style={{ fontFamily: "var(--sans)", fontSize: ".58rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#fff" }}>{open ? "Close" : "Menu"}</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {!bp.isDesktop && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99,
          background: "#fff",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.25rem",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transform: open ? "translateY(0)" : "translateY(-10px)",
          transition: "opacity .35s ease, transform .35s ease",
          padding: "2rem 1.5rem",
          overflowY: "auto",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(to right, var(--navy), var(--green))" }} />
          {links.map((l, i) => (
            <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`} onClick={() => setOpen(false)}
              style={{
                fontFamily: "var(--serif)",
                fontSize: bp.isTablet ? "2.2rem" : bp.isXs ? "1.6rem" : "1.9rem",
                fontWeight: 500, color: "var(--navy)", textDecoration: "none",
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(14px)",
                transition: `opacity .4s ${0.04 + i * 0.06}s ease, transform .4s ${0.04 + i * 0.06}s ease`,
                display: "flex", alignItems: "center", gap: 10,
              }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block", flexShrink: 0 }} />
              {l}
            </a>
          ))}
          <div style={{ width: 40, height: 2, background: "var(--border)", borderRadius: 1, margin: "2px 0" }} />
          <GreenBtn onClick={() => { setOpen(false); onEnquire(); }}>Book a Site Visit</GreenBtn>
          <a href="tel:+919205974843" style={{ fontFamily: "var(--sans)", fontSize: ".72rem", color: "var(--text-muted)", textDecoration: "none", marginTop: 4 }}>+91 9205974843</a>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════ */
function Hero({ onEnquire }) {
  const bp = useBreakpoint();
  const [slide, setSlide] = useState(0);
  const slides = [
    "https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg",
    "https://images.pexels.com/photos/7031607/pexels-photo-7031607.jpeg",
    "/banner/9.png"
  ];

  useEffect(() => {
    const t = setInterval(() => setSlide(p => (p + 1) % 3), 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      className="hero-section"
      style={{ position: "relative", height: "100svh", minHeight: bp.isXs ? 520 : 580, overflow: "hidden" }}
    >
      {slides.map((src, i) => (
        <div key={i} style={{ position: "absolute", inset: 0, opacity: i === slide ? 1 : 0, transition: "opacity 1.5s ease" }}>
          <img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", transform: i === slide ? "scale(1.04)" : "scale(1)", transition: "transform 6.5s ease-out" }} alt="" />
        </div>
      ))}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.45) 35%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.18) 100%)" }} />

      {/* Slide dots */}
      <div style={{ position: "absolute", bottom: bp.isXs ? "1.25rem" : "1.75rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 5 }}>
        {[0, 1, 2].map(i => (
          <button key={i} onClick={() => setSlide(i)}
            style={{ width: i === slide ? 24 : 7, height: 7, borderRadius: 4, background: i === slide ? "#fff" : "rgba(255,255,255,0.4)", border: "none", cursor: "pointer", padding: 0, transition: "all .4s", minWidth: 7 }} />
        ))}
      </div>

      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: bp.isXs ? "72px 1rem 80px" : bp.isMobile ? "80px 1.25rem 80px" : "90px 2rem 80px",
        textAlign: "center", zIndex: 2,
      }}>
        <div style={{ animation: "fadeUp 1.1s .2s both", width: "100%", maxWidth: 1100 }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            marginBottom: bp.isXs ? 10 : bp.isMobile ? 14 : 20,
            background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)",
            padding: bp.isXs ? "5px 12px" : "6px 16px", borderRadius: 24,
            flexWrap: "wrap", justifyContent: "center",
          }}>
            {/* <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", flexShrink: 0 }} /> */}
            <span style={{
              fontFamily: "var(--sans)", fontSize: bp.isXs ? ".55rem" : ".6rem",
              letterSpacing: ".16em", textTransform: "uppercase", color: "#fff", fontWeight: 500,
              lineHeight: 1.4,
            }}>Sector 22D, Yamuna Expressway · Only 365 Exclusive Plots</span>
          </div>

          <h1 style={{
            fontFamily: "var(--serif)", fontWeight: 600,
            fontSize: bp.isXs ? "2rem" : bp.isMobile ? "2.6rem" : bp.isTablet ? "3.6rem" : "clamp(4rem,7vw,7rem)",
            color: "#fff", lineHeight: 1.05, letterSpacing: ".02em",
            marginBottom: bp.isXs ? 12 : bp.isMobile ? 14 : 24,
            textShadow: "0 4px 24px rgba(7,49,90,0.4)",
          }}>
            Build Your Dream.<br />Own Your Land.
          </h1>

          <p style={{
            fontFamily: "var(--sans)",
            fontSize: bp.isXs ? ".72rem" : bp.isMobile ? ".78rem" : ".88rem",
            fontWeight: 400, color: "rgba(255,255,255,0.85)",
            maxWidth: bp.isXs ? "100%" : 500, margin: "0 auto",
            lineHeight: 1.75, marginBottom: bp.isXs ? 18 : bp.isMobile ? 20 : 34,
            padding: "0 0.25rem",
          }}>
            Premium residential plots from 150 sq. yd. to 500 sq. yd. across 68 acres of green landscape. Freehold. YEIDA Approved. Just 15 min from Jewar Airport.
          </p>

          {/* Enquiry form */}
          <div style={{ maxWidth: bp.isXs ? "100%" : bp.isMobile ? 360 : 680, margin: "0 auto" }}>
            {bp.isMobile ? (
              <div style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(20px)", borderRadius: 8, overflow: "hidden", boxShadow: "0 20px 60px rgba(7,49,90,0.3)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                  {[{ label: "Name", ph: "Full Name" }, { label: "Phone", ph: "+91 00000 00000" }].map((f, i) => (
                    <div key={i} style={{ padding: "12px 14px", borderRight: i === 0 ? "1px solid var(--border)" : "none", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ fontFamily: "var(--sans)", fontSize: ".5rem", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--green)", fontWeight: 600, marginBottom: 4 }}>{f.label}</div>
                      <input placeholder={f.ph} style={{ background: "transparent", border: "none", outline: "none", color: "var(--navy)", fontFamily: "var(--sans)", fontSize: ".78rem", width: "100%", fontWeight: 500 }} />
                    </div>
                  ))}
                </div>
                <button onClick={onEnquire} style={{ width: "100%", padding: "13px", background: "var(--green)", border: "none", color: "#fff", fontFamily: "var(--sans)", fontSize: ".62rem", fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", cursor: "pointer" }}>
                  Get Brochure & Price List
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", background: "rgba(255,255,255,0.96)", backdropFilter: "blur(20px)", borderRadius: 8, overflow: "hidden", boxShadow: "0 24px 60px rgba(7,49,90,0.3)" }}>
                {[{ label: "Name", ph: "Full Name" }, { label: "Phone", ph: "+91 00000 00000" }, { label: "Email", ph: "you@email.com" }].map((f, i) => (
                  <div key={i} style={{ padding: "13px 16px", borderRight: "1px solid var(--border)", minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--sans)", fontSize: ".5rem", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--green)", fontWeight: 600, marginBottom: 4 }}>{f.label}</div>
                    <input placeholder={f.ph} style={{ background: "transparent", border: "none", outline: "none", color: "var(--navy)", fontFamily: "var(--sans)", fontSize: ".78rem", width: "100%", fontWeight: 500 }} />
                  </div>
                ))}
                <button onClick={onEnquire} style={{ background: "var(--green)", border: "none", color: "#fff", fontFamily: "var(--sans)", fontSize: ".6rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "0 20px", cursor: "pointer", whiteSpace: "nowrap", transition: "background .2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#3e5836"}
                  onMouseLeave={e => e.currentTarget.style.background = "var(--green)"}>
                  Enquire →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   STORY SECTION
══════════════════════════════════════════════════════ */
function StorySection() {
  const bp = useBreakpoint();
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: .1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="story" ref={ref} style={{ background: "#fff", padding: `${vPad(bp)} 0`, overflow: "hidden" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: `0 ${hPad(bp)}` }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderTop: "2px solid var(--navy)", borderBottom: "1px solid var(--border)",
          padding: "0.625rem 0", marginBottom: bp.isMobile ? "2rem" : "3rem",
          flexWrap: "wrap", gap: "0.5rem"
        }}>
          <Eyebrow label="Our Story" />
          <span style={{ fontFamily: "var(--sans)", fontSize: ".58rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 500 }}>
            Sector 22D · Yamuna Expressway · Greater Noida
          </span>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: bp.isDesktop ? "1fr 1fr" : "1fr",
          gap: bp.isDesktop ? "4rem" : "2.5rem",
          alignItems: "start",
        }}>
          {/* Image */}
          <div style={{ order: bp.isDesktop ? 1 : 2, position: "relative" }}>
            <div style={{
              width: "100%",
              paddingBottom: bp.isXs ? "80%" : "110%",
              position: "relative", borderRadius: 4, overflow: "hidden",
              boxShadow: "0 24px 60px rgba(7,49,90,0.18)",
            }}>
              <img
                src="https://images.pexels.com/photos/31425035/pexels-photo-31425035.jpeg"
                alt="residential-Estate Plots"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(7,49,90,0.55) 0%, transparent 55%)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.5rem 1.5rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: bp.isXs ? "2.2rem" : "2.8rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>68</div>
                  <div style={{ fontFamily: "var(--sans)", fontSize: ".55rem", letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", fontWeight: 600, marginTop: 3 }}>Acres · Green Landscape</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: 6, padding: "8px 14px", textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: ".95rem", fontWeight: 600, color: "#fff" }}>YEIDA</div>
                  <div style={{ fontFamily: "var(--sans)", fontSize: ".46rem", letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginTop: 2 }}>Approved</div>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div style={{ order: bp.isDesktop ? 2 : 1 }}>
            <h2 style={{
              fontFamily: "var(--serif)",
              fontSize: bp.isXs ? "1.75rem" : bp.isMobile ? "2.2rem" : "clamp(2.2rem,3.5vw,3.6rem)",
              fontWeight: 600, color: "var(--navy)", lineHeight: 1.06, marginBottom: "1.5rem"
            }}>
              68 Acres of Green.<br />365 Exclusive Plots.
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
              <div style={{ width: 36, height: 2, background: "var(--green)", borderRadius: 1 }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", opacity: 0.5 }} />
              <div style={{ width: 18, height: 2, background: "var(--green)", borderRadius: 1, opacity: 0.35 }} />
            </div>
            <p style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".8rem" : ".86rem", color: "var(--text-muted)", lineHeight: 1.9, marginBottom: "1rem" }}>
              Experience the perfect blend of modern living, prime location, and excellent investment potential. Ideally situated in Sector 22D, Greater Noida, along the rapidly developing Yamuna Expressway, residential-Estate Plots offers a unique opportunity to build your dream home in a well-planned, future-ready neighbourhood.
            </p>
            <p style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".77rem" : ".82rem", color: "var(--text-dim)", lineHeight: 1.9 }}>
              Designed for modern lifestyles — world-class amenities, excellent connectivity, and a vibrant community for an elevated living experience.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   QUOTE BANNER
══════════════════════════════════════════════════════ */
function QuoteBanner() {
  const bp = useBreakpoint();
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const stats = [
    { val: "211%", label: "3-Year Appreciation", sub: "Sector 22D, Yamuna Expressway" },
    { val: "44%", label: "Annual Growth", sub: "Last 12 months" },
    { val: "2030", label: "Jewar Airport", sub: "Operational Timeline" },
    { val: "₹7K+", label: "Per Sq.Ft Rate", sub: "Current market avg." },
  ];

  return (
    <div ref={ref} style={{ position: "relative", overflow: "hidden", background: "#fff" }}>
      <div style={{ height: 4, background: "linear-gradient(to right, var(--navy) 0%, var(--navy) 50%, var(--green) 100%)" }} />
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: bp.isXs ? "2.5rem 1rem" : `3rem ${hPad(bp)}` }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: bp.isMobile ? "1fr" : bp.isTablet ? "1fr" : "1fr 1fr",
          gap: bp.isMobile ? "2.5rem" : "5rem",
          alignItems: "center"
        }}>
          {/* Quote */}
          <div style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)", transition: "opacity 1s ease, transform 1s ease", position: "relative" }}>
            <div style={{ position: "absolute", top: -16, left: -8, fontFamily: "var(--display)", fontSize: bp.isXs ? "7rem" : "10rem", lineHeight: 1, color: "var(--navy-pale)", fontWeight: 600, pointerEvents: "none", userSelect: "none", zIndex: 0 }}>"</div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
                <div style={{ width: 3, height: 36, background: "var(--navy)", borderRadius: 2, flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--sans)", fontSize: ".56rem", letterSpacing: ".28em", textTransform: "uppercase", color: "var(--navy)", fontWeight: 700 }}>Investment Insight</span>
              </div>
              <blockquote style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: bp.isXs ? "1.6rem" : bp.isMobile ? "1.9rem" : "clamp(2.1rem,3.2vw,3rem)", fontWeight: 600, color: "var(--navy)", lineHeight: 1.2, marginBottom: "1.5rem" }}>
                "The Yamuna Expressway<br /><span style={{ color: "var(--navy)" }}>is not a location —</span><br />it is a legacy."
              </blockquote>
              <p style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".76rem" : ".82rem", color: "var(--text-muted)", lineHeight: 1.9, maxWidth: 420, marginBottom: "1.5rem" }}>
                With Jewar International Airport, the Formula 1 Circuit at Buddh, and the proposed UP Film City all within 15 km — land here has already appreciated 211% in three years.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["Jewar Airport", "F1 Circuit", "UP Film City", "YEIDA Approved", "RERA Registered"].map(tag => (
                  <span key={tag} style={{ fontFamily: "var(--sans)", fontSize: ".55rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", padding: "5px 11px", borderRadius: 3, border: "1.5px solid var(--border)", color: "var(--text-muted)" }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, opacity: vis ? 1 : 0, transition: "opacity .8s .2s ease" }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                background: i === 0 ? "var(--navy)" : i === 1 ? "var(--gold-pale)" : i === 2 ? "var(--green-pale)" : "var(--navy-pale)",
                padding: bp.isXs ? "1.5rem 1.1rem" : "2rem 1.75rem",
                position: "relative", overflow: "hidden",
                opacity: vis ? 1 : 0, transform: vis ? "none" : "scale(0.96)",
                transition: `opacity .6s ${0.15 + i * 0.1}s ease, transform .6s ${0.15 + i * 0.1}s ease`,
              }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: 34, height: 34, borderLeft: `1px solid ${i === 0 ? "rgba(255,255,255,0.15)" : "var(--border)"}`, borderBottom: `1px solid ${i === 0 ? "rgba(255,255,255,0.15)" : "var(--border)"}` }} />
                <div style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: bp.isXs ? "1.8rem" : "2.4rem", fontWeight: 700, color: i === 0 ? "#fff" : i === 1 ? "#b8891a" : i === 2 ? "var(--green)" : "var(--navy)", lineHeight: 1, marginBottom: ".4rem" }}>{s.val}</div>
                <div style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".58rem" : ".65rem", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: i === 0 ? "rgba(255,255,255,0.9)" : "var(--navy)", marginBottom: ".15rem" }}>{s.label}</div>
                <div style={{ fontFamily: "var(--sans)", fontSize: ".56rem", fontWeight: 400, color: i === 0 ? "rgba(255,255,255,0.45)" : "var(--text-dim)" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ height: 2, background: "var(--border)" }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   GALLERY SECTION
══════════════════════════════════════════════════════ */
function GallerySection({ onEnquire }) {
  const bp = useBreakpoint();
  const [hov, setHov] = useState(null);

  const imgs = [
    { src: "https://images.pexels.com/photos/1571457/pexels-photo-1571457.jpeg", label: "Landscaped Green Spaces" },
    { src: "https://images.pexels.com/photos/2631746/pexels-photo-2631746.jpeg", label: "Clubhouse Interiors" },
    { src: "https://images.pexels.com/photos/6283972/pexels-photo-6283972.jpeg", label: "Modern Amenities" },
    { src: "https://i.pinimg.com/1200x/86/0a/36/860a36fcfd841b18380dc31e59eaa936.jpg", label: "Community Clubhouse" },
    { src: "https://i.pinimg.com/736x/f5/1f/7f/f51f7fc715dc82a294988023345c444a.jpg", label: "Swimming Pool Deck" },
  ];

  // Responsive grid config
  let gridItems, cols, rowDef;
  if (bp.isXs) {
    // Single column stack
    gridItems = imgs.map((img, i) => ({ ...img, col: "1/2", row: `${i + 1}/${i + 2}` }));
    cols = "1fr"; rowDef = "repeat(5,200px)";
  } else if (bp.isMobile) {
    gridItems = [
      { ...imgs[0], col: "1/3", row: "1/2" },
      { ...imgs[1], col: "1/2", row: "2/3" },
      { ...imgs[2], col: "2/3", row: "2/3" },
      { ...imgs[3], col: "1/2", row: "3/4" },
      { ...imgs[4], col: "2/3", row: "3/4" },
    ];
    cols = "1fr 1fr"; rowDef = "200px 180px 180px";
  } else if (bp.isTablet) {
    gridItems = [
      { ...imgs[0], col: "1/3", row: "1/2" },
      { ...imgs[1], col: "1/2", row: "2/3" },
      { ...imgs[2], col: "2/3", row: "2/3" },
      { ...imgs[3], col: "1/2", row: "3/4" },
      { ...imgs[4], col: "2/3", row: "3/4" },
    ];
    cols = "1fr 1fr"; rowDef = "240px 220px 220px";
  } else {
    gridItems = [
      { ...imgs[0], col: "1/3", row: "1/3" },
      { ...imgs[1], col: "3/4", row: "1/2" },
      { ...imgs[2], col: "3/4", row: "2/3" },
      { ...imgs[3], col: "1/3", row: "3/4" },
      { ...imgs[4], col: "3/4", row: "3/4" },
    ];
    cols = "repeat(3,1fr)"; rowDef = "repeat(3,240px)";
  }

  return (
    <section id="gallery" style={{ padding: `${vPad(bp)} 0`, background: "var(--off-white)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: `0 ${hPad(bp)}` }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
            <div>
              <Eyebrow label="Gallery" />
              <h2 style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? "1.6rem" : "clamp(1.8rem,4vw,3rem)", fontWeight: 600, color: "var(--navy)", lineHeight: 1.1 }}>Life at residential-Estate Plots</h2>
            </div>
            <GreenBtn onClick={onEnquire} outline small>View All →</GreenBtn>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: cols, gridTemplateRows: rowDef, gap: 5, borderRadius: 8, overflow: "hidden" }}>
          {gridItems.map((img, i) => (
            <div key={i} style={{ gridColumn: img.col, gridRow: img.row, position: "relative", overflow: "hidden", cursor: "pointer" }}
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
              <img src={img.src} alt={img.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .7s cubic-bezier(.16,1,.3,1)", transform: hov === i ? "scale(1.07)" : "scale(1)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)", transition: "background .4s ease" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: bp.isXs ? "10px 12px" : "13px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? ".78rem" : ".95rem", fontWeight: 500, color: "#fff", textShadow: "0 1px 6px rgba(0,0,0,0.5)", lineHeight: 1.2, flexShrink: 1, minWidth: 0 }}>{img.label}</span>
                <button onClick={e => { e.stopPropagation(); onEnquire(); }} style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".5rem" : ".58rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#fff", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(10px)", border: "1.5px solid rgba(255,255,255,0.55)", padding: bp.isXs ? "4px 9px" : "6px 12px", borderRadius: 4, cursor: "pointer", transition: "all .25s ease", whiteSpace: "nowrap", flexShrink: 0 }}>Enquire →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   AMENITIES SECTION
══════════════════════════════════════════════════════ */
function AmenitiesSection() {
  const bp = useBreakpoint();
  const [activeTab, setActiveTab] = useState(0);
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.04 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const categories = [
    { label: "Green & Open", color: "#3a6b44", bg: "#eef5eb", items: [
      { title: "Landscaped Green Belt", desc: "80% open green area with tree-lined avenues, lush parks and dedicated jogging tracks woven throughout the community." },
      { title: "Meditation & Yoga Lawn", desc: "Serene open-air lawns for morning meditation, yoga sessions and community wellness activities." },
      { title: "Rainwater Harvesting", desc: "Integrated storm-water drains and eco-friendly recharge pits across the township for sustainable water management." },
    ]},
    { label: "Recreation", color: "#1a4a6b", bg: "#e8f0f8", items: [
      { title: "Swimming Pool", desc: "Full-size outdoor pool with splash zone, sundecks and cabanas for residents of all ages." },
      { title: "Modern Gymnasium", desc: "Fully-equipped fitness centre with cardio, strength training and a dedicated yoga studio." },
      { title: "Grand Clubhouse", desc: "Luxurious clubhouse with multi-purpose halls, indoor games, café, and event spaces for the community." },
    ]},
    { label: "Infrastructure", color: "#3a6b44", bg: "#fdf8ee", items: [
      { title: "Underground Utilities", desc: "All electrical, water, drainage and telecom infrastructure laid underground — clutter-free streetscape." },
      { title: "Wide Internal Roads", desc: "9m to 24m wide asphalted roads with street lighting and dedicated pedestrian walkways throughout." },
      { title: "24hr Water Supply", desc: "Dedicated overhead reservoirs and underground sump ensuring uninterrupted water supply for every plot." },
    ]},
    { label: "Safety", color: "#1a4a6b", bg: "#fdf0f0", items: [
      { title: "24/7 Gated Security", desc: "CCTV surveillance, boom barriers, biometric access and dedicated security personnel around the clock." },
      { title: "Schools & Retail Zone", desc: "Earmarked zones for schools, supermarket anchor, cafes and daily-use essential retail." },
      { title: "Dedicated Parking", desc: "Surface parking plazas near the clubhouse, retail strip and park entrances for residents and visitors." },
    ]},
  ];

  const cat = categories[activeTab];

  return (
    <section id="amenities" ref={ref} style={{ padding: `${vPad(bp)} 0`, background: "var(--off-white)", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: `0 ${hPad(bp)}` }}>
        <Reveal>
          <div style={{ display: "grid", gridTemplateColumns: bp.isDesktop ? "1fr 1fr" : "1fr", gap: "1.5rem", marginBottom: "2.5rem", alignItems: "end" }}>
            <div>
              <Eyebrow label="Amenities" />
              <h2 style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? "1.6rem" : "clamp(1.8rem,4vw,3.2rem)", fontWeight: 600, color: "var(--navy)", lineHeight: 1.05 }}>
                World-Class<br />Living Standards
              </h2>
            </div>
            <p style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".78rem" : ".86rem", color: "var(--text-muted)", lineHeight: 1.9, maxWidth: 420 }}>
              Every amenity has been designed not just for today's resident — but for their children and grandchildren. Infrastructure-first. Green-first. Community-first.
            </p>
          </div>
        </Reveal>

        {/* Tabs */}
        <div style={{
          display: "grid", gridTemplateColumns: `repeat(${categories.length}, 1fr)`, gap: 3,
          marginBottom: bp.isMobile ? "1.25rem" : "2rem",
          opacity: vis ? 1 : 0, transition: "opacity .7s ease",
        }}>
          {categories.map((c, i) => (
            <button key={i} onClick={() => setActiveTab(i)}
              style={{
                background: activeTab === i ? cat.color : "#fff",
                border: `2px solid ${activeTab === i ? cat.color : "var(--border)"}`,
                borderRadius: 5, padding: bp.isXs ? "8px 4px" : "12px 8px",
                cursor: "pointer", transition: "all .3s ease",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                minHeight: 40,
              }}>
              <span style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".48rem" : ".58rem", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: activeTab === i ? "#fff" : "var(--text-muted)", transition: "color .3s", lineHeight: 1.3, textAlign: "center" }}>{c.label}</span>
            </button>
          ))}
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: bp.isXs ? "1fr" : bp.isMobile ? "1fr" : bp.isTablet ? "1fr 1fr" : "1fr 1fr 1fr", gap: 4, opacity: vis ? 1 : 0, transition: "opacity .6s .1s ease" }}>
          {cat.items.map((item, i) => (
            <div key={`${activeTab}-${i}`}
              className="hover-lift"
              style={{ background: "#fff", borderRadius: 8, overflow: "hidden", border: `2px solid ${cat.bg}`, animation: "amenitySlide .35s ease both", animationDelay: `${i * 0.08}s`, boxShadow: "var(--shadow-sm)", transition: "all .3s ease" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}>
              <div style={{ height: 4, background: cat.color }} />
              <div style={{ padding: bp.isXs ? "1.25rem" : "1.75rem" }}>
                <h4 style={{ fontFamily: "var(--serif)", fontSize: "1rem", fontWeight: 600, color: "var(--navy)", marginBottom: ".6rem", lineHeight: 1.2 }}>{item.title}</h4>
                <p style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".74rem" : ".78rem", color: "var(--text-muted)", lineHeight: 1.75 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: bp.isXs ? "1fr 1fr" : "repeat(4, 1fr)", gap: 2 }}>
            {[
              { num: "12+", label: "World-Class Amenities" },
              { num: "80%", label: "Open Green Space" },
              { num: "Luxury", label: "Clubhouse" },
              { num: "24/7", label: "Security Coverage" }
            ].map((s, i) => (
              <div key={i} style={{ background: i === 0 ? "var(--navy)" : "#fff", border: "2px solid var(--border)", padding: bp.isXs ? "1.1rem" : "1.4rem", display: "flex", flexDirection: "column", gap: 4, borderRadius: 5 }}>
                <div style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: bp.isXs ? "1.5rem" : "1.9rem", fontWeight: 700, color: i === 0 ? "#fff" : "var(--navy)", lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".5rem" : ".58rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: i === 0 ? "rgba(255,255,255,0.6)" : "var(--text-dim)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   FLOOR PLAN / PLOT SIZES
══════════════════════════════════════════════════════ */
function FloorPlanSection({ onEnquire }) {
  const bp = useBreakpoint();
  const [active, setActive] = useState(0);
  const [hov, setHov] = useState(null);
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.06 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const plots = [
    { title: "150 sq.yd", sqft: "1,350 sq.ft", dims: "30 × 45 ft", facing: "East / North", road: "9 m Road Facing", tag: "Entry", tagColor: "#3a6b44", desc: "Compact freehold plots ideal for first-time buyers and investors. Perfect for building a comfortable 2–3 storey home with parking in a gated community.", highlights: ["Gated Community", "Corner plots available", "100% freehold title"], img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=700&q=80" },
    { title: "200 sq.yd", sqft: "1,800 sq.ft", dims: "40 × 45 ft", facing: "East / West / North", road: "12 m Road Facing", tag: "Popular", tagColor: "#2c5d7a", desc: "Mid-size plots on wider roads with park-facing options. Build your 3–4 bedroom dream home with a private garden and ample garage space.", highlights: ["Wider road access", "Park-facing options", "Best resale value"], img: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=700&q=80" },
    { title: "300 sq.yd", sqft: "2,700 sq.ft", dims: "50 × 54 ft", facing: "All Orientations", road: "18 m Road Facing", tag: "Premium", tagColor: "#3a6b44", desc: "Spacious premium plots on 18m arterial roads. Ideal for bungalow construction with landscaped lawns, double garage and home-office space.", highlights: ["18m arterial road", "Double garage possible", "Clubhouse proximity"], img: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=700&q=80" },
    { title: "500 sq.yd", sqft: "4,500 sq.ft", dims: "60 × 75 ft", facing: "All Orientations", road: "24 m Boulevard", tag: "Ultra Premium", tagColor: "#2c5d7a", desc: "Boulevard-facing grand plots for estate-scale construction. Build a true villa with multiple structures, private pool and manicured gardens.", highlights: ["Boulevard facing", "Villa / estate scale", "Highest appreciation"], img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=700&q=80" },
  ];

  const p = plots[active];

  return (
    <section id="floor-plans" ref={ref} style={{ padding: `${vPad(bp)} 0`, background: "#f5f0e8", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(7,49,90,0.05) 1px, transparent 1px)", backgroundSize: "26px 26px", pointerEvents: "none" }} />
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: `0 ${hPad(bp)}`, position: "relative", zIndex: 1 }}>
        <Reveal>
          <div style={{ display: "flex", flexDirection: "column", marginBottom: bp.isMobile ? "1.75rem" : "2.5rem", gap: ".5rem" }}>
            <Eyebrow label="Plot Configurations" />
            <h2 style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? "1.6rem" : "clamp(1.8rem,4vw,3.2rem)", fontWeight: 600, color: "var(--navy)", lineHeight: 1.1 }}>Choose Your Plot Size</h2>
            <p style={{ fontFamily: "var(--sans)", fontSize: ".8rem", color: "var(--text-muted)", lineHeight: 1.8 }}>150 to 500 sq.yd — freehold, YEIDA approved, across 68 acres.</p>
          </div>
        </Reveal>

        {/* Plot size tabs */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${plots.length}, 1fr)`, gap: 3, marginBottom: 3 }}>
          {plots.map((pl, i) => (
            <button key={i} onClick={() => setActive(i)} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              style={{ background: active === i ? pl.tagColor : (hov === i ? "rgba(7,49,90,0.06)" : "#fff"), border: `2px solid ${active === i ? pl.tagColor : "rgba(7,49,90,0.12)"}`, borderRadius: 5, padding: bp.isXs ? "9px 4px" : "12px 8px", cursor: "pointer", transition: "all .3s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <span style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? ".75rem" : bp.isMobile ? ".85rem" : ".95rem", fontWeight: 600, color: active === i ? "#fff" : "var(--navy)", transition: "color .3s", textAlign: "center", lineHeight: 1.2 }}>{pl.title}</span>
              <span style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".44rem" : ".5rem", letterSpacing: ".08em", textTransform: "uppercase", color: active === i ? "rgba(255,255,255,0.8)" : "var(--text-dim)", fontWeight: 600, transition: "color .3s" }}>{pl.tag}</span>
            </button>
          ))}
        </div>

        {/* Detail card */}
        <div style={{ display: "grid", gridTemplateColumns: bp.isMobile ? "1fr" : "1fr 1.35fr", gap: 3, borderRadius: 8, overflow: "hidden", opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)", transition: "opacity .8s ease, transform .8s ease", boxShadow: "0 16px 50px rgba(7,49,90,0.12)" }}>
          {/* Left info panel */}
          <div style={{ background: "#fffdf7", padding: bp.isXs ? "1.5rem" : "2.25rem", borderRight: bp.isMobile ? "none" : "2px solid rgba(7,49,90,0.08)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: "1.25rem", background: `${p.tagColor}18`, border: `1.5px solid ${p.tagColor}44`, borderRadius: 20, padding: "5px 12px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.tagColor, flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--sans)", fontSize: ".55rem", letterSpacing: ".16em", textTransform: "uppercase", color: p.tagColor, fontWeight: 700 }}>{p.tag}</span>
            </div>
            <h3 style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: bp.isXs ? "2rem" : "2.8rem", fontWeight: 600, color: "var(--navy)", lineHeight: 1, marginBottom: ".2rem" }}>{p.title}</h3>
            <div style={{ fontFamily: "var(--sans)", fontSize: ".72rem", color: "var(--text-dim)", marginBottom: "1.25rem", fontWeight: 500 }}>{p.sqft} · {p.dims}</div>
            <p style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".76rem" : ".78rem", color: "var(--text-muted)", lineHeight: 1.85, marginBottom: "1.5rem" }}>{p.desc}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem", marginBottom: "1.5rem" }}>
              {[["🧭", "Facing", p.facing], ["🛣️", "Road Width", p.road]].map(([icon, label, val]) => (
                <div key={label} style={{ background: "#f5f0e8", borderRadius: 7, padding: "10px 12px", border: "1.5px solid rgba(7,49,90,0.08)" }}>
                  <div style={{ fontFamily: "var(--sans)", fontSize: ".48rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 600, marginBottom: 3 }}>{label}</div>
                  <div style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".68rem" : ".72rem", color: "var(--navy)", fontWeight: 600, lineHeight: 1.3 }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              {p.highlights.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: ".5rem" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: `${p.tagColor}20`, border: `1.5px solid ${p.tagColor}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: p.tagColor, fontSize: ".5rem", fontWeight: 700 }}>✓</span>
                  </div>
                  <span style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".7rem" : ".74rem", color: "var(--text-muted)" }}>{h}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "2px solid rgba(7,49,90,0.08)", paddingTop: "1.25rem" }}>
              <p style={{ fontFamily: "var(--sans)", fontSize: ".7rem", color: "var(--text-dim)", marginBottom: ".875rem", lineHeight: 1.7 }}>Contact our team for current pricing, payment plans, and availability.</p>
              <GreenBtn onClick={onEnquire} small>Enquire for Price</GreenBtn>
            </div>
          </div>
          {/* Image */}
          <div style={{ position: "relative", minHeight: bp.isMobile ? 220 : 0, overflow: "hidden" }}>
            {plots.map((pl, i) => (
              <div key={i} style={{ position: "absolute", inset: 0, opacity: active === i ? 1 : 0, transition: "opacity .7s ease" }}>
                <img src={pl.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={pl.title} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(7,49,90,0.38) 0%, transparent 60%)" }} />
              </div>
            ))}
            <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,253,247,0.93)", backdropFilter: "blur(10px)", border: `2px solid ${p.tagColor}44`, borderRadius: 6, padding: "7px 12px" }}>
              <div style={{ fontFamily: "var(--sans)", fontSize: ".48rem", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 2, fontWeight: 600 }}>Plot Size</div>
              <div style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: "1.3rem", fontWeight: 700, color: p.tagColor, lineHeight: 1 }}>{p.title}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   LOCATION ADVANTAGE
══════════════════════════════════════════════════════ */
function LocationAdvantageSection({ onEnquire }) {
  const bp = useBreakpoint();
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  const [hovCard, setHovCard] = useState(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.04 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const advantages = [
    { id: 0, badge: "Upcoming · 2030", title: "Noida International Airport", subtitle: "Jewar, Greater Noida", distance: "15 Min", distLabel: "Drive Away", desc: "Asia's largest upcoming airport — with 70M+ annual passenger capacity — is set to transform Yamuna Expressway into India's next aviation hub.", accent: "#1a4a6b", img: "https://images.pexels.com/photos/912050/pexels-photo-912050.jpeg", tags: ["₹29,560 Cr Investment", "4 Runways", "6 Terminals"] },
    { id: 1, badge: "Upcoming · UP Govt.", title: "UP Film City", subtitle: "Sector 21, Yamuna Expressway", distance: "6 Km", distLabel: "From Site", desc: "The proposed UP Film City — one of India's largest entertainment townships — will generate 1.5 lakh jobs and attract mega investments.", accent: "#3a6b44", img: "https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg", tags: ["1000 Acres", "1.5L Jobs", "₹10,000 Cr Project"] },
    { id: 2, badge: "Operational", title: "Buddh International Circuit", subtitle: "Greater Noida", distance: "8 Km", distLabel: "From Site", desc: "India's only FIA Grade 1 motorsport circuit — home of the Formula 1 Indian Grand Prix — drives tourism, hospitality, and infrastructure investment.", accent: "#8b1a1a", img: "https://images.pexels.com/photos/1191109/pexels-photo-1191109.jpeg", tags: ["F1 Grade 1", "5.14 Km Track", "Year-Round Events"] },
    { id: 3, badge: "Upcoming · 2028", title: "Olympic Village & Sports Park", subtitle: "Yamuna Expressway Corridor", distance: "12 Km", distLabel: "From Site", desc: "A world-class sports complex and proposed Olympic infrastructure — set to become a permanent legacy of international sporting events.", accent: "#7a5c1a", img: "https://images.pexels.com/photos/1750466/pexels-photo-1750466.jpeg", tags: ["Olympic Standard", "Multi-Sport", "Legacy Infrastructure"] },
  ];

  const cardCols = bp.isXs ? "1fr" : bp.isMobile ? "1fr" : bp.isTablet ? "1fr 1fr" : "repeat(4, 1fr)";

  return (
    <section id="location-advantage" ref={ref} style={{ padding: `${vPad(bp)} 0`, background: "var(--navy)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "30px 30px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(to right, var(--green), #c9a84c)" }} />

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: `0 ${hPad(bp)}`, position: "relative", zIndex: 1 }}>
        <Reveal>
          <div style={{ display: "grid", gridTemplateColumns: bp.isDesktop ? "1fr 1fr" : "1fr", gap: "2rem", marginBottom: bp.isMobile ? "2rem" : "3.5rem", alignItems: "end" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 28, height: 2, background: "var(--green)", borderRadius: 1 }} />
                <span style={{ fontFamily: "var(--sans)", fontSize: "0.58rem", letterSpacing: "0.26em", textTransform: "uppercase", fontWeight: 600, color: "var(--green)" }}>Location Advantage</span>
              </div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? "1.7rem" : bp.isMobile ? "2.2rem" : "clamp(2.4rem,4vw,4rem)", fontWeight: 600, color: "#fff", lineHeight: 1.06 }}>
                Surrounded by<br /><span style={{ color: "var(--green)" }}>India's Biggest</span><br />Investments.
              </h2>
            </div>
            <div>
              <p style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".76rem" : ".84rem", color: "rgba(255,255,255,0.52)", lineHeight: 1.9, marginBottom: "1.25rem" }}>
                No other residential location in India sits at the confluence of an international airport, a Formula 1 circuit, a proposed film city, and Olympic infrastructure — all within 15 km.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {["₹1 Lakh+ Crore Investments", "4 Mega Projects", "10–15 Km Radius"].map(tag => (
                  <span key={tag} style={{ fontFamily: "var(--sans)", fontSize: ".55rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", padding: "5px 12px", borderRadius: 3, border: "1.5px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.46)" }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: cardCols, gap: 4, opacity: vis ? 1 : 0, transition: "opacity .8s ease" }}>
          {advantages.map((adv, i) => (
            <div key={adv.id}
              onMouseEnter={() => setHovCard(i)}
              onMouseLeave={() => setHovCard(null)}
              style={{
                position: "relative", borderRadius: 8, overflow: "hidden", cursor: "pointer",
                opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(28px)",
                transition: `opacity .7s ${i * 0.1}s ease, transform .7s ${i * 0.1}s ease, box-shadow .3s ease`,
                boxShadow: hovCard === i ? "0 20px 50px rgba(0,0,0,0.5)" : "0 6px 20px rgba(0,0,0,0.3)",
              }}>
              <div style={{ position: "absolute", inset: 0 }}>
                <img src={adv.img} alt={adv.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .7s ease", transform: hovCard === i ? "scale(1.07)" : "scale(1)" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(4,22,40,0.97) 0%, rgba(4,22,40,0.72) 50%, rgba(4,22,40,0.28) 100%)" }} />
              </div>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: adv.accent }} />
              <div style={{ position: "relative", zIndex: 1, padding: bp.isXs ? "1.5rem 1.25rem" : "1.75rem 1.5rem", minHeight: bp.isXs ? 260 : bp.isMobile ? 280 : 380, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${adv.accent}55`, border: `1px solid ${adv.accent}88`, borderRadius: 12, padding: "3px 10px", marginBottom: ".6rem", alignSelf: "flex-start" }}>
                  <span style={{ fontFamily: "var(--sans)", fontSize: ".5rem", letterSpacing: ".12em", textTransform: "uppercase", color: "#fff", fontWeight: 600 }}>{adv.badge}</span>
                </div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? "1.1rem" : "1.2rem", fontWeight: 600, color: "#fff", lineHeight: 1.2, marginBottom: ".25rem" }}>{adv.title}</h3>
                <div style={{ fontFamily: "var(--sans)", fontSize: ".58rem", color: "rgba(255,255,255,0.42)", fontWeight: 500, marginBottom: ".75rem" }}>{adv.subtitle}</div>
                <p style={{ fontFamily: "var(--sans)", fontSize: ".7rem", color: "rgba(255,255,255,0.62)", lineHeight: 1.7, marginBottom: ".75rem", maxHeight: hovCard === i ? "200px" : "0px", overflow: "hidden", transition: "max-height .5s ease" }}>{adv.desc}</p>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {adv.tags.map(t => (
                    <span key={t} style={{ fontFamily: "var(--sans)", fontSize: ".48rem", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 3, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.65)" }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Reveal delay={0.3}>
          <div style={{
            marginTop: "2.5rem",
            background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 8,
            padding: bp.isXs ? "1.5rem 1.25rem" : bp.isMobile ? "1.5rem" : "1.5rem 2.25rem",
            display: "flex", flexDirection: bp.isMobile ? "column" : "row", alignItems: bp.isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: "1.25rem",
          }}>
            <div>
              <div style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? "1rem" : "1.3rem", fontWeight: 600, color: "#fff", marginBottom: ".25rem" }}>Own land at the centre of it all.</div>
              <div style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".62rem" : ".72rem", color: "rgba(255,255,255,0.4)" }}>Starting ₹1 Lakh/Gaj · Sector 22D, Yamuna Expressway · Only 365 Plots</div>
            </div>
            <GreenBtn onClick={onEnquire}>Enquire Now →</GreenBtn>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   LOCATION MAP SECTION
══════════════════════════════════════════════════════ */
function LocationSection() {
  const bp = useBreakpoint();
  const [activeGroup, setActiveGroup] = useState(0);
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.04 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const landmarkGroups = [
    { label: "Aviation & Transit", color: "#1a4a6b", items: [
      { name: "Jewar International Airport", dist: "15 min", time: "15 min" },
      { name: "Yamuna Expressway Entry/Exit", dist: "0.5 km", time: "2 min" },
      { name: "Eastern Peripheral Expressway", dist: "10 km", time: "12 min" },
    ]},
    { label: "Entertainment", color: "#3a6b44", items: [
      { name: "Buddh International F1 Circuit", dist: "8 km", time: "10 min" },
      { name: "Proposed UP Film City", dist: "6 km", time: "8 min" },
      { name: "Taj Mahal, Agra", dist: "150 km", time: "90 min" },
    ]},
    { label: "Education & Biz", color: "#1a4a6b", items: [
      { name: "Narayana Public School", dist: "3.6 km", time: "5 min" },
      { name: "Shri Dronacharya College", dist: "6.5 km", time: "9 min" },
      { name: "Greater Noida Industrial Area", dist: "14 km", time: "18 min" },
    ]},
  ];

  const activeG = landmarkGroups[activeGroup];

  return (
    <section id="location" ref={ref} style={{ padding: `${vPad(bp)} 0`, background: "#fff" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: `0 ${hPad(bp)}` }}>
        <Reveal>
          <div style={{ display: "grid", gridTemplateColumns: bp.isDesktop ? "1fr 1fr" : "1fr", gap: "2rem", marginBottom: "2.5rem", alignItems: "end" }}>
            <div>
              <Eyebrow label="Location" />
              <h2 style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? "1.6rem" : "clamp(1.8rem,4vw,3rem)", fontWeight: 600, color: "var(--navy)", lineHeight: 1.1 }}>India's Growth Corridor</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: ".875rem" }}>
              <p style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".76rem" : ".83rem", color: "var(--text-muted)", lineHeight: 1.9 }}>Plot TS-01B, Sector 22D, Yamuna Expressway, Greater Noida — strategically placed at the epicentre of UP's most ambitious development axis.</p>
              <div style={{ display: "flex", alignItems: "center", gap: 9, background: "var(--navy-pale)", borderRadius: 6, padding: "9px 14px", width: "fit-content", maxWidth: "100%" }}>
                <span style={{ fontSize: "1rem", flexShrink: 0 }}>📍</span>
                <span style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".62rem" : ".68rem", fontWeight: 600, color: "var(--navy)", lineHeight: 1.4 }}>Plot TS-01B, Sector 22D, Yamuna Expressway, Greater Noida — 201308</span>
              </div>
            </div>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: bp.isMobile ? "1fr" : bp.isTablet ? "1fr" : "1.4fr 1fr", gap: 4, opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(18px)", transition: "opacity .8s ease, transform .8s ease" }}>
          {/* Map */}
          <div style={{ borderRadius: 8, overflow: "hidden", boxShadow: "var(--shadow-lg)", border: "2px solid var(--border)" }}>
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112078.60!2d77.5600!3d28.3200!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce8b900000001%3A0x1!2sSector+22D+Yamuna+Expressway+Greater+Noida!5e0!3m2!1sen!2sin!4v1" width="100%" height={bp.isXs ? 220 : bp.isMobile ? 280 : 440} style={{ display: "block", border: "none" }} loading="lazy" title="Location" />
            <div style={{ background: "var(--navy)", padding: bp.isXs ? "0.875rem 1rem" : "0.875rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 7, height: 7, background: "var(--green)", borderRadius: "50%", boxShadow: "0 0 8px rgba(85,115,75,0.8)", animation: "pulse-ring 2s infinite", flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".6rem" : ".68rem", fontWeight: 600, color: "#fff" }}>Sector 22D, Yamuna Expressway, Greater Noida</span>
              </div>
              <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--sans)", fontSize: ".58rem", color: "rgba(255,255,255,0.45)", textDecoration: "none", fontWeight: 500, whiteSpace: "nowrap" }}>Open in Maps →</a>
            </div>
          </div>

          {/* Landmarks panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${landmarkGroups.length}, 1fr)`, gap: 3 }}>
              {landmarkGroups.map((g, i) => (
                <button key={i} onClick={() => setActiveGroup(i)}
                  style={{ background: activeGroup === i ? g.color : "#fff", border: `2px solid ${activeGroup === i ? g.color : "var(--border)"}`, borderRadius: 5, padding: bp.isXs ? "8px 4px" : "10px 5px", cursor: "pointer", transition: "all .3s", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minHeight: 36 }}>
                  <span style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".46rem" : ".52rem", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: activeGroup === i ? "#fff" : "var(--text-muted)", transition: "color .3s", textAlign: "center", lineHeight: 1.3 }}>{g.label}</span>
                </button>
              ))}
            </div>

            <div style={{ background: "#fff", border: "2px solid var(--border)", borderRadius: 7, overflow: "hidden", flex: 1 }}>
              <div style={{ background: activeG.color, padding: bp.isXs ? ".875rem 1.1rem" : ".875rem 1.25rem" }}>
                <div style={{ fontFamily: "var(--sans)", fontSize: ".54rem", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", fontWeight: 600, marginBottom: 2 }}>Nearby</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? ".95rem" : "1rem", fontWeight: 600, color: "#fff" }}>{activeG.label}</div>
              </div>
              {activeG.items.map((lm, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: bp.isXs ? ".875rem 1.1rem" : "1rem 1.25rem", borderBottom: i < activeG.items.length - 1 ? "1px solid var(--border)" : "none", transition: "background .2s", gap: 8 }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--off-white)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <span style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".72rem" : ".76rem", fontWeight: 500, color: "var(--navy)", lineHeight: 1.4 }}>{lm.name}</span>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                    <div style={{ fontFamily: "var(--serif)", fontSize: ".9rem", fontWeight: 700, color: activeG.color, lineHeight: 1 }}>{lm.dist}</div>
                    <div style={{ fontFamily: "var(--sans)", fontSize: ".52rem", color: "var(--text-dim)", fontWeight: 500, marginTop: 2 }}>{lm.time} drive</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
              {[{ val: "0.5 km", label: "From Expressway" }, { val: "15 Min", label: "To Jewar Airport" }].map((s, i) => (
                <div key={i} style={{ background: i === 0 ? "var(--navy)" : "var(--off-white)", border: "2px solid var(--border)", borderRadius: 5, padding: bp.isXs ? "1rem" : "1.1rem 1.2rem" }}>
                  <div style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: bp.isXs ? "1.35rem" : "1.5rem", fontWeight: 700, color: i === 0 ? "#fff" : "var(--navy)", lineHeight: 1, marginBottom: 3 }}>{s.val}</div>
                  <div style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".5rem" : ".56rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: i === 0 ? "rgba(255,255,255,0.5)" : "var(--text-dim)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   CONTACT SECTION
══════════════════════════════════════════════════════ */
function ContactSection() {
  const bp = useBreakpoint();
  return (
    <section style={{ background: "var(--off-white)", borderTop: "2px solid var(--border)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: `${vPad(bp)} ${hPad(bp)}` }}>
        <Reveal>
          <Eyebrow label="Visit Us" />
          <h2 style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? "1.6rem" : "clamp(1.8rem,4vw,3rem)", fontWeight: 600, color: "var(--navy)", marginBottom: "2rem", lineHeight: 1.1 }}>Walk the Land That Will Become Your Legacy</h2>
          <div style={{ display: "grid", gridTemplateColumns: bp.isXs ? "1fr" : bp.isMobile ? "1fr" : bp.isTablet ? "1fr 1fr" : "repeat(3, 1fr)", gap: bp.isMobile ? "1rem" : "1.5rem" }}>
            {[
              { icon: "📍", title: "Site Address", lines: ["Plot TS-01B, Sector 22D", "Yamuna Expressway, Greater Noida — 201308"] },
              { icon: "📞", title: "Sales Enquiries", lines: ["+91 9205974843"] },
              { icon: "✉️", title: "Email", lines: ["info@residentialplots.com"] },
            ].map((c, i) => (
              <div key={i} style={{ display: "flex", gap: ".875rem", alignItems: "flex-start", background: "#fff", border: "2px solid var(--border)", borderRadius: 8, padding: bp.isXs ? "1.25rem" : "1.5rem 1.75rem" }}>
                <div style={{ width: 40, height: 40, background: "var(--navy-pale)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>{c.icon}</div>
                <div>
                  <div style={{ fontFamily: "var(--sans)", fontSize: ".54rem", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--green)", fontWeight: 700, marginBottom: 6 }}>{c.title}</div>
                  {c.lines.map((line, j) => <div key={j} style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".76rem" : ".8rem", color: "var(--navy)", fontWeight: 600, lineHeight: 1.65 }}>{line}</div>)}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════ */
function Footer() {
  const bp = useBreakpoint();
  const links = {
    "Project": ["Overview", "Plot Sizes", "Price List", "Gallery", "Amenities"],
    "Company": ["About residential-Group", "Careers", "Press"],
    "Legal": ["Privacy Policy", "Terms", "YEIDA Info"],
  };

  return (
    <footer style={{ background: "#04223f", padding: bp.isXs ? "40px 1rem 28px" : `60px ${hPad(bp)} 36px` }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: bp.isXs ? "1fr 1fr" : bp.isMobile ? "1fr 1fr" : bp.isDesktop ? "2fr 1fr 1fr 1fr" : "1fr 1fr", gap: bp.isXs ? "1.5rem 1rem" : "2.5rem", marginBottom: "3rem" }}>
          <div style={{ gridColumn: bp.isXs ? "1/3" : "auto" }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? "1.1rem" : "1.2rem", fontWeight: 700, color: "#fff", marginBottom: ".875rem", letterSpacing: ".04em" }}>residential-Estate Plots</div>
            <p style={{ fontFamily: "var(--sans)", fontSize: ".7rem", color: "rgba(255,255,255,0.3)", lineHeight: 1.9, marginBottom: "1.25rem", maxWidth: 210, fontWeight: 400 }}>
              365 exclusive residential plots across 68 acres on the Yamuna Expressway, Sector 22D, Greater Noida.
            </p>
            <div style={{ display: "flex", gap: 7 }}>
              {["Fb", "Tw", "In", "Li"].map(s => (
                <a key={s} href="#"
                  style={{ width: 30, height: 30, border: "2px solid rgba(255,255,255,0.1)", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--sans)", fontSize: ".56rem", fontWeight: 600, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>{s}</a>
              ))}
            </div>
          </div>
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <div style={{ fontFamily: "var(--sans)", fontSize: ".54rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--green)", fontWeight: 700, marginBottom: "1rem" }}>{group}</div>
              <ul style={{ listStyle: "none" }}>
                {items.map(item => (
                  <li key={item} style={{ marginBottom: ".6rem" }}>
                    <a href="#" style={{ fontFamily: "var(--sans)", fontSize: ".7rem", fontWeight: 400, color: "rgba(255,255,255,0.27)", textDecoration: "none" }}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.25rem", flexWrap: "wrap", gap: ".5rem" }}>
          <p style={{ fontFamily: "var(--sans)", fontSize: ".58rem", color: "rgba(255,255,255,0.18)", fontWeight: 400 }}>© 2026 Residential Plots. All Rights Reserved.</p>
          <p style={{ fontFamily: "var(--sans)", fontSize: ".58rem", color: "rgba(255,255,255,0.14)", fontWeight: 400 }}>RERA Reg. No. UPRERAPRJ442226</p>
        </div>
      </div>
    </footer>
  );
}

function Disclaimer() {
  const bp = useBreakpoint();
  return (
    <div style={{ background: "#04223f", borderTop: "1px solid rgba(255,255,255,0.05)", padding: bp.isXs ? "1.5rem 1rem" : `2rem ${hPad(bp)}` }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <p style={{ fontFamily: "var(--sans)", fontSize: ".6rem", fontWeight: 400, color: "rgba(255,255,255,0.16)", lineHeight: 1.9, marginBottom: ".6rem" }}>
          <strong style={{ color: "rgba(255,255,255,0.28)", fontWeight: 600 }}>Legal Disclaimer: </strong>
          This website is for informational purposes only and does not constitute an offer or inducement to invest. All content including images, plot dimensions, pricing, and amenities are tentative and indicative. Prices starting from ₹1 Lakh per Gaj are subject to location premium, GST, stamp duty (min 6%), and registration charges (1%). RERA Reg. No. UPRERAPRJ442226.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {["Privacy Policy", "Terms of Use", "Cookie Policy", "YEIDA Details", "RERA Details"].map(link => (
            <a key={link} href="#" style={{ fontFamily: "var(--sans)", fontSize: ".56rem", color: "rgba(255,255,255,0.16)", textDecoration: "none" }}>{link}</a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MODALS
══════════════════════════════════════════════════════ */
function Modal({ open, onClose }) {
  const bp = useBreakpoint();
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(7,49,90,0.7)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: bp.isXs ? "0.75rem" : "1rem", animation: "fadeIn .25s ease" }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: "#fff", width: "100%", maxWidth: 460, borderRadius: 12, overflow: "hidden", boxShadow: "0 36px 72px rgba(7,49,90,0.3)", maxHeight: "92svh", overflowY: "auto" }}>
        <div style={{ height: 4, background: "linear-gradient(to right, var(--navy), var(--green))" }} />
        <div style={{ padding: bp.isXs ? "1.375rem" : "2.25rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Eyebrow label="Enquire Now" />
              <h3 style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? "1.4rem" : "2rem", fontWeight: 600, color: "var(--navy)" }}>Register Interest</h3>
              <p style={{ fontFamily: "var(--sans)", fontSize: ".7rem", color: "var(--text-muted)", marginTop: ".25rem", fontWeight: 400, lineHeight: 1.6 }}>Our sales team will reach out within 24 hours with pricing & availability.</p>
            </div>
            <button onClick={onClose} style={{ background: "var(--off-white)", border: "none", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--navy)", flexShrink: 0, marginLeft: 10 }}>×</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {["Full Name", "Phone Number", "Email Address"].map(ph => (
              <div key={ph}>
                <label style={{ display: "block", fontFamily: "var(--sans)", fontSize: ".54rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--navy)", fontWeight: 700, marginBottom: 5 }}>{ph}</label>
                <input placeholder={`Enter your ${ph.toLowerCase()}`}
                  style={{ width: "100%", background: "var(--off-white)", border: "2px solid var(--border)", outline: "none", color: "var(--navy)", fontFamily: "var(--sans)", fontSize: ".82rem", fontWeight: 500, padding: "10px 13px", borderRadius: 6 }} />
              </div>
            ))}
            <GreenBtn onClick={onClose} fullWidth>Submit Enquiry</GreenBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

function AutoPopup({ open, onClose }) {
  const bp = useBreakpoint();
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(7,49,90,0.65)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center", padding: bp.isXs ? ".75rem" : "1rem", animation: "fadeIn .5s ease" }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: "#fff", width: "100%", maxWidth: bp.isMobile ? 360 : 680, borderRadius: 12, overflow: "hidden", display: "grid", gridTemplateColumns: bp.isMobile ? "1fr" : "1fr 1fr", boxShadow: "0 36px 72px rgba(7,49,90,0.4)", maxHeight: "90svh", overflowY: "auto" }}>
        {!bp.isMobile && (
          <div style={{ position: "relative", minHeight: 360, overflow: "hidden" }}>
            <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} alt="" />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(7,49,90,0.92) 0%, rgba(7,49,90,0.28) 60%)" }} />
            <div style={{ position: "absolute", bottom: "1.75rem", left: "1.75rem" }}>
              <Eyebrow label="Limited Availability" light />
              <h3 style={{ fontFamily: "var(--serif)", fontSize: "2rem", fontWeight: 600, color: "#fff", lineHeight: 1.1 }}>Only 365<br />Exclusive Plots</h3>
            </div>
          </div>
        )}
        <div style={{ padding: bp.isXs ? "1.75rem 1.375rem" : "2.25rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
            {bp.isMobile && <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", fontWeight: 600, color: "var(--navy)", flex: 1, minWidth: 0 }}>Early Access Plots</h3>}
            {!bp.isMobile && <div />}
            <button onClick={onClose} style={{ background: "var(--off-white)", border: "none", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontSize: ".95rem", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--navy)", flexShrink: 0, marginLeft: 8 }}>×</button>
          </div>
          <p style={{ fontFamily: "var(--sans)", fontSize: ".76rem", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
            Be first to receive plot availability, pricing and site visit invitations for residential-Estate Plots, Sector 22D. Starting from ₹1 Lakh per Gaj*.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
            {["Full Name", "Phone Number"].map(ph => (
              <div key={ph}>
                <label style={{ display: "block", fontFamily: "var(--sans)", fontSize: ".54rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--navy)", fontWeight: 700, marginBottom: 5 }}>{ph}</label>
                <input placeholder={`Enter ${ph.toLowerCase()}`}
                  style={{ width: "100%", background: "var(--off-white)", border: "2px solid var(--border)", outline: "none", color: "var(--navy)", fontFamily: "var(--sans)", fontSize: ".82rem", fontWeight: 500, padding: "10px 13px", borderRadius: 6 }} />
              </div>
            ))}
          </div>
          <GreenBtn fullWidth>Get Early Access</GreenBtn>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   STICKY BOTTOM BAR (mobile)
══════════════════════════════════════════════════════ */
function StickyBottomCTA({ onEnquire }) {
  const bp = useBreakpoint();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 300);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  if (!bp.isMobile || !scrolled) return null;

  return (
    <div className="sticky-bar" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90, display: "grid", gridTemplateColumns: "1fr 1fr", background: "#fff", borderTop: "2px solid var(--border)", boxShadow: "0 -4px 20px rgba(7,49,90,0.1)", animation: "fadeUp .4s ease" }}>
      <a href="tel:+919205974843" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "14px", textDecoration: "none", borderRight: "2px solid var(--border)", color: "var(--navy)", fontFamily: "var(--sans)", fontSize: ".62rem", fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase" }}>
        📞 Call Now
      </a>
      <button onClick={onEnquire} style={{ background: "var(--green)", border: "none", color: "#fff", fontFamily: "var(--sans)", fontSize: ".62rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "14px", cursor: "pointer" }}>
        Enquire Now
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SIDEBAR (wide screens only)
══════════════════════════════════════════════════════ */
function Sidebar({ onEnquire }) {
  const bp = useBreakpoint();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navH = scrolled ? 64 : 84;

  return (
    <div style={{
      position: "sticky",
      top: navH,
      maxHeight: `calc(100vh - ${navH}px)`,
      overflowY: "auto",
      padding: "1.75rem 1.5rem",
      background: "#fff",
      borderLeft: "2px solid var(--border)",
      transition: "top .4s ease, max-height .4s ease",
      scrollbarWidth: "thin",
      scrollbarColor: "var(--navy-light) transparent",
    }}>
      <div style={{ borderBottom: "2px solid var(--border)", paddingBottom: "1.25rem", marginBottom: "1.25rem" }}>
        <div style={{ fontFamily: "var(--sans)", fontSize: ".52rem", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--green)", fontWeight: 700, marginBottom: ".4rem" }}>Plot Sizes</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", fontWeight: 600, color: "var(--navy)", lineHeight: 1.2 }}>150 – 500 sq.yd</div>
        <div style={{ fontFamily: "var(--sans)", fontSize: ".62rem", color: "var(--text-dim)", marginTop: 5, fontWeight: 500, lineHeight: 1.5 }}>Sector 22D, Yamuna Expressway, Greater Noida</div>
        <div style={{ fontFamily: "var(--sans)", fontSize: ".6rem", color: "var(--green)", marginTop: 4, fontWeight: 600 }}>From ₹1 Lakh/Gaj*</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.25rem" }}>
        {["Full Name", "Email", "Phone"].map(ph => (
          <div key={ph}>
            <label style={{ display: "block", fontFamily: "var(--sans)", fontSize: ".52rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--navy)", fontWeight: 700, marginBottom: 5 }}>{ph}</label>
            <input placeholder={`Enter ${ph}`}
              style={{ width: "100%", background: "var(--off-white)", border: "2px solid var(--border)", outline: "none", color: "var(--navy)", fontFamily: "var(--sans)", fontSize: ".78rem", fontWeight: 500, padding: "8px 11px", borderRadius: 5 }} />
          </div>
        ))}
      </div>
      <GreenBtn onClick={onEnquire} fullWidth>Request Callback</GreenBtn>
      <div style={{ borderTop: "2px solid var(--border)", paddingTop: "1.25rem", marginTop: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "var(--navy)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".9rem", flexShrink: 0 }}>📞</div>
          <div>
            <div style={{ fontFamily: "var(--sans)", fontSize: ".74rem", fontWeight: 600, color: "var(--navy)" }}>+91 9205974843</div>
            <div style={{ fontFamily: "var(--sans)", fontSize: ".58rem", color: "var(--text-dim)", marginTop: 2, fontWeight: 400 }}>Available 9am – 8pm</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   APP ROOT
══════════════════════════════════════════════════════ */
export default function App() {
  const bp = useBreakpoint();
  const [modal, setModal] = useState(false);
  const [autoPopup, setAutoPopup] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAutoPopup(true), 3500);
    return () => clearTimeout(t);
  }, []);

  const openModal = () => setModal(true);

  return (
    <div style={{ maxWidth: "100vw", /* NO overflowX:hidden here — it breaks position:sticky on sidebar */ }}>
      <style>{GLOBAL_CSS}</style>
      <Navbar onEnquire={openModal} />
      <Hero onEnquire={openModal} />

      {/* alignItems:"start" is REQUIRED for position:sticky on the sidebar child */}
      <div style={{
        display: "grid",
        gridTemplateColumns: bp.isWide ? "1fr 288px" : "1fr",
        alignItems: "start",
        maxWidth: "100%",
        position: "relative",
      }}>
        <div style={{ minWidth: 0 }}>
          <StorySection />
          <QuoteBanner />
          <GallerySection onEnquire={openModal} />
          <AmenitiesSection />
          <FloorPlanSection onEnquire={openModal} />
          <LocationAdvantageSection onEnquire={openModal} />
          <LocationSection />
          <ContactSection onEnquire={openModal} />
        </div>
        {bp.isWide && <Sidebar onEnquire={openModal} />}
      </div>

      <Footer />
      <Disclaimer />

      {/* Mobile spacer for sticky bar */}
      {bp.isMobile && <div style={{ height: 56 }} />}

      <StickyBottomCTA onEnquire={openModal} />
      <Modal open={modal} onClose={() => setModal(false)} />
      <AutoPopup open={autoPopup} onClose={() => setAutoPopup(false)} />
    </div>
  );
}