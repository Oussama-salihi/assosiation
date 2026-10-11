import React, { useState, useEffect } from 'react';
import { X, Shield, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Team, TeamCategory } from '../../types';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamToEdit?: Team | null;
}

export const TeamModal: React.FC<TeamModalProps> = ({
  isOpen,
  onClose,
  teamToEdit,
}) => {
  const { addTeam, updateTeam, settings } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<TeamCategory>('U11');
  const [coachName, setCoachName] = useState('');
  const [coachPhone, setCoachPhone] = useState('+212 6 ');
  const [trainingLocation, setTrainingLocation] = useState('Terrain Synthétique Principal');
  const [trainingDays, setTrainingDays] = useState<string[]>(['Mercredi', 'Samedi']);
  const [trainingTime, setTrainingTime] = useState('17:00 - 18:30');
  const [monthlyFee, setMonthlyFee] = useState<number | ''>(300);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [notes, setNotes] = useState('');

  const daysOptions = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  useEffect(() => {
    if (teamToEdit) {
      setName(teamToEdit.name);
      setCategory(teamToEdit.category);
      setCoachName(teamToEdit.coachName);
      setCoachPhone(teamToEdit.coachPhone || '+212 6 ');
      setTrainingLocation(teamToEdit.trainingLocation);
      setTrainingDays(teamToEdit.trainingDays);
      setTrainingTime(teamToEdit.trainingTime);
      setMonthlyFee(teamToEdit.monthlyFee);
      setStatus(teamToEdit.status);
      setNotes(teamToEdit.notes || '');
    } else {
      setName('Benjamins U11');
      setCategory('U11');
      setCoachName('Coach Hicham');
      setCoachPhone('+212 6 ');
      setTrainingLocation('Terrain Synthétique');
      setTrainingDays(['Mardi', 'Jeudi']);
      setTrainingTime('17:00 - 18:30');
      setMonthlyFee(300);
      setStatus('Active');
      setNotes('');
    }
  }, [teamToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (day: string) => {
    if (trainingDays.includes(day)) {
      setTrainingDays(trainingDays.filter((d) => d !== day));
    } else {
      setTrainingDays([...trainingDays, day]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !coachName || !monthlyFee) return;

    if (teamToEdit) {
      updateTeam(teamToEdit.id, {
        name,
        category,
        coachName,
        coachPhone,
        trainingLocation,
        trainingDays,
        trainingTime,
        monthlyFee: Number(monthlyFee),
        status,
        notes,
      });
    } else {
      addTeam({
        name,
        category,
        coachName,
        coachPhone,
        trainingLocation,
        trainingDays,
        trainingTime,
        monthlyFee: Number(monthlyFee),
        status,
        notes,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold tracking-tight">
              {teamToEdit ? 'Modifier l\'équipe' : 'Créer une nouvelle équipe'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Nom de l'équipe <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="ex: U11 - Panthères"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Catégorie <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TeamCategory)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 text-slate-900 font-bold"
              >
                <option value="U7">U7</option>
                <option value="U9">U9</option>
                <option value="U11">U11</option>
                <option value="U13">U13</option>
                <option value="U15">U15</option>
                <option value="U17">U17</option>
                <option value="U19">U19</option>
                <option value="Senior">Senior</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Entraîneur responsable <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={coachName}
                onChange={(e) => setCoachName(e.target.value)}
                required
                placeholder="ex: Coach Hicham"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Téléphone entraîneur
              </label>
              <input
                type="text"
                value={coachPhone}
                onChange={(e) => setCoachPhone(e.target.value)}
                placeholder="+212 6 XX XX XX XX"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 font-mono text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Lieu d'entraînement <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={trainingLocation}
                onChange={(e) => setTrainingLocation(e.target.value)}
                required
                placeholder="ex: Grand Terrain A"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Horaires de séance
              </label>
              <input
                type="text"
                value={trainingTime}
                onChange={(e) => setTrainingTime(e.target.value)}
                placeholder="ex: 17:30 - 19:00"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Jours d'entraînement
            </label>
            <div className="flex flex-wrap gap-1.5">
              {daysOptions.map((day) => {
                const isSelected = trainingDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cotisation mensuelle ({settings.currency}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value === '' ? '' : Number(e.target.value))}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Statut
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 text-slate-900"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!name || !coachName || !monthlyFee}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{teamToEdit ? 'Enregistrer' : 'Créer l\'équipe'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
