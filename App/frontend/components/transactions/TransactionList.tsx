import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type Transaction = {
  _id: string;
  amount: number;
  merchant?: string;
  category?: string;
  date?: string;
  mode?: string;
};

export default function TransactionList({ data }: { data: Transaction[] }) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item._id || `${item.merchant}-${item.date}`}
      renderItem={({ item }) => <TransactionRow item={item} />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={<Text style={styles.empty}>No transactions</Text>}
    />
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
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 24 },
});
