import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { num, inr } from './src/utils/format';
import {
  emi,
  sip,
  lumpsum,
  fd,
  rd,
  ppf,
  gstBreakdown,
  savingsFutureValue,
  salaryBreakdown,
} from './src/utils/finance';

const TOOLS = [
  { id: 'emi', title: 'Loan EMI', short: 'Monthly loan payment', icon: '🏠' },
  { id: 'salary', title: 'Salary', short: 'Monthly in-hand salary', icon: '💼' },
  { id: 'sip', title: 'SIP', short: 'Monthly investment', icon: '📈' },
  { id: 'lumpsum', title: 'Lumpsum', short: 'One-time investment', icon: '💰' },
  { id: 'fd', title: 'Fixed Deposit', short: 'FD maturity amount', icon: '🏦' },
  { id: 'rd', title: 'Recurring Deposit', short: 'RD maturity amount', icon: '🗓️' },
  { id: 'ppf', title: 'PPF', short: 'PPF savings estimate', icon: '🔒' },
  { id: 'gst', title: 'GST', short: 'Add or remove GST', icon: '🧾' },
  { id: 'savings', title: 'Savings', short: 'Plan your savings', icon: '🐷' },
];

const INITIAL = {
  emi: { amount: '0', rate: '0', years: '0' },
  salary: { basic: '0', hra: '0', allowance: '0', pfRate: '0', pt: '0', tds: '0', other: '0' },
  sip: { amount: '0', rate: '0', years: '0' },
  lumpsum: { amount: '0', rate: '0', years: '0' },
  fd: { amount: '0', rate: '0', years: '0' },
  rd: { amount: '0', rate: '0', years: '0' },
  ppf: { amount: '0', rate: '0', years: '0' },
  gst: { amount: '0', rate: '0', mode: 'exclusive' },
  savings: { amount: '0', rate: '0', years: '0' },
};

const FIELDS = {
  emi: [
    ['amount', 'Loan amount (₹)'],
    ['rate', 'Annual interest rate (%)'],
    ['years', 'Loan period (years)'],
  ],
  salary: [
    ['basic', 'Monthly basic salary (₹)'],
    ['hra', 'Monthly HRA (₹)'],
    ['allowance', 'Other monthly allowances (₹)'],
    ['pfRate', 'Employee PF rate (%)'],
    ['pt', 'Professional tax per month (₹)'],
    ['tds', 'Income tax / TDS per month (₹)'],
    ['other', 'Other monthly deductions (₹)'],
  ],
  sip: [
    ['amount', 'Monthly investment (₹)'],
    ['rate', 'Expected annual return (%)'],
    ['years', 'Investment period (years)'],
  ],
  lumpsum: [
    ['amount', 'One-time investment (₹)'],
    ['rate', 'Expected annual return (%)'],
    ['years', 'Investment period (years)'],
  ],
  fd: [
    ['amount', 'Deposit amount (₹)'],
    ['rate', 'Annual interest rate (%)'],
    ['years', 'Deposit period (years)'],
  ],
  rd: [
    ['amount', 'Monthly deposit (₹)'],
    ['rate', 'Annual interest rate (%)'],
    ['years', 'Deposit period (years)'],
  ],
  ppf: [
    ['amount', 'Yearly contribution (₹)'],
    ['rate', 'Annual PPF interest rate (%)'],
    ['years', 'Investment period (years)'],
  ],
  gst: [
    ['amount', 'Bill amount (₹)'],
    ['rate', 'GST rate (%)'],
  ],
  savings: [
    ['amount', 'Monthly savings (₹)'],
    ['rate', 'Expected annual return (%)'],
    ['years', 'Savings period (years)'],
  ],
};

