import { fft } from 'fft-js';
import * as math from 'mathjs';

// Функция для поворота сигнала вокруг заданной оси
const rotateSignal = (signal, angle, axis) => {
  let rotationMatrix = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];

  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  if (axis === 'x') {
    rotationMatrix = [
      [1, 0, 0],
      [0, cosA, -sinA],
      [0, sinA, cosA],
    ];
  } else if (axis === 'y') {
    rotationMatrix = [
      [cosA, 0, sinA],
      [0, 1, 0],
      [-sinA, 0, cosA],
    ];
  } else if (axis === 'z') {
    rotationMatrix = [
      [cosA, -sinA, 0],
      [sinA, cosA, 0],
      [0, 0, 1],
    ];
  }

  return math.multiply(rotationMatrix, signal);
};

// Генерация гармонического сигнала
export const generatePeriodicSignal = () => {
  const A = 1;
  const f = 2;
  const phi0 = 0;
  const t = math.range(0, 2, 0.002).toArray(); // 1000 точек
  const values = t.map((x) => A * Math.cos(2 * Math.PI * f * x + phi0));

  if (values.some((v) => isNaN(v) || v === undefined)) {
    console.error('NaN or undefined in periodic signal');
  }
  return { t, values };
};

// Генерация сигнала с изменяющейся частотой
export const generatePeriodicSignalVaryingFrequency = () => {
  const A = 1;
  const phi0 = 0;
  const t = math.range(0, 2, 0.002).toArray(); // 1000 точек
  const frequencies = math.range(0, Math.PI + 0.1, 0.1).toArray(); // Частоты от 0 до π с шагом 0.1

  const values = t.map((x, i) => {
    // Линейная интерполяция частоты
    const freqIndex = (i / t.length) * (frequencies.length - 1);
    const lowerIndex = Math.floor(freqIndex);
    const upperIndex = Math.min(lowerIndex + 1, frequencies.length - 1);
    const fraction = freqIndex - lowerIndex;
    const interpolatedFreq = frequencies[lowerIndex] + fraction * (frequencies[upperIndex] - frequencies[lowerIndex]);
    return A * Math.cos(2 * Math.PI * interpolatedFreq * x + phi0);
  });

  if (values.some((v) => isNaN(v) || v === undefined)) {
    console.error('NaN or undefined in varying frequency signal');
  }
  return { t, values };
};

// Генерация сигнала с изменяющейся амплитудой
export const generatePeriodicSignalVaryingAmplitude = () => {
  const f = 2;
  const phi0 = 0;
  const t = math.range(0, 2, 0.002).toArray(); // 1000 точек
  const amplitudes = math.range(0, 2.1, 0.1).toArray(); // 0, 0.1, 0.2, ..., 2.0

  const values = t.map((x, i) => {
    // Линейная интерполяция амплитуды
    const ampIndex = (i / t.length) * (amplitudes.length - 1);
    const lowerIndex = Math.floor(ampIndex);
    const upperIndex = Math.min(lowerIndex + 1, amplitudes.length - 1);
    const fraction = ampIndex - lowerIndex;
    const interpolatedAmp = amplitudes[lowerIndex] + fraction * (amplitudes[upperIndex] - amplitudes[lowerIndex]);
    return interpolatedAmp * Math.cos(2 * Math.PI * f * x + phi0);
  });

  if (values.some((v) => isNaN(v) || v === undefined)) {
    console.error('NaN or undefined in varying amplitude signal');
  }
  return { t, values };
};

// Генерация сложенного сигнала
export const generateCombinedSignal = () => {
  const { t, values: v1 } = generatePeriodicSignal();
  const { values: v2 } = generatePeriodicSignalVaryingFrequency();
  const { values: v3 } = generatePeriodicSignalVaryingAmplitude();

  if (v1.length !== v2.length || v2.length !== v3.length) {
    console.error('Length mismatch:', { v1: v1.length, v2: v2.length, v3: v3.length });
    return { t, values: [] };
  }

  const values = v1.map((v, i) => v + v2[i] + v3[i]);

  if (values.some((v) => isNaN(v) || v === undefined)) {
    console.error('NaN or undefined in combined signal');
  }
  return { t, values };
};

