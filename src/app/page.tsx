'use client';

import { useState, useEffect } from 'react';

interface SpyCat {
  id: number;
  name: string;
  years_of_experience: number;
  breed: string;
  salary: number;
}

export default function SpyCatsPage() {
  const [cats, setCats] = useState<SpyCat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchCats = async () => {
    try {
      setError('');
      const res = await fetch(`${API_URL}/api/cats`);
      if (!res.ok) throw new Error('Failed to fetch cats');
      const data: SpyCat[] = await res.json();
      setCats(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load spy cats. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading spy cats...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">🐱 Spy Cat Agency</h1>
            <p className="mt-1 text-sm text-gray-600">Manage your elite spy cats</p>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Active Spy Cats ({cats.length})
            </h2>

            {cats.length === 0 ? (
              <p className="text-gray-500">No spy cats yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Breed</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cats.map((cat) => (
                      <tr key={cat.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cat.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.years_of_experience} years</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.breed}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${cat.salary.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
