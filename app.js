"use strict";
/* LINE: shared data and page scripts. Each page has <main data-page="...">. */
const $ = (s, r = document) => r.querySelector(s);
function ld(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
function sv(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage may be blocked */ } }

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TYPES = [
  ["cardio", "Cardio", "Raises your heart rate and builds stamina."],
  ["weight", "Weight training", "Builds strong muscles and bones."],
  ["flex", "Flexibility", "Keeps your body loose and lowers injury risk."],
  ["balance", "Balance", "Improves control and coordination."],
  ["outdoor", "Outdoor", "Fresh air, daylight and a better mood."],
  ["team", "Team sports", "Play with friends and build teamwork."]
];
const FREE = ["free", "Free training", "Your own plan."];
const tname = id => (TYPES.find(t => t[0] === id) || FREE)[1];

/* [name, type, body parts, best time, how] */
const EX = [
  ["Jogging", "cardio", ["Legs", "Heart and lungs"], "Morning or after school", "Run at an easy pace. You should still be able to talk."],
  ["Skipping rope", "cardio", ["Legs", "Heart and lungs"], "Warm-up or after school", "Jump with small hops. Keep your elbows close to your body."],
  ["Jumping jacks", "cardio", ["Full body"], "Warm-up, any time", "Jump your feet out and clap your hands overhead."],
  ["Dancing", "cardio", ["Full body", "Heart and lungs"], "Any time, great with music", "Put on a song and keep moving until it ends."],
  ["Swimming", "cardio", ["Full body", "Heart and lungs"], "Weekend or after school", "Swim at a steady pace. Only swim where it is safe."],
  ["Push-ups", "weight", ["Chest", "Arms", "Shoulders"], "Morning or after school", "Keep your body in a straight line. Go down slowly, then push up."],
  ["Squats", "weight", ["Legs", "Glutes"], "After a warm-up", "Sit back like on a chair. Keep your knees over your toes."],
  ["Plank", "weight", ["Core", "Back"], "After a warm-up", "Hold a straight line on your forearms and toes."],
  ["Lunges", "weight", ["Legs", "Glutes"], "After a warm-up", "Step forward and lower your body. Switch legs."],
  ["Backpack lifts", "weight", ["Arms", "Back", "Shoulders"], "Afternoon, after a warm-up", "Fill a backpack with books. Lift it to your chest, slowly."],
  ["Yoga flow", "flex", ["Full body"], "Evening or before sleep", "Move slowly from pose to pose. Breathe deeply."],
  ["Hamstring stretch", "flex", ["Legs"], "After exercise", "Reach for your toes to stretch the back of your legs. Hold 20 seconds."],
  ["Cat-cow", "flex", ["Back", "Core"], "Morning", "On hands and knees, round your back, then arch it."],
  ["Shoulder stretch", "flex", ["Shoulders", "Back"], "After studying", "Pull one arm across your chest. Hold 20 seconds, then switch."],
  ["Child's pose", "flex", ["Back", "Hips"], "Before sleep", "Sit on your heels, reach forward and relax."],
  ["One-leg stand", "balance", ["Legs", "Core", "Balance"], "While brushing your teeth", "Stand on one leg for 30 seconds. Then switch."],
  ["Heel-to-toe walk", "balance", ["Legs", "Balance"], "Warm-up or any time", "Walk in a straight line. Each heel touches the other toe."],
  ["Tree pose", "balance", ["Legs", "Core", "Balance"], "Morning or evening", "Stand on one leg, other foot on your calf. Hands together."],
  ["Ball catch", "balance", ["Arms", "Balance"], "After school, with a friend", "Throw and catch a ball while you stand on one leg."],
  ["Side-step shuffle", "balance", ["Legs", "Balance"], "After a warm-up", "Step quickly from side to side in a low stance."],
  ["Park walk", "outdoor", ["Legs", "Heart and lungs"], "After school or in the evening", "Walk fast enough to feel warm."],
  ["Stair climbing", "outdoor", ["Legs", "Glutes"], "After a warm-up", "Climb at a steady pace. Walk down slowly."],
  ["Bike ride", "outdoor", ["Legs", "Heart and lungs"], "Weekend or after school", "Pick a safe route and wear a helmet."],
  ["Hiking", "outdoor", ["Legs", "Heart and lungs"], "Weekend", "Wear good shoes. Take water and a friend."],
  ["Relay races", "team", ["Full body", "Heart and lungs"], "Any time, with a group", "Run short laps and pass a baton to your teammate."],
  ["Badminton", "team", ["Arms", "Legs"], "After school", "Play a friendly game. Keep the shuttle in the air."],
  ["Basketball", "team", ["Full body", "Heart and lungs"], "After school or weekend", "Dribble, pass and shoot with your team."],
  ["Volleyball", "team", ["Arms", "Legs"], "After school or weekend", "Pass the ball over the net with your team."],
  ["Football", "team", ["Legs", "Heart and lungs"], "Weekend", "Play a full game. Run, pass and work as a team."]
];
const BY = Object.fromEntries(EX.map(e => [e[0], e]));

