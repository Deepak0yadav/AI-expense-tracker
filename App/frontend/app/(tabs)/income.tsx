import React, { useCallback, useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, View, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { importBankSms } from '@/utils/smsImporter';
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type Transaction = {
  _id: string;
  amount: number;
  merchant?: string;
  category?: string;
  date?: string;
  mode?: string;
};

export default function IncomeScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Transaction[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadFromSms = useCallback(async () => {
    setRefreshing(true);
    try {
      const smsTxns = await importBankSms(500);
      const mapped: Transaction[] = smsTxns.map((t, idx) => ({
        _id: `${t.date || 'nodate'}-${t.merchant}-${t.amount}-${idx}`,
        amount: t.amount,
        merchant: t.merchant,
        category: t.amount < 0 ? 'Expense' : 'Income',
        date: t.date,
        mode: t.mode,
      }));
      const incomes = mapped.filter((t) => t.amount > 0);
      setItems(incomes);
      setTotal(incomes.reduce((sum, t) => sum + Math.abs(t.amount), 0));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => { if (mounted) await loadFromSms(); })();
    return () => { mounted = false; };
  }, [loadFromSms]);

  useFocusEffect(
    useCallback(() => {
      loadFromSms();
    }, [loadFromSms])
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') loadFromSms();
    });
    return () => sub.remove();
  }, [loadFromSms]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadFromSms} />}>
        <View style={styles.header}>
          <Text style={styles.title}>Income</Text>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Income</Text>
            <Text style={styles.totalAmount}>+{formatINR(total)}</Text>
          </View>
        </View>
        <View style={styles.transactionsCard}>
          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="inbox" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No income transactions yet</Text>
              <Text style={styles.emptySubtext}>Pull down to refresh</Text>
            </View>
          ) : (
            items.map((item, index) => (
              <React.Fragment key={item._id}>
                {index > 0 && <View style={styles.divider} />}
                <TransactionRow item={item} />
              </React.Fragment>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function TransactionRow({ item }: { item: Transaction }) {
  const amount = Math.abs(item.amount);
  return (
    <View style={styles.txRow}>
      <View style={styles.txBadge}>
        <MaterialIcons name="trending-up" color="#16a34a" size={20} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.txTitle}>{item.merchant || 'Unknown'}</Text>
        <Text style={styles.txSub}>{formatDate(item.date)}  {item.mode || 'N/A'}</Text>
      </View>
      <Text style={styles.txAmount}>+{formatINR(amount)}</Text>
    </View>
  );
}

function formatINR(n?: number) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '0';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso?: string) {
  if (!iso) return '';
  try { const d = new Date(iso); return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return ''; }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 16 },
  totalCard: { backgroundColor: '#dcfce7', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#16a34a' },
  totalLabel: { fontSize: 12, color: '#15803d', fontWeight: '600', marginBottom: 4, textTransform: 'uppercase' },
  totalAmount: { fontSize: 28, fontWeight: '800', color: '#16a34a' },
  transactionsCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#6b7280', marginTop: 12 },
  emptySubtext: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  txBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  txSub: { fontSize: 12, color: '#6b7280' },
  txAmount: { fontSize: 16, fontWeight: '800', color: '#16a34a' },
  divider: { height: 1, backgroundColor: '#e5e7eb' },
});
