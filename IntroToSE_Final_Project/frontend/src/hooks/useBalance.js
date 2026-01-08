/**
 * useBalance Hook
 * 
 * Custom React Hook để quản lý balance của user với các tính năng:
 * 1. Tự động fetch balance từ API
 * 2. Cache balance vào LocalStorage để load nhanh
 * 3. Auto-refresh khi component mount
 * 4. Manual refresh khi có transaction mới
 * 5. Loading và error states
 * 
 * Performance Optimization:
 * - LocalStorage cache giảm waiting time khi load trang
 * - Stale-while-revalidate pattern: hiển thị cache cũ ngay lập tức, fetch mới ở background
 * - Debounce refresh để tránh gọi API nhiều lần
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { getUserBalance } from '../services/balanceService.js'

// LocalStorage key
const BALANCE_CACHE_KEY = 'app_balance_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 phút

/**
 * Custom Hook: useBalance
 * 
 * @param {Object} options - Options
 * @param {boolean} options.autoRefresh - Tự động refresh khi mount (default: true)
 * @param {number} options.cacheTime - Cache duration in milliseconds (default: 5 phút)
 * 
 * @returns {Object} {
 *   balance: Object | null - Balance data
 *   loading: boolean - Đang loading
 *   error: string | null - Error message
 *   refresh: Function - Manual refresh balance
 *   clearCache: Function - Xóa cache
 * }
 */
export function useBalance(options = {}) {
    const {
        autoRefresh = true,
        cacheTime = CACHE_DURATION
    } = options

    const [balance, setBalance] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    
    // Ref để track nếu đang fetch (tránh duplicate requests)
    const fetchingRef = useRef(false)
    
    // Ref để lưu timeout của debounce
    const debounceTimeoutRef = useRef(null)

    /**
     * Load balance từ LocalStorage cache
     */
    const loadFromCache = useCallback(() => {
        try {
            const cached = localStorage.getItem(BALANCE_CACHE_KEY)
            if (!cached) return null

            const { data, timestamp } = JSON.parse(cached)
            const now = Date.now()

            // Check nếu cache còn valid
            if (now - timestamp < cacheTime) {
                return data
            }

            // Cache hết hạn -> xóa
            localStorage.removeItem(BALANCE_CACHE_KEY)
            return null
        } catch (err) {
            console.error('Error loading balance from cache:', err)
            return null
        }
    }, [cacheTime])

    /**
     * Save balance vào LocalStorage cache
     */
    const saveToCache = useCallback((data) => {
        try {
            const cacheData = {
                data,
                timestamp: Date.now()
            }
            localStorage.setItem(BALANCE_CACHE_KEY, JSON.stringify(cacheData))
        } catch (err) {
            console.error('Error saving balance to cache:', err)
        }
    }, [])

    /**
     * Clear cache
     */
    const clearCache = useCallback(() => {
        try {
            localStorage.removeItem(BALANCE_CACHE_KEY)
        } catch (err) {
            console.error('Error clearing balance cache:', err)
        }
    }, [])

    /**
     * Fetch balance từ API
     */
    const fetchBalance = useCallback(async (showLoading = true) => {
        // Tránh duplicate requests
        if (fetchingRef.current) {
            return
        }

        fetchingRef.current = true
        
        if (showLoading) {
            setLoading(true)
        }
        
        setError(null)

        try {
            const data = await getUserBalance()
            
            setBalance(data)
            saveToCache(data)
            setError(null)
        } catch (err) {
            console.error('Error fetching balance:', err)
            setError(err?.response?.data?.error || err?.message || 'Failed to load balance')
        } finally {
            setLoading(false)
            fetchingRef.current = false
        }
    }, [saveToCache])

    /**
     * Refresh balance (với debounce)
     * Dùng khi user thực hiện transaction mới
     */
    const refresh = useCallback((debounceMs = 300) => {
        // Clear timeout cũ
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current)
        }

        // Set timeout mới
        debounceTimeoutRef.current = setTimeout(() => {
            fetchBalance(false) // Không show loading spinner khi refresh
        }, debounceMs)
    }, [fetchBalance])

    /**
     * Initial load khi component mount
     */
    useEffect(() => {
        if (!autoRefresh) return

        // 1. Load từ cache ngay lập tức (stale-while-revalidate)
        const cached = loadFromCache()
        if (cached) {
            setBalance(cached)
        }

        // 2. Fetch mới từ API ở background
        fetchBalance(!cached) // Chỉ show loading nếu không có cache

        // Cleanup
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
            }
        }
    }, [autoRefresh, loadFromCache, fetchBalance])

    return {
        balance,
        loading,
        error,
        refresh,
        clearCache
    }
}

export default useBalance
