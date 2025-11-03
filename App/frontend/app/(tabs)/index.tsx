import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Text, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SummaryCard from '@/components/dashboard/SummaryCard';
import { ThemedView } from '@/components/themed-view';
import { importBankSms } from '@/utils/smsImporter';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

type Transaction = {
  _id: string;
  amount: number;
  merchant?: string;
  category?: string;
  date?: string;
  mode?: string;
};

// Dashboard now sources data from SMS inbox; backend optional

// Demo data fallback when API has no transactions yet
const DUMMY_TRANSACTIONS: Transaction[] = [
  { _id: 'd1', amount: 20000, merchant: 'Salary', category: 'Income', date: new Date(Date.now() - 86400000 * 1).toISOString(), mode: 'Bank' },
  { _id: 'd2', amount: -1299, merchant: 'Amazon', category: 'Shopping', date: new Date(Date.now() - 86400000 * 2).toISOString(), mode: 'UPI' },
  { _id: 'd3', amount: -245, merchant: 'Uber', category: 'Transport', date: new Date(Date.now() - 86400000 * 3).toISOString(), mode: 'UPI' },
  { _id: 'd4', amount: -899, merchant: 'Electricity Bill', category: 'Utilities', date: new Date(Date.now() - 86400000 * 4).toISOString(), mode: 'Card' },
  { _id: 'd5', amount: 120, merchant: 'Savings Interest', category: 'Income', date: new Date(Date.now() - 86400000 * 5).toISOString(), mode: 'Bank' },
  { _id: 'd6', amount: -499, merchant: 'Zomato', category: 'Food & Dining', date: new Date(Date.now() - 86400000 * 6).toISOString(), mode: 'UPI' },
];

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [income, setIncome] = useState<number>(0);
  const [expense, setExpense] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const balance = useMemo(() => Math.max(0, income - expense), [income, expense]);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const smsTxns = await importBankSms(500);
      if (smsTxns.length) {
        const mapped: Transaction[] = smsTxns.map((t, idx) => ({
          _id: `${t.date || 'nodate'}-${t.merchant}-${t.amount}-${idx}`,
          amount: t.amount,
          merchant: t.merchant,
          category: t.amount < 0 ? 'Expense' : 'Income',
          date: t.date,
          mode: t.mode,
        }));
        const inc = mapped.filter(m => m.amount > 0).reduce((s, m) => s + m.amount, 0);
        const exp = mapped.filter(m => m.amount < 0).reduce((s, m) => s + Math.abs(m.amount), 0);
        setIncome(inc);
        setExpense(exp);
        const recent = mapped
          .slice()
          .sort((a, b) => (new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()))
          .slice(0, 10);
        setTransactions(recent);
      } else {
        // No SMS matched; use demo for list and a simple demo summary
        setTransactions([]); // triggers demo list below
        const inc = DUMMY_TRANSACTIONS.filter(m => m.amount > 0).reduce((s, m) => s + m.amount, 0);
        const exp = DUMMY_TRANSACTIONS.filter(m => m.amount < 0).reduce((s, m) => s + Math.abs(m.amount), 0);
        setIncome(inc);
        setExpense(exp);
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      // Refresh when dashboard tab gains focus
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') fetchData();
    });
    return () => sub.remove();
  }, [fetchData]);

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={transactions.length ? transactions : DUMMY_TRANSACTIONS}
        keyExtractor={(item) => item._id || `${item.merchant}-${item.date}`}
        renderItem={({ item }) => <TransactionRow item={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No recent transactions</Text>}
        refreshing={refreshing}
        onRefresh={fetchData}
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 32 }}
        ListHeaderComponent={
          <View>
            <View style={styles.cardsCol}>
              <SummaryCard
                title="Total Balance"
                amount={balance}
                color="#7C3AED"
                icon={<MaterialIcons name="credit-card" color="#fff" size={26} />}
              />
              <View style={{ height: 12 }} />
              <Link href="/(tabs)/income" asChild>
                <Pressable>
                  <SummaryCard
                    title="Total Income"
                    amount={income}
                    color="#F97316"
                    icon={<MaterialIcons name="account-balance-wallet" color="#fff" size={26} />}
                  />
                </Pressable>
              </Link>
              <View style={{ height: 12 }} />
              <Link href="/(tabs)/expenses" asChild>
                <Pressable>
                  <SummaryCard
                    title="Total Expense"
                    amount={expense}
                    color="#EF4444"
                    icon={<MaterialIcons name="payments" color="#fff" size={26} />}
                  />
                </Pressable>
              </Link>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              {transactions.length === 0 && (
                <Text style={styles.demoBadge}>Showing demo data</Text>
              )}
            </View>
          </View>
        }
      />
    </ThemedView>
  );
}

function TransactionRow({ item }: { item: Transaction }) {
  const isExpense = (item.category || '').toLowerCase().includes('expense') || item.amount < 0;
  const amount = Math.abs(item.amount);
  return (
    <View style={styles.txRow}>
      <View style={[styles.txBadge, { backgroundColor: isExpense ? '#fee2e2' : '#dcfce7' }]}>
        <MaterialIcons name={isExpense ? 'south-east' : 'north-east'} color={isExpense ? '#ef4444' : '#16a34a'} size={18} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.txTitle}>{item.merchant || 'Unknown'}</Text>
        <Text style={styles.txSub}>{item.category || '—'}</Text>
      </View>
      <View>
        <Text style={[styles.txAmount, { color: isExpense ? '#ef4444' : '#16a34a' }]}>₹{formatINR(amount)}</Text>
        <Text style={styles.txDate}>{formatDate(item.date)}</Text>
      </View>
    </View>
  );
}

function formatINR(n?: number) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '0';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso?: string) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  cardsCol: {},
  sectionHeader: {
    marginTop: 8,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  demoBadge: {
    marginTop: 2,
    color: '#6b7280',
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 8,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  txBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  txSub: {
    color: '#6b7280',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    textAlign: 'right',
    fontWeight: '700',
  },
  txDate: {
    textAlign: 'right',
    color: '#6b7280',
    marginTop: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5e7eb',
  },
});
