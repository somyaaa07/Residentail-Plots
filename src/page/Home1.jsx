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
    isWide: w >= 1024,   // sidebar shows at 1024px+
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
@keyframes menuLineTop { from { transform: none; } to { transform: rotate(45deg) translate(5px,5px); } }
@keyframes menuLineBot { from { transform: none; } to { transform: rotate(-45deg) translate(5px,-5px); } }

@media (max-width: 639px) {
  input, button, a { -webkit-tap-highlight-color: transparent; }
  button { touch-action: manipulation; }
}
@supports (padding: max(0px)) {
  .safe-bottom { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
}
`;

function vPad(bp) {
  if (bp.isXs) return "52px";
  if (bp.isMobile) return "64px";
  if (bp.isTablet) return "80px";
  return "100px";
}
function hPad(bp) {
  if (bp.isXs) return "1rem";
  if (bp.isMobile) return "1.25rem";
  if (bp.isTablet) return "2rem";
  if (bp.isLg) return "2.5rem";
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
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.06 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(28px)",
      transition: `opacity .8s ${delay}s cubic-bezier(.16,1,.3,1), transform .8s ${delay}s cubic-bezier(.16,1,.3,1)`
    }}>{children}</div>
  );
}

function Eyebrow({ label, light = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <div style={{ width: 32, height: 2, background: light ? "rgba(255,255,255,0.6)" : "var(--green)", borderRadius: 1 }} />
      <span style={{
        fontFamily: "var(--sans)", fontSize: "0.6rem", letterSpacing: "0.28em",
        textTransform: "uppercase", fontWeight: 600,
        color: light ? "rgba(255,255,255,0.7)" : "var(--green)"
      }}>{label}</span>
    </div>
  );
}

function GreenBtn({ children, onClick, outline = false, small = false }) {
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
        fontSize: small ? "0.62rem" : "0.68rem",
        letterSpacing: "0.15em", textTransform: "uppercase",
        padding: small ? "10px 22px" : "13px 30px",
        cursor: "pointer",
        borderRadius: 4,
        transition: "all .22s ease",
        boxShadow: !outline && hov ? "0 6px 20px rgba(85,115,75,0.4)" : "none",
      }}>
      {children}
    </button>
  );
}

/* ═══ NAVBAR — new hamburger design ═══ */
function Navbar({ onEnquire }) {
  const bp = useBreakpoint();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    if (!bp.isDesktop) document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open, bp.isDesktop]);

  useEffect(() => { if (bp.isDesktop && open) setOpen(false); }, [bp.isDesktop]);

  const links = ["Story", "Gallery", "Amenities", "Floor Plans", "Price List", "Location"];

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
          padding: bp.isXs ? "0 1rem" : "0 2rem",
          height: scrolled ? 72 : bp.isMobile ? 80 : 90,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          transition: "height .4s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/logo2.png" alt="Anant Raj" style={{ width: scrolled ? 150 : 170, height: scrolled ? 150 : 170, objectFit: "contain", transition: "all .4s" }}
              onError={e => { e.currentTarget.style.display = "none"; }} />
          </div>

          {bp.isDesktop && (
            <div style={{ display: "flex", gap: bp.isLg ? "1.75rem" : "2.5rem", alignItems: "center" }}>
              {links.map(l => (
                <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`}
                  style={{ fontFamily: "var(--sans)", fontSize: ".72rem", fontWeight: 500, letterSpacing: ".06em", color: scrolled ? "var(--navy)" : "#fff", textDecoration: "none", transition: "color .2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--green)"}
                  onMouseLeave={e => e.currentTarget.style.color = scrolled ? "var(--navy)" : "#fff"}
                >{l}</a>
              ))}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {bp.isDesktop && <GreenBtn onClick={onEnquire} small>Enquire Now</GreenBtn>}

            {/* NEW hamburger — pill with menu/close icon */}
            {!bp.isDesktop && (
              <button
                onClick={() => setOpen(v => !v)}
                aria-label={open ? "Close menu" : "Open menu"}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: open ? "var(--navy)" : (scrolled ? "var(--navy)" : "rgba(255,255,255,0.15)"),
                  backdropFilter: "blur(8px)",
                  border: `1.5px solid ${open ? "var(--navy)" : (scrolled ? "var(--navy)" : "rgba(255,255,255,0.35)")}`,
                  borderRadius: 50,
                  padding: "7px 14px 7px 10px",
                  cursor: "pointer",
                  transition: "all .3s ease",
                }}>
                {/* Animated icon */}
                <div style={{ width: 18, height: 18, position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", gap: 0 }}>
                  <span style={{
                    position: "absolute", top: open ? "50%" : "25%",
                    left: 0, width: "100%", height: 2, borderRadius: 2,
                    background: "#fff",
                    transform: open ? "rotate(45deg) translateY(-50%)" : "none",
                    transition: "all .3s ease",
                  }} />
                  <span style={{
                    position: "absolute", top: "50%", left: 0,
                    width: open ? 0 : "75%", height: 2, borderRadius: 2,
                    background: "#fff",
                    transform: "translateY(-50%)",
                    opacity: open ? 0 : 1,
                    transition: "all .3s ease",
                  }} />
                  <span style={{
                    position: "absolute", bottom: open ? "50%" : "25%",
                    left: 0, width: "100%", height: 2, borderRadius: 2,
                    background: "#fff",
                    transform: open ? "rotate(-45deg) translateY(50%)" : "none",
                    transition: "all .3s ease",
                  }} />
                </div>
                <span style={{
                  fontFamily: "var(--sans)", fontSize: ".6rem", fontWeight: 700,
                  letterSpacing: ".1em", textTransform: "uppercase",
                  color: "#fff", transition: "all .3s"
                }}>{open ? "Close" : "Menu"}</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile/tablet overlay menu */}
      {!bp.isDesktop && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99,
          background: "#fff",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transform: open ? "translateY(0)" : "translateY(-12px)",
          transition: "opacity .35s ease, transform .35s ease",
        }}>
          {/* Top brand bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(to right, var(--navy), var(--green))" }} />

          {links.map((l, i) => (
            <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`} onClick={() => setOpen(false)}
              style={{
                fontFamily: "var(--serif)",
                fontSize: bp.isTablet ? "2.4rem" : "2rem",
                fontWeight: 500, color: "var(--navy)", textDecoration: "none",
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(16px)",
                transition: `opacity .4s ${0.05 + i * 0.06}s ease, transform .4s ${0.05 + i * 0.06}s ease`,
                display: "flex", alignItems: "center", gap: 12,
              }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block", flexShrink: 0 }} />
              {l}
            </a>
          ))}

          <div style={{ width: 48, height: 2, background: "var(--border)", borderRadius: 1, margin: "4px 0" }} />
          <GreenBtn onClick={() => { setOpen(false); onEnquire(); }}>Book a Visit</GreenBtn>
          <a href="tel:+919205974843" style={{ fontFamily: "var(--sans)", fontSize: ".7rem", color: "var(--text-muted)", textDecoration: "none" }}>+91 9205974843</a>
        </div>
      )}
    </>
  );
}

/* ═══ HERO — content truly centered ═══ */
function Hero({ onEnquire }) {
  const bp = useBreakpoint();
  const [slide, setSlide] = useState(0);
  const slides = ["https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg", "https://images.pexels.com/photos/7031607/pexels-photo-7031607.jpeg", "/banner/9.png"];

  useEffect(() => {
    const t = setInterval(() => setSlide(p => (p + 1) % 3), 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{ position: "relative", height: "100svh", minHeight: 580, overflow: "hidden" }}>
      {slides.map((src, i) => (
        <div key={i} style={{ position: "absolute", inset: 0, opacity: i === slide ? 1 : 0, transition: "opacity 1.5s ease" }}>
          <img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", transform: i === slide ? "scale(1.04)" : "scale(1)", transition: "transform 6.5s ease-out" }} alt="" />
        </div>
      ))}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.45) 35%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.2) 100%)" }} />

      {/* Slide dots — bottom center */}
      <div style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 5 }}>
        {[0, 1, 2].map(i => (
          <button key={i} onClick={() => setSlide(i)}
            style={{ width: i === slide ? 28 : 8, height: 8, borderRadius: 4, background: i === slide ? "#fff" : "rgba(255,255,255,0.4)", border: "none", cursor: "pointer", padding: 0, transition: "all .4s" }} />
        ))}
      </div>

      {/* HERO CONTENT — truly centered via flexbox */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: bp.isXs ? "80px 1rem 80px" : "90px 2rem 80px",
        textAlign: "center",
        zIndex: 2,
      }}>
        <div style={{ animation: "fadeUp 1.1s .2s both", width: "100%", maxWidth: 1100 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: bp.isMobile ? 12 : 20, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", padding: "6px 18px", borderRadius: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }} />
            <span style={{ fontFamily: "var(--sans)", fontSize: ".62rem", letterSpacing: ".2em", textTransform: "uppercase", color: "#fff", fontWeight: 500 }}>Yamuna Expressway's Premier Address</span>
          </div>

          <h1 style={{
            fontFamily: "var(--serif)", fontWeight: 600,
            fontSize: bp.isXs ? "2.4rem" : bp.isMobile ? "3rem" : bp.isTablet ? "4.2rem" : "clamp(4.5rem,8vw,8rem)",
            color: "#fff", lineHeight: 1, letterSpacing: ".02em", marginBottom: bp.isMobile ? 14 : 24,
            textShadow: "0 4px 24px rgba(7,49,90,0.4)",
          }}>
            Own the Land.<br />Own Your Story.
          </h1>

          <p style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".78rem" : ".9rem", fontWeight: 400, color: "rgba(255,255,255,0.85)", maxWidth: 500, margin: "0 auto", lineHeight: 1.75, marginBottom: bp.isMobile ? 20 : 36 }}>
            Residential Plots — from 100 sq.yd to 500 sq.yd, on the Yamuna Expressway corridor. Freehold. YEIDA Approved.
          </p>

          <div style={{ maxWidth: bp.isMobile ? 380 : 680, margin: "0 auto" }}>
            {bp.isMobile ? (
              <div style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", borderRadius: 8, overflow: "hidden", boxShadow: "0 20px 60px rgba(7,49,90,0.3)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                  {[{ label: "Name", ph: "Full Name" }, { label: "Phone", ph: "+91 00000 00000" }].map((f, i) => (
                    <div key={i} style={{ padding: "14px 16px", borderRight: i === 0 ? "1px solid var(--border)" : "none", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ fontFamily: "var(--sans)", fontSize: ".52rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--green)", fontWeight: 600, marginBottom: 4 }}>{f.label}</div>
                      <input placeholder={f.ph} style={{ background: "transparent", border: "none", outline: "none", color: "var(--navy)", fontFamily: "var(--sans)", fontSize: ".8rem", width: "100%", fontWeight: 500 }} />
                    </div>
                  ))}
                </div>
                <button onClick={onEnquire} style={{ width: "100%", padding: "13px", background: "var(--green)", border: "none", color: "#fff", fontFamily: "var(--sans)", fontSize: ".65rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", cursor: "pointer" }}>
                  Get Brochure & Price List
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", borderRadius: 8, overflow: "hidden", boxShadow: "0 24px 60px rgba(7,49,90,0.3)" }}>
                {[{ label: "Name", ph: "Full Name" }, { label: "Phone", ph: "+91 00000 00000" }, { label: "Email", ph: "you@email.com" }].map((f, i) => (
                  <div key={i} style={{ padding: "14px 18px", borderRight: "1px solid var(--border)" }}>
                    <div style={{ fontFamily: "var(--sans)", fontSize: ".52rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--green)", fontWeight: 600, marginBottom: 4 }}>{f.label}</div>
                    <input placeholder={f.ph} style={{ background: "transparent", border: "none", outline: "none", color: "var(--navy)", fontFamily: "var(--sans)", fontSize: ".8rem", width: "100%", fontWeight: 500 }} />
                  </div>
                ))}
                <button onClick={onEnquire} style={{ background: "var(--green)", border: "none", color: "#fff", fontFamily: "var(--sans)", fontSize: ".62rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "0 24px", cursor: "pointer", whiteSpace: "nowrap", transition: "background .2s" }}
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

/* ═══ STORY — image below text on mobile/tablet ═══ */
function StorySection() {
  const bp = useBreakpoint();
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: .15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const plots = useCountUp(480, 1800, started);
  const acres = useCountUp(120, 1200, started);
  const sectors = useCountUp(3, 1500, started);

  // On mobile/tablet: text first, image second
  // On desktop: side by side (image left, text right)
  return (
    <section id="story" ref={ref} style={{ background: "#fff", padding: `${vPad(bp)} 0` }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: `0 ${hPad(bp)}` }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: bp.isDesktop ? "1fr 1fr" : "1fr",
          gap: bp.isDesktop ? 80 : 40,
          alignItems: "center",
        }}>
          {/* TEXT — always renders first in DOM, appears first on mobile/tablet */}
          <div style={{ order: bp.isDesktop ? 2 : 1 }}>
            <Reveal delay={bp.isDesktop ? .15 : 0}>
              <Eyebrow label="Our Story" />
              <h2 style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? "1.8rem" : bp.isMobile ? "2.2rem" : "clamp(2.2rem,3.5vw,3.8rem)", fontWeight: 600, color: "var(--navy)", lineHeight: 1.1, marginBottom: "1.25rem" }}>
                Land That Rises<br />With the Yamuna
              </h2>
              <div style={{ width: 48, height: 3, background: "var(--green)", borderRadius: 2, marginBottom: "1.5rem" }} />
              <p style={{ fontFamily: "var(--sans)", fontSize: ".88rem", fontWeight: 400, color: "var(--text-muted)", lineHeight: 1.9, marginBottom: "1rem" }}>
                Along the thriving Yamuna Expressway corridor, Anant Raj presents fully developed freehold residential plots — a rare chance to own land in one of North India's fastest-growing investment zones.
              </p>
              <p style={{ fontFamily: "var(--sans)", fontSize: ".88rem", fontWeight: 400, color: "var(--text-dim)", lineHeight: 1.9, marginBottom: "2.5rem" }}>
                Wide paved roads, underground utilities, landscaped greens, and gated security — infrastructure already in place.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0, borderTop: "2px solid var(--navy-pale)", paddingTop: "2rem" }}>
                {[
                  { val: plots, suffix: "+", label: "Plots" },
                  { val: acres, suffix: "", label: "Acres" },
                  { val: sectors, suffix: "", label: "Sectors" }
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center", borderRight: i < 2 ? "2px solid var(--navy-pale)" : "none", padding: "0 1rem" }}>
                    <div style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? "2.4rem" : "3rem", fontWeight: 700, color: "var(--navy)", lineHeight: 1 }}>{s.val}{s.suffix}</div>
                    <div style={{ fontFamily: "var(--sans)", fontSize: ".6rem", fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--green)", marginTop: 6 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* IMAGE — appears second on mobile/tablet, first (left) on desktop */}
          <div style={{ order: bp.isDesktop ? 1 : 2 }}>
            <Reveal>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", top: -16, left: -16, right: 24, bottom: 24, border: "2px solid var(--navy-pale)", borderRadius: 4, zIndex: 0 }} />
                <div style={{ position: "relative", zIndex: 1, overflow: "hidden", borderRadius: 4, aspectRatio: bp.isTablet ? "16/9" : bp.isMobile ? "4/3" : "3/4", boxShadow: "var(--shadow-lg)" }}>
                  <img src="https://images.pexels.com/photos/31425035/pexels-photo-31425035.jpeg" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} alt="Interior" />
                  <div style={{ position: "absolute", bottom: 20, right: 20, background: "var(--navy)", borderRadius: 4, padding: "12px 20px", boxShadow: "var(--shadow-md)" }}>
                    <div style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", fontWeight: 600, color: "#fff", lineHeight: 1 }}>YEIDA</div>
                    <div style={{ fontFamily: "var(--sans)", fontSize: ".5rem", letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginTop: 4 }}>Approved</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══ QUOTE BANNER ═══ */
