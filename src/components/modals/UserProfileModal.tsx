import React from 'react';
import { X, User as UserIcon, Mail, Phone, Shield, CheckCircle2 } from 'lucide-react';
import { User, UserRole } from '../../types';

interface UserProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !user) return null;

  const roleDescriptions: Record<UserRole, string> = {
    SUPER_ADMIN: 'Accès complet absolu à l\'ensemble de l\'application et administration.',
    ADMIN: 'Gestion opérationnelle complète du club (joueurs, équipes, paiements, présences).',
    COMPTABLE: 'Accès aux modules financiers, impayés, encaissements et reçus.',
    ENTRAINEUR: 'Gestion technique des équipes assignées, séances et feuilles de présence.',
    STAFF: 'Consultation des joueurs, parents et inscriptions des nouveaux adhérents.',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold tracking-tight">Mon Profil Utilisateur</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-lg shrink-0 border border-emerald-200">
              {user.name.charAt(0)}
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">{user.name}</h4>
              <p className="text-slate-500 text-xs">{user.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                {user.role}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                Description du rôle
              </span>
              <p className="text-slate-700 font-medium">
                {roleDescriptions[user.role] || user.role}
              </p>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                Téléphone
              </span>
              <p className="font-mono text-slate-800">{user.phone || 'Non renseigné'}</p>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                Statut du compte
              </span>
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Compte actif et vérifié</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
