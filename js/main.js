/**
 * FINAL ENGINE - LOCAL VIDEO EDITION
 */

const app = {
    state: {
        mode: null,
        questions: [],
        currentQIndex: 0,
        players: [],
        currentPlayerIndex: 0,
        startTime: 0,
        currentStreak: 0,
        bgCoreColor: '#1c110a'
    },
    
    mouse: { x: window.innerWidth/2, y: window.innerHeight/2, targetX: window.innerWidth/2, targetY: window.innerHeight/2 },
    els: {},
    audioCtx: null,
    particles: [],
    audioStarted: false,

    init() {
        console.log("System: Init");
        const get = (id) => document.getElementById(id);
        
        try {
            this.els = {
                screens: document.querySelectorAll('.screen'),
                topBar: get('global-top-bar'),
                canvas: get('ambient-canvas'),
                audio: get('bg-audio'),
                audioToggleBtn: get('audio-toggle'),
                introScreen: get('intro-screen'),
                introPhases: [get('intro-phase-1'), get('intro-phase-2'), get('intro-phase-3')],
                questionIndicator: get('question-indicator'),
                progressFill: get('progress-fill'),
                scoreboard: get('scoreboard-container'),
                qType: get('q-type-label'),
                qPrompt: get('q-prompt'),
                qSource: get('q-source'),
                qArea: get('q-interactive-area'),
                streakInd: get('streak-indicator'),
                streakCount: get('streak-count'),
                fbTitle: get('feedback-title'),
                fbPoints: get('feedback-points'),
                fbVisual: get('feedback-visual'),
                fbDetails: get('feedback-details'),
                fbExpl: get('feedback-explanation'),
                turnSubtitle: get('turn-subtitle'),
                turnPlayer: get('turn-player-name'),
                resContent: get('result-content'),
                resTitle: get('result-main-title'),
                archiveBtn: get('btn-archive'),
                videoOverlay: get('video-overlay'),
                videoPlayer: get('local-video-player')
            };
        } catch(e) { console.error("DOM Mapping Error", e); }

        this.initCanvas();
        this.bindEvents();
        
        if(this.els.audio) {
            this.els.audio.volume = 0.4;
            this.els.audio.onplay = () => { this.audioStarted = true; if(this.els.audioToggleBtn) this.els.audioToggleBtn.classList.add('playing'); };
            this.els.audio.onpause = () => { if(this.els.audioToggleBtn) this.els.audioToggleBtn.classList.remove('playing'); };
        }

        window.onmousemove = (e) => { this.mouse.targetX = e.clientX; this.mouse.targetY = e.clientY; };
        window.onresize = () => this.initCanvas();
        
        this.playIntroSequence();
        this.startAmbientAnimation();
    },

    bindEvents() {
        const bind = (id, fn) => { 
            const el = document.getElementById(id); 
            if(el) el.onclick = (e) => { if(e) e.preventDefault(); fn(); }; 
        };

        bind('btn-enter', () => { if(this.els.audio) this.els.audio.play().catch(()=>{}); this.showScreen('hub-screen'); });
        bind('btn-proceed', () => this.nextStep());
        bind('btn-ready', () => this.startTurn());
        bind('btn-tutorial', () => this.startTutorial());
        bind('btn-normal', () => this.startNormalMode());
        
        // Versus Flow
        bind('btn-versus', () => this.showScreen('name-screen'));
        bind('btn-start-vs', () => {
            const n1 = document.getElementById('p1-name-input').value.trim() || 'Player 1';
            const n2 = document.getElementById('p2-name-input').value.trim() || 'Player 2';
            this.startVersusMode(n1, n2);
        });

        // Video experience
        bind('btn-video', () => this.openVideo());
        bind('btn-video-close', () => this.closeVideo());

        bind('btn-about', () => this.showScreen('about-screen'));
        bind('btn-about-back', () => this.showScreen('hub-screen'));
        bind('btn-archive-back', () => this.showScreen('hub-screen'));
        bind('btn-restart', () => this.resetGame());
        
        if(this.els.audioToggleBtn) {
            this.els.audioToggleBtn.onclick = (e) => { e.stopPropagation(); if(this.els.audio.paused) this.els.audio.play(); else this.els.audio.pause(); };
        }
    },

    openVideo() {
        if(this.els.audio) this.els.audio.pause(); 
        
        const overlay = document.getElementById('video-overlay');
        const player = document.getElementById('yt-player');
        
        if(overlay && player) {
            // Official Pink Floyd Video
            player.src = "https://www.youtube.com/embed/IXdNnw99-Ic?autoplay=1";
            overlay.style.display = 'flex';
            setTimeout(() => overlay.classList.add('active'), 50);
        }
    },

    closeVideo() {
        const overlay = document.getElementById('video-overlay');
        const player = document.getElementById('yt-player');
        
        if(overlay && player) {
            overlay.classList.remove('active');
            player.src = ""; // Stop YouTube video completely
            setTimeout(() => overlay.style.display = 'none', 800);
            if(this.els.audio && this.audioStarted) this.els.audio.play();
        }
    },

    playSFX(type) {
        if(!this.audioStarted) return;
        try {
            if(!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = this.audioCtx.createOscillator(); const gain = this.audioCtx.createGain();
            osc.connect(gain); gain.connect(this.audioCtx.destination);
            const now = this.audioCtx.currentTime;
            if(type === 'correct') { osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.5); osc.start(now); osc.stop(now+0.5); }
            else if(type === 'wrong') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, now); gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.4); osc.start(now); osc.stop(now+0.4); }
            else if(type === 'impact') { osc.type = 'sine'; osc.frequency.setValueAtTime(150, now); gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now+1); osc.start(now); osc.stop(now+1); }
        } catch(e) {}
    },

    playIntroSequence() {
        const ps = this.els.introPhases; const intro = this.els.introScreen; if(!intro) return this.showScreen('splash-screen');
        const run = (i) => {
            if(i >= ps.length) { intro.style.opacity = '0'; setTimeout(() => { intro.style.display = 'none'; this.showScreen('splash-screen'); }, 1000); return; }
            const p = ps[i]; if(!p) return run(i+1);
            p.style.display = 'flex'; p.classList.add('fade-in-text');
            setTimeout(() => { p.classList.remove('fade-in-text'); p.classList.add('burning-text'); this.triggerFireEruption(); setTimeout(() => { p.style.display = 'none'; run(i+1); }, 2400); }, 2000);
        };
        run(0);
    },

    showScreen(id) {
        const currentActive = document.querySelector('.screen.active');
        if (currentActive && currentActive.id !== id) {
            currentActive.classList.add('exit');
            currentActive.classList.remove('active');
            setTimeout(() => {
                currentActive.classList.remove('exit');
                currentActive.style.display = 'none';
            }, 600);
        }

        if(id !== 'feedback-screen' && id !== 'game-screen' && id !== 'video-overlay') this.playSFX('impact');

        const target = document.getElementById(id);
        if(target) {
            target.style.display = 'flex';
            setTimeout(() => target.classList.add('active'), 20);
        }
        
        if(this.els.topBar) {
            const isGame = (id === 'game-screen' || id === 'feedback-screen');
            this.els.topBar.classList.toggle('visible', isGame);
        }
    },

    startTutorial() { this.state.mode = 'tutorial'; this.state.questions = window.tutorialData || []; this.setupGame(false); },
    startNormalMode() { this.state.mode = 'normal'; this.state.questions = this.shuffleArray((window.questionsData || []).slice()); this.setupGame(true); },
    
    startVersusMode(n1, n2) { 
        this.state.mode = 'versus'; 
        this.state.questions = this.shuffleArray((window.questionsData || []).slice()); 
        this.state.players = [this.createPlayerObj(n1), this.createPlayerObj(n2)]; 
        this.state.currentPlayerIndex = 0; 
        this.state.currentQIndex = 0; 
        this.buildScoreboard(true); 
        this.els.turnSubtitle.innerText = "The Trial Begins"; 
        this.els.turnPlayer.innerText = n1; 
        this.showScreen('turn-screen'); 
    },

    setupGame(sb) {
        this.state.currentQIndex = 0; this.state.currentStreak = 0; this.state.bgCoreColor = '#1c110a';
        if(this.state.mode !== 'versus') this.state.players = [this.createPlayerObj('Player 1')];
        this.updateStreakUI(); this.buildScoreboard(sb); this.state.startTime = Date.now(); this.loadQuestion(); this.showScreen('game-screen');
    },

    startTurn() { this.state.startTime = Date.now(); this.state.currentStreak = 0; this.state.bgCoreColor = '#1c110a'; this.updateStreakUI(); this.loadQuestion(); this.showScreen('game-screen'); },

    loadQuestion() {
        const q = this.state.questions[this.state.currentQIndex]; if(!q) return;
        const labs = { 'multiple_choice': 'Multiple Choice', 'true_false': 'True / False', 'interpretation': 'Interpretation', 'typed_translation': 'Absolute Translation', 'partial_translation': 'Partial Translation' };
        if(this.els.qType) this.els.qType.innerText = labs[q.type] || 'Translation';
        if(this.els.qPrompt) this.els.qPrompt.innerText = q.prompt;
        if(this.els.qSource) {
            this.els.qSource.innerHTML = '';
            const txt = q.sourceText.includes('"') ? q.sourceText : `"${q.sourceText}"`;
            txt.split(' ').forEach((w, i) => { const s = document.createElement('span'); s.className = 'lyric-word'; s.innerText = w + ' '; s.style.animationDelay = `${i * 0.08}s`; this.els.qSource.appendChild(s); });
        }
        if(this.els.qArea) {
            this.els.qArea.innerHTML = ''; 
            if (['multiple_choice', 'true_false', 'interpretation'].includes(q.type)) {
                q.options.forEach((o, i) => {
                    const b = document.createElement('button'); b.className = `btn-option fade-enter stagger-${(i%4)+1}`; b.innerText = o;
                    b.onclick = () => this.handleAnswer(o, q);
                    this.els.qArea.appendChild(b);
                });
            } else {
                const c = document.createElement('div'); c.className = 'fade-enter stagger-1';
                const inp = document.createElement('input'); inp.type = 'text'; inp.className = 'typing-input mb-lg'; inp.placeholder = 'Type...'; inp.autocomplete = 'off'; inp.id = 'active-input-field';
                const sub = document.createElement('button'); sub.className = 'btn btn-primary'; sub.innerText = 'Submit';
                sub.onclick = () => { if(inp.value.trim()) this.handleAnswer(inp.value.trim(), q); };
                inp.onkeydown = (ev) => { if(ev.key === 'Enter') sub.click(); };
                c.appendChild(inp); c.appendChild(sub); this.els.qArea.appendChild(c);
                setTimeout(() => inp.focus(), 600);
            }
        }
        this.updateHUD();
    },

    handleAnswer(u, q) {
        let pts = 0, pct = 0, ok = false;
        const isObj = ['multiple_choice', 'true_false', 'interpretation'].includes(q.type);
        if (isObj) { if (u === q.correctAnswer) { pts = 10; ok = true; pct = 100; }
            if(this.els.fbDetails) this.els.fbDetails.innerHTML = ok ? `<p>Selection: <span class="highlight">${u}</span></p>` : `<p>Selection: <span class="error-text">${u}</span></p><p class="mt-sm">Truth: <span class="highlight">${q.correctAnswer}</span></p>`;
        } else {
            pct = this.calculateSimilarity(u, q.correctAnswer); pts = pct >= 99 ? 10 : (pct >= 70 ? 7 : (pct >= 50 ? 5 : (pct >= 30 ? 3 : (pct >= 1 ? 1 : 0)))); ok = pct >= 50;
            if(this.els.fbDetails) this.els.fbDetails.innerHTML = `<p>Input: <span class="${pct === 100 ? 'highlight' : 'error-text'}">${u}</span></p>${pct < 100 ? `<p class="mt-sm">Expected: <span class="highlight">${q.correctAnswer}</span></p>` : ''}`;
        }
        if(ok) { this.state.currentStreak++; this.playSFX('correct'); this.state.bgCoreColor = this.state.currentStreak > 2 ? '#331b0a' : '#1c110a'; }
        else { this.state.currentStreak = 0; this.playSFX('wrong'); this.state.bgCoreColor = '#050508'; }
        const p = this.state.players[this.state.currentPlayerIndex]; if (p) { p.score += pts; p.totalPercent += pct; if(pct >= 100) p.perfects++; p.answers.push({ pts, pct }); }
        this.updateStreakUI(); this.updateHUD(); this.renderFeedbackScreen(ok, pts, pct, q.explanation, q.type);
    },

    renderFeedbackScreen(ok, pts, pct, expl, type) {
        const isT = type.includes('translation');
        if(this.els.fbTitle) { this.els.fbTitle.innerText = (pct >= 100 || (ok && !isT)) ? "Absolute Clarity." : (pct >= 50 ? "Fragmented Truth." : "Lost in the Void."); this.els.fbTitle.className = (pct >= 100 || (ok && !isT)) ? "title-md mb-xs gold-text" : (pct >= 50 ? "title-md mb-xs" : "title-md mb-xs fire-text"); }
        if(this.els.fbPoints) { this.els.fbPoints.innerText = `+${pts}`; this.els.fbPoints.classList.toggle('zero', pts === 0); }
        let dp = !isT ? (ok ? 100 : 0) : Math.round(pct);
        if(this.els.fbVisual) this.els.fbVisual.innerHTML = `<svg class="percent-ring-svg" viewBox="0 0 100 100"><circle class="percent-ring-bg" cx="50" cy="50" r="45"></circle><circle class="percent-ring-fill ${!ok ? 'error' : ''}" cx="50" cy="50" r="45" style="stroke-dashoffset: ${283 - (dp/100)*283};"></circle><text class="percent-ring-text" x="50" y="50" fill="${ok ? '#cca450' : '#d95c14'}">${dp}%</text></svg>`;
        if(this.els.fbExpl) this.els.fbExpl.innerText = expl; this.showScreen('feedback-screen');
    },

    nextStep() {
        this.state.currentQIndex++; const total = this.state.questions.length;
        if (this.state.mode === 'versus') {
            if (this.state.currentQIndex < total) {
                this.state.currentPlayerIndex = this.state.currentPlayerIndex === 0 ? 1 : 0;
                if(this.els.turnPlayer) this.els.turnPlayer.innerText = this.state.players[this.state.currentPlayerIndex].name;
                this.buildScoreboard(true); this.showScreen('turn-screen');
            } else { if(this.state.players[this.state.currentPlayerIndex]) this.state.players[this.state.currentPlayerIndex].timeElapsed = (Date.now() - this.state.startTime)/1000; this.generateResults(); }
        } else {
            if (this.state.currentQIndex < total) { this.loadQuestion(); this.showScreen('game-screen'); }
            else { if(this.state.players[0]) this.state.players[0].timeElapsed = (Date.now() - this.state.startTime)/1000; if (this.state.mode === 'tutorial') this.showScreen('hub-screen'); else this.generateResults(); }
        }
    },

    updateHUD() {
        this.state.players.forEach((p, i) => { const s = document.getElementById(`score-p${i}`); const b = document.getElementById(`badge-p${i}`); if(s) s.innerText = p.score; if(b) b.className = `score-badge ${i === this.state.currentPlayerIndex ? 'active' : ''}`; });
        const total = this.state.questions.length; if(this.els.questionIndicator) this.els.questionIndicator.innerText = `${this.state.currentQIndex + 1} / ${total}`;
        if(this.els.progressFill) this.els.progressFill.style.width = `${((this.state.currentQIndex) / total) * 100}%`;
    },

    updateStreakUI() { if(!this.els.streakInd) return; if(this.state.currentStreak >= 3) { this.els.streakInd.classList.remove('hidden'); if(this.els.streakCount) this.els.streakCount.innerText = `${this.state.currentStreak}x COMBO`; } else this.els.streakInd.classList.add('hidden'); },

    buildScoreboard(vis) {
        if(!this.els.scoreboard) return; this.els.scoreboard.innerHTML = ''; this.els.scoreboard.style.display = vis ? 'flex' : 'none';
        this.state.players.forEach((p, i) => { const b = document.createElement('div'); b.className = `score-badge ${i === this.state.currentPlayerIndex ? 'active' : ''}`; b.id = `badge-p${i}`; b.innerHTML = `<span class="name">${p.name}</span><span class="pts" id="score-p${i}">${p.score}</span>`; this.els.scoreboard.appendChild(b); });
    },

    generateResults() {
        if(!this.els.resContent) return; this.els.resContent.innerHTML = ''; const total = this.state.questions.length;
        if (this.state.mode === 'normal') { if(this.els.resTitle) this.els.resTitle.innerText = "Final Analysis"; const avg = this.state.players[0].totalPercent / total; this.els.resContent.innerHTML = this.buildResultCard(this.state.players[0], avg, total * 10, true); if(avg >= 80) { this.els.archiveBtn.classList.remove('hidden'); this.playSFX('correct'); } }
        else if (this.state.mode === 'versus') { const p1 = this.state.players[0], p2 = this.state.players[1]; let w = p1.score > p2.score ? p1 : (p2.score > p1.score ? p2 : (p1.perfects > p2.perfects ? p1 : p2)); if(this.els.resTitle) this.els.resTitle.innerText = `${w.name} Prevails`; const qp = total / 2; this.els.resContent.innerHTML = this.buildResultCard(p1, p1.totalPercent / qp, qp * 10, w === p1) + this.buildResultCard(p2, p2.totalPercent / qp, qp * 10, w === p2); this.triggerVictoryFireworks(); }
        this.showScreen('result-screen');
    },

    buildResultCard(p, avg, max, win) { return `<div class="result-card ${win ? 'winner' : ''}"><svg class="crown-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z"/></svg><div class="rc-name">${p.name}</div><div class="rc-score">${p.score}</div><div class="stats-box mt-md"><div class="stat-row"><span>Accuracy</span><span class="val">${avg.toFixed(1)}%</span></div><div class="stat-row"><span>Perfects</span><span class="val">${p.perfects}</span></div><div class="stat-row"><span>Time</span><span class="val">${p.timeElapsed.toFixed(1)}s</span></div></div></div>`; },
    shuffleArray(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; },
    createPlayerObj(n) { return { name: n, score: 0, answers: [], perfects: 0, totalPercent: 0, timeElapsed: 0 }; },
    calculateSimilarity(s1, s2) {
        const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[.,!?;&"']/g, "").replace(/\s+/g, " ").trim();
        const a = norm(s1), b = norm(s2); if (a === b) return 100; if (!a || !b) return 0;
        const m = Array.from({length: b.length + 1}, (_, i) => [i]); for(let j=1; j<=a.length; j++) m[0][j] = j;
        for(let i=1; i<=b.length; i++) for(let j=1; j<=a.length; j++) m[i][j] = b[i-1] === a[j-1] ? m[i-1][j-1] : Math.min(m[i-1][j-1]+1, m[i][j-1]+1, m[i-1][j]+1);
        const dist = m[b.length][a.length]; const maxL = Math.max(a.length, b.length); return Math.max(0, ((maxL - dist) / maxL) * 100);
    },

    resetGame() { this.state.mode = null; this.state.currentQIndex = 0; this.state.players = []; this.showScreen('hub-screen'); },

    initCanvas() {
        if(!this.els.canvas) return;
        this.els.canvas.width = window.innerWidth; this.els.canvas.height = window.innerHeight;
        this.ctx = this.els.canvas.getContext('2d', { alpha: false });
        this.particles = []; const n = Math.floor(window.innerWidth / 15); for(let i = 0; i < n; i++) this.particles.push(this.createParticle(true));
    },

    createParticle(init = false) { 
        return { 
            x: Math.random() * window.innerWidth, 
            y: init ? Math.random() * window.innerHeight : window.innerHeight + 20, 
            size: Math.random() * 3 + 1, 
            speedY: Math.random() * 1.5 + 0.5, 
            speedX: (Math.random() - 0.5) * 1.2, 
            opacity: Math.random() * 0.6 + 0.2, 
            fadeSpeed: Math.random() * 0.005 + 0.002,
            wobble: Math.random() * 10,
            wobbleInc: Math.random() * 0.05
        }; 
    },

    triggerFireEruption() { if(!this.ctx) return; for(let i = 0; i < 50; i++) { let p = this.createParticle(); p.y = window.innerHeight; p.speedY = Math.random() * 6 + 4; p.isEruption = true; this.particles.push(p); } },
    triggerVictoryFireworks() { if(!this.ctx) return; for(let i = 0; i < 100; i++) { let p = this.createParticle(); p.y = window.innerHeight; p.speedY = Math.random() * 12 + 8; p.speedX = (Math.random() - 0.5) * 15; p.isVictory = true; this.particles.push(p); } },

    startAmbientAnimation() {
        const r = () => {
            if(!this.ctx) return;
            this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.12; this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.12;
            const c = document.getElementById('custom-cursor'), g = document.getElementById('custom-cursor-glow');
            const cw = window.innerWidth, ch = window.innerHeight;
            if(c) { c.style.left = `${this.mouse.targetX}px`; c.style.top = `${this.mouse.targetY}px`; g.style.left = `${this.mouse.x}px`; g.style.top = `${this.mouse.y}px`; }
            const grad = this.ctx.createRadialGradient(cw/2, ch/2, 0, cw/2, ch/2, cw/1.5);
            grad.addColorStop(0, this.state.bgCoreColor); grad.addColorStop(1, '#030304');
            this.ctx.fillStyle = grad; this.ctx.fillRect(0, 0, cw, ch);
            for(let i = 0; i < this.particles.length; i++) {
                let p = this.particles[i];
                const dx = this.mouse.x - p.x, dy = this.mouse.y - p.y;
                if(dx*dx + dy*dy < 50000) { p.x -= dx * 0.04; p.y -= dy * 0.04; }
                p.wobble += p.wobbleInc;
                const xOff = Math.sin(p.wobble) * 0.5;
                if (p.isVictory) { this.ctx.fillStyle = `rgba(255, 230, 150, ${p.opacity})`; p.speedY -= 0.05; }
                else if (p.isEruption || p.opacity < 0.4) { this.ctx.fillStyle = `rgba(255, 100, 20, ${p.opacity})`; p.size *= 0.98; }
                else this.ctx.fillStyle = `rgba(255, 180, 80, ${p.opacity})`;
                this.ctx.beginPath(); this.ctx.arc(p.x + xOff, p.y, p.size, 0, Math.PI * 2); this.ctx.fill();
                p.y -= p.speedY; p.x += p.speedX; p.opacity -= p.fadeSpeed;
                if(p.opacity <= 0 || p.size < 0.1 || p.y < -50 || p.y > ch + 100) { this.particles[i] = this.createParticle(); }
            }
            requestAnimationFrame(r);
        };
        r();
    }
};

window.onload = () => app.init();