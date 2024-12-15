import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChoreList = () => {
  const [chores, setChores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChores();
  }, []);

  const fetchChores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/chores', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChores(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch chores');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (choreId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `/api/chores/${choreId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchChores();
    } catch (err) {
      setError('Failed to update chore status');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Chores</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {chores.map((chore) => (
          <div key={chore._id} className="border rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold">{chore.title}</h3>
            <p className="text-gray-600">{chore.description}</p>
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-500">Points: </span>
              <span>{chore.points}</span>
            </div>
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-500">Status: </span>
              <span className={`capitalize ${chore.status === 'completed' ? 'text-green-600' : ''}`}>
                {chore.status}
              </span>
            </div>
            {chore.status !== 'completed' && (
              <button
                onClick={() => handleStatusUpdate(chore._id, 'completed')}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Mark Complete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChoreList; 