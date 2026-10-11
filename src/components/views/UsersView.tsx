import React, { useState } from 'react';
import {
  UserCog,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Lock,
  User,
  Mail,
  Phone,
  Shield,
  Edit2,
  Check,
  X,
  Power,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole, User as UserType } from '../../types';
import { formatDate } from '../../utils/formatters';

export const UsersView: React.FC = () => {
  const { users, addUser, updateUser } = useApp();
  const { currentUser } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserType | null>(null);

  // Form states for new user
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [phone, setPhone] = useState('+212 6 ');

  const rolesMatrix: Record<
    UserRole,
    { label: string; description: string; permissions: string[] }
  > = {
    SUPER_ADMIN: {
      label: 'Super Admin',
      description: 'Accès complet absolu à l\'ensemble du logiciel, finances, audit et paramètres.',
      permissions: [
        'Tableau de bord complet',
        'Gestion totale des joueurs & parents',
        'Gestion équipes & plannings',
        'Finances, paiements & impayés',
        'Émission et signature reçus',
        'Gestion des utilisateurs & rôles',
        'Consultation du journal d\'audit',
        'Configuration paramètres club',
      ],
    },
    ADMIN: {
      label: 'Administrateur',
      description: 'Gestion opérationnelle complète du club au quotidien.',
      permissions: [
        'Joueurs & fiches complètes',
        'Parents & tuteurs',
        'Équipes & plannings',
        'Inscriptions de saison',
        'Enregistrement des paiements',
        'Présences & séances',
        'Rapports d\'activité',
      ],
    },
    COMPTABLE: {
      label: 'Comptable',
      description: 'Spécialisé dans les encaissements, suivi des impayés et reçus officiels.',
      permissions: [
        'Paiements & transactions',
        'Suivi et relances des impayés',
        'Émission des reçus officiels',
        'Rapports financiers & export Excel',
        'Consultation des fiches joueurs',
      ],
    },
    ENTRAINEUR: {
      label: 'Entraîneur',
      description: 'Accès technique aux équipes assignées et gestion du terrain.',
      permissions: [
        'Ses équipes & effectifs',
        'Consultation fiches sportives',
        'Programmation des séances',
        'Appel et pointage des présences',
        'Suivi de l\'assiduité en direct',
      ],
    },
    STAFF: {
      label: 'Staff & Accueil',
      description: 'Secrétariat, accueil des parents et consultations de base.',
      permissions: [
        'Consultation joueurs & parents',
        'Inscriptions des nouveaux adhérents',
        'Orientation & contacts familles',
      ],
    },
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    addUser({
      name,
      email,
      role,
      phone,
      active: true,
      password: 'Atlas2026!',
    });

    setName('');
    setEmail('');
    setPhone('+212 6 ');
    setShowAddModal(false);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;

    updateUser(userToEdit.id, {
      name: userToEdit.name,
      email: userToEdit.email,
      role: userToEdit.role,
      phone: userToEdit.phone,
      active: userToEdit.active,
    });

    setUserToEdit(null);
  };

  const toggleUserStatus = (u: UserType) => {
    if (u.id === currentUser?.id) {
      alert("Vous ne pouvez pas désactiver votre propre compte administrateur.");
      return;
    }
    updateUser(u.id, { active: !u.active });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCog className="w-5 h-5 text-emerald-600" />
            <span>Utilisateurs & Gestion des Droits ({users.length})</span>
          </h2>
          <p className="text-xs text-slate-500">
            Gestion des comptes administratifs, assignation des rôles et contrôle d'accès
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel utilisateur</span>
        </button>
      </div>

      {/* Users List Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wide text-slate-900">
            Comptes du personnel du club
          </h3>
          <span className="text-[11px] text-slate-400">
            {users.filter(u => u.active).length} actifs sur {users.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-3 px-4">NOM</th>
                <th className="py-3 px-3">EMAIL</th>
                <th className="py-3 px-3">TÉLÉPHONE</th>
                <th className="py-3 px-3">RÔLE ATTRIBUÉ</th>
                <th className="py-3 px-3 text-center">STATUT</th>
                <th className="py-3 px-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                        {u.name[0]}
                      </div>
                      <div>
                        <span>{u.name}</span>
                        {u.id === currentUser?.id && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                            Vous
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{u.email}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{u.phone || '-'}</td>
                  <td className="py-3 px-3">
                    <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {rolesMatrix[u.role]?.label || u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {u.active ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setUserToEdit({ ...u })}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        title="Modifier l'utilisateur"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => toggleUserStatus(u)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.active
                              ? 'text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={u.active ? 'Désactiver le compte' : 'Activer le compte'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Matrice des Rôles & Permissions */}
      <div className="space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900">
            Matrice des Rôles & Droits d'Accès
          </h3>
          <p className="text-xs text-slate-500">
            Définition des prérogatives selon la fonction au sein du club
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(rolesMatrix) as UserRole[]).map((rKey) => {
            const rData = rolesMatrix[rKey];
            return (
              <div
                key={rKey}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{rData.label}</span>
                    <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {rKey}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {rData.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Droits autorisés :
                    </span>
                    {rData.permissions.map((perm, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{perm}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Ajout Utilisateur */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Créer un compte utilisateur</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nom et Prénom <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="ex: Tarik Sektioui"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email de connexion <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tarik@asatlasfoot.ma"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rôle attribué <span className="text-rose-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                >
                  <option value="SUPER_ADMIN">SUPER ADMIN</option>
                  <option value="ADMIN">ADMINISTRATEUR</option>
                  <option value="COMPTABLE">COMPTABLE</option>
                  <option value="ENTRAINEUR">ENTRAÎNEUR</option>
                  <option value="STAFF">STAFF</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+212 6 XX XX XX XX"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
                >
                  Créer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edition Utilisateur */}
      {userToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Modifier l'utilisateur</h3>
              <button
                onClick={() => setUserToEdit(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nom et Prénom
                </label>
                <input
                  type="text"
                  value={userToEdit.name}
                  onChange={(e) => setUserToEdit({ ...userToEdit, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={userToEdit.email}
                  onChange={(e) => setUserToEdit({ ...userToEdit, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rôle
                </label>
                <select
                  value={userToEdit.role}
                  onChange={(e) => setUserToEdit({ ...userToEdit, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                >
                  <option value="SUPER_ADMIN">SUPER ADMIN</option>
                  <option value="ADMIN">ADMINISTRATEUR</option>
                  <option value="COMPTABLE">COMPTABLE</option>
                  <option value="ENTRAINEUR">ENTRAÎNEUR</option>
                  <option value="STAFF">STAFF</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="text"
                  value={userToEdit.phone || ''}
                  onChange={(e) => setUserToEdit({ ...userToEdit, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheckbox"
                  checked={userToEdit.active}
                  onChange={(e) => setUserToEdit({ ...userToEdit, active: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="activeCheckbox" className="font-semibold text-slate-700">
                  Compte actif
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setUserToEdit(null)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
