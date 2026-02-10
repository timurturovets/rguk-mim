// tg @teletraann
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const invitation = document.getElementById('invitation');

const sectors = 8;

const colors = ['#e3e3e3', '#690000', '#e3e3e3', '#690000', '#e3e3e3', 
                '#690000', '#e3e3e3', '#690000'];
const winningSector = 0; // :)
const texts = [
    'Приходи к нам на кастинг',
    'Тебе повезет',
    'Семестр подарит радость',
    'Прохожий подарит тебе улыбку',
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
        ctx.strokeStyle = '#690000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        if (i === winningSector) {
            ctx.globalAlpha = 1; 
        } else {
            ctx.globalAlpha = 1 - (fadeProgress * 0.7); 
        }
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + Math.PI / sectors);
        ctx.textAlign = 'right';
        ctx.font = 'bold 16px Verdana';
        
        const textColor = (i % 2 === 0) ? '#690000' : '#e3e3e3';
        
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
                    ctx.fillText(line.trim(), radius - 10, yOffset);
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
            ctx.fillText(line.trim(), radius - 10, yOffset);
        } else {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.fillStyle = textColor;
            ctx.fillText(text, radius - 10, 5);
        }
        ctx.restore();
    }

    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#690000';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
}

function spin() {
    if (isSpinning) return;
    isSpinning = true;
    spinBtn.disabled = true;

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
            
            spinBtn.style.opacity = '0';
            spinBtn.style.transition = 'opacity 1s ease';
            
            setTimeout(() => {
                spinBtn.style.display = 'none';
                
                invitation.style.height = 'auto';
                
                invitation.classList.add('show');
            }, 1000);
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
    const vkError = document.getElementById('vkError');
    const vkPattern = /vk\.com/i;
    if (vkPattern.test(input.value)) {
        vkError.style.display = 'none';
        input.setCustomValidity('');
    } else {
        vkError.style.display = 'block';
        input.setCustomValidity('Введи корректную ссылку на свой ВК');
    }
}

function updateRangeValue(value) {
    document.getElementById('rangeValue').textContent = value;
}

function validateVkLink(input) {
    const vkError = document.getElementById('vkError');
    const vkPattern = /vk\.com/i;
    if (vkPattern.test(input.value)) {
        vkError.style.display = 'none';
        input.setCustomValidity('');
    } else {
        vkError.style.display = 'block';
        input.setCustomValidity('Введи корректную ссылку на свой ВК');
    }
}
drawWheel();

window.addEventListener('load', () => {
    document.querySelector('.wheel-container').classList.add('loaded');
    document.querySelector('.spin-btn').classList.add('loaded');
});