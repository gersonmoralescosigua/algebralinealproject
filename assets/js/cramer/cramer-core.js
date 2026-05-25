let currentSize = 2;


function renderInputs() {
    const section = document.getElementById('inputSection');

    if (currentSize === 2) {
        section.innerHTML = `
        <div class="matrix-input">
            <table>
                <tr><th></th><th>x</th><th>y</th><th>=</th></tr>
                <tr>
                    <td>Ecuación 1</td>
                    <td><input type="number" id="a11" value="2"></td>
                    <td><input type="number" id="a12" value="1"></td>
                    <td><input type="number" id="b1" value="5"></td>
                </tr>
                <tr>
                    <td>Ecuación 2</td>
                    <td><input type="number" id="a21" value="3"></td>
                    <td><input type="number" id="a22" value="-2"></td>
                    <td><input type="number" id="b2" value="4"></td>
                </tr>
            </table>
        </div>`;
    } else {
        section.innerHTML = `
        <div class="matrix-input">
            <table>
                <tr><th></th><th>x</th><th>y</th><th>z</th><th>=</th></tr>
                <tr>
                    <td>Ecuación 1</td>
                    <td><input type="number" id="a11" value="2"></td>
                    <td><input type="number" id="a12" value="1"></td>
                    <td><input type="number" id="a13" value="1"></td>
                    <td><input type="number" id="b1" value="6"></td>
                </tr>
                <tr>
                    <td>Ecuación 2</td>
                    <td><input type="number" id="a21" value="3"></td>
                    <td><input type="number" id="a22" value="-2"></td>
                    <td><input type="number" id="a23" value="-3"></td>
                    <td><input type="number" id="b2" value="5"></td>
                </tr>
                <tr>
                    <td>Ecuación 3</td>
                    <td><input type="number" id="a31" value="8"></td>
                    <td><input type="number" id="a32" value="2"></td>
                    <td><input type="number" id="a33" value="5"></td>
                    <td><input type="number" id="b3" value="11"></td>
                </tr>
            </table>
        </div>`;
    }
}


function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b !== 0) { let t = b; b = a % b; a = t; }
    return a;
}

function simplifyFraction(numerator, denominator) {
    if (denominator === 0) return "Indefinido";
    if (numerator % denominator === 0) return (numerator / denominator).toString();
    const d = gcd(numerator, denominator);
    let n = numerator / d, dd = denominator / d;
    if (dd < 0) { n *= -1; dd *= -1; }
    return `${n}/${dd}`;
}



