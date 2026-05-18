function determinantApp() {
  return {
    size: 3,
    method: 'auto',
    matrix: [],
    steps: [],
    result: null,
    currentStep: 0,
    visualSteps: [],
    activeCells: [],

    init() {
      this.generateMatrix();
      
      this.$watch('size', (val) => {
        this.generateMatrix();
        this.resetState();
        if (val !== 3 && this.method === 'sarrus') {
          this.method = 'auto';
        }
      });
    },

    resetState() {
      this.steps = [];
      this.visualSteps = [];
      this.currentStep = 0;
      this.result = null;
      this.activeCells = [];
    },

    generateMatrix() {
      this.matrix = Array.from({ length: this.size }, () => Array(this.size).fill(0));
    },

    nextStep() {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
        this.updateVisualStep();
      }
    },

    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--;
        this.updateVisualStep();
      }
    },

    updateVisualStep() {
      if (this.visualSteps[this.currentStep]) {
        this.activeCells = this.visualSteps[this.currentStep];
      } else {
        this.activeCells = [];
      }
    },

    getInlineStyle(i, visualJ) {
      let style = '';

      if (visualJ > 2) {
        style += 'opacity: 0.6; pointer-events: none; ';
      }
      return style;
    },

    getCellClass(i, j) {
      let active = this.activeCells.find(cell => cell.i === i && cell.j === j);
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
            if (m[k][j] === 0 || m[i][j] === 0) {
              isProportional = false; break;
            }
            if (ratio === null) ratio = m[i][j] / m[k][j];
            else if (m[i][j] / m[k][j] !== ratio) {
              isProportional = false; break;
            }
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
        this.steps.push(`Dado que es una matriz <b>${type}</b>, el determinante es el producto de su diagonal principal:<br> det = ${calcStr.join(' * ')} = ${diagProduct}`);
        this.result = diagProduct;
        return "solved";
      }

      return false;
    },

    findBestExpansion(m) {
      let maxZeros = -1;
      let best = { type: 'row', index: 0 };

      for (let i = 0; i < this.size; i++) {
        let zeros = m[i].filter(v => v === 0).length;
        if (zeros > maxZeros) { maxZeros = zeros; best = { type: 'row', index: i }; }
      }
      for (let j = 0; j < this.size; j++) {
        let zeros = 0;
        for (let i = 0; i < this.size; i++) { if (m[i][j] === 0) zeros++; }
        if (zeros > maxZeros) { maxZeros = zeros; best = { type: 'col', index: j }; }
      }
      return best;
    },

    calculate() {
      this.resetState();

      let m = this.matrix.map(row => row.map(val => Number(val)));

      if (!this.validateMatrix(m)) {
        this.steps.push("Por favor completa la matriz con números válidos.");
        return;
      }

      let specialCheck = this.detectSpecialCases(m);
      if (specialCheck === true) {
        this.result = 0;
        return;
      } else if (specialCheck === "solved") {
        return;
      }

      if (this.size === 2) {
        this.calculate2x2(m);
      } else if (this.size === 3) {
        if (this.method === 'sarrus') {
          this.calculateSarrus(m);
        } else {
          this.calculateCofactors(m);
        }
      } else if (this.size === 4) {
        this.calculateCofactors(m);
      }
      
      this.updateVisualStep();
    },

    calculate2x2(m) {
      let det = (m[0][0] * m[1][1]) - (m[0][1] * m[1][0]);
      this.steps.push(`Para matrices 2x2 aplicamos la definición:<br>det A = (a₁₁ * a₂₂) - (a₁₂ * a₂₁)<br>det A = (${m[0][0]} * ${m[1][1]}) - (${m[0][1]} * ${m[1][0]})`);
      this.result = det;
    },

    getDisplayColumns() {
      if (this.size === 3 && this.method === 'sarrus' && this.steps.length > 0) {
        return [0, 1, 2, 0, 1];
      }
      return Array.from({ length: this.size }, (_, i) => i);
    },

    calculateSarrus(m) {
      let a = m[0][0], b = m[0][1], c = m[0][2];
      let d = m[1][0], e = m[1][1], f = m[1][2];
      let g = m[2][0], h = m[2][1], i = m[2][2];

      let pos1 = a*e*i, pos2 = b*f*g, pos3 = c*d*h;
      let neg1 = c*e*g, neg2 = a*f*h, neg3 = b*d*i;

      this.steps = [
        `<b>Método de Sarrus:</b><br>Multiplicamos las diagonales positivas (izquierda a derecha):<br>D₁ = (${a} × ${e} × ${i}) = ${pos1}<br>D₂ = (${b} × ${f} × ${g}) = ${pos2}<br>D₃ = (${c} × ${d} × ${h}) = ${pos3}`,
        `Multiplicamos las diagonales negativas (derecha a izquierda):<br>D₄ = (${c} × ${e} × ${g}) = ${neg1}<br>D₅ = (${a} × ${f} × ${h}) = ${neg2}<br>D₆ = (${b} × ${d} × ${i}) = ${neg3}`,
        `<b>Resultado final:</b><br>Sumamos las positivas y restamos las negativas:<br>det = (${pos1} + ${pos2} + ${pos3}) - (${neg1} + ${neg2} + ${neg3})`
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

    calculateCofactors(m) {
      let best = this.findBestExpansion(m);
      let isRow = best.type === 'row';
      let idx = best.index;
      let termStr = [];
      let finalDet = 0;

      this.steps.push(`<b>Expansión por cofactores:</b><br>Detectamos que la ${isRow ? 'fila' : 'columna'} ${idx + 1} es óptima para expandir (tiene más ceros).`);

      for (let k = 0; k < this.size; k++) {
        let r = isRow ? idx : k;
        let c = isRow ? k : idx;
        let val = m[r][c];

        if (val === 0) {
          termStr.push(`0`);
          this.steps.push(`Cofactor A<sub>${r+1}${c+1}</sub> se omite porque su coeficiente es 0.`);
          continue;
        }

        let subM = this.getSubMatrix(m, r, c);
        let menorDet = this.getDet(subM);
        let sign = Math.pow(-1, r + c);
        let cofactor = sign * menorDet;
        let termValue = val * cofactor;
        
        finalDet += termValue;

        this.steps.push(`
          <b>Menor M<sub>${r+1}${c+1}</sub></b> y <b>Cofactor A<sub>${r+1}${c+1}</sub></b>:<br>
          M<sub>${r+1}${c+1}</sub> = ${menorDet}<br>
          A<sub>${r+1}${c+1}</sub> = (-1)<sup>${r+1}+${c+1}</sup> * (${menorDet}) = ${cofactor}<br>
          Término = ${val} * (${cofactor}) = ${termValue}
        `);
        
        termStr.push(`(${termValue})`);
      }

      this.steps.push(`<b>Suma final de términos:</b><br>det = ${termStr.join(' + ')}`);
      this.result = finalDet;
    }
  };
}