function Result({ title, main, rows, note }) {
  return (
    <View style={s.resultCard}>
      <Text style={s.resultHeading}>YOUR RESULT</Text>
      <Text style={s.resultTitle}>{title}</Text>
      <Text style={s.resultMain}>{main}</Text>
      <View style={s.resultDivider} />
      {rows.map((row, index) => (
        <View style={s.resultRow} key={`${row[0]}-${index}`}>
          <Text style={s.resultLabel}>{row[0]}</Text>
          <Text style={s.resultValue}>{row[1]}</Text>
        </View>
      ))}
      {!!note && <Text style={s.resultNote}>{note}</Text>}
    </View>
  );
}

export default function App() {
  const [page, setPage] = useState('home');
  const [toolId, setToolId] = useState('emi');
  const [data, setData] = useState(INITIAL);
  const [calculated, setCalculated] = useState(false);

  const tool = TOOLS.find((item) => item.id === toolId) || TOOLS[0];
  const values = data[toolId];

  const updateField = (key, value) => {
    setCalculated(false);
    setData((old) => ({
      ...old,
      [toolId]: { ...old[toolId], [key]: value },
    }));
  };

  const reset = () => {
    setData((old) => ({ ...old, [toolId]: { ...INITIAL[toolId] } }));
    setCalculated(false);
  };

  const openCalculator = (id) => {
    setToolId(id);
    setCalculated(false);
    setPage('calculator');
  };

  const result = useMemo(() => {
    const amount = num(values.amount);
    const rate = num(values.rate);
    const years = num(values.years);
    const months = Math.round(years * 12);

    if (toolId === 'salary') {
      const salary = salaryBreakdown({
        basic: num(values.basic),
        hra: num(values.hra),
        allowance: num(values.allowance),
        pfRate: num(values.pfRate),
        pt: num(values.pt),
        tds: num(values.tds),
        other: num(values.other),
      });

      if (salary.gross <= 0) return null;
      return {
        title: 'Estimated monthly take-home salary',
        main: inr(salary.net),
        rows: [
          ['Monthly gross salary', inr(salary.gross)],
          ['Employee PF', inr(salary.pf)],
          ['Professional tax', inr(salary.pt)],
          ['Income tax / TDS', inr(salary.tds)],
          ['Other deductions', inr(salary.other)],
          ['Total deductions', inr(salary.deductions)],
          ['Estimated annual take-home', inr(salary.net * 12)],
        ],
        note: 'Enter the actual TDS and professional tax shown on your payslip. This is an estimate, not an automatic income-tax assessment.',
      };
    }

    // GST has no period field, so only amount and rate are checked for GST.
    if (amount <= 0 || rate < 0 || rate > 100) return null;
    if (toolId !== 'gst' && (years <= 0 || years > 100)) return null;

    if (toolId === 'emi') {
      const monthly = emi(amount, rate, months);
      const total = monthly * months;
      return {
        title: 'Your monthly EMI',
        main: inr(monthly),
        rows: [
          ['Loan amount', inr(amount)],
          ['Total interest', inr(total - amount)],
          ['Total repayment', inr(total)],
        ],
      };
    }

    if (toolId === 'sip') {
      const total = sip(amount, rate, months);
      const invested = amount * months;
      return {
        title: 'Estimated SIP value',
        main: inr(total),
        rows: [
          ['Total invested', inr(invested)],
          ['Estimated returns', inr(total - invested)],
        ],
        note: 'Assumes month-end deposits and a constant estimated return. Market returns are not guaranteed.',
      };
    }

    if (toolId === 'lumpsum') {
      const total = lumpsum(amount, rate, years);
      return {
        title: 'Future value',
        main: inr(total),
        rows: [
          ['Initial investment', inr(amount)],
          ['Estimated returns', inr(total - amount)],
        ],
      };
    }

    if (toolId === 'fd') {
      const total = fd(amount, rate, years);
      return {
        title: 'FD maturity amount',
        main: inr(total),
        rows: [
          ['Deposit amount', inr(amount)],
          ['Estimated interest', inr(total - amount)],
          ['Compounding', 'Quarterly'],
        ],
        note: 'Before tax. Actual bank terms and compounding may differ.',
      };
    }

    if (toolId === 'rd') {
      const total = rd(amount, rate, months);
      const invested = amount * months;
      return {
        title: 'RD maturity amount',
        main: inr(total),
        rows: [
          ['Total deposits', inr(invested)],
          ['Estimated interest', inr(total - invested)],
        ],
        note: 'This is an estimate. Actual bank calculations and deposit dates may differ.',
      };
    }

    if (toolId === 'ppf') {
      const total = ppf(amount, rate, years);
      return {
        title: 'Estimated PPF maturity amount',
        main: inr(total),
        rows: [
          ['Yearly contribution', inr(amount)],
          ['Total contributions', inr(amount * years)],
          ['Estimated interest', inr(total - amount * years)],
          ['Investment period', `${years} years`],
        ],
        note: 'Illustrative estimate. Actual PPF interest is calculated monthly on eligible balances and credited annually. Standard PPF tenure is 15 years.',
      };
    }

    if (toolId === 'gst') {
      const gst = gstBreakdown(amount, rate, values.mode);
      return {
        title: values.mode === 'inclusive' ? 'Amount before GST' : 'Total amount including GST',
        main: inr(values.mode === 'inclusive' ? gst.base : gst.total),
        rows: [
          ['Taxable value', inr(gst.base)],
          ['GST amount', inr(gst.tax)],
          ['CGST (illustrative)', inr(gst.cgst)],
          ['SGST (illustrative)', inr(gst.sgst)],
          ['Total amount', inr(gst.total)],
        ],
        note: 'CGST and SGST are shown as an intra-state illustration. Inter-state supplies generally use IGST.',
      };
    }

    const total = savingsFutureValue(amount, rate, months);
    const invested = amount * months;
    return {
      title: 'Estimated savings value',
      main: inr(total),
      rows: [
        ['Total saved', inr(invested)],
        ['Estimated growth', inr(total - invested)],
      ],
    };
  }, [toolId, values]);

  const calculate = () => setCalculated(true);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8FC" />
      <KeyboardAvoidingView
        style={s.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.page}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.header}>

            <View style={s.brandBlock}>
              <Text style={s.brand}>Money Calculator</Text>
              <Text style={s.tag}>Easy Finance Calculations</Text>
            </View>
          </View>

          {page === 'home' ? (
            <>
              <View style={s.welcome}>
                <Text style={s.welcomeText}>Choose one option below to get started.</Text>
              </View>

              <View style={s.grid}>
                {TOOLS.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => openCalculator(item.id)}
                    style={({ pressed }) => [s.toolCard, pressed && s.pressed]}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.title} calculator`}
                  >
                    <Text style={s.toolIcon}>{item.icon}</Text>
                    <Text style={s.toolTitle}>{item.title}</Text>
                    <Text style={s.toolDescription}>{item.short}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={s.footerNotice}>
                <Text style={s.footerTitle}>Simple money planning</Text>
                <Text style={s.footerText}>
                  Money Calculator gives estimates to help with planning. Check current bank, tax and investment rules before making decisions.
                </Text>
              </View>
            </>
          ) : (
            <>
              <Pressable
                onPress={() => {
                  setPage('home');
                  setCalculated(false);
                }}
                style={s.backButton}
                accessibilityRole="button"
              >
                <Text style={s.backButtonText}>←  All calculators</Text>
              </Pressable>

              <View style={s.calculatorHeading}>
                <Text style={s.calculatorIcon}>{tool.icon}</Text>
                <View style={s.calculatorHeadingText}>
                  <Text style={s.calculatorTitle}>{tool.title}</Text>
                  <Text style={s.calculatorSubtitle}>Enter your details below.</Text>
                </View>
              </View>

              <View style={s.formCard}>
                <Text style={s.formTitle}>Your details</Text>

                {FIELDS[toolId].map(([key, label]) => (
                  <View style={s.field} key={key}>
                    <Text style={s.fieldLabel}>{label}</Text>
                    <TextInput
                      value={values[key] ?? '0'}
                      onChangeText={(value) => updateField(key, value)}
                      keyboardType="decimal-pad"
                      style={s.input}
                      placeholder="0"
                      placeholderTextColor="#8290A2"
                      selectTextOnFocus
                      accessibilityLabel={label}
                    />
                  </View>
                ))}

                {toolId === 'gst' && (
                  <View style={s.field}>
                    <Text style={s.fieldLabel}>Choose GST option</Text>
                    <View style={s.gstOptions}>
                      <Pressable
                        onPress={() => updateField('mode', 'exclusive')}
                        style={[s.gstOption, values.mode === 'exclusive' && s.gstOptionActive]}
                        accessibilityRole="button"
                      >
                        <Text style={[s.gstOptionText, values.mode === 'exclusive' && s.gstOptionTextActive]}>
                          Add GST
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => updateField('mode', 'inclusive')}
                        style={[s.gstOption, values.mode === 'inclusive' && s.gstOptionActive]}
                        accessibilityRole="button"
                      >
                        <Text style={[s.gstOptionText, values.mode === 'inclusive' && s.gstOptionTextActive]}>
                          Remove GST
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                <View style={s.actionButtons}>
                  <Pressable
                    onPress={calculate}
                    style={({ pressed }) => [s.calculateButton, pressed && s.pressed]}
                    accessibilityRole="button"
                  >
                    <Text style={s.calculateButtonText}>Calculate</Text>
                  </Pressable>
                  <Pressable
                    onPress={reset}
                    style={({ pressed }) => [s.resetButton, pressed && s.pressed]}
                    accessibilityRole="button"
                  >
                    <Text style={s.resetButtonText}>Reset</Text>
                  </Pressable>
                </View>
              </View>

              {calculated && result ? (
                <Result {...result} />
              ) : calculated ? (
                <View style={s.validationBox}>
                  <Text style={s.validationTitle}>Please check your details</Text>
                  <Text style={s.validationText}>
                    Enter an amount greater than 0 and a valid interest rate. Also enter a period for calculators that ask for years.
                  </Text>
                </View>
              ) : (
                <View style={s.resultPlaceholder}>
                  <Text style={s.placeholderTitle}>Your result will appear here</Text>
                  <Text style={s.placeholderText}>Enter your details, then tap Calculate.</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F8FC' },
  keyboard: { flex: 1 },
  page: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 30 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DFE8F4',
  },
  logo: { width: 58, height: 58, borderRadius: 13 },
  brandBlock: { marginLeft: 12 },
  brand: { color: '#123B70', fontSize: 25, fontWeight: '900' },
  byline: { color: '#2366A8', fontSize: 14, fontWeight: '800', marginTop: 1 },

  welcome: { marginBottom: 17 },
  welcomeTitle: { color: '#173253', fontSize: 25, lineHeight: 32, fontWeight: '900' },
  welcomeText: { color: '#52657C', fontSize: 16, lineHeight: 23, marginTop: 7 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  toolCard: {
    width: '48.5%',
    minHeight: 132,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#C8DDF7',
    borderRadius: 17,
    paddingHorizontal: 13,
    paddingVertical: 14,
    marginBottom: 12,
    justifyContent: 'center',
  },
  pressed: { opacity: 0.78 },
  toolIcon: { fontSize: 29, marginBottom: 7 },
  toolTitle: { color: '#123B70', fontSize: 17, lineHeight: 22, fontWeight: '900' },
  toolDescription: { color: '#5D7088', fontSize: 13, lineHeight: 18, marginTop: 4 },
  footerNotice: {
    marginTop: 7,
    padding: 16,
    borderRadius: 15,
    backgroundColor: '#E8F1FC',
  },
  footerTitle: { color: '#173F75', fontSize: 16, fontWeight: '900' },
  footerText: { color: '#536B86', fontSize: 13, lineHeight: 19, marginTop: 6 },

  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5EFFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 18,
  },
  backButtonText: { color: '#17477E', fontSize: 16, fontWeight: '900' },
  calculatorHeading: { flexDirection: 'row', alignItems: 'center', marginBottom: 17 },
  calculatorIcon: { fontSize: 34, marginRight: 13 },
  calculatorHeadingText: { flex: 1 },
  calculatorTitle: { color: '#173253', fontSize: 23, lineHeight: 29, fontWeight: '900' },
  calculatorSubtitle: { color: '#64768B', fontSize: 15, marginTop: 3 },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: '#DFE8F4',
  },
  formTitle: { color: '#173253', fontSize: 20, fontWeight: '900', marginBottom: 17 },
  field: { marginBottom: 17 },
  fieldLabel: { color: '#354F6D', fontSize: 16, lineHeight: 22, fontWeight: '800', marginBottom: 8 },
  input: {
    height: 58,
    borderWidth: 1.5,
    borderColor: '#AFC9E9',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 21,
    fontWeight: '700',
    color: '#173253',
    backgroundColor: '#FBFDFF',
  },
  gstOptions: { flexDirection: 'row', justifyContent: 'space-between' },
  gstOption: {
    width: '48.5%',
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: '#EAF1FA',
    borderWidth: 1,
    borderColor: '#D5E1F0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  gstOptionActive: { backgroundColor: '#173F75', borderColor: '#173F75' },
  gstOptionText: { color: '#24496F', fontSize: 15, fontWeight: '800' },
  gstOptionTextActive: { color: '#FFFFFF' },
  actionButtons: { marginTop: 3 },
  calculateButton: {
    minHeight: 58,
    backgroundColor: '#123F78',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  calculateButtonText: { color: '#FFFFFF', fontSize: 19, fontWeight: '900' },
  resetButton: {
    minHeight: 54,
    backgroundColor: '#E6F0FC',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#C6DCF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: { color: '#17477E', fontSize: 17, fontWeight: '900' },

  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#C8DDF7',
    padding: 17,
    marginTop: 15,
  },
  resultHeading: { color: '#3473B6', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  resultTitle: { color: '#334E6D', fontSize: 16, lineHeight: 22, fontWeight: '700', marginTop: 8 },
  resultMain: { color: '#123B70', fontSize: 32, lineHeight: 40, fontWeight: '900', marginTop: 4, marginBottom: 13 },
  resultDivider: { height: 1, backgroundColor: '#DCE7F4', marginBottom: 13 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 13 },
  resultLabel: { flex: 1, color: '#536A84', fontSize: 14, lineHeight: 20, paddingRight: 10 },
  resultValue: { color: '#173253', fontSize: 15, lineHeight: 20, fontWeight: '900', textAlign: 'right' },
  resultNote: { color: '#687C92', fontSize: 12, lineHeight: 18, marginTop: 3 },
  resultPlaceholder: {
    padding: 17,
    backgroundColor: '#EAF2FC',
    borderRadius: 15,
    marginTop: 15,
  },
  placeholderTitle: { color: '#173F75', fontSize: 16, fontWeight: '900' },
  placeholderText: { color: '#61758D', fontSize: 14, lineHeight: 20, marginTop: 5 },
  validationBox: { padding: 16, backgroundColor: '#FFF4E5', borderRadius: 14, marginTop: 15 },
  validationTitle: { color: '#875018', fontSize: 16, fontWeight: '900' },
  validationText: { color: '#805E36', fontSize: 14, lineHeight: 20, marginTop: 5 },

  footer: { textAlign: 'center', color: '#8292A5', fontSize: 11, fontWeight: '800', marginTop: 24 },
});
