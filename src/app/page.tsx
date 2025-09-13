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
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">🐱 Spy Cat Agency</h1>
        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
            {error}
          </div>
        ) : (
          <p className="text-gray-600">Active Spy Cats: {cats.length}</p>
        )}
      </div>
    </div>
  );
}
