'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { ANALYTICS_MONTHLY } from '@/mock/data/other';
import { formatCurrency } from '@/lib/utils';

const KPIS = [
  {name:'Закупки в срок',value:87,target:95,unit:'%',status:'warning'},
  {name:'Экономия бюджета',value:2.4,target:3.0,unit:'%',status:'warning'},
  {name:'Среднее время согл.',value:4.2,target:3.0,unit:'дн.',status:'bad'},
  {name:'Договоры без просрочек',value:92,target:95,unit:'%',status:'warning'},
  {name:'Доля МСП',value:58,target:50,unit:'%',status:'good'},
  {name:'Заполненность карточек',value:94,target:100,unit:'%',status:'warning'},
];
const EMP=[{name:'Петров А.В.',closed:8,onTime:7,overdue:1,score:88},{name:'Никитин П.А.',closed:6,onTime:6,overdue:0,score:100},{name:'Орлова Т.В.',closed:10,onTime:9,overdue:1,score:90}];
const ST_CLR: Record<string,string>={good:'text-green-700 bg-green-50',warning:'text-yellow-700 bg-yellow-50',bad:'text-red-600 bg-red-50'};
const BAR_CLR: Record<string,string>={good:'bg-green-500',warning:'bg-yellow-400',bad:'bg-red-500'};

export default function KpiPage() {
  return (
    <AppLayout>
      <div className="p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Центр KPI'}]}/>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-base font-bold">Центр KPI</h1>
          <select className="gov-select w-40"><option>I полугодие 2026</option><option>I квартал 2026</option><option>2026 год</option></select>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {KPIS.map(k=>(
            <div key={k.name} className="gov-card p-3">
              <div className="text-xs font-bold text-gray-700 mb-2">{k.name}</div>
              <div className={`text-xl font-bold px-2 py-0.5 rounded inline-block mb-1 ${ST_CLR[k.status]}`}>{k.value}{k.unit}</div>
              <div className="text-xs text-gray-400 mb-1">Цель: {k.target}{k.unit}</div>
              <div className="gov-progress">
                <div className={`gov-progress-bar ${BAR_CLR[k.status]}`} style={{width:`${Math.min(100,k.value/k.target*100)}%`}}/>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="gov-card">
            <div className="gov-section-title">📈 Динамика по месяцам 2026</div>
            <div className="p-3">
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={ANALYTICS_MONTHLY}>
                  <XAxis dataKey="month" tick={{fontSize:10}}/>
                  <YAxis tick={{fontSize:10}}/>
                  <Tooltip contentStyle={{fontSize:11}}/>
                  <Line type="monotone" dataKey="count" stroke="#003087" strokeWidth={2} dot={{r:3}} name="Создано"/>
                  <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} dot={{r:3}} name="Завершено"/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="gov-card">
            <div className="gov-section-title">👥 KPI специалистов</div>
            <div className="p-3">
              <table className="gov-table">
                <thead><tr><th>Специалист</th><th className="text-center">Закрыто</th><th className="text-center">В срок</th><th className="text-center">Просрочено</th><th className="text-center">Оценка</th></tr></thead>
                <tbody>
                  {EMP.map(e=>(
                    <tr key={e.name}>
                      <td className="text-xs font-bold">{e.name}</td>
                      <td className="text-center text-xs font-bold">{e.closed}</td>
                      <td className="text-center text-xs text-green-700 font-bold">{e.onTime}</td>
                      <td className="text-center text-xs text-red-600 font-bold">{e.overdue}</td>
                      <td className="text-center">
                        <span className={`text-sm font-bold ${e.score>=95?'text-green-700':e.score>=85?'text-yellow-700':'text-red-600'}`}>{e.score}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="gov-card lg:col-span-2">
            <div className="gov-section-title">💰 Бюджет закупок по месяцам 2026</div>
            <div className="p-3">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={ANALYTICS_MONTHLY}>
                  <XAxis dataKey="month" tick={{fontSize:10}}/>
                  <YAxis tick={{fontSize:10}} tickFormatter={v=>`${(v/1000).toFixed(0)}к`}/>
                  <Tooltip formatter={(v:number)=>[formatCurrency(v),'Сумма']} contentStyle={{fontSize:11}}/>
                  <Bar dataKey="sum" fill="#1890ff" radius={[2,2,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
