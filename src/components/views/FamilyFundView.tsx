import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FundTransaction } from '../../types';
import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  Printer, 
  Plus, 
  Trash2, 
  Search, 
  X, 
  ShieldCheck, 
  FileSpreadsheet,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const FamilyFundView: React.FC = () => {
  const { data, can, saveTransaction, deleteTransaction, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTxData, setNewTxData] = useState<Partial<FundTransaction>>({
    type: 'income',
    amount: 10000,
    category: 'اشتراكات سنوية',
    partyName: '',
    receiptNumber: `REC-${Date.now().toString().slice(-4)}`,
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const categories = ['اشتراكات سنوية', 'تبرعات خيرية', 'دعم زواج', 'إعانات تعليمية', 'مصاريف تشغيلية', 'صيانة مقرات', 'أخرى'];

  const activeTransactions = useMemo(() => {
    return data.transactions.filter(t => !t.isDeleted);
  }, [data.transactions]);

  const totalIncome = useMemo(() => {
    return activeTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [activeTransactions]);

  const totalExpense = useMemo(() => {
    return activeTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [activeTransactions]);

  const currentBalance = totalIncome - totalExpense;

  const filteredTransactions = useMemo(() => {
    return activeTransactions.filter(t => {
      const matchSearch = t.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = filterType === 'all' || t.type === filterType;
      return matchSearch && matchType;
    });
  }, [activeTransactions, searchQuery, filterType]);

  const handleOpenAddModal = () => {
    if (!can('fund', 'create')) {
      showToast('ليس لديك صلاحية لإضافة سندات مالية في الصندوق', 'error');
      return;
    }
    setNewTxData({
      type: 'income',
      amount: 5000,
      category: 'اشتراكات سنوية',
      partyName: '',
      receiptNumber: `REC-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxData.amount || !newTxData.partyName) {
      showToast('المبلغ واسم الطرف/الجهة مطلوبان', 'error');
      return;
    }
    await saveTransaction(newTxData);
    setIsAddModalOpen(false);
  };

  const handleExportCSV = () => {
    if (!can('fund', 'exportReports')) {
      showToast('ليس لديك صلاحية لتصدير التقارير المالية', 'error');
      return;
    }
    const headers = ['رقم السند', 'النوع', 'المبلغ (ر.س)', 'التصنيف', 'الجهة / المساهم', 'التاريخ', 'الوصف', 'المسؤول'];
    const rows = filteredTransactions.map(t => [
      t.receiptNumber,
      t.type === 'income' ? 'قبض (إيراد)' : 'صرف (مصروف)',
      t.amount,
      `"${t.category}"`,
      `"${t.partyName.replace(/"/g, '""')}"`,
      t.date,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${t.createdBy}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `albakri_treasury_report_${Date.now()}.csv`);
    link.click();
    showToast('تم تصدير التقرير المالي بصيغة Excel/CSV');
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 text-right">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <Coins className="w-4 h-4" />
            <span>الإدارة المالية والتكافل</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-stone-100">
            صندوق عائلة البكري التكافلي
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-xl">
            سجل المساهمات، الإعانات، برامج الزواج، والتفوق العلمي مع الشفافية والتدقيق المالي الفصلي.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {can('fund', 'exportReports') && (
            <>
              <button
                onClick={handlePrintReport}
                className="px-3.5 py-2 bg-stone-850 hover:bg-stone-800 text-stone-300 border border-stone-750 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                title="طباعة التقرير المالي الرسمي أو حفظه PDF"
              >
                <Printer className="w-4 h-4 text-stone-400" />
                <span>طباعة كشف الحساب (PDF)</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-stone-850 hover:bg-stone-800 text-stone-300 border border-stone-750 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                title="تصدير السجلات إلى جدول Excel"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>تصدير Excel/CSV</span>
              </button>
            </>
          )}

          {can('fund', 'create') && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل سند جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Net Balance */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 text-right space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium">الرصيد المتاح بالصندوق</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-emerald-400">
            {currentBalance.toLocaleString()} ر.س
          </div>
          <p className="text-[11px] text-stone-500">
            الرصيد التراكمي المتبقي للمشروعات الاجتماعية
          </p>
        </div>

        {/* Total Income */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 text-right space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium">إجمالي الإيرادات والمساهمات</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-stone-100">
            {totalIncome.toLocaleString()} ر.س
          </div>
          <p className="text-[11px] text-stone-500">
            الاشتراكات السنوية وتبرعات وجهاء الأسرة
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 text-right space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium">إجمالي المصروفات والإعانات</span>
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-rose-400">
            {totalExpense.toLocaleString()} ر.س
          </div>
          <p className="text-[11px] text-stone-500">
            دعم الزواج، مكافآت المتفوقين، ومصروفات المناسبات
          </p>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم السند أو الجهة أو الوصف..."
            className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 pr-9 text-xs text-stone-100 placeholder-stone-500 outline-none"
          />
          <Search className="w-4 h-4 text-stone-500 absolute right-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 bg-stone-850 p-1 rounded-xl border border-stone-750 w-full md:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'all' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
            }`}
          >
            كافة المعاملات ({activeTransactions.length})
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'income' ? 'bg-emerald-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
            }`}
          >
            سندات القبض (الإيرادات)
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'expense' ? 'bg-rose-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
            }`}
          >
            سندات الصرف (المصروفات)
          </button>
        </div>

      </div>

      {/* Printable Report Header (Print-only) */}
      <div className="print-only hidden p-4 mb-4 border-b border-black text-right">
        <h1 className="text-xl font-bold">تقرير كشف حساب صندوق عائلة البكري التكافلي</h1>
        <p className="text-xs">تاريخ استخراج التقرير: {new Date().toLocaleDateString('ar-SA')} | الرصيد الحالي: {currentBalance.toLocaleString()} ريال</p>
      </div>

      {/* Transactions Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-stone-850 border-b border-stone-800 text-stone-400 font-semibold">
              <tr>
                <th className="py-3.5 px-4">رقم السند</th>
                <th className="py-3.5 px-4">النوع</th>
                <th className="py-3.5 px-4">المبلغ</th>
                <th className="py-3.5 px-4">التصنيف</th>
                <th className="py-3.5 px-4">الطرف / المساهم</th>
                <th className="py-3.5 px-4">التاريخ</th>
                <th className="py-3.5 px-4">البيان والوصف</th>
                <th className="py-3.5 px-4 text-left no-print">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-stone-200">
              {filteredTransactions.map(tx => {
                const isIncome = tx.type === 'income';

                return (
                  <tr key={tx.id} className="hover:bg-stone-850/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono tabular-nums text-amber-400 font-bold">
                      {tx.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      {isIncome ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          <span>سند قبض</span>
                        </span>
                      ) : (
                        <span className="text-rose-400 font-semibold flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>سند صرف</span>
                        </span>
                      )}
                    </td>
                    <td className={`py-3.5 px-4 font-mono tabular-nums font-bold text-sm ${
                      isIncome ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isIncome ? '+' : '-'}{tx.amount.toLocaleString()} ر.س
                    </td>
                    <td className="py-3.5 px-4 text-stone-300">{tx.category}</td>
                    <td className="py-3.5 px-4 font-semibold text-stone-100">{tx.partyName}</td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-stone-400">{tx.date}</td>
                    <td className="py-3.5 px-4 text-stone-400 max-w-xs truncate">{tx.description}</td>
                    <td className="py-3.5 px-4 text-left no-print">
                      {can('fund', 'delete') && (
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف السند رقم (${tx.receiptNumber})؟`)) {
                              deleteTransaction(tx.id);
                            }
                          }}
                          className="p-1 hover:text-rose-400 transition-colors"
                          title="حذف السند"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-right">
            
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 left-6 p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading font-bold text-lg text-amber-300 pb-4 border-b border-stone-800 mb-6">
              تسجيل سند مالي جديد بصندوق العائلة
            </h3>

            <form onSubmit={handleSaveTx} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    نوع السند *
                  </label>
                  <select
                    value={newTxData.type || 'income'}
                    onChange={(e) => setNewTxData({ ...newTxData, type: e.target.value as any })}
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                  >
                    <option value="income">سند قبض (إيراد / اشتراك)</option>
                    <option value="expense">سند صرف (إعانة / مصروف)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    المبلغ بالريال السعودي *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newTxData.amount || ''}
                    onChange={(e) => setNewTxData({ ...newTxData, amount: Number(e.target.value) })}
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none font-mono tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    التصنيف *
                  </label>
                  <select
                    value={newTxData.category || 'اشتراكات سنوية'}
                    onChange={(e) => setNewTxData({ ...newTxData, category: e.target.value as any })}
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    رقم السند المالي
                  </label>
                  <input
                    type="text"
                    value={newTxData.receiptNumber || ''}
                    onChange={(e) => setNewTxData({ ...newTxData, receiptNumber: e.target.value })}
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  الطرف (المساهم أو المستفيد) *
                </label>
                <input
                  type="text"
                  required
                  value={newTxData.partyName || ''}
                  onChange={(e) => setNewTxData({ ...newTxData, partyName: e.target.value })}
                  placeholder="مثال: فهد بن ماجد البكري (اشتراك سنوي)"
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  التاريخ
                </label>
                <input
                  type="date"
                  value={newTxData.date || ''}
                  onChange={(e) => setNewTxData({ ...newTxData, date: e.target.value })}
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  البيان والتفاصيل
                </label>
                <textarea
                  rows={2}
                  value={newTxData.description || ''}
                  onChange={(e) => setNewTxData({ ...newTxData, description: e.target.value })}
                  placeholder="شرح موجز لأوجه الصرف أو سند الإيداع البنكي..."
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-all shadow"
                >
                  حفظ السند والترحيل
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
