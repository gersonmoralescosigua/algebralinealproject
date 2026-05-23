function determinantApp() {
  return {
    size: 3,
    method: 'auto',
    matrix: [],
    steps: [],
    result: null,
    visualSteps: [],
    calculatedMethod: null,

    init() {
      this.generateMatrix();

      this.$watch('size', (val) => {
        this.generateMatrix();
        this.resetState();
        if (val !== 3 && this.method === 'sarrus') {
          this.method = 'auto';
        }
      });

      this.$watch('method', () => {
        this.resetState();
      });
    },

    resetState() {
      this.steps = [];
      this.visualSteps = [];
      this.result = null;
      this.calculatedMethod = null;
    },

    generateMatrix() {
      this.matrix = Array.from({ length: this.size }, () => Array(this.size).fill(0));
    },

    getInlineStyle(i, visualJ) {
      let style = '';
      if (this.calculatedMethod === 'sarrus' && visualJ > 2) {
        style += 'opacity: 0.6; pointer-events: none; ';
      }
      return style;
    },

    getCellClass(i, j, activeArray = []) {
      let active = activeArray.find(cell => cell.i === i && cell.j === j);
      if (!active) return '';

      let classes = '';
      if (active.type === 'positive') classes = 'cell-positive ';
      else if (active.type === 'negative') classes = 'cell-negative ';
      else if (active.type === 'both') classes = 'cell-both ';

      if (i === 1) {
        if (active.type === 'positive') classes += 'sarrus-line-pos';
        else if (active.type === 'negative') classes += 'sarrus-line-neg';
        else if (active.type === 'both') classes += 'sarrus-line-both';
      }

      return classes.trim();
    },

    validateMatrix(m) {
      return m.every(row => row.every(val => !isNaN(val) && val !== null && val !== ""));
    },

    detectSpecialCases(m) {
      const n = this.size;

      for (let i = 0; i < n; i++) {
        if (m[i].every(val => val === 0)) {
          this.steps.push(`<b>Propiedad 1:</b> La fila ${i + 1} está compuesta solo por ceros. Por lo tanto, el determinante es 0.`);
          return true;
        }
        let colIsZero = true;
        for (let j = 0; j < n; j++) {
          if (m[j][i] !== 0) colIsZero = false;
        }
        if (colIsZero) {
          this.steps.push(`<b>Propiedad 1:</b> La columna ${i + 1} está compuesta solo por ceros. Por lo tanto, el determinante es 0.`);
          return true;
        }
      }

      for (let i = 0; i < n; i++) {
        for (let k = i + 1; k < n; k++) {
          let ratio = null;
          let isProportional = true;

          for (let j = 0; j < n; j++) {
            if (m[k][j] === 0 && m[i][j] === 0) continue;
            if (m[k][j] === 0 || m[i][j] === 0) { isProportional = false; break; }
            if (ratio === null) ratio = m[i][j] / m[k][j];
            else if (m[i][j] / m[k][j] !== ratio) { isProportional = false; break; }
          }

          if (isProportional) {
            if (ratio === 1) {
              this.steps.push(`<b>Propiedad 5:</b> La fila ${i + 1} y la fila ${k + 1} son iguales. El determinante es 0.`);
            } else {
              this.steps.push(`<b>Propiedad 6:</b> La fila ${i + 1} es un múltiplo escalar de la fila ${k + 1}. El determinante es 0.`);
            }
            return true;
          }
        }
      }

      let isUpper = true, isLower = true;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i > j && m[i][j] !== 0) isUpper = false;
          if (i < j && m[i][j] !== 0) isLower = false;
        }
      }

      if (isUpper || isLower) {
        let diagProduct = 1;
        let calcStr = [];
        for (let i = 0; i < n; i++) {
          diagProduct *= m[i][i];
          calcStr.push(m[i][i]);
        }
        let type = (isUpper && isLower) ? "diagonal" : (isUpper ? "triangular superior" : "triangular inferior");
        this.steps.push(`Dado que es una matriz <b>${type}</b>, el determinante es el producto de su diagonal principal:<br>det = ${calcStr.join(' × ')} = ${diagProduct}`);
        this.result = diagProduct;
        return "solved";
      }

      return false;
    },

    findBestExpansion(m) {
      let bestScore = -Infinity;
      let best = { type: 'row', index: 0 };

      const scoreArray = (arr) => {
        let score = 0;
        arr.forEach(val => {
          if (val === 0) score += 100;
          else if (val === 1 || val === -1) score += 10;
          else if (val > 0 && val <= 5) score += 5;
          else if (val < 0) score -= 2;
          score -= Math.abs(val) * 0.1;
        });
        return score;
      };

      for (let i = 0; i < m.length; i++) {
        let score = scoreArray(m[i]);
        if (score > bestScore) { bestScore = score; best = { type: 'row', index: i }; }
      }
      for (let j = 0; j < m.length; j++) {
        let col = [];
        for (let i = 0; i < m.length; i++) col.push(m[i][j]);
        let score = scoreArray(col);
        if (score > bestScore) { bestScore = score; best = { type: 'col', index: j }; }
      }
      return best;
    },

    renderVisualMiniMatrix(m) {
      let html = '<div class="mini-matrix-bracket">';
      html += '<div class="mini-matrix-grid">';
      m.forEach(row => {
        html += '<div class="mini-matrix-row">';
        row.forEach(val => {
          html += `<div class="mini-matrix-cell"><span>${val}</span></div>`;
        });
        html += '</div>';
      });
      html += '</div></div>';
      return html;
    },

    getSubMatrix(m, omitRow, omitCol) {
      return m.filter((row, r) => r !== omitRow).map(row => row.filter((val, c) => c !== omitCol));
    },

    getDet(m) {
      if (m.length === 2) return (m[0][0] * m[1][1]) - (m[0][1] * m[1][0]);
      let det = 0;
      for (let j = 0; j < m.length; j++) {
        det += m[0][j] * Math.pow(-1, 0 + j) * this.getDet(this.getSubMatrix(m, 0, j));
      }
      return det;
    },

    // ─────────────────────────────────────────────────────────────────
    // HELPER: Build a styled arithmetic desglose term for 2x2 breakdown
    // ─────────────────────────────────────────────────────────────────
    buildDesgloseTermHTML(effectiveCoeff, subM, isFirst) {
      let a = subM[0][0], b = subM[0][1], cc = subM[1][0], d = subM[1][1];
      let isCoeffPos = effectiveCoeff >= 0;

      let connector = '';
      if (!isFirst) {
        connector = `<span class="arith-connector">${isCoeffPos ? '+' : '−'}</span>`;
      } else if (!isCoeffPos) {
        connector = `<span class="arith-connector-neg">−</span>`;
      }

      let absCoeff = Math.abs(effectiveCoeff);
      let coefHtml = absCoeff !== 1
        ? `<span class="arith-coef ${isCoeffPos ? 'coef-pos' : 'coef-neg'}">${absCoeff}</span>`
        : '';

      return `
        <div class="arith-term-wrapper">
          ${connector}
          <div class="arith-term ${isCoeffPos ? 'arith-term-pos' : 'arith-term-neg'}">
            ${coefHtml}
            <div class="arith-det-inner">
              <span class="det-product det-product-a">${a}&thinsp;×&thinsp;${d}</span>
              <span class="det-op-sym"> − </span>
              <span class="det-product det-product-b">${b}&thinsp;×&thinsp;${cc}</span>
            </div>
          </div>
        </div>
      `;
    },

    // ─────────────────────────────────────────────────────────────────
    // HELPER: Build a colored result pill
    // ─────────────────────────────────────────────────────────────────
    buildResultPillHTML(termValue, isFirst) {
      let isPos = termValue >= 0;
      let display = isFirst
        ? `${termValue}`
        : (isPos ? `+${termValue}` : `${termValue}`);
      return `<div class="result-pill ${isPos ? 'result-pill-pos' : 'result-pill-neg'}">${display}</div>`;
    },

    // ─────────────────────────────────────────────────────────────────
    // CÁLCULO PRINCIPAL
    // ─────────────────────────────────────────────────────────────────
    calculate() {
      this.resetState();
      let m = this.matrix.map(row => row.map(val => Number(val)));

      if (!this.validateMatrix(m)) {
        this.steps.push("Por favor completa la matriz con números válidos.");
        return;
      }

      let specialCheck = this.detectSpecialCases(m);
      if (specialCheck === true) {
        this.result = 0; return;
      } else if (specialCheck === "solved") {
        return;
      }

      if (this.size === 2) {
        this.calculatedMethod = 'Fórmula directa 2x2';
        this.calculate2x2(m);
      } else if (this.size === 3) {
        if (this.method === 'sarrus') {
          this.calculatedMethod = 'sarrus';
          this.calculateSarrus(m);
        } else {
          this.calculatedMethod = 'cofactor';
          this.calculateCofactors(m);
        }
      } else if (this.size === 4) {
        this.calculatedMethod = 'cofactor';
        this.calculateCofactors(m);
      }
    },

    calculate2x2(m) {
      let det = (m[0][0] * m[1][1]) - (m[0][1] * m[1][0]);
      this.steps.push(`Para matrices 2×2 aplicamos la definición:<br>det A = (a₁₁ × a₂₂) − (a₁₂ × a₂₁)<br>det A = (${m[0][0]} × ${m[1][1]}) − (${m[0][1]} × ${m[1][0]})`);
      this.result = det;
    },

    getDisplayColumns() {
      if (this.size === 3 && this.calculatedMethod === 'sarrus') {
        return [0, 1, 2, 0, 1];
      }
      return Array.from({ length: this.size }, (_, i) => i);
    },

    // ─────────────────────────────────────────────────────────────────
    // SARRUS — SIN CAMBIOS
    // ─────────────────────────────────────────────────────────────────
    calculateSarrus(m) {
      let a = m[0][0], b = m[0][1], c = m[0][2];
      let d = m[1][0], e = m[1][1], f = m[1][2];
      let g = m[2][0], h = m[2][1], i = m[2][2];

      let pos1 = a*e*i, pos2 = b*f*g, pos3 = c*d*h;
      let neg1 = c*e*g, neg2 = a*f*h, neg3 = b*d*i;

      this.steps = [
        `<b>Multiplicamos las diagonales positivas (izquierda a derecha):</b><br>D₁ = (${a} × ${e} × ${i}) = ${pos1}<br>D₂ = (${b} × ${f} × ${g}) = ${pos2}<br>D₃ = (${c} × ${d} × ${h}) = ${pos3}`,
        `<b>Multiplicamos las diagonales negativas (derecha a izquierda):</b><br>D₄ = (${c} × ${e} × ${g}) = ${neg1}<br>D₅ = (${a} × ${f} × ${h}) = ${neg2}<br>D₆ = (${b} × ${d} × ${i}) = ${neg3}`,
        `<b>Sumamos las positivas y restamos las negativas:</b><br>det = (${pos1} + ${pos2} + ${pos3}) − (${neg1} + ${neg2} + ${neg3})`
      ];

      this.visualSteps = [
        [
          {i:0, j:0, type:'positive'}, {i:1, j:1, type:'positive'}, {i:2, j:2, type:'positive'},
          {i:0, j:1, type:'positive'}, {i:1, j:2, type:'positive'}, {i:2, j:3, type:'positive'},
          {i:0, j:2, type:'positive'}, {i:1, j:3, type:'positive'}, {i:2, j:4, type:'positive'}
        ],
        [
          {i:0, j:2, type:'negative'}, {i:1, j:1, type:'negative'}, {i:2, j:0, type:'negative'},
          {i:0, j:3, type:'negative'}, {i:1, j:2, type:'negative'}, {i:2, j:1, type:'negative'},
          {i:0, j:4, type:'negative'}, {i:1, j:3, type:'negative'}, {i:2, j:2, type:'negative'}
        ],
        [
          {i:0, j:0, type:'positive'}, {i:0, j:1, type:'positive'}, {i:0, j:2, type:'both'}, {i:0, j:3, type:'negative'}, {i:0, j:4, type:'negative'},
          {i:1, j:1, type:'both'}, {i:1, j:2, type:'both'}, {i:1, j:3, type:'both'},
          {i:2, j:0, type:'negative'}, {i:2, j:1, type:'negative'}, {i:2, j:2, type:'both'}, {i:2, j:3, type:'positive'}, {i:2, j:4, type:'positive'}
        ]
      ];

      this.result = (pos1 + pos2 + pos3) - (neg1 + neg2 + neg3);
    },

    // ─────────────────────────────────────────────────────────────────
    // CONTROLADOR COFACTORES
    // ─────────────────────────────────────────────────────────────────
    calculateCofactors(m) {
      let best = this.findBestExpansion(m);
      let isRow = best.type === 'row';
      let idx = best.index;

      this.steps.push(
        `<p><b>Paso 1: Seleccionar la mejor ruta</b><br>
        Analizando la matriz, la <b>${isRow ? 'fila' : 'columna'} ${idx + 1}</b> es la más óptima para expandir.
        El motor ha elegido esta ubicación porque minimiza la complejidad de las operaciones priorizando ceros y valores absolutos pequeños.</p>`
      );

      if (this.size === 3) {
        this.expand3x3(m, "A", true);
      } else if (this.size === 4) {
        this.expand4x4(m);
      }
    },

    // ─────────────────────────────────────────────────────────────────
    // DESGLOSE 3×3 — versión embelecida
    // ─────────────────────────────────────────────────────────────────
    expand3x3(m, name = "A", isMain = true) {
      let best = this.findBestExpansion(m);
      let isRow = best.type === 'row';
      let idx = best.index;

      let partsPlanteamiento = [];
      let termsData = [];
      let finalDet = 0;

      for (let k = 0; k < m.length; k++) {
        let r = isRow ? idx : k;
        let c = isRow ? k : idx;
        let val = m[r][c];

        if (val === 0) continue;

        let sign = Math.pow(-1, r + c);
        let effectiveCoeff = val * sign;
        let subM = this.getSubMatrix(m, r, c);
        let detSubM = this.getDet(subM);
        let termValue = effectiveCoeff * detSubM;
        finalDet += termValue;

        // Planteamiento line (mini matrix visuals) — same logic as before
        let planteCount = partsPlanteamiento.length;
        let planteOp = planteCount > 0 ? (sign === 1 ? ' + ' : ' − ') : (sign === 1 ? '' : '−');
        let planteValStr = (val < 0 && planteCount > 0) ? `(${val})` : val;

        partsPlanteamiento.push(`
          <div class="equation-term">
            <span class="term-coef">${planteOp}${planteValStr}</span>
            ${this.renderVisualMiniMatrix(subM)}
          </div>
        `);

        termsData.push({ effectiveCoeff, subM, termValue });
      }

      // ── Línea de desglose (multiplicaciones 2×2 estilizadas) ──
      let desgloseTerms = [];
      let resultPills = [];

      if (termsData.length === 0) {
        desgloseTerms = ['<span class="arith-zero">0</span>'];
        resultPills  = ['<div class="result-pill result-pill-pos">0</div>'];
      } else {
        termsData.forEach((t, i) => {
          desgloseTerms.push(this.buildDesgloseTermHTML(t.effectiveCoeff, t.subM, i === 0));
          resultPills.push(this.buildResultPillHTML(t.termValue, i === 0));
        });
      }

      // ── Label de la ecuación ──
      // Para sub-procedimientos (isMain = false), name es HTML con <sub>
      // p.ej. "M<sub>41</sub>" — se renderiza limpio en el innerHTML
      let labelStr = isMain ? 'det(A)' : `det(${name})`;

      let htmlStr = `<div class="visual-equation-container">`;

      // Línea 1: Planteamiento con mini-matrices
      if (partsPlanteamiento.length > 0) {
        htmlStr += `<div class="visual-equation-line">
          <span class="equation-label">${labelStr} =</span>
          ${partsPlanteamiento.join('')}
        </div>`;
      }

      // Línea 2: Desglose aritmético de los 2×2
      htmlStr += `<div class="visual-equation-line arith-desglose-line">
        <span class="equation-label">=</span>
        <div class="arith-terms-row">${desgloseTerms.join('')}</div>
      </div>`;

      // Línea 3: Valores parciales como pills
      htmlStr += `<div class="visual-equation-line arith-pills-line">
        <span class="equation-label">=</span>
        <div class="arith-pills-row">${resultPills.join('')}</div>
      </div>`;

      // Línea 4: Resultado final
      htmlStr += `<div class="visual-equation-line result-final-line">
        <span class="equation-label">=</span>
        <span class="result-value-display">${finalDet}</span>
      </div>`;

      htmlStr += `</div>`;

      if (isMain) {
        this.steps.push(
          `<p><b>Paso 2: Expansión por cofactores — menores 2×2</b><br>
          Sustituimos los determinantes de las submatrices eliminando la fila y columna de cada pivote:</p>
          ${htmlStr}`
        );
        this.result = finalDet;
      } else {
        // Sub-procedimiento (llamado desde expand4x4): solo el bloque visual
        this.steps.push(htmlStr);
      }

      return finalDet;
    },

    // ─────────────────────────────────────────────────────────────────
    // DESGLOSE 4×4 — sin LaTeX, con cabeceras limpias
    // ─────────────────────────────────────────────────────────────────
    expand4x4(m) {
      let best = this.findBestExpansion(m);
      let isRow = best.type === 'row';
      let idx = best.index;

      let partsPlanteamiento = [];
      let subCalculations = [];

      for (let k = 0; k < 4; k++) {
        let r = isRow ? idx : k;
        let c = isRow ? k : idx;
        let val = m[r][c];

        if (val === 0) continue;

        let sign = Math.pow(-1, r + c);
        let subM = this.getSubMatrix(m, r, c);
        let detSubM = this.getDet(subM);

        let planteCount = partsPlanteamiento.length;
        let planteOp = planteCount > 0 ? (sign === 1 ? ' + ' : ' − ') : (sign === 1 ? '' : '−');
        let planteValStr = (val < 0 && planteCount > 0) ? `(${val})` : val;

        partsPlanteamiento.push(`
          <div class="equation-term">
            <span class="term-coef">${planteOp}${planteValStr}</span>
            ${this.renderVisualMiniMatrix(subM)}
          </div>
        `);

        // Nombre del menor: HTML limpio con <sub>, sin LaTeX ni llaves
        let minorName = `M<sub>${r + 1}${c + 1}</sub>`;

        subCalculations.push({
          matrix: subM,
          val,
          sign,
          effectiveCoeff: val * sign,
          det: detSubM,
          name: minorName,
          isFirst: subCalculations.length === 0
        });
      }

      if (partsPlanteamiento.length === 0) {
        partsPlanteamiento = ['<span class="arith-zero">0</span>'];
      }

      // Paso 2: Planteamiento estructural
      let htmlPlanteamiento = `<div class="visual-equation-container">
        <div class="visual-equation-line">
          <span class="equation-label">det(A) =</span>
          ${partsPlanteamiento.join('')}
        </div>
      </div>`;

      this.steps.push(
        `<p><b>Paso 2: Planteamiento de la expansión estructural</b><br>
        Descomponemos la matriz 4×4 en sus menores de 3×3, uno por cada pivote de la fila/columna seleccionada:</p>
        ${htmlPlanteamiento}`
      );

      // Pasos 3…N: Un par de steps por cada menor (cabecera + expansión)
      subCalculations.forEach((sub) => {
        // Cabecera del menor — completamente limpia, sin sintaxis de programación
        this.steps.push(`
          <div class="minor-header-block">
            <div class="minor-badge-row">
              <span class="minor-icon">Δ</span>
              <span class="minor-title">Evaluación del menor ${sub.name}</span>
            </div>
            <p class="minor-desc">
              Calculamos el determinante de esta submatriz de 3×3 eliminando la fila y columna del pivote
              <b>${sub.val < 0 ? '(' + sub.val + ')' : sub.val}</b>.
              Signo del cofactor: <span class="${sub.sign === 1 ? 'sign-pos' : 'sign-neg'}">${sub.sign === 1 ? '+1' : '−1'}</span>
            </p>
          </div>
        `);

        // Expansión 3×3 del menor (usa la versión embellecida)
        this.expand3x3(sub.matrix, sub.name, false);
      });

      // Paso final: Sustitución de resultados
      let subsTerms = [];
      let subsPills = [];
      let finalDet = 0;

      subCalculations.forEach((sub, i) => {
        let termValue = sub.effectiveCoeff * sub.det;
        finalDet += termValue;
        let isPos = termValue >= 0;
        let isFirst = i === 0;

        let connector = '';
        if (!isFirst) {
          connector = `<span class="arith-connector">${isPos ? '+' : '−'}</span>`;
        } else if (!isPos) {
          connector = `<span class="arith-connector-neg">−</span>`;
        }

        let absCoeff = Math.abs(sub.effectiveCoeff);

        subsTerms.push(`
          <div class="arith-term-wrapper">
            ${connector}
            <div class="arith-term ${isPos ? 'arith-term-pos' : 'arith-term-neg'}">
              <span class="arith-coef ${isPos ? 'coef-pos' : 'coef-neg'}">${absCoeff}</span>
              <span class="arith-mul-dot">·</span>
              <div class="subs-det-badge ${isPos ? 'subs-badge-pos' : 'subs-badge-neg'}">
                det(${sub.name}) = <b>${sub.det}</b>
              </div>
            </div>
          </div>
        `);

        subsPills.push(this.buildResultPillHTML(termValue, isFirst));
      });

      if (subsTerms.length === 0) {
        subsTerms = ['<span class="arith-zero">0</span>'];
        subsPills = ['<div class="result-pill result-pill-pos">0</div>'];
      }

      let finalHtml = `
        <div class="visual-equation-container">
          <p style="margin-bottom:1.25rem;">
            <b>Sustitución de los determinantes calculados</b><br>
            Reemplazamos cada menor con su valor numérico en la ecuación de expansión:
          </p>

          <div class="visual-equation-line arith-desglose-line">
            <span class="equation-label">det(A) =</span>
            <div class="arith-terms-row">${subsTerms.join('')}</div>
          </div>

          <div class="visual-equation-line arith-pills-line">
            <span class="equation-label">=</span>
            <div class="arith-pills-row">${subsPills.join('')}</div>
          </div>

          <div class="visual-equation-line result-final-line">
            <span class="equation-label">=</span>
            <span class="result-value-display">${finalDet}</span>
          </div>
        </div>
      `;

      this.steps.push(finalHtml);
      this.result = finalDet;
    }
  };
}