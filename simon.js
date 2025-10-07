// ================================
// SIMON GAME PRO - ADVANCED VERSION
// ================================

class SimonGamePro {
  constructor() {
    // Game state
    this.buttonColors = ["red", "blue", "green", "yellow"];
    this.gamePattern = [];
    this.userPattern = [];
    this.level = 0;
    this.score = 0;
    this.streak = 0;
    this.combo = 0;
    this.started = false;
    this.gameOver = false;
    this.isPaused = false;
    this.showingSequence = false;
    this.recording = false;
    
    // Game modes
    this.gameMode = 'classic';
    this.gameModes = {
      classic: { name: 'Classic Simon', description: 'Traditional Simon game' },
      speedrun: { name: 'Speed Run', description: 'Race against time', timeLimit: 60 },
      survival: { name: 'Survival', description: 'Limited lives', lives: 3 },
      memory: { name: 'Memory Training', description: 'Advanced patterns', complexity: 2 },
      multiplayer: { name: 'Multiplayer', description: 'Play with friends' },
      ai: { name: 'vs AI', description: 'Challenge the AI' }
    };
    
    // Advanced features
    this.reactionTimes = [];
    this.accuracy = 100;
    this.playerRank = 'Rookie';
    this.lives = 3;
    this.timeRemaining = 60;
    this.doublePointsActive = false;
    this.shieldActive = false;
    this.comboMultiplier = 1;
    
    // Settings
    this.difficulty = "normal";
    this.difficultySettings = {
      easy: { speed: 800, bonus: 1 },
      normal: { speed: 600, bonus: 2 },
      hard: { speed: 400, bonus: 3 },
      expert: { speed: 200, bonus: 5 }
    };
    
    // Audio system
    this.audioContext = null;
    this.soundEnabled = true;
    this.masterVolume = 0.7;
    this.sounds = {};
    
    // Enhanced Power-ups
    this.powerups = {
      slow: { available: true, cooldown: 0, maxCooldown: 5, cost: 100 },
      skip: { available: true, cooldown: 0, maxCooldown: 3, cost: 150 },
      hint: { available: true, cooldown: 0, maxCooldown: 4, cost: 50 },
      shield: { available: true, cooldown: 0, maxCooldown: 8, cost: 200 },
      double: { available: true, cooldown: 0, maxCooldown: 10, cost: 300 },
      reveal: { available: true, cooldown: 0, maxCooldown: 12, cost: 250 }
    };
    
    // Statistics
    this.stats = {
      gamesPlayed: 0,
      highScore: 0,
      totalScore: 0,
      averageLevel: 0,
      perfectGames: 0,
      achievements: []
    };
    
    // AI Opponent
    this.aiOpponent = {
      enabled: false,
      difficulty: 0.85, // 85% accuracy
      score: 0,
      level: 0,
      thinking: false
    };
    
    // Multiplayer
    this.multiplayer = {
      active: false,
      currentPlayer: 1,
      players: {
        1: { name: 'Player 1', score: 0, level: 0 },
        2: { name: 'Player 2', score: 0, level: 0 }
      }
    };
    
    // Pattern Recording
    this.patternRecorder = {
      recording: false,
      savedPatterns: [],
      currentRecording: []
    };
    
    // Voice Commands
    this.voiceRecognition = null;
    this.voiceEnabled = false;
    this.voiceCommands = {
      'start': () => this.startGame(),
      'pause': () => this.pauseGame(),
      'reset': () => this.resetGame(),
      'green': () => this.handleButtonClick('green'),
      'red': () => this.handleButtonClick('red'),
      'yellow': () => this.handleButtonClick('yellow'),
      'blue': () => this.handleButtonClick('blue')
    };
    
    // Analytics
    this.analytics = {
      sessionsPlayed: 0,
      totalPlayTime: 0,
      averageReactionTime: 0,
      patternAccuracy: [],
      difficultyProgression: [],
      sessionStartTime: Date.now()
    };
    
    // Advanced Effects
    this.effectsEngine = {
      canvas: null,
      ctx: null,
      particles: [],
      lightning: [],
      combos: []
    };
    
    // Theme system
    this.currentTheme = 'dark';
    this.themes = ['dark', 'light', 'neon'];
    
    this.init();
  }
  
  async init() {
    await this.initAudio();
    this.initEffectsEngine();
    this.initVoiceRecognition();
    this.loadStats();
    this.setupEventListeners();
    this.setupGameModeHandlers();
    this.updateDisplay();
    this.loadSettings();
    this.startBackgroundEffects();
  }
  
  // ================
  // AUDIO SYSTEM
  // ================
  
