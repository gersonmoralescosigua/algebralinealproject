function inverseApp() {
  return {
    size: 3,
    matrix: [],
    steps: [],
    currentStep: 0,
    resultString: null,
    verificationMode: false,
    inverseMatrix: null,

    generateMatrix() {
      this.matrix = [];
      for (let i = 0; i < this.size; i++) {
        let row = [];
        for (let j = 0; j < this.size; j++) {
          row.push(0);
        }
        this.matrix.push(row);
      }
      this.resetSteps();
    },

    resetSteps() {
      this.steps = [];
      this.currentStep = 0;
      this.resultString = null;
      this.verificationMode = false;
    },

    renderMath() {
      this.$nextTick(() => {
        if (window.MathJax) {
          MathJax.typesetClear();
          MathJax.typesetPromise().catch((err) => console.error(err));
        }
      });
    },

    calculate() {
      this.resetSteps();
      if (!this.validateMatrix()) return;

      // ========== 1. DETERMINANTE ==========
      const detStep = this.buildDeterminantStep();
      this.steps.push(detStep);
      const det = detStep.det;

      // Si la matriz es identidad, terminamos aquí (caso especial completo en Paso 1)
      if (detStep.isIdentityCase) {
        this.renderMath();
        return;
      }

      // EARLY RETURN: Si el determinante es 0, detenemos la ejecución inmediatamente.
      if (det === 0) {
        this.renderMath();
        return;
      }

      // ========== 2. COFACTORES ==========
      const cofactorStep = this.buildCofactorStep();
      this.steps.push(cofactorStep);

      // ========== 3. ADJUNTA ==========
      let cof = this.getCofactorMatrix();
      let adj = this.transpose(cof);

      this.steps.push({
        type: "adjoint",
        title: "Paso 3: Matriz Adjunta (Transpuesta de Cofactores)",
        original: this.formatMatrix(cof),
        result: this.formatMatrix(adj),
        explanation:
          "La adjunta se obtiene intercambiando filas por columnas de la matriz de cofactores.",
      });

      // ========== 4. INVERSA ==========
      let inv = this.multiplyByScalar(adj, 1 / det);
      this.inverseMatrix = inv;
      let adjLatex = this.toLatexMatrix(adj, false);
      let invLatex = this.toLatexMatrix(inv, true);

      let formulaLatex = `$$A^{-1} = \\frac{1}{\\det(A)} \\cdot \\text{Adj}(A)$$`;
      let detValText = det < 0 ? `(${det})` : det;
      let equationLatex = `$$A^{-1}=\\frac{1}{${detValText}} ${adjLatex} = ${invLatex}$$`;

      let specialCaseMsg = null;
      if (this.isDiagonal(this.matrix)) {
        specialCaseMsg =
          "CASO ESPECIAL: MATRIZ DIAGONAL <br>La inversa es otra matriz diagonal. Se calcula invirtiendo cada elemento de la diagonal principal.";
      } else if (this.isUpperTriangular(this.matrix)) {
        specialCaseMsg =
          "CASO ESPECIAL: MATRIZ TRIANGULAR SUPERIOR <br>La inversa mantiene el patrón de ceros.";
      } else if (this.isLowerTriangular(this.matrix)) {
        specialCaseMsg =
          "CASO ESPECIAL: MATRIZ TRIANGULAR INFERIOR <br>La inversa mantiene el patrón de ceros.";
      }

      this.steps.push({
        type: "inverse",
        title: "Paso 4: Matriz Inversa",
        specialCase: specialCaseMsg,
        explanation: `Multiplicamos la matriz adjunta por el escalar 1/det(A):`,
        latex: formulaLatex + equationLatex,
      });

      this.renderMath();
    },

    verify() {
      this.verificationMode = true;
      const verifyStep = this.buildVerificationStep();
      this.steps.push(verifyStep);
      this.nextStep();
    },

    // --------------------------------------------------------------
    // DETECCIÓN DE CASOS ESPECIALES
    // --------------------------------------------------------------
    isZeroMatrix(m) {
      return m.every((row) => row.every((val) => Number(val) === 0));
    },

    isIdentity(m) {
      return m.every((row, i) =>
        row.every((val, j) =>
          i === j ? Number(val) === 1 : Number(val) === 0,
        ),
      );
    },

    isDiagonal(m) {
      return m.every((row, i) =>
        row.every((val, j) => (i === j ? true : Number(val) === 0)),
      );
    },

    isUpperTriangular(m) {
      return m.every((row, i) =>
        row.every((val, j) => (i > j ? Number(val) === 0 : true)),
      );
    },

    isLowerTriangular(m) {
      return m.every((row, i) =>
        row.every((val, j) => (i < j ? Number(val) === 0 : true)),
      );
    },

    isTriangular(m) {
      return this.isUpperTriangular(m) || this.isLowerTriangular(m);
    },

    // Detecta si hay alguna fila completa de ceros
    // Retorna el índice de la primera fila de ceros, o -1 si no hay
    getZeroRowIndex(m) {
      for (let i = 0; i < m.length; i++) {
        if (m[i].every((val) => Number(val) === 0)) return i;
      }
      return -1;
    },

    // Detecta si hay alguna columna completa de ceros
    // Retorna el índice de la primera columna de ceros, o -1 si no hay
    getZeroColIndex(m) {
      let n = m.length;
      for (let j = 0; j < n; j++) {
        if (m.every((row) => Number(row[j]) === 0)) return j;
      }
      return -1;
    },

    // Detecta si dos filas son proporcionales (para det = 0)
    // Retorna objeto { found, i, j, factor } o { found: false }
    getProportionalRows(m) {
      let n = m.length;
      for (let a = 0; a < n; a++) {
        for (let b = a + 1; b < n; b++) {
          let factor = null;
          let proportional = true;
          for (let k = 0; k < n; k++) {
            let va = Number(m[a][k]);
            let vb = Number(m[b][k]);
            if (va === 0 && vb === 0) continue;
            if (va === 0 || vb === 0) {
              proportional = false;
              break;
            }
            let f = vb / va;
            if (factor === null) {
              factor = f;
            } else if (Math.abs(f - factor) > 1e-9) {
              proportional = false;
              break;
            }
          }
          if (proportional && factor !== null)
            return { found: true, i: a, j: b, factor };
        }
      }
      return { found: false };
    },

    // Detecta si dos columnas son proporcionales
    getProportionalCols(m) {
      let n = m.length;
      for (let a = 0; a < n; a++) {
        for (let b = a + 1; b < n; b++) {
          let factor = null;
          let proportional = true;
          for (let k = 0; k < n; k++) {
            let va = Number(m[k][a]);
            let vb = Number(m[k][b]);
            if (va === 0 && vb === 0) continue;
            if (va === 0 || vb === 0) {
              proportional = false;
              break;
            }
            let f = vb / va;
            if (factor === null) {
              factor = f;
            } else if (Math.abs(f - factor) > 1e-9) {
              proportional = false;
              break;
            }
          }
          if (proportional && factor !== null)
            return { found: true, i: a, j: b, factor };
        }
      }
      return { found: false };
    },

    // Construye el mensaje descriptivo de por qué det = 0
    buildDetZeroReason(m) {
      // Prioridad de diagnóstico: nula → fila ceros → columna ceros → filas proporcionales → columnas proporcionales → combinación lineal general
      if (this.isZeroMatrix(m)) {
        return `<strong>La matriz no es invertible.</strong><br>
          Razón: La matriz es <em>nula</em> (todos sus elementos son cero). El determinante es 0 y el rango es 0.`;
      }

      let zr = this.getZeroRowIndex(m);
      if (zr !== -1) {
        return `<strong>La matriz no es invertible.</strong><br>
          Razón: La <em>fila ${zr + 1}</em> es completamente cero. Una fila nula provoca que el determinante sea 0 (las filas son linealmente dependientes).`;
      }

      let zc = this.getZeroColIndex(m);
      if (zc !== -1) {
        return `<strong>La matriz no es invertible.</strong><br>
          Razón: La <em>columna ${zc + 1}</em> es completamente cero. Una columna nula provoca que el determinante sea 0 (las columnas son linealmente dependientes).`;
      }

      let pr = this.getProportionalRows(m);
      if (pr.found) {
        let fStr = this.toFractionText(pr.factor);
        return `<strong>La matriz no es invertible.</strong><br>
          Razón: Las filas <em>${pr.i + 1}</em> y <em>${pr.j + 1}</em> son proporcionales
          (Fila ${pr.j + 1} = ${fStr} × Fila ${pr.i + 1}). Filas proporcionales generan determinante 0 por dependencia lineal.`;
      }

      let pc = this.getProportionalCols(m);
      if (pc.found) {
        let fStr = this.toFractionText(pc.factor);
        return `<strong>La matriz no es invertible.</strong><br>
          Razón: Las columnas <em>${pc.i + 1}</em> y <em>${pc.j + 1}</em> son proporcionales
          (Col ${pc.j + 1} = ${fStr} × Col ${pc.i + 1}). Columnas proporcionales generan determinante 0 por dependencia lineal.`;
      }

      // Caso general: combinación lineal
      return `<strong>La matriz no es invertible.</strong><br>
        Razón: El determinante es 0. Existe una <em>combinación lineal</em> entre las filas (o columnas), lo que indica dependencia lineal y falla en la condición de invertibilidad.`;
    },

    getBestRow(m) {
      let maxZeros = -1;
      let bestRow = 0;
      for (let i = 0; i < m.length; i++) {
        let zeros = m[i].filter((x) => Number(x) === 0).length;
        if (zeros > maxZeros) {
          maxZeros = zeros;
          bestRow = i;
        }
      }
      return { row: bestRow, zeros: maxZeros };
    },

    // Regla de Sarrus: detalle textual (para menores 3x3 en cofactores de 4x4)
    getSarrusExplanation(m) {
      let pos1 = m[0][0] * m[1][1] * m[2][2];
      let pos2 = m[0][1] * m[1][2] * m[2][0];
      let pos3 = m[0][2] * m[1][0] * m[2][1];
      let neg1 = m[0][2] * m[1][1] * m[2][0];
      let neg2 = m[0][0] * m[1][2] * m[2][1];
      let neg3 = m[0][1] * m[1][0] * m[2][2];
      let sumPos = pos1 + pos2 + pos3;
      let sumNeg = neg1 + neg2 + neg3;

      let txt = `[(${m[0][0]}·${m[1][1]}·${m[2][2]}) + (${m[0][1]}·${m[1][2]}·${m[2][0]}) + (${m[0][2]}·${m[1][0]}·${m[2][1]})] <br>`;
      txt += `- [(${m[0][2]}·${m[1][1]}·${m[2][0]}) + (${m[0][0]}·${m[1][2]}·${m[2][1]}) + (${m[0][1]}·${m[1][0]}·${m[2][2]})] <br>`;
      txt += `= [${sumPos}] - [${sumNeg}] = <strong>${sumPos - sumNeg}</strong>`;
      return txt;
    },

    // Genera el HTML visual de la matriz Sarrus extendida (3x5: 3 col originales + 2 copiadas)
    // con las diagonales señalizadas mediante colores
    buildSarrusVisual(m) {
      // m es una matriz 3x3
      // Extendemos con las dos primeras columnas repetidas al final
      // Diagonales positivas: (0,0)→(1,1)→(2,2), (0,1)→(1,2)→(2,3), (0,2)→(1,3)→(2,4)
      // Diagonales negativas: (0,2)→(1,1)→(2,0), (0,3)→(1,2)→(2,1), (0,4)→(1,3)→(2,2)

      const posGroups = [
        [
          [0, 0],
          [1, 1],
          [2, 2],
        ],
        [
          [0, 1],
          [1, 2],
          [2, 3],
        ],
        [
          [0, 2],
          [1, 3],
          [2, 4],
        ],
      ];
      const negGroups = [
        [
          [2, 0],
          [1, 1],
          [0, 2],
        ],
        [
          [2, 1],
          [1, 2],
          [0, 3],
        ],
        [
          [2, 2],
          [1, 3],
          [0, 4],
        ],
      ];

      // Construimos colores por celda (row, col en la matriz extendida 3x5)
      // Una celda puede pertenecer a múltiples diagonales; prioridad: pos = verde, neg = rojo
      // Si pertenece a ambas → naranja
      let posSet = new Set();
      let negSet = new Set();
      posGroups.forEach((g) => g.forEach(([r, c]) => posSet.add(`${r},${c}`)));
      negGroups.forEach((g) => g.forEach(([r, c]) => negSet.add(`${r},${c}`)));

      // Valores extendidos (col 0..4)
      const extVal = (r, c) => {
        if (c < 3) return m[r][c];
        return m[r][c - 3]; // columnas 3 y 4 son copias de 0 y 1
      };

      let pos1 = m[0][0] * m[1][1] * m[2][2];
      let pos2 = m[0][1] * m[1][2] * m[2][0];
      let pos3 = m[0][2] * m[1][0] * m[2][1];
      let neg1 = m[0][2] * m[1][1] * m[2][0];
      let neg2 = m[0][0] * m[1][2] * m[2][1];
      let neg3 = m[0][1] * m[1][0] * m[2][2];
      let sumPos = pos1 + pos2 + pos3;
      let sumNeg = neg1 + neg2 + neg3;
      let det = sumPos - sumNeg;

      let rows = "";
      for (let r = 0; r < 3; r++) {
        let cells = "";
        for (let c = 0; c < 5; c++) {
          let inPos = posSet.has(`${r},${c}`);
          let inNeg = negSet.has(`${r},${c}`);
          let bg = "";
          let border = "";
          if (inPos && inNeg) {
            bg = "background:rgba(234,179,8,0.25);";
            border = "border-color:rgba(234,179,8,0.5);";
          } else if (inPos) {
            bg = "background:rgba(34,197,94,0.2);";
            border = "border-color:rgba(34,197,94,0.4);";
          } else if (inNeg) {
            bg = "background:rgba(239,68,68,0.2);";
            border = "border-color:rgba(239,68,68,0.4);";
          }
          let isExt = c >= 3;
          let opacity = isExt ? "opacity:0.7;" : "";
          let italic = isExt ? "font-style:italic;" : "";
          cells += `<div style="width:48px;height:40px;display:flex;align-items:center;justify-content:center;
            border-radius:8px;border:1px solid rgba(255,255,255,0.08);font-size:0.85rem;font-weight:600;
            ${bg}${border}${opacity}${italic}color:white;">${extVal(r, c)}</div>`;
        }
        rows += `<div style="display:flex;gap:4px;margin-bottom:4px;">${cells}</div>`;
      }

      // Leyenda de diagonales
      let legend = `
        <div style="margin-top:10px;font-size:0.75rem;display:flex;gap:16px;flex-wrap:wrap;">
          <span style="display:flex;align-items:center;gap:4px;">
            <span style="width:12px;height:12px;border-radius:3px;background:rgba(34,197,94,0.3);display:inline-block;"></span>
            <span style="color:#86efac;">Diagonales positivas (+)</span>
          </span>
          <span style="display:flex;align-items:center;gap:4px;">
            <span style="width:12px;height:12px;border-radius:3px;background:rgba(239,68,68,0.3);display:inline-block;"></span>
            <span style="color:#fca5a5;">Diagonales negativas (−)</span>
          </span>
          <span style="display:flex;align-items:center;gap:4px;">
            <span style="width:12px;height:12px;border-radius:3px;background:rgba(234,179,8,0.3);display:inline-block;"></span>
            <span style="color:#fde68a;">Compartida (+/−)</span>
          </span>
        </div>
      `;

      let label = `<div style="font-size:0.7rem;color:#6b7280;margin-bottom:6px;">
        Columnas originales &nbsp;|&nbsp; <em style="opacity:0.6;">Columnas copiadas →</em>
      </div>`;

      let colDivider = `<div style="display:flex;gap:4px;margin-bottom:4px;">
        <div style="width:3*48px;"></div>
      </div>`;

      // Separador visual entre col 2 y 3
      // Lo hacemos con un wrapper flex e insertar un divisor
      let html = `
        <div style="margin-top:12px;">
          ${label}
          <div style="display:inline-block;position:relative;">
            <div style="display:flex;gap:4px;margin-bottom:2px;">
              ${["Col 1", "Col 2", "Col 3", "Col 1'", "Col 2'"]
                .map(
                  (h) =>
                    `<div style="width:48px;text-align:center;font-size:0.65rem;color:#9ca3af;">${h}</div>`,
                )
                .join("")}
            </div>
            <div style="position:relative;">
              ${rows}
              <div style="position:absolute;top:0;bottom:0;left:${3 * 52 - 6}px;width:1px;background:rgba(255,255,255,0.15);border-right:1px dashed rgba(255,255,255,0.25);"></div>
            </div>
          </div>
          ${legend}
          <div style="margin-top:10px;font-size:0.82rem;color:#d1d5db;">
            <strong style="color:#86efac;">Diagonales (+):</strong>
            (${m[0][0]}·${m[1][1]}·${m[2][2]}) + (${m[0][1]}·${m[1][2]}·${m[2][0]}) + (${m[0][2]}·${m[1][0]}·${m[2][1]}) = <strong>${sumPos}</strong><br>
            <strong style="color:#fca5a5;">Diagonales (−):</strong>
            (${m[0][2]}·${m[1][1]}·${m[2][0]}) + (${m[0][0]}·${m[1][2]}·${m[2][1]}) + (${m[0][1]}·${m[1][0]}·${m[2][2]}) = <strong>${sumNeg}</strong><br>
            <strong style="color:white;">Determinante:</strong> ${sumPos} − ${sumNeg} = <strong style="color:#86efac;">${det}</strong>
          </div>
        </div>
      `;

      return html;
    },

    // --------------------------------------------------------------
    // PASO 1: DETERMINANTE
    // --------------------------------------------------------------
    buildDeterminantStep() {
      let size = Number(this.size);
      let m = this.matrix;

      // ── CASO 0: MATRIZ NULA ──
      if (this.isZeroMatrix(m)) {
        let reason = this.buildDetZeroReason(m);
        return {
          type: "determinant",
          title: "PASO 1: Calcular el determinante",
          explanation: "La matriz es nula (todos sus elementos son cero).",
          expansionLatex: `$$|A| = 0$$`,
          det: 0,
          conclusion: `<div class="flex items-center gap-2">
            <span class="text-red-500 font-bold text-xl">✕</span>
            <span>${reason}</span>
          </div>`,
        };
      }

      // ── CASO ESPECIAL: MATRIZ IDENTIDAD ──
      if (this.isIdentity(m)) {
        let identLatex = this.toLatexMatrix(m, false);
        return {
          type: "determinant",
          title: "PASO 1: Calcular el determinante",
          isIdentityCase: true,
          explanation: "La matriz ingresada ES la matriz identidad.",
          expansionLatex: `$$|A| = |I| = 1$$`,
          substitutionTitle: "Caso especial: Inversa de la identidad",
          substitutionLatex: `$$I^{-1} = I \\quad \\Rightarrow \\quad A^{-1} = ${identLatex}$$`,
          det: 1,
          conclusion: `<div>
            <span class="text-green-400 font-bold">✔ CASO ESPECIAL: MATRIZ IDENTIDAD</span><br>
            La inversa de la identidad <strong>es ella misma</strong>: <em>I⁻¹ = I</em>.<br>
            Det(I) = 1. La matriz de cofactores también es la identidad. No es necesario continuar.
          </div>`,
        };
      }

      // ── CASO ESPECIAL: MATRIZ TRIANGULAR / DIAGONAL ──
      if (this.isTriangular(m)) {
        let det = 1;
        let diagVals = [];
        for (let i = 0; i < size; i++) {
          det *= Number(m[i][i]);
          let v = Number(m[i][i]);
          diagVals.push(v < 0 ? `(${v})` : `${v}`);
        }

        let conclusionText;
        if (det === 0) {
          let reason = this.buildDetZeroReason(m);
          conclusionText = `<div class="flex items-start gap-2">
            <span class="text-red-500 font-bold text-xl">✕</span>
            <span>${reason}</span>
          </div>`;
        } else {
          let tipo =
            this.isDiagonal(m) && !this.isIdentity(m)
              ? "diagonal"
              : this.isUpperTriangular(m)
                ? "triangular superior"
                : "triangular inferior";
          conclusionText = `Determinante = <strong>${det}</strong>. La matriz es ${tipo}; el det es el producto de su diagonal. Por lo tanto sí existe la inversa.`;
        }

        return {
          type: "determinant",
          title: "PASO 1: Calcular el determinante",
          explanation:
            "La matriz es triangular o diagonal. El determinante se obtiene multiplicando únicamente los elementos de la diagonal principal:",
          expansionLatex: `$$|A| = ${diagVals.join(" \\cdot ")} = ${det}$$`,
          det: det,
          conclusion: conclusionText,
        };
      }

      // ── CASO 2x2 ──
      if (size === 2) {
        let a = Number(m[0][0]),
          b = Number(m[0][1]);
        let c = Number(m[1][0]),
          d = Number(m[1][1]);
        let det = a * d - b * c;

        let conclusionText;
        if (det === 0) {
          let reason = this.buildDetZeroReason(m);
          conclusionText = `<div class="flex items-start gap-2">
            <span class="text-red-500 font-bold text-xl">✕</span>
            <span>${reason}</span>
          </div>`;
        } else {
          conclusionText = `Determinante = <strong>${det}</strong>. Por lo tanto sí existe la inversa.`;
        }

        return {
          type: "determinant",
          title: "PASO 1: Calcular el determinante",
          explanation:
            "Usamos la fórmula directa para matrices 2×2: |A| = ad − bc",
          expansionLatex: `$$|A| = (${a})(${d}) - (${b})(${c})$$`,
          substitutionLatex: `$$|A| = ${a * d} - (${b * c}) = ${det}$$`,
          det: det,
          conclusion: conclusionText,
        };
      }

      // ── CASO 3x3 y 4x4 ──
      let { row, zeros } = this.getBestRow(m);
      let explanation =
        zeros > 0
          ? `Expansión por la fila ${row + 1} (contiene ${zeros} cero${zeros > 1 ? "s" : ""}, lo que simplifica el cálculo).`
          : `Ninguna fila contiene ceros; usamos la fila ${row + 1} por convención.`;

      let expLatex = "$$|A| = ";
      let subLatex = "$$|A| = ";
      let minorsLatex = "";
      // Para 4x4 guardamos los HTML de Sarrus visual por menor
      let sarrusVisuals = [];
      let finalDet = 0;

      for (let j = 0; j < size; j++) {
        let val = Number(m[row][j]);
        let minor = this.getMinor(m, row, j);
        let detMinor = this.getDet(minor);
        let signNum = (row + j) % 2 === 0 ? 1 : -1;
        let signStr = signNum === 1 ? "+" : "-";

        if (j > 0) {
          expLatex += ` ${signStr} `;
          subLatex += ` ${signStr} `;
        } else {
          if (signNum === -1) {
            expLatex += "- ";
            subLatex += "- ";
          }
        }

        let valStr = val < 0 ? `(${val})` : `${val}`;
        let vmatrixStr = this.toLatexMatrix(minor, false, "vmatrix");

        expLatex += `${valStr} ${vmatrixStr}`;
        subLatex += `${valStr}(${detMinor})`;
        finalDet += signNum * val * detMinor;

        if (size === 3) {
          minorsLatex += `$$ ${vmatrixStr} = (${minor[0][0]})(${minor[1][1]}) - (${minor[0][1]})(${minor[1][0]}) = ${detMinor} $$\n`;
        } else if (size === 4) {
          // Texto de Sarrus para LaTeX
          let txtSarrus = this.getSarrusExplanation(minor).replace(
            /<br>/g,
            " \\\\ ",
          );
          minorsLatex += `$$ \\text{M}_{${row + 1}${j + 1}} = ${vmatrixStr} \\quad \\Rightarrow \\quad \\text{Sarrus: } ${detMinor} $$\n`;
          // Visual Sarrus HTML (guardamos aparte)
          sarrusVisuals.push({
            label: `M<sub>${row + 1}${j + 1}</sub> &nbsp;(elimina fila ${row + 1}, columna ${j + 1})`,
            sign: signStr,
            val: val,
            detMinor: detMinor,
            html: this.buildSarrusVisual(minor),
          });
        }
      }

      expLatex += "$$";
      subLatex += ` = ${finalDet} $$`;

      let conclusionText;
      if (finalDet === 0) {
        let reason = this.buildDetZeroReason(m);
        conclusionText = `<div class="flex items-start gap-2">
          <span class="text-red-500 font-bold text-xl">✕</span>
          <span>${reason}</span>
        </div>`;
      } else {
        conclusionText = `Determinante = <strong>${finalDet}</strong>. Por lo tanto sí existe la inversa.`;
      }

      return {
        type: "determinant",
        title: "PASO 1: Calcular el determinante",
        explanation,
        expansionLatex: expLatex,
        minorsTitle:
          size === 3
            ? "Calculamos cada menor 2×2"
            : "Calculamos cada menor 3×3 (Regla de Sarrus con matriz extendida)",
        minorsLatex: minorsLatex,
        sarrusVisuals: size === 4 ? sarrusVisuals : null,
        substitutionTitle: "Sustituimos en el determinante",
        substitutionLatex: subLatex,
        det: finalDet,
        conclusion: conclusionText,
      };
    },

    // --------------------------------------------------------------
    // PASO 2: COFACTORES
    // --------------------------------------------------------------
    buildCofactorStep() {
      let size = Number(this.size);
      let m = this.matrix;
      let rows = [];
      let cofMatrix = [];

      for (let i = 0; i < size; i++) {
        let rowData = [];
        let cofRow = [];
        for (let j = 0; j < size; j++) {
          let minor = this.getMinor(m, i, j);
          let detMinor = this.getDet(minor);
          let sign = (i + j) % 2 === 0 ? "+" : "-";
          let cofactor = (sign === "+" ? 1 : -1) * detMinor;

          let calcText = "";
          let sarrusHtml = null;
          if (size === 2) {
            calcText = `Submatriz 1×1: <strong>${detMinor}</strong>`;
          } else if (size === 3) {
            calcText = `(${minor[0][0]}×${minor[1][1]}) - (${minor[0][1]}×${minor[1][0]}) = <strong>${detMinor}</strong>`;
          } else if (size === 4) {
            // Para 4x4 usamos el visual gráfico de Sarrus extendido (mismo del Paso 1)
            sarrusHtml = this.buildSarrusVisual(minor);
          }

          rowData.push({
            label: `C${i + 1}${j + 1}`,
            matrix: minor,
            calc: calcText,
            sarrusHtml: sarrusHtml,
            result: `${sign === "-" ? "-" : ""}(${detMinor}) = ${cofactor}`,
          });
          cofRow.push(cofactor);
        }
        rows.push({ title: `Fila ${i + 1}`, items: rowData });
        cofMatrix.push(cofRow);
      }

      return {
        type: "cofactors",
        title: "Paso 2: Construcción de la matriz de cofactores",
        formula:
          "Cada cofactor se calcula como: $C_{ij} = (-1)^{i+j} \\cdot M_{ij}$, donde $M_{ij}$ es el determinante del menor complementario.",
        rows: rows,
        matrixFormatted: this.formatMatrix(cofMatrix),
      };
    },

    // --------------------------------------------------------------
    // PASO 5: COMPROBACIÓN
    // --------------------------------------------------------------
    buildVerificationStep() {
      const n = Number(this.size);
      let verifySteps = [];
      let identityMatrix = Array(n)
        .fill()
        .map(() => Array(n).fill(0));

      let matrixALatex = this.toLatexMatrix(this.matrix, false);
      let matrixInvLatex = this.toLatexMatrix(this.inverseMatrix, true);
      let previewLatex = `$$ A = ${matrixALatex} \\quad A^{-1} = ${matrixInvLatex} $$`;

      for (let i = 0; i < n; i++) {
        let rowTitle = `FILA ${i + 1}`;
        let rowVectorStr = `(${this.matrix[i].join(", ")})`;
        let colsData = [];
        let resultVectorArr = [];

        for (let j = 0; j < n; j++) {
          let calcPieces = [];
          let sum = 0;
          for (let k = 0; k < n; k++) {
            let valA = this.matrix[i][k];
            let valB = this.inverseMatrix[k][j];
            let valBFrac = this.toFractionText(valB);
            calcPieces.push(`${valA}(${valBFrac})`);
            sum += valA * valB;
          }
          sum = Math.round(sum * 100000) / 100000;
          identityMatrix[i][j] = sum;
          resultVectorArr.push(sum);

          colsData.push({
            label: `Columna ${j + 1}:`,
            calc: `$$ ${calcPieces.join(" + ")} = ${sum} $$`,
          });
        }

        verifySteps.push({
          rowTitle,
          rowVector: rowVectorStr,
          cols: colsData,
          resultVector: `(${resultVectorArr.join(", ")})`,
        });
      }

      let idLatex = this.toLatexMatrix(identityMatrix, false);

      return {
        type: "verification",
        title: "PASO 5: COMPROBACIÓN COMPLETA",
        explanation: "Multiplicamos A · A⁻¹",
        previewLatex: previewLatex,
        verifySteps: verifySteps,
        conclusion: "¡Correcto! El producto es la matriz identidad.",
        identityLatex: `$$ A \\cdot A^{-1} = ${idLatex} $$`,
      };
    },

    // --------------------------------------------------------------
    // UTILIDADES MATEMÁTICAS
    // --------------------------------------------------------------
    getDet(m) {
      let n = m.length;
      if (n === 1) return m[0][0];
      if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
      let det = 0;
      for (let j = 0; j < n; j++) {
        let sign = j % 2 === 0 ? 1 : -1;
        det += sign * m[0][j] * this.getDet(this.getMinor(m, 0, j));
      }
      return det;
    },

    getMinor(matrix, row, col) {
      return matrix
        .filter((_, i) => i !== row)
        .map((r) => r.filter((_, j) => j !== col));
    },

    getCofactorMatrix() {
      let n = Number(this.size);
      let cof = [];
      for (let i = 0; i < n; i++) {
        let row = [];
        for (let j = 0; j < n; j++) {
          let sign = (i + j) % 2 === 0 ? 1 : -1;
          row.push(sign * this.getDet(this.getMinor(this.matrix, i, j)));
        }
        cof.push(row);
      }
      return cof;
    },

    transpose(matrix) {
      return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
    },

    multiplyByScalar(matrix, scalar) {
      return matrix.map((row) => row.map((val) => val * scalar));
    },

    formatMatrix(matrix) {
      return matrix.map((row) => row.map((val) => this.toFractionText(val)));
    },

    toFractionText(num) {
      if (Math.abs(Math.round(num) - num) < 1e-6)
        return Math.round(num).toString();
      let sign = num < 0 ? "-" : "";
      let val = Math.abs(num);
      let bestN = 1,
        bestD = 1;
      for (let d = 1; d <= 1000; d++) {
        let n = Math.round(val * d);
        if (Math.abs(val - n / d) < 1e-6) {
          bestN = n;
          bestD = d;
          break;
        }
      }
      return `${sign}${bestN}/${bestD}`;
    },

    toLatexMatrix(matrix, convertFractions = false, type = "bmatrix") {
      let rows = matrix
        .map((row) => {
          return row
            .map((val) => {
              if (!convertFractions) return val;
              let textVal = this.toFractionText(val);
              if (textVal.includes("/")) {
                let parts = textVal.split("/");
                let sign = parts[0].startsWith("-") ? "-" : "";
                let numPart = parts[0].replace("-", "");
                return `${sign}\\frac{${numPart}}{${parts[1]}}`;
              }
              return textVal;
            })
            .join(" & ");
        })
        .join(" \\\\ ");
      return `\\begin{${type}} ${rows} \\end{${type}}`;
    },

    validateMatrix() {
      for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
          if (this.matrix[i][j] === "" || isNaN(this.matrix[i][j])) {
            alert(
              "⚠️ Revisa los valores ingresados. La matriz contiene vacíos.",
            );
            return false;
          }
        }
      }
      return true;
    },

    nextStep() {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
        this.renderMath();
      }
    },

    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--;
        if (this.verificationMode && this.currentStep < this.steps.length - 1) {
          this.verificationMode = false;
          this.steps.pop();
        }
        this.renderMath();
      }
    },
  };
}
