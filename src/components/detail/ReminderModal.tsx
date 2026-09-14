import React, { useState } from 'react';
import { DocumentModel, ReminderModel } from '../../types/document';
import { useAuth } from '../../contexts/AuthContext';
import { useDocument } from '../../contexts/DocumentContext';
import { Calendar, X, Clock, Check } from 'lucide-react';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentModel;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, document }) => {
  const { user, isDemoUser } = useAuth();
  const { addReminder } = useDocument();

  const [targetDate, setTargetDate] = useState<string>(
    document.expiryDate || new Date().toISOString().split('T')[0]
  );
  const [period, setPeriod] = useState<'1_week_before' | '1_month_before' | '3_months_before'>(
    '1_week_before'
  );
  const [customTitle, setCustomTitle] = useState<string>(
    `Expiry reminder for ${document.title}`
  );
  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    const userId = user?.uid || (isDemoUser ? 'demo-user' : '');

    const newReminder: ReminderModel = {
      id: 'rem-' + Date.now(),
      ownerId: userId,
      documentId: document.id,
      documentTitle: document.title,
      title: customTitle,
      targetDate,
      reminderDate: targetDate, // Computed date
      period,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await addReminder(newReminder);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Set Smart Deadline Reminder</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSaved ? (
          <div className="py-8 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Check className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-white">Reminder Scheduled!</p>
            <p className="text-xs text-slate-400">Added to your active deadline tracker.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Reminder Title
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Expiration / Deadline Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Notification Advance Notice
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="1_week_before">1 Week Before Deadline</option>
                <option value="1_month_before">1 Month Before Renewal</option>
                <option value="3_months_before">3 Months Before Expiration</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-800 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md"
              >
                Save Reminder
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
