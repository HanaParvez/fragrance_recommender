// Simple data-driven fragrance recommender (VS & BBW)
// No external libs; contains a lightweight confetti implementation

(function() {
  // Backend adapter (FastAPI). Falls back to local logic if unavailable.
  const backend = {
    base: 'http://127.0.0.1:8090',
    async health(){ try { const r = await fetch(this.base + '/health', {mode:'cors'}); return r.ok; } catch { return false; } },
    async questions(segment){ const r = await fetch(`${this.base}/questions?segment=${encodeURIComponent(segment)}`); if(!r.ok) throw new Error('q'); return r.json(); },
    async nextQuestion(segment, answers){ const r = await fetch(this.base + '/next-question', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({segment, answers})}); if(!r.ok) throw new Error('n'); return r.json(); },
    async recommend(segment, answers){ const r = await fetch(this.base + '/recommendations', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({segment, answers})}); if(!r.ok) throw new Error('rec'); return r.json(); }
  };
  // Product catalogs: curated examples with tags and official links
  // WOMEN
  const womenProducts = [
    // Victoria's Secret
    {
      id: 'vs-bare-vanilla',
      brand: 'Victoria\'s Secret',
      name: 'Bare Vanilla',
      family: ['vanilla', 'warm', 'sweet', 'gourmand'],
      baseNotes: ['vanilla', 'cashmere', 'amber'],
      desc: 'Cozy warm vanilla wrapped in cashmere – soft, sweet, and comforting.',
      buy: 'https://www.victoriassecret.com/us/vs/fragrance/p/bare-vanilla-fine-fragrance-mist-1114681049',
      local: 'assets/vs-bare-vanilla.svg',
      image: 'https://victoriassecret.scene7.com/is/image/VictoriasSecret/1114681049_F?wid=800&hei=800&fmt=jpg',
      pop: 0.9
    },
    {
      id: 'vs-love-spell',
      brand: 'Victoria\'s Secret',
      name: 'Love Spell',
      family: ['fruity', 'floral', 'sweet', 'berries'],
      baseNotes: ['cherry-blossom', 'peach', 'fruity'],
      desc: 'Juicy peach and cherry blossom – playful and bright.',
      buy: 'https://www.victoriassecret.com/us/vs/fragrance/p/love-spell-fine-fragrance-mist-1111967771',
      local: 'assets/vs-love-spell.svg',
      image: 'https://victoriassecret.scene7.com/is/image/VictoriasSecret/1111967771_F?wid=800&hei=800&fmt=jpg',
      pop: 0.85
    },
    {
      id: 'vs-pure-seduction',
      brand: 'Victoria\'s Secret',
      name: 'Pure Seduction',
      family: ['fruity', 'sweet', 'juicy', 'berries'],
      baseNotes: ['red-plum', 'freesia', 'fruity'],
      desc: 'Lush red plum and freesia – juicy-sweet with a flirty vibe.',
      buy: 'https://www.victoriassecret.com/us/vs/fragrance/p/pure-seduction-fine-fragrance-mist-1111967751',
      local: 'assets/vs-pure-seduction.svg',
      image: 'https://victoriassecret.scene7.com/is/image/VictoriasSecret/1111967751_F?wid=800&hei=800&fmt=jpg',
      pop: 0.82
    },
    {
      id: 'vs-velvet-petals',
      brand: 'Victoria\'s Secret',
      name: 'Velvet Petals',
      family: ['floral', 'sweet', 'creamy'],
      baseNotes: ['almond', 'floral', 'vanilla'],
      desc: 'Soft floral-vanilla with a creamy, petal-like aura.',
      buy: 'https://www.victoriassecret.com/us/vs/fragrance/p/velvet-petals-fine-fragrance-mist-1111967799',
      local: 'assets/vs-velvet-petals.svg',
      image: 'https://victoriassecret.scene7.com/is/image/VictoriasSecret/1111967799_F?wid=800&hei=800&fmt=jpg',
      pop: 0.78
    },

    // Bath & Body Works
    {
      id: 'bbw-warm-vanilla-sugar',
      brand: 'Bath & Body Works',
      name: 'Warm Vanilla Sugar',
      family: ['vanilla', 'warm', 'gourmand', 'sweet'],
      baseNotes: ['vanilla', 'sandalwood', 'tonka'],
      desc: 'Warm vanilla with a soft, sugary hug – cozy and familiar.',
      buy: 'https://www.bathandbodyworks.com/p/warm-vanilla-sugar-fine-fragrance-mist-026663031.html',
      local: 'assets/bbw-warm-vanilla-sugar.svg',
      image: 'https://bathandbodyworks.scene7.com/is/image/bathandbodyworks/026663031?wid=800&hei=800&fmt=jpg',
      pop: 0.88
    },
    {
      id: 'bbw-japanese-cherry-blossom',
      brand: 'Bath & Body Works',
      name: 'Japanese Cherry Blossom',
      family: ['floral', 'powdery', 'classic'],
      baseNotes: ['cherry-blossom', 'sandalwood', 'musk'],
      desc: 'Iconic soft floral with a clean, slightly powdery finish.',
      buy: 'https://www.bathandbodyworks.com/p/japanese-cherry-blossom-fine-fragrance-mist-028009713',
      local: 'assets/bbw-japanese-cherry-blossom.svg',
      image: 'https://bathandbodyworks.scene7.com/is/image/bathandbodyworks/028009713?wid=800&hei=800&fmt=jpg',
      pop: 0.9
    },
    {
      id: 'bbw-a-thousand-wishes',
      brand: 'Bath & Body Works',
      name: 'A Thousand Wishes',
      family: ['fruity', 'amber', 'sweet', 'warm'],
      baseNotes: ['sparkling-champagne', 'peony', 'amber'],
      desc: 'Festive fruity-amber with a celebratory sparkle.',
      buy: 'https://www.bathandbodyworks.com/p/a-thousand-wishes-fine-fragrance-mist-028005120.html',
      local: 'assets/bbw-a-thousand-wishes.svg',
      image: 'https://bathandbodyworks.scene7.com/is/image/bathandbodyworks/028005120?wid=800&hei=800&fmt=jpg',
      pop: 0.86
    },
    {
      id: 'bbw-into-the-night',
      brand: 'Bath & Body Works',
      name: 'Into the Night',
      family: ['amber', 'musky', 'dark', 'sensual'],
      baseNotes: ['blackberry', 'jasmine', 'amber', 'musk'],
      desc: 'Alluring dark berries and amber – bold and evening-ready.',
      buy: 'https://www.bathandbodyworks.com/p/into-the-night-fine-fragrance-mist-026663026.html',
      local: 'assets/bbw-into-the-night.svg',
      image: 'https://bathandbodyworks.scene7.com/is/image/bathandbodyworks/026663026?wid=800&hei=800&fmt=jpg',
      pop: 0.84
    },
    {
      id: 'bbw-gingham',
      brand: 'Bath & Body Works',
      name: 'Gingham',
      family: ['fresh', 'clean', 'citrus', 'floral'],
      baseNotes: ['blue-freesia', 'clementine', 'clean-musk'],
      desc: 'A bright, clean citrus-floral that feels freshly laundered.',
      buy: 'https://www.bathandbodyworks.com/p/gingham-fresh-by-bath-and-body-works-fine-fragrance-mist-028003515',
      local: 'assets/bbw-gingham.svg',
      image: 'https://bathandbodyworks.scene7.com/is/image/bathandbodyworks/028003515?wid=800&hei=800&fmt=jpg',
      pop: 0.83
    },
    {
      id: 'bbw-in-the-stars',
      brand: 'Bath & Body Works',
      name: 'In The Stars',
      family: ['amber', 'woody', 'warm', 'sweet'],
      baseNotes: ['sandalwood', 'amber', 'tangerine', 'woods'],
      desc: 'Warm amber and woods with a sparkling twist – cozy yet luminous.',
      buy: 'https://www.bathandbodyworks.com/p/in-the-stars-fine-fragrance-mist-028015839.html',
      local: 'assets/bbw-in-the-stars.svg',
      image: 'https://bathandbodyworks.scene7.com/is/image/bathandbodyworks/028015839?wid=800&hei=800&fmt=jpg',
      pop: 0.8
    }
  ];

  // ARTISTS catalog: provided Hindi and English artists
  const artistsProducts = [
    // Hindi / South Asian
    { id: 'artist-karan-aujla', brand: 'Artist', name: 'Karan Aujla', family: ['punjabi','hip-hop','pop','anthemic'], baseNotes: ['punjabi-pop','trap','catchy-hooks','club'], desc: 'Punjabi pop-rap with hard-hitting hooks and trap production.', buy: 'https://open.spotify.com/search/Karan%20Aujla', local: 'assets/artist-karan-aujla.jpg', image: '', pop: 0.9 },
    { id: 'artist-seedhe-maut', brand: 'Artist', name: 'Seedhe Maut', family: ['hip-hop','rap','underground','lyrical'], baseNotes: ['bars','boom-bap','trap','storytelling'], desc: 'Delhi duo with razor-sharp lyricism and versatile hip-hop production.', buy: 'https://open.spotify.com/search/Seedhe%20Maut', local: 'assets/artist-seedhe-maut.jpg', image: '', pop: 0.82 },
    { id: 'artist-diljit-dosanjh', brand: 'Artist', name: 'Diljit Dosanjh', family: ['punjabi','pop','bhangra','crossover'], baseNotes: ['feel-good','anthemic','folk-pop'], desc: 'Feel-good Punjabi pop and bhangra with global crossover appeal.', buy: 'https://open.spotify.com/search/Diljit%20Dosanjh', local: 'assets/artist-diljit-dosanjh.jpg', image: '', pop: 0.88 },
    { id: 'artist-arijit-singh', brand: 'Artist', name: 'Arijit Singh', family: ['bollywood','romantic','melodic','ballad'], baseNotes: ['soulful','melisma','acoustic'], desc: 'Soulful Bollywood ballads and romantic melodies.', buy: 'https://open.spotify.com/search/Arijit%20Singh', local: 'assets/artist-arijit-singh.jpg', image: '', pop: 0.93 },
    { id: 'artist-shreya-ghoshal', brand: 'Artist', name: 'Shreya Ghoshal', family: ['bollywood','melodic','playback','classical-touch'], baseNotes: ['female-vocals','ornamentation','romance'], desc: 'Iconic playback singer with pristine melodic vocals.', buy: 'https://open.spotify.com/search/Shreya%20Ghoshal', local: 'assets/artist-shreya-ghoshal.jpg', image: '', pop: 0.91 },
    { id: 'artist-young-stunners', brand: 'Artist', name: 'Young Stunners', family: ['hip-hop','rap','urdu','underground'], baseNotes: ['wordplay','trap','storytelling'], desc: 'Karachi hip-hop duo with wordplay-driven rap and modern trap beats.', buy: 'https://open.spotify.com/search/Young%20Stunners', local: 'assets/artist-young-stunners.jpg', image: '', pop: 0.8 },
    // English / International
    { id: 'artist-taylor-swift', brand: 'Artist', name: 'Taylor Swift', family: ['pop','singer-songwriter','country-pop','storytelling'], baseNotes: ['hooks','bridges','lyrical'], desc: 'Pop and singer-songwriter storytelling with massive hooks.', buy: 'https://open.spotify.com/search/Taylor%20Swift', local: 'assets/artist-taylor-swift.jpg', image: '', pop: 0.95 },
    { id: 'artist-the-weeknd', brand: 'Artist', name: 'The Weeknd', family: ['rnb','pop','synthwave','dark'], baseNotes: ['moody','falsetto','80s-synth'], desc: 'Moody R&B-pop blended with 80s synthwave and falsetto vocals.', buy: 'https://open.spotify.com/search/The%20Weeknd', local: 'assets/artist-the-weeknd.jpg', image: '', pop: 0.94 },
    { id: 'artist-justin-bieber', brand: 'Artist', name: 'Justin Bieber', family: ['pop','rnb','dance-pop'], baseNotes: ['radio','hooks','collabs'], desc: 'Radio-friendly pop/R&B with catchy hooks and collaborations.', buy: 'https://open.spotify.com/search/Justin%20Bieber', local: 'assets/artist-justin-bieber.jpg', image: '', pop: 0.92 },
    { id: 'artist-travis-scott', brand: 'Artist', name: 'Travis Scott', family: ['hip-hop','trap','psychedelic'], baseNotes: ['atmospheric','ad-libs','festival'], desc: 'Psychedelic trap anthems with atmospheric production.', buy: 'https://open.spotify.com/search/Travis%20Scott', local: 'assets/artist-travis-scott.jpg', image: '', pop: 0.9 },
    { id: 'artist-kendrick-lamar', brand: 'Artist', name: 'Kendrick Lamar', family: ['hip-hop','conscious','jazz-rap'], baseNotes: ['storytelling','lyrical','concept'], desc: 'Concept-driven conscious hip-hop with elite lyricism.', buy: 'https://open.spotify.com/search/Kendrick%20Lamar', local: 'assets/artist-kendrick-lamar.jpg', image: '', pop: 0.93 },
    { id: 'artist-harry-styles', brand: 'Artist', name: 'Harry Styles', family: ['pop','soft-rock','retro'], baseNotes: ['feel-good','crooner','70s-80s'], desc: 'Retro-tinged pop and soft rock with feel-good vibes.', buy: 'https://open.spotify.com/search/Harry%20Styles', local: 'assets/artist-harry-styles.jpg', image: '', pop: 0.89 },
    { id: 'artist-arctic-monkeys', brand: 'Artist', name: 'Arctic Monkeys', family: ['indie-rock','alt-rock','brit'], baseNotes: ['lyrical','groove','moody'], desc: 'Indie/alt rock with lyrical wit and groove-laden moods.', buy: 'https://open.spotify.com/search/Arctic%20Monkeys', local: 'assets/artist-arctic-monkeys.jpg', image: '', pop: 0.88 },
  ];

  // ARTISTS questions (8)
  const artistsQuestions = [
    { id: 'lang', text: 'First: Are you looking for Hindi/South Asian artists? (Yes=Hindi, No=English, Don\'t care=Both)', yes: ['hindi'], no: ['english'] },
    { id: 'hiphop', text: 'Do you enjoy hip-hop/rap as your main vibe?', yes: ['hip-hop','rap','trap'], no: ['country-pop','indie-rock'] },
    { id: 'punjabi', text: 'Do Punjabi pop/bhangra influences appeal to you?', yes: ['punjabi','bhangra','punjabi-pop'], no: ['indie-rock'] },
    { id: 'melodic', text: 'Prefer melodic, romantic vocals?', yes: ['melodic','romantic','ballad','female-vocals'], no: ['trap','dark'] },
    { id: 'moody', text: 'Do you like moody/dark synth or R&B tones?', yes: ['moody','dark','rnb','synthwave'], no: ['bhangra','country-pop'] },
    { id: 'story', text: 'Do you value storytelling/lyrical depth?', yes: ['storytelling','lyrical','conscious'], no: ['festival','club'] },
    { id: 'festival', text: 'Do you want high-energy festival anthems?', yes: ['festival','anthemic','club'], no: ['ballad'] },
    { id: 'indie', text: 'Do you like indie/alt or band-driven sounds?', yes: ['indie-rock','alt-rock','brit'], no: ['trap'] },
    { id: 'retro', text: 'Do retro 70s/80s influences attract you?', yes: ['retro','80s-synth','soft-rock'], no: ['boom-bap'] },
  ];

  // 10 yes/no questions mapped to positive/negative tags (WOMEN)
  // Each question contributes +1 to matching tags (and -1 to opposing if relevant)
  const womenQuestions = [
    { id: 'vanilla', text: 'Do you enjoy cozy vanilla or gourmand scents?', yes: ['vanilla','gourmand','sweet','warm'], no: ['fresh','citrus'] },
    { id: 'fruity', text: 'Do you like juicy, fruity vibes (peach, berries, plum)?', yes: ['fruity','berries','juicy','sweet'], no: ['woody','dark'] },
    { id: 'floral', text: 'Are soft florals (cherry blossom, freesia) your thing?', yes: ['floral','cherry-blossom'], no: ['woody'] },
    { id: 'fresh', text: 'Prefer clean and fresh scents that feel airy?', yes: ['fresh','clean','citrus'], no: ['dark','amber'] },
    { id: 'amber', text: 'Do you enjoy warm amber or a slightly sensual base?', yes: ['amber','warm'], no: ['fresh'] },
    { id: 'musky', text: 'Are you okay with a light musk note?', yes: ['musk','musky','clean-musk'], no: ['fruity'] },
    { id: 'powdery', text: 'Do you like a soft, powdery finish?', yes: ['powdery','classic'], no: ['citrus'] },
    { id: 'woody', text: 'Do wood notes (sandalwood, cashmere, woods) appeal to you?', yes: ['woody','sandalwood','cashmere','woods'], no: ['fruity'] },
    { id: 'dark', text: 'Do you like deeper, evening-leaning scents (berries + amber)?', yes: ['dark','sensual'], no: ['fresh','clean'] },
    { id: 'sweet', text: 'Overall, do you prefer your fragrances sweet?', yes: ['sweet'], no: ['fresh','woody'] },
  ];

  // MEN catalog: using Bath & Body Works men collection examples
  const menProducts = [
    {
      id: 'bbw-men-teakwood',
      brand: 'Bath & Body Works Men',
      name: 'Teakwood Body Spray',
      family: ['woody','aromatic','fresh','spicy'],
      baseNotes: ['teakwood','mahogany','cedar','musk'],
      desc: 'Rugged woods with a clean masculine edge — versatile and confident.',
      buy: 'https://www.bathandbodyworks.com/c/mens-shop',
      local: 'assets/bbw-men-teakwood.jpg',
      image: '',
      pop: 0.86
    },
    {
      id: 'bbw-men-ocean',
      brand: 'Bath & Body Works Men',
      name: 'Ocean Body Spray',
      family: ['fresh','aquatic','citrus','clean'],
      baseNotes: ['blue-cypress','vetiver','cedar','citrus'],
      desc: 'Crisp aquatic freshness with clean woods — easy daytime signature.',
      buy: 'https://www.bathandbodyworks.com/c/mens-shop',
      local: 'assets/bbw-men-ocean.jpg',
      image: '',
      pop: 0.84
    },
    {
      id: 'bbw-men-graphite',
      brand: 'Bath & Body Works Men',
      name: 'Graphite Body Spray',
      family: ['woody','aromatic','fresh','musky'],
      baseNotes: ['sage','bergamot','leather','musk'],
      desc: 'Clean aromatic woods with a modern musky finish.',
      buy: 'https://www.bathandbodyworks.com/c/mens-shop',
      local: 'assets/bbw-men-graphite.jpg',
      image: '',
      pop: 0.82
    },
    {
      id: 'bbw-men-noir',
      brand: 'Bath & Body Works Men',
      name: 'Noir Body Spray',
      family: ['amber','spicy','sweet','dark'],
      baseNotes: ['black-cardamom','smoked-vanilla','amber'],
      desc: 'Smooth amber and spice with a hint of sweet vanilla — night-out ready.',
      buy: 'https://www.bathandbodyworks.com/c/mens-shop',
      local: 'assets/bbw-men-noir.jpg',
      image: '',
      pop: 0.83
    },
    {
      id: 'bbw-men-bourbon',
      brand: 'Bath & Body Works Men',
      name: 'Bourbon Body Spray',
      family: ['woody','warm','sweet','amber'],
      baseNotes: ['bourbon','oak','amber','vanilla'],
      desc: 'Warm boozy woods with ambered sweetness — cozy and charismatic.',
      buy: 'https://www.bathandbodyworks.com/c/mens-shop',
      local: 'assets/bbw-men-bourbon.jpg',
      image: '',
      pop: 0.81
    }
  ];

  // MEN questions
  const menQuestions = [
    { id: 'fresh', text: 'Do you like fresh, clean scents that feel shower-crisp?', yes: ['fresh','clean','aquatic','citrus'], no: ['amber','sweet'] },
    { id: 'citrus', text: 'Are citrus notes (bergamot, lemon) a plus for you?', yes: ['citrus','fresh'], no: ['sweet'] },
    { id: 'woody', text: 'Do you prefer woody notes (cedar, teak, mahogany)?', yes: ['woody','cedar','teakwood','mahogany'], no: ['fruity'] },
    { id: 'spicy', text: 'Do you enjoy a dash of spice (cardamom, pepper)?', yes: ['spicy','black-cardamom'], no: ['aquatic'] },
    { id: 'amber', text: 'Do warm amber tones appeal to you?', yes: ['amber','warm'], no: ['fresh'] },
    { id: 'leather', text: 'Do you like a subtle leather nuance?', yes: ['leather','musky'], no: ['citrus'] },
    { id: 'sweet', text: 'Do you like a slightly sweet edge (vanilla, tonka)?', yes: ['sweet','vanilla','tonka'], no: ['citrus','aquatic'] },
    { id: 'day', text: 'Looking mainly for a daytime scent?', yes: ['fresh','clean','aquatic'], no: ['dark','amber'] },
    { id: 'night', text: 'Looking mainly for a night-out vibe?', yes: ['dark','amber','spicy'], no: ['fresh'] },
    { id: 'bold', text: 'Do you want it more bold than subtle?', yes: ['amber','spicy','woody'], no: ['fresh','clean'] },
  ];

  // Active segment state
  let segment = 'women';
  let activeProducts = womenProducts;
  let activeQuestions = womenQuestions;

  // State
  let current = 0;
  let answers = []; // values: true (yes), false (no), null (don't care), undefined = unanswered
  let useBackend = false;

  // DOM elements
  const qEl = document.getElementById('question-text');
  const quizEl = document.getElementById('quiz');
  const resEl = document.getElementById('result');
  const yesBtn = document.getElementById('btn-yes');
  const noBtn = document.getElementById('btn-no');
  const anyBtn = document.getElementById('btn-any');
  const progressText = document.getElementById('progress-text');
  const progressBar = document.getElementById('progress-bar');
  const recName = document.getElementById('rec-name');
  const recDesc = document.getElementById('rec-desc');
  const recFamily = document.getElementById('rec-family');
  const recBase = document.getElementById('rec-basenotes');
  const buyLink = document.getElementById('buy-link');
  const brandPill = document.getElementById('brand-pill');
  const scoreLine = document.getElementById('score-line');
  const restartBtn = document.getElementById('btn-restart');
  const recImg = document.getElementById('rec-image');
  const backBtn = document.getElementById('btn-back');
  const segWomenBtn = document.getElementById('seg-women');
  const segMenBtn = document.getElementById('seg-men');
  const heroSub = document.getElementById('hero-sub');
  const viewGalleryBtn = document.getElementById('view-gallery');
  const exhibitionsBtn = document.getElementById('btn-exhibitions');
  const bookEventBtn = document.getElementById('btn-book-event');
  const imgStatus = document.getElementById('img-status');
  const topMatchesEl = document.getElementById('top-matches');
  const changePicBtn = document.getElementById('change-pic');
  const resetPicBtn = document.getElementById('reset-pic');

  function renderQuestion() {
    const q = activeQuestions[current];
    qEl.textContent = q.text;
    const answeredCount = answers.filter(a => a !== undefined).length;
    progressText.textContent = `Question ${Math.min(answeredCount + 1, activeQuestions.length)} of ${activeQuestions.length}`;
    const pct = (answeredCount / activeQuestions.length) * 100;
    progressBar.style.width = Math.max(10, Math.min(100, pct + 10)) + '%';
  }

  async function next(answerVal) {
    // store at current index
    answers[current] = answerVal;
    if (useBackend) {
      try {
        const mapped = answers.map(a => a === undefined ? null : a);
        const nxt = await backend.nextQuestion(segment, mapped);
        current = nxt.index;
        // if all answered
        if (answers.every(a => a !== undefined)) { await showResult(); return; }
        renderQuestion();
        return;
      } catch (_) { /* fall through to local */ }
    }
    // local linear fallback
    const nextIndex = answers.findIndex(a => a === undefined);
    if (nextIndex === -1) { await showResult(); }
    else { current = nextIndex; renderQuestion(); }
  }

  // Allow user to go back and change the previous answer
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (current === 0) return;
      // Step back one question and remove the last answer
      current = Math.max(0, current - 1);
      answers.pop();
      // Show quiz again if result was shown
      resEl.classList.add('hidden');
      quizEl.classList.remove('hidden');
      renderQuestion();
    });
  }

