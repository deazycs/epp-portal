'use client';

import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { Send, Users, User, Paperclip } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Message {
  id: string;
  from: string;
  text: string;
  time: string;
  mine: boolean;
  attachment?: string;
}

interface Chat {
  id: string;
  name: string;
  type: 'group' | 'direct';
  avatar: string;
  unread: number;
  messages: Message[];
}

const INITIAL_CHATS: Chat[] = [
  {
    id: 'c1',
    name: 'Общий МТО',
    type: 'group',
    avatar: 'МТО',
    unread: 0,
    messages: [
      { id: 'm1', from: 'Швецов К.Е.', text: 'Коллеги, картриджи для принтеров придут в пятницу. Прошу подготовить места для приёмки.', time: '10:30', mine: true },
      { id: 'm2', from: 'Давыдова Ф.А.', text: 'Принято. Склад готов.', time: '10:32', mine: false },
      { id: 'm3', from: 'Митусов С.А.', text: 'Подтверждаю — 3 ящика по ТЗ.', time: '10:35', mine: false },
    ],
  },
  {
    id: 'c2',
    name: 'Черемных М.Ю.',
    type: 'direct',
    avatar: 'НС',
    unread: 1,
    messages: [
      { id: 'm4', from: 'Черемных М.Ю.', text: 'Андрей Викторович, пришлите ТЗ на картриджи на согласование.', time: '09:15', mine: false },
      { id: 'm5', from: 'Швецов К.Е.', text: 'Наталья Сергеевна, направил на почту. Также прикрепил в карточке закупки РЗ-2026-00142.', time: '09:22', mine: true },
      { id: 'm6', from: 'Черемных М.Ю.', text: 'Получила, посмотрю до обеда.', time: '09:23', mine: false },
      { id: 'm7', from: 'Черемных М.Ю.', text: 'Согласовала. Можете размещать в Берёзке.', time: '11:45', mine: false },
    ],
  },
  {
    id: 'c3',
    name: 'Болдина А.В.',
    type: 'direct',
    avatar: 'КД',
    unread: 0,
    messages: [
      { id: 'm8', from: 'Болдина А.В.', text: 'Договор по серверам подписан. Оригинал у меня, передам сегодня.', time: 'Вчера', mine: false },
      { id: 'm9', from: 'Швецов К.Е.', text: 'Отлично, спасибо! Как получу — передам в специалист ФЭОию.', time: 'Вчера', mine: true },
    ],
  },
  {
    id: 'c4',
    name: 'Закупка РЗ-2026-00089',
    type: 'group',
    avatar: 'РЗ',
    unread: 0,
    messages: [
      { id: 'm10', from: 'Митусов С.А.', text: 'Запросил КП у трёх поставщиков по серверам. Жду ответов до пятницы.', time: 'Пн', mine: false },
      { id: 'm11', from: 'Швецов К.Е.', text: 'Принято. Как получим — сделаем расчёт НМЦК.', time: 'Пн', mine: true },
      { id: 'm12', from: 'Болдина А.В.', text: 'Проект договора уже готов, жду итогов торгов.', time: 'Вт', mine: false },
    ],
  },
];

