/* ============================================================
   OUR SAFE HAVEN — script.js logic (inlined for single-file app)
   ============================================================ */

/* ---------- Mood Theme Engine ---------- */
const moodThemes = {
  default:{ '--bg-main':'#0d1220', '--bg-deep':'#070a12', '--accent':'#f6a8c2', '--accent-soft':'#f8c9db', '--accent-2':'#c9b8f5', '--card-border':'rgba(255,255,255,0.14)' },
  overwhelmed:{ '--bg-main':'#0a1a1c', '--bg-deep':'#060f11', '--accent':'#8fd9e0', '--accent-soft':'#c3edf0', '--accent-2':'#9fd8c9', '--card-border':'rgba(143,217,224,0.22)' },
  exhausted:{ '--bg-main':'#1c150b', '--bg-deep':'#120d06', '--accent':'#e9c98f', '--accent-soft':'#f3e0b8', '--accent-2':'#d9b389', '--card-border':'rgba(233,201,143,0.22)' },
  missing:{ '--bg-main':'#1a0f16', '--bg-deep':'#110a0f', '--accent':'#e8a6c4', '--accent-soft':'#f4cfe0', '--accent-2':'#d9a3c9', '--card-border':'rgba(232,166,196,0.24)' },
  sleep:{ '--bg-main':'#100c1e', '--bg-deep':'#0a0714', '--accent':'#b3a4e8', '--accent-soft':'#d9d0f5', '--accent-2':'#9a9de0', '--card-border':'rgba(179,164,232,0.24)' }
};

function applyMood(mood){
  const theme = moodThemes[mood] || moodThemes.default;
  const root = document.documentElement.style;
  Object.entries(theme).forEach(([k,v]) => root.setProperty(k, v));
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.toggle('active', b.dataset.mood === mood));
}

document.getElementById('mood-grid').addEventListener('click', (e) => {
  const btn = e.target.closest('.mood-btn');
  if(!btn) return;
  applyMood(btn.dataset.mood);
  if(btn.dataset.mood === 'missing'){
    openModal('Come here 🫶', "I know the distance feels loud right now. But you're never actually far from me, Pookie. I'm thinking of you this very second.", 'https://media1.tenor.com/m/OAUwkvqikboAAAAC/cosytales-couple.gif');
  }
});

/* ---------- Floating background hearts ---------- */
const heartField = document.getElementById('heart-field');
const heartGlyphs = ['💖','💕','💗','🤍','✨'];
function spawnHeart(){
  const h = document.createElement('div');
  h.className = 'floaty-heart';
  h.textContent = heartGlyphs[Math.floor(Math.random()*heartGlyphs.length)];
  const left = Math.random()*100;
  const duration = 9 + Math.random()*8;
  const size = 14 + Math.random()*16;
  const drift = (Math.random()*140 - 70) + 'px';
  h.style.left = left + 'vw';
  h.style.fontSize = size + 'px';
  h.style.animationDuration = duration + 's';
  h.style.setProperty('--drift', drift);
  heartField.appendChild(h);
  setTimeout(() => h.remove(), duration*1000 + 200);
}
for(let i=0;i<10;i++) setTimeout(spawnHeart, i*700);
setInterval(spawnHeart, 900);

/* ---------- Modal helpers ---------- */
const modalBackdrop = document.getElementById('modal-backdrop');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalGif = document.getElementById('modal-gif');
const modalGifFallback = document.getElementById('modal-gif-fallback');
function openModal(title, body, gifUrl){
  modalTitle.textContent = title;
  modalBody.textContent = body;
  modalGif.style.display = 'none';
  modalGifFallback.style.display = 'none';
  if(gifUrl){
    modalGif.onload = () => {
      modalGif.style.display = 'block';
      modalGifFallback.style.display = 'none';
    };
    modalGif.onerror = () => {
      modalGif.style.display = 'none';
      modalGifFallback.style.display = 'flex';
    };
    // Show the charming fallback immediately so there's never a blank/broken gap,
    // then swap to the real gif the instant it successfully loads.
    modalGifFallback.style.display = 'flex';
    modalGif.src = gifUrl;
  }
  modalBackdrop.classList.add('show');
}
function closeModal(){ modalBackdrop.classList.remove('show'); }
document.getElementById('modal-close').addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (e) => { if(e.target === modalBackdrop) closeModal(); });
document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeModal(); });

/* ---------- Worry Dissolver ---------- */
const worryInput = document.getElementById('worry-input');
const releaseBtn = document.getElementById('release-btn');
const dissolveLayer = document.getElementById('dissolve-layer');

releaseBtn.addEventListener('click', () => {
  const text = worryInput.value.trim();
  if(!text){
    worryInput.focus();
    worryInput.placeholder = "Type something first, love... even one word 🤍";
    return;
  }
  const count = Math.min(28, Math.max(10, text.length));
  for(let i=0;i<count;i++){
    const p = document.createElement('div');
    p.className = 'dissolve-heart';
    p.textContent = ['💗','💕','🤍','✨'][Math.floor(Math.random()*4)];
    p.style.left = (10 + Math.random()*80) + '%';
    p.style.top = (20 + Math.random()*50) + '%';
    p.style.setProperty('--dx', (Math.random()*120 - 60) + 'px');
    p.style.animationDelay = (Math.random()*0.4) + 's';
    dissolveLayer.appendChild(p);
    setTimeout(() => p.remove(), 2200);
  }
  worryInput.value = '';
  worryInput.placeholder = "Type down whatever is stressing you out, Pookie... let it go here 🤍";
  setTimeout(() => {
    openModal("You're safe here 💕", "Your worries are gone now. You're safe here 💕\n\nWhatever it was, you don't have to carry it alone. Breathe, Pookie. I've got you.");
  }, 500);
});

/* ---------- Breathing Exercise ---------- */
const breatheCircle = document.getElementById('breathe-circle');
const breatheBtn = document.getElementById('breathe-btn');
let breathing = false;
let breatheTimer = null;
let breathePhaseIndex = 0;
const phases = [
  { label:'Inhale...', cls:'inhale', duration:3500 },
  { label:'Hold...', cls:'hold', duration:3500 },
  { label:'Exhale...', cls:'exhale', duration:3500 }
];

function runBreathPhase(){
  if(!breathing) return;
  const phase = phases[breathePhaseIndex % phases.length];
  breatheCircle.textContent = phase.label;
  breatheCircle.classList.remove('inhale','hold','exhale');
  void breatheCircle.offsetWidth;
  breatheCircle.classList.add(phase.cls);
  breathePhaseIndex++;
  breatheTimer = setTimeout(runBreathPhase, phase.duration);
}