/* Weekly plan per type: Monday to Sunday, [exercise, minutes] or 0 for a rest day. Each week adds 5 minutes. */
const PLAN = {
  cardio:  [["Jogging", 25], ["Skipping rope", 20], ["Dancing", 25], 0, ["Swimming", 30], ["Jogging", 30], 0],
  weight:  [["Push-ups", 20], ["Squats", 20], ["Plank", 15], 0, ["Lunges", 20], ["Backpack lifts", 25], 0],
  flex:    [["Yoga flow", 25], ["Hamstring stretch", 15], ["Cat-cow", 15], 0, ["Shoulder stretch", 15], ["Yoga flow", 30], 0],
  balance: [["One-leg stand", 15], ["Heel-to-toe walk", 15], ["Tree pose", 15], 0, ["Ball catch", 20], ["Side-step shuffle", 20], 0],
  outdoor: [["Park walk", 30], ["Stair climbing", 20], ["Park walk", 30], 0, ["Bike ride", 40], ["Hiking", 60], 0],
  team:    [["Relay races", 25], ["Badminton", 30], ["Basketball", 40], 0, ["Volleyball", 40], ["Football", 60], 0]
};
function planFor(t) {
  const p = PLAN[t];
  return Array.from({ length: 28 }, (_, i) => { const e = p[i % 7]; return e ? [e[0], e[1] + 5 * Math.floor(i / 7)] : null; });
}
const doneCount = () => Object.values(ld("line_done", {})).filter(Boolean).length;

/* ---------- Home ---------- */
function home() {
  const n = doneCount();
  $("#pcount").innerHTML = "<strong>" + n + "</strong> of 28 days done";
  $("#fill").style.width = (n / 28 * 100) + "%";
}

/* ---------- Exercises ---------- */
function exercises() {
  let f = "all", b = "all";
  const chips = $("#tchips"), sel = $("#bsel"), list = $("#exlist");
  chips.innerHTML = [["all", "All"]].concat(TYPES).map(t => '<button type="button" class="opt" data-t="' + t[0] + '">' + t[1] + "</button>").join("");
  const parts = Array.from(new Set(EX.flatMap(e => e[2]))).sort();
  sel.innerHTML = '<option value="all">All body parts</option>' + parts.map(p => "<option>" + p + "</option>").join("");
  function draw() {
    const r = EX.filter(e => (f === "all" || e[1] === f) && (b === "all" || e[2].includes(b)));
    list.innerHTML = r.map(e =>
      '<article class="card ex"><p class="eyebrow">' + tname(e[1]) + "</p><h3>" + e[0] + "</h3>" +
      '<p class="tags">' + e[2].map(x => '<span class="chip">' + x + "</span>").join("") + "</p>" +
      "<dl><dt>Best time</dt><dd>" + e[3] + "</dd><dt>How</dt><dd>" + e[4] + "</dd></dl></article>").join("");
    $("#ecount").textContent = r.length + (r.length === 1 ? " exercise" : " exercises");
    chips.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.t === f)));
  }
  chips.addEventListener("click", ev => { const x = ev.target.closest("button"); if (x) { f = x.dataset.t; draw(); } });
  sel.addEventListener("change", () => { b = sel.value; draw(); });
  draw();
}

