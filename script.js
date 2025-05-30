class FightingGame {
    constructor() {
        this.player1 = {
            element: document.getElementById('fighter1'),
            health: 100,
            maxHealth: 100,
            x: 200,
            y: 100,
            score: 0,
            isAttacking: false,
            isBlocking: false,
            isJumping: false,
            combo: 0,
            lastHit: 0
        };

        this.player2 = {
            element: document.getElementById('fighter2'),
            health: 100,
            maxHealth: 100,
            x: window.innerWidth - 280,
            y: 100,
            score: 0,
            isAttacking: false,
            isBlocking: false,
            isJumping: false,
            combo: 0,
            lastHit: 0
        };

        this.keys = {};
        this.gameRunning = true;
        this.roundTime = 60;
        this.gameTimer = null;

        this.initEventListeners();
        this.startGameTimer();
        this.gameLoop();
    }

    initEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.handleKeyPress(e.key.toLowerCase());
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    handleKeyPress(key) {
        if (!this.gameRunning) return;

        // Player 1 controls
        switch(key) {
            case 'a':
                this.movePlayer(this.player1, -10);
                break;
            case 'd':
                this.movePlayer(this.player1, 10);
                break;
            case 'w':
                this.jumpPlayer(this.player1);
                break;
            case 's':
                this.attackPlayer(this.player1, this.player2);
                break;
            case 'x':
                this.player1.isBlocking = true;
                setTimeout(() => this.player1.isBlocking = false, 500);
                break;
        }

        // Player 2 controls
        switch(key) {
            case 'arrowleft':
                this.movePlayer(this.player2, -10);
                break;
            case 'arrowright':
                this.movePlayer(this.player2, 10);
                break;
            case 'arrowup':
                this.jumpPlayer(this.player2);
                break;
            case 'arrowdown':
                this.attackPlayer(this.player2, this.player1);
                break;
            case 'm':
                this.player2.isBlocking = true;
                setTimeout(() => this.player2.isBlocking = false, 500);
                break;
        }
    }

    movePlayer(player, dx) {
        const newX = player.x + dx;
        const minX = 50;
        const maxX = window.innerWidth - 130;
        
        if (newX >= minX && newX <= maxX) {
            player.x = newX;
            player.element.style.left = player.x + 'px';
        }
    }

    jumpPlayer(player) {
        if (player.isJumping) return;
        
        player.isJumping = true;
        const originalY = player.y;
        
        // Jump animation
        let jumpHeight = 0;
        const jumpInterval = setInterval(() => {
            jumpHeight += 8;
            if (jumpHeight >= 60) {
                clearInterval(jumpInterval);
                
                const fallInterval = setInterval(() => {
                    jumpHeight -= 8;
                    if (jumpHeight <= 0) {
                        clearInterval(fallInterval);
                        player.isJumping = false;
                        jumpHeight = 0;
                    }
                    player.element.style.bottom = (originalY + jumpHeight) + 'px';
                }, 20);
            }
            player.element.style.bottom = (originalY + jumpHeight) + 'px';
        }, 20);
    }

    attackPlayer(attacker, defender) {
        if (attacker.isAttacking) return;
        
        attacker.isAttacking = true;
        attacker.element.classList.add('attacking');
        
        // Check if players are close enough for hit
        const distance = Math.abs(attacker.x - defender.x);
        if (distance < 120) {
            this.dealDamage(attacker, defender);
        }
        
        setTimeout(() => {
            attacker.isAttacking = false;
            attacker.element.classList.remove('attacking');
        }, 300);
    }

    dealDamage(attacker, defender) {
        let damage = 15 + Math.random() * 10; // 15-25 damage
        
        // Check if defender is blocking
        if (defender.isBlocking) {
            damage *= 0.3; // Reduce damage by 70%
        }
        
        // Combo system
        const now = Date.now();
        if (now - attacker.lastHit < 1000) {
            attacker.combo++;
            damage *= (1 + attacker.combo * 0.1); // Increase damage with combo
            this.showCombo(attacker);
        } else {
            attacker.combo = 0;
        }
        attacker.lastHit = now;
        
        defender.health -= Math.floor(damage);
        if (defender.health < 0) defender.health = 0;
        
        // Visual feedback
        defender.element.classList.add('damaged');
        setTimeout(() => defender.element.classList.remove('damaged'), 300);
        
        // Update score
        attacker.score += Math.floor(damage);
        
        this.updateUI();
        
        if (defender.health <= 0) {
            this.endGame(attacker === this.player1 ? 1 : 2);
        }
    }

    showCombo(player) {
        const comboEl = player === this.player1 ? 
            document.getElementById('combo1') : 
            document.getElementById('combo2');
        
        comboEl.style.left = (player.x + 40) + 'px';
        comboEl.style.top = (player.y - 50) + 'px';
        comboEl.textContent = `${player.combo}x COMBO!`;
        comboEl.style.opacity = '1';
        
        setTimeout(() => {
            comboEl.style.opacity = '0';
        }, 1000);
    }

    updateUI() {
        // Update health bars
        const health1Percent = (this.player1.health / this.player1.maxHealth) * 100;
        const health2Percent = (this.player2.health / this.player2.maxHealth) * 100;
        
        document.getElementById('health1').style.width = health1Percent + '%';
        document.getElementById('health2').style.width = health2Percent + '%';
        
        // Update health text
        document.getElementById('hp1').textContent = this.player1.health;
        document.getElementById('hp2').textContent = this.player2.health;
        
        // Update scores
        document.getElementById('score1').textContent = this.player1.score;
        document.getElementById('score2').textContent = this.player2.score;
    }

    startGameTimer() {
        this.gameTimer = setInterval(() => {
            this.roundTime--;
            document.getElementById('timer').textContent = this.roundTime;
            
            if (this.roundTime <= 0) {
                // Time's up - determine winner by health
                if (this.player1.health > this.player2.health) {
                    this.endGame(1);
                } else if (this.player2.health > this.player1.health) {
                    this.endGame(2);
                } else {
                    this.endGame(0); // Draw
                }
            }
        }, 1000);
    }

    endGame(winner) {
        this.gameRunning = false;
        clearInterval(this.gameTimer);
        
        const gameOverEl = document.getElementById('gameOver');
        const winnerText = document.getElementById('winnerText');
        const finalScore = document.getElementById('finalScore');
        
        if (winner === 0) {
            winnerText.textContent = "It's a Draw!";
            finalScore.textContent = `Both fighters showed equal strength!`;
        } else {
            winnerText.textContent = `Player ${winner} Wins!`;
            const winnerPlayer = winner === 1 ? this.player1 : this.player2;
            const loserPlayer = winner === 1 ? this.player2 : this.player1;
            finalScore.textContent = `Final Score: ${winnerPlayer.score} - ${loserPlayer.score}`;
        }
        
        gameOverEl.style.display = 'block';
    }

    gameLoop() {
        if (this.gameRunning) {
            // Continuous movement for held keys
            if (this.keys['a']) this.movePlayer(this.player1, -3);
            if (this.keys['d']) this.movePlayer(this.player1, 3);
            if (this.keys['arrowleft']) this.movePlayer(this.player2, -3);
            if (this.keys['arrowright']) this.movePlayer(this.player2, 3);
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

let game;

function startGame() {
    game = new FightingGame();
}

function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    startGame();
}

// Start the game when page loads
window.addEventListener('load', startGame);