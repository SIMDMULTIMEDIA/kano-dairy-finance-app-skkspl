
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
        console.log('Loading records from AsyncStorage for:', storageKey);
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('Loaded records:', parsed.length);
          setRecords(parsed);
        } else {
          console.log('No records found in storage');
          setRecords([]);
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
      console.log('Adding record:', record);
      
      const newRecord: FinancialRecord = {
        ...record,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };

      if (supabaseEnabled) {
        // Add to Supabase when enabled
        console.log('Adding to Supabase...');
        // const { data, error } = await supabase
        //   .from(MCC_TABLES[mcc])
        //   .insert([newRecord])
        //   .select();
        // if (error) throw error;
        // await loadRecords(); // Reload to get updated data
      } else {
        // Add to AsyncStorage
        const updatedRecords = [newRecord, ...records];
        console.log('Saving to AsyncStorage:', storageKey);
        await AsyncStorage.setItem(storageKey, JSON.stringify(updatedRecords));
        console.log('Record saved successfully');
        
        // Update local state immediately
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
      console.log('Updating record:', id, updates);
      
      if (supabaseEnabled) {
        // Update in Supabase when enabled
        console.log('Updating in Supabase...');
        // const { error } = await supabase
        //   .from(MCC_TABLES[mcc])
        //   .update(updates)
        //   .eq('id', id);
        // if (error) throw error;
        // await loadRecords(); // Reload to get updated data
      } else {
        // Update in AsyncStorage
        const updatedRecords = records.map(r => 
          r.id === id ? { ...r, ...updates } : r
        );
        console.log('Saving updated records to AsyncStorage:', storageKey);
        await AsyncStorage.setItem(storageKey, JSON.stringify(updatedRecords));
        console.log('Record updated successfully');
        
        // Update local state immediately
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
      console.log('Deleting record:', id);
      
      if (supabaseEnabled) {
        // Delete from Supabase when enabled
        console.log('Deleting from Supabase...');
        // const { error } = await supabase
        //   .from(MCC_TABLES[mcc])
        //   .delete()
        //   .eq('id', id);
        // if (error) throw error;
        // await loadRecords(); // Reload to get updated data
      } else {
        // Delete from AsyncStorage
        const updatedRecords = records.filter(r => r.id !== id);
        console.log('Saving after delete to AsyncStorage:', storageKey);
        await AsyncStorage.setItem(storageKey, JSON.stringify(updatedRecords));
        console.log('Record deleted successfully');
        
        // Update local state immediately
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