function scoreProducts() {
  // Build preference weights with slight recency boost
  const pref = new Map();
  const totalQs = activeQuestions.length;
  activeQuestions.forEach((q, i) => {
    const ans = answers[i];
    if (ans === undefined || ans === null) return; // don't care
    const recency = 0.9 + 0.2 * (i / Math.max(1, totalQs - 1)); // 0.9..1.1
    const yes = ans === true;
    const posTags = yes ? q.yes : q.no;
    const negTags = yes ? q.no : q.yes;
    posTags.forEach(tag => pref.set(tag, (pref.get(tag) || 0) + 1 * recency));
    negTags.forEach(tag => pref.set(tag, (pref.get(tag) || 0) - 0.4 * recency));
  });

  // IDF-like rarity weights across catalog
  const poolAll = activeProducts;
  const N = poolAll.length;
  const df = new Map();
  const addDf = (tag) => df.set(tag, (df.get(tag) || 0) + 1);
  poolAll.forEach(p => {
    const tags = new Set([...(p.family||[]), ...(p.baseNotes||[])]);
    tags.forEach(t => addDf(t));
  });
  const idf = (tag) => {
    const d = df.get(tag) || 0;
    return Math.log((N + 1) / (d + 1)) + 1; // 1.. ~ >1
  };

  // Conflicting tag pairs to gently discourage mismatches
  const conflicts = [
    ['fresh','dark'], ['fresh','amber'], ['fruity','woody'], ['citrus','powdery']
  ];

  // Compute product scores: match on family and baseNotes
  const scored = poolAll.map(p => {
    let s = 0;
    let familyMatches = 0, baseMatches = 0;
    (p.family||[]).forEach(tag => { const w = (pref.get(tag) || 0) * idf(tag); s += 1.0 * w; if (w > 0) familyMatches++; });
    (p.baseNotes||[]).forEach(tag => { const w = (pref.get(tag) || 0) * idf(tag); s += 0.9 * w; if (w > 0) baseMatches++; });
    // Coverage bonuses: reward breadth of match
    s += 0.35 * familyMatches + 0.25 * baseMatches;
    // Penalties for conflicts
    conflicts.forEach(([a,b]) => {
      const hasA = (p.family||[]).includes(a) || (p.baseNotes||[]).includes(a);
      const hasB = (p.family||[]).includes(b) || (p.baseNotes||[]).includes(b);
      if (hasA && hasB) s -= 0.5;
    });
    // Popularity tie-breaker if present
    if (typeof p.pop === 'number') s += 0.05 * p.pop;
    return { product: p, score: s };
  }).sort((a, b) => b.score - a.score);
  return scored;
}

