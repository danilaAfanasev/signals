import React from 'react';
import { Line, Bar, Chart } from 'react-chartjs-2'; // Переместили Chart сюда
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';
import {
  whiteNoise,
  pinkNoise,
  redNoise,
  computeAmplitudeSpectrum,
  prepareHistogramData,
  computeCorrelationMatrix,
} from '../utils/noiseUtils';

// Регистрация компонентов Chart.js, включая Matrix для тепловой карты
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  MatrixController,
  MatrixElement
);

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Ошибка в компоненте</h2>
          <p>{this.state.error?.message}</p>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const Lab4 = () => {
  const length = 2 ** 15; // 1,048,576 (степень двойки)
  const fs = 1000; // Частота дискретизации

  // Генерация шумов
  const whiteNoiseData = whiteNoise(length);
  const pinkNoiseData = pinkNoise(length);
  const redNoiseData = redNoise(length);

  // Амплитудные спектры
  const { amplitudes: whiteSpectrum, frequencies: whiteFreq } = computeAmplitudeSpectrum(whiteNoiseData, fs);
  const { amplitudes: pinkSpectrum, frequencies: pinkFreq } = computeAmplitudeSpectrum(pinkNoiseData, fs);
  const { amplitudes: redSpectrum, frequencies: redFreq } = computeAmplitudeSpectrum(redNoiseData, fs);

  // Гистограммы
  const whiteHist = prepareHistogramData(whiteNoiseData);
  const pinkHist = prepareHistogramData(pinkNoiseData);
  const redHist = prepareHistogramData(redNoiseData);

  // Корреляционные матрицы
  const whiteCorr = computeCorrelationMatrix(whiteNoiseData);
  const pinkCorr = computeCorrelationMatrix(pinkNoiseData);
  const redCorr = computeCorrelationMatrix(redNoiseData);

  // Данные для графиков
  const spectrumData = (amplitudes, frequencies, label, color) => ({
    labels: frequencies,
    datasets: [
      {
        label,
        data: amplitudes,
        borderColor: color,
        fill: false,
        tension: 0.1,
        pointRadius: 0,
      },
    ],
  });

  const histogramData = (bins, counts, label, color) => ({
    labels: bins,
    datasets: [
      {
        label,
        data: counts,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
      },
    ],
  });

  // Данные для тепловой карты корреляционной матрицы
  const correlationData = (matrix, label) => {
    const data = [];
    const size = matrix.length;

    // Преобразуем матрицу в формат, подходящий для chartjs-chart-matrix
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        data.push({
          x: i,
          y: j,
          v: matrix[i][j], // Значение корреляции
        });
      }
    }

    return {
      datasets: [
        {
          label,
          data: data,
          backgroundColor(ctx) {
            const value = ctx.dataset.data[ctx.dataIndex].v;
            // Цветовая шкала: от синего (-1) через белый (0) к красному (1)
            const red = Math.round(255 * Math.max(0, value));
            const blue = Math.round(255 * Math.max(0, -value));
            const green = Math.round(255 * (1 - Math.abs(value)));
            return `rgb(${red}, ${green}, ${blue})`;
          },
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderWidth: 0.5,
          width: ({ chart }) => (chart.chartArea?.width || 0) / size - 1,
          height: ({ chart }) => (chart.chartArea?.height || 0) / size - 1,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Noise Analysis' } },
    scales: { x: { title: { display: true, text: 'Частота (Гц)' } }, y: { title: { display: true, text: 'Амплитуда' } } },
  };

  const histogramOptions = {
    ...options,
    scales: { x: { title: { display: true, text: 'Значения' } }, y: { title: { display: true, text: 'Плотность вероятности' } } },
  };

  const correlationOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Корреляционная матрица' },
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        min: 0,
        max: whiteCorr.length,
        ticks: { stepSize: Math.floor(whiteCorr.length / 10) },
        title: { display: true, text: 'Индекс сегмента' },
      },
      y: {
        type: 'linear',
        min: 0,
        max: whiteCorr.length,
        ticks: { stepSize: Math.floor(whiteCorr.length / 10) },
        title: { display: true, text: 'Индекс сегмента' },
      },
    },
    aspectRatio: 1,
  };

  return (
    <div>
      <h2>Lab 4: Noise Analysis</h2>

      {/* Амплитудные спектры */}
      <div>
        <h3>Амплитудные спектры шумов</h3>
        <Line
          data={spectrumData(whiteSpectrum, whiteFreq, 'Белый шум', 'black')}
          options={{ ...options, title: { text: 'Спектр белого шума' } }}
        />
        <Line
          data={spectrumData(pinkSpectrum, pinkFreq, 'Розовый шум', 'hotpink')}
          options={{ ...options, title: { text: 'Спектр розового шума' } }}
        />
        <Line
          data={spectrumData(redSpectrum, redFreq, 'Красный шум', 'red')}
          options={{ ...options, title: { text: 'Спектр красного шума' } }}
        />
      </div>

      {/* Гистограммы */}
      <div>
        <h3>Распределение вероятностей</h3>
        <Bar
          data={histogramData(whiteHist.bins, whiteHist.counts, 'Белый шум', 'black')}
          options={{ ...histogramOptions, title: { text: 'Гистограмма белого шума' } }}
        />
        <Bar
          data={histogramData(pinkHist.bins, pinkHist.counts, 'Розовый шум', 'hotpink')}
          options={{ ...histogramOptions, title: { text: 'Гистограмма розового шума' } }}
        />
        <Bar
          data={histogramData(redHist.bins, redHist.counts, 'Красный шум', 'red')}
          options={{ ...histogramOptions, title: { text: 'Гистограмма красного шума' } }}
        />
      </div>

      {/* Корреляционные матрицы в виде тепловой карты */}
      <div>
        <h3>Корреляционные матрицы шумов</h3>
        <div style={{ width: '600px', height: '600px' }}>
          <Chart
            type="matrix"
            data={correlationData(whiteCorr, 'Белый шум')}
            options={{
              ...correlationOptions,
              plugins: { ...correlationOptions.plugins, title: { ...correlationOptions.plugins.title, text: 'Белый шум — Корреляционная матрица' } },
            }}
          />
        </div>
        <div style={{ width: '600px', height: '600px' }}>
          <Chart
            type="matrix"
            data={correlationData(pinkCorr, 'Розовый шум')}
            options={{
              ...correlationOptions,
              plugins: { ...correlationOptions.plugins, title: { ...correlationOptions.plugins.title, text: 'Розовый шум — Корреляционная матрица' } },
            }}
          />
        </div>
        <div style={{ width: '600px', height: '600px' }}>
          <Chart
            type="matrix"
            data={correlationData(redCorr, 'Красный шум')}
            options={{
              ...correlationOptions,
              plugins: { ...correlationOptions.plugins, title: { ...correlationOptions.plugins.title, text: 'Красный шум — Корреляционная матрица' } },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default () => (
  <ErrorBoundary>
    <Lab4 />
  </ErrorBoundary>
);