export interface RegressionResult {
    coefficients: number[];
    featureNames: string[];
    r2: number;
    predict: (features: number[]) => number;
}

function gaussianElimination(A: number[][], b: number[]): number[] {
    const n = A.length;
    const aug = A.map((row, i) => [...row, b[i]]);

    for (let col = 0; col < n; col++) {
        let maxRow = col;
        for (let row = col + 1; row < n; row++) {
            if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
        }
        [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
        if (Math.abs(aug[col][col]) < 1e-10) continue;
        for (let row = 0; row < n; row++) {
            if (row === col) continue;
            const f = aug[row][col] / aug[col][col];
            for (let j = col; j <= n; j++) aug[row][j] -= f * aug[col][j];
        }
    }

    return aug.map((row, i) => row[n] / row[i]);
}

export function linearRegression(
    X: number[][],
    y: number[],
    featureNames: string[],
): RegressionResult {
    const n = X.length;
    const m = X[0].length;
    const Xb = X.map(row => [1, ...row]);
    const mb = m + 1;

    const XtX: number[][] = Array.from({ length: mb }, () => Array(mb).fill(0));
    const Xty: number[] = Array(mb).fill(0);

    for (let i = 0; i < mb; i++) {
        for (let j = 0; j < mb; j++)
            for (let k = 0; k < n; k++) XtX[i][j] += Xb[k][i] * Xb[k][j];
        for (let k = 0; k < n; k++) Xty[i] += Xb[k][i] * y[k];
    }

    const coefficients = gaussianElimination(XtX, Xty);

    const yPred = X.map(row =>
        coefficients[0] + row.reduce((s, x, i) => s + x * coefficients[i + 1], 0),
    );
    const yMean = y.reduce((a, b) => a + b, 0) / n;
    const ssTot = y.reduce((s, yi) => s + (yi - yMean) ** 2, 0);
    const ssRes = y.reduce((s, yi, i) => s + (yi - yPred[i]) ** 2, 0);
    const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

    return {
        coefficients,
        featureNames,
        r2,
        predict: features =>
            coefficients[0] + features.reduce((s, x, i) => s + x * coefficients[i + 1], 0),
    };
}