function bottleSVGDataUrl(brand, name, theme) {
  const colors = {
    vanilla: ['#f8d8c8','#f2bfa5'],
    fruity: ['#ffd6e7','#ff9fc5'],
    floral: ['#e8e3ff','#c9c1ff'],
    fresh: ['#d6f5ff','#aee6ff'],
    amber: ['#ffe6cc','#ffcc99'],
    default: ['#f1f1f1','#dedede']
  };
  const [c1,c2] = colors[theme] || colors.default;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns='http://www.w3.org/2000/svg' width='340' height='540' viewBox='0 0 340 540'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stop-color='${c1}'/>
        <stop offset='100%' stop-color='${c2}'/>
      </linearGradient>
      <filter id='shadow' x='-20%' y='-20%' width='140%' height='140%'>
        <feDropShadow dx='0' dy='8' stdDeviation='8' flood-color='rgba(0,0,0,0.18)'/>
      </filter>
    </defs>
    <rect x='90' y='40' width='160' height='40' rx='8' fill='#d4b782' filter='url(#shadow)'/>
    <rect x='60' y='80' width='220' height='400' rx='24' fill='url(#g)' stroke='#e8e8e8' stroke-width='2' filter='url(#shadow)'/>
    <rect x='95' y='180' width='150' height='90' rx='10' fill='rgba(255,255,255,0.75)' stroke='#e8e6e6'/>
    <text x='170' y='215' text-anchor='middle' font-family='Poppins, Arial' font-size='16' fill='#333'>${brand}</text>
    <text x='170' y='245' text-anchor='middle' font-family='Poppins, Arial' font-size='20' font-weight='600' fill='#333'>${name}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

  async function fetchWikipediaImage(name, brand) {
    try {
      const query = encodeURIComponent(`${brand} ${name} fine fragrance mist bottle`);
      const url = `https://en.wikipedia.org/w/api.php?origin=*&action=query&generator=search&gsrsearch=${query}&gsrlimit=1&prop=pageimages&piprop=original&format=json`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.query || !data.query.pages) return null;
      const pages = Object.values(data.query.pages);
      if (!pages.length) return null;
      const p = pages[0];
      return (p.original && p.original.source) ? p.original.source : null;
    } catch {
      return null;
    }
  }

  // Build a safe Amazon search URL for a given product
  function amazonSearchUrl(brand, name) {
    const q = encodeURIComponent(`${brand} ${name} Victoria's Secret`);
    return `https://www.amazon.com/s?k=${q}`;
  }

  // Decide which Buy URL to use: for Victoria's Secret, send to Amazon
  function getBuyUrl(product) {
    const brand = (product.brand || '').toLowerCase();
    if (brand.includes("victoria")) {
      return amazonSearchUrl(product.brand || '', product.name || '');
    }
    return product.buy;
  }

  async function showResult() {
    let ranked = null;
    if (useBackend) {
      try {
        const mapped = answers.map(a => a === undefined ? null : a);
        const res = await backend.recommend(segment, mapped);
        // map to local structure
        ranked = (res.results||[]).map(r => ({ product: { id:r.id, brand:r.brand, name:r.name, family:r.family, baseNotes:r.baseNotes, desc:r.desc, buy:r.buy, pop:r.pop, local: undefined, image: undefined }, score: r.score }));
      } catch (_) {
        ranked = scoreProducts();
      }
    } else {
      ranked = scoreProducts();
    }
    if (!ranked.length) return;

    const renderSelected = async ({product, score}) => {
      recName.textContent = product.name;
      recDesc.textContent = product.desc;
      recFamily.textContent = (product.family||[]).join(', ');
      recBase.textContent = (product.baseNotes||[]).join(', ');
      buyLink.href = getBuyUrl(product);
      brandPill.textContent = product.brand;
      scoreLine.textContent = `Match score: ${score.toFixed(2)}`;

      // Image handling uses existing staged loader
      const theme = product.family.find(t => ['vanilla','fruity','floral','fresh','amber'].includes(t)) || 'default';
      const overrideKey = `product_img_override:${product.id}`;
      const overrideUrl = (typeof localStorage !== 'undefined') ? localStorage.getItem(overrideKey) : null;
      let stage = 0;
      const setStatus = (msg, error=false) => {
        if (!imgStatus) return;
        imgStatus.style.display = msg ? 'block' : 'none';
        imgStatus.style.color = error ? '#b00020' : '#6a6a6a';
        imgStatus.textContent = msg || '';
      };
      const tryNext = async () => {
        stage++;
        if (stage === 1) {
          if (product.image) { setStatus('Loading official image…'); recImg.src = product.image; }
          else { await tryNext(); }
        } else if (stage === 2) {
          setStatus('Searching Wikipedia image…');
          const wiki = await fetchWikipediaImage(product.name, product.brand);
          if (wiki) { recImg.src = wiki; }
          else { await tryNext(); }
        } else {
          recImg.onerror = null;
          setStatus('Showing generated bottle preview.', false);
          recImg.src = bottleSVGDataUrl(product.brand, product.name, theme);
        }
      };
      recImg.onerror = async () => { setStatus('Image failed to load, trying fallback…', true); await tryNext(); };
      recImg.onload = () => setStatus('');
      if (product.local) { setStatus('Loading local image…'); recImg.src = product.local; }
      else { await tryNext(); }
    };

    // Populate Top 3 matches UI
    if (topMatchesEl) {
      topMatchesEl.innerHTML = '';
      const top3 = ranked.slice(0, 3);
      top3.forEach((r, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn ghost';
        btn.style.marginRight = '8px';
        btn.textContent = `${idx+1}. ${r.product.name}`;
        btn.title = `Score ${r.score.toFixed(2)} – ${r.product.brand}`;
        btn.addEventListener('click', () => { renderSelected(r); });
        topMatchesEl.appendChild(btn);
      });
    }

    // Render first match by default
    await renderSelected(ranked[0]);

    // Note: removed a duplicate image/gallery block that referenced an undefined `top` variable.

    quizEl.classList.add('hidden');
    resEl.classList.remove('hidden');
    launchConfetti();
  }

  // Confetti: lightweight particles in a fixed overlay
  const confettiRoot = document.getElementById('confetti-canvas');
  function launchConfetti() {
    const colors = ['#f15bb5','#fee440','#00bbf9','#00f5d4','#9b5de5','#4c6fff'];
    const count = 180;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      const size = 6 + Math.random() * 6;
      p.style.position = 'absolute';
      p.style.width = size + 'px';
      p.style.height = size * (0.6 + Math.random()) + 'px';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = (Math.random() * 100) + 'vw';
      p.style.top = (-10 - Math.random() * 30) + 'px';
      p.style.opacity = (0.75 + Math.random() * 0.25).toString();
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      p.style.borderRadius = '2px';
      p.style.willChange = 'transform, top, left';
      confettiRoot.appendChild(p);

      const fall = 8 + Math.random() * 10;
      const drift = (Math.random() * 2 - 1) * 0.6;
      let y = -20 - Math.random() * 40;
      let x = parseFloat(p.style.left);
      let rot = Math.random() * 360;
      let t = 0;

      const animate = () => {
        t += 0.016;
        y += fall;
        x += Math.sin(t * 4) * 0.8 + drift;
        rot += 6 + Math.random() * 2;
        p.style.top = y + 'px';
        p.style.left = x + 'vw';
        p.style.transform = `rotate(${rot}deg)`;
        if (y < window.innerHeight + 40) {
          requestAnimationFrame(animate);
        } else {
          p.remove();
        }
      };
      requestAnimationFrame(animate);
    }
  }

  // Event bindings
  yesBtn.addEventListener('click', () => next(true));
  noBtn.addEventListener('click', () => next(false));
  anyBtn.addEventListener('click', () => next(null));
  restartBtn.addEventListener('click', () => {
    current = 0; answers = new Array(activeQuestions.length).fill(undefined);
    resEl.classList.add('hidden');
    quizEl.classList.remove('hidden');
    renderQuestion();
  });

  function switchSegment(to) {
    if (segment === to) return;
    segment = to;
    // Update active sets
    if (segment === 'women') {
      activeProducts = womenProducts;
      activeQuestions = womenQuestions;
      heroSub.textContent = 'Answer 10 quick questions and we’ll suggest a fine fragrance mist that matches your vibe.';
    } else if (segment === 'men') {
      activeProducts = menProducts;
      activeQuestions = menQuestions;
      heroSub.textContent = 'Answer 10 quick questions and we’ll suggest a men’s body spray with the vibe you want.';
    }
    // Reset quiz
    current = 0; answers = new Array(activeQuestions.length).fill(undefined);
    resEl.classList.add('hidden');
    quizEl.classList.remove('hidden');
    // Toggle button active styles
    if (segWomenBtn && segMenBtn) {
      segWomenBtn.classList.toggle('active', segment==='women');
      segWomenBtn.setAttribute('aria-selected', segment==='women');
      segMenBtn.classList.toggle('active', segment==='men');
      segMenBtn.setAttribute('aria-selected', segment==='men');
    }
    renderQuestion();
  }

  if (segWomenBtn && segMenBtn) {
    segWomenBtn.addEventListener('click', () => switchSegment('women'));
    segMenBtn.addEventListener('click', () => switchSegment('men'));
  }

  // Nearest Exhibitions: redirect to Event Planner page (overrideable)
  function openNearestExhibitions() {
    const open = (url) => window.open(url, '_blank', 'noopener');
    // 1) Allow override via localStorage key 'exhibitions_url'
    const stored = (typeof localStorage !== 'undefined') ? localStorage.getItem('exhibitions_url') : null;
    if (stored) { open(stored); return; }

    // 2) Try local Windows file path (your repository path)
    const fileUrl = 'file:///C:/Users/Administrator/Desktop/test/auto_events/templates/builder_page.html';
    try {
      open(fileUrl);
    } catch (_) {
      // 3) Fallback: event_detail template
      open('file:///C:/Users/Administrator/Desktop/test/auto_events/templates/event_detail.html');
    }
  }
  if (exhibitionsBtn) {
    exhibitionsBtn.addEventListener('click', openNearestExhibitions);
  }

  // Book Event direct button -> Event Planner
  if (bookEventBtn) {
    bookEventBtn.addEventListener('click', () => {
      const stored = (typeof localStorage !== 'undefined') ? localStorage.getItem('exhibitions_url') : null;
      const url = stored || 'file:///C:/Users/Administrator/Desktop/test/auto_events/templates/builder_page.html';
      window.open(url, '_blank', 'noopener');
    });
  }

  // Init
  (async () => {
    // detect backend
    useBackend = await backend.health();
    // fetch questions from backend for current segment when available
    if (useBackend) {
      try {
        const qs = await backend.questions(segment);
        if (Array.isArray(qs) && qs.length) activeQuestions = qs;
      } catch (_) { /* ignore */ }
    }
    answers = new Array(activeQuestions.length).fill(undefined);
    if (useBackend) {
      try {
        const nxt = await backend.nextQuestion(segment, answers.map(()=>null));
        current = nxt.index;
      } catch (_) { current = 0; }
    }
    renderQuestion();
  })();
})();
