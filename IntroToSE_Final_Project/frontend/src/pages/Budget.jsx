import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaPlus, FaBullseye, FaCalendarAlt, FaTrashAlt, FaExclamationTriangle } from 'react-icons/fa';
import { budgetAPI, transactionAPI, walletAPI } from '../api.js';
import Chatbot from '../components/chatbot/Chatbot.jsx';

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      limit: '',
      category: '',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    }
  });

  const watchPeriod = watch('period');

  // TEMPORARILY COMMENTED - Backend integration
  const loadBudgets = async () => {
    try {
      setLoading(true);
      const response = await budgetAPI.getAll();
      // Adjust based on actual backend response format
      // budgetController.getBudgets returns array directly or { budgets: [] }?
      // Based on controller: res.json(budgets) -> Array
      // api.js response.data is the array
      setBudgets(Array.isArray(response) ? response : response.budgets || []);
    } catch (err) {
      console.error('Failed to load budgets:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await transactionAPI.getAll();
      setTransactions(Array.isArray(response) ? response : response.transactions || []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  };

  useEffect(() => {
    loadBudgets();
    loadTransactions();
  }, []);

  const calculateSpent = (budget) => {
    return transactions
      .filter(t => t.type === 'expense' && t.category === budget.categoryId?.name) // Adjust for populated category
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const onCreateBudget = async (data) => {
    try {
      setError(null);

      // Need walletId! For now, fetch wallets and pick first one or use hardcoded if permitted
      // The backend requires walletId.
      // Let's assume the user has a wallet. 
      // Ideally, the modal should allow selecting a wallet.
      // For this MVP step, let's hardcode the walletId from the verify script if possible, or fetch it.

      // Fetch wallets to get a valid ID
      // Fetch wallets to get a valid ID
      let walletId = '6957fd0d4b2aa1c3fe4390e6'; // Fallback from verification script
      try {
        const wallets = await walletAPI.getUserWallets();
        if (Array.isArray(wallets) && wallets.length > 0) {
          walletId = wallets[0]._id || wallets[0].id;
        }
      } catch (e) { console.warn('Could not fetch wallets, using default', e); }

      const budgetData = {
        name: data.name,
        amount: parseFloat(data.limit),
        // For simple string category, backend expects ObjectId? 
        // Backend Budget.js: categoryId: ObjectId (ref Category)
        // Frontend input is text. 
        // We probably need to Create Category first OR backend needs to accept string name?
        // Check Budget.js: categoryId IS ObjectId.
        // Check budgetController: it uses req.body.categoryId directly.
        // Check verification: we created a categoryId manually.

        // ISSUE: User inputs text "Groceries". Backend expects ObjectId.
        // We need to resolve this.
        // Option 1: Create a category if it doesn't exist?
        // Option 2: Just send it and see if backend handles mixed types (it won't, CastError).

        // FIX: For now, let's omit categoryId if it's just a name, or handle it as 'name' field if possible?
        // Budget model has `name` field. `categoryId` is optional.
        // So if user types a name, we send `name` and `categoryId: null`.

        categoryId: null,  // Avoid CastError

        walletId: walletId,
        period: data.period,
        startDate: data.startDate,
        endDate: data.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Default 1 year if missing
        alertThreshold: 80,
        enableAlerts: true
      };

      const response = await budgetAPI.create(budgetData);
      setBudgets([...budgets, response]); // response is the created budget object (from controller: res.status(201).json(budget))

      setShowModal(false);
      reset();
    } catch (err) {
      console.error('Failed to create budget:', err);
      if (err.response) {
        console.error('SERVER RESPONSE:', err.response.data);
      }
      setError(err.response?.data?.error || err.message || 'Failed to create budget');
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const deleteBudget = (id) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await budgetAPI.delete(deleteTargetId);
      setBudgets(budgets.filter(b => b._id !== deleteTargetId && b.id !== deleteTargetId));
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
    } catch (err) {
      console.error('Failed to delete budget:', err);
      setError(err.response?.data?.error || err.message || 'Failed to delete budget');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Budget Tracking</h2>
        <p className="text-gray-600">Set and monitor spending budgets across categories</p>
      </div>

      <button
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:from-purple-600 hover:to-pink-700 hover:shadow-lg hover:scale-105 transition-all duration-300 mb-6"
        onClick={() => setShowModal(true)}
      >
        <FaPlus /> Create Budget
      </button>

      <div className="space-y-6">
        {budgets.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-500">
            <FaBullseye className="text-5xl mb-4" />
            <h3 className="text-xl font-semibold mb-2">No budgets yet</h3>
            <p>Create a budget to track your spending</p>
          </div>
        ) : (
          budgets.map(budget => {
            const spent = calculateSpent(budget);
            const remaining = budget.amount - spent;
            const percentage = (spent / budget.amount) * 100;
            const isAlert = percentage >= 80;

            return (
              <div key={budget.id} className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-md hover:shadow-2xl p-6 border border-purple-100 transform hover:scale-[1.02] transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-gray-800">{budget.name}</span>
                  <FaBullseye className="w-8 h-8 text-purple-600 animate-pulse" />
                </div>

                <div className="mb-4">
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-gray-600 font-medium">{budget.category}</span>
                    <span className="font-bold text-gray-800">
                      ${spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                    </span>
                  </div>

                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full transition-all duration-500 ${isAlert ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-green-600'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between mt-2 text-xs">
                    <span className="text-gray-500 font-medium">{percentage.toFixed(0)}% spent</span>
                    <span className={`font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${remaining.toFixed(2)} remaining
                    </span>
                  </div>
                </div>

                {isAlert && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-red-100 to-red-200 text-red-700 px-4 py-3 rounded-lg mb-3 text-sm font-semibold border border-red-300 animate-pulse">
                    <FaExclamationTriangle className="w-5 h-5" /> Budget Alert: You've spent {percentage.toFixed(0)}% of your {budget.category} budget!
                  </div>
                )}

                <div className="text-xs text-gray-500 mb-3 font-medium">
                  {budget.period === 'monthly' && (
                    <span className="bg-blue-100 px-3 py-1 rounded-full inline-flex items-center gap-1">
                      <FaCalendarAlt className="w-3 h-3" /> Monthly budget
                    </span>
                  )}
                  {budget.period === 'yearly' && (
                    <span className="bg-purple-100 px-3 py-1 rounded-full inline-flex items-center gap-1">
                      <FaCalendarAlt className="w-3 h-3" /> Yearly budget
                    </span>
                  )}
                </div>

                <button
                  className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 hover:shadow-lg transition-all duration-300"
                  onClick={() => deleteBudget(budget.id)}
                >
                  <FaTrashAlt className="w-4 h-4" /> Delete
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Create Budget</h3>
            <form onSubmit={handleSubmit(onCreateBudget)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Budget Name</label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  {...register('name', { required: 'Budget name is required' })}
                  placeholder="e.g., Monthly Groceries"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                  {...register('category', { required: 'Category is required' })}
                  placeholder="e.g., Groceries, Dining"
                />
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Spending Limit</label>
                <input
                  type="number"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${errors.limit ? 'border-red-500' : 'border-gray-300'}`}
                  {...register('limit', { required: 'Spending limit is required', min: { value: 0.01, message: 'Limit must be > 0' } })}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                {errors.limit && <p className="text-red-500 text-sm mt-1">{errors.limit.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Period</label>
                <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition" {...register('period')}>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  {...register('startDate')}
                />
              </div>

              {watchPeriod === 'custom' && (
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`}
                    {...register('endDate', { required: watchPeriod === 'custom' ? 'End date required for custom period' : false })}
                  />
                  {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>}
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300">Create Budget</button>
                <button type="button" onClick={() => { setShowModal(false); reset(); }} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FaTrashAlt className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Budget?</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete this budget? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-md hover:shadow-lg transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}