breatheBtn.addEventListener('click', () => {
  breathing = !breathing;
  if(breathing){
    breatheBtn.textContent = 'Stop Breathing Session';
    breathePhaseIndex = 0;
    runBreathPhase();
  } else {
    breatheBtn.textContent = 'Start Breathing Session';
    clearTimeout(breatheTimer);
    breatheCircle.classList.remove('inhale','hold','exhale');
    breatheCircle.textContent = 'Press start';
  }
});

/* ---------- Constellation Sky ---------- */
const starMessages = [
  "You are my favorite star in the universe ✨",
  "Distance means nothing when someone means everything 🌌",
  "Every night I look up, I think of you looking up too 🌠",
  "You are the calm in every storm I've ever faced 💫",
  "Out of every galaxy, I'd still pick your heart 🌟",
  "You make ordinary days feel like something worth remembering 🩷",
  "I fall for you a little more every single day 🌙",
  "Your smile is the warmest light I know ✨",
  "No matter the time zone, my heart runs on your time 🕰️",
  "You are proof that some things really are worth waiting for 🌌",
  "I'm not just falling for you, I already landed 💖",
  "You feel like home, even from miles away 🏡",
  "Every star tonight is just me thinking about you 🌠",
  "You're the softest part of my whole world 🤍",
  "I'd choose this love in every universe, every time 🌌",
  "Your voice is my favorite sound in the world 🎶",
  "You make missing someone feel worth it 💫",
  "I promise you'll never have to be strong alone 🫂",
  "You are loved more than words can hold 💕",
  "This sky is big, but my love for you is bigger 🌌",
  "You're my person, today and every day after ✨"
];
const skyCard = document.getElementById('sky-card');
function buildSky(){
  skyCard.innerHTML = '';
  const starCount = 22;
  for(let i=0;i<starCount;i++){
    const star = document.createElement('button');
    star.className = 'star';
    star.setAttribute('aria-label','star');
    star.style.left = (2 + Math.random()*94) + '%';
    star.style.top = (4 + Math.random()*88) + '%';
    star.style.animationDelay = (Math.random()*2.6) + 's';
    const size = 5 + Math.random()*7;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    const msg = starMessages[i % starMessages.length];
    star.addEventListener('click', () => openModal('A star just for you ✨', msg));
    skyCard.appendChild(star);
  }
}
buildSky();

/* ---------- Love Jar ---------- */
const loveReasons = [
  "The way you laugh at your own jokes before you even finish them.",
  "How you always check if I ate, even when you're the one having a rough day.",
  "The way you say my name when you're sleepy.",
  "Your heart is the softest, safest place I know.",
  "How you remember tiny things I mention once and bring them up weeks later.",
  "The way you get excited over small, silly things.",
  "How brave you are, even on the days you don't feel brave at all.",
  "Your voice notes that I replay more than I'd ever admit.",
  "How you make even ordinary days feel like an adventure.",
  "The way you care for the people you love, fiercely and quietly.",
  "How your bad days still make room to ask about mine.",
  "The way you say 'okay, tell me everything' and actually mean it.",
  "How you turn stress into something we can laugh about later.",
  "Your patience, even when I'm difficult.",
  "The way your eyes look when you're genuinely happy.",
  "How you never let me feel alone, even from far away.",
  "The way you believe in me on days I don't believe in myself.",
  "How you love with your whole heart, no half measures.",
  "The little rituals we've built that are just ours.",
  "How you make 'home' feel like a person instead of a place.",
  "The way you say goodnight like it actually matters to you.",
  "How you make me want to be a better person, gently, without asking."
];
document.getElementById('love-jar').addEventListener('click', () => {
  const reason = loveReasons[Math.floor(Math.random()*loveReasons.length)];
  openModal('A reason I love you 💌', reason);
  const jarBody = document.getElementById('jar-body');
  jarBody.animate([
    { transform:'scale(1)' },
    { transform:'scale(1.06)' },
    { transform:'scale(1)' }
  ], { duration:380, easing:'cubic-bezier(.34,1.56,.64,1)' });
});

/* ---------- Open When Envelopes ---------- */
const letters = {
  miss: {
    title: "Open when you miss me 💌",
    body: "Hey Pookie,\n\nIf you're reading this, it probably means the distance is sitting heavy on you right now. I want you to know something important: missing me isn't a sign that something is wrong. It's just proof of how much love is between us with nowhere to go for a moment.\n\nClose your eyes. Picture me right there next to you, holding your hand the way I always do. I'm thinking of you right now, probably more than you know. This feeling won't last forever — we're building toward a future where 'missing you' turns into 'right here with you.'\n\nUntil then, I'm only ever a message away. You are never as far from me as it feels.\n\nAll my love, always."
  },
  badday: {
    title: "Open when you had a bad day 🤍",
    body: "Hi love,\n\nI'm sorry today was hard. You don't have to explain it or make it make sense — you're allowed to just have a bad day, and I'm still proud of you for getting through it.\n\nWhatever happened, it doesn't change how I see you. You are still capable, still lovely, still my favorite person, even on the days that felt heavy and unfair.\n\nTake off whatever you're wearing that feels tight or itchy, make something warm to drink, and let yourself rest. Tomorrow gets to be different. And no matter what today looked like, you came home to someone who loves you exactly as you are.\n\nRest now, Pookie. I've got you."
  },
  insecure: {
    title: "Open when you feel insecure 💗",
    body: "My love,\n\nWhatever thought is looping in your head right now, I need you to hear this clearly: you are enough. Not almost enough, not enough-if-you-change-something — just enough, exactly as you are today.\n\nI didn't fall for a version of you that doesn't exist. I fell for the real one — the one who overthinks sometimes, who has bad hair days, who isn't always confident. That's who I choose, every single time.\n\nInsecurity lies. It tells you things that aren't true and makes you compare yourself to people who don't matter. I only see you. I only want you.\n\nYou are safe here, and you are loved here, fully and without conditions."
  },
  hug: {
    title: "Open when you want a warm hug 🫂",
    body: "Hey you,\n\nCome here. Let me hold you for a minute.\n\nImagine my arms around you right now, pulling you in close, your head resting right where it always does. No need to say anything — just breathe, and let yourself be held for a second.\n\nI wish I could actually be there to hug you properly, tight and warm, the kind that makes everything feel a little lighter. Until I can, let this letter be the next best thing.\n\nYou're safe. You're loved. You're held, even from here."
  }
};
document.querySelectorAll('.envelope').forEach(env => {
  env.addEventListener('click', () => {
    const data = letters[env.dataset.letter];
    if(data) openModal(data.title, data.body);
  });
});

