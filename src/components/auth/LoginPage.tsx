import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, KeyRound, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

export const LoginPage: React.FC = () => {
  const { login, resetPassword } = useAuth();
  const { settings } = useApp();
  const { t, language, setLanguage, isRTL } = useLanguage();

  const [email, setEmail] = useState('direction@asatlasfoot.ma');
  const [password, setPassword] = useState('Atlas2026!');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotMessage, setForgotMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isForgotLoading, setIsForgotLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (!result.success) {
      setError(
        result.error ||
          (language === 'ar' ? 'البيانات المدخلة غير صحيحة.' : 'Identifiants incorrects.')
      );
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsForgotLoading(true);
    setForgotMessage(null);

    const res = await resetPassword(forgotEmail);
    setIsForgotLoading(false);
    if (res.success) {
      setForgotMessage({
        type: 'success',
        text:
          language === 'ar'
            ? 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.'
            : res.message,
      });
    } else {
      setForgotMessage({
        type: 'error',
        text:
          language === 'ar'
            ? 'تعذر إرسال الرابط. تأكد من صحة البريد الإلكتروني.'
            : res.message,
      });
    }
  };

  const fillQuickCredentials = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('Atlas2026!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 selection:bg-emerald-600 selection:text-white relative">
      {/* Top Language Switcher */}
      <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10 flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
        <button
          onClick={() => setLanguage('fr')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            language === 'fr'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>🇫🇷</span>
          <span>Français</span>
        </button>
        <button
          onClick={() => setLanguage('ar')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            language === 'ar'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>🇲🇦</span>
          <span>العربية</span>
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white border border-slate-200/80 p-2 shadow-sm flex items-center justify-center">
            <img
              src={settings.logoUrl}
              alt={settings.name}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('auth.loginTitle', settings.shortName)}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {t('auth.loginSubtitle', "Gestion de l'association")}
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                {t('auth.emailLabel', 'Email')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="nom@asatlasfoot.ma"
                  className={`w-full ${
                    isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
                  } py-2.5 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 text-sm outline-none`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-700">
                  {t('auth.passwordLabel', 'Mot de passe')}
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={`w-full ${
                    isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
                  } py-2.5 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 text-sm outline-none`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors mt-2 cursor-pointer"
            >
              <span>
                {isLoading
                  ? t('auth.loggingIn', 'Connexion en cours...')
                  : t('auth.loginButton', 'Se connecter')}
              </span>
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotMessage(null);
                  setShowForgotModal(true);
                }}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium cursor-pointer"
              >
                {t('auth.forgotPassword', 'Mot de passe oublié ?')}
              </button>
            </div>
          </form>

          {/* Discreet Credentials Helper (Collapsible) */}
          <details className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            <summary className="cursor-pointer font-medium hover:text-slate-800 text-center select-none">
              {t('auth.testAccounts', "Comptes d'accès préconfigurés")}
            </summary>
            <div className="mt-2.5 space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">
                  {t('auth.superAdmin', 'Direction (Super Admin)')}
                </span>
                <button
                  type="button"
                  onClick={() => fillQuickCredentials('direction@asatlasfoot.ma')}
                  className="text-emerald-700 hover:underline font-mono text-[10px] cursor-pointer"
                >
                  direction@asatlasfoot.ma
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">
                  {t('auth.accountant', 'Comptabilité')}
                </span>
                <button
                  type="button"
                  onClick={() => fillQuickCredentials('compta@asatlasfoot.ma')}
                  className="text-emerald-700 hover:underline font-mono text-[10px] cursor-pointer"
                >
                  compta@asatlasfoot.ma
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">
                  {t('auth.coach', 'Coach Rachid')}
                </span>
                <button
                  type="button"
                  onClick={() => fillQuickCredentials('rachid.coach@asatlasfoot.ma')}
                  className="text-emerald-700 hover:underline font-mono text-[10px] cursor-pointer"
                >
                  rachid.coach@asatlasfoot.ma
                </button>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 text-center">
                {language === 'ar' ? 'كلمة المرور:' : 'Mot de passe :'}{' '}
                <code className="font-mono font-bold text-slate-600">Atlas2026!</code>
              </div>
            </div>
          </details>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          {settings.name} · Casablanca, Maroc
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">
                {t('auth.forgotTitle', 'Mot de passe oublié')}
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              {language === 'ar'
                ? 'أدخل عنوان بريدك الإلكتروني لتلقي رابط إعادة تعيين كلمة المرور.'
                : 'Saisissez votre adresse email pour recevoir un lien de réinitialisation sécurisé.'}
            </p>

            {forgotMessage && (
              <div
                className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                  forgotMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {forgotMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{forgotMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('auth.emailLabel', 'Email du compte')}
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  placeholder="nom@asatlasfoot.ma"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold cursor-pointer"
                >
                  {t('common.close', 'Fermer')}
                </button>
                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                >
                  {isForgotLoading
                    ? t('common.loading', 'Envoi...')
                    : t('auth.sendResetLink', 'Envoyer le lien')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
