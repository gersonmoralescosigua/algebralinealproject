
let currentSize = 2;

// ==========================================
// GENERAR MATRIZ DINÁMICA
// ==========================================

function renderInputs() {

    const section = document.getElementById('inputSection');

    // =========================
    // MATRIZ 2x2
    // =========================

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

    // =========================
    // MATRIZ 3x3
    // =========================

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
                        <input type="number" id="a13" value="-1">
                    </td>

                    <td>
                        <input type="number" id="b1" value="3">
                    </td>
                </tr>

                <tr>
                    <td>Ecuación 2</td>

                    <td>
                        <input type="number" id="a21" value="1">
                    </td>

                    <td>
                        <input type="number" id="a22" value="-1">
                    </td>

                    <td>
                        <input type="number" id="a23" value="1">
                    </td>

                    <td>
                        <input type="number" id="b2" value="1">
                    </td>
                </tr>

                <tr>
                    <td>Ecuación 3</td>

                    <td>
                        <input type="number" id="a31" value="3">
                    </td>

                    <td>
                        <input type="number" id="a32" value="2">
                    </td>

                    <td>
                        <input type="number" id="a33" value="1">
                    </td>

                    <td>
                        <input type="number" id="b3" value="6">
                    </td>
                </tr>

            </table>

        </div>
        `;
    }
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
// CONVERTIR MATRIZ A TEXTO
// ==========================================

function matrixToHTML(matrix) {

    return matrix.map(row => {

        return `
            <div>
                [ ${row.join(' , ')} ]
            </div>
        `;

    }).join('');
}

// ==========================================
// RESOLVER CRAMER
// ==========================================

function resolverCramer() {

    const { A, B } = getValues();

    const resultSection = document.getElementById('resultSection');

    let html = '';

    // ==================================
    // DETERMINANTE PRINCIPAL
    // ==================================

    let detA;

    if (currentSize === 2) {

        detA = det2x2(A);

    } else {

        detA = det3x3(A);
    }

    html += `
    
    <div class="step">

        <h3>Paso 1: Determinante principal Δ</h3>

        <p>Matriz principal:</p>

        <pre>${matrixToHTML(A)}</pre>

        <p>
            Δ = ${detA.toFixed(4)}
        </p>

    </div>
    `;

    // ==================================
    // VALIDAR
    // ==================================

    if (detA === 0) {

        html += `
        
        <div class="step error">

            <h3>Error</h3>

            <p>
                El determinante es 0.
                El sistema no tiene solución única.
            </p>

        </div>
        `;

        resultSection.innerHTML = html;
        return;
    }

    // ==================================
    // VARIABLES
    // ==================================

    const variables = currentSize === 2
        ? ['x', 'y']
        : ['x', 'y', 'z'];

    const solutions = [];

    // ==================================
    // CALCULAR VARIABLES
    // ==================================

    for (let i = 0; i < currentSize; i++) {

        const modified = replaceColumn(A, i, B);

        let detVariable;

        if (currentSize === 2) {

            detVariable = det2x2(modified);

        } else {

            detVariable = det3x3(modified);
        }

        const solution = detVariable / detA;

        solutions.push(solution);

        html += `
        
        <div class="step">

            <h3>
                Paso ${i + 2}: Calcular Δ${variables[i]}
            </h3>

            <p>
                Reemplazamos la columna de ${variables[i]}
                por los términos independientes.
            </p>

            <pre>
${matrixToHTML(modified)}
            </pre>

            <p>
                Δ${variables[i]} = ${detVariable.toFixed(4)}
            </p>

            <p>
                ${variables[i]} =
                Δ${variables[i]} / Δ
            </p>

            <p>
                ${variables[i]} =
                ${detVariable.toFixed(4)}
                /
                ${detA.toFixed(4)}
            </p>

            <p>
                <strong>
                    ${variables[i]} = ${solution.toFixed(4)}
                </strong>
            </p>

        </div>
        `;
    }

    // ==================================
    // RESULTADO FINAL
    // ==================================

    html += `
    
    <div class="step solution">

        <h3>
            Solución Final
        </h3>
    `;

    solutions.forEach((value, index) => {

        html += `
            <p>
                ${variables[index]} = 
                <strong>${value.toFixed(4)}</strong>
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
        .addEventListener('click', resolverCramer);

    // BOTONES SIDEBAR

    document
        .querySelectorAll('.size-btn')
        .forEach(button => {

            button.addEventListener('click', (e) => {

                currentSize = Number(
                    e.target.dataset.size
                );

                // ACTIVAR BOTÓN

                document
                    .querySelectorAll('.size-btn')
                    .forEach(btn => {
                        btn.classList.remove('active');
                    });

                e.target.classList.add('active');

                // GENERAR MATRIZ

                renderInputs();

                // LIMPIAR RESULTADOS

                document.getElementById('resultSection').innerHTML = `
                
                <div class="placeholder">
                    Aquí se mostrarán los pasos detallados...
                </div>
                `;
            });
        });

    // INICIALIZAR

    renderInputs();
});