/* ---------- Hug Generator ---------- */
const hugBtn = document.getElementById('hug-btn');
const confettiField = document.getElementById('hug-confetti');
function spawnConfettiHeart(){
  const h = document.createElement('div');
  h.className = 'confetti-heart';
  h.textContent = ['💖','💕','💗','✨','🤍'][Math.floor(Math.random()*5)];
  h.style.left = Math.random()*100 + 'vw';
  h.style.fontSize = (14 + Math.random()*18) + 'px';
  const duration = 2.6 + Math.random()*2;
  h.style.animationDuration = duration + 's';
  confettiField.appendChild(h);
  setTimeout(() => h.remove(), duration*1000 + 100);
}
hugBtn.addEventListener('click', () => {
  for(let i=0;i<40;i++) setTimeout(spawnConfettiHeart, i*30);
  openModal('Sending a hug 🤗', "Closing distance... Sending a tight, warm 10-second hug right now! Close your eyes and feel it 💕\n\n...\n\nThere. That was me, holding you as tight as I can from here.", 'https://media1.tenor.com/m/nsoLbu-dNJwAAAAC/cosytales-couple.gif');
});

/* ---------- Kiss Counter ---------- */
const kissBtn = document.getElementById('kiss-btn');
const kissCountEl = document.getElementById('kiss-count');
const kissLabelEl = document.getElementById('kiss-label');
let kissCount = 0;
try {
  kissCount = parseInt(localStorage.getItem('osh_kiss_count') || '0', 10) || 0;
} catch(e) { kissCount = 0; }
kissCountEl.textContent = kissCount;

const kissMilestones = [
  [1, "your very first kiss here 🥹"],
  [10, "double digits already 💗"],
  [50, "50 kisses?! be still my heart"],
  [100, "100 kisses. I'm so lucky."],
  [365, "a whole year's worth of kisses 🐭💕"]
];
function kissLabelFor(n){
  const hit = kissMilestones.slice().reverse().find(m => n >= m[0]);
  return hit ? hit[1] : "kisses sent so far";
}
kissBtn.addEventListener('click', (e) => {
  kissCount++;
  kissCountEl.textContent = kissCount;
  kissCountEl.classList.remove('bump');
  void kissCountEl.offsetWidth;
  kissCountEl.classList.add('bump');
  kissLabelEl.textContent = kissLabelFor(kissCount);
  try { localStorage.setItem('osh_kiss_count', String(kissCount)); } catch(err) {}

  const rect = kissBtn.getBoundingClientRect();
  const pop = document.createElement('div');
  pop.className = 'kiss-pop';
  pop.textContent = ['💋','💗','💕'][Math.floor(Math.random()*3)];
  pop.style.left = (rect.left + rect.width/2 - 10 + (Math.random()*40-20)) + 'px';
  pop.style.top = (rect.top) + 'px';
  document.body.appendChild(pop);
  setTimeout(() => pop.remove(), 1000);
});