  async initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create sounds for each button
      this.sounds = {
        green: { frequency: 329.63, type: 'sine' },    // E4
        red: { frequency: 261.63, type: 'sine' },      // C4
        yellow: { frequency: 220.00, type: 'sine' },   // A3
        blue: { frequency: 196.00, type: 'sine' },     // G3
        success: { frequency: 523.25, type: 'triangle' }, // C5
        error: { frequency: 146.83, type: 'sawtooth' },   // D3
        achievement: { frequency: 659.25, type: 'sine' }  // E5
      };
    } catch (error) {
      console.warn('Audio context not supported:', error);
      this.soundEnabled = false;
    }
  }
  
  initEffectsEngine() {
    const canvas = document.getElementById('background-canvas');
    if (canvas) {
      this.effectsEngine.canvas = canvas;
      this.effectsEngine.ctx = canvas.getContext('2d');
      
      // Set canvas size
      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
    }
  }
  
  initVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.voiceRecognition = new SpeechRecognition();
      
      this.voiceRecognition.continuous = true;
      this.voiceRecognition.interimResults = false;
      this.voiceRecognition.lang = 'en-US';
      
      this.voiceRecognition.onresult = (event) => {
        const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        this.handleVoiceCommand(command);
      };
      
      this.voiceRecognition.onerror = (event) => {
        console.warn('Voice recognition error:', event.error);
      };
      
      this.voiceEnabled = true;
    }
  }
  
  handleVoiceCommand(command) {
    const voiceIndicator = document.getElementById('voice-indicator');
    if (voiceIndicator) {
      voiceIndicator.classList.remove('hidden');
      setTimeout(() => voiceIndicator.classList.add('hidden'), 2000);
    }
    
    for (const [key, action] of Object.entries(this.voiceCommands)) {
      if (command.includes(key)) {
        action();
        this.showAchievement('Voice Command!', `Executed: ${key}`);
        break;
      }
    }
  }
  
  startBackgroundEffects() {
    const animate = () => {
      this.updateBackgroundEffects();
      requestAnimationFrame(animate);
    };
    animate();
  }
  
  updateBackgroundEffects() {
    if (!this.effectsEngine.ctx) return;
    
    const ctx = this.effectsEngine.ctx;
    const canvas = this.effectsEngine.canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw floating particles
    ctx.fillStyle = `rgba(0, 212, 255, 0.1)`;
    for (let i = 0; i < 20; i++) {
      const x = (Date.now() / 1000 + i * 100) % canvas.width;
      const y = Math.sin(Date.now() / 1000 + i) * 50 + canvas.height / 2;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  playSound(soundType, duration = 0.3) {
    if (!this.soundEnabled || !this.audioContext) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      const sound = this.sounds[soundType];
      if (!sound) return;
      
      oscillator.type = sound.type;
      oscillator.frequency.setValueAtTime(sound.frequency, this.audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }
  
  // ================
  // GAME LOGIC
  // ================
  
  startGame() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    this.resetGame();
    this.started = true;
    this.stats.gamesPlayed++;
    this.analytics.sessionsPlayed++;
    this.analytics.sessionStartTime = Date.now();
    
    // Initialize game mode specific features
    switch (this.gameMode) {
      case 'survival':
        this.lives = this.gameModes.survival.lives;
        break;
      case 'speedrun':
        this.timeRemaining = this.gameModes.speedrun.timeLimit;
        this.startSpeedrunTimer();
        break;
      case 'multiplayer':
        this.initMultiplayer();
        break;
      case 'ai':
        this.initAIOpponent();
        break;
    }
    
    this.updateControlButtons();
    this.updateGameModeDisplay();
    this.nextSequence();
  }
  
  initMultiplayer() {
    this.multiplayer.active = true;
    this.multiplayer.currentPlayer = 1;
    const panel = document.getElementById('multiplayer-panel');
    if (panel) panel.classList.remove('hidden');
  }
  
  initAIOpponent() {
    this.aiOpponent.enabled = true;
    this.aiOpponent.score = 0;
    this.aiOpponent.level = 0;
    const panel = document.getElementById('multiplayer-panel');
    if (panel) panel.classList.remove('hidden');
  }
  
  startSpeedrunTimer() {
    const timer = setInterval(() => {
      this.timeRemaining--;
      this.updateDisplay();
      
      if (this.timeRemaining <= 0 || !this.started) {
        clearInterval(timer);
        if (this.timeRemaining <= 0) {
          this.gameOver = true;
          this.updateStatus('Time Up! Final Score: ' + this.score);
        }
      }
    }, 1000);
  }
  
  updateGameModeDisplay() {
    const panels = {
      'multiplayer': 'multiplayer-panel',
      'ai': 'multiplayer-panel'
    };
    
    // Hide all panels first
    Object.values(panels).forEach(panelId => {
      const panel = document.getElementById(panelId);
      if (panel) panel.classList.add('hidden');
    });
    
    // Show relevant panel
    if (panels[this.gameMode]) {
      const panel = document.getElementById(panels[this.gameMode]);
      if (panel) panel.classList.remove('hidden');
    }
  }
  
  pauseGame() {
    this.isPaused = !this.isPaused;
    this.updateControlButtons();
    
    if (this.isPaused) {
      this.updateStatus("Game Paused - Click Resume to Continue");
    } else {
      this.updateStatus(`Level ${this.level} - Watch the sequence`);
    }
  }
  
  resetGame() {
    this.level = 0;
    this.score = 0;
    this.streak = 0;
    this.gamePattern = [];
    this.userPattern = [];
    this.started = false;
    this.gameOver = false;
    this.isPaused = false;
    this.showingSequence = false;
    this.updateDisplay();
    this.updateControlButtons();
    this.updateStatus("Press Start to Begin");
  }
  
  async nextSequence() {
    if (this.isPaused || this.gameOver) return;
    
    this.userPattern = [];
    this.level++;
    this.showingSequence = true;
    
    // Add bonus points for higher levels
    const levelBonus = this.level * this.difficultySettings[this.difficulty].bonus;
    this.score += levelBonus;
    
    this.updateDisplay();
    this.updateStatus(`Level ${this.level} - Watch the sequence`);
    this.updateProgress();
    
    // Add new color to sequence
    const randomColor = this.buttonColors[Math.floor(Math.random() * 4)];
    this.gamePattern.push(randomColor);
    
    // Show the sequence
    await this.showSequence();
    
    this.showingSequence = false;
    this.updateStatus(`Level ${this.level} - Your turn!`);
  }
  
  async showSequence() {
    const speed = this.difficultySettings[this.difficulty].speed;
    
    for (let i = 0; i < this.gamePattern.length; i++) {
      if (this.isPaused || this.gameOver) break;
      
      await new Promise(resolve => setTimeout(resolve, speed / 2));
      await this.animateButton(this.gamePattern[i]);
      await new Promise(resolve => setTimeout(resolve, speed / 2));
    }
  }
  
  async animateButton(color, duration = 300) {
    const btn = document.getElementById(color);
    if (!btn) return;
    
    btn.classList.add("flash", "active");
    this.playSound(color, duration / 1000);
    this.createParticles(btn);
    
    return new Promise(resolve => {
      setTimeout(() => {
        btn.classList.remove("flash", "active");
        resolve();
      }, duration);
    });
  }
  
  handleButtonClick(color) {
    if (!this.started || this.gameOver || this.isPaused || this.showingSequence) return;
    
    // Record reaction time
    const reactionTime = Date.now() - this.lastButtonTime;
    this.reactionTimes.push(reactionTime);
    
    // Pattern recording
    if (this.patternRecorder.recording) {
      this.patternRecorder.currentRecording.push({
        color,
        timestamp: Date.now(),
        reactionTime
      });
    }
    
    this.userPattern.push(color);
    this.animateButton(color);
    
    // Enhanced visual feedback
    const btn = document.getElementById(color);
    if (this.combo >= 5) {
      btn.classList.add('combo-hit');
      setTimeout(() => btn.classList.remove('combo-hit'), 500);
    }
    
    this.checkAnswer(this.userPattern.length - 1);
    
    // AI opponent response (if enabled)
    if (this.aiOpponent.enabled && !this.multiplayer.active) {
      setTimeout(() => this.aiMove(), 1000 + Math.random() * 1000);
    }
  }
  
  aiMove() {
    if (!this.aiOpponent.enabled || this.gameOver) return;
    
    this.aiOpponent.thinking = true;
    
    // AI makes a move with some probability of error
    setTimeout(() => {
      const shouldMakeError = Math.random() > this.aiOpponent.difficulty;
      let aiChoice;
      
      if (shouldMakeError && this.gamePattern.length > 2) {
        // AI makes an error
        const wrongChoices = this.buttonColors.filter(c => c !== this.gamePattern[this.aiOpponent.level]);
        aiChoice = wrongChoices[Math.floor(Math.random() * wrongChoices.length)];
      } else {
        // AI makes correct choice
        aiChoice = this.gamePattern[this.aiOpponent.level] || this.buttonColors[Math.floor(Math.random() * 4)];
      }
      
      // Update AI score and level
      if (aiChoice === this.gamePattern[this.aiOpponent.level]) {
        this.aiOpponent.score += 10;
        this.aiOpponent.level++;
      } else {
        this.aiOpponent.level = 0;
      }
      
      this.aiOpponent.thinking = false;
      this.updateMultiplayerDisplay();
    }, 1000 + Math.random() * 2000);
  }
  
  updateMultiplayerDisplay() {
    const p2Score = document.getElementById('p2-score');
    const p2Level = document.getElementById('p2-level');
    
    if (p2Score) p2Score.textContent = this.aiOpponent.score;
    if (p2Level) p2Level.textContent = this.aiOpponent.level;
  }
  
  checkAnswer(currentIndex) {
    const isCorrect = this.gamePattern[currentIndex] === this.userPattern[currentIndex];
    
    if (isCorrect) {
      // Correct answer
      this.streak++;
      this.combo++;
      
      // Update accuracy
      this.analytics.patternAccuracy.push(1);
      if (this.analytics.patternAccuracy.length > 100) {
        this.analytics.patternAccuracy.shift();
      }
      this.accuracy = (this.analytics.patternAccuracy.reduce((a, b) => a + b, 0) / this.analytics.patternAccuracy.length) * 100;
      
      if (this.userPattern.length === this.gamePattern.length) {
        // Sequence completed successfully
        let points = 10 * this.difficultySettings[this.difficulty].bonus;
        
        // Combo multiplier
        if (this.combo >= 10) {
          points *= 2;
          this.showComboEffect('LEGENDARY COMBO!');
        } else if (this.combo >= 5) {
          points *= 1.5;
          this.showComboEffect('COMBO!');
        }
        
        // Double points power-up
        if (this.doublePointsActive) {
          points *= 2;
        }
        
        this.score += Math.round(points);
        this.playSound('success', 0.5);
        this.updateDisplay();
        
        // Perfect sequence bonus
        if (this.reactionTimes.slice(-this.gamePattern.length).every(time => time < 1000)) {
          const btn = document.getElementById(this.gamePattern[this.gamePattern.length - 1]);
          btn.classList.add('perfect');
          setTimeout(() => btn.classList.remove('perfect'), 1000);
          this.showAchievement('Perfect Timing!', 'All reactions under 1 second');
        }
        
        // Check for achievements
        this.checkAchievements();
        
        setTimeout(() => this.nextSequence(), 1000);
      }
    } else {
      // Wrong answer
      this.analytics.patternAccuracy.push(0);
      if (this.analytics.patternAccuracy.length > 100) {
        this.analytics.patternAccuracy.shift();
      }
      this.accuracy = (this.analytics.patternAccuracy.reduce((a, b) => a + b, 0) / this.analytics.patternAccuracy.length) * 100;
      
      this.combo = 0; // Reset combo
      
      // Check shield protection
      if (this.shieldActive) {
        this.shieldActive = false;
        document.querySelector('.simon-container').classList.remove('shielded');
        this.showAchievement('Shield Used!', 'Mistake forgiven');
        this.playSound('achievement', 0.5);
        this.updateDisplay();
        return;
      }
      
      // Handle different game modes
      if (this.gameMode === 'survival') {
        this.lives--;
        if (this.lives > 0) {
          this.showAchievement('Life Lost!', `${this.lives} lives remaining`);
          this.userPattern = [];
          this.updateDisplay();
          return;
        }
      }
      
      // Game over
      this.gameOver = true;
      this.started = false;
      this.streak = 0;
      
      this.playSound('error', 1);
      document.body.classList.add("game-over");
      setTimeout(() => document.body.classList.remove("game-over"), 500);
      
      this.updateHighScore();
      this.updateStatus(`Game Over! Final Score: ${this.score} - Press Start to play again`);
      this.updateControlButtons();
      
      // Save analytics
      this.analytics.totalPlayTime += Date.now() - this.analytics.sessionStartTime;
      this.analytics.averageReactionTime = this.reactionTimes.length > 0 ? 
        Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length) : 0;
      
      // Save stats
      this.saveStats();
    }
  }
  
  showComboEffect(text) {
    const comboContainer = document.getElementById('combo-effects');
    if (!comboContainer) return;
    
    const comboEl = document.createElement('div');
    comboEl.className = 'combo-text';
    comboEl.textContent = text;
    
    comboContainer.appendChild(comboEl);
    
    setTimeout(() => {
      if (comboEl.parentNode) {
        comboEl.parentNode.removeChild(comboEl);
      }
    }, 2000);
  }
  
  // ================
  // POWER-UPS SYSTEM
  // ================
  
  usePowerup(type) {
    const powerup = this.powerups[type];
    if (!powerup.available || powerup.cooldown > 0 || !this.started) return;
    
    // Check if player has enough points
    if (this.score < powerup.cost) {
      this.showAchievement('Insufficient Points!', `Need ${powerup.cost} points`);
      return;
    }
    
    this.score -= powerup.cost;
    
    switch (type) {
      case 'slow':
        this.slowTime();
        break;
      case 'skip':
        this.skipTurn();
        break;
      case 'hint':
        this.showHint();
        break;
      case 'shield':
        this.activateShield();
        break;
      case 'double':
        this.activateDoublePoints();
        break;
      case 'reveal':
        this.revealSequence();
        break;
    }
    
    powerup.available = false;
    powerup.cooldown = powerup.maxCooldown;
    this.startCooldown(type);
    this.updateDisplay();
  }
  
  activateShield() {
    this.shieldActive = true;
    document.querySelector('.simon-container').classList.add('shielded');
    
    setTimeout(() => {
      this.shieldActive = false;
      document.querySelector('.simon-container').classList.remove('shielded');
    }, 15000);
    
    this.showAchievement('Shield Activated!', 'Next mistake will be forgiven');
  }
  
  activateDoublePoints() {
    this.doublePointsActive = true;
    document.body.classList.add('double-points-active');
    
    setTimeout(() => {
      this.doublePointsActive = false;
      document.body.classList.remove('double-points-active');
    }, 20000);
    
    this.showAchievement('Double Points!', '2x points for 20 seconds');
  }
  
  revealSequence() {
    // Briefly show the entire sequence
    for (let i = 0; i < this.gamePattern.length; i++) {
      setTimeout(() => {
        const btn = document.getElementById(this.gamePattern[i]);
        btn.style.opacity = '1';
        btn.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
          btn.style.opacity = '';
          btn.style.transform = '';
        }, 500);
      }, i * 200);
    }
    
    this.showAchievement('Sequence Revealed!', 'Pattern shown for reference');
  }
  
  slowTime() {
    // Temporarily reduce game speed
    const originalSpeed = this.difficultySettings[this.difficulty].speed;
    this.difficultySettings[this.difficulty].speed *= 1.5;
    
    setTimeout(() => {
      this.difficultySettings[this.difficulty].speed = originalSpeed;
    }, 10000);
    
    this.showAchievement("Time Warp!", "Sequence slowed for 10 seconds");
  }
  
  skipTurn() {
    if (this.userPattern.length < this.gamePattern.length) {
      // Auto-complete the current sequence
      while (this.userPattern.length < this.gamePattern.length) {
        this.userPattern.push(this.gamePattern[this.userPattern.length]);
      }
      this.checkAnswer(this.userPattern.length - 1);
      this.showAchievement("Skip Turn!", "Sequence auto-completed");
    }
  }
  
  showHint() {
    if (this.userPattern.length < this.gamePattern.length) {
      const nextColor = this.gamePattern[this.userPattern.length];
      const btn = document.getElementById(nextColor);
      
      // Subtle hint animation
      btn.style.opacity = '1';
      btn.style.transform = 'scale(1.1)';
      
      setTimeout(() => {
        btn.style.opacity = '';
        btn.style.transform = '';
      }, 1000);
      
      this.showAchievement("Hint!", `Next button: ${nextColor}`);
    }
  }
  
  startCooldown(type) {
    const powerup = this.powerups[type];
    const cooldownElement = document.getElementById(`${type}-cooldown`);
    
    const interval = setInterval(() => {
      powerup.cooldown--;
      const percentage = (powerup.cooldown / powerup.maxCooldown) * 100;
      if (cooldownElement) {
        cooldownElement.style.width = `${percentage}%`;
      }
      
      if (powerup.cooldown <= 0) {
        powerup.available = true;
        if (cooldownElement) {
          cooldownElement.style.width = '0%';
        }
        clearInterval(interval);
      }
    }, 1000);
  }
  
  // ================
  // PATTERN RECORDING
  // ================
  
  startRecording() {
    this.patternRecorder.recording = true;
    this.patternRecorder.currentRecording = [];
    
    const recordBtn = document.getElementById('record-btn');
    if (recordBtn) {
      recordBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
      recordBtn.classList.add('recording');
    }
    
    this.showAchievement('Recording Started!', 'Your moves are being recorded');
  }
  
  stopRecording() {
    this.patternRecorder.recording = false;
    
    const recordBtn = document.getElementById('record-btn');
    if (recordBtn) {
      recordBtn.innerHTML = '<i class="fas fa-video"></i> Record';
      recordBtn.classList.remove('recording');
    }
    
    this.showSavePatternDialog();
  }
  
  showSavePatternDialog() {
    const patternName = prompt('Enter a name for this pattern:');
    if (patternName) {
      this.savePattern(patternName);
    }
  }
  
  savePattern(name) {
    const pattern = {
      name,
      sequence: [...this.patternRecorder.currentRecording],
      timestamp: Date.now(),
      difficulty: this.difficulty,
      gameMode: this.gameMode
    };
    
    this.patternRecorder.savedPatterns.push(pattern);
    this.savePatternToStorage();
    this.updateSavedPatternsDisplay();
    
    this.showAchievement('Pattern Saved!', `"${name}" saved successfully`);
  }
  
  savePatternToStorage() {
    try {
      localStorage.setItem('simonPatterns', JSON.stringify(this.patternRecorder.savedPatterns));
    } catch (error) {
      console.warn('Error saving patterns:', error);
    }
  }
  
  loadPatternsFromStorage() {
    try {
      const saved = localStorage.getItem('simonPatterns');
      if (saved) {
        this.patternRecorder.savedPatterns = JSON.parse(saved);
        this.updateSavedPatternsDisplay();
      }
    } catch (error) {
      console.warn('Error loading patterns:', error);
    }
  }
  
  updateSavedPatternsDisplay() {
    const container = document.getElementById('saved-patterns');
    if (!container) return;
    
    container.innerHTML = '';
    
    this.patternRecorder.savedPatterns.forEach((pattern, index) => {
      const patternEl = document.createElement('div');
      patternEl.className = 'saved-pattern';
      patternEl.innerHTML = `
        <div class="pattern-info">
          <h4>${pattern.name}</h4>
          <span class="pattern-meta">
            ${pattern.sequence.length} moves • ${pattern.difficulty} • ${new Date(pattern.timestamp).toLocaleDateString()}
          </span>
        </div>
        <div class="pattern-actions">
          <button class="pattern-action-btn" onclick="simonGame.playPattern(${index})">
            <i class="fas fa-play"></i>
          </button>
          <button class="pattern-action-btn" onclick="simonGame.sharePattern(${index})">
            <i class="fas fa-share"></i>
          </button>
          <button class="pattern-action-btn" onclick="simonGame.deletePattern(${index})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      container.appendChild(patternEl);
    });
  }
  
  async playPattern(index) {
    const pattern = this.patternRecorder.savedPatterns[index];
    if (!pattern) return;
    
    this.showAchievement('Playing Pattern!', `"${pattern.name}"`);
    
    for (let i = 0; i < pattern.sequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      await this.animateButton(pattern.sequence[i].color, 400);
    }
  }
  
  sharePattern(index) {
    const pattern = this.patternRecorder.savedPatterns[index];
    if (!pattern) return;
    
    const shareData = {
      name: pattern.name,
      sequence: pattern.sequence.map(move => move.color),
      difficulty: pattern.difficulty
    };
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?pattern=${encodeURIComponent(JSON.stringify(shareData))}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Simon Pattern: ${pattern.name}`,
        text: `Check out this Simon game pattern!`,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        this.showAchievement('Pattern Shared!', 'Link copied to clipboard');
      });
    }
  }
  
  deletePattern(index) {
    if (confirm('Are you sure you want to delete this pattern?')) {
      const pattern = this.patternRecorder.savedPatterns[index];
      this.patternRecorder.savedPatterns.splice(index, 1);
      this.savePatternToStorage();
      this.updateSavedPatternsDisplay();
      this.showAchievement('Pattern Deleted!', `"${pattern.name}" removed`);
    }
  }
  
  // ================
  // UI UPDATES
  // ================
  
  updateDisplay() {
    // Basic stats
    const levelEl = document.getElementById('current-level');
    const scoreEl = document.getElementById('current-score');
    const highScoreEl = document.getElementById('high-score');
    const streakEl = document.getElementById('streak');
    
    if (levelEl) levelEl.textContent = this.level;
    if (scoreEl) scoreEl.textContent = this.score;
    if (highScoreEl) highScoreEl.textContent = this.stats.highScore;
    if (streakEl) streakEl.textContent = this.streak;
    
    // Advanced stats
    const reactionTimeEl = document.getElementById('reaction-time');
    const accuracyEl = document.getElementById('accuracy');
    const comboEl = document.getElementById('combo');
    const rankEl = document.getElementById('player-rank');
    
    if (reactionTimeEl && this.reactionTimes.length > 0) {
      const avgReaction = Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length);
      reactionTimeEl.textContent = `${avgReaction}ms`;
    }
    
    if (accuracyEl) {
      accuracyEl.textContent = `${Math.round(this.accuracy)}%`;
    }
    
    if (comboEl) {
      comboEl.textContent = `${this.combo}x`;
    }
    
    if (rankEl) {
      rankEl.textContent = this.calculatePlayerRank();
    }
    
    // Game mode specific displays
    if (this.gameMode === 'survival') {
      this.updateSurvivalDisplay();
    } else if (this.gameMode === 'speedrun') {
      this.updateSpeedrunDisplay();
    }
    
    // Multiplayer displays
    if (this.multiplayer.active || this.aiOpponent.enabled) {
      this.updateMultiplayerDisplay();
    }
  }
  
  calculatePlayerRank() {
    const score = this.stats.highScore;
    if (score >= 5000) return 'Grandmaster';
    if (score >= 3000) return 'Master';
    if (score >= 2000) return 'Expert';
    if (score >= 1000) return 'Advanced';
    if (score >= 500) return 'Intermediate';
    if (score >= 100) return 'Novice';
    return 'Rookie';
  }
  
  updateSurvivalDisplay() {
    // Could add hearts display for lives
    const statusText = `Lives: ${this.lives} | Level ${this.level}`;
    this.updateStatus(statusText);
  }
  
  updateSpeedrunDisplay() {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    const statusText = `Time: ${minutes}:${seconds.toString().padStart(2, '0')} | Level ${this.level}`;
    this.updateStatus(statusText);
  }
  
  updateStatus(message) {
    const statusEl = document.getElementById('level-title');
    if (statusEl) statusEl.textContent = message;
  }
  
  updateProgress() {
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
      const percentage = Math.min((this.level / 20) * 100, 100); // Max at level 20
      progressFill.style.width = `${percentage}%`;
    }
  }
  
  updateControlButtons() {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    
    if (startBtn) {
      if (this.started && !this.gameOver) {
        startBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Game';
      } else {
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
      }
    }
    
    if (pauseBtn) {
      pauseBtn.disabled = !this.started || this.gameOver;
      pauseBtn.innerHTML = this.isPaused ? 
        '<i class="fas fa-play"></i> Resume' : 
        '<i class="fas fa-pause"></i> Pause';
    }
  }
  
  updateHighScore() {
    if (this.score > this.stats.highScore) {
      this.stats.highScore = this.score;
      this.showAchievement("New High Score!", `${this.score} points!`);
    }
  }
  
  // ================
  // VISUAL EFFECTS
  // ================
  
  createParticles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      const angle = (i / 8) * Math.PI * 2;
      const velocity = 50 + Math.random() * 50;
      const x = centerX + Math.cos(angle) * velocity;
      const y = centerY + Math.sin(angle) * velocity;
      
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.background = getComputedStyle(element).background;
      
      particlesContainer.appendChild(particle);
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 3000);
    }
  }
  
  showAchievement(title, description) {
    const toast = document.getElementById('achievement-toast');
    if (!toast) return;
    
    const titleElement = toast.querySelector('.achievement-title');
    const descElement = toast.querySelector('.achievement-desc');
    
    if (titleElement) titleElement.textContent = title;
    if (descElement) descElement.textContent = description;
    
    toast.classList.add('show');
    this.playSound('achievement', 0.8);
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }
  
  // ================
  // ACHIEVEMENTS
  // ================
  
  checkAchievements() {
    const achievements = [
      // Basic achievements
      { id: 'first_win', title: 'First Steps', desc: 'Complete your first level', condition: () => this.level === 1 },
      { id: 'level_5', title: 'Getting Warmed Up', desc: 'Reach level 5', condition: () => this.level === 5 },
      { id: 'level_10', title: 'Memory Master', desc: 'Reach level 10', condition: () => this.level === 10 },
      { id: 'level_15', title: 'Simon Expert', desc: 'Reach level 15', condition: () => this.level === 15 },
      { id: 'level_20', title: 'Memory Champion', desc: 'Reach level 20', condition: () => this.level === 20 },
      { id: 'level_30', title: 'Grandmaster', desc: 'Reach level 30', condition: () => this.level === 30 },
      
      // Streak achievements
      { id: 'streak_10', title: 'On Fire!', desc: 'Get 10 correct in a row', condition: () => this.streak === 10 },
      { id: 'streak_25', title: 'Unstoppable!', desc: 'Get 25 correct in a row', condition: () => this.streak === 25 },
      { id: 'streak_50', title: 'Legendary!', desc: 'Get 50 correct in a row', condition: () => this.streak === 50 },
      
      // Score achievements
      { id: 'score_1000', title: 'High Scorer', desc: 'Score 1000 points', condition: () => this.score >= 1000 },
      { id: 'score_5000', title: 'Score Master', desc: 'Score 5000 points', condition: () => this.score >= 5000 },
      { id: 'score_10000', title: 'Score Legend', desc: 'Score 10000 points', condition: () => this.score >= 10000 },
      
      // Difficulty achievements
      { id: 'expert_level_5', title: 'Expert Player', desc: 'Reach level 5 on Expert difficulty', condition: () => this.level >= 5 && this.difficulty === 'expert' },
      { id: 'expert_level_10', title: 'Expert Master', desc: 'Reach level 10 on Expert difficulty', condition: () => this.level >= 10 && this.difficulty === 'expert' },
      
      // Combo achievements
      { id: 'combo_5', title: 'Combo Starter', desc: 'Achieve a 5x combo', condition: () => this.combo === 5 },
      { id: 'combo_10', title: 'Combo Master', desc: 'Achieve a 10x combo', condition: () => this.combo === 10 },
      { id: 'combo_20', title: 'Combo Legend', desc: 'Achieve a 20x combo', condition: () => this.combo === 20 },
      
      // Speed achievements
      { id: 'fast_reaction', title: 'Lightning Fast', desc: 'Average reaction time under 300ms', condition: () => {
        return this.reactionTimes.length >= 10 && 
               (this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length) < 300;
      }},
      
      // Perfect accuracy
      { id: 'perfect_accuracy', title: 'Perfectionist', desc: 'Maintain 100% accuracy for 20 moves', condition: () => {
        return this.analytics.patternAccuracy.length >= 20 && 
               this.analytics.patternAccuracy.slice(-20).every(acc => acc === 1);
      }},
      
      // Game mode achievements
      { id: 'survival_master', title: 'Survivor', desc: 'Reach level 10 in Survival mode', condition: () => this.level >= 10 && this.gameMode === 'survival' },
      { id: 'speedrun_champion', title: 'Speed Demon', desc: 'Score 1000+ points in Speed Run mode', condition: () => this.score >= 1000 && this.gameMode === 'speedrun' },
      { id: 'ai_defeated', title: 'AI Conqueror', desc: 'Beat the AI opponent', condition: () => this.aiOpponent.enabled && this.score > this.aiOpponent.score && this.level >= 5 },
      
      // Special achievements
      { id: 'pattern_creator', title: 'Pattern Creator', desc: 'Save your first custom pattern', condition: () => this.patternRecorder.savedPatterns.length >= 1 },
      { id: 'voice_commander', title: 'Voice Commander', desc: 'Use voice commands to play', condition: () => this.voiceEnabled && this.level >= 3 },
      { id: 'theme_explorer', title: 'Theme Explorer', desc: 'Try all available themes', condition: () => {
        // This would need to track theme usage
        return false; // Placeholder
      }}
    ];
    
    achievements.forEach(achievement => {
      if (!this.stats.achievements.includes(achievement.id) && achievement.condition()) {
        this.stats.achievements.push(achievement.id);
        this.showAchievement(achievement.title, achievement.desc);
      }
    });
  }
  
  // ================
  // SETTINGS & STORAGE
  // ================
  
  loadStats() {
    try {
      const savedStats = localStorage.getItem('simonGameStats');
      if (savedStats) {
        this.stats = { ...this.stats, ...JSON.parse(savedStats) };
      }
    } catch (error) {
      console.warn('Error loading stats:', error);
    }
  }
  
  saveStats() {
    try {
      this.stats.totalScore += this.score;
      this.stats.averageLevel = Math.round(this.stats.totalScore / this.stats.gamesPlayed);
      localStorage.setItem('simonGameStats', JSON.stringify(this.stats));
    } catch (error) {
      console.warn('Error saving stats:', error);
    }
  }
  
  loadSettings() {
    try {
      const savedSettings = localStorage.getItem('simonGameSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        this.masterVolume = settings.masterVolume || 0.7;
        this.soundEnabled = settings.soundEnabled !== false;
        this.currentTheme = settings.theme || 'dark';
        this.difficulty = settings.difficulty || 'normal';
        
        document.body.setAttribute('data-theme', this.currentTheme);
        
        const difficultyEl = document.getElementById('difficulty');
        const volumeEl = document.getElementById('master-volume');
        const volumeValueEl = document.getElementById('volume-value');
        
        if (difficultyEl) difficultyEl.value = this.difficulty;
        if (volumeEl) volumeEl.value = this.masterVolume * 100;
        if (volumeValueEl) volumeValueEl.textContent = `${Math.round(this.masterVolume * 100)}%`;
      }
    } catch (error) {
      console.warn('Error loading settings:', error);
    }
  }
  
  saveSettings() {
    try {
      const settings = {
        masterVolume: this.masterVolume,
        soundEnabled: this.soundEnabled,
        theme: this.currentTheme,
        difficulty: this.difficulty
      };
      localStorage.setItem('simonGameSettings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Error saving settings:', error);
    }
  }
  
  // ================
  // EVENT LISTENERS
  // ================
  
  setupGameModeHandlers() {
    // Game mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all buttons
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Set game mode
        this.gameMode = btn.dataset.mode;
        this.updateGameModeDisplay();
        
        this.showAchievement('Game Mode Changed!', this.gameModes[this.gameMode].name);
      });
    });
    
    // Pattern recording buttons
    const savePatternBtn = document.getElementById('save-pattern');
    const loadPatternBtn = document.getElementById('load-pattern');
    const sharePatternBtn = document.getElementById('share-pattern');
    
    if (savePatternBtn) {
      savePatternBtn.addEventListener('click', () => this.showSavePatternDialog());
    }
    
    // Voice command toggle
    document.addEventListener('keydown', (e) => {
      if (e.key === 'v' && e.ctrlKey) {
        e.preventDefault();
        this.toggleVoiceCommands();
      }
    });
    
    // Load patterns on init
    this.loadPatternsFromStorage();
  }
  
  toggleVoiceCommands() {
    if (!this.voiceRecognition) {
      this.showAchievement('Voice Commands Not Supported', 'Your browser doesn\'t support voice recognition');
      return;
    }
    
    if (this.voiceEnabled && this.voiceRecognition) {
      try {
        this.voiceRecognition.start();
        this.showAchievement('Voice Commands Active!', 'Say commands like "green", "start", "pause"');
      } catch (error) {
        console.warn('Voice recognition already active');
      }
    }
  }
  
  setupEventListeners() {
    // Game buttons with enhanced tracking
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.lastButtonTime = Date.now();
        this.handleButtonClick(btn.id);
      });
    });
    
    // Control buttons
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        if (this.started && !this.gameOver) {
          this.resetGame();
        } else {
          this.startGame();
        }
      });
    }
    
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.pauseGame());
    }
    
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetGame());
    }
    
    // Settings
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettings = document.getElementById('close-settings');
    
    if (settingsBtn && settingsModal) {
      settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('show');
      });
    }
    
    if (closeSettings && settingsModal) {
      closeSettings.addEventListener('click', () => {
        settingsModal.classList.remove('show');
      });
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const currentIndex = this.themes.indexOf(this.currentTheme);
        this.currentTheme = this.themes[(currentIndex + 1) % this.themes.length];
        document.body.setAttribute('data-theme', this.currentTheme);
        this.saveSettings();
      });
    }
    
    // Sound toggle
    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        const icon = soundToggle.querySelector('i');
        if (icon) {
          icon.className = this.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        }
        this.saveSettings();
      });
    }
    
    // Difficulty selector
    const difficultySelect = document.getElementById('difficulty');
    if (difficultySelect) {
      difficultySelect.addEventListener('change', (e) => {
        this.difficulty = e.target.value;
        this.saveSettings();
      });
    }
    
    // Volume control
    const volumeControl = document.getElementById('master-volume');
    const volumeValue = document.getElementById('volume-value');
    if (volumeControl && volumeValue) {
      volumeControl.addEventListener('input', (e) => {
        this.masterVolume = e.target.value / 100;
        volumeValue.textContent = `${e.target.value}%`;
        this.saveSettings();
      });
    }
    
    // Power-ups
    document.querySelectorAll('.powerup-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const powerup = btn.getAttribute('data-powerup');
        this.usePowerup(powerup);
      });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName.toLowerCase() === 'input') return;
      
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'enter':
          e.preventDefault();
          if (!this.started) this.startGame();
          break;
        case 'p':
          if (this.started) this.pauseGame();
          break;
        case 'r':
          this.resetGame();
          break;
        case '1':
          this.handleButtonClick('green');
          break;
        case '2':
          this.handleButtonClick('red');
          break;
        case '3':
          this.handleButtonClick('yellow');
          break;
        case '4':
          this.handleButtonClick('blue');
          break;
      }
    });
    
    // Modal close on background click
    if (settingsModal) {
      settingsModal.addEventListener('click', (e) => {
        if (e.target.id === 'settings-modal') {
          settingsModal.classList.remove('show');
        }
      });
    }
    
    // Record button
    const recordBtn = document.getElementById('record-btn');
    if (recordBtn) {
      recordBtn.addEventListener('click', () => {
        if (this.patternRecorder.recording) {
          this.stopRecording();
        } else {
          this.startRecording();
        }
      });
    }
    
    // Leaderboard button (if exists in header)
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    if (leaderboardBtn) {
      leaderboardBtn.addEventListener('click', () => {
        this.showLeaderboard();
      });
    }
    
    // Enhanced keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName.toLowerCase() === 'input') return;
      
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'enter':
          e.preventDefault();
          if (!this.started) this.startGame();
          break;
        case 'p':
          if (this.started) this.pauseGame();
          break;
        case 'r':
          if (e.ctrlKey) {
            e.preventDefault();
            this.resetGame();
          } else if (this.started && !this.patternRecorder.recording) {
            this.startRecording();
          }
          break;
        case 'v':
          if (e.ctrlKey) {
            this.toggleVoiceCommands();
          }
          break;
        case '1':
        case 'q':
          this.handleButtonClick('green');
          break;
        case '2':
        case 'w':
          this.handleButtonClick('red');
          break;
        case '3':
        case 'e':
          this.handleButtonClick('yellow');
          break;
        case '4':
        case 'r':
          if (!e.ctrlKey) this.handleButtonClick('blue');
          break;
        // Power-up shortcuts
        case 'z':
          this.usePowerup('slow');
          break;
        case 'x':
          this.usePowerup('skip');
          break;
        case 'c':
          this.usePowerup('hint');
          break;
      }
    });
    
    // Touch gestures for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
      if (!touchStartX || !touchStartY) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      
      // Swipe gestures
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          // Swipe right - next theme
          const currentIndex = this.themes.indexOf(this.currentTheme);
          this.currentTheme = this.themes[(currentIndex + 1) % this.themes.length];
          document.body.setAttribute('data-theme', this.currentTheme);
          this.saveSettings();
        } else {
          // Swipe left - previous theme
          const currentIndex = this.themes.indexOf(this.currentTheme);
          this.currentTheme = this.themes[(currentIndex - 1 + this.themes.length) % this.themes.length];
          document.body.setAttribute('data-theme', this.currentTheme);
          this.saveSettings();
        }
      }
      
      touchStartX = 0;
      touchStartY = 0;
    });
    
    // Reset stats
    const resetStats = document.getElementById('reset-stats');
    if (resetStats) {
      resetStats.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
          this.stats = {
            gamesPlayed: 0,
            highScore: 0,
            totalScore: 0,
            averageLevel: 0,
            perfectGames: 0,
            achievements: []
          };
          this.analytics = {
            sessionsPlayed: 0,
            totalPlayTime: 0,
            averageReactionTime: 0,
            patternAccuracy: [],
            difficultyProgression: [],
            sessionStartTime: Date.now()
          };
          this.saveStats();
          this.updateDisplay();
          alert('Statistics reset successfully!');
        }
      });
    }
    
    // Initialize last button time
    this.lastButtonTime = Date.now();
  }
  
  showLeaderboard() {
    const modal = document.getElementById('leaderboard-modal');
    if (modal) {
      modal.classList.add('show');
      this.loadLeaderboard();
    }
  }
  
  loadLeaderboard() {
    // Mock leaderboard data - in a real app, this would come from a server
    const mockData = [
      { name: 'You', score: this.stats.highScore, rank: 'current' },
      { name: 'SimonMaster2024', score: 7850, rank: 1 },
      { name: 'MemoryWizard', score: 6420, rank: 2 },
      { name: 'PatternPro', score: 5890, rank: 3 },
      { name: 'ColorKing', score: 4750, rank: 4 },
      { name: 'SequenceQueen', score: 4200, rank: 5 }
    ].sort((a, b) => b.score - a.score);
    
    const container = document.getElementById('leaderboard-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    mockData.forEach((entry, index) => {
      const entryEl = document.createElement('div');
      entryEl.className = `leaderboard-entry ${entry.name === 'You' ? 'current-player' : ''}`;
      
      const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'other';
      
      entryEl.innerHTML = `
        <div class="rank-badge ${rankClass}">${index + 1}</div>
        <div class="player-info">
          <div class="player-name">${entry.name}</div>
          <div class="player-score">${entry.score.toLocaleString()} points</div>
        </div>
      `;
      
      container.appendChild(entryEl);
    });
  }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.simonGame = new SimonGamePro();
  
  // Check for shared patterns in URL
  const urlParams = new URLSearchParams(window.location.search);
  const sharedPattern = urlParams.get('pattern');
  
  if (sharedPattern) {
    try {
      const patternData = JSON.parse(decodeURIComponent(sharedPattern));
      window.simonGame.loadSharedPattern(patternData);
    } catch (error) {
      console.warn('Error loading shared pattern:', error);
    }
  }
});

// Add method to load shared patterns
SimonGamePro.prototype.loadSharedPattern = function(patternData) {
  this.showAchievement('Pattern Received!', `Loading "${patternData.name}"`);
  
  // Add to saved patterns
  const pattern = {
    name: patternData.name + ' (Shared)',
    sequence: patternData.sequence.map(color => ({ color, timestamp: Date.now() })),
    timestamp: Date.now(),
    difficulty: patternData.difficulty || 'normal',
    gameMode: 'classic',
    shared: true
  };
  
  this.patternRecorder.savedPatterns.unshift(pattern);
  this.savePatternToStorage();
  this.updateSavedPatternsDisplay();
  
  // Show pattern panel
  const patternPanel = document.getElementById('pattern-panel');
  if (patternPanel) {
    patternPanel.classList.remove('hidden');
  }
};
