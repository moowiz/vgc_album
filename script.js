/* ============================================================
   Hey. Reading the source is ❌ NOT ALLOWED ❌.
   Go work with your friends instead!
   https://bigwalk.game/faq/#outside-talk-anyway
   ============================================================ */

console.log(
  "%cHey. Reading the source is ❌ NOT ALLOWED ❌.\nGo work with your friends instead!",
  "font: 600 15px/1.5 system-ui, sans-serif; color: #cf5f4b;"
);

const gate     = document.getElementById("gate");
const album    = document.getElementById("album");
const terminal = document.getElementById("terminal");
const slots    = Array.from(document.querySelectorAll(".slot"));
const goBtn    = document.getElementById("go");
const clearBtn = document.getElementById("clear");

/* ---------------- sound: tiny generated tones, no audio files ---------------- */
let audio = null;
function audioCtx() {
  if (audio === null) {
    try { audio = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { audio = false; }
  }
  if (audio && audio.state === "suspended") audio.resume();
  return audio || null;
}
function tone({ freq, to = null, type = "sine", dur = 0.18, gain = 0.22, at = 0 }) {
  const ac = audioCtx();
  if (!ac) return;
  const t0 = ac.currentTime + at;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}
const BLOOPS = [392, 440, 494, 587, 659]; // G A B D E, rising
const bloop = (i, at) => tone({ freq: BLOOPS[i], to: BLOOPS[i] * 1.6, dur: 0.16, at });
const buzz  = ()      => tone({ freq: 150, to: 80, type: "sawtooth", dur: 0.3, gain: 0.1 });
const click = ()      => tone({ freq: 900, to: 500, type: "triangle", dur: 0.06, gain: 0.08 });
const ding  = (at)    => { tone({ freq: 784, dur: 0.55, gain: 0.16, at }); tone({ freq: 1175, dur: 0.7, gain: 0.1, at: at + 0.06 }); };

/* ---------------- slot behaviour ---------------- */
// Write `text` into consecutive slots starting at `from`, then focus the next one.
function fill(from, text) {
  for (let k = 0; from + k < slots.length && k < text.length; k++) slots[from + k].value = text[k];
  slots[Math.min(from + text.length, slots.length - 1)].focus();
}

slots.forEach((slot, i) => {
  slot.addEventListener("input", () => {
    const text = slot.value.replace(/\s/g, "").toUpperCase();
    if (text.length > 1) { fill(i, text); return; } // several chars at once: spread them out
    slot.value = text;
    if (text && i < slots.length - 1) slots[i + 1].focus();
  });
  slot.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !slot.value && i > 0) {
      slots[i - 1].value = "";
      slots[i - 1].focus();
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && i > 0) {
      slots[i - 1].focus(); e.preventDefault();
    } else if (e.key === "ArrowRight" && i < slots.length - 1) {
      slots[i + 1].focus(); e.preventDefault();
    }
  });
  slot.addEventListener("focus", () => slot.select());
  slot.addEventListener("paste", (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text").replace(/\s/g, "").toUpperCase();
    if (text) fill(i, text);
  });
});

clearBtn.addEventListener("click", () => {
  click();
  slots.forEach((s) => (s.value = ""));
  slots[0].focus();
});

terminal.addEventListener("submit", (e) => {
  e.preventDefault();
  submit();
});

/* ---------------- checking the answer ---------------- */
let busy = false;

function submit() {
  if (busy) return;
  const guess = slots.map((s) => s.value).join("");
  if (guess.toUpperCase() === ANSWER.toUpperCase()) unlock();
  else reject();
}

function reject() {
  buzz();
  terminal.classList.remove("shake");
  void terminal.offsetWidth; // restart the animation
  terminal.classList.add("shake");
  slots.forEach((s) => s.classList.add("wrong"));
  setTimeout(() => slots.forEach((s) => s.classList.remove("wrong")), 600);
  const firstEmpty = slots.find((s) => !s.value);
  (firstEmpty || slots[0]).focus();
}

function unlock() {
  busy = true;
  slots.forEach((s) => { s.disabled = true; s.blur(); });
  goBtn.classList.add("pressed");

  const step = 0.22; // seconds between bloops
  slots.forEach((s, i) => {
    bloop(i, i * step);
    setTimeout(() => s.classList.add("lit"), i * step * 1000);
  });
  const end = slots.length * step * 1000;
  ding(slots.length * step + 0.1);
  setTimeout(() => goBtn.classList.add("lit"), end + 100);
  setTimeout(reveal, end + 1000);
}

function reveal() {
  album.hidden = false;
  requestAnimationFrame(() => {
    gate.classList.add("open");
    album.classList.add("reveal");
  });
  window.scrollTo(0, 0);
  setTimeout(() => {
    gate.remove();
    document.body.classList.remove("locked");
  }, 1000);
}

/* ---------------- on load ---------------- */
// Nothing is remembered between page loads: every visit starts at the panel.
slots[0].focus();



















/* ------------------------------------------------------------
   Still here? The answer is below. Don't spoil it for yourself.
   Five characters, case doesn't matter.
   ------------------------------------------------------------ */
const ANSWER = "HONK!";