/* ---------- Give Little Mouse a Knock ---------- */
// Sends her tap as a Telegram message. Uses a plain GET request (no custom
// headers) so the browser does not need to ask Telegram's servers for CORS
// permission first — Telegram doesn't answer that preflight, so a normal
// POST/fetch-with-JSON would silently fail. The request still reaches
// Telegram and the message still sends even though this page can't read
// back Telegram's response to confirm it.
const KNOCK_BOT_TOKEN = '8639787885:AAGaRaVkuxHmaJRrU9T_nMy2vSY_FoG5Rco';
const KNOCK_CHAT_ID = '7840677130';
const knockBtn = document.getElementById('knock-btn');
const knockLines = [
  "👋 Pookie sent you a knock — she's thinking of you right now 💕",
  "🐭 Knock knock! Pookie needs a little bit of your attention 🥺",
  "💌 A knock from Pookie — she misses you.",
  "🔔 Pookie tapped to say hi. Check on her when you can 💗",
  "🫶 Pookie wants a hug. Send one back when you get this.",
  "🌙 Pookie's thinking of you before bed tonight 💤",
  "🥺 A tiny knock from Pookie — she could use some love right now.",
  "💗 Pookie says hi. Just that. Hi.",
  "🐾 Someone's heart just did a little jump for you — it was Pookie's.",
  "📣 Attention, Little Mouse: Pookie misses you, effective immediately.",
  "🧸 Pookie sent a knock instead of a hug, since a hug isn't reachable yet.",
  "☕ Pookie's taking a break and wanted you to know she's thinking of you.",
  "🌸 A small knock, a big feeling — Pookie's thinking of you.",
  "✨ Pookie just wanted to remind you that you're hers.",
  "🐭 Pookie's squeaking for your attention right now.",
  "💗 Just a reminder: you are loved, right this second.",
  "🫧 Pookie's thoughts just floated over to you.",
  "🌷 A little flower-shaped knock, just for you.",
  "🍯 Pookie's feeling soft and wanted to tell you.",
  "🧁 Sweet thoughts incoming, courtesy of Pookie.",
  "📌 Pinning this moment: Pookie misses you.",
  "🫂 Sending an invisible hug through the wifi.",
  "🐾 Paw prints leading straight to your heart.",
  "💤 Pookie's getting sleepy and wants you close.",
  "🌻 You crossed Pookie's mind again. No surprise there.",
  "🎈 A knock light as a balloon, heavy as her love.",
  "🫶 Little Mouse, you're needed. Gently, but needed.",
  "🍃 A soft nudge drifting your way.",
  "🕯️ Pookie lit a little candle of thought for you.",
  "🐣 Something small just hatched: a thought about you.",
  "🌈 Pookie's day got better just thinking of you.",
  "🫐 Blueberry-sized knock, strawberry-sized love.",
  "🪁 Pookie's heart just flew a little kite toward you.",
  "🎀 Wrapped with care: one thought of you.",
  "🫙 Pulled a reason to miss you right out of the jar.",
  "🧦 Even her socks feel lonelier without you nearby.",
  "🍂 A knock falling gently, like a leaf, toward you.",
  "🐝 Buzzing with the thought of you.",
  "🪴 Pookie's been thinking of you while watering her thoughts.",
  "🫖 Tea's brewing, and so is a thought of you.",
  "🌙 Goodnight thoughts, sent a little early.",
  "🐚 Found a little shell-sized memory of you today.",
  "🎐 Wind chimes, soft breeze, and thoughts of you.",
  "🍓 Sweet like a strawberry: that's how she's thinking of you.",
  "🪺 A nest-sized knock, just for her favorite person.",
  "🧊 Cool outside, warm inside — mostly because of you.",
  "🫘 A tiny bean-sized reminder: she misses you.",
  "🦋 A butterfly just reminded her of you.",
  "🍡 Soft and sweet, like this little knock.",
  "🪸 Deep under the ocean of her thoughts, there you are.",
  "🧺 Picked a basket of thoughts, found you in all of them.",
  "🫗 Pouring out a little love your way.",
  "🌼 A daisy-sized thought, blooming just for you.",
  "🐞 A tiny ladybug of a reminder: she's thinking of you.",
  "🧵 Stitching a little thought of you into her day.",
  "🪹 An empty nest until you come back.",
  "🍥 Swirling thoughts, all leading back to you.",
  "🫧 Bubbles of thought, all popping with your name.",
  "🪻 A little purple flower of a reminder.",
  "🧩 You're the missing piece in her afternoon.",
  "🪷 A lotus-soft thought drifting your way.",
  "🫚 A tiny root of a feeling: she needs you.",
  "🍄 A mushroom-sized knock in a forest of thoughts about you.",
  "🪵 Solid as wood, soft as her love for you.",
  "🫜 A little bean sprout of missing you.",
  "🧃 A juice-box sized reminder: you're loved.",
  "🪞 Looked in the mirror, thought of you anyway.",
  "🍙 Rice-ball sized, rice-ball sweet: a thought of you.",
  "🪆 Layer after layer, it's always you underneath.",
  "🧶 Tangled up in thoughts of you today.",
  "🪄 A little magic trick: thinking of you, poof.",
  "🍵 Warm like tea, soft like her love for you.",
  "🪹 Come fill this empty space she's been feeling.",
  "🧊 Even on a busy day, you're still on her mind.",
  "🍪 A cookie-sized reminder that she adores you.",
  "🪅 Burst open: a pinata of thoughts about you.",
  "🍒 Two cherries, one thought: you.",
  "🪴 She's growing something, and it includes you.",
  "🧸 A teddy-bear hug, sent through the internet.",
  "🍰 Sweet as cake, soft as this knock.",
  "🪹 She's building a little nest, and you're in it.",
  "🧁 Sprinkled a little extra love on today, for you.",
  "🍬 Candy-sweet thought, straight from Pookie.",
  "🪄 Poof — a little reminder appears, just for you.",
  "🧋 Boba-sized bubbles of affection, heading your way.",
  "🍩 A donut-shaped hole in her day, shaped like missing you.",
  "🪺 Soft nest, soft thoughts, all about you.",
  "🧺 A basket of small moments, all pointing to you.",
  "🍇 Grape-sized, bite-sized love, sent your way.",
  "🪷 A quiet thought blooming in the middle of her day.",
  "🧃 Small sip, big feeling: she misses you.",
  "🍡 Three little dumplings of love, all for you.",
  "🪆 Opened one thought, found another thought of you inside.",
  "🧵 A loose thread of thought, leading straight to you.",
  "🍥 Spiral thoughts, always circling back to you.",
  "🪹 A tiny nest she's keeping warm for you.",
  "🧊 A small, cool thought in the middle of a warm day.",
  "🍯 Sticky-sweet, just like her love for you.",
  "🪴 A seedling of a thought, growing toward you.",
  "🧶 One more string tying her thoughts to yours.",
  "🍙 A small, round reminder: come back to her soon.",
  "🪻 One more bloom, one more thought of you.",
  "🫙 Opened the jar again, found another reason to love you.",
  "🧊 Small knock, big heart behind it.",
  "🍓 One more strawberry-sweet thought, sent your way.",
  "🪄 A tiny bit of magic, wrapped around a thought of you.",
  "🧸 She's hugging her pillow and wishing it were you.",
  "🍰 One more slice of her day, saved just for you.",
  "🪹 She built this whole knock just to reach you.",
  "🧵 Every thread today somehow led back to you.",
  "🍵 A warm cup, a warm thought, both about you.",
  "🪆 Underneath every layer today, it was still you.",
  "🧃 A little reminder, small but full of love.",
  "🍬 Sugar-sweet, sent with a little squeak."
];
let knockCooldown = false;
knockBtn.addEventListener('click', () => {
  if(knockCooldown) return;
  knockCooldown = true;
  setTimeout(() => { knockCooldown = false; }, 4000);
  const text = knockLines[Math.floor(Math.random() * knockLines.length)];
  const url = 'https://api.telegram.org/bot' + KNOCK_BOT_TOKEN + '/sendMessage?chat_id=' + encodeURIComponent(KNOCK_CHAT_ID) + '&text=' + encodeURIComponent(text);
  fetch(url, { mode: 'no-cors' }).catch(() => {});
  for(let i=0;i<14;i++) setTimeout(spawnConfettiHeart, i*35);
  const knockNote = document.getElementById('knock-note');
  const prevNote = knockNote.textContent;
  knockNote.textContent = "Sent! He'll know you need him 💌";
  clearTimeout(knockBtn._t);
  knockBtn._t = setTimeout(() => { knockNote.textContent = prevNote; }, 3200);
});

/* ---------- Countdown to Next Time ---------- */
const countdownSet = document.getElementById('countdown-set');
const countdownDisplay = document.getElementById('countdown-display');
const countdownInput = document.getElementById('countdown-input');
const countdownBtn = document.getElementById('countdown-btn');
const countdownEdit = document.getElementById('countdown-edit');
const cdDays = document.getElementById('cd-days');
const cdHours = document.getElementById('cd-hours');
const cdMins = document.getElementById('cd-mins');
const cdSecs = document.getElementById('cd-secs');
let countdownTimer = null;

