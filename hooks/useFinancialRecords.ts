
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FinancialRecord, MCC, MCC_TABLES } from '@/types/financial';
import { supabaseEnabled, mockSupabase } from '@/utils/supabaseClient';

export function useFinancialRecords(mcc: MCC) {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storageKey = `@kano_dairy_${mcc}_records`;

  useEffect(() => {
    loadRecords();
  }, [mcc]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      if (supabaseEnabled) {
        // Load from Supabase when enabled
        console.log('Loading from Supabase...');
        // const { data, error } = await supabase
        //   .from(MCC_TABLES[mcc])
        //   .select('*')
        //   .order('date', { ascending: false });
        // if (error) throw error;
        // setRecords(data || []);
      } else {
        // Load from AsyncStorage
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          setRecords(parsed);
        }
      }
    } catch (err) {
      console.error('Error loading records:', err);
      setError('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async (record: Omit<FinancialRecord, 'id' | 'created_at'>) => {
    try {
      const newRecord: FinancialRecord = {
        ...record,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };

      if (supabaseEnabled) {
        // Add to Supabase when enabled
        console.log('Adding to Supabase...');
      } else {
        // Add to AsyncStorage
        const updatedRecords = [newRecord, ...records];
        await AsyncStorage.setItem(storageKey, JSON.stringify(updatedRecords));
        setRecords(updatedRecords);
      }

      return true;
    } catch (err) {
      console.error('Error adding record:', err);
      setError('Failed to add record');
      return false;
    }
  };

  const updateRecord = async (id: string, updates: Partial<FinancialRecord>) => {
    try {
      if (supabaseEnabled) {
        // Update in Supabase when enabled
        console.log('Updating in Supabase...');
      } else {
        // Update in AsyncStorage
        const updatedRecords = records.map(r => 
          r.id === id ? { ...r, ...updates } : r
        );
        await AsyncStorage.setItem(storageKey, JSON.stringify(updatedRecords));
        setRecords(updatedRecords);
      }

      return true;
    } catch (err) {
      console.error('Error updating record:', err);
      setError('Failed to update record');
      return false;
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      if (supabaseEnabled) {
        // Delete from Supabase when enabled
        console.log('Deleting from Supabase...');
      } else {
        // Delete from AsyncStorage
        const updatedRecords = records.filter(r => r.id !== id);
        await AsyncStorage.setItem(storageKey, JSON.stringify(updatedRecords));
        setRecords(updatedRecords);
      }

      return true;
    } catch (err) {
      console.error('Error deleting record:', err);
      setError('Failed to delete record');
      return false;
    }
  };

  const calculateSummary = () => {
    const totalIncome = records.reduce((sum, r) => sum + r.income, 0);
    const totalExpenses = records.reduce((sum, r) => sum + r.expense, 0);
    const profitLoss = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      profitLoss,
      recordCount: records.length,
    };
  };

  return {
    records,
    loading,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
    calculateSummary,
    refresh: loadRecords,
  };
}
