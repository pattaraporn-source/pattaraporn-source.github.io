// Javascript logic for Childhood Education (Kindergarten 3) Portal

// 1. Audio System (Web Audio API Synthesizer)
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Synthesizer helper to play notes without external files
function playNote(freq, type = 'triangle', duration = 0.5, delay = 0) {
    if (!audioCtx) return;
    
    // Resume if suspended (browser security)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);

    // Cute bell/piano envelope: instant attack, gradual decay
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + delay + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start(audioCtx.currentTime + delay);
    osc.stop(audioCtx.currentTime + delay + duration);
}

// Success chime arpeggio
function playSuccessSound() {
    playNote(261.63, 'sine', 0.3, 0);    // C4
    playNote(329.63, 'sine', 0.3, 0.08); // E4
    playNote(392.00, 'sine', 0.3, 0.16); // G4
    playNote(523.25, 'sine', 0.5, 0.24); // C5
}

// Wrong/Error sound buzzer
function playErrorSound() {
    playNote(180, 'sawtooth', 0.2, 0);
    playNote(150, 'sawtooth', 0.3, 0.05);
}

// Pop sound for bubble clicked
function playBubblePopSound() {
    playNote(800, 'sine', 0.05, 0);
}

// Star award chime
function playStarSound() {
    playNote(523.25, 'triangle', 0.15, 0);   // C5
    playNote(659.25, 'triangle', 0.15, 0.1);  // E5
    playNote(783.99, 'triangle', 0.15, 0.2);  // G5
    playNote(1046.50, 'triangle', 0.5, 0.3);  // C6
}


// 2. Click Bubble Effect
document.addEventListener('click', (e) => {
    // Avoid bubble spawning in welcome banner or specific game targets if annoying
    createBubbleEffect(e.clientX, e.clientY);
});

