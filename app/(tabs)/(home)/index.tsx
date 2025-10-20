
import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { ScrollView, View, Text, Pressable, StyleSheet, Platform, Alert } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialRecords } from "@/hooks/useFinancialRecords";
import { MCC_NAMES } from "@/types/financial";

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  const tassaData = useFinancialRecords('tassa');
  const falgoreData = useFinancialRecords('falgore');
  const dawanauData = useFinancialRecords('dawanau');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          }
        },
      ]
    );
  };

  const renderHeaderRight = () => (
    <Pressable
      onPress={handleLogout}
      style={styles.headerButton}
    >
      <IconSymbol name="rectangle.portrait.and.arrow.right" color={colors.primary} size={24} />
    </Pressable>
  );

  const mccData = [
    { id: 'tassa', name: MCC_NAMES.tassa, data: tassaData, color: '#007bff' },
    { id: 'falgore', name: MCC_NAMES.falgore, data: falgoreData, color: '#28a745' },
    { id: 'dawanau', name: MCC_NAMES.dawanau, data: dawanauData, color: '#ffc107' },
  ];

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Financial Records",
          headerRight: renderHeaderRight,
        }}
      />
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Kano Dairy Cooperative Federation
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Financial Records Dashboard
          </Text>
        </View>

        {mccData.map((mcc) => {
          const summary = mcc.data.calculateSummary();
          const isProfit = summary.profitLoss >= 0;

          return (
            <Pressable
              key={mcc.id}
              style={[styles.card, { backgroundColor: theme.colors.card }]}
              onPress={() => router.push(`/mcc/${mcc.id}`)}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.colorIndicator, { backgroundColor: mcc.color }]} />
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                  {mcc.name}
                </Text>
                <IconSymbol name="chevron.right" color={colors.textSecondary} size={20} />
              </View>

              <View style={styles.cardContent}>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Total Income
                  </Text>
                  <Text style={[styles.statValue, { color: colors.accent }]}>
                    {formatCurrency(summary.totalIncome)}
                  </Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Total Expenses
                  </Text>
                  <Text style={[styles.statValue, { color: colors.error }]}>
                    {formatCurrency(summary.totalExpenses)}
                  </Text>
                </View>

                <View style={[styles.statRow, styles.profitRow]}>
                  <Text style={[styles.statLabel, { color: theme.colors.text, fontWeight: '700' }]}>
                    {isProfit ? 'Profit' : 'Loss'}
                  </Text>
                  <Text style={[
                    styles.statValue, 
                    styles.profitValue,
                    { color: isProfit ? colors.accent : colors.error }
                  ]}>
                    {formatCurrency(Math.abs(summary.profitLoss))}
                  </Text>
                </View>

                <View style={styles.recordCount}>
                  <IconSymbol name="doc.text" color={colors.textSecondary} size={16} />
                  <Text style={[styles.recordCountText, { color: colors.textSecondary }]}>
                    {summary.recordCount} records
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={[styles.viewDetailsText, { color: colors.primary }]}>
                  View Details
                </Text>
              </View>
            </Pressable>
          );
        })}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Developed for Kano Dairy Cooperative Federation
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 120,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  colorIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  cardContent: {
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
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
  recordCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  recordCountText: {
    fontSize: 13,
  },
  cardFooter: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewDetailsText: {
    fontSize: 15,
    fontWeight: '600',
  },
  headerButton: {
    padding: 8,
  },
  footer: {
    marginTop: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
