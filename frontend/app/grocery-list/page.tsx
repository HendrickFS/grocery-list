'use client';

import { useState, useEffect } from 'react';

interface GroceryItem {
  name: string;
  quantity: number;
  status: boolean;
}

export default function GroceryListPage() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1 });
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', quantity: 1 });

  // Ensure component is mounted before rendering (fixes hydration mismatch)
  useEffect(() => {
    setMounted(true);
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/grocery-list/get-list');
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data.items || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;

    try {
      const response = await fetch('http://localhost:3000/grocery-list/add-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItem.name, quantity: newItem.quantity, status: false }),
      });
      if (!response.ok) throw new Error('Failed to add item');
      setNewItem({ name: '', quantity: 1 });
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    }
  };

  const updateItem = async (name: string, quantity: number, status: boolean) => {
    try {
      const response = await fetch('http://localhost:3000/grocery-list/update-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, quantity, status }),
      });
      if (!response.ok) throw new Error('Failed to update item');
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    }
  };

  const deleteItem = async (name: string) => {
    try {
      const response = await fetch('http://localhost:3000/grocery-list/delete-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error('Failed to delete item');
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  const startEdit = (item: GroceryItem) => {
    setEditingItem(item.name);
    setEditForm({ name: item.name, quantity: item.quantity });
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    try {
      // If name changed, delete the old item and create a new one
      if (editingItem !== editForm.name) {
        await fetch('http://localhost:3000/grocery-list/delete-item', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editingItem }),
        });
      }
      
      // Add/update the item with the new name
      const response = await fetch('http://localhost:3000/grocery-list/add-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editForm.name, quantity: editForm.quantity, status: false }),
      });
      if (!response.ok) throw new Error('Failed to save item');
      setEditingItem(null);
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item');
    }
  };

  const cancelEdit = () => {
    setEditingItem(null);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-center text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Grocery List</h1>
          <p className="text-gray-600 mb-8">Manage your shopping items efficiently</p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          {/* Add Item Form */}
          <form onSubmit={addItem} className="mb-8">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Item name..."
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
              <input
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Add
              </button>
            </div>
          </form>

          {/* Items List */}
          <div>
            {loading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : items.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No items in your list. Add one to get started!</p>
            ) : (
              <ul className="space-y-2">
                {items.map((item) =>
                  editingItem === item.name ? (
                    // Edit Form
                    <li key={item.name} className="flex items-center gap-2 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                      />
                      <input
                        type="number"
                        min="1"
                        value={editForm.quantity}
                        onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) })}
                        className="w-16 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                      />
                      <button
                        onClick={saveEdit}
                        className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition text-sm"
                      >
                        Cancel
                      </button>
                    </li>
                  ) : (
                    // Display Item
                    <li key={item.name} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-4 flex-1">
                        <input
                          type="checkbox"
                          checked={item.status}
                          onChange={(e) => updateItem(item.name, item.quantity, e.target.checked)}
                          className="w-5 h-5 text-blue-500 rounded cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className={`font-semibold ${item.status ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteItem(item.name)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  )
                )}
              </ul>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-8">Total items: {items.length}</p>
        </div>
      </div>
    </div>
  );
}
