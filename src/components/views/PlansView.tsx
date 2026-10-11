import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Shield,
  Edit2,
  Save,
  HelpCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MembershipPlan, TeamCategory } from '../../types';
import { formatCurrency } from '../../utils/formatters';

export const PlansView: React.FC = () => {
  const { plans, teams, settings, updateTeam, updatePlan } = useApp();

  const [editingTeamFee, setEditingTeamFee] = useState<{ id: string; fee: number } | null>(null);

  const handleSaveTeamFee = () => {
    if (!editingTeamFee) return;
    updateTeam(editingTeamFee.id, { monthlyFee: editingTeamFee.fee });
    setEditingTeamFee(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-600" />
          <span>Gestion des Cotisations & Grille Tarifaire</span>
        </h2>
        <p className="text-xs text-slate-500">
          Définition des mensualités par catégorie d'âge et formules d'abonnement avec remises associées
        </p>
      </div>

      {/* Grille des Mensualités par Catégorie */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Tarification Mensuelle par Catégorie (DH / Mois)
            </h3>
            <p className="text-xs text-slate-500">
              Chaque équipe applique ce tarif de base pour le calcul automatique des cotisations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => {
            const isEditing = editingTeamFee?.id === team.id;

            return (
              <div
                key={team.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-xs">
                      {team.category}
                    </span>
                    <span className="font-bold text-slate-900">{team.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Coach : {team.coachName}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={editingTeamFee.fee}
                        onChange={(e) =>
                          setEditingTeamFee({ id: team.id, fee: Number(e.target.value) })
                        }
                        className="w-20 px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-xs outline-none"
                      />
                      <button
                        onClick={handleSaveTeamFee}
                        className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div>
                        <span className="font-mono font-black text-emerald-800 text-sm block">
                          {team.monthlyFee} {settings.currency}
                        </span>
                        <span className="text-[10px] text-slate-400">/ mois</span>
                      </div>
                      <button
                        onClick={() => setEditingTeamFee({ id: team.id, fee: team.monthlyFee })}
                        className="p-1 text-slate-400 hover:text-slate-800 rounded"
                        title="Modifier tarif"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Formules de Cotisation & Échéanciers */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Formules d'Abonnement & Remises Conventionnées
          </h3>
          <p className="text-xs text-slate-500">
            Périodicités acceptées pour les règlements des adhésions
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{plan.frequency}</span>
                  {plan.defaultDiscountPercent ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      -{plan.defaultDiscountPercent}%
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                      Tarif plein
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-600 font-medium mt-2">
                  {plan.name}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {plan.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                <span>Durée engagement :</span>
                <strong className="font-mono text-slate-900">{plan.monthsCount} mois</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Règle métier explicative */}
      <div className="p-4 rounded-xl bg-slate-100/80 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900 block mb-0.5">
            Règle de Calcul Automatique du Solde :
          </span>
          <p className="text-slate-600">
            Le système calcule en temps réel : <strong>Montant prévu (adhésion) - Montant total encaissé = Montant restant dû</strong>. 
            Aucun paiement n'écrase un ancien règlement ; chaque versement génère une transaction unique et réajuste immédiatement le solde du joueur et de la famille.
          </p>
        </div>
      </div>
    </div>
  );
};
