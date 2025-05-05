import { Link } from 'react-router-dom';

const Header = () => (
  <nav style={{ background: '#333', padding: '1rem', color: 'white' }}>
    <Link to="/" style={{ color: 'white', marginRight: '1rem' }}>Главная</Link>
    <Link to="/lab1" style={{ color: 'white', marginRight: '1rem' }}>Лабораторная 1</Link>
    <Link to="/lab2" style={{ color: 'white', marginRight: '1rem' }}>Лабораторная 2</Link>
    <Link to="/lab3" style={{ color: 'white', marginRight: '1rem' }}>Лабораторная 3</Link>
    <Link to="/lab4" style={{ color: 'white', marginRight: '1rem' }}>Лабораторная 4</Link>
  </nav>
);

export default Header;