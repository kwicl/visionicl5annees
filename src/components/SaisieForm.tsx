/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Tag, FileText, CheckCircle2, Circle, AlertCircle, PlusCircle, Check } from 'lucide-react';
import { TimeNode, ItemType, CategoryType, TimelineConfig } from '../types';

interface SaisieFormProps {
  config: TimelineConfig;
  onAddNode: (node: TimeNode) => void;
  selectedNodeToEdit?: TimeNode | null;
  onUpdateNode?: (node: TimeNode) => void;
  onCancelEdit?: () => void;
}

const CATEGORIES: CategoryType[] = ['Professional', 'Personal', 'Financial', 'Health', 'Growth'];
const TYPES: { value: ItemType; label: string; desc: string }[] = [
  { value: 'project', label: 'Projet', desc: 'Une initiative majeure avec des étapes claires' },
  { value: 'milestone', label: 'Jalon clé', desc: 'Un événement ou objectif charnière précis' },
  { value: 'observation', label: 'Observation', desc: 'Une note, réflexion ou compte rendu d\'état' },
];

const CATEGORY_STYLES: Record<CategoryType, { bg: string; text: string; label: string }> = {
  Professional: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Professionnel' },
  Personal: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Personnel' },
  Financial: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Finances' },
  Health: { bg: 'bg-rose-50', text: 'text-rose-700', label: 'Santé & Sport' },
  Growth: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Développement' },
};

export const SaisieForm: React.FC<SaisieFormProps> = ({
  config,
  onAddNode,
  selectedNodeToEdit,
  onUpdateNode,
  onCancelEdit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(config.todayDate);
  const [type, setType] = useState<ItemType>('project');
  const [category, setCategory] = useState<CategoryType>('Professional');
  const [notes, setNotes] = useState('');
  const [isPastDate, setIsPastDate] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Sync with edit mode when selectedNodeToEdit changes
  useEffect(() => {
    if (selectedNodeToEdit) {
      setTitle(selectedNodeToEdit.title);
      setDescription(selectedNodeToEdit.description);
      setDate(selectedNodeToEdit.date);
      setType(selectedNodeToEdit.type);
      setCategory(selectedNodeToEdit.category);
      setNotes(selectedNodeToEdit.notes);
    } else {
      resetForm();
    }
  }, [selectedNodeToEdit]);

  // Determine if chosen date is past or future compared to todayDate config
  useEffect(() => {
    if (date) {
      const selectedTime = new Date(date).getTime();
      const todayTime = new Date(config.todayDate).getTime();
      setIsPastDate(selectedTime <= todayTime);
    }
  }, [date, config.todayDate]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate(config.todayDate);
    setType('project');
    setCategory('Professional');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const nodeData: TimeNode = {
      id: selectedNodeToEdit ? selectedNodeToEdit.id : `node-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      date,
      type,
      category,
      notes: notes.trim(),
      completed: isPastDate,
    };

    if (selectedNodeToEdit && onUpdateNode) {
      onUpdateNode(nodeData);
    } else {
      onAddNode(nodeData);
      resetForm();
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

  return (
    <div id="saisie-form-card" className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-8 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            {selectedNodeToEdit ? 'Modifier la Saisie' : 'Ajouter un Élément'}
          </h2>
          <p className="text-xs text-gray-500">
            {selectedNodeToEdit 
              ? 'Mettez à jour les détails de ce moment clé.' 
              : 'Rédigez vos observations ou projetez un objectif.'}
          </p>
        </div>
        {selectedNodeToEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-all"
          >
            Annuler la modification
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Titre de l'élément <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
              <FileText className="w-4 h-4" />
            </span>
            <input
              id="title"
              type="text"
              required
              placeholder="Ex: Lancement de la version d'essai, Marathon, etc."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden transition-all text-gray-800"
            />
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label htmlFor="description" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Description rapide (Sous-titre)
          </label>
          <input
            id="description"
            type="text"
            placeholder="Ex: Campagne d'acquisition ciblée, Course complétée en 1h45..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden transition-all text-gray-800"
          />
        </div>

        {/* Grid: Date and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Date Picker */}
          <div>
            <label htmlFor="date" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Calendar className="w-4 h-4" />
              </span>
              <input
                id="date"
                type="date"
                required
                min="2024-07-01"
                max="2029-06-30"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden transition-all text-gray-800"
              />
            </div>
            
            {/* Dynamic visual indicator for Past / Future */}
            <div className="mt-2.5 flex items-center gap-1.5">
              {isPastDate ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100 animate-pulse-slow">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Période : <strong>Le Passé (Hier et avant)</strong>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 animate-pulse-slow">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Période : <strong>Le Futur (Demain et après)</strong>
                </span>
              )}
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Thématique (Catégorie)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Tag className="w-4 h-4" />
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden transition-all text-gray-800 appearance-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'Professional' && '💼 Professionnel'}
                    {cat === 'Personal' && '🎨 Personnel / Vie'}
                    {cat === 'Financial' && '📈 Finances / Investissement'}
                    {cat === 'Health' && '❤️ Santé & Sport'}
                    {cat === 'Growth' && '🌱 Développement & Sagesse'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Element Type Selection (Buttons) */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Nature de l'Élément
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TYPES.map((t) => {
              const active = type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    active
                      ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100/70 hover:border-gray-300'
                  }`}
                >
                  <span className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    {active ? (
                      <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                    )}
                    {t.label}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-1 leading-normal">
                    {t.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Observations / Notes Textarea */}
        <div>
          <label htmlFor="notes" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Observations, Notes ou Plan d'action <span className="text-red-500">*</span>
          </label>
          <textarea
            id="notes"
            required
            rows={4}
            placeholder={
              isPastDate
                ? "Quelles sont les observations, leçons tirées et réussites clés de ce moment ? (ex: observations quotidiennes, feedbacks, etc.)"
                : "Quel est le plan de route, les livrables visés, et la vision de projection pour cette étape du futur ?"
            }
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden transition-all text-gray-800 resize-none font-sans leading-relaxed"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-gray-300" />
            Les éléments du passé sont automatiquement marqués comme "réalisés".
          </div>
          
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md shadow-orange-100 transition-all active:scale-[0.98] cursor-pointer"
          >
            {selectedNodeToEdit ? (
              <>
                <Check className="w-4 h-4" />
                Mettre à jour l'élément
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Enregistrer l'élément
              </>
            )}
          </button>
        </div>
      </form>

      {/* Success Toast / Notification */}
      {showSuccessToast && (
        <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 animate-fade-in">
          <div className="p-1 bg-emerald-500 text-white rounded-full">
            <Check className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-800">Élément enregistré avec succès !</div>
            <div className="text-[10px] text-emerald-600 font-medium">Il est maintenant ancré et visible sur la ligne temporelle.</div>
          </div>
        </div>
      )}
    </div>
  );
};
