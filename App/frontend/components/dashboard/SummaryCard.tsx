import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SummaryCardProps {
  title: string;
  amount: number | string;
  color: string; // background color for icon badge
  icon?: React.ReactNode;
}

export default function SummaryCard({ title, amount, color, icon }: SummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.badge, { backgroundColor: color }]}>
        {icon}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.amount}>₹{formatAmount(amount)}</Text>
    </View>
  );
}

function formatAmount(value: number | string) {
  const n = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginHorizontal: 6,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 6,
  },
  amount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
});
