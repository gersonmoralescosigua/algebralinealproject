let currentSize = 2;

// ==========================================
// GENERAR MATRICES DINÁMICAS
// ==========================================

function renderInputs() {

    const section = document.getElementById('inputSection');

    // ======================================
    // SISTEMA 2x2
    // ======================================

    if (currentSize === 2) {

        section.innerHTML = `
        
        <div class="matrix-input">

            <table>

                <tr>
                    <th></th>
                    <th>x</th>
                    <th>y</th>
                    <th>=</th>
                </tr>

                <tr>
                    <td>Ecuación 1</td>

                    <td>
                        <input type="number" id="a11" value="2">
                    </td>

                    <td>
                        <input type="number" id="a12" value="1">
                    </td>

                    <td>
                        <input type="number" id="b1" value="5">
                    </td>
                </tr>

                <tr>
                    <td>Ecuación 2</td>

                    <td>
                        <input type="number" id="a21" value="3">
                    </td>

                    <td>
                        <input type="number" id="a22" value="-2">
                    </td>

                    <td>
                        <input type="number" id="b2" value="4">
                    </td>
                </tr>

            </table>

        </div>
        `;
    }

    // ======================================
    // SISTEMA 3x3
    // ======================================

    else {

        section.innerHTML = `
        
        <div class="matrix-input">

            <table>

                <tr>
                    <th></th>
                    <th>x</th>
                    <th>y</th>
                    <th>z</th>
                    <th>=</th>
                </tr>

                <tr>
                    <td>Ecuación 1</td>

                    <td>
                        <input type="number" id="a11" value="2">
                    </td>

                    <td>
                        <input type="number" id="a12" value="1">
                    </td>

                    <td>
                        <input type="number" id="a13" value="1">
                    </td>

                    <td>
                        <input type="number" id="b1" value="6">
                    </td>
                </tr>

                <tr>
                    <td>Ecuación 2</td>

                    <td>
                        <input type="number" id="a21" value="3">
                    </td>

                    <td>
                        <input type="number" id="a22" value="-2">
                    </td>

                    <td>
                        <input type="number" id="a23" value="-3">
                    </td>

                    <td>
                        <input type="number" id="b2" value="5">
                    </td>
                </tr>

                <tr>
                    <td>Ecuación 3</td>

                    <td>
                        <input type="number" id="a31" value="8">
                    </td>

                    <td>
                        <input type="number" id="a32" value="2">
                    </td>

                    <td>
                        <input type="number" id="a33" value="5">
                    </td>

                    <td>
                        <input type="number" id="b3" value="11">
                    </td>
                </tr>

            </table>

        </div>
        `;
    }
}

// ==========================================
// MCD
// ==========================================

function gcd(a, b) {

    a = Math.abs(a);
    b = Math.abs(b);

    while (b !== 0) {

        let temp = b;
        b = a % b;
        a = temp;
    }

    return a;
}

// ==========================================
// CONVERTIR A FRACCIÓN
// ==========================================

function simplifyFraction(numerator, denominator) {

    if (denominator === 0) {
        return "Indefinido";
    }

    // SI ES ENTERO

    if (numerator % denominator === 0) {

        return (numerator / denominator).toString();
    }

    const divisor = gcd(numerator, denominator);

    numerator = numerator / divisor;
    denominator = denominator / divisor;

    // EVITAR SIGNO NEGATIVO ABAJO

    if (denominator < 0) {

        numerator *= -1;
        denominator *= -1;
    }

    return `${numerator}/${denominator}`;
}

// ==========================================
// DETERMINANTE 2x2
// ==========================================

function det2x2(m) {

    return (
        m[0][0] * m[1][1]
        -
        m[0][1] * m[1][0]
    );
}

// ==========================================
// DETERMINANTE 3x3
// ==========================================

function det3x3(m) {

    return (

        m[0][0] * (
            (m[1][1] * m[2][2])
            -
            (m[1][2] * m[2][1])
        )

        -

        m[0][1] * (
            (m[1][0] * m[2][2])
            -
            (m[1][2] * m[2][0])
        )

        +

        m[0][2] * (
            (m[1][0] * m[2][1])
            -
            (m[1][1] * m[2][0])
        )
    );
}

// ==========================================
// MATRIZ HTML
// ==========================================