function startCountdown(dateStr){
  countdownSet.style.display = 'none';
  countdownDisplay.style.display = 'block';
  clearInterval(countdownTimer);
  function tick(){
    const target = new Date(dateStr + 'T00:00:00').getTime();
    const now = Date.now();
    let diff = target - now;
    if(diff <= 0){
      cdDays.textContent = '0'; cdHours.textContent = '0'; cdMins.textContent = '0'; cdSecs.textContent = '0';
      clearInterval(countdownTimer);
      openModal("The day is here 🥹", "Today's the day, Pookie. No more counting down — I'll see you soon 💕");
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    cdDays.textContent = d;
    cdHours.textContent = h;
    cdMins.textContent = m;
    cdSecs.textContent = s;
  }
  tick();
  countdownTimer = setInterval(tick, 1000);
}

try {
  const savedDate = localStorage.getItem('osh_countdown_date');
  if(savedDate){
    countdownInput.value = savedDate;
    startCountdown(savedDate);
  }
} catch(e) {}

countdownBtn.addEventListener('click', () => {
  const val = countdownInput.value;
  if(!val) return;
  try { localStorage.setItem('osh_countdown_date', val); } catch(e) {}
  startCountdown(val);
});
countdownEdit.addEventListener('click', () => {
  countdownSet.style.display = 'flex';
  countdownDisplay.style.display = 'none';
  clearInterval(countdownTimer);
});

/* ---------- Floating Mascot ---------- */
const mascotBtn = document.getElementById('mascot-btn');
const mascotBubble = document.getElementById('mascot-bubble');
const mascotLines = [
  "hi Pookie, it's me, your Little Mouse 🐭",
  "just checking in... I love you 💕",
  "you make my whole world softer 🤍",
  "tap the jar if you need a reason to smile 🫙",
  "have you had water today? drink some, love 💧",
  "I'm always just a squeak away 🐭",
  "you're doing better than you think you are 🌸",
  "sending you the biggest hug from here 🤗",
  "you are so deeply loved, Pookie 💗"
];
let mascotTimeout = null;
mascotBtn.addEventListener('click', () => {
  const line = mascotLines[Math.floor(Math.random()*mascotLines.length)];
  mascotBubble.textContent = line;
  mascotBubble.classList.add('show');
  clearTimeout(mascotTimeout);
  mascotTimeout = setTimeout(() => mascotBubble.classList.remove('show'), 4200);
});

/* ---------- Secret Passcode Vault ---------- */
const validCodes = ['52746','pookie'];
const vaultInput = document.getElementById('vault-input');
const vaultBtn = document.getElementById('vault-btn');
const vaultMsg = document.getElementById('vault-msg');

function tryUnlock(){
  const code = vaultInput.value.trim().toLowerCase();
  if(validCodes.includes(code)){
    vaultMsg.textContent = "Unlocked 🔓 Opening your letter...";
    vaultMsg.classList.remove('shake');
    setTimeout(() => {
      openModal("A promise, just for you 💛", "My darling Pookie,\n\nYou found the code — of course you did, you know me better than anyone.\n\nHere is my promise to you: I will keep choosing you, on the easy days and the hard ones. I will keep showing up, even from far away. I will keep learning how to love you better, one day at a time.\n\nI promise to celebrate your wins loudly, to sit with you through your worst days quietly, and to never let you feel like you're carrying anything alone.\n\nYou are my safe place, my favorite person, my forever choice.\n\nThis vault will always be here, waiting for you, whenever you need to remember how loved you are.\n\nAll of me, always yours — your Little Mouse 🐭", "https://media1.tenor.com/m/nisaHYy8yAYAAAAd/besito-catlove.gif");
    }, 500);
    vaultInput.value = '';
  } else {
    vaultMsg.textContent = "Wrong code! Try the secret number or your favorite nickname 🤫";
    vaultMsg.classList.remove('shake');
    void vaultMsg.offsetWidth;
    vaultMsg.classList.add('shake');
  }
}
vaultBtn.addEventListener('click', tryUnlock);
vaultInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') tryUnlock(); });

/* ---------- Init ---------- */
applyMood('default');


/* ================= v3 additions ================= */
(function(){
const byId = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2,'0');
const key = (y,m,d) => y + '-' + pad(m+1) + '-' + pad(d);
const todayKey = () => { const t = new Date(); return key(t.getFullYear(), t.getMonth(), t.getDate()); };
const dayNum = (k) => { const p = k.split('-').map(Number); return Math.floor(Date.UTC(p[0], p[1]-1, p[2]) / 864e5); };
const numToKey = (n) => { const t = new Date(n * 864e5); return key(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()); };
const prettyDay = (k, opts) => new Date(dayNum(k) * 864e5).toLocaleDateString(undefined, Object.assign({ timeZone:'UTC' }, opts));
const store = {
  get(k, f){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch(e){ return f; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
};
const toastEl = byId('toast'); let toastT;
function showToast(msg){ toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 2800); }
function hearts(n){ for(let i=0;i<n;i++) setTimeout(spawnConfettiHeart, i*35); }
function chips(box, items, onTap){
  box.textContent = '';
  items.forEach((it) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.textContent = it; b.dataset.v = it;
    b.addEventListener('click', () => onTap(it, b));
    box.appendChild(b);
  });
}

/* ---------- Loader ---------- */
(function(){
  const loader = byId('loader'); if(!loader) return;
  const fill = byId('loader-fill'), lm = byId('loader-mouse'), lc = byId('loader-cat'), ll = byId('loader-line');
  const lines = [[0,'Warming up your safe place…'],[.3,'Folding tiny love letters…'],[.55,'Teaching the cat to be gentle…'],[.8,'Hanging stars just for you…'],[.97,'Welcome home, Pookie 💖']];
  let finished = false;
  function endLoader(){ if(finished) return; finished = true; loader.classList.add('done'); setTimeout(() => loader.remove(), 900); }
  const t0 = performance.now(), DUR = 3400;
  function step(now){
    if(finished) return;
    const p = Math.min(1, (now - t0) / DUR), e = 1 - Math.pow(1 - p, 2.2);
    fill.style.width = (e*100) + '%';
    lm.style.left = (e*100) + '%';
    lc.style.left = Math.max(0, e*100 - (p < 1 ? 16 : 7)) + '%';
    const ln = lines.slice().reverse().find((l) => e >= l[0]);
    if(ln && ll.textContent !== ln[1]) ll.textContent = ln[1];
    if(p < 1) requestAnimationFrame(step); else setTimeout(endLoader, 750);
  }
  requestAnimationFrame(step);
  byId('loader-skip').addEventListener('click', endLoader);
})();

/* ---------- Daily affirmation ---------- */
const affirms = [
  "You are allowed to take up space, rest, and be soft today.",
  "You don't have to earn rest. You deserve it already.",
  "Small steps still count. Today, one tiny step is enough.",
  "You are loved on your good days and your hard days.",
  "Your feelings are valid, even the messy ones.",
  "You are doing better than you think you are.",
  "Be as kind to yourself as you are to the people you love.",
  "Nothing about you needs fixing. You are already enough.",
  "It's okay to slow down. The world can wait a little.",
  "You are someone's favorite person, and that person is me.",
  "Breathe in calm, breathe out everything that isn't yours to carry.",
  "Tomorrow is a fresh page, and I'll be right here beside you.",
  "You are strong and gentle at the same time, and that's rare.",
  "Today you only have to be Pookie. That's more than enough."
];
let affIdx = dayNum(todayKey()) % affirms.length;
function showAffirm(){ byId('affirm-text').textContent = '“' + affirms[affIdx] + '”'; }
byId('affirm-date').textContent = new Date().toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric' });
showAffirm();
byId('affirm-next').addEventListener('click', () => { affIdx = (affIdx + 1 + Math.floor(Math.random()*(affirms.length-1))) % affirms.length; showAffirm(); });

/* ---------- Cycle calendar ---------- */
const CY_KEY = 'osh_cycle';
const cy = Object.assign({ period: [], logs: {}, cycleLen: 28, periodLen: 5 }, store.get(CY_KEY, {}));
const saveCy = () => store.set(CY_KEY, cy);
const nowD = new Date();
let viewY = nowD.getFullYear(), viewM = nowD.getMonth(), selKey = todayKey();
const SYMS = ['Cramps','Headache','Bloating','Tired','Cravings','Mood swings','Back pain','Acne','Nausea'];
const MOODS = ['😊','🥰','😌','😔','😰','😡','😴'];
const PHASES = {
  menstrual:{ e:'🌸', n:'Period days', note:'Rest is productive. You owe the world nothing today. 💗', tips:[
    'Warmth on your lower belly (a heat pad or hot water bottle) can ease cramps.',
    'Sip warm water, tea or soup, and keep hydrated.',
    'Gentle stretches or a slow walk can help. If you just want to lie down, that is okay too.',
    'Eat something comforting with iron (lentils, greens, eggs) plus a snack you truly love.',
    'If pain is severe, bleeding is unusually heavy, or it feels different from your normal, please talk to a doctor.' ] },
  follicular:{ e:'🌱', n:'Fresh start', note:'Your energy is coming back. Let us plan something fun soon! ✨', tips:[
    'Energy often rises now, so it is a nice time for plans, study or trying new things.',
    'Light workouts, dancing or a sunny walk can feel great.',
    'Keep up water and regular meals.',
    'Start that thing you have been putting off. One tiny step is enough.' ] },
  ovulation:{ e:'✨', n:'Glow window (estimate)', note:'You are shining, Pookie, and I am so proud of you. 🌟', tips:[
    'Many people feel more social and confident around now.',
    'A mild one-sided twinge is common for some. If pain is strong, check with a doctor.',
    'Stay hydrated, especially if you are active.',
    'Calls with friends, dates, selfies: this is your moment.' ] },
  luteal:{ e:'🌙', n:'Soft & cozy phase', note:'If everything feels bigger today, it is hormones, not you. I have got you. 🫶', tips:[
    'Mood dips, tiredness and cravings are common now, so be extra kind to yourself.',
    'Regular meals with protein and slow carbs (oats, fruit, nuts) help steady your energy.',
    'If you feel jittery, ease off caffeine, and try for an earlier bedtime.',
    'Gentle movement, journaling or a warm shower can calm the mind.',
    'Try the breathing circle above if your thoughts feel loud.' ] },
  late:{ e:'🤍', n:'A little late', note:'Stress, sleep and travel can shift things. Breathe, love. 💕', tips:[
    'Cycles can shift with stress, sleep, travel or illness.',
    'Keep eating, sleeping and drinking water regularly.',
    'Try the breathing exercise to calm any worry.',
    'If it is often irregular or you are worried, a doctor can help.' ] },
  none:{ e:'🌷', n:'Let us start tracking', note:'Mark the first day of your last period and I will do the rest. 🌷', tips:[
    'Tap a day on the calendar, then press "Period started this day".',
    'The more you log, the better the predictions get.',
    'Everything stays private on this device.' ] }
};
function startsList(){
  const s = new Set(cy.period.map(dayNum));
  return Array.from(s).sort((a,b) => a-b).filter((n) => ![1,2,3,4,5,6,7].some((k) => s.has(n-k)));
}
function avgCycle(){
  const st = startsList(), diffs = [];
  for(let i=1;i<st.length;i++){ const d = st[i]-st[i-1]; if(d >= 15 && d <= 60) diffs.push(d); }
  const last = diffs.slice(-6);
  return last.length ? Math.round(last.reduce((a,b) => a+b, 0) / last.length) : cy.cycleLen;
}
function cycleState(){
  const st = startsList(), t = dayNum(todayKey()), cl = avgCycle(), pl = cy.periodLen;
  const past = st.filter((n) => n <= t);
  if(!past.length) return { none:true, cl, pl };
  const last = past[past.length-1];
  return { none:false, cl, pl, last, cd:t-last+1, next:last+cl, daysTo:last+cl-t };
}
function phaseOf(s){
  if(s.none || s.daysTo < -14) return 'none';
  if(cy.period.indexOf(todayKey()) !== -1) return 'menstrual';
  if(s.daysTo < 0) return 'late';
  const ov = s.cl - 14;
  if(s.cd <= s.pl) return 'menstrual';
  if(s.cd >= ov-1 && s.cd <= ov+1) return 'ovulation';
  return s.cd < ov-1 ? 'follicular' : 'luteal';
}
function renderCal(){
  const s = cycleState(), t = dayNum(todayKey()), marked = new Set(cy.period.map(dayNum));
  byId('cyc-month').textContent = new Date(viewY, viewM, 1).toLocaleDateString(undefined, { month:'long', year:'numeric' });
  const grid = byId('cyc-grid'); grid.textContent = '';
  const first = new Date(viewY, viewM, 1).getDay(), dim = new Date(viewY, viewM+1, 0).getDate();
  for(let i=0;i<first;i++) grid.appendChild(document.createElement('div'));
  for(let d=1; d<=dim; d++){
    const k = key(viewY, viewM, d), n = dayNum(k);
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'cyc-cell'; b.textContent = d; b.dataset.k = k;
    if(marked.has(n)) b.classList.add('period');
    else if(!s.none && n >= t){
      for(let c=1;c<=3;c++){ const st0 = s.last + s.cl*c; if(n >= st0 && n < st0 + s.pl){ b.classList.add('pred'); break; } }
      if(!b.classList.contains('pred')){
        for(let c=0;c<=3;c++){ const o = s.last + s.cl*c + (s.cl-14) - 1; if(n >= o-1 && n <= o+1){ b.classList.add('ov'); break; } }
      }
    }
    if(k === todayKey()) b.classList.add('today');
    if(k === selKey) b.classList.add('sel');
    const lg = cy.logs[k];
    if(lg && ((lg.sym && lg.sym.length) || lg.mood)){ const dot = document.createElement('span'); dot.className = 'dot'; b.appendChild(dot); }
    b.setAttribute('aria-label', prettyDay(k, { weekday:'long', month:'long', day:'numeric' }) + (marked.has(n) ? ', period day' : ''));
    grid.appendChild(b);
  }
}
function renderDay(){
  const lg = cy.logs[selKey] || { sym:[], mood:'' };
  byId('cy-title').textContent = prettyDay(selKey, { weekday:'long', month:'long', day:'numeric' });
  byId('cy-period').textContent = cy.period.indexOf(selKey) !== -1 ? 'Unmark period day' : 'Mark as period day 🩸';
  byId('cy-sym').querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', (lg.sym || []).indexOf(c.dataset.v) !== -1));
  byId('cy-mood').querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', lg.mood === c.dataset.v));
}
function renderPhase(){
  const s = cycleState(), p = PHASES[phaseOf(s)], ph = phaseOf(s);
  byId('cyc-emoji').textContent = p.e;
  byId('cyc-name').textContent = p.n;
  let sub;
  if(ph === 'none') sub = 'Mark your last period to start getting predictions.';
  else if(ph === 'late') sub = 'Your period may be ' + (-s.daysTo) + ' day' + (s.daysTo === -1 ? '' : 's') + ' late. That happens sometimes.';
  else sub = 'Cycle day ' + s.cd + ' · next period ' + (s.daysTo === 0 ? 'is expected today' : 'in about ' + s.daysTo + ' day' + (s.daysTo === 1 ? '' : 's') + ' (' + prettyDay(numToKey(s.next), { month:'short', day:'numeric' }) + ')');
  byId('cyc-sub').textContent = sub;
  const ul = byId('cy-tips'); ul.textContent = '';
  p.tips.forEach((t) => { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
  byId('cy-note').textContent = '— ' + p.note + ' (Little Mouse 🐭)';
}
function renderAllCy(){ renderCal(); renderDay(); renderPhase(); byId('cy-cl').value = cy.cycleLen; byId('cy-pl').value = cy.periodLen; }
function toggleLogItem(field, val){
  const lg = cy.logs[selKey] || (cy.logs[selKey] = { sym:[], mood:'' });
  if(field === 'sym'){ const i = lg.sym.indexOf(val); if(i === -1) lg.sym.push(val); else lg.sym.splice(i,1); }
  else lg.mood = lg.mood === val ? '' : val;
  if(!lg.sym.length && !lg.mood) delete cy.logs[selKey];
  saveCy(); renderCal(); renderDay();
}
chips(byId('cy-sym'), SYMS, (v) => toggleLogItem('sym', v));
chips(byId('cy-mood'), MOODS, (v) => toggleLogItem('mood', v));
byId('cyc-grid').addEventListener('click', (e) => {
  const c = e.target.closest('.cyc-cell'); if(!c) return;
  selKey = c.dataset.k; renderCal(); renderDay();
});
byId('cyc-prev').addEventListener('click', () => { viewM--; if(viewM < 0){ viewM = 11; viewY--; } renderCal(); });
byId('cyc-next').addEventListener('click', () => { viewM++; if(viewM > 11){ viewM = 0; viewY++; } renderCal(); });
byId('cy-period').addEventListener('click', () => {
  const i = cy.period.indexOf(selKey);
  if(i === -1) cy.period.push(selKey); else cy.period.splice(i,1);
  saveCy(); renderAllCy();
});
byId('cy-start').addEventListener('click', () => {
  const base = dayNum(selKey), t = dayNum(todayKey());
  for(let i=0;i<cy.periodLen;i++){ if(base + i > t) break; const k = numToKey(base + i); if(cy.period.indexOf(k) === -1) cy.period.push(k); }
  saveCy(); renderAllCy(); showToast('Logged. Be gentle with yourself, love 🌸');
});
function clampInput(id, lo, hi, field){
  byId(id).addEventListener('change', () => {
    let v = parseInt(byId(id).value, 10); if(isNaN(v)) v = cy[field];
    cy[field] = Math.max(lo, Math.min(hi, v)); saveCy(); renderAllCy();
  });
}
clampInput('cy-cl', 21, 45, 'cycleLen'); clampInput('cy-pl', 2, 10, 'periodLen');
renderAllCy();

/* ---------- Self-care ---------- */
const CARE_ITEMS = ['Took my vitamins or meds 💊','Ate a proper meal 🍲','Stretched or moved a little 🧘','Got some fresh air ☀️','Took a screen break 📵','Said one kind thing to myself 💗'];
let care = store.get('osh_care', null);
if(!care || care.date !== todayKey()) care = { date: todayKey(), water: 0, done: [], celebrated: false };
const saveCare = () => store.set('osh_care', care);
const wRow = byId('water-row'), cList = byId('care-list');
for(let i=0;i<8;i++){
  const b = document.createElement('button'); b.type = 'button'; b.className = 'water-glass'; b.textContent = '💧'; b.setAttribute('aria-label', 'Glass ' + (i+1));
  b.addEventListener('click', () => { care.water = (care.water === i+1) ? i : i+1; renderCare(); });
  wRow.appendChild(b);
}
CARE_ITEMS.forEach((txt, i) => {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'care-item';
  b.innerHTML = '<span class="ck"></span><span class="tx"></span>'; b.querySelector('.tx').textContent = txt;
  b.addEventListener('click', () => { const j = care.done.indexOf(i); if(j === -1) care.done.push(i); else care.done.splice(j,1); renderCare(); });
  cList.appendChild(b);
});
function renderCare(){
  wRow.querySelectorAll('.water-glass').forEach((g, i) => g.classList.toggle('full', i < care.water));
  cList.querySelectorAll('.care-item').forEach((it, i) => { const on = care.done.indexOf(i) !== -1; it.classList.toggle('done', on); it.querySelector('.ck').textContent = on ? '✓' : ''; });
  byId('care-water-n').textContent = care.water + '/8';
  const pct = Math.round((care.water + care.done.length) / (8 + CARE_ITEMS.length) * 100);
  byId('care-pct').textContent = pct + '%'; byId('care-fill').style.width = pct + '%';
  if(pct === 100 && !care.celebrated){ care.celebrated = true; hearts(30); showToast("You took such good care of yourself today. I'm so proud of you 💗"); }
  saveCare();
}
renderCare();

/* ---------- Journal ---------- */
const JMOODS = ['😊','🥰','😌','😔','😰','😡','😴'];
let journal = store.get('osh_journal', []), jMood = '';
chips(byId('j-mood'), JMOODS, (v, b) => { jMood = jMood === v ? '' : v; byId('j-mood').querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c.dataset.v === jMood)); });
function jStreak(){
  const days = new Set(journal.map((e) => e.d)); let n = dayNum(todayKey()), s = 0;
  if(!days.has(numToKey(n))) n--;
  while(days.has(numToKey(n))){ s++; n--; }
  return s;
}
function renderJournal(){
  const st = jStreak();
  byId('j-streak').textContent = st > 1 ? '🔥 ' + st + '-day writing streak, so proud of you!' : (journal.length ? 'Welcome back 💗' : 'Your first page is waiting 🌼');
  const list = byId('j-list'); list.textContent = '';
  journal.slice(0, 8).forEach((e) => {
    const box = document.createElement('div'); box.className = 'j-entry';
    const meta = document.createElement('div'); meta.className = 'j-meta';
    const left = document.createElement('span'); left.textContent = (e.mood ? e.mood + '  ' : '') + prettyDay(e.d, { weekday:'short', month:'short', day:'numeric' });
    const del = document.createElement('button'); del.type = 'button'; del.className = 'j-del'; del.textContent = 'delete';
    let armed = false;
    del.addEventListener('click', () => {
      if(!armed){ armed = true; del.textContent = 'tap again to confirm'; setTimeout(() => { armed = false; del.textContent = 'delete'; }, 2500); return; }
      journal = journal.filter((x) => x.id !== e.id); store.set('osh_journal', journal); renderJournal();
    });
    meta.appendChild(left); meta.appendChild(del); box.appendChild(meta);
    if(e.text){ const p = document.createElement('div'); p.className = 'j-text'; p.textContent = e.text; box.appendChild(p); }
    if(e.grat){ const g = document.createElement('div'); g.className = 'j-grat'; g.textContent = '🌼 Grateful for: ' + e.grat; box.appendChild(g); }
    list.appendChild(box);
  });
}
byId('j-save').addEventListener('click', () => {
  const text = byId('j-text').value.trim(), grat = byId('j-grat').value.trim();
  if(!text && !grat && !jMood){ showToast('Write or pick a mood first, love 🤍'); return; }
  journal.unshift({ id: Date.now(), d: todayKey(), mood: jMood, text, grat });
  store.set('osh_journal', journal.slice(0, 200));
  byId('j-text').value = ''; byId('j-grat').value = ''; jMood = '';
  byId('j-mood').querySelectorAll('.chip').forEach((c) => c.classList.remove('on'));
  renderJournal(); hearts(12); showToast('Saved. I love that you wrote it down 💗');
});
renderJournal();

/* ---------- Cute corner ---------- */
// To add real gifs: paste direct .gif links here (e.g. from Tenor). They show when the page is opened with internet;
// if a link can't load, its card simply disappears, so nothing ever looks broken.
const GIF_LINKS = [
  { src: 'https://media1.tenor.com/m/nisaHYy8yAYAAAAd/besito-catlove.gif', cap: 'Besito 😽' },
  { src: 'https://media1.tenor.com/m/zKhbCRTnmvYAAAAC/cosytales-couple.gif', cap: 'Cheek kiss 😘' },
  { src: 'https://media1.tenor.com/m/VVmyUUykhQYAAAAC/cosytales-chibi.gif', cap: 'Love bite 😆' },
  { src: 'https://media1.tenor.com/m/Xy0CKkt9VKUAAAAC/cosytales-couple.gif', cap: "Pat pat, I'm here 🤍" },
  { src: 'https://media1.tenor.com/m/SKVyZ47LhkYAAAAC/rose-propose.gif', cap: 'A rose for you 🌹' },
  { src: 'https://media1.tenor.com/m/oRzjlt7bS6oAAAAC/cosytales-couple.gif', cap: "You're my favorite person 💞" }
];
const sceneGrid = byId('scene-grid');
GIF_LINKS.forEach((g) => {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'glass scene-card gif-card'; b.dataset.cap = g.cap;
  const img = document.createElement('img'); img.alt = g.cap; img.loading = 'lazy';
  img.onerror = () => b.remove();
  img.src = g.src;
  const cap = document.createElement('span'); cap.className = 'scene-cap'; cap.textContent = g.cap;
  b.appendChild(img); b.appendChild(cap); sceneGrid.appendChild(b);
});
sceneGrid.addEventListener('click', (e) => { const c = e.target.closest('.scene-card'); if(!c) return; hearts(14); showToast(c.dataset.cap); });

/* ---------- Cat buddy ---------- */
const catBuddy = byId('cat-buddy'), catBody = byId('cat-body'), catBubble = byId('cat-bubble');
const pupils = [byId('cat-pupil-l'), byId('cat-pupil-r')], eyes = [byId('cat-eye-l'), byId('cat-eye-r')];
function gaze(x, y){
  const r = catBody.getBoundingClientRect(), dx = x - (r.left + r.width/2), dy = y - (r.top + r.height/2);
  const dist = Math.min(3, Math.hypot(dx, dy) / 40), a = Math.atan2(dy, dx);
  const t = 'translate(' + (Math.cos(a)*dist) + 'px,' + (Math.sin(a)*dist) + 'px)';
  pupils.forEach((p) => p.style.transform = t);
}
document.addEventListener('mousemove', (e) => gaze(e.clientX, e.clientY));
document.addEventListener('touchmove', (e) => { if(e.touches[0]) gaze(e.touches[0].clientX, e.touches[0].clientY); }, { passive:true });
(function blink(){ setTimeout(() => { eyes.forEach((e) => e.classList.add('blink')); setTimeout(() => eyes.forEach((e) => e.classList.remove('blink')), 160); blink(); }, 2200 + Math.random()*3200); })();
function placeCat(){
  const sc = Math.max(1, document.body.scrollHeight - window.innerHeight), pct = Math.min(1, window.scrollY / sc);
  const max = Math.max(16, Math.min(window.innerWidth - 100, window.innerWidth * .68)), left = (16 + pct * (max - 16)) + 'px';
  catBuddy.style.left = left; catBubble.style.left = left;
}
window.addEventListener('scroll', () => requestAnimationFrame(placeCat), { passive:true });
window.addEventListener('resize', placeCat); placeCat();
const catLines = ['mrow! 🐾','she is smiling, I can tell 💗','best day ever!!','purrr~ 🐱','tell her I said hi too','kisses make my tail wiggle','zoomies incoming!!','this is my favorite button too','drink some water, Pookie 💧'];
let catLast = 0;
function catReact(){
  catBody.classList.remove('pounce'); void catBody.offsetWidth; catBody.classList.add('pounce');
  setTimeout(() => catBody.classList.remove('pounce'), 640);
  const now = Date.now();
  if(now - catLast > 3200 && Math.random() < .55){
    catLast = now; catBubble.textContent = catLines[Math.floor(Math.random()*catLines.length)];
    catBubble.classList.add('show'); clearTimeout(catBubble._t); catBubble._t = setTimeout(() => catBubble.classList.remove('show'), 2600);
  }
}
document.addEventListener('click', (e) => { if(e.target.closest('.btn, .btn-soft, .chip, .mood-btn, .envelope, .star, .scene-card, .water-glass, .care-item, .cyc-cell, #love-jar, #kiss-btn, #hug-btn, #vault-btn, #mascot-btn')) catReact(); });
let idleT; function idle(){ clearTimeout(idleT); idleT = setTimeout(() => { catBody.classList.add('stretch'); setTimeout(() => catBody.classList.remove('stretch'), 1400); idle(); }, 14000 + Math.random()*10000); }
idle(); document.addEventListener('click', idle);
})();
