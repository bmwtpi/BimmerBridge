import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Paperclip, 
  RotateCcw, 
  FileText, 
  Download, 
  MessageSquare, 
  ShieldCheck,
  User,
  Laptop,
  Car
} from 'lucide-react';
import { ChatMessage, LangType, Session } from '../types';
import { translations } from '../lib/translations';

interface ChatDrawerProps {
  lang: LangType;
  isOpen: boolean;
  onClose: () => void;
  activeSession: Session | null;
  messages: ChatMessage[];
  onSendMessage: (sessionId: string, senderRole: 'admin' | 'car' | 'tech') => void;
  chatInput: string;
  setChatInput: (text: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, sessionId: string, senderRole: 'admin' | 'car' | 'tech') => void;
  onRecallMessage: (sessionId: string, messageId: string) => void;
  currentRole: 'admin' | 'car' | 'tech';
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  lang,
  isOpen,
  onClose,
  activeSession,
  messages,
  onSendMessage,
  chatInput,
  setChatInput,
  onFileUpload,
  onRecallMessage,
  currentRole
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  if (!isOpen || !activeSession) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage(activeSession.id, currentRole);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-[#0c0d12] border-l border-white/10 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                {t.chat}
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-bold">
                {activeSession.code}
              </span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> P2P ENCRYPTED
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-xs text-white/40 font-medium">
              {lang === 'zh' ? '暂无消息。在此与远端安全沟通或传输文件。' : 'No messages yet. Send logs or diagnostic advice.'}
            </span>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === currentRole;
            if (msg.recalled) {
              return (
                <div key={msg.id} className="text-center my-2">
                  <span className="text-[10px] text-white/30 italic bg-white/5 px-2.5 py-1 rounded-full font-mono">
                    {t.recalledNote}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[9px] font-mono text-white/40 uppercase font-bold">
                    {msg.sender === 'car' ? (
                      <span className="text-blue-400 flex items-center gap-1"><Car className="w-2.5 h-2.5" /> CAR</span>
                    ) : msg.sender === 'tech' ? (
                      <span className="text-indigo-400 flex items-center gap-1"><Laptop className="w-2.5 h-2.5" /> TECH</span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1"><User className="w-2.5 h-2.5" /> ADMIN</span>
                    )}
                  </span>
                  <span className="text-[8px] font-mono text-white/20">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && (
                    <button
                      onClick={() => onRecallMessage(activeSession.id, msg.id)}
                      className="opacity-0 group-hover:opacity-100 text-[8px] text-white/30 hover:text-rose-400 font-mono transition-opacity ml-1"
                      title={t.recallMessage}
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>

                {msg.text && (
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed break-words shadow-md ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-[#181920] border border-white/10 text-white/90 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                )}

                {msg.file && (
                  <a
                    href={msg.file.url}
                    download={msg.file.name}
                    className="max-w-[85%] rounded-2xl p-3 bg-[#181920] border border-white/10 hover:border-blue-500/50 transition-all flex items-center gap-3 group/file"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white truncate group-hover/file:text-blue-400 transition-colors">
                        {msg.file.name}
                      </div>
                      <span className="text-[9px] font-mono text-white/40 flex items-center gap-1">
                        <Download className="w-2.5 h-2.5" /> Click to download
                      </span>
                    </div>
                  </a>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 bg-black/60 border-t border-white/10 space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => onFileUpload(e, activeSession.id, currentRole)}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-all shrink-0"
            title={t.sendFile}
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.typeMessage}
            className="flex-1 bg-black border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-blue-500 transition-all"
          />

          <button
            onClick={() => onSendMessage(activeSession.id, currentRole)}
            disabled={!chatInput.trim()}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-all shadow-md shadow-blue-600/20 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