function det2x2(m) {
    return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

function det3x3(m) {
    return (
        m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
        - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
        + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
    );
}

function replaceColumn(matrix, colIndex, B) {
    return matrix.map((row, i) => row.map((v, c) => c === colIndex ? B[i] : v));
}

function getValues() {
    if (currentSize === 2) {
        return {
            A: [
                [+document.getElementById('a11').value, +document.getElementById('a12').value],
                [+document.getElementById('a21').value, +document.getElementById('a22').value]
            ],
            B: [+document.getElementById('b1').value, +document.getElementById('b2').value]
        };
    }
    return {
        A: [
            [+document.getElementById('a11').value, +document.getElementById('a12').value, +document.getElementById('a13').value],
            [+document.getElementById('a21').value, +document.getElementById('a22').value, +document.getElementById('a23').value],
            [+document.getElementById('a31').value, +document.getElementById('a32').value, +document.getElementById('a33').value]
        ],
        B: [+document.getElementById('b1').value, +document.getElementById('b2').value, +document.getElementById('b3').value]
    };
}

// ==========================================
// RENDER — Tabla estándar
// ==========================================
function matrixToHTML(matrix) {
    let html = `<table class="matrix-preview-table">`;
    matrix.forEach(row => {
        html += `<tr>`;
        row.forEach(val => {
            html += `<td style="padding:10px 15px;border:1px solid rgba(255,255,255,0.1);text-align:center;">${val}</td>`;
        });
        html += `</tr>`;
    });
    return html + `</table>`;
}

// ==========================================
// RENDER — Tabla con columna iluminada
// ==========================================
function matrixToHTMLHighlighted(matrix, highlightCol) {
    let html = `<table class="matrix-preview-table">`;
    matrix.forEach(row => {
        html += `<tr>`;
        row.forEach((val, ci) => {
            const hl = ci === highlightCol;
            html += `<td style="
                padding: 10px 15px;
                text-align: center;
                font-weight: ${hl ? '800' : '700'};
                border: 1px solid ${hl ? 'rgba(34,197,94,0.45)' : 'rgba(255,255,255,0.1)'};
                background: ${hl ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.015)'};
                color: ${hl ? '#22C55E' : 'white'};
                box-shadow: ${hl ? 'inset 0 0 14px rgba(34,197,94,0.12)' : 'none'};
            ">${val}</td>`;
        });
        html += `</tr>`;
    });
    return html + `</table>`;
}

// ==========================================
// RENDER — Comparación A original vs A modificada
// ==========================================
function matrixComparisonHTML(A, Amod, varName, colIndex) {
    return `
        <div class="matrix-comparison-wrapper">
            <div class="matrix-comp-item">
                <span class="matrix-comp-label">Matriz A</span>
                ${matrixToHTML(A)}
            </div>
            <div class="matrix-comp-arrow">
                <span class="comp-arrow-symbol">→</span>
                <span class="comp-arrow-caption">col.&nbsp;${colIndex + 1}&nbsp;→&nbsp;B</span>
            </div>
            <div class="matrix-comp-item">
                <span class="matrix-comp-label">A<sub>${varName}</sub></span>
                ${matrixToHTMLHighlighted(Amod, colIndex)}
            </div>
        </div>`;
}

// ==========================================
// RENDER — Determinante 2×2 embellecido
// ==========================================
function renderDet2x2HTML(m) {
    const ad = m[0][0] * m[1][1];
    const bc = m[0][1] * m[1][0];
    const result = ad - bc;

    const pClass = (v) => v >= 0 ? 'cramer-pill-pos' : 'cramer-pill-neg';
    const rClass = result >= 0 ? 'cramer-result-pos' : 'cramer-result-neg';

    return `
        <div class="arith-equation-block">
            <p class="arith-block-title">Fórmula 2×2: &nbsp; det = (a₁₁ × a₂₂) − (a₁₂ × a₂₁)</p>
            <div class="arith-line-row">
                <span class="arith-eq-label">det =</span>
                <div class="cramer-prod-pill ${pClass(ad)}">
                    <span class="prod-expr">${m[0][0]}&thinsp;×&thinsp;${m[1][1]}</span>
                    <span class="prod-sep">=</span>
                    <span class="prod-val">${ad}</span>
                </div>
                <span class="arith-op-sign">−</span>
                <div class="cramer-prod-pill ${pClass(bc)}">
                    <span class="prod-expr">${m[0][1]}&thinsp;×&thinsp;${m[1][0]}</span>
                    <span class="prod-sep">=</span>
                    <span class="prod-val">${bc}</span>
                </div>
            </div>
            <div class="arith-result-row">
                <span class="arith-eq-label">=</span>
                <div class="cramer-final-pill ${rClass}">${result}</div>
            </div>
        </div>`;
}

// ==========================================
// RENDER — Determinante 3×3 embellecido (Sarrus)
// ==========================================
function renderDet3x3HTML(m) {

    const p1 = m[0][0] * m[1][1] * m[2][2];
    const p2 = m[0][1] * m[1][2] * m[2][0];
    const p3 = m[0][2] * m[1][0] * m[2][1];

    const n1 = m[0][2] * m[1][1] * m[2][0];
    const n2 = m[0][0] * m[1][2] * m[2][1];
    const n3 = m[0][1] * m[1][0] * m[2][2];

    const positive = p1 + p2 + p3;
    const negative = n1 + n2 + n3;

    const det = positive - negative;

    return `

    <div class="sarrus-container">

        <div class="sarrus-left">

            <div>
                <h4 class="sarrus-positive-title">
                    Diagonales positivas ↘
                </h4>

                <div class="operation-line operation-positive">
                    <div>${m[0][0]} × ${m[1][1]} × ${m[2][2]}</div>
                    <span>${p1}</span>
                </div>

                <div class="operation-line operation-positive">
                    <div>${m[0][1]} × ${m[1][2]} × ${m[2][0]}</div>
                    <span>${p2}</span>
                </div>

                <div class="operation-line operation-positive">
                    <div>${m[0][2]} × ${m[1][0]} × ${m[2][1]}</div>
                    <span>${p3}</span>
                </div>
            </div>

            <div>
                <h4 class="sarrus-negative-title">
                    Diagonales negativas ↙
                </h4>

                <div class="operation-line operation-negative">
                    <div>${m[0][2]} × ${m[1][1]} × ${m[2][0]}</div>
                    <span>${n1}</span>
                </div>

                <div class="operation-line operation-negative">
                    <div>${m[0][0]} × ${m[1][2]} × ${m[2][1]}</div>
                    <span>${n2}</span>
                </div>

                <div class="operation-line operation-negative">
                    <div>${m[0][1]} × ${m[1][0]} × ${m[2][2]}</div>
                    <span>${n3}</span>
                </div>
            </div>

            <div class="final-determinant">
                det(A) = (${positive}) - (${negative})
                =
                <strong>${det}</strong>
            </div>

        </div>

        <div class="sarrus-visual">

            <div class="matrix-grid">

                ${[0,1,2].map(r => `
                    ${[0,1,2].map(c => `
                        <div class="matrix-cell main">
                            ${m[r][c]}
                        </div>
                    `).join('')}

                    ${[0,1].map(c => `
                        <div class="matrix-cell copy">
                            ${m[r][c]}
                        </div>
                    `).join('')}
                `).join('')}

                <svg class="diagonal-overlay" viewBox="0 0 500 300">

                    <!-- positivas -->
                    <line x1="55" y1="45" x2="250" y2="245" class="diag-pos"/>
                    <line x1="155" y1="45" x2="350" y2="245" class="diag-pos"/>
                    <line x1="255" y1="45" x2="450" y2="245" class="diag-pos"/>

                    <!-- negativas -->
                    <line x1="255" y1="45" x2="55" y2="245" class="diag-neg"/>
                    <line x1="355" y1="45" x2="155" y2="245" class="diag-neg"/>
                    <line x1="455" y1="45" x2="255" y2="245" class="diag-neg"/>

                </svg>

            </div>

        </div>

    </div>
    `;
}

// ==========================================
// RENDER — Fórmula Cramer con fracción visual
// ==========================================
function cramerFormulaHTML(varName, detVariable, detA, fraction) {
    const isNeg     = fraction.startsWith('-');
    const pillClass = isNeg ? 'cramer-result-neg' : 'cramer-result-pos';
    const numClass  = detVariable >= 0 ? 'frac-num-pos' : 'frac-num-neg';
    const denClass  = detA >= 0 ? 'frac-den-pos' : 'frac-den-neg';

    return `
        <div class="cramer-formula-display">
            <div class="formula-equation">
                <span class="formula-var">${varName}</span>
                <span class="formula-eq-sign">=</span>
                <div class="formula-fraction">
                    <span class="frac-num ${numClass}">Δ${varName} = ${detVariable}</span>
                    <span class="frac-line"></span>
                    <span class="frac-den ${denClass}">Δ = ${detA}</span>
                </div>
                <span class="formula-eq-sign">=</span>
                <div class="cramer-final-pill ${pillClass} pill-large">${fraction}</div>
            </div>
        </div>`;
}

// ==========================================
// RESOLVER — función principal
// ==========================================
function resolverCramer() {
    const { A, B } = getValues();
    const resultSection = document.getElementById('resultSection');
    let html = '';

    // PASO 1: Sistema
    html += `
    <div class="step">
        <h3>Paso 1: Sistema de ecuaciones</h3>
        <p>Se obtiene la matriz de coeficientes <b>A</b> y el vector de términos independientes <b>B</b>.</p>
        <div class="matrix-comparison-wrapper" style="gap:2.5rem;">
            <div class="matrix-comp-item">
                <span class="matrix-comp-label">Matriz A</span>
                ${matrixToHTML(A)}
            </div>
            <div class="matrix-comp-item">
                <span class="matrix-comp-label">Vector B</span>
                ${matrixToHTML(B.map(v => [v]))}
            </div>
        </div>
    </div>`;

    // PASO 2: Determinante principal
    const detA = currentSize === 2 ? det2x2(A) : det3x3(A);

    html += `
    <div class="step">
        <h3>Paso 2: Calcular Δ — determinante principal</h3>
        <p>Calculamos el determinante de la matriz original <b>A</b>:</p>
        ${matrixToHTML(A)}
        ${currentSize === 2 ? renderDet2x2HTML(A) : renderDet3x3HTML(A)}
    </div>`;

    if (detA === 0) {
        html += `
        <div class="step error">
            <h3>Sistema sin solución única</h3>
            <p>El determinante principal <b>Δ = 0</b>. El sistema es incompatible o tiene infinitas soluciones.</p>
        </div>`;
        resultSection.innerHTML = html;
        return;
    }

    // PASOS 3+: Δx, Δy, (Δz)
    const variables = currentSize === 2 ? ['x', 'y'] : ['x', 'y', 'z'];
    const solutions = [];

    for (let i = 0; i < currentSize; i++) {
        const modified = replaceColumn(A, i, B);
        const detVar   = currentSize === 2 ? det2x2(modified) : det3x3(modified);
        const fraction = simplifyFraction(detVar, detA);
        solutions.push(fraction);

        html += `
        <div class="step">
            <h3>Paso ${i + 3}: Calcular Δ${variables[i]}</h3>
            <p>
                Reemplazamos la <b>columna ${i + 1}</b> (variable <b>${variables[i]}</b>)
                de la matriz A por el vector B:
            </p>
            ${matrixComparisonHTML(A, modified, variables[i], i)}
            <p style="margin-top:1.25rem;">Calculamos el determinante de la matriz modificada:</p>
            ${currentSize === 2 ? renderDet2x2HTML(modified) : renderDet3x3HTML(modified)}
            <hr style="margin:1.25rem 0;border:1px solid rgba(255,255,255,0.08);">
            <p>Aplicamos la fórmula de Cramer:</p>
            ${cramerFormulaHTML(variables[i], detVar, detA, fraction)}
        </div>`;
    }

    // SOLUCIÓN FINAL
    html += `
    <div class="step solution">
        <h3>Solución Final</h3>
        <p>Después de aplicar la Regla de Cramer, el sistema queda resuelto:</p>
        <div class="final-solutions-grid">
            ${solutions.map((val, i) => {
                const isNeg = val.startsWith('-');
                return `
                <div class="final-solution-item">
                    <span class="final-var">${variables[i]}</span>
                    <span class="final-eq">=</span>
                    <span class="final-val ${isNeg ? 'final-val-neg' : 'final-val-pos'}">${val}</span>
                </div>`;
            }).join('')}
        </div>
    </div>`;

    resultSection.innerHTML = html;
}

// ==========================================
// EVENTOS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('calcularBtn')
        .addEventListener('click', resolverCramer);

    const limpiarBtn = document.getElementById('limpiarBtn');
    if (limpiarBtn) {
        limpiarBtn.addEventListener('click', () => {
            document.querySelectorAll('#inputSection input')
                .forEach(input => input.value = 0);
            document.getElementById('resultSection').innerHTML = `
                <div class="placeholder">Aquí se mostrarán los pasos detallados para la resolución del sistema.</div>`;
        });
    }

    document.querySelectorAll('.size-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            currentSize = Number(e.target.dataset.size);
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderInputs();
            document.getElementById('resultSection').innerHTML = `
                <div class="placeholder">Aquí se mostrarán los pasos detallados para la resolución del sistema.</div>`;
        });
    });

    renderInputs();
});