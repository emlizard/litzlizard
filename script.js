document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 캐싱
    const elements = {
        refDiameter: document.getElementById('ref-diameter'),
        refStrands: document.getElementById('ref-strands'),
        newDiameter: document.getElementById('new-diameter'),
        calculateBtn: document.getElementById('calculate-btn'),
        error: document.getElementById('error'),
        results: document.getElementById('results'),
        resultStrands: document.getElementById('result-strands'),
        resultDiameter: document.getElementById('result-diameter'),
        refArea: document.getElementById('ref-area'),
        newArea: document.getElementById('new-area'),
        refResistance: document.getElementById('ref-resistance'),
        newResistance: document.getElementById('new-resistance'),
        themeToggle: document.getElementById('theme-toggle'),
    };

    // --- 상수 정의 ---
    const COPPER_CONDUCTIVITY = 5.8e7; // 구리 전도율 (S/m)
    const PACKING_FACTOR = 0.9069; // 충진율

    // --- 테마 변경 기능 ---
    const sunIcon = `☀️`;
    const moonIcon = `🌙`;
    
    function setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        elements.themeToggle.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
        localStorage.setItem('theme', theme);
    }

    elements.themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        setTheme(currentTheme === 'light' ? 'dark' : 'light');
    });
    
    // 페이지 로드 시 저장된 테마 적용
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);


    // --- 계산 기능 ---
    function validateInputs(refDiameter, refStrands, newDiameter) {
        if (!refDiameter || !refStrands || !newDiameter) {
            return "모든 입력값을 채워주세요.";
        }
        if (refDiameter <= 0 || refStrands <= 0 || newDiameter <= 0) {
            return "입력값은 0보다 커야 합니다.";
        }
        return null;
    }

    function calculateArea(diameter) {
        const radius = diameter / 2;
        return Math.PI * radius * radius;
    }
    
    function calculatePackedDiameter(singleDiameter, strandCount) {
        return singleDiameter * Math.sqrt(strandCount / PACKING_FACTOR);
    }

    function calculateResistancePerMeter(totalArea_mm2) {
        if (totalArea_mm2 === 0) return 0;
        const totalArea_m2 = totalArea_mm2 * 1e-6;
        return 1 / (COPPER_CONDUCTIVITY * totalArea_m2);
    }

    function formatNumber(num, decimals = 4) {
        return parseFloat(num.toFixed(decimals));
    }

    function showError(message) {
        elements.error.textContent = message;
        elements.error.style.display = 'block';
        elements.results.style.display = 'none';
    }

    function hideError() {
        elements.error.style.display = 'none';
    }
    
    function updateResultValue(element, value) {
        element.textContent = value;
        element.classList.add('updated');
        setTimeout(() => element.classList.remove('updated'), 500);
    }

    function displayResults(data) {
        updateResultValue(elements.resultStrands, `${data.newStrands} 가닥`);
        updateResultValue(elements.resultDiameter, formatNumber(data.newLitzDiameter));
        updateResultValue(elements.refArea, formatNumber(data.refTotalArea));
        updateResultValue(elements.newArea, formatNumber(data.newTotalArea));
        updateResultValue(elements.refResistance, formatNumber(data.refResistance, 6));
        updateResultValue(elements.newResistance, formatNumber(data.newResistance, 6));
        
        elements.results.style.display = 'block';
    }

    function calculateLitzWire() {
        hideError();
        
        const refDiameter = parseFloat(elements.refDiameter.value);
        const refStrands = parseInt(elements.refStrands.value);
        const newDiameter = parseFloat(elements.newDiameter.value);

        const errorMessage = validateInputs(refDiameter, refStrands, newDiameter);
        if (errorMessage) {
            showError(errorMessage);
            return;
        }

        const refSingleArea = calculateArea(refDiameter);
        const refTotalArea = refSingleArea * refStrands;
        const refResistance = calculateResistancePerMeter(refTotalArea);

        const newSingleArea = calculateArea(newDiameter);
        const newStrands = Math.ceil(refTotalArea / newSingleArea);
        const newTotalArea = newSingleArea * newStrands;
        const newLitzDiameter = calculatePackedDiameter(newDiameter, newStrands);
        const newResistance = calculateResistancePerMeter(newTotalArea);

        displayResults({
            newStrands,
            newLitzDiameter,
            refTotalArea,
            newTotalArea,
            refResistance,
            newResistance
        });
    }

    // --- 이벤트 리스너 ---
    elements.calculateBtn.addEventListener('click', calculateLitzWire);

    document.querySelectorAll('.input-field').forEach(input => {
        input.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                calculateLitzWire();
            }
        });
    });
});
