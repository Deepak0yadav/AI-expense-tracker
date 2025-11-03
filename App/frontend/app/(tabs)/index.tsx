import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Text, Pressable, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { importBankSms } from '@/utils/smsImporter';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/providers/AuthProvider';

type Transaction = {
  _id: string;
  amount: number;
  merchant?: string;
  category?: string;
  date?: string;
  mode?: string;
};

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
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [income, setIncome] = useState<number>(0);
  const [expense, setExpense] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const balance = useMemo(() => Math.max(0, income - expense), [income, expense]);
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

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
        const recent = mapped.slice().sort((a, b) => (new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())).slice(0, 10);
        setTransactions(recent);
      } else {
        setTransactions([]);
        const inc = DUMMY_TRANSACTIONS.filter(m => m.amount > 0).reduce((s, m) => s + m.amount, 0);
        const exp = DUMMY_TRANSACTIONS.filter(m => m.amount < 0).reduce((s, m) => s + Math.abs(m.amount), 0);
        setIncome(inc);
        setExpense(exp);
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') fetchData();
    });
    return () => sub.remove();
  }, [fetchData]);

  const displayTransactions = transactions.length ? transactions : DUMMY_TRANSACTIONS;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{displayName}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <MaterialIcons name="account-balance-wallet" size={28} color="#fff" />
            <Text style={styles.balanceLabel}>Total Balance</Text>
          </View>
          <Text style={styles.balanceAmount}>{formatINR(balance)}</Text>
        </View>
        <View style={styles.statsRow}>
          <TouchableOpacity 
            style={StyleSheet.flatten([styles.statCard, styles.incomeCard])}
            onPress={() => router.push('/(tabs)/income')}
            activeOpacity={0.7}
          >
            <View style={styles.statIcon}>
              <MaterialIcons name="arrow-downward" size={24} color="#16a34a" />
            </View>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={StyleSheet.flatten([styles.statAmount, { color: '#16a34a' }])}>₹{formatINR(income)}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={StyleSheet.flatten([styles.statCard, styles.expenseCard])}
            onPress={() => router.push('/(tabs)/expenses')}
            activeOpacity={0.7}
          >
            <View style={styles.statIcon}>
              <MaterialIcons name="arrow-upward" size={24} color="#ef4444" />
            </View>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={StyleSheet.flatten([styles.statAmount, { color: '#ef4444' }])}>₹{formatINR(expense)}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {transactions.length === 0 && (<View style={styles.demoBadge}><Text style={styles.demoBadgeText}>Demo</Text></View>)}
          </View>
          <View style={styles.transactionsCard}>
            {displayTransactions.map((item, index) => (<React.Fragment key={item._id}>{index > 0 && <View style={styles.divider} />}<TransactionRow item={item} /></React.Fragment>))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function TransactionRow({ item }: { item: Transaction }) {
  const isExpense = (item.category || '').toLowerCase().includes('expense') || item.amount < 0;
  const amount = Math.abs(item.amount);
  return (
    <View style={styles.txRow}>
      <View style={StyleSheet.flatten([styles.txBadge, { backgroundColor: isExpense ? '#fee2e2' : '#dcfce7' }])}>
        <MaterialIcons name={isExpense ? 'trending-down' : 'trending-up'} color={isExpense ? '#ef4444' : '#16a34a'} size={20} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.txTitle}>{item.merchant || 'Unknown'}</Text>
        <Text style={styles.txSub}>{item.category || '—'} • {formatDate(item.date)}</Text>
      </View>
      <Text style={StyleSheet.flatten([styles.txAmount, { color: isExpense ? '#ef4444' : '#16a34a' }])}>{isExpense ? '-' : '+'}₹{formatINR(amount)}</Text>
    </View>
  );
}

function formatINR(n?: number) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '0';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso?: string) {
  if (!iso) return '';
  try { const d = new Date(iso); return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }); } catch { return ''; }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  userName: { fontSize: 24, fontWeight: '800', color: '#111827' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#fff' },
  balanceCard: { backgroundColor: '#2563eb', borderRadius: 16, padding: 24, marginBottom: 16, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  balanceLabel: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  balanceAmount: { fontSize: 36, fontWeight: '800', color: '#fff' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  incomeCard: { borderLeftWidth: 4, borderLeftColor: '#16a34a' },
  expenseCard: { borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  statIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600', marginBottom: 4 },
  statAmount: { fontSize: 20, fontWeight: '800' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  demoBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  demoBadgeText: { fontSize: 10, fontWeight: '700', color: '#d97706', textTransform: 'uppercase' },
  transactionsCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  txBadge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  txSub: { fontSize: 12, color: '#6b7280' },
  txAmount: { fontSize: 16, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#e5e7eb' },
});
