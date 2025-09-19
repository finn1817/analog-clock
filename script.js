class AnalogClock {
    constructor() {
        this.clock = document.getElementById('clock');
        this.hourHand = document.getElementById('hour-hand');
        this.minuteHand = document.getElementById('minute-hand');
        this.secondHand = document.getElementById('second-hand');
        this.numbersContainer = document.getElementById('numbers');
        this.minuteMarkersContainer = document.getElementById('minute-markers');
        this.digitalTime = document.getElementById('digital-time');
        
        this.currentTheme = 'classic';
        this.currentNumbers = 'all';
        this.currentTimezone = 'local';
        this.currentSize = 300;
        
        this.initializeControls();
        this.createNumbers();
        this.createMinuteMarkers();
        this.startClock();
    }
    
    initializeControls() {
        // Theme selector
        const themeSelect = document.getElementById('theme-select');
        themeSelect.addEventListener('change', (e) => {
            this.changeTheme(e.target.value);
        });
        
        // Numbers selector
        const numbersSelect = document.getElementById('numbers-select');
        numbersSelect.addEventListener('change', (e) => {
            this.changeNumbers(e.target.value);
        });
        
        // Size slider
        const sizeSlider = document.getElementById('size-slider');
        const sizeValue = document.getElementById('size-value');
        sizeSlider.addEventListener('input', (e) => {
            this.currentSize = parseInt(e.target.value);
            this.changeSize(this.currentSize);
            sizeValue.textContent = this.currentSize + 'px';
        });
        
        // Color pickers
        const colorPicker = document.getElementById('color-picker');
        colorPicker.addEventListener('change', (e) => {
            this.changeAccentColor(e.target.value);
        });
        
        const bgColorPicker = document.getElementById('bg-color-picker');
        bgColorPicker.addEventListener('change', (e) => {
            this.changeBackgroundColor(e.target.value);
        });
        
        // Timezone selector
        const timezoneSelect = document.getElementById('timezone-select');
        timezoneSelect.addEventListener('change', (e) => {
            this.currentTimezone = e.target.value;
        });
    }
    
    createNumbers() {
        this.numbersContainer.innerHTML = '';
        
        for (let i = 1; i <= 12; i++) {
            const number = document.createElement('div');
            number.className = 'number';
            number.textContent = i;
            
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const radius = this.currentSize * 0.35;
            const x = Math.cos(angle) * radius + this.currentSize / 2;
            const y = Math.sin(angle) * radius + this.currentSize / 2;
            
            number.style.left = x + 'px';
            number.style.top = y + 'px';
            
            this.numbersContainer.appendChild(number);
        }
        
        this.updateNumbersVisibility();
    }
    
    createMinuteMarkers() {
        this.minuteMarkersContainer.innerHTML = '';
        
        for (let i = 0; i < 60; i++) {
            const marker = document.createElement('div');
            marker.className = 'minute-marker';
            
            if (i % 5 === 0) {
                marker.classList.add('major');
            }
            
            const angle = i * 6;
            marker.style.transform = `rotate(${angle}deg)`;
            
            this.minuteMarkersContainer.appendChild(marker);
        }
    }
    
    changeTheme(theme) {
        this.clock.className = `clock ${theme}`;
        this.currentTheme = theme;
    }
    
    changeNumbers(numbersType) {
        this.currentNumbers = numbersType;
        this.updateNumbersVisibility();
    }
    
    updateNumbersVisibility() {
        const numbers = this.numbersContainer.querySelectorAll('.number');
        
        numbers.forEach((number, index) => {
            const numberValue = index + 1;
            
            switch (this.currentNumbers) {
                case 'all':
                    number.style.display = 'block';
                    break;
                case 'quarters':
                    number.style.display = [12, 3, 6, 9].includes(numberValue) ? 'block' : 'none';
                    break;
                case 'none':
                    number.style.display = 'none';
                    break;
            }
        });
    }
    
    changeSize(size) {
        this.clock.style.width = size + 'px';
        this.clock.style.height = size + 'px';
        
        // Recalculate number positions
        this.createNumbers();
        
        // Adjust hand lengths proportionally
        const ratio = size / 300;
        this.hourHand.style.height = (80 * ratio) + 'px';
        this.minuteHand.style.height = (110 * ratio) + 'px';
        this.secondHand.style.height = (120 * ratio) + 'px';
        
        // Adjust number font size
        const numbers = this.numbersContainer.querySelectorAll('.number');
        numbers.forEach(number => {
            number.style.fontSize = (24 * ratio) + 'px';
        });
    }
    
    changeAccentColor(color) {
        document.documentElement.style.setProperty('--accent-color', color);
        
        // Update hands color
        this.hourHand.style.background = `linear-gradient(180deg, ${color} 0%, ${this.darkenColor(color, 20)} 100%)`;
        this.minuteHand.style.background = `linear-gradient(180deg, ${color} 0%, ${this.darkenColor(color, 10)} 100%)`;
        
        // Update numbers color
        const numbers = this.numbersContainer.querySelectorAll('.number');
        numbers.forEach(number => {
            number.style.color = color;
        });
    }
    
    changeBackgroundColor(color) {
        this.clock.style.background = color;
    }
    
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    getCurrentTime() {
        const now = new Date();
        
        if (this.currentTimezone === 'local') {
            return now;
        } else {
            return new Date(now.toLocaleString("en-US", {timeZone: this.currentTimezone}));
        }
    }
    
    updateClock() {
        const now = this.getCurrentTime();
        const hours = now.getHours() % 12;
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();
        
        // Calculate precise angles for smooth movement
        const secondAngle = (seconds + milliseconds / 1000) * 6;
        const minuteAngle = (minutes + seconds / 60) * 6;
        const hourAngle = (hours + minutes / 60) * 30;
        
        // Apply rotations
        this.secondHand.style.transform = `rotate(${secondAngle}deg)`;
        this.minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
        this.hourHand.style.transform = `rotate(${hourAngle}deg)`;
        
        // Update digital time
        const timeString = now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        this.digitalTime.textContent = timeString;
    }
    
    startClock() {
        this.updateClock();
        // Update every 50ms for smooth second hand movement
        setInterval(() => this.updateClock(), 50);
    }
}

// Initialize the clock when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AnalogClock();
});
