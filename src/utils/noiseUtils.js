import { fft } from 'fft-js';

// Генерация белого шума
const generateWhiteNoise = (N) => {
  const noise = new Array(N);
  for (let i = 0; i < N; i++) {
    noise[i] = 2 * Math.random() - 1; // Значения от -1 до 1
  }
  return noise;
};

// Функция для вычисления спектральной плотности
const computePSD = (N, psd) => {
  const X_white = generateWhiteNoise(N);
  console.log('White noise sample:', X_white.slice(0, 5));

  // Преобразование в комплексный формат
  const signalForFFT = X_white.map((val) => {
    if (typeof val !== 'number' || isNaN(val)) {
      console.error('Invalid value in white noise:', val);
      return [0, 0];
    }
    return [val, 0];
  });

  console.log('Signal for FFT sample:', signalForFFT.slice(0, 5));
  console.log('Signal length:', signalForFFT.length);

  // Проверка корректности входных данных
  signalForFFT.forEach((val, i) => {
    if (!Array.isArray(val) || val.length !== 2 || isNaN(val[0]) || isNaN(val[1])) {
      console.error(`Invalid complex number at index ${i}:`, val);
    }
  });

  let phasors;
  try {
    phasors = fft(signalForFFT);
    console.log('FFT phasors sample:', phasors.slice(0, 5));
  } catch (error) {
    console.error('Error in FFT computation:', error);
    return new Array(N).fill(0);
  }

  // Вычисление частот для одностороннего спектра
  const f = Array.from({ length: Math.floor(N / 2) + 1 }, (_, i) => i * (1 / N));
  let S = psd(f);
  
  // Если S не массив, преобразуем в массив единиц (для белого шума)
  if (!Array.isArray(S)) {
    S = new Array(f.length).fill(S);
  }

  console.log('PSD frequencies:', f.slice(0, 5), 'PSD values:', S.slice(0, 5));

  // Проверка S на NaN или Infinity
  S.forEach((val, i) => {
    if (isNaN(val) || val === Infinity) {
      console.error(`Invalid PSD value at index ${i}:`, val);
      S[i] = 0;
    }
  });

  // Расширение S до полной длины phasors
  const fullS = new Array(N).fill(0);
  for (let i = 0; i < Math.floor(N / 2) + 1; i++) {
    fullS[i] = S[i] || 0;
    if (i > 0 && i < Math.floor(N / 2)) {
      fullS[N - i] = S[i] || 0;
    }
  }

  // Нормализация спектральной плотности
  const meanS2 = fullS.reduce((sum, val) => sum + val * val, 0) / fullS.length;
  const norm = meanS2 !== 0 ? Math.sqrt(meanS2) : 1;
  const X_shaped = phasors.map((c, i) => [
    c[0] * (fullS[i] / norm || 0),
    c[1] * (fullS[i] / norm || 0),
  ]);

  let result;
  try {
    result = fft(X_shaped).map((c) => c[0]);
  } catch (error) {
    console.error('Error in inverse FFT computation:', error);
    return new Array(N).fill(0);
  }
  return result;
};

// Генераторы шумов
export const whiteNoise = (N) => computePSD(N, (f) => new Array(f.length).fill(1));
export const pinkNoise = (N) => computePSD(N, (f) => f.map((x) => (x === 0 ? 0 : 1 / Math.sqrt(x))));
export const redNoise = (N) => computePSD(N, (f) => f.map((x) => (x === 0 ? 0 : 1 / x)));

// Вычисление амплитудного спектра
export const computeAmplitudeSpectrum = (signal, fs) => {
  const N = signal.length;
  const phasors = fft(signal.map((val) => {
    if (typeof val !== 'number' || isNaN(val)) {
      console.error('Invalid value in signal:', val);
      return [0, 0];
    }
    return [val, 0];
  }));
  const amplitudes = phasors.map((c) => (2 / N) * Math.sqrt(c[0] ** 2 + c[1] ** 2));
  const frequencies = Array.from({ length: Math.floor(N / 2) + 1 }, (_, i) => i * (fs / N));
  return { amplitudes: amplitudes.slice(0, Math.floor(N / 2) + 1), frequencies };
};

// Подготовка данных для гистограммы
export const prepareHistogramData = (signal, bins = 100) => {
  const minVal = Math.min(...signal);
  const maxVal = Math.max(...signal);
  const binSize = (maxVal - minVal) / bins;
  const histogram = new Array(bins).fill(0);

  signal.forEach((val) => {
    if (typeof val !== 'number' || isNaN(val)) {
      console.error('Invalid value in histogram:', val);
      return;
    }
    const bin = Math.min(bins - 1, Math.floor((val - minVal) / binSize));
    histogram[bin]++;
  });

  const total = histogram.reduce((sum, val) => sum + val, 0);
  return {
    bins: Array.from({ length: bins }, (_, i) => minVal + i * binSize + binSize / 2),
    counts: histogram.map((count) => count / total), // Нормализация для плотности
  };
};

// Вычисление корреляционной матрицы
export const computeCorrelationMatrix = (signal, chunkSize = 1000) => {
  const chunks = [];
  for (let i = 0; i < Math.floor(signal.length / chunkSize); i++) {
    chunks.push(signal.slice(i * chunkSize, (i + 1) * chunkSize));
  }
  const corrMatrix = new Array(chunks.length)
    .fill(0)
    .map(() => new Array(chunks.length).fill(0));
  for (let i = 0; i < chunks.length; i++) {
    for (let j = 0; j < chunks.length; j++) {
      let sumXY = 0, sumX = 0, sumY = 0, sumX2 = 0, sumY2 = 0;
      for (let k = 0; k < chunkSize; k++) {
        const x = chunks[i][k] || 0;
        const y = chunks[j][k] || 0;
        sumXY += x * y;
        sumX += x;
        sumY += y;
        sumX2 += x * x;
        sumY2 += y * y;
      }
      const denom = Math.sqrt((sumX2 - sumX * sumX / chunkSize) * (sumY2 - sumY * sumY / chunkSize));
      corrMatrix[i][j] = denom === 0 ? 0 : (sumXY - sumX * sumY / chunkSize) / denom;
    }
  }
  return corrMatrix;
};