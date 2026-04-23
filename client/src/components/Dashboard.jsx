import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const initialForm = {
  title: '',
  description: '',
  category: 'Academic',
};

const Dashboard = () => {
  const [grievances, setGrievances] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const student = JSON.parse(localStorage.getItem('student') || 'null');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchGrievances = async (search = '') => {
    setError('');
    try {
      const query = search ? `?title=${encodeURIComponent(search)}` : '';
      const response = await axios.get(`${API_URL}/grievances${query}`, { headers });
      setGrievances(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to fetch grievances');
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      if (editId) {
        await axios.put(`${API_URL}/grievances/${editId}`, form, { headers });
        setMessage('Grievance updated successfully');
      } else {
        await axios.post(`${API_URL}/grievances`, form, { headers });
        setMessage('Grievance submitted successfully');
      }

      setEditId('');
      setForm(initialForm);
      fetchGrievances(searchTerm);
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  const handleEdit = (grievance) => {
    setEditId(grievance._id);
    setForm({
      title: grievance.title,
      description: grievance.description,
      category: grievance.category,
    });
    setMessage('');
    setError('');
  };

  const handleDelete = async (id) => {
    setError('');
    setMessage('');

    try {
      await axios.delete(`${API_URL}/grievances/${id}`, { headers });
      setMessage('Grievance deleted successfully');
      fetchGrievances(searchTerm);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('student');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="top-bar">
        <div>
          <h1>Student Dashboard</h1>
          <p>Welcome, {student?.name || 'Student'}</p>
        </div>
        <button onClick={handleLogout} className="danger-button" type="button">
          Logout
        </button>
      </div>

      {message ? <p className="success-text">{message}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <section className="panel">
        <h2>{editId ? 'Update Grievance' : 'Submit Grievance'}</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <input
            name="title"
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
          />
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="Academic">Academic</option>
            <option value="Hostel">Hostel</option>
            <option value="Transport">Transport</option>
            <option value="Other">Other</option>
          </select>

          <div className="row-actions">
            <button type="submit">{editId ? 'Update' : 'Submit'}</button>
            {editId ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setEditId('');
                  setForm(initialForm);
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>Search</h2>
        <div className="search-row">
          <input
            type="text"
            placeholder="Search by title"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <button type="button" onClick={() => fetchGrievances(searchTerm)}>
            Search
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setSearchTerm('');
              fetchGrievances('');
            }}
          >
            Reset
          </button>
        </div>
      </section>

      <section className="panel">
        <h2>Your Grievances ({grievances.length})</h2>
        {grievances.length === 0 ? (
          <p>No grievances found.</p>
        ) : (
          <div className="grievance-list">
            {grievances.map((grievance) => (
              <article key={grievance._id} className="grievance-card">
                <h3>{grievance.title}</h3>
                <p>{grievance.description}</p>
                <p className="meta-line">
                  Category: {grievance.category} | Status: {grievance.status} | Date:{' '}
                  {new Date(grievance.date).toLocaleDateString()}
                </p>
                <div className="row-actions">
                  <button type="button" onClick={() => handleEdit(grievance)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => handleDelete(grievance._id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
