import React, { useState, useEffect } from 'react';
import { X, User, UserPlus, CheckCircle2, Shield, Calendar, MapPin, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Player, Gender, PlayerStatus } from '../../types';
import { calculateAge } from '../../utils/formatters';

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerToEdit?: Player | null;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  isOpen,
  onClose,
  playerToEdit,
}) => {
  const { teams, parents, addPlayer, updatePlayer, addParent } = useApp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('2014-06-15');
  const [gender, setGender] = useState<Gender>('Masculin');
  const [address, setAddress] = useState('Casablanca, Maroc');
  const [phone, setPhone] = useState('');
  const [registrationDate, setRegistrationDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [teamId, setTeamId] = useState('');
  const [status, setStatus] = useState<PlayerStatus>('Actif');
  const [parentId, setParentId] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState<number | ''>('');
  const [position, setPosition] = useState('Milieu');
  const [notes, setNotes] = useState('');

  // Mode création rapide de parent inline si aucun parent sélectionné
  const [showQuickNewParent, setShowQuickNewParent] = useState(false);
  const [newParentFirstName, setNewParentFirstName] = useState('');
  const [newParentLastName, setNewParentLastName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('+212 6 ');
  const [newParentRelation, setNewParentRelation] = useState<'Père' | 'Mère' | 'Tuteur légal'>('Père');

  useEffect(() => {
    if (playerToEdit) {
      setFirstName(playerToEdit.firstName);
      setLastName(playerToEdit.lastName);
      setBirthDate(playerToEdit.birthDate);
      setGender(playerToEdit.gender);
      setAddress(playerToEdit.address);
      setPhone(playerToEdit.phone || '');
      setRegistrationDate(playerToEdit.registrationDate);
      setTeamId(playerToEdit.teamId);
      setStatus(playerToEdit.status);
      setParentId(playerToEdit.parentId);
      setJerseyNumber(playerToEdit.jerseyNumber || '');
      setPosition(playerToEdit.position || '');
      setNotes(playerToEdit.notes || '');
    } else {
      setFirstName('');
      setLastName('');
      setBirthDate('2014-05-10');
      setGender('Masculin');
      setAddress('Casablanca, Maroc');
      setPhone('');
      setRegistrationDate(new Date().toISOString().split('T')[0]);
      setTeamId(teams[0]?.id || '');
      setStatus('Actif');
      setParentId(parents[0]?.id || '');
      setJerseyNumber('');
      setPosition('Milieu');
      setNotes('');
    }
    setShowQuickNewParent(false);
  }, [playerToEdit, isOpen, teams, parents]);

  if (!isOpen) return null;

  const calculatedAge = calculateAge(birthDate);

  const handleCreateParentInline = () => {
    if (!newParentFirstName || !newParentLastName || !newParentPhone) return;
    const created = addParent({
      firstName: newParentFirstName,
      lastName: newParentLastName,
      phone: newParentPhone,
      whatsapp: newParentPhone.replace(/[^0-9]/g, ''),
      address: address,
      relation: newParentRelation,
    });
    setParentId(created.id);
    setShowQuickNewParent(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !birthDate || !parentId || !teamId) return;

    if (playerToEdit) {
      updatePlayer(playerToEdit.id, {
        firstName,
        lastName,
        birthDate,
        gender,
        address,
        phone,
        registrationDate,
        teamId,
        status,
        parentId,
        jerseyNumber: jerseyNumber === '' ? undefined : Number(jerseyNumber),
        position,
        notes,
      });
    } else {
      addPlayer({
        firstName,
        lastName,
        birthDate,
        gender,
        address,
        phone,
        registrationDate,
        teamId,
        status,
        parentId,
        jerseyNumber: jerseyNumber === '' ? undefined : Number(jerseyNumber),
        position,
        notes,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold tracking-tight">
              {playerToEdit ? 'Modifier la fiche joueur' : 'Inscrire un nouveau joueur'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[82vh] overflow-y-auto">
          {/* Identité */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Prénom du joueur <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="ex: Youssef"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nom de famille <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="ex: Amrani"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Date de naissance, Sexe & Âge automatique */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date de naissance <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Âge calculé
              </label>
              <div className="px-3 py-2 rounded-lg bg-slate-100 font-mono font-bold text-slate-700 text-center">
                {calculatedAge} ans
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sexe <span className="text-rose-500">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900"
              >
                <option value="Masculin">Masculin</option>
                <option value="Féminin">Féminin</option>
              </select>
            </div>
          </div>

          {/* Équipe & Statut */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Équipe / Catégorie <span className="text-rose-500">*</span>
              </label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 font-medium"
              >
                <option value="">-- Sélectionner une équipe --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.category} - {t.monthlyFee} DH)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Statut du joueur
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PlayerStatus)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900"
              >
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
                <option value="Suspendu">Suspendu</option>
                <option value="Ancien">Ancien joueur</option>
              </select>
            </div>
          </div>

          {/* Parent / Tuteur Légal */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-800">
                Parent ou Tuteur Légal <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowQuickNewParent(!showQuickNewParent)}
                className="text-[11px] font-semibold text-emerald-700 hover:underline"
              >
                {showQuickNewParent ? 'Sélectionner parent existant' : '+ Créer un nouveau parent'}
              </button>
            </div>

            {!showQuickNewParent ? (
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white"
              >
                <option value="">-- Choisir le parent --</option>
                {parents
                  .filter((p) => !p.isDeleted)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.relation} - {p.phone})
                    </option>
                  ))}
              </select>
            ) : (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newParentFirstName}
                    onChange={(e) => setNewParentFirstName(e.target.value)}
                    placeholder="Prénom parent"
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                  />
                  <input
                    type="text"
                    value={newParentLastName}
                    onChange={(e) => setNewParentLastName(e.target.value)}
                    placeholder="Nom parent"
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newParentPhone}
                    onChange={(e) => setNewParentPhone(e.target.value)}
                    placeholder="Téléphone / WhatsApp"
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono"
                  />
                  <select
                    value={newParentRelation}
                    onChange={(e) => setNewParentRelation(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                  >
                    <option value="Père">Père</option>
                    <option value="Mère">Mère</option>
                    <option value="Tuteur légal">Tuteur légal</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleCreateParentInline}
                  disabled={!newParentFirstName || !newParentLastName || !newParentPhone}
                  className="w-full py-1.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  Valider et associer ce parent
                </button>
              </div>
            )}
          </div>

          {/* Numéro de maillot, Poste & Coordonnées */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                N° de maillot
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="ex: 10"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 font-mono text-slate-900"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Poste sur le terrain
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="ex: Attaquant, Milieu, Gardien..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Adresse de résidence
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="ex: Maarif, Casablanca"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Observations / Notes de l'entraîneur
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Profil technique, certificat médical, besoins..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 text-slate-900"
            />
          </div>

          {/* Actions */}
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
              disabled={!firstName || !lastName || !parentId || !teamId}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{playerToEdit ? 'Enregistrer modifications' : 'Confirmer l\'inscription'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
