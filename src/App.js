import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Lab1Page from './pages/Lab1Page';
import Lab2Page from './pages/Lab2Page';
import Lab3Page from './pages/Lab3Page';
import Lab4Page from './pages/Lab4Page';
import './App.css';

const App = () => (
  <Router>
    <Header />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/lab1" element={<Lab1Page />} />
      <Route path="/lab2" element={<Lab2Page />} />
      <Route path="/lab3" element={<Lab3Page />} />
      <Route path="/lab4" element={<Lab4Page />} />
    </Routes>
  </Router>
);

export default App;