function matrixToHTML(matrix) {

    let html = `
        <table style="margin-top:10px;">
    `;

    matrix.forEach(row => {

        html += `<tr>`;

        row.forEach(value => {

            html += `
                <td style="
                    padding:10px 15px;
                    border:1px solid rgba(255,255,255,0.1);
                    text-align:center;
                ">
                    ${value}
                </td>
            `;
        });

        html += `</tr>`;
    });

    html += `</table>`;

    return html;
}

// ==========================================
// REEMPLAZAR COLUMNA
// ==========================================

function replaceColumn(matrix, colIndex, B) {

    const newMatrix = matrix.map(row => [...row]);

    for (let i = 0; i < matrix.length; i++) {

        newMatrix[i][colIndex] = B[i];
    }

    return newMatrix;
}

// ==========================================
// OBTENER VALORES
// ==========================================

function getValues() {

    if (currentSize === 2) {

        const A = [

            [
                Number(document.getElementById('a11').value),
                Number(document.getElementById('a12').value)
            ],

            [
                Number(document.getElementById('a21').value),
                Number(document.getElementById('a22').value)
            ]
        ];

        const B = [

            Number(document.getElementById('b1').value),
            Number(document.getElementById('b2').value)
        ];

        return { A, B };
    }

    else {

        const A = [

            [
                Number(document.getElementById('a11').value),
                Number(document.getElementById('a12').value),
                Number(document.getElementById('a13').value)
            ],

            [
                Number(document.getElementById('a21').value),
                Number(document.getElementById('a22').value),
                Number(document.getElementById('a23').value)
            ],

            [
                Number(document.getElementById('a31').value),
                Number(document.getElementById('a32').value),
                Number(document.getElementById('a33').value)
            ]
        ];

        const B = [

            Number(document.getElementById('b1').value),
            Number(document.getElementById('b2').value),
            Number(document.getElementById('b3').value)
        ];

        return { A, B };
    }
}

// ==========================================
// EXPLICAR DETERMINANTE 2x2
// ==========================================

function explainDet2x2(m) {

    const result =
        (m[0][0] * m[1][1])
        -
        (m[0][1] * m[1][0]);

    return `
        (${m[0][0]} × ${m[1][1]})
        -
        (${m[0][1]} × ${m[1][0]})
        =
        ${result}
    `;
}

// ==========================================
// EXPLICAR DETERMINANTE 3x3
// ==========================================

function explainDet3x3(m) {

    const p1 =
        m[0][0] * m[1][1] * m[2][2];

    const p2 =
        m[0][1] * m[1][2] * m[2][0];

    const p3 =
        m[0][2] * m[1][0] * m[2][1];

    const n1 =
        m[0][2] * m[1][1] * m[2][0];

    const n2 =
        m[0][0] * m[1][2] * m[2][1];

    const n3 =
        m[0][1] * m[1][0] * m[2][2];

    const positive = p1 + p2 + p3;
    const negative = n1 + n2 + n3;

    const total = positive - negative;

    return `
        (${p1} + ${p2} + ${p3})
        -
        (${n1} + ${n2} + ${n3})
        =
        ${positive} - ${negative}
        =
        ${total}
    `;
}

// ==========================================
// RESOLVER CRAMER
// ==========================================

