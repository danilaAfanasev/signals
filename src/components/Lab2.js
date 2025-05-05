import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  generateTimeAxis,
  generateTriangleSignal,
  generateSquareSignal,
  computeSpectrum,
  inverseFFT,
  exportToWav,
} from '../utils/signalUtils2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Lab2 = () => {
  const tLim = 2;
  const fs = 1000;
  const frequency = 20;

  // Генерация временной оси с учётом периодичности
  const tOriginal = generateTimeAxis(tLim, fs, frequency);

  // Дополнение сигнала до ближайшей большей степени двойки
  const powerOfTwo = Math.pow(2, Math.ceil(Math.log2(tOriginal.length)));
  const t = tOriginal.slice(0, powerOfTwo);
  const padLength = powerOfTwo - tOriginal.length;
  const paddedT = [...tOriginal, ...Array(padLength).fill(tOriginal[tOriginal.length - 1])];

  // Треугольный сигнал
  const triangleOriginal = generateTriangleSignal(tOriginal, frequency);
  const triangle = adjustToPowerOfTwo(triangleOriginal);
  console.log('Triangle signal sample:', triangle.slice(0, 5));
  const triangleHasInvalid = triangle.some((val) => typeof val !== 'number' || isNaN(val));
  if (triangleHasInvalid) {
    console.error('Triangle signal contains invalid values:', triangle);
    return <div>Error: Invalid triangle signal</div>;
  }

  // Спектр треугольного сигнала
  const { amplitudes: amplitudeSpectrumTriangle, frequencies, phasors: fftResultTriangle } = computeSpectrum(
    triangle,
    tLim,
    fs
  );
  if (amplitudeSpectrumTriangle.length === 0 || frequencies.length === 0) {
    return <div>Error: Failed to compute spectrum for triangle signal</div>;
  }

  // Обратное преобразование треугольного сигнала
  const reconstructedTriangle = inverseFFT(fftResultTriangle);
  if (reconstructedTriangle.length === 0) {
    return <div>Error: Failed to reconstruct triangle signal</div>;
  }

  // Спектр восстановленного треугольного сигнала
  const { amplitudes: amplitudeSpectrumReconstructedTriangle } = computeSpectrum(reconstructedTriangle, tLim, fs);
  if (amplitudeSpectrumReconstructedTriangle.length === 0) {
    return <div>Error: Failed to compute spectrum for reconstructed triangle signal</div>;
  }

  // Прямоугольный сигнал
  const squareOriginal = generateSquareSignal(tOriginal, frequency);
  const square = adjustToPowerOfTwo(squareOriginal);
  console.log('Square signal sample:', square.slice(0, 5));
  const squareHasInvalid = square.some((val) => typeof val !== 'number' || isNaN(val));
  if (squareHasInvalid) {
    console.error('Square signal contains invalid values:', square);
    return <div>Error: Invalid square signal</div>;
  }

  // Спектр прямоугольного сигнала
  const { amplitudes: amplitudeSpectrumSquare, phasors: fftResultSquare } = computeSpectrum(square, tLim, fs);
  if (amplitudeSpectrumSquare.length === 0) {
    return <div>Error: Failed to compute spectrum for square signal</div>;
  }

  // Обратное преобразование прямоугольного сигнала
  const reconstructedSquare = inverseFFT(fftResultSquare);
  if (reconstructedSquare.length === 0) {
    return <div>Error: Failed to reconstruct square signal</div>;
  }

  // Спектр восстановленного прямоугольного сигнала
  const { amplitudes: amplitudeSpectrumReconstructedSquare } = computeSpectrum(reconstructedSquare, tLim, fs);
  if (amplitudeSpectrumReconstructedSquare.length === 0) {
    return <div>Error: Failed to compute spectrum for reconstructed square signal</div>;
  }

  // Данные для графиков
  const triangleData = {
    labels: t,
    datasets: [
      {
        label: 'Треугольный сигнал',
        data: triangle,
        borderColor: 'blue',
        fill: false,
        tension: 0.1,
        pointRadius: 0,
      },
    ],
  };

  const triangleSpectrumData = {
    labels: frequencies,
    datasets: [
      {
        label: 'Амплитудный спектр',
        data: amplitudeSpectrumTriangle,
        borderColor: 'orange',
        fill: false,
        tension: 0.1,
        pointRadius: 0,
      },
    ],
  };

  const triangleReconstructedData = {
    labels: t,
    datasets: [
      {
        label: 'Исходный',
        data: triangle,
        borderColor: 'blue',
        fill: false,
        tension: 0.1,
        pointRadius: 0,
      },
      {
        label: 'Восстановленный',
        data: reconstructedTriangle,
        borderColor: 'red',
        borderDash: [5, 5],
        fill: false,
        tension: 0.1,
        pointRadius: 0,
      },
    ],
  };

  const triangleSpectrumReconstructedData = {
    labels: frequencies,
    datasets: [
      {
        label: 'Исходный спектр',
        data: amplitudeSpectrumTriangle,
        borderColor: 'blue',
        fill: false,
        tension: 0.1,
        pointRadius: 0,
      },
      {
        label: 'Восстановленный спектр',
        data: amplitudeSpectrumReconstructedTriangle,
        borderColor: 'red',
        borderDash: [5, 5],
        fill: false,
        tension: 0.1,
        pointRadius: 0,
      },
    ],
  };

  const squareData = {
    labels: t,
    datasets: [
      {
        label: 'Прямоугольный сигнал',
        data: square,
        borderColor: 'green',
        fill: false,
        tension: 0,
        pointRadius: 0,
      },
    ],
  };

  const squareSpectrumData = {
    labels: frequencies,
    datasets: [
      {
        label: 'Амплитудный спектр',
        data: amplitudeSpectrumSquare,
        borderColor: 'orange',
        fill: false,
        tension: 0.1,
        pointRadius: 0,
      },
    ],
  };

  const squareReconstructedData = {
    labels: t,
    datasets: [
      {
        label: 'Исходный',
        data: square,
        borderColor: 'green',
        fill: false,
        tension: 0,
        pointRadius: 0,
      },
      {
        label: 'Восстановленный',
        data: reconstructedSquare,
        borderColor: 'red',
        borderDash: [5, 5],
        fill: false,
        tension: 0,
        pointRadius: 0,
      },
    ],
  };

  const squareSpectrumReconstructedData = {
    labels: frequencies,
    datasets: [
      {
        label: 'Исходный спектр',
        data: amplitudeSpectrumSquare,
        borderColor: 'green',
        fill: false,
        tension: 0.1,
        pointRadius: 0,
      },
      {
        label: 'Восстановленный спектр',
        data: amplitudeSpectrumReconstructedSquare,
        borderColor: 'red',
        borderDash: [5, 5],
        fill: false,
        tension: 0.1,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Signal Visualization' },
    },
    scales: {
      x: { title: { display: true, text: 'Время (с)' } },
      y: { title: { display: true, text: 'Амплитуда' } },
    },
    elements: {
      line: { borderWidth: 1 },
    },
  };

  const spectrumOptions = {
    ...options,
    scales: {
      x: {
        title: { display: true, text: 'Частота (Гц)' },
        min: 0,
        max: fs / 2,
      },
      y: { title: { display: true, text: 'Амплитуда' } },
    },
  };

  // Экспорт в WAV
  const handleExportWav = (signal, filename) => {
    exportToWav(signal, fs, filename);
    console.log(`Exported ${filename} for listening.`);
  };

  return (
    <div>
      <h2>Lab 2: Signal Analysis</h2>

      {/* Треугольный сигнал */}
      <div>
        <h3>Треугольный сигнал</h3>
        <Line data={triangleData} options={options} />
        <button onClick={() => handleExportWav(triangleOriginal, 'triangle.wav')}>
          Экспорт треугольного сигнала в WAV
        </button>
      </div>

      {/* Спектр треугольного сигнала */}
      <div>
        <h3>Амплитудный спектр треугольного сигнала</h3>
        <Line data={triangleSpectrumData} options={spectrumOptions} />
      </div>

      {/* Сравнение исходного и восстановленного треугольного сигнала */}
      <div>
        <h3>Сравнение исходного и восстановленного треугольного сигнала</h3>
        <Line data={triangleReconstructedData} options={options} />
        <button onClick={() => handleExportWav(reconstructedTriangle, 'reconstructed_triangle.wav')}>
          Экспорт восстановленного треугольного сигнала в WAV
        </button>
      </div>

      {/* Сравнение спектров треугольного сигнала */}
      <div>
        <h3>Сравнение спектров треугольного сигнала</h3>
        <Line data={triangleSpectrumReconstructedData} options={spectrumOptions} />
      </div>

      {/* Прямоугольный сигнал */}
      <div>
        <h3>Прямоугольный сигнал</h3>
        <Line data={squareData} options={options} />
        <button onClick={() => handleExportWav(squareOriginal, 'square.wav')}>
          Экспорт прямоугольного сигнала в WAV
        </button>
      </div>

      {/* Спектр прямоугольного сигнала */}
      <div>
        <h3>Амплитудный спектр прямоугольного сигнала</h3>
        <Line data={squareSpectrumData} options={spectrumOptions} />
      </div>

      {/* Сравнение исходного и восстановленного прямоугольного сигнала */}
      <div>
        <h3>Сравнение исходного и восстановленного прямоугольного сигнала</h3>
        <Line data={squareReconstructedData} options={options} />
        <button onClick={() => handleExportWav(reconstructedSquare, 'reconstructed_square.wav')}>
          Экспорт восстановленного прямоугольного сигнала в WAV
        </button>
      </div>

      {/* Сравнение спектров прямоугольного сигнала */}
      <div>
        <h3>Сравнение спектров прямоугольного сигнала</h3>
        <Line data={squareSpectrumReconstructedData} options={spectrumOptions} />
      </div>
    </div>
  );

  function adjustToPowerOfTwo(signal) {
    const length = signal.length;
    const powerOfTwo = Math.pow(2, Math.ceil(Math.log2(length)));
    if (length === powerOfTwo) return signal;
    return [...signal, ...Array(powerOfTwo - length).fill(0)];
  }
};

export default Lab2;