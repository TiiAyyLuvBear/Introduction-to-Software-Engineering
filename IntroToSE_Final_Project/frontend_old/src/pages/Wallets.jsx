import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Wallet,
  Plus,
  CreditCard,
  Briefcase,
  PiggyBank,
  Users,
} from "lucide-react";
import { walletAPI } from "../api.js";
import WalletDetailView from "../components/wallet/WalletDetailView.jsx";
import Chatbot from "../components/chatbot/Chatbot.jsx";

/**
 * Wallets Component - Use Case U010: Create Wallet
 */
export default function Wallets() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWalletDetail, setShowWalletDetail] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [currentUserId] = useState("user123"); // TODO: get from auth
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit: handleFormSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      type: "Cash",
      initialBalance: "",
      currency: "USD",
      description: "",
      isShared: false,
    },
  });

  // Load wallets
  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getUserWallets();
      if (response.success) {
        setWallets(response.data.wallets || []);
      }
    } catch (error) {
      console.error("Failed to load wallets:", error);
      setSubmitError(error.response?.data?.error || error.message || 'Failed to load wallets');
      setWallets([]);
    } finally {
      setLoading(false);
    }
  };

  // Wallet type options
  const walletTypes = [
    {
      value: "Cash",
      label: "Cash",
      icon: CreditCard,
      description: "Physical money and coins",
    },
    {
      value: "Bank",
      label: "Bank Account",
      icon: Briefcase,
      description: "Bank savings or checking account",
    },
    {
      value: "Savings",
      label: "Savings",
      icon: PiggyBank,
      description: "Long-term savings account",
    },
  ];

  const currencies = [
    { value: "USD", label: "USD ($)", symbol: "$" },
    { value: "VND", label: "VND (₫)", symbol: "₫" },
    { value: "EUR", label: "EUR (€)", symbol: "€" },
    { value: "JPY", label: "JPY (¥)", symbol: "¥" },
  ];

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const startTime = Date.now();

      const walletData = {
        name: data.name.trim(),
        type: data.type,
        initialBalance: parseFloat(data.initialBalance || 0),
        currency: data.currency,
        description: data.description.trim(),
        isShared: data.isShared || false,
      };

      const response = await walletAPI.createWallet(walletData);

      if (response.success) {
        setWallets((prev) => [response.data, ...prev]);
        reset();
        setShowCreateModal(false);

        const endTime = Date.now();
        console.log(`Wallet created in ${endTime - startTime}ms`);
      } else {
        setSubmitError(response.error || "Failed to create wallet");
      }
    } catch (error) {
      console.error("Error creating wallet:", error);
      if (error.response?.data?.code === "DUPLICATE_WALLET_NAME") {
        setSubmitError("Wallet name already in use");
      } else if (error.response?.data?.error) {
        setSubmitError(error.response.data.error);
      } else {
        setSubmitError("Failed to create wallet. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWalletClick = (wallet) => {
    setSelectedWallet(wallet);
    setShowWalletDetail(true);
  };

  const handleCloseWalletDetail = () => {
    setShowWalletDetail(false);
    setSelectedWallet(null);
    loadWallets();
  };

  const totalBalance = wallets.reduce((sum, wallet) => {
    const balance =
      wallet.currency === "USD"
        ? wallet.balance || wallet.currentBalance
        : (wallet.balance || wallet.currentBalance) * 0.00004;
    return sum + balance;
  }, 0);

  const getWalletIcon = (type) => {
    const iconMap = {
      Cash: CreditCard,
      Bank: Briefcase,
      Savings: PiggyBank,
    };
    const IconComponent = iconMap[type] || Wallet;
    return <IconComponent className="w-full h-full text-white" />;
  };

  const formatCurrency = (amount, currency) => {
    const currencyInfo = currencies.find((c) => c.value === currency);
    const symbol = currencyInfo ? currencyInfo.symbol : "$";
    return `${symbol}${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            {/* Outer rotating circle */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-purple-500 border-b-transparent border-l-transparent animate-spin"></div>
            
            {/* Inner pulsing wallet icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Wallet className="w-10 h-10 text-blue-500 animate-pulse" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Wallets</h3>
          <p className="text-gray-600">Please wait while we fetch your data...</p>
          
          {/* Loading dots animation */}
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">My Wallets</h2>
        <p className="text-gray-600">Manage your personal and shared wallets</p>
      </div>

      {/* Total Balance */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg p-6 mb-8 max-w-md transform hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-white">
        <div className="flex justify-between items-center mb-4">
          <span className="text-white font-semibold text-lg">Total Balance</span>
          <Wallet className="w-10 h-10 text-white animate-bounce" />
        </div>
        <div className="text-4xl font-bold text-white mb-2">
          ${totalBalance.toFixed(2)}
        </div>
        <div className="text-blue-100 text-sm font-medium">
          Across {wallets.length} wallets
        </div>
      </div>

      {/* Add Wallet Button */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Your Wallets</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Wallet
        </button>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            onClick={() => handleWalletClick(wallet)}
            className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md hover:shadow-2xl p-6 border-2 border-blue-200 hover:border-blue-400 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:rotate-12">
                  {getWalletIcon(wallet.type)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">{wallet.name}</h4>
                  <p className="text-sm text-gray-600 font-medium">{wallet.type}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  wallet.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {wallet.status}
              </span>
            </div>

            <div className="text-2xl font-bold text-gray-800 mb-2">
              {formatCurrency(wallet.balance || wallet.currentBalance, wallet.currency)}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Created {new Date(wallet.createdAt).toLocaleDateString()}</span>
              {wallet.isShared && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                  Shared
                </span>
              )}
            </div>

            <div className="pt-3 border-t border-gray-200 mt-3">
              {wallet.isShared ? (
                <div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>{wallet.memberCount || 0} members</span>
                    {wallet.pendingInvitations > 0 && (
                      <span className="text-orange-600 text-xs bg-orange-50 px-2 py-1 rounded">
                        {wallet.pendingInvitations} pending
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    → Click to manage shared wallet
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-500">
                  → Click to view details & transactions
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Wallet Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Create New Wallet</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSubmitError("");
                    reset();
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Form UI (Styled & Icons) */}
              <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6">
                {/* === Wallet Name === */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Wallet Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("name", {
                      required: "Wallet name is required",
                      maxLength: { value: 50, message: "Max 50 characters" },
                      validate: (value) => {
                        const dup = wallets.find(
                          (w) => w.name.toLowerCase() === value.toLowerCase().trim()
                        );
                        return !dup || "Wallet name already exists";
                      },
                    })}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-blue-500 
                    transition-all duration-200 outline-none ${
                      errors.name ? "border-red-400" : "border-gray-300"
                    }`}
                    placeholder="Ex: Family Cash"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* === Wallet Type === */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Wallet Type <span className="text-red-500">*</span>
                  </label>

                  <div className="grid grid-cols-1 gap-3">
                    {walletTypes.map((type) => {
                      const isSelected = watch("type") === type.value;
                      const Icon = type.icon;

                      return (
                        <label
                          key={type.value}
                          className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer 
                            transition-all duration-200 ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 shadow-sm"
                                : "border-gray-300 bg-white hover:bg-gray-50"
                            }`}
                        >
                          <input
                            type="radio"
                            {...register("type")}
                            value={type.value}
                            className="hidden"
                          />

                          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <Icon />
                          </div>

                          <div>
                            <div className="font-semibold text-gray-800">{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* === Shared Wallet === */}
                <div>
                  <label
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-300 
                    bg-white hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                  >
                    <input type="checkbox" {...register("isShared")} className="w-5 h-5" />

                    <div className="w-10 h-10 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full">
                      <Users />
                    </div>

                    <div>
                      <div className="font-semibold text-gray-800">Shared Wallet</div>
                      <div className="text-xs text-gray-500">
                        Allow multiple users to access this wallet
                      </div>
                    </div>
                  </label>
                </div>

                {/* === Currency === */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Currency</label>
                  <select
                    {...register("currency")}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 
                    focus:ring-2 focus:ring-blue-500 transition-all duration-200 outline-none"
                  >
                    {currencies.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* === Initial Balance === */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Initial Balance</label>
                  <input
                    type="number"
                    {...register("initialBalance", {
                      min: { value: 0, message: "Balance must be ≥ 0" },
                    })}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 outline-none 
                    focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                      errors.initialBalance ? "border-red-400" : "border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                  {errors.initialBalance && (
                    <p className="text-sm text-red-500 mt-1">{errors.initialBalance.message}</p>
                  )}
                </div>

                {/* === Description === */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
                  <textarea
                    {...register("description", {
                      maxLength: { value: 200, message: "Max 200 characters" },
                    })}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 resize-none 
                    focus:ring-2 focus:ring-blue-500 transition-all duration-200 outline-none ${
                      errors.description ? "border-red-400" : "border-gray-300"
                    }`}
                    placeholder="Optional note..."
                  ></textarea>
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {watch("description")?.length || 0}/200
                  </div>
                </div>

                {/* === Error === */}
                {submitError && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-red-700 text-sm">
                    {submitError}
                  </div>
                )}

                {/* === Buttons === */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setSubmitError("");
                      reset();
                    }}
                    className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold 
                    hover:bg-gray-100 transition-all duration-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl text-white font-semibold 
                    bg-gradient-to-r from-blue-500 to-purple-600 
                    hover:from-blue-600 hover:to-purple-700
                    disabled:opacity-50 transition-all duration-200"
                  >
                    {isSubmitting ? "Creating..." : "Create Wallet"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {wallets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">
            <Wallet />
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">No wallets yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first wallet to start managing your finances
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Create Your First Wallet
          </button>
        </div>
      )}

      {/* Wallet Detail */}
      {showWalletDetail && selectedWallet && (
        <WalletDetailView
          wallet={selectedWallet}
          currentUserId={currentUserId}
          onClose={handleCloseWalletDetail}
          onWalletUpdate={loadWallets}
        />
      )}

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}
