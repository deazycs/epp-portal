'use client';
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { HelpCircle, CheckCircle, Clock } from 'lucide-react';

const TICKETS=[
  {id:'T-2026-045',title:'Не удаётся загрузить документ PDF размером более 10 МБ',status:'closed',priority:'medium',created:'2026-05-10',closed:'2026-05-11'},
  {id:'T-2026-038',title:'Ошибка при смене статуса закупки РЗ-2026-00142',status:'closed',priority:'high',created:'2026-05-05',closed:'2026-05-06'},
  {id:'T-2026-052',title:'Некорректно отображается фильтр по подразделениям',status:'open',priority:'low',created:'2026-05-18',closed:null},
];
const P: Record<string,string>={high:'bg-red-50 text-red-700 border-red-300',medium:'bg-yellow-50 text-yellow-700 border-yellow-300',low:'bg-gray-100 text-gray-600 border-gray-300'};
const PL: Record<string,string>={high:'Высокий',medium:'Средний',low:'Низкий'};

export default function SupportPage() {
  const [sent,setSent]=useState(false);
  return (
    <AppLayout>
      <div className="p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Техническая поддержка'}]}/>
        <h1 className="text-base font-bold mb-4">Техническая поддержка</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="gov-card mb-4">
              <div className="gov-section-title">📞 Контакты поддержки</div>
              <div className="p-4 space-y-2">
                {[['Электронная почта','admin@rosreestr.ru'],['Телефон','+7 (495) 945-00-00 доб. 2099'],['Часы работы','Пн–Пт 09:00–18:00 (МСК)'],['Telegram','@rosreestr_it_help']].map(([k,v])=>(
                  <div key={k} className="flex justify-between border-b border-gray-100 pb-1.5">
                    <span className="text-xs text-gray-500">{k}</span>
                    <span className="text-xs font-bold text-gray-700">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="gov-card">
              <div className="gov-section-title">📋 Мои обращения</div>
              <div className="divide-y divide-gray-100">
                {TICKETS.map(t=>(
                  <div key={t.id} className="px-3 py-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-gray-800">{t.id}</div>
                        <div className="text-xs text-gray-600 mt-0.5">{t.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{t.created}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`gov-badge ${P[t.priority]}`}>{PL[t.priority]}</span>
                        {t.status==='open'
                          ? <span className="flex items-center gap-1 text-xs text-yellow-600"><Clock size={10}/> Открыто</span>
                          : <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle size={10}/> Закрыто</span>
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="gov-card">
            <div className="gov-section-title">✉ Новое обращение</div>
            <div className="p-4">
              {sent ? (
                <div className="gov-alert gov-alert-success"><span>✓</span><span>Обращение отправлено! Номер: T-2026-{Math.floor(Math.random()*900+100)}. Ответ — в течение 1 рабочего дня.</span></div>
              ) : (
                <div className="space-y-3">
                  <div><label className="gov-label">Тема *</label><input className="gov-input" placeholder="Кратко опишите проблему"/></div>
                  <div><label className="gov-label">Приоритет</label>
                    <select className="gov-select"><option>Низкий</option><option>Средний</option><option>Высокий</option></select>
                  </div>
                  <div><label className="gov-label">Описание проблемы *</label>
                    <textarea className="gov-input min-h-24 resize-none" placeholder="Подробно опишите проблему, шаги воспроизведения, скриншоты..."/>
                  </div>
                  <div><label className="gov-label">Модуль системы</label>
                    <select className="gov-select">
                      <option>Реестр закупок</option><option>Карточка закупки</option><option>Документы</option>
                      <option>Согласования</option><option>Отчётность</option><option>Другое</option>
                    </select>
                  </div>
                  <button onClick={()=>setSent(true)} className="gov-btn gov-btn-primary w-full justify-center">Отправить обращение</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
