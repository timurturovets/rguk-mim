// tg @teletraann
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const invitation = document.getElementById('invitation');

const sectors = 8;

const colors = ['#FFFDF8', '#810004', '#FFFDF8', '#004C45', '#FFFDF8', 
                '#810004', '#FFFDF8', '#004C45'];
const winningSector = 0; // :)
const texts = [
    'Приходи к нам на кастинг', 
    'Ты придёшь на финал Твоего Расцвета',
    'Семестр подарит радость',
    'Тебе повезёт',
    'Все цели будут достигнуты',
    'Ты обретешь новых друзей',
    'Твоя мечта сбудется',
    'Тебя ждет приятный сюрприз',
];

let currentRotation = 0;
let isSpinning = false;
let fadeProgress = 0; 

function drawWheel() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < sectors; i++) {
        const startAngle = (i * 2 * Math.PI / sectors) + currentRotation;
        const endAngle = ((i + 1) * 2 * Math.PI / sectors) + currentRotation;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        if (i === winningSector) {
            ctx.globalAlpha = 1; 
        } else {
            ctx.globalAlpha = 1 - (fadeProgress * 0.7);
        }
        
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.strokeStyle = '#004C45';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Outer glow circle (drawn once after all sectors)
        if (i === sectors - 1) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius + 2, 0, 2 * Math.PI);
            ctx.shadowColor = '#004C45';
            ctx.shadowBlur = 30;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.strokeStyle = '#004C45';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        if (i === winningSector) {
            ctx.globalAlpha = 1; 
        } else {
            ctx.globalAlpha = 1 - (fadeProgress * 0.7); 
        }
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + Math.PI / sectors);
        ctx.textAlign = 'right';
        ctx.font = '300 16px Gilroy, sans-serif';
        
        const textColor = (i % 2 === 0) ? '#004C45' : '#FFFDF8';
        
        const text = texts[i];
        const maxWidth = radius - 60;
        
        if (ctx.measureText(text).width > maxWidth) {
            const words = text.split(' ');
            let line = '';
            let yOffset = -6;
            for (let j = 0; j < words.length; j++) {
                const testLine = line + words[j] + ' ';
                if (ctx.measureText(testLine).width > maxWidth && j > 0) {
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                    ctx.shadowBlur = 2;
                    ctx.shadowOffsetX = 1;
                    ctx.shadowOffsetY = 1;
                    ctx.fillStyle = textColor;
                    ctx.fillText(line.trim(), radius - 20, yOffset);
                    line = words[j] + ' ';
                    yOffset += 16;
                } else {
                    line = testLine;
                }
            }
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.fillStyle = textColor;
            ctx.fillText(line.trim(), radius - 20, yOffset);
        } else {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.fillStyle = textColor;
            ctx.fillText(text, radius - 20, 5);
        }
        ctx.restore();
    }

    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#810004';
    ctx.fill();
    ctx.strokeStyle = '#FFFDF8';
    ctx.lineWidth = 3;
    ctx.stroke();
}

function spin() {
    if (isSpinning) return;
    isSpinning = true;

    const sectorAngle = 2 * Math.PI / sectors;
    const targetAngle = (0 * Math.PI / 180) - (winningSector * sectorAngle) - (sectorAngle / 2);
    
    const spins = 5;
    const totalRotation = (spins * 2 * Math.PI) + targetAngle - (currentRotation % (2 * Math.PI));
    
    const duration = 5000;
    const startTime = performance.now();
    const startRotation = currentRotation;

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        currentRotation = startRotation + (totalRotation * easeOut);
        
        if (progress > 0.7) {
            fadeProgress = (progress - 0.7) / 0.3; 
        } else {
            fadeProgress = 0;
        }
        
        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            fadeProgress = 1;
            drawWheel();
            
            isSpinning = false;
            
            const bgOverlay = document.createElement('div');
            bgOverlay.style.position = 'fixed';
            bgOverlay.style.top = '0';
            bgOverlay.style.left = '0';
            bgOverlay.style.width = '100%';
            bgOverlay.style.height = '100%';
            bgOverlay.style.backgroundImage = 'url(bg.png)';
            bgOverlay.style.backgroundSize = 'cover';
            bgOverlay.style.backgroundPosition = 'center';
            bgOverlay.style.backgroundRepeat = 'no-repeat';
            bgOverlay.style.zIndex = '-1';
            bgOverlay.style.opacity = '0';
            bgOverlay.style.transition = 'opacity 1s ease';
            const bgImage = new Image();
            bgImage.onload = () => {
                document.body.appendChild(bgOverlay);
                // Force reflow to ensure opacity:0 is painted before transition
                bgOverlay.offsetHeight;
                requestAnimationFrame(() => {
                    bgOverlay.style.opacity = '1';
                });
            };
            bgImage.src = 'bg.png';
            
            invitation.style.height = 'auto';
            invitation.classList.add('show');
        }
    }

    requestAnimationFrame(animate);
}

async function submitForm(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';
    
    const formData = new FormData(event.target);
    const body = Object.fromEntries(formData.entries());

    try {
        await fetch("/.netlify/functions/submit-form", { 
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        
        window.location.href = 'success.html';
    } catch (error) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        alert('Произошла ошибка. Попробуй еще раз.');
    }
}

function updateRangeValue(value) {
    document.getElementById('rangeValue').textContent = value;
}

function validateVkLink(input) {
    const vkPattern = /vk\.com/i;
    if (vkPattern.test(input.value)) {
        input.setCustomValidity('');
    } else {
        input.setCustomValidity('Введи корректную ссылку на свой ВК');
    }
}

window.addEventListener('load', () => {
    document.querySelector('.wheel-container').classList.add('loaded');
    
    setTimeout(() => {
        spin();
    }, 1500);
});

drawWheel();