function resolverCramer() {

    const { A, B } = getValues();

    const resultSection =
        document.getElementById('resultSection');

    let html = '';

    // ======================================
    // PASO 1
    // ======================================

    html += `
    
    <div class="step">

        <h3>
            Paso 1: Sistema de ecuaciones
        </h3>

        <p>
            Se obtiene la matriz principal A
            y el vector de resultados B.
        </p>

        <p><strong>Matriz A:</strong></p>

        ${matrixToHTML(A)}

        <br>

        <p><strong>Vector B:</strong></p>

        ${matrixToHTML(B.map(v => [v]))}

    </div>
    `;

    // ======================================
    // DETERMINANTE PRINCIPAL
    // ======================================

    let detA;

    if (currentSize === 2) {

        detA = det2x2(A);

    } else {

        detA = det3x3(A);
    }

    html += `
    
    <div class="step">

        <h3>
            Paso 2: Calcular Δ
        </h3>

        <p>
            Calculamos el determinante
            de la matriz principal.
        </p>

        ${matrixToHTML(A)}

        <br>

        <p>
            <strong>Procedimiento:</strong>
        </p>

        <pre>
${currentSize === 2
    ? explainDet2x2(A)
    : explainDet3x3(A)}
        </pre>

        <p>
            <strong>
                Δ = ${detA}
            </strong>
        </p>

    </div>
    `;

    // ======================================
    // VALIDAR
    // ======================================

    if (detA === 0) {

        html += `
        
        <div class="step error">

            <h3>
                Error
            </h3>

            <p>
                El determinante principal es 0.
            </p>

            <p>
                El sistema no tiene solución única.
            </p>

        </div>
        `;

        resultSection.innerHTML = html;
        return;
    }

    // ======================================
    // VARIABLES
    // ======================================

    const variables =
        currentSize === 2
        ? ['x', 'y']
        : ['x', 'y', 'z'];

    const solutions = [];

    // ======================================
    // CALCULAR VARIABLES
    // ======================================

    for (let i = 0; i < currentSize; i++) {

        const modified =
            replaceColumn(A, i, B);

        let detVariable;

        if (currentSize === 2) {

            detVariable =
                det2x2(modified);

        } else {

            detVariable =
                det3x3(modified);
        }

        // FRACCIÓN

        const fraction =
            simplifyFraction(detVariable, detA);

        solutions.push(fraction);

        html += `
        
        <div class="step">

            <h3>
                Paso ${i + 3}: Calcular Δ${variables[i]}
            </h3>

            <p>
                Se reemplaza la columna de
                <strong>${variables[i]}</strong>
                por el vector de resultados B.
            </p>

            <p>
                Matriz modificada:
            </p>

            ${matrixToHTML(modified)}

            <br>

            <p>
                Ahora calculamos el determinante
                de esta nueva matriz.
            </p>

            <pre>
${currentSize === 2
    ? explainDet2x2(modified)
    : explainDet3x3(modified)}
            </pre>

            <p>
                <strong>
                    Δ${variables[i]} = ${detVariable}
                </strong>
            </p>

            <hr style="
                margin:15px 0;
                border:1px solid rgba(255,255,255,0.08);
            ">

            <p>
                Aplicamos la fórmula:
            </p>

            <pre>
${variables[i]} = Δ${variables[i]} / Δ
            </pre>

            <pre>
${variables[i]} = ${detVariable} / ${detA}
            </pre>

            <p>
                <strong>
                    ${variables[i]} = ${fraction}
                </strong>
            </p>

        </div>
        `;
    }

    // ======================================
    // RESULTADO FINAL
    // ======================================

    html += `
    
    <div class="step solution">

        <h3>
            Solución Final
        </h3>

        <p>
            Después de aplicar la Regla de Cramer,
            obtenemos:
        </p>
    `;

    solutions.forEach((value, index) => {

        html += `
            <p>
                <strong>
                    ${variables[index]} = ${value}
                </strong>
            </p>
        `;
    });

    html += `
        </div>
    `;

    resultSection.innerHTML = html;
}

// ==========================================
// EVENTOS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // BOTÓN CALCULAR

    document
        .getElementById('calcularBtn')
        .addEventListener(
            'click',
            resolverCramer
        );

    // ======================================
    // BOTÓN LIMPIAR
    // ======================================

    const limpiarBtn =
        document.getElementById('limpiarBtn');

    if (limpiarBtn) {

        limpiarBtn.addEventListener('click', () => {

            const inputs = document.querySelectorAll(
                '#inputSection input'
            );

            inputs.forEach(input => {

                input.value = 0;
            });

            document.getElementById('resultSection').innerHTML = `
            
            <div class="placeholder">
                Aquí se mostrarán los pasos detallados para la resolución del sistema.
            </div>
            `;
        });
    }

    // ======================================
    // BOTONES SIDEBAR
    // ======================================

    document
        .querySelectorAll('.size-btn')
        .forEach(button => {

            button.addEventListener('click', (e) => {

                currentSize = Number(
                    e.target.dataset.size
                );

                document
                    .querySelectorAll('.size-btn')
                    .forEach(btn => {

                        btn.classList.remove('active');
                    });

                e.target.classList.add('active');

                renderInputs();

                document.getElementById('resultSection').innerHTML = `
                
                <div class="placeholder">
                    Aquí se mostrarán los pasos detallados para la resolución del sistema.
                </div>
                `;
            });
        });

    // ======================================
    // INICIALIZAR
    // ======================================

    renderInputs();
});