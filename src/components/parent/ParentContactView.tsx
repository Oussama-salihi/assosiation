import React, { useState } from 'react';
import {
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  Building,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Player, ParentMessage } from '../../types';
import { formatDate } from '../../utils/formatters';

interface ParentContactViewProps {
  parentId: string;
  parentName: string;
  parentEmail?: string;
  parentPhone?: string;
  linkedPlayers: Player[];
}

export const ParentContactView: React.FC<ParentContactViewProps> = ({
  parentId,
  parentName,
  parentEmail,
  parentPhone,
  linkedPlayers,
}) => {
  const { settings, sendParentMessage, getParentMessages } = useApp();
  const { t, language, isRTL } = useLanguage();

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const pastMessages = getParentMessages(parentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    const res = sendParentMessage({
      parentId,
      parentName,
      parentEmail,
      parentPhone,
      playerId: selectedPlayerId || undefined,
      subject,
      message,
    });

    setIsSubmitting(false);

    if (res.success) {
      setSubject('');
      setMessage('');
      setSelectedPlayerId('');
      setFeedback({
        type: 'success',
        text:
          language === 'ar'
            ? 'تم إرسال رسالتكم بنجاح إلى كتابة النادي. سنوافيكم بالرد في أقرب وقت.'
            : 'Votre message a été transmis avec succès au secrétariat. Nous vous répondrons dans les plus brefs délais.',
      });
    } else {
      setFeedback({
        type: 'error',
        text: res.error || 'Erreur lors de l’envoi du message.',
      });
    }
  };

  const whatsappClean = (settings.whatsapp || settings.phone || '').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${whatsappClean}?text=${encodeURIComponent(
    `Bonjour, je suis ${parentName}, parent d’adhérent à l’AS Atlas Foot.`
  )}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {t('parentPortal.contact', 'Contacter l’association')}
        </h1>
        <p className="text-xs text-slate-500">
          {language === 'ar'
            ? 'تواصل مباشر مع إدارة النادي، أوقات الاستقبال وسجل المراسلات'
            : 'Canaux officiels d’échange avec le secrétariat et la direction du club'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Official Contact Coordinates (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-5 text-xs">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{settings.name}</h3>
                <p className="text-[11px] text-slate-500">{settings.shortName}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800 block mb-0.5">
                    {language === 'ar' ? 'العنوان والمقر' : 'Siège & Terrains'}
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    {settings.address}, {settings.city}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800 block mb-0.5">
                    {language === 'ar' ? 'الهاتف الرسمي' : 'Téléphone fixe'}
                  </span>
                  <a
                    href={`tel:${settings.phone}`}
                    className="text-slate-600 hover:text-emerald-700 font-mono"
                  >
                    {settings.phone}
                  </a>
                </div>
              </div>

              {settings.whatsapp && (
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800 block mb-0.5">
                      {language === 'ar' ? 'واتساب النادي' : 'WhatsApp officiel'}
                    </span>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 mt-0.5"
                    >
                      <span>{settings.whatsapp}</span>
                      <span>💬</span>
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800 block mb-0.5">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email de contact'}
                  </span>
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-slate-600 hover:text-emerald-700"
                  >
                    {settings.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Office hours and response SLA */}
            <div className="pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ar' ? 'أوقات عمل كتابة النادي' : 'Horaires de permanence'}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {language === 'ar'
                  ? 'من الثلاثاء إلى السبت، من 16:00 إلى 20:00 (المقر الإداري بمركب الأمل).'
                  : 'Du Mardi au Samedi, de 16h00 à 20h00 au bureau du complexe.'}
              </p>
              <p className="text-[10px] text-emerald-700 font-semibold pt-1">
                ⏱ {language === 'ar' ? 'متوسط الرد على الرسائل: أقل من 24 ساعة' : 'Délai moyen de réponse : sous 24h ouvrées'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form & History (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interactive Form */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-8">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
              {language === 'ar' ? 'إرسال رسالة إلى إدارة الجمعية' : 'Envoyer un message à l’administration'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              {language === 'ar'
                ? 'استفسارات حول التداريب، التجهيزات الرياضية أو الوثائق الإدارية'
                : 'Questions concernant les plannings, équipements sportifs ou attestations d’inscription'}
            </p>

            {feedback && (
              <div
                className={`p-4 rounded-2xl mb-6 text-xs flex items-start gap-2.5 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Optional child concerned */}
              {linkedPlayers.length > 0 && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    {language === 'ar' ? 'الابن المعني بالرسالة (اختياري)' : 'Enfant concerné (facultatif)'}
                  </label>
                  <select
                    value={selectedPlayerId}
                    onChange={(e) => setSelectedPlayerId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 text-xs outline-none bg-white"
                  >
                    <option value="">
                      {language === 'ar' ? 'طلب عام بخصوص العائلة' : 'Demande générale pour la famille'}
                    </option>
                    {linkedPlayers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Subject */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  {language === 'ar' ? 'موضوع الرسالة' : 'Objet du message'} *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder={
                    language === 'ar'
                      ? 'مثال: طلب شهادة تسجيل، استفسار حول بذلة النادي...'
                      : 'Ex: Demande d’attestation de licence, commande d’équipement...'
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 text-xs outline-none"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  {language === 'ar' ? 'نص الرسالة' : 'Votre message'} *
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder={
                    language === 'ar'
                      ? 'اكتب تفاصيل طلبك هنا...'
                      : 'Précisez votre demande ici...'
                  }
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 text-xs outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Send className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                  <span>{isSubmitting ? (language === 'ar' ? 'جارٍ الإرسال...' : 'Envoi en cours...') : (language === 'ar' ? 'إرسال الرسالة' : 'Envoyer mon message')}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Messages History */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
              <span>{t('parentPortal.messagesHistory', 'Historique de vos échanges')}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                {pastMessages.length}
              </span>
            </h3>

            {pastMessages.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                {language === 'ar' ? 'لم تقم بإرسال أي رسائل حتى الآن.' : 'Aucun message envoyé.'}
              </p>
            ) : (
              <div className="space-y-3 text-xs">
                {pastMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-bold text-slate-900">{msg.subject}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{formatDate(msg.createdAt)}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          msg.status === 'Répondu'
                            ? 'bg-emerald-100 text-emerald-800'
                            : msg.status === 'Lu'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {msg.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-700 text-xs leading-relaxed">{msg.message}</p>

                    {msg.response && (
                      <div className="mt-3 pt-3 border-t border-slate-200 bg-white p-3 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">
                          {language === 'ar' ? 'رد كتابة النادي :' : 'Réponse de l’administration :'}
                        </span>
                        <p className="text-slate-800 text-xs leading-relaxed">{msg.response}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
