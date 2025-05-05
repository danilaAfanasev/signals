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
  generateRectangularPulse,
  generateGaussianPulse,
  generateExponentialPulse,
  generateSincPulse,
  generateTriangularPulse,
  computeSpectrum,
} from '../utils/signalUtils3';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Lab3 = () => {
  // Параметры
  const t = generateTimeAxis(-5, 5, 2000);
  const dt = t[1] - t[0];
  const A = 1;
  const T = 1;
  const sigma = 1;
  const alpha = 1;
  const t0 = 0;

  // Генерация сигналов
  const rectangular = generateRectangularPulse(t, A, T);
  const gaussian = generateGaussianPulse(t, A, sigma, t0);
  const exponential = generateExponentialPulse(t, A, alpha);
  const sinc = generateSincPulse(t, A, T);
  const triangular = generateTriangularPulse(t, A, T);

  const signals = [rectangular, gaussian, exponential, sinc, triangular];
  const titles = ['Прямоугольный', 'Гауссов', 'Эксп. затухающий', 'sinc', 'Треугольный'];

  // Огибающие
  const envelopeData = signals.map((signal, index) => ({
    labels: t,
    datasets: [
      {
        label: titles[index],
        data: signal,
        borderColor: ['blue', 'green', 'red', 'purple', 'orange'][index],
        fill: false,
      },
    ],
  }));

  // Спектры
  const spectraData = signals.map((signal, index) => {
    const { amplitudes, frequencies } = computeSpectrum(signal, dt);
    return {
      labels: frequencies,
      datasets: [
        {
          label: titles[index],
          data: amplitudes,
          borderColor: ['blue', 'green', 'red', 'purple', 'orange'][index],
          fill: false,
        },
      ],
    };
  });

  // Параметры для анализа (A, T/σ/α от 1 до 19)
  const parameters = [
    { A: 1, T: 1, sigma: 1, alpha: 1 },
    { A: 1, T: 5, sigma: 5, alpha: 5 },
    { A: 1, T: 19, sigma: 19, alpha: 19 },
    { A: 19, T: 1, sigma: 1, alpha: 1 },
  ];

  // Спектры для анализа
  const rectangularSpectra = parameters.map(({ A, T }) => {
    const signal = generateRectangularPulse(t, A, T);
    const { amplitudes, frequencies } = computeSpectrum(signal, dt);
    return {
      labels: frequencies.slice(0, frequencies.length / 2),
      datasets: [
        {
          label: `A=${A}, T=${T}`,
          data: amplitudes.slice(0, amplitudes.length / 2),
          borderColor: `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.7)`,
          fill: false,
        },
      ],
    };
  });

  const gaussianSpectra = parameters.map(({ A, sigma }) => {
    const signal = generateGaussianPulse(t, A, sigma, t0);
    const { amplitudes, frequencies } = computeSpectrum(signal, dt);
    return {
      labels: frequencies.slice(0, frequencies.length / 2),
      datasets: [
        {
          label: `A=${A}, σ=${sigma}`,
          data: amplitudes.slice(0, amplitudes.length / 2),
          borderColor: `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.7)`,
          fill: false,
        },
      ],
    };
  });

  const exponentialSpectra = parameters.map(({ A, alpha }) => {
    const signal = generateExponentialPulse(t, A, alpha);
    const { amplitudes, frequencies } = computeSpectrum(signal, dt);
    return {
      labels: frequencies.slice(0, frequencies.length / 2),
      datasets: [
        {
          label: `A=${A}, α=${alpha}`,
          data: amplitudes.slice(0, amplitudes.length / 2),
          borderColor: `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.7)`,
          fill: false,
        },
      ],
    };
  });

  const sincSpectra = parameters.map(({ A, T }) => {
    const signal = generateSincPulse(t, A, T);
    const { amplitudes, frequencies } = computeSpectrum(signal, dt);
    return {
      labels: frequencies.slice(0, frequencies.length / 2),
      datasets: [
        {
          label: `A=${A}, T=${T}`,
          data: amplitudes.slice(0, amplitudes.length / 2),
          borderColor: `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.7)`,
          fill: false,
        },
      ],
    };
  });

  const triangularSpectra = parameters.map(({ A, T }) => {
    const signal = generateTriangularPulse(t, A, T);
    const { amplitudes, frequencies } = computeSpectrum(signal, dt);
    return {
      labels: frequencies.slice(0, frequencies.length / 2),
      datasets: [
        {
          label: `A=${A}, T=${T}`,
          data: amplitudes.slice(0, amplitudes.length / 2),
          borderColor: `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.7)`,
          fill: false,
        },
      ],
    };
  });

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
  };

  const spectrumOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Spectrum Visualization' },
    },
    scales: {
      x: {
        title: { display: true, text: 'Частота (Гц)' },
        min: -10,
        max: 100,
      },
      y: {
        title: { display: true, text: 'Амплитуда (отн.)' },
        min: 0,
        max: 1.2,
      },
    },
  };

  const spectrumAnalysisOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Spectrum Analysis' },
    },
    scales: {
      x: {
        title: { display: true, text: 'Частота (Гц)' },
        min: 0,
        max: 50,
      },
      y: {
        title: { display: true, text: 'Амплитуда (отн.)' },
        min: 0,
        max: 1.2,
      },
    },
  };

  return (
    <div>
      <h2>Lab 3: Aperiodic Signal Analysis</h2>

      {/* Огибающие */}
      <h3>Огибающие апериодических сигналов</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {envelopeData.map((data, index) => (
          <div key={index}>
            <h4>{titles[index]} импульс</h4>
            <Line data={data} options={options} />
          </div>
        ))}
      </div>

      {/* Спектры */}
      <h3>Амплитудные спектры апериодических сигналов</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {spectraData.map((data, index) => (
          <div key={index}>
            <h4>АЧХ: {titles[index]} импульс</h4>
            <Line data={data} options={spectrumOptions} />
          </div>
        ))}
      </div>

      {/* Анализ влияния параметров */}
      <h3>Анализ влияния параметров на спектры</h3>
      {/* Прямоугольный импульс */}
      <div>
        <h4>Прямоугольный импульс</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {rectangularSpectra.map((data, index) => (
            <div key={index}>
              <h5>{data.datasets[0].label}</h5>
              <Line data={data} options={spectrumAnalysisOptions} />
            </div>
          ))}
        </div>
      </div>

      {/* Гауссов импульс */}
      <div>
        <h4>Гауссов импульс</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {gaussianSpectra.map((data, index) => (
            <div key={index}>
              <h5>{data.datasets[0].label}</h5>
              <Line data={data} options={spectrumAnalysisOptions} />
            </div>
          ))}
        </div>
      </div>

      {/* Экспоненциально затухающий импульс */}
      <div>
        <h4>Экспоненциально затухающий импульс</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {exponentialSpectra.map((data, index) => (
            <div key={index}>
              <h5>{data.datasets[0].label}</h5>
              <Line data={data} options={spectrumAnalysisOptions} />
            </div>
          ))}
        </div>
      </div>

      {/* Sinc-импульс */}
      <div>
        <h4>Sinc-импульс</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {sincSpectra.map((data, index) => (
            <div key={index}>
              <h5>{data.datasets[0].label}</h5>
              <Line data={data} options={spectrumAnalysisOptions} />
            </div>
          ))}
        </div>
      </div>

      {/* Треугольный импульс */}
      <div>
        <h4>Треугольный импульс</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {triangularSpectra.map((data, index) => (
            <div key={index}>
              <h5>{data.datasets[0].label}</h5>
              <Line data={data} options={spectrumAnalysisOptions} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Lab3;