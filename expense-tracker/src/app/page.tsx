"use client"

import { useState, useEffect } from 'react'
function generateUUID() {
  // Gera um UUID simples para identificar grupos de parcelas
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

type Expense = {
  id: string
  amount: number
  paidBy: 'Samuel' | 'Camila'
  category: string
  description: string
  date: string
  shared?: boolean // true = compartilhada, false = individual
  installmentGroupId?: string // id do grupo de parcelas
}

const CATEGORIES = ['Moradia', 'Mercado', 'Lazer', 'Transporte', 'Saúde', 'Alimentação', 'Outros']
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE']
const SUGGESTED_AMOUNTS = [50, 100, 150, 200, 300, 500]

export default function Home() {
      // Estado para categoria selecionada no gráfico
      // Estado para categoria selecionada por mês
      const [selectedCategoryByMonth, setSelectedCategoryByMonth] = useState<{ [monthLabel: string]: string | null }>({});
      const [selectedMonthExpensesByMonth, setSelectedMonthExpensesByMonth] = useState<{ [monthLabel: string]: Expense[] }>({});
    // Novo layout: aba de previsão centralizada
    const [activeTab, setActiveTab] = useState<'tabela' | 'previsao'>('tabela');
    // Estados devem vir antes
    const [initialInstallment, setInitialInstallment] = useState(1)
    const [installments, setInstallments] = useState(1)
    const [recurrence, setRecurrence] = useState<'Nenhuma' | 'Mensal' | 'Semanal' | 'Anual'>('Nenhuma')
    const [personFilter, setPersonFilter] = useState<'Todos' | 'Samuel' | 'Camila'>('Todos')
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [amount, setAmount] = useState('')
    const [shared, setShared] = useState<'Compartilhada' | 'Individual'>('Compartilhada')
    const [paidBy, setPaidBy] = useState<'Samuel' | 'Camila'>('Samuel')
    const [category, setCategory] = useState('Mercado')
    const [description, setDescription] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [editingId, setEditingId] = useState<string | null>(null)
    type InlineEditType = {
      id: string,
      amount: string,
      description: string,
      category: string,
      paidBy: 'Samuel' | 'Camila',
      shared: 'Compartilhada' | 'Individual',
      parcelaAtual: string,
      parcelaTotal: string,
    }
    const [inlineEdit, setInlineEdit] = useState<null | InlineEditType>(null)
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
    const [samuelSalary, setSamuelSalary] = useState(0)
    const [camilaSalary, setCamilaSalary] = useState(0)
    const [showSalaryModal, setShowSalaryModal] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)

    // Filtros do card de análise de salário
    const [salaryPerson, setSalaryPerson] = useState<'Samuel' | 'Camila'>('Samuel')
    const [salaryType, setSalaryType] = useState<'Ambos' | 'Compartilhada' | 'Individual'>('Ambos')
    // Filtro da previsão de gastos na sidebar
    const [forecastFilter, setForecastFilter] = useState<'Compartilhada' | 'Samuel' | 'Camila'>('Compartilhada')
    // Previsão de gastos futuros (próximos 6 meses)
    const monthsAhead = 6
    const today = new Date()
    const futureMonths = Array.from({ length: monthsAhead }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
    // Agrupa despesas por mês futuro, filtrando conforme forecastFilter
    // Nova lógica: Agrupa parcelas pelo mês correto, usando a descrição
    // Previsão: pega exatamente o que está na tabela, agrupando por mês
    // Previsão: sempre reflete o array de despesas atual
    // Sidebar de previsão: apenas agrupamento dos dados da tabela, mês a mês
    const futureExpensesByMonth = futureMonths.map(({ year, month }) => {
      const monthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });
      const orderedExpenses = monthExpenses.slice().sort((a, b) => {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        if (da !== db) return db - da;
        return a.description.localeCompare(b.description);
      });
      const total = orderedExpenses.reduce((sum, e) => sum + e.amount, 0);
      return {
        label: new Date(year, month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        total,
        expenses: orderedExpenses
      };
    });

    // Função para limpar duplicatas (mesma descrição, data e valor)
    function removeDuplicateExpenses(expenses: Expense[]): Expense[] {
      const seen = new Set()
      return expenses.filter(e => {
        const key = `${e.description}|${e.date}|${e.amount}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }

    useEffect(() => {
      const saved = localStorage.getItem('expenses')
      if (saved) {
        const parsed = JSON.parse(saved)
        const cleaned = removeDuplicateExpenses(parsed)
        setExpenses(cleaned)
        if (cleaned.length !== parsed.length) {
          localStorage.setItem('expenses', JSON.stringify(cleaned))
        }
      }
      const savedSalaries = localStorage.getItem('salaries')
      if (savedSalaries) {
        const { samuel, camila } = JSON.parse(savedSalaries)
        setSamuelSalary(samuel)
        setCamilaSalary(camila)
      }
    }, [])

    useEffect(() => {
      localStorage.setItem('expenses', JSON.stringify(expenses))
      localStorage.setItem('expenses_backup', JSON.stringify(expenses))
    }, [expenses])

    // Função para restaurar backup manualmente
    function restoreExpensesBackup() {
      const backup = localStorage.getItem('expenses_backup')
      if (backup) {
        setExpenses(JSON.parse(backup))
        localStorage.setItem('expenses', backup)
        alert('Backup restaurado com sucesso!')
      } else {
        alert('Nenhum backup encontrado.')
      }
    }

    useEffect(() => {
      localStorage.setItem('salaries', JSON.stringify({ samuel: samuelSalary, camila: camilaSalary }))
    }, [samuelSalary, camilaSalary])

    const addExpense = () => {
      if (!amount || !category) return
      const isShared = shared === 'Compartilhada'
      if (editingId) {
        // Se for parcela, edita só a parcela selecionada
        setExpenses(expenses.map(e =>
          e.id === editingId
            ? {
                ...e,
                amount: parseFloat(amount),
                paidBy,
                category,
                description: description + (e.description.match(/\(Parcela.*\)$/) ? ' ' + (e.description.match(/\(Parcela.*\)$/)?.[0] ?? '') : ''),
                date,
                shared: isShared
              }
            : e
        ))
        setEditingId(null)
      } else {
        // Adicionar nova despesa (parcelada ou recorrente)
        const baseExpense = {
          paidBy,
          category,
          description,
          amount: parseFloat(amount),
          shared: isShared,
        }
        let newExpenses: Expense[] = []
        const startDate = new Date(date)
        if (installments > 1) {
          // Parcelada: cria várias despesas com datas futuras, respeitando initialInstallment
          const groupId = generateUUID()
          const totalParcelas = initialInstallment + installments - 1
          for (let i = 0; i < installments; i++) {
            // Corrige bug de mês: sempre pega o último dia do mês se necessário
            const d = new Date(startDate)
            const targetMonth = d.getMonth() + i
            const targetYear = d.getFullYear() + Math.floor(targetMonth / 12)
            const realMonth = targetMonth % 12
            // Ajusta para o último dia do mês se o dia inicial não existir
            let dia = d.getDate()
            const lastDay = new Date(targetYear, realMonth + 1, 0).getDate()
            if (dia > lastDay) dia = lastDay
            const dataParcela = new Date(targetYear, realMonth, dia)
            const parcelaAtual = initialInstallment + i
            newExpenses.push({
              ...baseExpense,
              id: generateUUID(),
              installmentGroupId: groupId,
              date: dataParcela.toISOString().split('T')[0],
              description: description + ` (Parcela ${parcelaAtual}/${totalParcelas})`,
            })
          }
        } else if (recurrence !== 'Nenhuma') {
          // Recorrente: marca como recorrente (apenas 1 despesa, mas pode ser expandido no futuro)
          newExpenses.push({
            ...baseExpense,
            id: generateUUID(),
            date,
            description: description + ` (Recorrência: ${recurrence})`,
          })
        } else {
          // Normal
          newExpenses.push({
            ...baseExpense,
            id: generateUUID(),
            date,
          })
        }
        setExpenses([...expenses, ...newExpenses])
      }
      setAmount('')
      setDescription('')
      setDate(new Date().toISOString().split('T')[0])
      setInstallments(1)
      setInitialInstallment(1)
      setRecurrence('Nenhuma')
      setShared('Compartilhada')
      setShowSuggestions(false)
    }

    const handleEdit = (expense: Expense) => {
      setEditingId(expense.id)
      // Extrai parcela se houver, ou inicializa para permitir edição
      let parcelaAtual = '', parcelaTotal = '';
      const match = expense.description.match(/\(Parcela (\d+)(?:\/(\d+))?\)/);
      if (match) {
        parcelaAtual = match[1];
        parcelaTotal = match[2] || '';
      } else {
        parcelaAtual = '';
        parcelaTotal = '';
      }
      setInlineEdit({
        id: expense.id,
        amount: expense.amount.toString(),
        description: expense.description.replace(/\s*\(Parcela.*\)$/,''),
        category: expense.category,
        paidBy: expense.paidBy,
        shared: expense.shared === false ? 'Individual' : 'Compartilhada',
        parcelaAtual,
        parcelaTotal,
      })
    }

    const handleInlineChange = (field: keyof InlineEditType, value: string) => {
      if (!inlineEdit) return;
      setInlineEdit({ ...inlineEdit, [field]: value })
    }

    const handleInlineSave = () => {
      if (!inlineEdit) return;
      setExpenses(expenses.map(e => {
        if (e.id !== inlineEdit.id) return e;
        // Reconstrói a descrição com a parcela editada
        let desc = inlineEdit.description;
        let newDate = e.date;
        // Ajusta data conforme parcela
        if (inlineEdit.parcelaAtual && inlineEdit.parcelaTotal) {
          desc += ` (Parcela ${inlineEdit.parcelaAtual}/${inlineEdit.parcelaTotal})`;
          // Ajusta data: pega data da primeira parcela e soma meses
          const match = e.description.match(/\(Parcela (\d+)(?:\/(\d+))?\)/);
          let parcelaInicial = 1;
          let parcelaAtual = parseInt(inlineEdit.parcelaAtual);
          if (match) {
            parcelaInicial = parseInt(match[1]);
          }
          // Descobre data da primeira parcela
          const originalDate = new Date(e.date);
          // Se parcelaAtual > 1, soma meses
          if (!isNaN(parcelaAtual) && parcelaAtual > 1) {
            const newMonth = originalDate.getMonth() - (parcelaInicial - 1) + (parcelaAtual - 1);
            const newYear = originalDate.getFullYear() + Math.floor(newMonth / 12);
            const realMonth = newMonth % 12;
            // Mantém o dia, ajusta para último dia do mês se necessário
            let dia = originalDate.getDate();
            const lastDay = new Date(newYear, realMonth + 1, 0).getDate();
            if (dia > lastDay) dia = lastDay;
            const dataParcela = new Date(newYear, realMonth, dia);
            newDate = dataParcela.toISOString().split('T')[0];
          }
        } else if (inlineEdit.parcelaAtual) {
          desc += ` (Parcela ${inlineEdit.parcelaAtual})`;
        } else if (e.description.match(/\(Parcela.*\)$/)) {
          desc += ' ' + (e.description.match(/\(Parcela.*\)$/)?.[0] ?? '');
        }
        return {
          ...e,
          amount: parseFloat(inlineEdit.amount),
          description: desc,
          category: inlineEdit.category,
          paidBy: inlineEdit.paidBy,
          shared: inlineEdit.shared === 'Compartilhada',
          date: newDate,
        }
      }))
      setEditingId(null)
      setInlineEdit(null)
    }

    const handleInlineCancel = () => {
      setEditingId(null)
      setInlineEdit(null)
    }

    const handleDelete = (id: string) => {
      const expenseToDelete = expenses.find(e => e.id === id)
      if (!expenseToDelete) return
      if (expenseToDelete.installmentGroupId) {
        if (window.confirm('Deseja excluir todas as parcelas desta despesa? (Escolha Cancelar para excluir apenas esta)')) {
          const updated = expenses.filter(e => e.installmentGroupId !== expenseToDelete.installmentGroupId)
          setExpenses(updated)
          localStorage.setItem('expenses', JSON.stringify(updated))
          return
        }
      }
      if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
        const updated = expenses.filter(e => e.id !== id)
        setExpenses(updated)
        localStorage.setItem('expenses', JSON.stringify(updated))
      }
    }

    const monthlyExpenses = expenses.filter(e => {
      const d = new Date(e.date)
      const isMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear
      const isPerson = personFilter === 'Todos' || e.paidBy === personFilter
      return isMonth && isPerson
    })

    const total = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0)
    const samuelTotal = monthlyExpenses.filter(e => e.paidBy === 'Samuel').reduce((sum, e) => sum + e.amount, 0)
    const camilaTotal = monthlyExpenses.filter(e => e.paidBy === 'Camila').reduce((sum, e) => sum + e.amount, 0)
    const samuelPercent = total ? (samuelTotal / total * 100).toFixed(1) : '0'
    const camilaPercent = total ? (camilaTotal / total * 100).toFixed(1) : '0'

    // Dados por categoria com informação de quem pagou
    const categoryDataDetailed = CATEGORIES.map(cat => {
      const catTotal = monthlyExpenses
        .filter(e => e.category === cat)
        .reduce((sum, e) => sum + e.amount, 0)
      const samuelCatTotal = monthlyExpenses
        .filter(e => e.category === cat && e.paidBy === 'Samuel')
        .reduce((sum, e) => sum + e.amount, 0)
      const camilaCatTotal = monthlyExpenses
        .filter(e => e.category === cat && e.paidBy === 'Camila')
        .reduce((sum, e) => sum + e.amount, 0)
      return {
        name: cat,
        value: catTotal,
        Samuel: samuelCatTotal,
        Camila: camilaCatTotal
      }
    }).filter(item => item.value > 0)

    const categoryData = categoryDataDetailed.map(item => ({ name: item.name, value: item.value }))

    // Dados por pessoa
    const personData = [
      { name: 'Samuel', value: parseFloat(samuelTotal.toFixed(2)) },
      { name: 'Camila', value: parseFloat(camilaTotal.toFixed(2)) }
    ].filter(item => item.value > 0)

    const handlePrevMonth = () => {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    }

    const handleNextMonth = () => {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    }

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const [year, month] = e.target.value.split('-').map(Number)
      setCurrentYear(year)
      setCurrentMonth(month - 1)
    }

    const monthName = new Date(currentYear, currentMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    const monthValue = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`

    // Filtro de despesas para o card de análise de salário
    const filteredSalaryExpenses = monthlyExpenses.filter(e => {
      if (salaryType === 'Ambos') return e.paidBy === salaryPerson;
      if (salaryType === 'Compartilhada') return e.paidBy === salaryPerson && (e.shared === true || e.shared === undefined);
      if (salaryType === 'Individual') return e.paidBy === salaryPerson && e.shared === false;
      return false;
    });
    const filteredSalaryTotal = filteredSalaryExpenses.reduce((sum, e) => sum + e.amount, 0);
    const salary = salaryPerson === 'Samuel' ? samuelSalary : camilaSalary;
    // Para compartilhada, mostra proporção; para individual, 100%; para ambos, soma tudo
    let salaryPercent = '100';
    let totalSalary = samuelSalary + camilaSalary;
    if (salaryType === 'Compartilhada') {
      salaryPercent = totalSalary ? (salary / totalSalary * 100).toFixed(1) : '0';
    }
    const expectedContribution = salaryType === 'Compartilhada'
      ? (filteredSalaryExpenses.reduce((sum, e) => sum + e.amount, 0) * parseFloat(salaryPercent) / 100)
      : filteredSalaryTotal;

    // Limpa cache e refaz previsão baseada apenas no array atual de despesas
    // Zera banco de dados da previsão ao iniciar
    useEffect(() => {
      localStorage.removeItem('expenses');
      localStorage.setItem('expenses', JSON.stringify(expenses));
    }, [expenses]);

    // Nova metodologia: previsão mensal expandindo parcelas e recorrências
    function expandFutureExpenses(expenses: Expense[], monthsAhead = 12) {
      const today = new Date();
      const expanded: Expense[] = [];
      expenses.forEach(e => {
        // Parcelada: já expandida na tabela
        expanded.push(e);
        // Recorrente: expandir para meses futuros
        if (e.description.includes('Recorrência:')) {
          const recType = e.description.match(/Recorrência: (\w+)/)?.[1];
          let interval = 0;
          if (recType === 'Mensal') interval = 1;
          else if (recType === 'Semanal') interval = 7;
          else if (recType === 'Anual') interval = 12;
          if (interval) {
            const start = new Date(e.date);
            for (let i = 1; i < monthsAhead; i++) {
              let nextDate = new Date(start);
              if (recType === 'Semanal') {
                nextDate.setDate(nextDate.getDate() + 7 * i);
              } else {
                nextDate.setMonth(nextDate.getMonth() + i);
              }
              if (nextDate > today) {
                expanded.push({ ...e, id: generateUUID(), date: nextDate.toISOString().split('T')[0] });
              }
            }
          }
        }
      });
      return expanded;
    }

    // Previsão mensal agrupada por mês e categoria
    const monthsAheadForecast = 12;
    const todayForecast = new Date();
    const expandedExpenses = expandFutureExpenses(expenses, monthsAheadForecast);
    const mesesUnicos = Array.from(new Set(expandedExpenses.map(e => {
      const d = new Date(e.date);
      return `${d.getFullYear()}-${d.getMonth()}`;
    })));
    const previsaoPorMes = mesesUnicos.map(key => {
      const [year, month] = key.split('-').map(Number);
      const label = new Date(year, month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      const monthExpenses = expandedExpenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === month && d.getFullYear() === year;
      }).sort((a, b) => {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        if (da !== db) return db - da;
        return a.description.localeCompare(b.description);
      });
      const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      return {
        label,
        total,
        expenses: monthExpenses
      };
    }).sort((a, b) => {
      const da = new Date(a.expenses[0]?.date || 0);
      const db = new Date(b.expenses[0]?.date || 0);
      return da.getTime() - db.getTime();
    });
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl mx-auto mt-2">
          <div className="flex justify-center mb-2 gap-2">
            <button
              className={`px-3 py-1 rounded font-bold text-xs ${activeTab === 'tabela' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
              onClick={() => setActiveTab('tabela')}
            >Tabela de Despesas</button>
            <button
              className={`px-3 py-1 rounded font-bold text-xs ${activeTab === 'previsao' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'}`}
              onClick={() => setActiveTab('previsao')}
            >Previsão</button>
          </div>
          {activeTab === 'previsao' && (
            <div className="bg-slate-800 p-2 rounded-lg shadow-2xl border border-slate-700 text-center">
              <h2 className="text-sm font-bold text-green-400 mb-2">🔮 Previsão de Gastos por Mês</h2>
              {previsaoPorMes.length === 0 ? (
                <p className="text-slate-400">Nenhuma despesa cadastrada.</p>
              ) : (
                <div className="space-y-6">
                  {previsaoPorMes.map(m => {
                    const categoriaData = CATEGORIES.map((cat, idx) => {
                      const value = m.expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
                      return { name: cat, value, color: COLORS[idx % COLORS.length] };
                    }).filter(d => d.value > 0);
                    const handlePieClick = (data: any, index: number) => {
                      setSelectedCategoryByMonth(prev => ({ ...prev, [m.label]: data.name }));
                      setSelectedMonthExpensesByMonth(prev => ({ ...prev, [m.label]: m.expenses.filter(e => e.category === data.name) }));
                    };
                    const selectedCategory = selectedCategoryByMonth[m.label];
                    const selectedMonthExpenses = selectedMonthExpensesByMonth[m.label] || [];
                    return (
                      <div key={m.label} className="bg-slate-700 p-1 rounded border border-slate-600 flex flex-col lg:flex-row gap-1">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-0">
                            <span className="text-xs font-bold text-slate-200">{m.label.charAt(0).toUpperCase() + m.label.slice(1)}</span>
                            <span className="text-sm font-bold text-green-300">R$ {m.total.toFixed(2)}</span>
                          </div>
                          <ResponsiveContainer width="100%" height={100}>
                            <PieChart>
                              <Pie data={categoriaData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent ? percent * 100 : 0).toFixed(0)}%`} outerRadius={80} dataKey="value" onClick={handlePieClick}>
                                {categoriaData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} contentStyle={{ backgroundColor: '#334155', border: 'none', borderRadius: '8px' }} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        {selectedCategory && selectedMonthExpenses.length > 0 && (
                          <div className="flex-1 bg-slate-800 p-1 rounded border border-slate-600">
                            <h3 className="text-xs font-bold text-green-400 mb-0">Despesas em {selectedCategory}</h3>
                            <ul className="text-slate-300 text-xs space-y-0">
                              {selectedMonthExpenses.map(e => (
                                <li key={e.id} className="flex justify-between">
                                  <span>{e.description || <em>Sem descrição</em>}</span>
                                  <span>R$ {e.amount.toFixed(2)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        {activeTab === 'tabela' && (
          <div className="flex-1 max-w-7xl mx-auto w-full overflow-y-auto text-xs">
            <h1 className="text-xl font-bold text-center mb-1 text-white">💰 Controle de Despesas</h1>
            <p className="text-center text-slate-400 mb-2">
              {Array.from(new Set(expenses.map(e => e.paidBy))).join(' & ')}
            </p>
            {/* Modal de Salários */}
            {showSalaryModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-800 p-2 rounded-lg shadow-xl max-w-md w-full border border-slate-700">
                  <h3 className="text-base font-bold text-white mb-2">Configurar Salários</h3>
                  <div className="space-y-1 mb-2">
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium text-xs">Salário Samuel</label>
                      <input
                        type="number"
                        value={samuelSalary}
                        onChange={(e) => setSamuelSalary(parseFloat(e.target.value) || 0)}
                        className="w-full p-1 border-2 border-slate-600 rounded bg-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium text-xs">Salário Camila</label>
                      <input
                        type="number"
                        value={camilaSalary}
                        onChange={(e) => setCamilaSalary(parseFloat(e.target.value) || 0)}
                        className="w-full p-1 border-2 border-slate-600 rounded bg-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSalaryModal(false)}
                    className="w-full bg-blue-600 text-white p-1 rounded font-semibold hover:bg-blue-700 transition text-xs"
                  >
                    Salvar Renda
                  </button>
                </div>
              </div>
            )}
            {/* ...restante do código da aba tabela... */}
          </div>
        )}
      </div>
    );
}
