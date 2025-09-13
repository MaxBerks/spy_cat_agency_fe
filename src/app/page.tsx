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
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [cats, setCats] = useState<SpyCat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    years_of_experience: '',
    breed: '',
    salary: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingCat, setEditingCat] = useState<number | null>(null);
  const [editSalary, setEditSalary] = useState('');

  useEffect(() => {
    fetchCats();
  }, []);

  const prettify = (s: string) => {
    let msg = s.trim();

    msg = msg.replace(/^body\./i, '');
    msg = msg.replace(/_/g, ' ');

    if (/enum/i.test(msg)) {
      return 'Invalid breed. Please use a valid breed name.';
    }
    const m = msg.match(/invalid breed[:\s]*'?([^'"]+)'?/i);
    if (m) {
      return `Invalid breed: ${m[1]}. Please use a valid breed name.`;
    }

    msg = msg.replace(/value error[:,]?\s*/i, '');
    msg = msg.replace(/^breed[:\s-]*/i, 'Invalid breed. ');
    msg = msg.replace(/\s+/g, ' ').trim();

    return msg.charAt(0).toUpperCase() + msg.slice(1);
  };

  const getApiErrorMessage = (data: any): string => {
    if (!data) return 'Unknown error';
    if (typeof data === 'string') return prettify(data);
    if (data.detail) {
      const d = data.detail;
      if (typeof d === 'string') return prettify(d);
      if (Array.isArray(d)) {
        return d
          .map((e: any) => {
            const loc = Array.isArray(e.loc)
              ? e.loc.filter((x: any) => typeof x === 'string').join('.')
              : '';
            const raw = e.msg || e.message || '';
            const combined = loc ? `${loc}: ${raw}` : raw;
            return prettify(combined);
          })
          .filter(Boolean)
          .join('; ');
      }
      if (typeof d === 'object' && d.message) return prettify(d.message);
    }
    if (data.message) return prettify(data.message);
    try { return prettify(JSON.stringify(data)); } catch { return 'Unknown error'; }
  };


  const isFormInvalid =
    !formData.name.trim() ||
    !formData.breed.trim() ||
    formData.years_of_experience === '' ||
    Number.isNaN(parseInt(formData.years_of_experience, 10)) ||
    formData.salary === '' ||
    Number.isNaN(parseFloat(formData.salary)) ||
    parseFloat(formData.salary) <= 0;

  const handleDelete = async (catId: number) => {
    if (!confirm('Are you sure you want to remove this spy cat?')) return;

    try {
      const res = await fetch(`${API_URL}/api/cats/${catId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete cat');

      setCats(prev => prev.filter(c => c.id !== catId));
    } catch (err) {
      console.error(err);
      setError('Failed to delete spy cat. They might have an active mission.');
    }
  };

  const handleUpdateSalary = async (catId: number) => {
    setError('');
    try {
      const newSalary = parseFloat(editSalary);
      if (Number.isNaN(newSalary) || newSalary <= 0) {
        setError('Salary must be greater than 0');
        return;
      }

      const res = await fetch(`${API_URL}/api/cats/${catId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salary: newSalary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(getApiErrorMessage(data));

      const updatedCat: SpyCat = data;
      setCats(prev => prev.map(c => (c.id === catId ? updatedCat : c)));
      setEditingCat(null);
      setEditSalary('');
    } catch (err: any) {
      setError(err?.message || 'Failed to update salary.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        years_of_experience: parseInt(formData.years_of_experience, 10),
        breed: formData.breed.trim(),
        salary: parseFloat(formData.salary)
      };

      if (
        !payload.name ||
        Number.isNaN(payload.years_of_experience) ||
        !payload.breed ||
        Number.isNaN(payload.salary)
      ) {
        throw new Error('Please fill all fields correctly.');
      }

      if (payload.salary <= 0) {
        throw new Error('Salary must be greater than 0');
      }


      const res = await fetch(`${API_URL}/api/cats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: SpyCat = await res.json();
      if (!res.ok) throw new Error(getApiErrorMessage(data));

      setCats(prev => [...prev, data]);
      setFormData({ name: '', years_of_experience: '', breed: '', salary: '' });
    } catch (err: any) {
      setFormError(err?.message || 'Failed to add spy cat. Please check the breed name.');
    } finally {
      setSubmitting(false);
    }
  };

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

  const currentEditing = cats.find(c => c.id === editingCat);
  const parsedEdit = parseFloat(editSalary);
  const isEditInvalid =
    editSalary === '' ||
    Number.isNaN(parsedEdit) ||
    parsedEdit <= 0 ||
    (currentEditing && parsedEdit === currentEditing.salary);

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
            <h1 className="text-3xl font-bold text-gray-900">🐈‍⬛ Spy Cat Agency</h1>
            <p className="mt-1 text-sm text-gray-600">Manage your elite spy cats</p>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md" role="alert">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Add New Spy Cat</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    placeholder="Agent Whiskers"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.years_of_experience}
                    onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Breed</label>
                  <input
                    type="text"
                    required
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    placeholder="Persian"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Salary ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    placeholder="50000"
                  />
                </div>
              </div>

              {formError && <div className="text-red-600 text-sm">{formError}</div>}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {submitting ? 'Adding...' : 'Add Spy Cat'}
              </button>
            </form>
          </div>


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
                          {editingCat === cat.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editSalary}
                                onChange={(e) => setEditSalary(e.target.value)}
                                className="w-28 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1 border"
                                placeholder={cat.salary.toString()}
                              />
                              <button onClick={() => handleUpdateSalary(cat.id)} disabled={isEditInvalid} className="text-green-600 hover:text-green-900" title="Save">Confirm</button>
                              <button onClick={() => { setEditingCat(null); setEditSalary(''); }} className="text-red-600 hover:text-red-900" title="Cancel">Discard</button>
                            </div>
                          ) : (
                            `$${cat.salary.toLocaleString()}`
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                          {editingCat === cat.id ? null : (
                            <>
                              <button
                                onClick={() => { setEditingCat(cat.id); setEditSalary(cat.salary.toString()); }}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(cat.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </>
                          )}
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