/* ---------- Calendar ---------- */
function calendar() {
  let type = ld("line_type", "cardio"), wk = 0, free = ld("line_free", null), done = ld("line_done", {});
  if (!Array.isArray(free) || free.length !== 28) free = null;
  if (type === "free" && !free) type = "cardio";
  if (type !== "free" && !PLAN[type]) type = "cardio";
  const plan = () => (type === "free" ? free : planFor(type));
  const opts = '<option value="">Rest day</option>' + TYPES.map(t =>
    '<optgroup label="' + t[1] + '">' + EX.filter(e => e[1] === t[0]).map(e => "<option>" + e[0] + "</option>").join("") + "</optgroup>").join("");

  $("#types").innerHTML = TYPES.concat([FREE]).map(t => '<button type="button" class="opt" data-t="' + t[0] + '">' + t[1] + "</button>").join("");
  $("#wtabs").innerHTML = [0, 1, 2, 3].map(i => '<button type="button" class="opt" data-w="' + i + '">Week ' + (i + 1) + "</button>").join("");

  function head() {
    document.querySelectorAll("#types button").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.t === type)));
    document.querySelectorAll("#wtabs button").forEach(x => x.setAttribute("aria-pressed", String(+x.dataset.w === wk)));
    const t = TYPES.find(x => x[0] === type);
    $("#tnote").textContent = type === "free"
      ? "Free training: pick an exercise and the minutes for any day. Your changes are saved on this device."
      : t[1] + ": " + t[2] + " Each week adds 5 minutes. This plan is fixed. Choose Free training to change days.";
    $("#ccount").textContent = Object.values(done).filter(Boolean).length + " of 28 days done";
  }
  function ov() {
    const p = plan();
    $("#ov").innerHTML = Array.from({ length: 28 }, (_, i) => {
      const e = p[i], w = Math.floor(i / 7);
      return '<button type="button" class="' + (e ? "" : "rest") + (done[i] ? " done" : "") + '" data-w="' + w + '"' + (w === wk ? " data-cur" : "") +
        ' aria-label="Day ' + (i + 1) + ": " + (e ? e[0] + ", " + e[1] + " min" : "rest day") + (done[i] ? ", done" : "") + '">' + (i + 1) + "</button>";
    }).join("");
  }
  function rows() {
    const p = plan(), ed = type === "free";
    $("#days").innerHTML = DAYS.map((d, j) => {
      const i = wk * 7 + j, e = p[i], dn = !!done[i];
      const name = ed
        ? '<select id="s' + i + '" data-i="' + i + '" data-f="ex" aria-label="Exercise on ' + d + ', week ' + (wk + 1) + '">' + opts + "</select>"
        : "<strong>" + (e ? e[0] : "Rest day") + "</strong>";
      const sub = e ? BY[e[0]][2].join(", ") : "Let your body recover";
      const mn = ed
        ? '<label><input type="number" id="m' + i + '" data-i="' + i + '" data-f="min" min="5" max="120" step="5" value="' + (e ? e[1] : "") + '"' + (e ? "" : " disabled") + ' aria-label="Minutes on ' + d + '"> min</label>'
        : (e ? e[1] + " min" : "");
      return '<li class="day' + (dn ? " done" : "") + '"><div class="dn"><b>' + d.slice(0, 3) + "</b><span>Day " + (i + 1) + "</span></div>" +
        '<div class="ex">' + name + "<small>" + sub + "</small></div><div class=\"mn\">" + mn + "</div>" +
        '<label class="ck"><input type="checkbox" data-i="' + i + '" data-f="done"' + (dn ? " checked" : "") + ' aria-label="Day ' + (i + 1) + ' done"> Done</label></li>';
    }).join("");
    if (ed) p.slice(wk * 7, wk * 7 + 7).forEach((e, j) => { $("#s" + (wk * 7 + j)).value = e ? e[0] : ""; });
  }
  function all() { head(); ov(); rows(); }

  $("#days").addEventListener("change", ev => {
    const t = ev.target, f = t.dataset.f;
    if (!f) return;
    const i = +t.dataset.i;
    if (f === "done") { if (t.checked) done[i] = true; else delete done[i]; sv("line_done", done); }
    else if (type === "free") {
      if (f === "ex") free[i] = t.value ? [t.value, (free[i] && free[i][1]) || 20] : null;
      else if (free[i]) free[i][1] = Math.min(120, Math.max(5, Math.round(+t.value) || 20));
      sv("line_free", free);
    }
    all();
    const el = $('[data-i="' + i + '"][data-f="' + f + '"]');
    if (el) el.focus();
  });
  document.addEventListener("click", ev => {
    const b = ev.target.closest("button");
    if (!b) return;
    if (b.dataset.t) {
      if (b.dataset.t === "free" && !free) free = planFor(type);
      type = b.dataset.t;
      sv("line_type", type); sv("line_free", free);
      all();
    } else if (b.dataset.w !== undefined) { wk = +b.dataset.w; all(); }
  });
  all();
}

