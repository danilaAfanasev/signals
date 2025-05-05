import { fft, ifft } from 'fft-js';

// Генерация временной оси с учётом периодичности
export const generateTimeAxis = (tLim, fs, frequency) => {
  const samplesPerPeriod = Math.round(fs / frequency); // Количество отсчётов на период
  const totalPeriods = Math.floor(tLim * frequency); // Количество полных периодов
  const totalSamples = samplesPerPeriod * totalPeriods; // Точное количество отсчётов для целого числа периодов
  const t = [];
  const step = 1 / fs;
  for (let i = 0; i < totalSamples; i++) {
    t.push(i * step);
  }
  return t;
};

// Генерация треугольного сигнала
export const generateTriangleSignal = (t, frequency) => {
  const values = t.map((x) => {
    const period = 1 / frequency;
    const phase = ((x % period) + period) % period;
    let value;
    if (phase < period / 4) {
      value = 4 * phase / (period / 4);
    } else if (phase < 3 * period / 4) {
      value = 2 - 4 * (phase - period / 4) / (period / 4);
    } else {
      value = -2 + 4 * (phase - 3 * period / 4) / (period / 4);
    }
    if (isNaN(value) || value === undefined) {
      console.error('Invalid value in triangle signal:', { x, period, phase, value });
      return 0;
    }
    return value;
  });
  return values;
};

// Генерация прямоугольного сигнала
export const generateSquareSignal = (t, frequency) => {
  const values = t.map((x) => {
    const period = 1 / frequency;
    const phase = ((x % period) + period) % period;
    const value = phase < period / 2 ? 1 : -1;
    if (isNaN(value) || value === undefined) {
      console.error('Invalid value in square signal:', { x, phase, value });
      return 0;
    }
    return value;
  });
  return values;
};

// Сглаживание сигнала (скользящее среднее)
const smoothSignal = (signal, windowSize) => {
  const result = [];
  for (let i = 0; i < signal.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(signal.length, i + Math.floor(windowSize / 2) + 1);
    const window = signal.slice(start, end);
    const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
    result.push(avg);
  }
  return result;
};

// Функция для приведения длины массива к степени двойки (дополнение нулями)
const adjustToPowerOfTwo = (signal) => {
  const length = signal.length;
  const powerOfTwo = Math.pow(2, Math.ceil(Math.log2(length)));
  if (length === powerOfTwo) {
    return signal;
  }
  console.warn(`Signal length ${length} is not a power of 2, padding to ${powerOfTwo}`);
  return [...signal, ...Array(powerOfTwo - length).fill(0)];
};

// Вычисление спектра (прямое преобразование Фурье)
export const computeSpectrum = (signal, tLim, fs) => {
  // Дополнение сигнала до ближайшей большей степени двойки
  signal = adjustToPowerOfTwo(signal);
  const N = signal.length;

  // Проверка входных данных
  if (!Array.isArray(signal) || signal.length === 0) {
    console.error('Invalid signal input for FFT:', signal);
    return { amplitudes: [], frequencies: [], phasors: [] };
  }

  // Проверка на некорректные значения в сигнале
  const hasInvalidValues = signal.some((val, index) => {
    if (typeof val !== 'number' || isNaN(val) || val === undefined) {
      console.error(`Invalid value at index ${index}:`, val);
      return true;
    }
    return false;
  });

  if (hasInvalidValues) {
    console.error('Signal contains invalid values, replacing with 0');
    signal = signal.map((val) => (typeof val === 'number' && !isNaN(val) ? val : 0));
  }

  // Подготовка данных для FFT
  const signalForFFT = signal.map((val) => [val, 0]);
  console.log('signalForFFT sample:', signalForFFT.slice(0, 5));

  // Выполнение FFT
  let phasors;
  try {
    phasors = fft(signalForFFT);
  } catch (error) {
    console.error('Error in FFT computation:', error);
    return { amplitudes: [], frequencies: [], phasors: [] };
  }

  // Вычисление амплитуд
  const amplitudes = phasors.map((c) => (2 / N) * Math.sqrt(c[0] ** 2 + c[1] ** 2));

  // Вычисление частот
  const frequencies = [];
  const freqStep = fs / N;
  for (let i = 0; i < N / 2; i++) {
    frequencies.push(i * freqStep);
  }

  return { amplitudes: amplitudes.slice(0, N / 2), frequencies, phasors };
};

// Обратное преобразование Фурье
export const inverseFFT = (fftResult) => {
  if (!Array.isArray(fftResult) || fftResult.length === 0) {
    console.error('Invalid FFT result for inverse FFT:', fftResult);
    return [];
  }

  let reconstructed;
  try {
    reconstructed = ifft(fftResult);
  } catch (error) {
    console.error('Error in inverse FFT computation:', error);
    return [];
  }

  // Извлечение действительной части и сглаживание
  const result = reconstructed.map((c) => c[0]);
  return smoothSignal(result, 5); // Сглаживание с окном 5
};

// Экспорт сигнала в WAV
export const exportToWav = (signal, fs, filename) => {
  const WaveFile = require('wavefile').WaveFile;
  const wav = new WaveFile();

  // Проверка сигнала на некорректные значения
  const sanitizedSignal = signal.map((val) => (typeof val === 'number' && !isNaN(val) ? val : 0));

  // Нормализация сигнала для WAV (значения от -32768 до 32767 для 16 бит)
  const maxVal = Math.max(...sanitizedSignal.map(Math.abs));
  const normalized = sanitizedSignal.map((val) =>
    Math.min(32767, Math.max(-32768, Math.round((val / (maxVal || 1)) * 32767)))
  );

  wav.fromScratch(1, fs, '16', normalized);
  const buffer = wav.toBuffer();
  const blob = new Blob([buffer], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};