function createBubbleEffect(x, y) {
    const bubbleContainer = document.getElementById('bubble-container');
    const bubble = document.createElement('div');
    
    // Bubble properties
    const size = Math.random() * 40 + 20; // 20px - 60px
    bubble.classList.add('bubble');
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${x - size / 2}px`;
    bubble.style.top = `${y - size / 2}px`;
    
    // Random colors
    const colors = ['#fca5a5', '#93c5fd', '#86efac', '#fde047', '#c084fc'];
    bubble.style.background = `radial-gradient(circle at 30% 30%, white, ${colors[Math.floor(Math.random() * colors.length)]} 80%)`;
    
    bubbleContainer.appendChild(bubble);

    // Play soft pop sound
    if (audioCtx) {
        playBubblePopSound();
    }

    // Animation transition upwards
    const anim = bubble.animate([
        { transform: 'translateY(0) scale(1)', opacity: 0.9 },
        { transform: `translateY(-150px) scale(1.2)`, opacity: 0 }
    ], {
        duration: 800,
        easing: 'ease-out'
    });

    anim.onfinish = () => {
        bubble.remove();
    };
}


// 3. Reward & Star System State
const state = {
    starCount: 0,
    completedActivities: {
        sortingGame: false,
        shapeGame: false,
        storyQ1: false,
        storyQ2: false,
        pianoPlayed: false
    }
};

function awardStar(activityKey) {
    if (state.completedActivities[activityKey]) return; // Award once

    state.completedActivities[activityKey] = true;
    state.starCount++;
    
    // Update count display
    document.getElementById('star-count').textContent = state.starCount;
    document.getElementById('reward-star-count').textContent = state.starCount;
    
    // Progress fill update
    const percent = (state.starCount / 5) * 100;
    document.getElementById('star-fill-progress').style.width = `${percent}%`;

    // Visual effect
    playStarSound();
    triggerConfettiEffect();

    // Check certificate unlocking condition (needs all 5 stars)
    if (state.starCount >= 5) {
        unlockCertificate();
    }
}

// Spawn temporary flying stars
function triggerConfettiEffect() {
    for (let i = 0; i < 15; i++) {
        const star = document.createElement('div');
        star.innerHTML = '⭐';
        star.style.position = 'fixed';
        star.style.left = `${Math.random() * 80 + 10}vw`;
        star.style.top = '90vh';
        star.style.fontSize = `${Math.random() * 20 + 20}px`;
        star.style.pointerEvents = 'none';
        star.style.zIndex = '9999';
        document.body.appendChild(star);

        const anim = star.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translate( ${Math.random() * 200 - 100}px, -90vh) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 1000 + 1500,
            easing: 'ease-out'
        });

        anim.onfinish = () => star.remove();
    }
}

function unlockCertificate() {
    const certInputArea = document.getElementById('certificate-input-area');
    certInputArea.classList.remove('locked');
    
    // Remove lock overlay element
    const overlay = certInputArea.querySelector('.lock-overlay');
    if (overlay) {
        overlay.remove();
    }

    // Show the certificate preview section
    document.getElementById('certificate-preview').classList.remove('hidden');
    playSuccessSound();
}


// 4. Tab Switches Logic
const tabSort = document.getElementById('btn-tab-sort');
const tabShape = document.getElementById('btn-tab-shape');
const sortContainer = document.getElementById('game-sort-container');
const shapeContainer = document.getElementById('game-shape-container');

tabSort.addEventListener('click', () => {
    tabSort.classList.add('active');
    tabShape.classList.remove('active');
    sortContainer.classList.add('active');
    shapeContainer.classList.remove('active');
    playNote(300, 'sine', 0.1);
});

tabShape.addEventListener('click', () => {
    tabShape.classList.add('active');
    tabSort.classList.remove('active');
    shapeContainer.classList.add('active');
    sortContainer.classList.remove('active');
    playNote(300, 'sine', 0.1);
});


// 5. Game A: Sorting Fruits & Toys
const sortingData = [
    { name: '🍎', type: 'fruit' },
    { name: '🍌', type: 'fruit' },
    { name: '🍉', type: 'fruit' },
    { name: '🍊', type: 'fruit' },
    { name: '🍇', type: 'fruit' },
    { name: '🧸', type: 'toy' },
    { name: '🚗', type: 'toy' },
    { name: '⚽', type: 'toy' },
    { name: '🧱', type: 'toy' },
    { name: '🤖', type: 'toy' }
];

let selectedItemElement = null;
let selectedItemData = null;

function setupSortingGame() {
    const pool = document.getElementById('sorting-items-pool');
    const basketFruits = document.getElementById('basket-fruits');
    const basketToys = document.getElementById('basket-toys');
    
    // Reset contents
    pool.innerHTML = '';
    basketFruits.querySelector('.basket-items-area').innerHTML = '';
    basketToys.querySelector('.basket-items-area').innerHTML = '';
    selectedItemElement = null;
    selectedItemData = null;

    // Shuffle sorting items
    const shuffled = [...sortingData].sort(() => Math.random() - 0.5);

    shuffled.forEach((item, index) => {
        const el = document.createElement('div');
        el.className = 'sort-item';
        el.textContent = item.name;
        el.dataset.index = index;
        el.dataset.type = item.type;
        
        el.addEventListener('click', () => {
            if (selectedItemElement) {
                selectedItemElement.classList.remove('selected');
            }
            selectedItemElement = el;
            selectedItemData = item;
            el.classList.add('selected');
            playNote(400, 'sine', 0.15);
        });

        pool.appendChild(el);
    });
}

// Set up basket click actions
document.querySelectorAll('.basket-box').forEach(basket => {
    basket.addEventListener('click', () => {
        if (!selectedItemElement || !selectedItemData) return;

        const basketType = basket.dataset.type;
        const itemsArea = basket.querySelector('.basket-items-area');

        if (selectedItemData.type === basketType) {
            // Correct Sort!
            playNote(523.25, 'triangle', 0.2); // Success note
            
            // Move item to basket visually
            const newItem = document.createElement('div');
            newItem.className = 'sort-item';
            newItem.textContent = selectedItemData.name;
            newItem.style.cursor = 'default';
            newItem.style.pointerEvents = 'none';
            itemsArea.appendChild(newItem);
            
            selectedItemElement.remove();
            selectedItemElement = null;
            selectedItemData = null;

            // Check if game complete
            const pool = document.getElementById('sorting-items-pool');
            if (pool.children.length === 0) {
                awardStar('sortingGame');
            }
        } else {
            // Incorrect Sort!
            playErrorSound();
            basket.classList.add('shake');
            setTimeout(() => basket.classList.remove('shake'), 500);
            
            // Pop-up warning (visual feedback)
            const alertText = basketType === 'fruit' ? 'นี่คือผลไม้นะ ลองดูใหม่สิเด็กๆ!' : 'นี่คือของเล่นนะ ลองดูใหม่สิเด็กๆ!';
            alert(`โอ๊ะโอ! ${selectedItemData.name} ไม่ได้อยู่ในตะกร้านี้จ้า... ลองคัดแยกใหม่นะครับ`);
        }
    });
});

document.getElementById('btn-reset-sort').addEventListener('click', () => {
    setupSortingGame();
    playNote(250, 'sine', 0.2);
});


// 6. Game B: Shape Matcher Logic
const shapeData = [
    { id: 'circle', name: 'วงกลม 🟡', svg: '<svg viewBox="0 0 100 100" width="80" height="80"><circle cx="50" cy="50" r="40" fill="#fbbf24"/></svg>' },
    { id: 'triangle', name: 'สามเหลี่ยม 🔺', svg: '<svg viewBox="0 0 100 100" width="80" height="80"><polygon points="50,10 90,90 10,90" fill="#f87171"/></svg>' },
    { id: 'square', name: 'สี่เหลี่ยม 🟦', svg: '<svg viewBox="0 0 100 100" width="80" height="80"><rect x="10" y="10" width="80" height="80" fill="#60a5fa"/></svg>' }
];

let selectedShapeId = null;
let selectedShapeElement = null;

function setupShapeGame() {
    const selectionPool = document.getElementById('shape-selection-pool');
    const targetsPool = document.getElementById('shape-targets-pool');

    selectionPool.innerHTML = '';
    targetsPool.innerHTML = '';
    selectedShapeId = null;
    selectedShapeElement = null;

    // Create selection pieces
    const shuffledShapes = [...shapeData].sort(() => Math.random() - 0.5);
    shuffledShapes.forEach(shape => {
        const div = document.createElement('div');
        div.className = 'draggable-shape';
        div.innerHTML = shape.svg;
        div.dataset.id = shape.id;

        div.addEventListener('click', () => {
            if (selectedShapeElement) {
                selectedShapeElement.classList.remove('selected');
            }
            selectedShapeId = shape.id;
            selectedShapeElement = div;
            div.classList.add('selected');
            playNote(450, 'sine', 0.1);
        });

        selectionPool.appendChild(div);
    });

    // Create target slots
    const shuffledTargets = [...shapeData].sort(() => Math.random() - 0.5);
    shuffledTargets.forEach(target => {
        const slot = document.createElement('div');
        slot.className = 'target-shape-slot';
        slot.dataset.id = target.id;
        
        // Target outlines in dark grey SVGs
        let targetSvg = '';
        if (target.id === 'circle') {
            targetSvg = '<svg viewBox="0 0 100 100" width="60" height="60"><circle cx="50" cy="50" r="40" fill="none" stroke="#94a3b8" stroke-width="6" stroke-dasharray="6"/></svg>';
        } else if (target.id === 'triangle') {
            targetSvg = '<svg viewBox="0 0 100 100" width="60" height="60"><polygon points="50,10 90,90 10,90" fill="none" stroke="#94a3b8" stroke-width="6" stroke-dasharray="6"/></svg>';
        } else if (target.id === 'square') {
            targetSvg = '<svg viewBox="0 0 100 100" width="60" height="60"><rect x="10" y="10" width="80" height="80" fill="none" stroke="#94a3b8" stroke-width="6" stroke-dasharray="6"/></svg>';
        }

        slot.innerHTML = targetSvg;

        slot.addEventListener('click', () => {
            if (!selectedShapeId) return;

            if (selectedShapeId === target.id) {
                // Correct match!
                playNote(587.33, 'triangle', 0.25); // D5
                slot.innerHTML = target.svg; // Replace outline with full color
                slot.classList.add('matched');
                
                selectedShapeElement.remove();
                selectedShapeId = null;
                selectedShapeElement = null;

                // Check win condition
                if (selectionPool.children.length === 0) {
                    awardStar('shapeGame');
                }
            } else {
                playErrorSound();
                alert('รูปร่างไม่ตรงกันนะเด็กๆ ลองหาช่องให้ถูกต้องดูใหม่นะจ๊ะ!');
            }
        });

        targetsPool.appendChild(slot);
    });
}

document.getElementById('btn-reset-shape').addEventListener('click', () => {
    setupShapeGame();
    playNote(250, 'sine', 0.2);
});


// 7. Game C: Cooperative Story & Choice Game
const btnNextStory = document.getElementById('btn-next-story');
const btnPrevStory = document.getElementById('btn-prev-story');
const storyPage1 = document.getElementById('story-page-1');
const storyPage2 = document.getElementById('story-page-2');

btnNextStory.addEventListener('click', () => {
    storyPage1.classList.remove('active');
    storyPage2.classList.add('active');
    playNote(350, 'sine', 0.15);
});

btnPrevStory.addEventListener('click', () => {
    storyPage2.classList.remove('active');
    storyPage1.classList.add('active');
    playNote(300, 'sine', 0.15);
});

// Setup choice buttons click events
document.querySelectorAll('.choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const isCorrect = btn.dataset.correct === 'true';
        const feedbackId = btn.dataset.feedback;
        
        let feedbackBox = null;
        let starKey = '';

        if (feedbackId.includes('-1')) {
            feedbackBox = document.getElementById('feedback-q1');
            starKey = 'storyQ1';
        } else {
            feedbackBox = document.getElementById('feedback-q2');
            starKey = 'storyQ2';
        }

        feedbackBox.classList.remove('hidden');

        // Reset choice sibling highlights
        const parent = btn.parentElement;
        parent.querySelectorAll('.choice-btn').forEach(b => {
            b.classList.remove('selected-wrong', 'selected-correct');
        });

        if (isCorrect) {
            btn.classList.add('selected-correct');
            feedbackBox.className = 'choice-feedback-box correct';
            
            if (starKey === 'storyQ1') {
                feedbackBox.innerHTML = '🎉 ถูกต้องครับ! การรู้จักแบ่งปันและผลัดกันเล่นทำให้ทุกคนมีความสุขและไม่ทะเลาะกันครับ 🐻🐰';
                btnNextStory.classList.remove('hidden');
            } else {
                feedbackBox.innerHTML = '🎉 ยอดเยี่ยมมากครับ! สามัคคีคือพลัง ช่วยกันหลายๆ คนทำให้บ้านต้นไม้ของสัตว์น้อยสร้างเสร็จอย่างรวดเร็วและปลอดภัย 🌳🏠';
            }
            
            awardStar(starKey);
        } else {
            btn.classList.add('selected-wrong');
            feedbackBox.className = 'choice-feedback-box wrong';
            
            if (starKey === 'storyQ1') {
                feedbackBox.innerHTML = '❌ โอ๊ะโอ... ถ้าแย่งกันอาจเกิดอันตรายและร้องไห้กันทั้งสองฝ่ายได้นะ ลองเลือกใหม่อีกครั้งครับ';
            } else {
                feedbackBox.innerHTML = '❌ เอ... ถ้าปล่อยให้พี่หมีทำคนเดียว พี่หมีจะเหนื่อยมากเลยนะ การร่วมใจกันทำงานจะดีกว่าไหมนะ? ลองเลือกอีกครั้งนะจ๊ะ';
            }
            playErrorSound();
        }
    });
});


// 8. Game D: Animal Piano Sound Engine
const noteFreqs = {
    'C4': 261.63,
    'D4': 293.66,
    'E4': 329.63,
    'F4': 349.23,
    'G4': 392.00,
    'A4': 440.00,
    'B4': 493.88,
    'C5': 523.25
};

const pianoKeys = document.querySelectorAll('.piano-key');
const pianoMascot = document.getElementById('piano-animal-mascot');
const pianoVisualNote = document.getElementById('piano-visual-note');

pianoKeys.forEach(key => {
    key.addEventListener('click', () => {
        initAudio();
        const note = key.dataset.note;
        const animalInfo = key.dataset.animal;
        const emoji = key.querySelector('.animal-emoji').textContent;

        const freq = noteFreqs[note];
        if (freq) {
            // Play sound synthesis
            playNote(freq, 'sine', 0.6);
            
            // Visual bounce
            key.classList.add('active');
            setTimeout(() => key.classList.remove('active'), 150);

            // Mascot reaction
            pianoMascot.textContent = emoji;
            pianoMascot.className = 'piano-mascot-active';
            
            // Custom bounce scale animation
            pianoMascot.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.4) rotate(15deg)' },
                { transform: 'scale(1)' }
            ], {
                duration: 250,
                easing: 'ease-out'
            });

            setTimeout(() => {
                pianoMascot.className = 'piano-mascot-idle';
            }, 300);

            // Text balloon update
            pianoVisualNote.textContent = `${note} - ${animalInfo}`;

            // Award star for exploration
            awardStar('pianoPlayed');
        }
    });
});


// 9. Reward & Certificate Inputs
const nameInput = document.getElementById('child-name-input');
const certNameDisplay = document.getElementById('cert-child-name');
const btnPrint = document.getElementById('btn-print-certificate');

nameInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (val === '') {
        certNameDisplay.textContent = '[ ชื่อเล่นของหนู ]';
    } else {
        certNameDisplay.textContent = val;
    }
});

btnPrint.addEventListener('click', () => {
    playNote(600, 'sine', 0.2);
    window.print();
});


// 10. Start Banner Button Interaction
const btnStart = document.getElementById('btn-start');
const musicWelcomeBanner = document.getElementById('music-welcome-banner');

btnStart.addEventListener('click', () => {
    initAudio();
    musicWelcomeBanner.classList.add('hidden');
    
    // Play warm up arpeggio to signify system loaded
    setTimeout(() => {
        playSuccessSound();
    }, 300);
});


// 11. Initial Setup On Load
window.addEventListener('DOMContentLoaded', () => {
    setupSortingGame();
    setupShapeGame();
});