/* ---------- Habits ---------- */
function habits() {
  const today = new Date().toDateString();
  const EAT = ["Breakfast", "Fruit or vegetables at lunch", "Fruit or vegetables at dinner", "A healthy snack (fruit, nuts, yoghurt)", "No fizzy drinks or sweets"];
  let h = ld("line_hab", null);
  if (!h || h.d !== today || !Array.isArray(h.e)) h = { d: today, w: 0, e: [0, 0, 0, 0, 0] };
  let s = ld("line_sleep", { bed: "22:30", wake: "06:30" });

  $("#gl").innerHTML = [1, 2, 3, 4, 5, 6, 7, 8].map(n => '<button type="button" data-g="' + n + '" aria-label="Glass ' + n + '">' + n + "</button>").join("");
  $("#eat").innerHTML = EAT.map((t, i) => '<label><input type="checkbox" data-e="' + i + '"> ' + t + "</label>").join("");
  $("#bed").value = s.bed; $("#wake").value = s.wake;

  function slept() {
    if (!s.bed || !s.wake) return null;
    const a = s.bed.split(":").map(Number), b = s.wake.split(":").map(Number);
    return ((b[0] * 60 + b[1]) - (a[0] * 60 + a[1]) + 1440) % 1440;
  }
  function paint() {
    document.querySelectorAll("#gl button").forEach(x => x.setAttribute("aria-pressed", String(+x.dataset.g <= h.w)));
    document.querySelectorAll("#eat input").forEach(x => { x.checked = !!h.e[+x.dataset.e]; });
    $("#wl").textContent = h.w + " of 8 glasses today";
    const m = slept();
    let ok = 0, msg = "Set the time you went to bed and woke up.";
    if (m !== null) {
      msg = "You slept " + Math.floor(m / 60) + " h " + (m % 60) + " min. ";
      if (m < 480) msg += "Try to sleep 8 to 10 hours.";
      else if (m <= 600) { msg += "Great sleep!"; ok = 1; }
      else msg += "That is a lot. 8 to 10 hours is enough.";
    }
    $("#sres").textContent = msg;
    const total = h.w + h.e.filter(Boolean).length + ok;
    $("#sc").textContent = total;
    $("#sfill").style.width = (total / 14 * 100) + "%";
  }
  function save() { sv("line_hab", h); sv("line_sleep", s); paint(); }
  $("#gl").addEventListener("click", ev => { const b = ev.target.closest("button"); if (!b) return; const n = +b.dataset.g; h.w = h.w === n ? n - 1 : n; save(); });
  $("#eat").addEventListener("change", ev => { const i = ev.target.dataset.e; if (i !== undefined) { h.e[+i] = ev.target.checked ? 1 : 0; save(); } });
  $("#bed").addEventListener("input", ev => { s.bed = ev.target.value; save(); });
  $("#wake").addEventListener("input", ev => { s.wake = ev.target.value; save(); });
  paint();
}

const pageEl = document.querySelector("[data-page]");
if (pageEl) ({ home, exercises, calendar, habits })[pageEl.dataset.page]();
