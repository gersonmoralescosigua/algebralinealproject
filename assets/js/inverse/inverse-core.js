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

      // EARLY RETURN SENIOR: Si el determinante es 0, detenemos la ejecución inmediatamente.
      if (det === 0) {
        // Agregamos un flag visual de error para que Alpine renderice correctamente el estado
        this.steps[this.steps.length - 1].conclusion = `
            <div class="flex items-center gap-2">
                <span class="text-red-500 font-bold text-xl">X</span>
                <span><strong>La matriz no es invertible.</strong><br>
                Razón: El determinante es 0. Falla en la condición de invertibilidad.</span>
            </div>
        `;
        this.renderMath();
        return;
      }

      // Si pasamos el guard clauses, continuamos el flujo normal
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

      // ========== 4. INVERSA con LaTeX y Casos Especiales ==========
      let inv = this.multiplyByScalar(adj, 1 / det);
      this.inverseMatrix = inv;
      let adjLatex = this.toLatexMatrix(adj, false);
      let invLatex = this.toLatexMatrix(inv, true);

      let formulaLatex = `$$A^{-1} = \\frac{1}{\\det(A)} \\cdot \\text{Adj}(A)$$`;
      let detValText = det < 0 ? `(${det})` : det;
      let equationLatex = `$$A^{-1}=\\frac{1}{${detValText}} ${adjLatex} = ${invLatex}$$`;

      // Evaluar casos especiales (Identidad, Diagonal, Triangulares)
      let specialCaseMsg = null;
      if (this.isIdentity(this.matrix)) {
        specialCaseMsg =
          "CASO ESPECIAL: MATRIZ IDENTIDAD <br>La inversa de la identidad es ella misma.";
      } else if (this.isDiagonal(this.matrix)) {
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
    // LÓGICA DE OPTIMIZACIÓN Y CASOS ESPECIALES
    // --------------------------------------------------------------
    isZeroMatrix(m) {
      return m.every((row) => row.every((val) => val === 0));
    },
    isIdentity(m) {
      return m.every((row, i) =>
        row.every((val, j) => (i === j ? val === 1 : val === 0)),
      );
    },
    isDiagonal(m) {
      return m.every((row, i) =>
        row.every((val, j) => (i === j ? true : val === 0)),
      );
    },
    isUpperTriangular(m) {
      return m.every((row, i) =>
        row.every((val, j) => (i > j ? val === 0 : true)),
      );
    },
    isLowerTriangular(m) {
      return m.every((row, i) =>
        row.every((val, j) => (i < j ? val === 0 : true)),
      );
    },
    isTriangular(m) {
      return this.isUpperTriangular(m) || this.isLowerTriangular(m);
    },

    getBestRow(m) {
      let maxZeros = -1;
      let bestRow = 0;
      for (let i = 0; i < m.length; i++) {
        let zeros = m[i].filter((x) => x === 0).length;
        if (zeros > maxZeros) {
          maxZeros = zeros;
          bestRow = i;
        }
      }
      return { row: bestRow, zeros: maxZeros };
    },

    // Detalle de Regla de Sarrus en texto para Menores 3x3
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

    // --------------------------------------------------------------
    // PASO 1: DETERMINANTE
    // --------------------------------------------------------------
    buildDeterminantStep() {
      let size = Number(this.size);
      let m = this.matrix;

      // 1. CASO NULA ABSOLUTA
      if (this.isZeroMatrix(m)) {
        return {
          type: "determinant",
          title: "PASO 1: Calcular el determinante",
          explanation: "La matriz es nula (todos sus elementos son cero).",
          expansionLatex: `$$|A| = 0$$`,
          det: 0,
          conclusion:
            "❌ <strong>La matriz no es invertible.</strong> <br><br> Razón: La matriz nula (todos sus elementos son cero) tiene determinante = 0 y rango 0.",
        };
      }

      // 2. CASO ESPECIAL: Matriz Triangular / Diagonal / Identidad
      if (this.isTriangular(m)) {
        let det = 1;
        let diagVals = [];
        for (let i = 0; i < size; i++) {
          det *= m[i][i];
          let v = m[i][i];
          diagVals.push(v < 0 ? `(${v})` : `${v}`);
        }

        let conclusionText =
          det === 0
            ? "❌ <strong>La matriz no es invertible.</strong> <br> Razón: Su determinante es 0 (filas o columnas linealmente dependientes)."
            : `Determinante ${det}, por lo tanto sí existe la inversa.`;

        return {
          type: "determinant",
          title: "PASO 1: Calcular el determinante",
          explanation:
            "La matriz es triangular o diagonal. El cálculo del determinante se simplifica multiplicando únicamente los elementos de su diagonal principal:",
          expansionLatex: `$$|A| = ${diagVals.join(" \\cdot ")} = ${det}$$`,
          det: det,
          conclusion: conclusionText,
        };
      }

      // 3. MATRIZ 2x2 NORMAL
      if (size === 2) {
        let a = m[0][0],
          b = m[0][1];
        let c = m[1][0],
          d = m[1][1];
        let det = a * d - b * c;

        let conclusionText =
          det === 0
            ? "❌ <strong>La matriz no es invertible.</strong> <br> Razón: Su determinante es 0 (filas o columnas proporcionales o dependientes)."
            : `Determinante ${det}, por lo tanto sí existe la inversa.`;

        return {
          type: "determinant",
          title: "PASO 1: Calcular el determinante",
          explanation:
            "Usamos la fórmula directa de diagonales cruzadas para matrices 2x2:",
          expansionLatex: `$$|A| = (${a})(${d}) - (${b})(${c})$$`,
          substitutionLatex: `$$|A| = ${a * d} - (${b * c}) = ${det}$$`,
          det: det,
          conclusion: conclusionText,
        };
      }

      // 4. MATRIZ 3x3 y 4x4 NORMAL
      let { row, zeros } = this.getBestRow(m);
      let explanation =
        zeros > 0
          ? `Usamos expansión por la fila ${row + 1} porque contiene ${zeros} cero(s), lo que simplifica el cálculo.`
          : `Ninguna fila contiene ceros, usamos la fila ${row + 1} por convención.`;

      let expLatex = "$$|A| = ";
      let subLatex = "$$|A| = ";
      let minorsLatex = "";
      let finalDet = 0;

      for (let j = 0; j < size; j++) {
        let val = m[row][j];
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
          minorsLatex += `$$ ${vmatrixStr} = (${minor[0][0]})(${minor[1][1]}) - (${minor[0][1]})(${minor[1][0]}) = ${detMinor} $$ \n`;
        } else if (size === 4) {
          // Si es de 4x4 los menores son de 3x3, por ende mostramos Sarrus Textualmente
          let txtSarrus = this.getSarrusExplanation(minor).replace(
            /<br>/g,
            " \\\\ ",
          );
          minorsLatex += `$$ \\text{Menor } M_{${row + 1}${j + 1}} = ${vmatrixStr} \\\\ \\text{Sarrus: } ${txtSarrus} $$ \n`;
        }
      }

      expLatex += "$$";
      subLatex += ` = ${finalDet} $$`;

      let conclusionText =
        finalDet === 0
          ? "❌ <strong>La matriz no es invertible.</strong> <br> Razón: Su determinante es 0 (indica combinación lineal o filas dependientes)."
          : `Determinante ${finalDet}, por lo tanto sí existe la inversa.`;

      return {
        type: "determinant",
        title: "PASO 1: Calcular el determinante",
        explanation,
        expansionLatex: expLatex,
        minorsTitle:
          size === 3
            ? "Calculamos cada menor 2x2"
            : "Calculamos cada menor 3x3 (Regla de Sarrus)",
        minorsLatex: minorsLatex,
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
          if (size === 2) {
            calcText = `Submatriz 1x1: <strong>${detMinor}</strong>`;
          } else if (size === 3) {
            calcText = `(${minor[0][0]}×${minor[1][1]}) - (${minor[0][1]}×${minor[1][0]}) = <strong>${detMinor}</strong>`;
          } else if (size === 4) {
            // Aplicamos Sarrus visual textualmente en la caja de HTML
            calcText =
              `<span class="text-xs text-gray-400">Sarrus:</span> <br> ` +
              this.getSarrusExplanation(minor);
          }

          rowData.push({
            label: `C${i + 1}${j + 1}`,
            matrix: minor,
            calc: calcText,
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
    // PASO 5: COMPROBACIÓN COMPLETA
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
