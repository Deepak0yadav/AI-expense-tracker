import React, { useCallback, useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TransactionList, { Transaction } from '@/components/transactions/TransactionList';
import { importBankSms } from '@/utils/smsImporter';
import { useFocusEffect } from '@react-navigation/native';
// No backend: load incomes directly from SMS inbox

export default function IncomeScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Transaction[]>([]);
  const [total, setTotal] = useState<number>(0);

  const loadFromSms = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => { if (mounted) await loadFromSms(); })();
    return () => { mounted = false; };
  }, [loadFromSms]);

  useFocusEffect(
    useCallback(() => {
      // Reload whenever the Income tab gains focus
      loadFromSms();
    }, [loadFromSms])
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        // Reload when app returns to foreground
        loadFromSms();
      }
    });
    return () => sub.remove();
  }, [loadFromSms]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}> 
        <Text style={styles.title}>All Incomes</Text>
        <Text style={styles.total}>₹{new Intl.NumberFormat('en-IN').format(total)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <TransactionList data={items} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingBottom: 32 },
  header: { marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700' },
  total: { fontSize: 16, color: '#16a34a', marginTop: 4, fontWeight: '700' },
});
