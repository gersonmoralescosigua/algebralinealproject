function determinantApp() {
  return {
    size: 3,
    method: 'auto',
    matrix: [],
    steps: [],
    result: null,

    // NUEVAS PROPIEDADES PARA STEP VIEWER Y HIGHLIGHT
    currentStep: 0,
    highlightMap: [],

    generateMatrix() {
      this.matrix = [];
      for (let i = 0; i < this.size; i++) {
        let row = [];
        for (let j = 0; j < this.size; j++) {
          row.push(0);
        }
        this.matrix.push(row);
      }
    },

    // NUEVOS MÉTODOS DE NAVEGACIÓN
    nextStep() {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
      }
    },
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--;
      }
    },

    // NUEVO: resalta celdas según el mapa
    getHighlightClass(i, j) {
      if (!this.highlightMap.length) return '';
      let cell = this.highlightMap.find(c => c.i === i && c.j === j);
      if (!cell) return '';
      return cell.type === 'pos' ? 'highlight-pos' : 'highlight-neg';
    },

    calculate() {
      // RESETEAR PASO ACTUAL (NUEVO)
      this.currentStep = 0;
      this.steps = [];
      this.result = null;

      if (this.size == 2) {
        if (this.method !== 'auto') {
          this.steps.push("Para matrices 2x2 solo se usa fórmula directa");
        }
        this.calculate2x2();
        return;
      }

      if (this.size == 3) {
        if (this.method === 'sarrus') {
          this.calculateSarrus();
          return;
        }
        this.calculateCofactor3x3();
        return;
      }

      if (this.size == 4) {
        if (this.method === 'sarrus') {
          this.steps.push("Sarrus solo aplica para matrices 3x3");
          return;
        }
        this.calculateCofactor4x4();
        return;
      }
    },

    calculate2x2() {
      let a = this.matrix[0][0];
      let b = this.matrix[0][1];
      let c = this.matrix[1][0];
      let d = this.matrix[1][1];

      this.steps.push(`det = (${a} * ${d}) - (${b} * ${c})`);
      this.result = a * d - b * c;
    },

    // MÉTODO SARRUS MODIFICADO SEGÚN CHATGPT
    calculateSarrus() {
      // Inicializar highlightMap
      this.highlightMap = [];

      // Paso 1: primera diagonal positiva
      this.steps.push("Diagonal positiva principal");
      this.highlightMap = [
        { i: 0, j: 0, type: 'pos' },
        { i: 1, j: 1, type: 'pos' },
        { i: 2, j: 2, type: 'pos' }
      ];

      // Paso 2
      this.steps.push("Segunda diagonal positiva");
      // (Se podría actualizar highlightMap aquí, pero ChatGPT no lo especifica)

      // Paso 3
      this.steps.push("Tercera diagonal positiva");

      // Paso negativos
      this.steps.push("Diagonales negativas");

      // Cálculo numérico (sin mostrar pasos antiguos)
      let m = this.matrix;
      let a = m[0][0], b = m[0][1], c = m[0][2];
      let d = m[1][0], e = m[1][1], f = m[1][2];
      let g = m[2][0], h = m[2][1], i = m[2][2];

      let p1 = a * e * i;
      let p2 = b * f * g;
      let p3 = c * d * h;

      let n1 = c * e * g;
      let n2 = a * f * h;
      let n3 = b * d * i;

      let positive = p1 + p2 + p3;
      let negative = n1 + n2 + n3;
      this.result = positive - negative;

      // Nota: Los pasos detallados de las sumas se han eliminado
      // para cumplir con el nuevo diseño de step viewer.
    },

    calculateCofactor3x3() {
      let m = this.matrix;
      let a = m[0][0], b = m[0][1], c = m[0][2];
      let M11 = m[1][1] * m[2][2] - m[1][2] * m[2][1];
      let M12 = m[1][0] * m[2][2] - m[1][2] * m[2][0];
      let M13 = m[1][0] * m[2][1] - m[1][1] * m[2][0];

      this.steps.push("Expansión por cofactores (fila 1)");
      this.steps.push(`M11 = ${M11}`);
      this.steps.push(`M12 = ${M12}`);
      this.steps.push(`M13 = ${M13}`);

      let term1 = a * M11;
      let term2 = -b * M12;
      let term3 = c * M13;

      this.steps.push(`det = (${a}*${M11}) - (${b}*${M12}) + (${c}*${M13})`);
      this.result = term1 + term2 + term3;
    },

    calculateCofactor4x4() {
      this.steps.push("Cofactores 4x4 en desarrollo...");
      this.result = "—";
    }
  };
}