function formatNow() {
  return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeId, setActiveId] = useState('c2');
  const [msg, setMsg] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const active = chats.find(c => c.id === activeId)!;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeId, active?.messages.length]);

  const sendMessage = () => {
    const text = msg.trim();
    if (!text && !attachment) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      from: 'Швецов К.Е.',
      text: text || (attachment ? `📎 ${attachment}` : ''),
      time: formatNow(),
      mine: true,
      attachment: attachment ?? undefined,
    };

    setChats(prev => prev.map(c =>
      c.id === activeId
        ? { ...c, messages: [...c.messages, newMsg], unread: 0 }
        : c
    ));
    setMsg('');
    setAttachment(null);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachment(file.name);
    e.target.value = '';
  };

  const selectChat = (id: string) => {
    setActiveId(id);
    // Сбрасываем счётчик непрочитанных
    setChats(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
  };

  const totalUnread = chats.reduce((s, c) => s + c.unread, 0);

  return (
    <AppLayout>
      <div className="p-3 sm:p-4">
        <Breadcrumbs items={[{ label: 'Рабочий стол', href: '/dashboard' }, { label: 'Внутренний чат' }]} />
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Внутренний чат</h1>
            {totalUnread > 0 && <p className="text-xs text-blue-600">Непрочитанных: {totalUnread}</p>}
          </div>
        </div>

        <div className="gov-card overflow-hidden flex" style={{ height: 'calc(100vh - 200px)', minHeight: '480px' }}>

          {/* Список чатов */}
          <div className="w-48 sm:w-56 flex-shrink-0 border-r border-gray-200 flex flex-col">
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Диалоги</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chats.map(c => (
                <button key={c.id} onClick={() => selectChat(c.id)}
                  className={`w-full text-left px-3 py-2.5 border-b border-gray-100 hover:bg-gray-50 transition-colors ${activeId === c.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${c.type === 'group' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {c.type === 'group' ? <Users size={12} /> : c.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-800 truncate">{c.name}</span>
                        {c.unread > 0 && (
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0 ml-1 font-bold">
                            {c.unread}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {c.messages[c.messages.length - 1]?.text.slice(0, 28) ?? ''}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Область переписки */}
          <div className="flex-1 flex flex-col min-w-0">

            {/* Шапка чата */}
            <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 flex items-center gap-2 flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${active.type === 'group' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                {active.type === 'group' ? <Users size={13} /> : active.avatar}
              </div>
              <div>
                <div className="text-xs font-bold text-gray-800">{active.name}</div>
                <div className="text-xs text-gray-400">
                  {active.type === 'group' ? 'Групповой чат' : 'Личный диалог'} · {active.messages.length} сообщений
                </div>
              </div>
            </div>

            {/* Сообщения */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {active.messages.map(m => (
                <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'items-start gap-2'}`}>
                  {!m.mine && (
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0 mt-0.5">
                      {m.from.split(' ').map(p => p[0]).join('').slice(0, 2)}
                    </div>
                  )}
                  <div className={`max-w-xs sm:max-w-sm ${m.mine ? '' : ''}`}>
                    {!m.mine && (
                      <div className="text-xs font-bold text-blue-600 mb-0.5 ml-1">{m.from}</div>
                    )}
                    <div className={`rounded-2xl px-3 py-2 text-xs leading-relaxed ${m.mine ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                      {m.text}
                      {m.attachment && (
                        <div className={`mt-1 text-xs flex items-center gap-1 ${m.mine ? 'text-blue-200' : 'text-blue-600'}`}>
                          <Paperclip size={10} /> {m.attachment}
                        </div>
                      )}
                    </div>
                    <div className={`text-xs mt-0.5 text-gray-400 ${m.mine ? 'text-right' : 'ml-1'}`}>{m.time}</div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Вложение */}
            {attachment && (
              <div className="px-3 py-1.5 bg-blue-50 border-t border-blue-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-blue-700"><Paperclip size={11} /> {attachment}</span>
                <button onClick={() => setAttachment(null)} className="text-red-400 hover:text-red-600 ml-2">✕</button>
              </div>
            )}

            {/* Поле ввода */}
            <div className="p-3 border-t border-gray-200 flex gap-2 flex-shrink-0">
              <input ref={fileRef as any} type="file" className="hidden" onChange={handleFile} />
              <button onClick={() => fileRef.current?.click()}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                title="Прикрепить файл">
                <Paperclip size={14} />
              </button>
              <textarea
                className="gov-input flex-1 resize-none text-xs py-2"
                placeholder="Введите сообщение... (Enter — отправить, Shift+Enter — новая строка)"
                value={msg}
                onChange={e => setMsg(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
                style={{ minHeight: '36px', maxHeight: '100px' }}
              />
              <button onClick={sendMessage}
                disabled={!msg.trim() && !attachment}
                className="gov-btn gov-btn-primary gov-btn-sm flex-shrink-0 disabled:opacity-40">
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