function QuoteBanner() {
  const bp = useBreakpoint();
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const stats = [
    { val: "₹1.2Cr+", label: "Avg. Plot Appreciation", sub: "3-year window" },
    { val: "18%", label: "CAGR", sub: "Yamuna Corridor" },
    { val: "2031", label: "Jewar Airport", sub: "Completion Year" },
    { val: "40km", label: "To Delhi NCR", sub: "Core Distance" },
  ];

  return (
    <div ref={ref} style={{ position: "relative", overflow: "hidden", background: "#fff" }}>
      <div style={{ height: 4, background: "linear-gradient(to right, var(--navy) 0%, var(--navy) 50%, var(--green) 100%)" }} />
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: bp.isXs ? "3rem 1rem" : `3.5rem ${hPad(bp)}` }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: bp.isMobile ? "1fr" : bp.isTablet ? "1fr" : "1fr 1fr",
          gap: bp.isMobile ? "3rem" : "6rem",
          alignItems: "center"
        }}>
          <div style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(24px)", transition: "opacity 1s ease, transform 1s ease", position: "relative" }}>
            <div style={{ position: "absolute", top: -20, left: -10, fontFamily: "var(--display)", fontSize: "12rem", lineHeight: 1, color: "var(--navy-pale)", fontWeight: 600, pointerEvents: "none", userSelect: "none", zIndex: 0 }}>"</div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.75rem" }}>
                <div style={{ width: 3, height: 40, background: "var(--navy)", borderRadius: 2 }} />
                <span style={{ fontFamily: "var(--sans)", fontSize: ".58rem", letterSpacing: ".3em", textTransform: "uppercase", color: "var(--navy)", fontWeight: 700 }}>Investment Insight</span>
              </div>
              <blockquote style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: bp.isXs ? "1.8rem" : bp.isMobile ? "2.2rem" : "clamp(2.4rem,3.5vw,3.4rem)", fontWeight: 600, color: "var(--navy)", lineHeight: 1.2, marginBottom: "2rem" }}>
                "The Yamuna Expressway<br /><span style={{ color: "var(--navy)" }}>is not a location —</span><br />it is a legacy."
              </blockquote>
              <p style={{ fontFamily: "var(--sans)", fontSize: ".84rem", color: "var(--text-muted)", lineHeight: 1.9, maxWidth: 420, marginBottom: "2rem" }}>
                With Jewar International Airport, F1 Circuit, and Film City all within 15 km — this corridor is poised to be India's next mega-growth zone. Land here isn't an expense. It's a generational asset.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Jewar Airport", "F1 Circuit", "Film City", "YEIDA Approved"].map(tag => (
                  <span key={tag} style={{ fontFamily: "var(--sans)", fontSize: ".58rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", padding: "5px 12px", borderRadius: 3, border: "1.5px solid var(--border)", color: "var(--text-muted)" }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, opacity: vis ? 1 : 0, transition: "opacity .8s .2s ease" }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                background: i === 0 ? "var(--navy)" : i === 1 ? "var(--gold-pale)" : i === 2 ? "var(--green-pale)" : "var(--navy-pale)",
                padding: bp.isXs ? "1.75rem 1.25rem" : "2.25rem 2rem",
                position: "relative", overflow: "hidden",
                opacity: vis ? 1 : 0, transform: vis ? "none" : "scale(0.96)",
                transition: `opacity .6s ${0.15 + i * 0.1}s ease, transform .6s ${0.15 + i * 0.1}s ease`,
              }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: 40, height: 40, borderLeft: `1px solid ${i === 0 ? "rgba(255,255,255,0.15)" : "var(--border)"}`, borderBottom: `1px solid ${i === 0 ? "rgba(255,255,255,0.15)" : "var(--border)"}` }} />
                <div style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: bp.isXs ? "2rem" : "2.6rem", fontWeight: 700, color: i === 0 ? "#fff" : i === 1 ? "#b8891a" : i === 2 ? "var(--green)" : "var(--navy)", lineHeight: 1, marginBottom: ".5rem" }}>{s.val}</div>
                <div style={{ fontFamily: "var(--sans)", fontSize: ".68rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: i === 0 ? "rgba(255,255,255,0.9)" : "var(--navy)", marginBottom: ".2rem" }}>{s.label}</div>
                <div style={{ fontFamily: "var(--sans)", fontSize: ".6rem", fontWeight: 400, color: i === 0 ? "rgba(255,255,255,0.45)" : "var(--text-dim)" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ height: 2, background: "var(--border)" }} />
    </div>
  );
}

