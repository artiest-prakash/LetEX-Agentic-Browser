import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, FileText, CheckSquare, Sparkles, MoreHorizontal, Bot, User as UserIcon, List, Workflow, CheckCircle2, Lock, History, Clock, ChevronDown } from 'lucide-react';
import { SidebarTab, Message, User, Thread, Note } from '../types';
import { GlassPane } from './GlassPane';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onSummarize: () => void;
  user: User | null;
  threads: Thread[];
  notes: Note[];
  onSelectThread: (thread: Thread) => void;
  activeThreadId?: string;
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  messages, 
  onSummarize, 
  user,
  threads,
  notes,
  onSelectThread,
  activeThreadId,
  onNewChat
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>(SidebarTab.CHAT);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (activeTab === SidebarTab.CHAT && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  const renderMessageText = (text: string) => {
    return text.split('\n').map((line, i) => {
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
             return <li key={i} className="ml-4 list-disc pl-1 mb-1">{line.trim().substring(2)}</li>
        }
        const parts = line.split('**');
        return (
            <p key={i} className={`min-h-[1.2em] mb-1 ${line.trim() === '' ? 'h-2' : ''}`}>
                {parts.map((part, index) => 
                    index % 2 === 1 ? <strong key={index}>{part}</strong> : part
                )}
            </p>
        );
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className={`
        fixed z-40 transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform
        
        /* Mobile: Bottom Sheet */
        inset-x-0 bottom-0 h-[85vh] w-full 
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}

        /* Desktop: Right Sidebar */
        md:inset-y-0 md:right-0 md:bottom-auto md:h-full md:w-[400px]
        ${isOpen ? 'md:translate-x-0' : 'md:translate-x-full md:translate-y-0'}
      `}
    >
      <GlassPane className="h-full w-full flex flex-col rounded-t-[2.5rem] md:rounded-l-3xl md:rounded-tr-none border-t md:border-t border-x md:border-l border-white/50 relative overflow-hidden shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        
        {/* Mobile Drag Handle */}
        <div className="w-full flex justify-center pt-3 pb-1 md:hidden" onClick={onClose}>
            <div className="w-12 h-1.5 rounded-full bg-gray-300/60" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 md:pt-6 md:pb-2">
          <div className="flex items-center gap-2 text-gray-800 font-semibold text-lg">
             <div className="p-1.5 bg-purple-100 rounded-lg">
                <Sparkles size={18} className="text-purple-600 fill-purple-600/20" />
             </div>
             <span>Agent</span>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === SidebarTab.CHAT && (
               <button 
                onClick={onNewChat}
                className="p-2 px-4 bg-black/5 rounded-full text-xs font-semibold hover:bg-black/10 active:scale-95 transition-all"
               >
                 New Chat
               </button>
            )}
             <button className="p-3 text-gray-500 hover:bg-black/5 rounded-full transition-colors active:scale-95">
                <MoreHorizontal size={20} />
             </button>
             <button 
                onClick={onClose} 
                className="p-3 text-gray-500 hover:bg-black/5 rounded-full transition-colors active:scale-95 md:hidden"
             >
                <ChevronDown size={24} />
             </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 flex items-center justify-between border-b border-black/5 mt-2">
          <div className="flex gap-6 overflow-x-auto no-scrollbar mask-linear-fade">
            {[SidebarTab.CHAT, SidebarTab.HISTORY, SidebarTab.NOTES, SidebarTab.TASKS].map((tab) => (
                <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                    pb-3 text-sm font-medium transition-all relative flex-shrink-0 min-w-[3rem] text-center
                    ${activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}
                `}
                >
                {tab}
                {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full" />
                )}
                </button>
            ))}
          </div>

          {activeTab === SidebarTab.CHAT && user && (
              <button 
                onClick={onSummarize}
                className="mb-2 p-2 px-3 bg-purple-50 text-purple-600 rounded-full text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-100 active:scale-95 transition-all whitespace-nowrap shadow-sm"
                title="Summarize current page"
              >
                  <List size={14} /> Summarize
              </button>
          )}
        </div>

        {/* Content Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar scroll-smooth relative pb-24 md:pb-6">
          
          {/* Auth Protection Overlay */}
          {!user && (
             <div className="absolute inset-0 z-10 backdrop-blur-md bg-white/40 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                <GlassPane className="p-8 rounded-3xl border border-white shadow-xl flex flex-col items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <Lock size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Sign in required</h3>
                  <p className="text-sm text-gray-500 max-w-[250px]">
                    Sign in to access your AI Agent, history, and notes.
                  </p>
                </GlassPane>
             </div>
          )}

          {activeTab === SidebarTab.CHAT && (
            <div className={`space-y-6 ${!user ? 'opacity-30 pointer-events-none' : ''}`}>
              {messages.length === 0 && (
                  <div className="text-center text-gray-400 mt-10">
                      <p className="text-sm">Start a conversation...</p>
                  </div>
              )}
              
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Avatar */}
                  <div className={`
                    w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm
                    ${msg.sender === 'user' ? 'bg-gray-900 text-white' : 'bg-white border border-white/60 text-purple-600'}
                  `}>
                     {msg.sender === 'user' ? <UserIcon size={16} /> : <Bot size={18} />}
                  </div>

                  {/* Message Content */}
                  {msg.toolCall ? (
                    // --- Agent Planning Card ---
                    <div className="max-w-[90%] w-full animate-in fade-in zoom-in slide-in-from-bottom-2 duration-500">
                        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/90 to-purple-50/90 backdrop-blur-md p-4 shadow-sm relative overflow-hidden">
                            {/* Animated sheen */}
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                            
                            <div className="flex items-center gap-2 mb-2 text-blue-700">
                                <Workflow size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Agent Planning</span>
                            </div>
                            <p className="text-sm text-gray-700 mb-3 leading-snug font-medium">
                                Using <code className="bg-white/60 px-1.5 py-0.5 rounded-md text-blue-800 font-mono text-xs border border-blue-100">{msg.toolCall.name}</code>
                            </p>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/50 p-2.5 rounded-xl border border-white/50">
                                <CheckCircle2 size={14} className="text-green-600" />
                                <span>Executing step...</span>
                            </div>
                        </div>
                    </div>
                  ) : (
                    // --- Standard Text Message ---
                    <div 
                        className={`
                        max-w-[90%] p-4 rounded-2xl text-base md:text-sm leading-relaxed shadow-sm
                        ${msg.sender === 'user' 
                            ? 'bg-gray-900 text-white rounded-tr-sm' 
                            : 'bg-white/70 border border-white/50 text-gray-800 rounded-tl-sm'
                        }
                        ${msg.isLoading ? 'animate-pulse' : ''}
                        `}
                    >
                        {msg.isLoading ? (
                            <div className="flex gap-1.5 items-center h-5 px-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                            </div>
                        ) : (
                            <div className="prose prose-sm max-w-none">
                                {renderMessageText(msg.text)}
                            </div>
                        )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === SidebarTab.HISTORY && (
             <div className={`space-y-4 ${!user ? 'opacity-30 pointer-events-none' : ''}`}>
                 {threads.length === 0 ? (
                     <div className="text-center text-gray-400 mt-10">
                        <History size={32} className="mx-auto mb-2 opacity-50"/>
                        <p className="text-sm">No conversation history yet.</p>
                     </div>
                 ) : (
                     threads.map(thread => (
                         <div 
                           key={thread.id}
                           onClick={() => {
                               onSelectThread(thread);
                               setActiveTab(SidebarTab.CHAT);
                           }}
                           className={`
                             p-4 rounded-xl border transition-all cursor-pointer group active:scale-[0.98]
                             ${activeThreadId === thread.id 
                                ? 'bg-purple-50 border-purple-200 shadow-sm' 
                                : 'bg-white/40 border-white/50 hover:bg-white/80 hover:shadow-md'
                             }
                           `}
                         >
                             <div className="flex items-start justify-between mb-1">
                                <h4 className={`text-sm font-semibold line-clamp-1 ${activeThreadId === thread.id ? 'text-purple-700' : 'text-gray-800'}`}>
                                    {thread.title}
                                </h4>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                    {formatDate(thread.updatedAt)}
                                </span>
                             </div>
                             <p className="text-xs text-gray-500 line-clamp-2">
                                 {thread.messages[thread.messages.length - 1]?.text || "Empty conversation"}
                             </p>
                         </div>
                     ))
                 )}
             </div>
          )}

          {activeTab === SidebarTab.NOTES && (
            <div className={`space-y-4 ${!user ? 'opacity-30 pointer-events-none' : ''}`}>
               {notes.length === 0 ? (
                  <div className="text-center text-gray-400 mt-10">
                    <FileText size={32} strokeWidth={1} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notes saved yet.</p>
                  </div>
               ) : (
                   notes.map(note => (
                       <div key={note.id} className="p-4 rounded-xl bg-yellow-50/60 border border-yellow-100/50 shadow-sm hover:shadow-md transition-all">
                           <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                           <div className="flex items-center gap-1 mt-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                               <Clock size={10} />
                               <span>{formatDate(note.createdAt)}</span>
                           </div>
                       </div>
                   ))
               )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/5 text-[10px] text-center text-gray-400 uppercase tracking-widest font-medium md:block hidden">
          Powered by Gemini 2.5
        </div>

      </GlassPane>
    </div>
  );
};