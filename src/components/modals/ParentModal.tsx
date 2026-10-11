import React, { useState, useEffect } from 'react';
import { X, UserCheck, CheckCircle2, Phone, MessageSquare, Mail, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Parent, ParentRelation } from '../../types';

interface ParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentToEdit?: Parent | null;
}

export const ParentModal: React.FC<ParentModalProps> = ({
  isOpen,
  onClose,
  parentToEdit,
}) => {
  const { addParent, updateParent } = useApp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+212 6 ');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('Casablanca, Maroc');
  const [relation, setRelation] = useState<ParentRelation>('Père');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (parentToEdit) {
      setFirstName(parentToEdit.firstName);
      setLastName(parentToEdit.lastName);
      setPhone(parentToEdit.phone);
      setWhatsapp(parentToEdit.whatsapp || '');
      setEmail(parentToEdit.email || '');
      setAddress(parentToEdit.address);
      setRelation(parentToEdit.relation);
      setNotes(parentToEdit.notes || '');
    } else {
      setFirstName('');
      setLastName('');
      setPhone('+212 6 ');
      setWhatsapp('');
      setEmail('');
      setAddress('Casablanca, Maroc');
      setRelation('Père');
      setNotes('');
    }
  }, [parentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone) return;

    const formattedWhatsapp = whatsapp ? whatsapp : phone.replace(/[^0-9]/g, '');

    if (parentToEdit) {
      updateParent(parentToEdit.id, {
        firstName,
        lastName,
        phone,
        whatsapp: formattedWhatsapp,
        email,
        address,
        relation,
        notes,
      });
    } else {
      addParent({
        firstName,
        lastName,
        phone,
        whatsapp: formattedWhatsapp,
        email,
        address,
        relation,
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
            <UserCheck className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold tracking-tight">
              {parentToEdit ? 'Modifier la fiche parent' : 'Nouveau parent / Tuteur'}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Prénom <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="ex: Mohamed"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nom <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="ex: Amrani"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 text-slate-900 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Lien de parenté <span className="text-rose-500">*</span>
              </label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value as ParentRelation)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 text-slate-900"
              >
                <option value="Père">Père</option>
                <option value="Mère">Mère</option>
                <option value="Tuteur légal">Tuteur légal</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Téléphone principal <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+212 6 XX XX XX XX"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Numéro WhatsApp (optionnel)
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Laisser vide si identique au tel"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Adresse Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m.amrani@exemple.ma"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Adresse du domicile
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="ex: Maarif, Casablanca"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Remarques & Disponibilité
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Disponibilité pour transports de matchs, profession..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 text-slate-900"
            />
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
              disabled={!firstName || !lastName || !phone}
              className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{parentToEdit ? 'Enregistrer' : 'Créer fiche parent'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
