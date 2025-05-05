import { fft } from 'fft-js';

// Генерация временной оси
export const generateTimeAxis = (start, end, samples) => {
  const t = [];
  const step = (end - start) / (samples - 1);
  for (let i = 0; i < samples; i++) {
    t.push(start + i * step);
  }
  return t;
};

// Прямоугольный импульс
export const generateRectangularPulse = (t, A, T) => {
  return t.map((x) => ((x) <= T / 2 ? A : 0));
};

// Гауссов импульс
export const generateGaussianPulse = (t, A, sigma, t0 = 0) => {
  return t.map((x) => A * Math.exp(-((x - t0) ** 2) / (2 * sigma ** 2)));
};

// Экспоненциально затухающий импульс
export const generateExponentialPulse = (t, A, alpha) => {
  return t.map((x) => (x >= 0 ? A * Math.exp(-alpha * x) : 0));
};

// Sinc-импульс
export const generateSincPulse = (t, A, T) => {
  return t.map((x) => {
    const arg = (Math.PI * x) / T;
    return arg === 0 ? A : (A * Math.sin(arg)) / arg;
  });
};

// Треугольный импульс
export const generateTriangularPulse = (t, A, T) => {
  return t.map((x) => (Math.abs(x) <= T / 2 ? A * (1 - (2 * Math.abs(x)) / T) : 0));
};

// Вычисление амплитудного спектра
export const computeSpectrum = (signal, dt) => {
  // Приведение длины сигнала к степени двойки (дополнение нулями)
  const length = signal.length;
  const powerOfTwo = Math.pow(2, Math.ceil(Math.log2(length)));
  const paddedSignal = [...signal, ...Array(powerOfTwo - length).fill(0)];

  const N = paddedSignal.length;
  const signalForFFT = paddedSignal.map((val) => [val, 0]);
  const phasors = fft(signalForFFT);
  const amplitudes = phasors.map((c) => (2 / N) * Math.sqrt(c[0] ** 2 + c[1] ** 2));

  // Частотная ось
  const fs = 1 / dt; // Частота дискретизации
  const freqStep = fs / N; // Частотный шаг
  const frequencies = [];
  for (let i = 0; i < N; i++) {
    frequencies.push((i - N / 2) * freqStep); // fftshift: от -fs/2 до fs/2
  }

  // Нормализация спектра
  const maxAmplitude = Math.max(...amplitudes);
  const normalizedAmplitudes = amplitudes.map((val) => (maxAmplitude > 0 ? val / maxAmplitude : 0));

  return { amplitudes: normalizedAmplitudes, frequencies };
};