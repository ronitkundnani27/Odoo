import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import Teams from './pages/Teams';
import Requests from './pages/Requests';
import KanbanBoard from './pages/KanbanBoard';
import Calendar from './pages/Calendar';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/kanban" element={<KanbanBoard />} />
          <Route path="/calendar" element={<Calendar />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
