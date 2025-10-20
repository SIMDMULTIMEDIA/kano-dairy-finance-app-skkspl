
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { useFinancialRecords } from '@/hooks/useFinancialRecords';
import { MCC, CATEGORIES, FinancialRecord } from '@/types/financial';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EditRecordScreen() {
  const { mcc, recordId, recordData } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const { updateRecord } = useFinancialRecords(mcc as MCC);

  const record: FinancialRecord = JSON.parse(recordData as string);

  const [date, setDate] = useState(new Date(record.date));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [description, setDescription] = useState(record.description);
  const [category, setCategory] = useState(record.category);
  const [income, setIncome] = useState(record.income.toString());
  const [expense, setExpense] = useState(record.expense.toString());
  const [note, setNote] = useState(record.note || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    const incomeValue = parseFloat(income) || 0;
    const expenseValue = parseFloat(expense) || 0;

    if (incomeValue === 0 && expenseValue === 0) {
      Alert.alert('Error', 'Please enter either income or expense amount');
      return;
    }

    setLoading(true);

    const balance = incomeValue - expenseValue;

    const success = await updateRecord(recordId as string, {
      date: date.toISOString().split('T')[0],
      description: description.trim(),
      category,
      income: incomeValue,
      expense: expenseValue,
      balance,
      note: note.trim() || undefined,
    });

    setLoading(false);

    if (success) {
      Alert.alert('Success', 'Record updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('Error', 'Failed to update record');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit Record',
        }}
      />
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
      >
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Date *</Text>
            <Pressable
              style={[styles.dateButton, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: theme.colors.text }}>
                {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
              </Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setDate(selectedDate);
                  }
                }}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Description *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: colors.border }]}
              placeholder="Enter transaction description"
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Category *</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  style={[
                    styles.categoryButton,
                    { 
                      backgroundColor: category === cat ? colors.primary : theme.colors.card,
                      borderColor: category === cat ? colors.primary : colors.border,
                    }
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    { color: category === cat ? '#ffffff' : theme.colors.text }
                  ]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Income (₦)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: colors.border }]}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              value={income}
              onChangeText={setIncome}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Expense (₦)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: colors.border }]}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              value={expense}
              onChangeText={setExpense}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Notes (Optional)</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: colors.border }]}
              placeholder="Add any additional notes..."
              placeholderTextColor={colors.textSecondary}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={4}
            />
          </View>

          <Pressable
            style={[buttonStyles.primary, styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={buttonStyles.text}>
              {loading ? 'Updating...' : 'Update Record'}
            </Text>
          </Pressable>

          <Pressable
            style={[buttonStyles.secondary, styles.cancelButton]}
            onPress={() => router.back()}
          >
            <Text style={buttonStyles.text}>Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  form: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  cancelButton: {
    marginTop: 12,
  },
});
