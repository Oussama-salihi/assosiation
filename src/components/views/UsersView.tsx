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
import { useLanguage } from '../../context/LanguageContext';
import { UserRole, User as UserType } from '../../types';

export const UsersView: React.FC = () => {
  const { users, addUser, updateUser } = useApp();
  const { currentUser } = useAuth();
  const { t, language, isRTL } = useLanguage();

  const [showAddModal, setShowAddModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserType | null>(null);

  // Form states for new user
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [phone, setPhone] = useState('+212 6 ');

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case 'SUPER_ADMIN':
        return t('users.roleSuperAdmin', 'Super Admin');
      case 'ADMIN':
        return t('users.roleAdmin', 'Administrateur');
      case 'COMPTABLE':
        return t('users.roleAccountant', 'Comptable');
      case 'ENTRAINEUR':
        return t('users.roleCoach', 'Entraîneur');
      case 'STAFF':
        return t('users.roleStaff', 'Staff');
      default:
        return r;
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    addUser({
      name,
      email,
      role,
      phone: phone.trim() || undefined,
      active: true,
    });

    setShowAddModal(false);
    setName('');
    setEmail('');
    setRole('ADMIN');
    setPhone('+212 6 ');
  };

  const handleUpdateRole = (newRole: UserRole) => {
    if (!userToEdit) return;
    if (userToEdit.id === currentUser?.id) {
      setUserToEdit(null);
      return;
    }
    if (userToEdit.role === 'SUPER_ADMIN' && currentUser?.role !== 'SUPER_ADMIN') {
      setUserToEdit(null);
      return;
    }
    if (newRole === 'SUPER_ADMIN' && currentUser?.role !== 'SUPER_ADMIN') {
      setUserToEdit(null);
      return;
    }
    updateUser(userToEdit.id, { role: newRole });
    setUserToEdit(null);
  };

  const toggleUserStatus = (u: UserType) => {
    if (u.id === currentUser?.id) return;
    if (u.role === 'SUPER_ADMIN' && currentUser?.role !== 'SUPER_ADMIN') return;
    updateUser(u.id, { active: !u.active });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCog className="w-5 h-5 text-emerald-600" />
            <span>{t('users.title', 'Utilisateurs & Droits d’accès')} ({users.length})</span>
          </h2>
          <p className="text-xs text-slate-500">
            {t('users.subtitle', 'Comptes des collaborateurs du club')}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('users.newUser', 'Nouvel utilisateur')}</span>
        </button>
      </div>

      {/* Users List Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wide text-slate-900">
            {language === 'ar' ? 'حسابات طاقم ومسؤولي النادي' : 'Comptes du personnel du club'}
          </h3>
          <span className="text-[11px] text-slate-400">
            {users.filter(u => u.active).length} {language === 'ar' ? 'نشط من أصل' : 'actifs sur'} {users.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-3 px-4">{t('users.colName', 'NOM')}</th>
                <th className="py-3 px-3">{t('users.colEmail', 'EMAIL')}</th>
                <th className="py-3 px-3">{t('users.colPhone', 'TÉLÉPHONE')}</th>
                <th className="py-3 px-3">{t('users.colRole', 'RÔLE ATTRIBUÉ')}</th>
                <th className="py-3 px-3 text-center">{t('users.colStatus', 'STATUT')}</th>
                <th className="py-3 px-4 text-center">{t('common.actions', 'ACTIONS')}</th>
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
                          <span className="ml-2 rtl:ml-0 rtl:mr-2 px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                            {language === 'ar' ? 'أنت' : 'Vous'}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{u.email}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{u.phone || '-'}</td>
                  <td className="py-3 px-3">
                    <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {getRoleLabel(u.role)}
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
                      {u.active ? t('users.statusActive', 'Actif') : t('users.statusInactive', 'Désactivé')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {u.id !== currentUser?.id && !(u.role === 'SUPER_ADMIN' && currentUser?.role !== 'SUPER_ADMIN') && (
                        <button
                          onClick={() => setUserToEdit({ ...u })}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title={t('users.editRole', 'Modifier')}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {u.id !== currentUser?.id && !(u.role === 'SUPER_ADMIN' && currentUser?.role !== 'SUPER_ADMIN') && (
                        <button
                          onClick={() => toggleUserStatus(u)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            u.active
                              ? 'text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={t('users.toggleStatus', 'Basculer statut')}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {u.id === currentUser?.id && (
                        <span className="text-[11px] text-slate-400 font-medium italic">
                          {language === 'ar' ? 'حسابك الحالي' : 'Votre compte'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add User */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {t('users.newUser', 'Nouvel utilisateur')}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('users.colName', 'Nom')} *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="ex: Yassine Bounou"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('users.colEmail', 'Email')} *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="nom@asatlasfoot.ma"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('users.colPhone', 'Téléphone')}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+212 6 XX XX XX XX"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('users.colRole', 'Rôle')} *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none cursor-pointer"
                >
                  {currentUser?.role === 'SUPER_ADMIN' && (
                    <option value="SUPER_ADMIN">{t('users.roleSuperAdmin', 'Super Admin')}</option>
                  )}
                  <option value="ADMIN">{t('users.roleAdmin', 'Administrateur')}</option>
                  <option value="COMPTABLE">{t('users.roleAccountant', 'Comptable')}</option>
                  <option value="ENTRAINEUR">{t('users.roleCoach', 'Entraîneur')}</option>
                  <option value="STAFF">{t('users.roleStaff', 'Staff / Accueil')}</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  {t('common.cancel', 'Annuler')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                >
                  {t('common.save', 'Enregistrer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Role */}
      {userToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {t('users.editRole', 'Modifier le rôle')}
              </h3>
              <button
                onClick={() => setUserToEdit(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="font-bold text-slate-900">{userToEdit.name}</p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('users.colRole', 'Rôle attribué')}
                </label>
                <select
                  defaultValue={userToEdit.role}
                  id="role-edit-select"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none cursor-pointer"
                >
                  {currentUser?.role === 'SUPER_ADMIN' && (
                    <option value="SUPER_ADMIN">{t('users.roleSuperAdmin', 'Super Admin')}</option>
                  )}
                  <option value="ADMIN">{t('users.roleAdmin', 'Administrateur')}</option>
                  <option value="COMPTABLE">{t('users.roleAccountant', 'Comptable')}</option>
                  <option value="ENTRAINEUR">{t('users.roleCoach', 'Entraîneur')}</option>
                  <option value="STAFF">{t('users.roleStaff', 'Staff')}</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUserToEdit(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  {t('common.cancel', 'Annuler')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sel = document.getElementById('role-edit-select') as HTMLSelectElement;
                    if (sel) handleUpdateRole(sel.value as UserRole);
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                >
                  {t('common.save', 'Enregistrer')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