// Генерация амплитудного спектра
export const generateAmplitudeSpectrum = () => {
  const { t, values } = generateCombinedSignal();

  if (!values.length || values.some((v) => isNaN(v) || v === undefined)) {
    console.error('Invalid combined signal:', values);
    return { xf: [], yf: [] };
  }

  // Находим ближайшую степень двойки
  let N = values.length;
  const powerOfTwo = Math.pow(2, Math.ceil(Math.log2(N)));
  console.log('FFT input length:', N, 'Padded to:', powerOfTwo);

  // Дополняем нули
  const paddedValues = [...values, ...Array(powerOfTwo - N).fill(0)];
  const T = t[1] - t[0]; // Шаг времени

  // Формируем комплексный сигнал
  const signal = paddedValues.map((val) => [val, 0]);
  console.log('Signal for FFT:', signal.slice(0, 5));

  try {
    const phasors = fft(signal);
    const frequencies = math.range(0, powerOfTwo / 2, 1).toArray().map((i) => i / (powerOfTwo * T));
    const amplitudes = phasors.slice(0, powerOfTwo / 2).map((c) => (2 / powerOfTwo) * Math.sqrt(c[0] ** 2 + c[1] ** 2));

    // Анализ амплитуды, частоты, фазы
    const maxAmplitude = Math.max(...amplitudes);
    const maxAmplitudeIndex = amplitudes.indexOf(maxAmplitude);
    const dominantFrequency = frequencies[maxAmplitudeIndex];
    const phase = Math.atan2(phasors[maxAmplitudeIndex][1], phasors[maxAmplitudeIndex][0]);

    console.log('FFT Analysis:', {
      maxAmplitude,
      dominantFrequency,
      phase,
      frequenciesLength: frequencies.length,
      amplitudesLength: amplitudes.length,
    });

    return { xf: frequencies, yf: amplitudes };
  } catch (error) {
    console.error('FFT calculation error:', error);
    return { xf: [], yf: [] };
  }
};

// Генерация данных для 3D-графика
export const generateCombinedSignalRotated = () => {
  const { t, values: v1 } = generatePeriodicSignal();
  const { values: v2 } = generatePeriodicSignalVaryingFrequency();
  const { values: v3 } = generatePeriodicSignalVaryingAmplitude();

  if (v1.length !== v2.length || v2.length !== v3.length) {
    console.error('Array length mismatch in rotated signal:', {
      v1Length: v1.length,
      v2Length: v2.length,
      v3Length: v3.length,
    });
    return { t, v1Rotated: [], v2Rotated: [], v3Rotated: [], combined: [] };
  }

  // Первый сигнал: [t, 0, v1]
  const signal1 = math.matrix([t, Array(t.length).fill(0), v1]);

  // Второй сигнал: изначально [t, v2, 0], повернут на 23° относительно оси X
  const signal2 = math.matrix([t, v2, Array(t.length).fill(0)]);
  const angle1 = (23 * Math.PI) / 180;
  const v2RotatedMatrix = rotateSignal(signal2, angle1, 'x');

  // Третий сигнал: изначально [t, v3, 0], повернут на 46° относительно второго
  const signal3 = math.matrix([t, v3, Array(t.length).fill(0)]);
  const angle2 = (46 * Math.PI) / 180;
  const v3RotatedMatrix = rotateSignal(signal3, angle2, 'x');

  // Сложение сигналов
  const combinedMatrix = math.add(math.add(signal1, v2RotatedMatrix), v3RotatedMatrix);

  // Преобразование в массивы
  const v1Rotated = signal1.toArray();
  const v2Rotated = v2RotatedMatrix.toArray();
  const v3Rotated = v3RotatedMatrix.toArray();
  const combined = combinedMatrix.toArray();

  // Проверка на NaN
  const checkNaN = (matrix, name) => {
    const hasNaN = matrix.some((row) => row.some((v) => isNaN(v) || v === undefined));
    if (hasNaN) {
      console.error(`NaN or undefined in ${name}:`, matrix);
    }
    return hasNaN;
  };

  if (
    checkNaN(v1Rotated, 'v1Rotated') ||
    checkNaN(v2Rotated, 'v2Rotated') ||
    checkNaN(v3Rotated, 'v3Rotated') ||
    checkNaN(combined, 'combined')
  ) {
    return { t, v1Rotated: [], v2Rotated: [], v3Rotated: [], combined: [] };
  }

  return { t, v1Rotated, v2Rotated, v3Rotated, combined };
};