/* ═══ GALLERY — enquire button ALWAYS visible on every image ═══ */
function GallerySection({ onEnquire }) {
  const bp = useBreakpoint();
  const [hov, setHov] = useState(null);

  const imgs = [
    { src: "https://images.pexels.com/photos/1571457/pexels-photo-1571457.jpeg", label: "Living Spaces" },
    { src: "https://images.pexels.com/photos/2631746/pexels-photo-2631746.jpeg", label: "Master Suite" },
    { src: "https://images.pexels.com/photos/6283972/pexels-photo-6283972.jpeg", label: "Kitchen" },
    { src: "https://i.pinimg.com/1200x/86/0a/36/860a36fcfd841b18380dc31e59eaa936.jpg", label: "Clubhouse" },
    { src: "https://i.pinimg.com/736x/f5/1f/7f/f51f7fc715dc82a294988023345c444a.jpg", label: "Pool Deck" },
  ];

  let gridItems, cols, rowDef;
  if (bp.isXs) {
    gridItems = imgs.map((img, i) => ({ ...img, col: "1/2", row: `${i + 1}/${i + 2}` }));
    cols = "1fr"; rowDef = "repeat(5,220px)";
  } else if (bp.isMobile) {
    gridItems = [
      { ...imgs[0], col: "1/3", row: "1/2" }, { ...imgs[1], col: "1/2", row: "2/3" },
      { ...imgs[2], col: "2/3", row: "2/3" }, { ...imgs[3], col: "1/2", row: "3/4" },
      { ...imgs[4], col: "2/3", row: "3/4" },
    ];
    cols = "1fr 1fr"; rowDef = "repeat(3,210px)";
  } else if (bp.isTablet) {
    gridItems = [
      { ...imgs[0], col: "1/3", row: "1/2" }, { ...imgs[1], col: "1/2", row: "2/3" },
      { ...imgs[2], col: "2/3", row: "2/3" }, { ...imgs[3], col: "1/2", row: "3/4" },
      { ...imgs[4], col: "2/3", row: "3/4" },
    ];
    cols = "1fr 1fr"; rowDef = "repeat(3,230px)";
  } else {
    gridItems = [
      { ...imgs[0], col: "1/3", row: "1/3" }, { ...imgs[1], col: "3/4", row: "1/2" },
      { ...imgs[2], col: "3/4", row: "2/3" }, { ...imgs[3], col: "1/3", row: "3/4" },
      { ...imgs[4], col: "3/4", row: "3/4" },
    ];
    cols = "repeat(3,1fr)"; rowDef = "repeat(3,250px)";
  }

  return (
    <section id="gallery" style={{ padding: `${vPad(bp)} 0`, background: "var(--off-white)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: `0 ${hPad(bp)}` }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "2.5rem" }}>
            <div>
              <Eyebrow label="Gallery" />
              <h2 style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? "1.8rem" : "clamp(2rem,4vw,3.5rem)", fontWeight: 600, color: "var(--navy)", lineHeight: 1.1 }}>A Glimpse of Elegance</h2>
            </div>
            <GreenBtn onClick={onEnquire} outline small>View All →</GreenBtn>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: cols, gridTemplateRows: rowDef, gap: 6, borderRadius: 8, overflow: "hidden" }}>
          {gridItems.map((img, i) => (
            <div
              key={i}
              style={{ gridColumn: img.col, gridRow: img.row, position: "relative", overflow: "hidden", cursor: "pointer" }}
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(null)}
            >
              {/* Image with zoom on hover */}
              <img
                src={img.src}
                alt={img.label}
                style={{
                  width: "100%", height: "100%", objectFit: "cover", display: "block",
                  transition: "transform .7s cubic-bezier(.16,1,.3,1)",
                  transform: hov === i ? "scale(1.07)" : "scale(1)",
                }}
              />

              {/* Gradient overlay — always on, darker on hover */}
              <div style={{
                position: "absolute", inset: 0,
                background: hov === i
                  ? "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)"
                  : "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 55%, transparent 100%)",
                transition: "background .4s ease",
              }} />

              {/* Bottom bar — ALWAYS visible: label left, Enquire button right */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                padding: bp.isXs ? "10px 12px" : "14px 18px",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
              }}>
                <span style={{
                  fontFamily: "var(--serif)",
                  fontSize: bp.isXs ? ".8rem" : "1rem",
                  fontWeight: 500, color: "#fff",
                  textShadow: "0 1px 6px rgba(0,0,0,0.5)",
                  lineHeight: 1.2,
                }}>{img.label}</span>

                {/* Enquire button — ALWAYS visible on every image, no conditional rendering */}
                <button
                  onClick={e => { e.stopPropagation(); onEnquire(); }}
                  style={{
                    fontFamily: "var(--sans)",
                    fontSize: bp.isXs ? ".52rem" : ".6rem",
                    fontWeight: 700,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: hov === i ? "var(--navy)" : "#fff",
                    background: hov === i ? "#fff" : "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border: "1.5px solid rgba(255,255,255,0.6)",
                    padding: bp.isXs ? "5px 10px" : "7px 14px",
                    borderRadius: 4,
                    cursor: "pointer",
                    transition: "all .25s ease",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  Enquire →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ AMENITIES ═══ */
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
    { label: "Green & Open", icon: "🌿", color: "#3a6b44", bg: "#eef5eb", items: [
      { icon: "🌳", title: "Landscaped Green Belt", desc: "30% open green area with tree-lined avenues, parks and jogging tracks woven throughout the community." },
      { icon: "⛪", title: "Meditation & Yoga Lawn", desc: "Open-air riverside-inspired lawn for morning meditation, yoga and community wellness sessions." },
      { icon: "🌿", title: "Rainwater Harvesting", desc: "Integrated storm-water drains and recharge pits across the township for sustainable water management." },
    ]},
    { label: "Recreation", icon: "🏊", color: "#1a4a6b", bg: "#e8f0f8", items: [
      { icon: "🏊", title: "Swimming Pool", desc: "Full-size outdoor pool with splash zone, sundecks and cabanas for residents." },
      { icon: "🏋️", title: "Gymnasium", desc: "Modern fitness centre with cardio, strength training and a dedicated yoga studio." },
      { icon: "🏛️", title: "Community Clubhouse", desc: "Grand 8,000 sq.ft clubhouse with multi-purpose halls, indoor games and event spaces." },
    ]},
    { label: "Infrastructure", icon: "⚡", color: "#3a6b44", bg: "#fdf8ee", items: [
      { icon: "⚡", title: "Underground Utilities", desc: "All electrical, water, drainage and telecom infrastructure laid underground — no overhead clutter." },
      { icon: "🛣️", title: "Wide Internal Roads", desc: "18 to 24 metre wide asphalted roads with street lighting and dedicated pedestrian walkways." },
      { icon: "🚰", title: "24hr Water Supply", desc: "Dedicated overhead reservoirs and underground sump ensuring uninterrupted water for every plot." },
    ]},
    { label: "Safety & Services", icon: "🛡️", color: "#1a4a6b", bg: "#fdf0f0", items: [
      { icon: "🛡️", title: "24/7 Gated Security", desc: "CCTV surveillance, boom barriers, biometric access and dedicated security personnel round the clock." },
      { icon: "🏫", title: "School & Retail Zone", desc: "Earmarked plots for schools, a supermarket anchor, cafes and essential daily-use retail." },
      { icon: "🅿️", title: "Visitor Parking Plazas", desc: "Dedicated surface parking zones near the clubhouse, retail strip and park entrances." },
    ]},
  ];

  const cat = categories[activeTab];

  return (
    <section id="amenities" ref={ref} style={{ padding: `${vPad(bp)} 0`, background: "var(--off-white)", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: `0 ${hPad(bp)}` }}>
        <Reveal>
          <div style={{ display: "grid", gridTemplateColumns: bp.isDesktop ? "1fr 1fr" : "1fr", gap: "2rem", marginBottom: "3rem", alignItems: "end" }}>
            <div>
              <Eyebrow label="Amenities" />
              <h2 style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? "1.8rem" : "clamp(2rem,4vw,3.5rem)", fontWeight: 600, color: "var(--navy)", lineHeight: 1.05 }}>
                Built for<br />Generations
              </h2>
            </div>
            <p style={{ fontFamily: "var(--sans)", fontSize: ".88rem", color: "var(--text-muted)", lineHeight: 1.9, maxWidth: 440 }}>
              Every amenity has been designed not just for today's resident — but for their children and grandchildren. Infrastructure-first. Green-first. Community-first.
            </p>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: `repeat(${categories.length}, 1fr)`, gap: 4, marginBottom: bp.isMobile ? "1.5rem" : "2.5rem", opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(16px)", transition: "opacity .7s ease, transform .7s ease" }}>
          {categories.map((c, i) => (
            <button key={i} onClick={() => setActiveTab(i)}
              style={{ background: activeTab === i ? cat.color : "#fff", border: `2px solid ${activeTab === i ? cat.color : "var(--border)"}`, borderRadius: 6, padding: bp.isXs ? "10px 6px" : "14px 12px", cursor: "pointer", transition: "all .3s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <span style={{ fontFamily: "var(--sans)", fontSize: bp.isXs ? ".52rem" : ".6rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: activeTab === i ? "#fff" : "var(--text-muted)", transition: "color .3s" }}>{c.label}</span>
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: bp.isMobile ? "1fr" : "1fr 1fr 1fr", gap: 4, opacity: vis ? 1 : 0, transition: "opacity .6s .1s ease" }}>
          {cat.items.map((item, i) => (
            <div key={`${activeTab}-${i}`} style={{ background: "#fff", borderRadius: 8, overflow: "hidden", border: `2px solid ${cat.bg}`, transition: "all .3s ease", animation: "amenitySlide .35s ease both", animationDelay: `${i * 0.08}s`, boxShadow: "var(--shadow-sm)" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}>
              <div style={{ height: 4, background: cat.color }} />
              <div style={{ padding: bp.isXs ? "1.5rem" : "2rem" }}>
                <h4 style={{ fontFamily: "var(--serif)", fontSize: "1.05rem", fontWeight: 600, color: "var(--navy)", marginBottom: ".75rem", lineHeight: 1.2 }}>{item.title}</h4>
                <p style={{ fontFamily: "var(--sans)", fontSize: ".78rem", color: "var(--text-muted)", lineHeight: 1.75 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div style={{ marginTop: "2.5rem", display: "grid", gridTemplateColumns: bp.isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 2 }}>
            {[
              { num: "12+", label: "World-Class Amenities" },
              { num: "30%", label: "Green Open Space" },
              { num: "8,000", label: "Sq.ft Clubhouse" },
              { num: "24/7", label: "Security Coverage" }
            ].map((s, i) => (
              <div key={i} style={{ background: i === 0 ? "var(--navy)" : "#fff", border: "2px solid var(--border)", padding: "1.5rem", display: "flex", flexDirection: "column", gap: 4, borderRadius: 6 }}>
                <div style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: "2rem", fontWeight: 700, color: i === 0 ? "#fff" : "var(--navy)", lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontFamily: "var(--sans)", fontSize: ".6rem", fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: i === 0 ? "rgba(255,255,255,0.6)" : "var(--text-dim)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ FLOOR PLANS ═══ */
function FloorPlanSection({ onEnquire }) {
  const bp = useBreakpoint();
  const [active, setActive] = useState(0);
  const [hov, setHov] = useState(null);
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const plots = [
    { title: "100 sq.yd", sqft: "900 sq.ft", dims: "30 × 30 ft", facing: "East / North", road: "9 m Road Facing", tag: "Entry", tagColor: "#3a6b44", desc: "Compact freehold plots ideal for first-time buyers. Perfect for building a 2-storey home with parking.", highlights: ["Gated Community", "Corner plots available", "100% freehold title"], img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=700&q=80" },
    { title: "200 sq.yd", sqft: "1,800 sq.ft", dims: "40 × 45 ft", facing: "East / West / North", road: "12 m Road Facing", tag: "Popular", tagColor: "#2c5d7a", desc: "Mid-size plots on wider roads. Build your 3–4 bedroom dream home with a private garden and garage.", highlights: ["Wider road access", "Park-facing options", "Best resale value"], img: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=700&q=80" },
    { title: "300 sq.yd", sqft: "2,700 sq.ft", dims: "50 × 54 ft", facing: "All Orientations", road: "18 m Road Facing", tag: "Premium", tagColor: "#3a6b44", desc: "Spacious premium plots on 18m arterial roads. Ideal for bungalow construction with landscaped lawns.", highlights: ["18m arterial road", "Double garage possible", "Clubhouse proximity"], img: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=700&q=80" },
    { title: "500 sq.yd", sqft: "4,500 sq.ft", dims: "60 × 75 ft", facing: "All Orientations", road: "24 m Boulevard", tag: "Ultra Premium", tagColor: "#2c5d7a", desc: "Boulevard-facing grand plots. Build a true estate with multiple structures, a pool, and manicured gardens.", highlights: ["Boulevard facing", "Villa / estate scale", "Highest appreciation"], img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=700&q=80" },
  ];

  const p = plots[active];

  return (
    <section id="floor-plans" ref={ref} style={{ padding: `${vPad(bp)} 0`, background: "#f5f0e8", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(7,49,90,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: `0 ${hPad(bp)}`, position: "relative", zIndex: 1 }}>
        <Reveal>
          <div style={{ display: "flex", flexDirection: bp.isMobile ? "column" : "row", justifyContent: "space-between", alignItems: bp.isMobile ? "flex-start" : "flex-end", marginBottom: bp.isMobile ? "2rem" : "3rem", gap: "1rem" }}>
            <div>
              <Eyebrow label="Plot Configurations" />
              <h2 style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? "1.8rem" : "clamp(2rem,4vw,3.5rem)", fontWeight: 600, color: "var(--navy)", lineHeight: 1.1 }}>Choose Your Plot Size</h2>
            </div>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: `repeat(${plots.length}, 1fr)`, gap: 4, marginBottom: 4 }}>
          {plots.map((pl, i) => (
            <button key={i} onClick={() => setActive(i)} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              style={{ background: active === i ? pl.tagColor : (hov === i ? "rgba(7,49,90,0.06)" : "#fff"), border: `2px solid ${active === i ? pl.tagColor : "rgba(7,49,90,0.12)"}`, borderRadius: 6, padding: bp.isXs ? "10px 6px" : "14px 10px", cursor: "pointer", transition: "all .3s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? ".85rem" : "1rem", fontWeight: 600, color: active === i ? "#fff" : "var(--navy)", transition: "color .3s" }}>{pl.title}</span>
              <span style={{ fontFamily: "var(--sans)", fontSize: ".52rem", letterSpacing: ".1em", textTransform: "uppercase", color: active === i ? "rgba(255,255,255,0.8)" : "var(--text-dim)", fontWeight: 600, transition: "color .3s" }}>{pl.tag}</span>
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: bp.isMobile ? "1fr" : "1fr 1.4fr", gap: 4, borderRadius: 8, overflow: "hidden", opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)", transition: "opacity .8s ease, transform .8s ease", boxShadow: "0 20px 60px rgba(7,49,90,0.12)" }}>
          <div style={{ background: "#fffdf7", padding: bp.isXs ? "1.5rem" : "2.5rem", borderRight: "2px solid rgba(7,49,90,0.08)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: "1.5rem", background: `${p.tagColor}18`, border: `1.5px solid ${p.tagColor}44`, borderRadius: 20, padding: "5px 14px" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: p.tagColor }} />
              <span style={{ fontFamily: "var(--sans)", fontSize: ".58rem", letterSpacing: ".18em", textTransform: "uppercase", color: p.tagColor, fontWeight: 700 }}>{p.tag}</span>
            </div>
            <h3 style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: bp.isXs ? "2.4rem" : "3.2rem", fontWeight: 600, color: "var(--navy)", lineHeight: 1, marginBottom: "0.25rem" }}>{p.title}</h3>
            <div style={{ fontFamily: "var(--sans)", fontSize: ".75rem", color: "var(--text-dim)", marginBottom: "1.5rem", fontWeight: 500 }}>{p.sqft} · {p.dims}</div>
            <p style={{ fontFamily: "var(--sans)", fontSize: ".8rem", color: "var(--text-muted)", lineHeight: 1.85, marginBottom: "1.75rem" }}>{p.desc}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
              {[["🧭", "Facing", p.facing], ["🛣️", "Road Width", p.road]].map(([icon, label, val]) => (
                <div key={label} style={{ background: "#f5f0e8", borderRadius: 8, padding: "12px 14px", border: "1.5px solid rgba(7,49,90,0.08)" }}>
                {/* //  <div style={{ fontSize: ".9rem", marginBottom: 4 }}>{icon}</div> */}
                  <div style={{ fontFamily: "var(--sans)", fontSize: ".52rem", letterSpacing: ".15em", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 600, marginBottom: 3 }}>{label}</div>
                  <div style={{ fontFamily: "var(--sans)", fontSize: ".75rem", color: "var(--navy)", fontWeight: 600 }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: "2rem" }}>
              {p.highlights.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: ".6rem" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${p.tagColor}20`, border: `1.5px solid ${p.tagColor}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: p.tagColor, fontSize: ".55rem", fontWeight: 700 }}>✓</span>
                  </div>
                  <span style={{ fontFamily: "var(--sans)", fontSize: ".75rem", color: "var(--text-muted)", fontWeight: 400 }}>{h}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "2px solid rgba(7,49,90,0.08)", paddingTop: "1.5rem" }}>
              <p style={{ fontFamily: "var(--sans)", fontSize: ".72rem", color: "var(--text-dim)", marginBottom: "1rem", lineHeight: 1.7 }}>Contact our team for current pricing, payment plans, and availability.</p>
              <GreenBtn onClick={onEnquire} small>Enquire for Price</GreenBtn>
            </div>
          </div>
          <div style={{ position: "relative", minHeight: bp.isMobile ? 240 : 0, overflow: "hidden" }}>
            {plots.map((pl, i) => (
              <div key={i} style={{ position: "absolute", inset: 0, opacity: active === i ? 1 : 0, transition: "opacity .7s ease" }}>
                <img src={pl.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={pl.title} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(7,49,90,0.4) 0%, transparent 60%)" }} />
              </div>
            ))}
            <div style={{ position: "absolute", top: 18, right: 18, background: "rgba(255,253,247,0.92)", backdropFilter: "blur(10px)", border: `2px solid ${p.tagColor}44`, borderRadius: 6, padding: "8px 14px" }}>
              <div style={{ fontFamily: "var(--sans)", fontSize: ".52rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 2, fontWeight: 600 }}>Plot Size</div>
              <div style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: "1.4rem", fontWeight: 700, color: p.tagColor, lineHeight: 1 }}>{p.title}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══ PRICE LIST ═══ */
function PriceListSection({ onEnquire }) {
  const bp = useBreakpoint();
  const [hovRow, setHovRow] = useState(null);

  const units = [
    { type: "100 sq.yd Plot", area: "900 sq.ft", carpet: "30 × 30 ft", floor: "9m Road", config: "Freehold · YEIDA Approved", price: "₹28 Lakh*", tag: "Entry" },
    { type: "200 sq.yd Plot", area: "1,800 sq.ft", carpet: "40 × 45 ft", floor: "12m Road", config: "Freehold · Park-Facing Available", price: "₹54 Lakh*", tag: "Popular" },
    { type: "300 sq.yd Plot", area: "2,700 sq.ft", carpet: "50 × 54 ft", floor: "18m Road", config: "Freehold · Boulevard Options", price: "₹78 Lakh*", tag: "Premium" },
    { type: "500 sq.yd Plot", area: "4,500 sq.ft", carpet: "60 × 75 ft", floor: "24m Boulevard", config: "Freehold · Grand Villa Scale", price: "₹1.25 Cr*", tag: "Ultra Premium" },
  ];

  const tagStyles = {
    "Entry": { bg: "var(--green-pale)", color: "var(--green)" },
    "Popular": { bg: "#fdf8ee", color: "#c9a84c" },
    "Premium": { bg: "var(--navy-pale)", color: "var(--navy)" },
    "Ultra Premium": { bg: "#fdf3e8", color: "#a06a1a" },
  };

  const includes = [
    "Fully Developed & Ready Infrastructure",
    "Wide Internal Roads (9m–24m)",
    "Underground Electrical & Water Lines",
    "24/7 Gated Security with CCTV",
    "Landscaped Parks & Green Belts",
    "100% Freehold Registered Title",
  ];

  return (
    <section id="price-list" style={{ padding: `${vPad(bp)} 0`, background: "var(--off-white)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: `0 ${hPad(bp)}` }}>
        <Reveal>
          <div style={{ display: "flex", flexDirection: bp.isMobile ? "column" : "row", alignItems: bp.isMobile ? "flex-start" : "flex-end", justifyContent: "space-between", marginBottom: "3rem", gap: "1rem" }}>
            <div>
              <Eyebrow label="Price List" />
              <h2 style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? "1.8rem" : "clamp(2rem,4vw,3.5rem)", fontWeight: 600, color: "var(--navy)", lineHeight: 1.1 }}>Transparent Pricing</h2>
              <p style={{ fontFamily: "var(--sans)", fontSize: ".82rem", color: "var(--text-muted)", marginTop: ".75rem", maxWidth: 440, lineHeight: 1.8 }}>
                Click any plot to enquire. Prices are indicative and subject to location premium & registration.
              </p>
            </div>
            <GreenBtn onClick={onEnquire}>Get Exact Pricing</GreenBtn>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          {bp.isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "2rem" }}>
              {units.map((u, i) => (
                <div key={i} onClick={onEnquire} onMouseEnter={() => setHovRow(i)} onMouseLeave={() => setHovRow(null)}
                  style={{ background: hovRow === i ? "var(--navy)" : "#fff", border: `2px solid ${hovRow === i ? "var(--navy)" : "var(--border)"}`, borderRadius: 8, padding: "1.25rem 1.5rem", cursor: "pointer", transition: "all .25s", boxShadow: hovRow === i ? "var(--shadow-lg)" : "var(--shadow-sm)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".75rem" }}>
                    <div style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", fontWeight: 600, color: hovRow === i ? "#fff" : "var(--navy)", transition: "color .2s" }}>{u.type}</div>
                    <span style={{ fontFamily: "var(--sans)", fontSize: ".5rem", letterSpacing: ".15em", textTransform: "uppercase", padding: "4px 10px", background: tagStyles[u.tag]?.bg, color: tagStyles[u.tag]?.color, borderRadius: 3, fontWeight: 600 }}>{u.tag}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                    {[["Area", u.area], ["Dimensions", u.carpet], ["Road", u.floor], ["Config", u.config]].map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontFamily: "var(--sans)", fontSize: ".5rem", letterSpacing: ".15em", textTransform: "uppercase", color: hovRow === i ? "rgba(255,255,255,0.5)" : "var(--text-dim)", fontWeight: 600, marginBottom: 2, transition: "color .2s" }}>{label}</div>
                        <div style={{ fontFamily: "var(--sans)", fontSize: ".75rem", color: hovRow === i ? "rgba(255,255,255,0.8)" : "var(--text-muted)", fontWeight: 500, transition: "color .2s" }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: "#fff", borderRadius: 8, overflow: "hidden", border: "2px solid var(--border)", boxShadow: "var(--shadow-sm)", marginBottom: "3rem" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--navy)" }}>
                    {["Plot Type", "Total Area", "Dimensions", "Road Width", "Details"].map((h, i) => (
                      <th key={i} style={{ fontFamily: "var(--sans)", fontSize: ".58rem", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", fontWeight: 600, padding: "1rem 1.25rem", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {units.map((u, i) => (
                    <tr key={i} onMouseEnter={() => setHovRow(i)} onMouseLeave={() => setHovRow(null)} onClick={onEnquire}
                      style={{ borderBottom: "2px solid var(--border)", background: hovRow === i ? "var(--navy-pale)" : (i % 2 === 0 ? "#fff" : "var(--off-white)"), transition: "background .2s", cursor: "pointer" }}>
                      <td style={{ padding: "1.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: "var(--serif)", fontSize: "1rem", fontWeight: 600, color: "var(--navy)" }}>{u.type}</span>
                          <span style={{ fontFamily: "var(--sans)", fontSize: ".48rem", letterSpacing: ".15em", textTransform: "uppercase", padding: "3px 8px", background: tagStyles[u.tag]?.bg, color: tagStyles[u.tag]?.color, borderRadius: 3, fontWeight: 600 }}>{u.tag}</span>
                        </div>
                      </td>
                      <td style={{ padding: "1.25rem", fontFamily: "var(--sans)", fontSize: ".8rem", color: "var(--text-muted)", fontWeight: 500 }}>{u.area}</td>
                      <td style={{ padding: "1.25rem", fontFamily: "var(--sans)", fontSize: ".8rem", color: "var(--text-muted)", fontWeight: 500 }}>{u.carpet}</td>
                      <td style={{ padding: "1.25rem", fontFamily: "var(--sans)", fontSize: ".8rem", color: "var(--text-dim)", fontWeight: 500 }}>{u.floor}</td>
                      <td style={{ padding: "1.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <span style={{ fontFamily: "var(--sans)", fontSize: ".75rem", color: "var(--text-dim)", fontWeight: 400 }}>{u.config}</span>
                          {hovRow === i && <span style={{ fontFamily: "var(--sans)", fontSize: ".58rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--green)", fontWeight: 700, whiteSpace: "nowrap" }}>Enquire →</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: bp.isDesktop ? "1.4fr 1fr" : "1fr", gap: bp.isDesktop ? 48 : 28, alignItems: "stretch" }}>
          <Reveal>
            <div style={{ background: "#fff", border: "2px solid var(--border)", borderRadius: 8, padding: bp.isXs ? "1.5rem" : "2rem", height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
                <div style={{ width: 4, height: 28, background: "var(--green)", borderRadius: 2 }} />
                <span style={{ fontFamily: "var(--sans)", fontSize: ".62rem", letterSpacing: ".22em", textTransform: "uppercase", color: "var(--navy)", fontWeight: 700 }}>What's Included</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: bp.isXs ? "1fr" : "1fr 1fr", gap: "1rem" }}>
                {includes.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ width: 18, height: 18, background: "var(--green-pale)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <span style={{ color: "var(--green)", fontSize: ".55rem", fontWeight: 700 }}>✓</span>
                    </div>
                    <span style={{ fontFamily: "var(--sans)", fontSize: ".75rem", fontWeight: 400, color: "var(--text-muted)", lineHeight: 1.6 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div style={{ background: "var(--navy)", borderRadius: 8, padding: bp.isXs ? "1.5rem" : "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", minHeight: 220 }}>
              <div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? "1.4rem" : "2rem", fontWeight: 600, color: "#fff", lineHeight: 1.1, marginBottom: ".75rem" }}>Flexible<br />Payment Plans</h3>
                <p style={{ fontFamily: "var(--sans)", fontSize: ".78rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.8, marginBottom: "1.5rem" }}>Down-payment, EMI, construction-linked & subvention plans available. Speak to our team.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <GreenBtn onClick={onEnquire}>Request Price Sheet</GreenBtn>
                <a href="tel:+919205974843" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "rgba(255,255,255,0.45)", fontFamily: "var(--sans)", fontSize: ".65rem", fontWeight: 500 }}>
                  <span style={{ color: "var(--green)", fontSize: ".8rem" }}>●</span> +91 9205974843
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══ LOCATION ═══ */
function LocationSection() {
  const bp = useBreakpoint();
  const [activeGroup, setActiveGroup] = useState(0);
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.06 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const landmarkGroups = [
    { label: "Aviation & Transit", icon: "✈️", color: "#1a4a6b", items: [
      { name: "Jewar International Airport", dist: "12 km", time: "15 min", icon: "✈️" },
      { name: "Yamuna Expressway Entry/Exit", dist: "2 km", time: "3 min", icon: "🛣️" },
      { name: "Noida–Greater Noida Expressway", dist: "10 km", time: "12 min", icon: "🚗" },
    ]},
    { label: "Entertainment", icon: "🏎️", color: "#3a6b44", items: [
      { name: "Formula 1 Circuit (Buddh)", dist: "8 km", time: "10 min", icon: "🏎️" },
      { name: "Proposed Film City (UP Govt.)", dist: "6 km", time: "8 min", icon: "🎬" },
      { name: "Taj Mahal, Agra", dist: "160 km", time: "90 min", icon: "🕌" },
    ]},
    { label: "Education & Business", icon: "🏫", color: "#1a4a6b", items: [
      { name: "Sharda University", dist: "5 km", time: "7 min", icon: "🎓" },
      { name: "Greater Noida Industrial Area", dist: "14 km", time: "18 min", icon: "🏭" },
      { name: "Knowledge Park III", dist: "18 km", time: "22 min", icon: "🏛️" },
    ]},
  ];

  const activeG = landmarkGroups[activeGroup];

  return (
    <section id="location" ref={ref} style={{ padding: `${vPad(bp)} 0`, background: "#fff" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: `0 ${hPad(bp)}` }}>
        <Reveal>
          <div style={{ display: "grid", gridTemplateColumns: bp.isDesktop ? "1fr 1fr" : "1fr", gap: "2rem", marginBottom: "3rem", alignItems: "end" }}>
            <div>
              <Eyebrow label="Location" />
              <h2 style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? "1.8rem" : "clamp(2rem,4vw,3.5rem)", fontWeight: 600, color: "var(--navy)", lineHeight: 1.1 }}>
                At the Heart of<br />India's Growth Corridor
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p style={{ fontFamily: "var(--sans)", fontSize: ".85rem", color: "var(--text-muted)", lineHeight: 1.9 }}>Sector 22D, YEIDA — strategically placed at the epicentre of UP's most ambitious development axis.</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--navy-pale)", borderRadius: 6, padding: "10px 16px", width: "fit-content" }}>
                <span style={{ fontSize: "1.1rem" }}>📍</span>
                <span style={{ fontFamily: "var(--sans)", fontSize: ".72rem", fontWeight: 600, color: "var(--navy)" }}>Sector 22D, YEIDA, Greater Noida — 201308</span>
              </div>
            </div>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: bp.isMobile ? "1fr" : bp.isTablet ? "1fr" : "1.4fr 1fr", gap: 4, opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)", transition: "opacity .8s ease, transform .8s ease" }}>
          <div style={{ borderRadius: 8, overflow: "hidden", boxShadow: "var(--shadow-lg)", border: "2px solid var(--border)", position: "relative" }}>
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112078.60!2d77.5600!3d28.3200!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce8b900000001%3A0x1!2sYamuna+Expressway%2C+Uttar+Pradesh!5e0!3m2!1sen!2sin!4v1" width="100%" height={bp.isXs ? 240 : bp.isMobile ? 300 : 480} style={{ display: "block", border: "none" }} loading="lazy" title="Location" />
            <div style={{ background: "var(--navy)", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, background: "var(--green)", borderRadius: "50%", boxShadow: "0 0 8px rgba(85,115,75,0.8)", animation: "pulse-ring 2s infinite" }} />
                <span style={{ fontFamily: "var(--sans)", fontSize: ".7rem", fontWeight: 600, color: "#fff" }}>Live Project Location</span>
              </div>
              <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--sans)", fontSize: ".62rem", color: "rgba(255,255,255,0.5)", textDecoration: "none", fontWeight: 500 }}>Open in Google Maps →</a>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", gap: 4 }}>
              {landmarkGroups.map((g, i) => (
                <button key={i} onClick={() => setActiveGroup(i)}
                  style={{ flex: 1, background: activeGroup === i ? g.color : "#fff", border: `2px solid ${activeGroup === i ? g.color : "var(--border)"}`, borderRadius: 6, padding: "10px 6px", cursor: "pointer", transition: "all .3s", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontFamily: "var(--sans)", fontSize: ".5rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: activeGroup === i ? "#fff" : "var(--text-muted)", transition: "color .3s" }}>{g.label}</span>
                </button>
              ))}
            </div>

            <div style={{ background: "#fff", border: "2px solid var(--border)", borderRadius: 8, overflow: "hidden", flex: 1 }}>
              <div style={{ background: activeG.color, padding: "1rem 1.5rem" }}>
                <div style={{ fontFamily: "var(--sans)", fontSize: ".6rem", letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", fontWeight: 600, marginBottom: 2 }}>Nearby</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", fontWeight: 600, color: "#fff" }}>{activeG.label}</div>
              </div>
              {activeG.items.map((lm, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 1.5rem", borderBottom: i < activeG.items.length - 1 ? "1px solid var(--border)" : "none", transition: "background .2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--off-white)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <span style={{ fontFamily: "var(--sans)", fontSize: ".78rem", fontWeight: 500, color: "var(--navy)" }}>{lm.name}</span>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                    <div style={{ fontFamily: "var(--serif)", fontSize: ".95rem", fontWeight: 700, color: activeG.color, lineHeight: 1 }}>{lm.dist}</div>
                    <div style={{ fontFamily: "var(--sans)", fontSize: ".56rem", color: "var(--text-dim)", fontWeight: 500, marginTop: 2 }}>{lm.time} drive</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {[{ val: "2 km", label: "From Expressway" }, { val: "12 km", label: "From Airport" }].map((s, i) => (
                <div key={i} style={{ background: i === 0 ? "var(--navy)" : "var(--off-white)", border: "2px solid var(--border)", borderRadius: 6, padding: "1.1rem 1.25rem" }}>
                  <div style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: "1.6rem", fontWeight: 700, color: i === 0 ? "#fff" : "var(--navy)", lineHeight: 1, marginBottom: 3 }}>{s.val}</div>
                  <div style={{ fontFamily: "var(--sans)", fontSize: ".58rem", fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: i === 0 ? "rgba(255,255,255,0.55)" : "var(--text-dim)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══ CONTACT ═══ */
function ContactSection({ onEnquire }) {
  const bp = useBreakpoint();
  return (
    <section style={{ padding: `${vPad(bp)} 0`, background: "var(--off-white)", borderTop: "2px solid var(--border)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: `0 ${hPad(bp)}` }}>
        <div style={{ display: "grid", gridTemplateColumns: bp.isDesktop ? "1fr 1fr" : "1fr", gap: bp.isDesktop ? 80 : 40, alignItems: "center" }}>
          <Reveal>
            <Eyebrow label="Visit Us" />
            <h2 style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? "1.8rem" : "clamp(2rem,4vw,3.5rem)", fontWeight: 600, color: "var(--navy)", marginBottom: "2rem", lineHeight: 1.1 }}>The Experience Awaits You</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {[
                { icon: "📍", title: "Site Address", lines: ["Sector 22D, YEIDA", "Yamuna Expressway, Greater Noida — 201308"] },
                { icon: "📞", title: "Sales", lines: ["+91 92059 74843"] },
                { icon: "✉️", title: "Email", lines: ["info@residentialplots.com"] },
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontFamily: "var(--sans)", fontSize: ".58rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--green)", fontWeight: 700, marginBottom: 4 }}>{c.title}</div>
                    {c.lines.map((line, j) => <div key={j} style={{ fontFamily: "var(--sans)", fontSize: ".82rem", color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.8 }}>{line}</div>)}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={bp.isDesktop ? .15 : 0}>
            <div style={{ background: "#fff", border: "2px solid var(--border)", borderRadius: 12, padding: bp.isXs ? "1.5rem" : "2.5rem", boxShadow: "var(--shadow-md)", marginTop: bp.isDesktop ? 0 : "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: ".5rem" }}>
                <div style={{ width: 4, height: 36, background: "var(--navy)", borderRadius: 2 }} />
                <div>
                  <h3 style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? "1.4rem" : "1.8rem", fontWeight: 600, color: "var(--navy)" }}>Schedule a Visit</h3>
                  <p style={{ fontFamily: "var(--sans)", fontSize: ".72rem", color: "var(--text-dim)", marginTop: 2, fontWeight: 400 }}>Walk the land that will become your legacy.</p>
                </div>
              </div>
              <div style={{ height: 2, background: "var(--border)", margin: "1.5rem 0" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {["Full Name", "Phone Number", "Email Address"].map(ph => (
                  <div key={ph}>
                    <label style={{ display: "block", fontFamily: "var(--sans)", fontSize: ".58rem", letterSpacing: ".15em", textTransform: "uppercase", color: "var(--navy)", fontWeight: 700, marginBottom: 6 }}>{ph}</label>
                    <input placeholder={`Enter your ${ph.toLowerCase()}`}
                      style={{ width: "100%", background: "var(--off-white)", border: "2px solid var(--border)", outline: "none", color: "var(--navy)", fontFamily: "var(--sans)", fontSize: ".85rem", fontWeight: 500, padding: "10px 14px", borderRadius: 6, transition: "border-color .2s" }}
                      onFocus={e => e.target.style.borderColor = "var(--navy)"}
                      onBlur={e => e.target.style.borderColor = "var(--border)"} />
                  </div>
                ))}
                <GreenBtn onClick={onEnquire}>Book Appointment</GreenBtn>
                <p style={{ textAlign: "center", fontFamily: "var(--sans)", fontSize: ".6rem", color: "var(--text-dim)", fontWeight: 400 }}>We respect your privacy. No spam ever.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══ FOOTER — renamed, same bg as disclaimer ═══ */
function Footer() {
  const bp = useBreakpoint();
  const links = {
    "Project": ["Overview", "Plot Sizes", "Price List", "Gallery", "Amenities"],
    "Company": ["About Anant Raj", "Careers", "Press"],
    "Legal": ["Privacy Policy", "Terms", "YEIDA Info"],
  };

  return (
    // Same background as disclaimer: #04223f
    <footer style={{ background: "#04223f", padding: bp.isXs ? "48px 1rem 28px" : "72px 2rem 40px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: bp.isXs ? "1fr" : bp.isMobile ? "1fr 1fr" : bp.isDesktop ? "2fr 1fr 1fr 1fr" : "1fr 1fr", gap: bp.isXs ? 28 : 40, marginBottom: 48 }}>
          <div>
            {/* Changed name from "Anant Raj" to "Residential Plots" */}
            <div style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", fontWeight: 700, color: "#fff", marginBottom: "1rem", letterSpacing: ".05em" }}>Residential Plots</div>
            <p style={{ fontFamily: "var(--sans)", fontSize: ".75rem", color: "rgba(255,255,255,0.35)", lineHeight: 1.9, marginBottom: "1.5rem", maxWidth: 220, fontWeight: 400 }}>
              Redefining land ownership on the Yamuna Expressway corridor.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {["Fb", "Tw", "In", "Li"].map(s => (
                <a key={s} href="#"
                  style={{ width: 32, height: 32, border: "2px solid rgba(255,255,255,0.12)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--sans)", fontSize: ".6rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>{s}</a>
              ))}
            </div>
          </div>
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <div style={{ fontFamily: "var(--sans)", fontSize: ".58rem", letterSpacing: ".22em", textTransform: "uppercase", color: "var(--green)", fontWeight: 700, marginBottom: "1.2rem" }}>{group}</div>
              <ul style={{ listStyle: "none" }}>
                {items.map(item => (
                  <li key={item} style={{ marginBottom: ".7rem" }}>
                    <a href="#" style={{ fontFamily: "var(--sans)", fontSize: ".75rem", fontWeight: 400, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.5rem", flexWrap: "wrap", gap: ".5rem" }}>
          <p style={{ fontFamily: "var(--sans)", fontSize: ".62rem", color: "rgba(255,255,255,0.2)", fontWeight: 400 }}>© 2025 Anant Raj Limited. All Rights Reserved.</p>
          <p style={{ fontFamily: "var(--sans)", fontSize: ".62rem", color: "rgba(255,255,255,0.15)", fontWeight: 400 }}>YEIDA Reg. No. YEIDA/GN/2024/22D/001</p>
        </div>
      </div>
    </footer>
  );
}

/* ═══ DISCLAIMER ═══ */
function Disclaimer() {
  const bp = useBreakpoint();
  return (
    <div style={{ background: "#04223f", borderTop: "1px solid rgba(255,255,255,0.06)", padding: bp.isXs ? "1.75rem 1rem" : "2.5rem 2rem" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <p style={{ fontFamily: "var(--sans)", fontSize: ".65rem", fontWeight: 400, color: "rgba(255,255,255,0.18)", lineHeight: 1.9, marginBottom: ".75rem" }}>
          <strong style={{ color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>Legal Disclaimer: </strong>
          This website is for informational purposes only and does not constitute an offer or inducement to invest. All content including images, plot dimensions, pricing, and amenities are tentative and indicative. Prospective buyers are advised to independently verify all details and consult legal/financial advisors before making any decision. Anant Raj Limited shall not be liable for claims arising from reliance on information provided herein.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem" }}>
          {["Privacy Policy", "Terms of Use", "Cookie Policy", "YEIDA Details"].map(link => (
            <a key={link} href="#" style={{ fontFamily: "var(--sans)", fontSize: ".6rem", color: "rgba(255,255,255,0.18)", textDecoration: "none", fontWeight: 400 }}>{link}</a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══ MODAL ═══ */
function Modal({ open, onClose }) {
  const bp = useBreakpoint();
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(7,49,90,0.7)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", animation: "fadeIn .25s ease" }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: "#fff", width: "100%", maxWidth: 480, borderRadius: 12, overflow: "hidden", boxShadow: "0 40px 80px rgba(7,49,90,0.3)", maxHeight: "92svh", overflowY: "auto" }}>
        <div style={{ height: 4, background: "linear-gradient(to right, var(--navy), var(--green))" }} />
        <div style={{ padding: bp.isXs ? "1.5rem" : "2.5rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.75rem" }}>
            <div>
              <Eyebrow label="Enquire Now" />
              <h3 style={{ fontFamily: "var(--serif)", fontSize: bp.isXs ? "1.6rem" : "2.2rem", fontWeight: 600, color: "var(--navy)" }}>Register Interest</h3>
              <p style={{ fontFamily: "var(--sans)", fontSize: ".73rem", color: "var(--text-muted)", marginTop: ".25rem", fontWeight: 400 }}>Our team will reach out within 24 hours.</p>
            </div>
            <button onClick={onClose} style={{ background: "var(--off-white)", border: "none", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--navy)", flexShrink: 0, marginLeft: 12 }}>×</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {["Full Name", "Phone Number", "Email Address"].map(ph => (
              <div key={ph}>
                <label style={{ display: "block", fontFamily: "var(--sans)", fontSize: ".58rem", letterSpacing: ".15em", textTransform: "uppercase", color: "var(--navy)", fontWeight: 700, marginBottom: 6 }}>{ph}</label>
                <input placeholder={`Enter your ${ph.toLowerCase()}`}
                  style={{ width: "100%", background: "var(--off-white)", border: "2px solid var(--border)", outline: "none", color: "var(--navy)", fontFamily: "var(--sans)", fontSize: ".85rem", fontWeight: 500, padding: "10px 14px", borderRadius: 6 }} />
              </div>
            ))}
            <GreenBtn onClick={onClose}>Submit Enquiry</GreenBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ AUTO POPUP ═══ */
function AutoPopup({ open, onClose }) {
  const bp = useBreakpoint();
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(7,49,90,0.65)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center", padding: bp.isXs ? ".75rem" : "1rem", animation: "fadeIn .5s ease" }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: "#fff", width: "100%", maxWidth: bp.isMobile ? 380 : 720, borderRadius: 12, overflow: "hidden", display: "grid", gridTemplateColumns: bp.isMobile ? "1fr" : "1fr 1fr", boxShadow: "0 40px 80px rgba(7,49,90,0.4)", maxHeight: "90svh", overflowY: "auto" }}>
        {!bp.isMobile && (
          <div style={{ position: "relative", minHeight: 380, overflow: "hidden" }}>
            <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} alt="" />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(7,49,90,0.9) 0%, rgba(7,49,90,0.3) 60%)" }} />
            <div style={{ position: "absolute", bottom: "2rem", left: "2rem" }}>
              <Eyebrow label="Limited Preview" light />
              <h3 style={{ fontFamily: "var(--serif)", fontSize: "2.2rem", fontWeight: 600, color: "#fff", lineHeight: 1.1 }}>Exclusive<br />Early Access</h3>
            </div>
          </div>
        )}
        <div style={{ padding: bp.isXs ? "2rem 1.5rem" : "2.5rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
            {bp.isMobile && <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", fontWeight: 600, color: "var(--navy)" }}>Exclusive Access</h3>}
            {!bp.isMobile && <div />}
            <button onClick={onClose} style={{ background: "var(--off-white)", border: "none", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--navy)", flexShrink: 0 }}>×</button>
          </div>
          <p style={{ fontFamily: "var(--sans)", fontSize: ".78rem", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.75rem", fontWeight: 400 }}>
            Be first to receive plot availability, pricing, and preview invitations for Anant Raj Yamuna Expressway.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "1.75rem" }}>
            {["Full Name", "Phone Number"].map(ph => (
              <div key={ph}>
                <label style={{ display: "block", fontFamily: "var(--sans)", fontSize: ".58rem", letterSpacing: ".15em", textTransform: "uppercase", color: "var(--navy)", fontWeight: 700, marginBottom: 6 }}>{ph}</label>
                <input placeholder={`Enter ${ph.toLowerCase()}`}
                  style={{ width: "100%", background: "var(--off-white)", border: "2px solid var(--border)", outline: "none", color: "var(--navy)", fontFamily: "var(--sans)", fontSize: ".85rem", fontWeight: 500, padding: "10px 14px", borderRadius: 6 }} />
              </div>
            ))}
          </div>
          <GreenBtn>Get Early Access</GreenBtn>
        </div>
      </div>
    </div>
  );
}

/* ═══ STICKY BOTTOM CTA ═══ */
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
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90, display: "grid", gridTemplateColumns: "1fr 1fr", background: "#fff", borderTop: "2px solid var(--border)", boxShadow: "0 -4px 20px rgba(7,49,90,0.1)", paddingBottom: "env(safe-area-inset-bottom,0px)", animation: "fadeUp .4s ease" }}>
      <a href="tel:+919205974843" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "15px", textDecoration: "none", borderRight: "2px solid var(--border)", color: "var(--navy)", fontFamily: "var(--sans)", fontSize: ".65rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>
        📞 Call
      </a>
      <button onClick={onEnquire} style={{ background: "var(--green)", border: "none", color: "#fff", fontFamily: "var(--sans)", fontSize: ".65rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "15px", cursor: "pointer" }}>
        Enquire Now
      </button>
    </div>
  );
}

/* ═══ SIDEBAR — visible at 1024px+ (isWide) ═══ */
function Sidebar({ onEnquire }) {
  return (
    <div style={{ position: "sticky", top: 76, padding: "2rem 1.75rem", background: "#fff", borderLeft: "2px solid var(--border)", height: "calc(100vh - 76px)", overflowY: "auto" }}>
      <div style={{ borderBottom: "2px solid var(--border)", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: "var(--sans)", fontSize: ".55rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--green)", fontWeight: 700, marginBottom: ".5rem" }}>Plot Sizes</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", fontWeight: 600, color: "var(--navy)", lineHeight: 1.2 }}>100 – 500 sq.yd</div>
        <div style={{ fontFamily: "var(--sans)", fontSize: ".65rem", color: "var(--text-dim)", marginTop: 6, fontWeight: 500 }}>Yamuna Expressway, Sector 22D</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "1.5rem" }}>
        {["Full Name", "Email", "Phone"].map(ph => (
          <div key={ph}>
            <label style={{ display: "block", fontFamily: "var(--sans)", fontSize: ".55rem", letterSpacing: ".15em", textTransform: "uppercase", color: "var(--navy)", fontWeight: 700, marginBottom: 6 }}>{ph}</label>
            <input placeholder={`Enter ${ph}`}
              style={{ width: "100%", background: "var(--off-white)", border: "2px solid var(--border)", outline: "none", color: "var(--navy)", fontFamily: "var(--sans)", fontSize: ".8rem", fontWeight: 500, padding: "9px 12px", borderRadius: 6 }} />
          </div>
        ))}
      </div>
      <GreenBtn onClick={onEnquire}>Request Callback</GreenBtn>
      <div style={{ borderTop: "2px solid var(--border)", paddingTop: "1.5rem", marginTop: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, background: "var(--navy)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>📞</div>
          <div>
            <div style={{ fontFamily: "var(--sans)", fontSize: ".78rem", fontWeight: 600, color: "var(--navy)" }}>+91 92059 74843</div>
            <div style={{ fontFamily: "var(--sans)", fontSize: ".6rem", color: "var(--text-dim)", marginTop: 2, fontWeight: 400 }}>Available 9am – 8pm</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ APP ═══ */
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
    <div>
      <style>{GLOBAL_CSS}</style>
      <Navbar onEnquire={openModal} />
      <Hero onEnquire={openModal} />

      {/* Sidebar layout: shows at isWide (1024px+) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: bp.isWide ? "1fr 300px" : "1fr",
        alignItems: "start",
      }}>
        <div>
          <StorySection />
          <QuoteBanner />
          <GallerySection onEnquire={openModal} />
          <AmenitiesSection />
          <FloorPlanSection onEnquire={openModal} />
          <PriceListSection onEnquire={openModal} />
          <LocationSection />
          <ContactSection onEnquire={openModal} />
        </div>
        {bp.isWide && <Sidebar onEnquire={openModal} />}
      </div>

      <Footer />
      <Disclaimer />

      <StickyBottomCTA onEnquire={openModal} />
      <Modal open={modal} onClose={() => setModal(false)} />
      <AutoPopup open={autoPopup} onClose={() => setAutoPopup(false)} />
      {bp.isMobile && <div style={{ height: 56 }} />}
    </div>
  );
}