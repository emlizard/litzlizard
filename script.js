// 구리 전도율 상수 정의 (단위: S/m)
        const COPPER_CONDUCTIVITY = 5.8e7;

        function validateInputs(refDiameter, refStrands, newDiameter) {
            const errors = [];
            
            if (isNaN(refDiameter) || refDiameter <= 0) {
                errors.push("기준 단선 직경은 0보다 큰 숫자여야 합니다.");
            }
            
            if (isNaN(refStrands) || refStrands <= 0 || !Number.isInteger(refStrands)) {
                errors.push("기준 가닥 수는 1 이상의 정수여야 합니다.");
            }
            
            if (isNaN(newDiameter) || newDiameter <= 0) {
                errors.push("새로운 단선 직경은 0보다 큰 숫자여야 합니다.");
            }
            
            if (refDiameter > 2 || newDiameter > 2) {
                errors.push("단선 직경이 2mm를 초과하면 일반적인 리츠 와이어 범위를 벗어날 수 있습니다.");
            }
            
            if (refStrands > 10000) {
                errors.push("가닥 수가 너무 큽니다. 실제 제조 가능성을 확인해주세요.");
            }
            
            return errors;
        }

        function calculateCircularArea(diameter) {
            const radius = diameter / 2;
            return Math.PI * radius * radius;
        }

        function calculatePackedDiameter(singleDiameter, strandCount, packingFactor = 0.9069) {
            return singleDiameter * Math.sqrt(strandCount / packingFactor);
        }

        // 미터당 DC 저항 계산 함수 추가
        function calculateResistancePerMeter(totalArea_mm2, conductivity) {
            // 단면적을 mm²에서 m²로 변환
            const totalArea_m2 = totalArea_mm2 * 1e-6;
            if (totalArea_m2 === 0) return 0;
            // 저항 공식 R = 1 / (σ * A)
            return 1 / (conductivity * totalArea_m2);
        }

        function formatNumber(number, decimals = 3) {
            return number.toFixed(decimals);
        }

        function showError(message) {
            const errorElement = document.getElementById('error');
            errorElement.textContent = message;
            errorElement.classList.add('show');
            document.getElementById('results').classList.remove('show');
        }

        function hideError() {
            document.getElementById('error').classList.remove('show');
        }

        function displayResults(results) {
            document.getElementById('result-strands').textContent = results.newStrands + ' 가닥';
            document.getElementById('result-diameter').textContent = formatNumber(results.newLitzDiameter) + ' mm';
            document.getElementById('ref-area').textContent = formatNumber(results.refTotalArea) + ' mm²';
            document.getElementById('new-area').textContent = formatNumber(results.newTotalArea) + ' mm²';
            
            // 저항 결과 표시
            document.getElementById('ref-resistance').textContent = formatNumber(results.refResistance, 5) + ' Ω/m';
            document.getElementById('new-resistance').textContent = formatNumber(results.newResistance, 5) + ' Ω/m';

            document.getElementById('area-ratio').textContent = formatNumber(results.areaRatio, 2) + '배';
            document.getElementById('resistance-ratio').textContent = formatNumber(1/results.areaRatio, 2) + '배 (저항)';
            
            let efficiency;
            if (results.areaRatio > 1.2) {
                efficiency = "우수 (과도한 도체량)";
            } else if (results.areaRatio >= 1.0) {
                efficiency = "적절 (설계 목표 달성)";
            } else {
                efficiency = "부족 (저항 증가)";
            }
            document.getElementById('efficiency').textContent = efficiency;
            
            document.getElementById('results').classList.add('show');
        }

        function calculateLitzWire() {
            hideError();
            
            const refDiameter = parseFloat(document.getElementById('ref-diameter').value);
            const refStrands = parseInt(document.getElementById('ref-strands').value);
            const newDiameter = parseFloat(document.getElementById('new-diameter').value);
            
            const errors = validateInputs(refDiameter, refStrands, newDiameter);
            if (errors.length > 0) {
                showError(errors.join(' '));
                return;
            }
            
            // 기준 리츠 와이어 계산
            const refSingleArea = calculateCircularArea(refDiameter);
            const refTotalArea = refSingleArea * refStrands;
            const refResistance = calculateResistancePerMeter(refTotalArea, COPPER_CONDUCTIVITY); // 기준 저항 계산
            
            // 새로운 리츠 와이어 계산
            const newSingleArea = calculateCircularArea(newDiameter);
            const newStrands = Math.ceil(refTotalArea / newSingleArea);
            const newTotalArea = newSingleArea * newStrands;
            const newLitzDiameter = calculatePackedDiameter(newDiameter, newStrands);
            const newResistance = calculateResistancePerMeter(newTotalArea, COPPER_CONDUCTIVITY); // 새로운 저항 계산
            
            // 성능 비교
            const areaRatio = newTotalArea / refTotalArea;
            
            const results = {
                newStrands,
                newLitzDiameter,
                refTotalArea,
                newTotalArea,
                areaRatio,
                refResistance, // 결과 객체에 추가
                newResistance  // 결과 객체에 추가
            };
            
            displayResults(results);
        }

        document.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                calculateLitzWire();
            }
        });
