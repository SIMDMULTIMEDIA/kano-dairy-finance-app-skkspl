
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { useFinancialRecords } from '@/hooks/useFinancialRecords';
import { MCC, MCC_NAMES, FinancialRecord } from '@/types/financial';
import { IconSymbol } from '@/components/IconSymbol';

export default function MCCDetailsScreen() {
  const { id } = useLocalSearchParams();
  const mcc = id as MCC;
  const router = useRouter();
  const theme = useTheme();
  const { records, loading, deleteRecord, calculateSummary } = useFinancialRecords(mcc);
  const [selectedRecord, setSelectedRecord] = useState<FinancialRecord | null>(null);

  const summary = calculateSummary();

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleDelete = (record: FinancialRecord) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteRecord(record.id);
            if (success) {
              Alert.alert('Success', 'Record deleted successfully');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (record: FinancialRecord) => {
    router.push({
      pathname: '/edit-record',
      params: { mcc, recordId: record.id, recordData: JSON.stringify(record) },
    });
  };

  const handleAddNew = () => {
    router.push({
      pathname: '/add-record',
      params: { mcc },
    });
  };

  const renderHeaderRight = () => (
    <Pressable onPress={handleAddNew} style={styles.headerButton}>
      <IconSymbol name="plus.circle.fill" color={colors.primary} size={28} />
    </Pressable>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: MCC_NAMES[mcc],
          headerRight: renderHeaderRight,
        }}
      />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Income:</Text>
            <Text style={[styles.summaryValue, { color: colors.accent }]}>
              {formatCurrency(summary.totalIncome)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Expenses:</Text>
            <Text style={[styles.summaryValue, { color: colors.error }]}>
              {formatCurrency(summary.totalExpenses)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.profitRow]}>
            <Text style={[styles.summaryLabel, { color: theme.colors.text, fontWeight: '700' }]}>
              {summary.profitLoss >= 0 ? 'Profit:' : 'Loss:'}
            </Text>
            <Text style={[
              styles.summaryValue,
              styles.profitValue,
              { color: summary.profitLoss >= 0 ? colors.accent : colors.error }
            ]}>
              {formatCurrency(Math.abs(summary.profitLoss))}
            </Text>
          </View>
        </View>

        <ScrollView 
          style={styles.recordsList}
          contentContainerStyle={styles.recordsListContent}
        >
          {loading ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Loading...</Text>
          ) : records.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="doc.text" color={colors.textSecondary} size={48} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No records yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Tap the + button to add your first record
              </Text>
            </View>
          ) : (
            records.map((record) => (
              <View key={record.id} style={[styles.recordCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.recordHeader}>
                  <Text style={[styles.recordDate, { color: colors.textSecondary }]}>
                    {formatDate(record.date)}
                  </Text>
                  <View style={styles.recordActions}>
                    <Pressable onPress={() => handleEdit(record)} style={styles.actionButton}>
                      <IconSymbol name="pencil" color={colors.primary} size={20} />
                    </Pressable>
                    <Pressable onPress={() => handleDelete(record)} style={styles.actionButton}>
                      <IconSymbol name="trash" color={colors.error} size={20} />
                    </Pressable>
                  </View>
                </View>

                <Text style={[styles.recordDescription, { color: theme.colors.text }]}>
                  {record.description}
                </Text>

                <View style={styles.recordCategory}>
                  <IconSymbol name="tag" color={colors.textSecondary} size={14} />
                  <Text style={[styles.recordCategoryText, { color: colors.textSecondary }]}>
                    {record.category}
                  </Text>
                </View>

                <View style={styles.recordAmounts}>
                  {record.income > 0 && (
                    <View style={styles.amountRow}>
                      <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Income:</Text>
                      <Text style={[styles.amountValue, { color: colors.accent }]}>
                        {formatCurrency(record.income)}
                      </Text>
                    </View>
                  )}
                  {record.expense > 0 && (
                    <View style={styles.amountRow}>
                      <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Expense:</Text>
                      <Text style={[styles.amountValue, { color: colors.error }]}>
                        {formatCurrency(record.expense)}
                      </Text>
                    </View>
                  )}
                </View>

                {record.note && (
                  <Text style={[styles.recordNote, { color: colors.textSecondary }]}>
                    Note: {record.note}
                  </Text>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryCard: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  profitRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  profitValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  recordsList: {
    flex: 1,
  },
  recordsListContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 120,
  },
  recordCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordDate: {
    fontSize: 13,
  },
  recordActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  recordDescription: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  recordCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  recordCategoryText: {
    fontSize: 13,
  },
  recordAmounts: {
    gap: 6,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
  },
  amountValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  recordNote: {
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
  headerButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
