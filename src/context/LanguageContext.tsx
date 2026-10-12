import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'fr' | 'ar';

export interface Translations {
  [key: string]: string | Translations;
}

const STORAGE_LANG_KEY = 'maroc_football_association_lang';

export const translations = {
  fr: {
    // Nav
    nav: {
      dashboard: 'Tableau de bord',
      players: 'Joueurs',
      parents: 'Parents & Tuteurs',
      teams: 'Équipes',
      registrations: 'Inscriptions',
      plans: 'Cotisations et tarifs',
      payments: 'Paiements',
      unpaid: 'Impayés',
      receipts: 'Reçus',
      sessions: 'Séances',
      attendance: 'Présences',
      reports: 'Rapports',
      users: 'Utilisateurs & rôles',
      audit: 'Historique et audit',
      settings: 'Paramètres',
      logout: 'Déconnexion',
      welcome: 'Bienvenue',
      homeSection: 'ACCUEIL',
      clubSection: 'CLUB',
      financesSection: 'FINANCES',
      sportSection: 'SPORT',
      reportsSection: 'RAPPORTS',
      adminSection: 'ADMINISTRATION',
      seasonBadge: 'Saison 2026-2027',
      managementApp: 'Gestion Club Foot',
    },
    // Dashboard
    dashboard: {
      title: 'Tableau de bord',
      subtitle: "Aperçu rapide de l'association sportive",
      activePlayers: 'Joueurs actifs',
      teams: 'Équipes',
      monthlyPayments: 'Paiements du mois',
      totalUnpaid: 'Total des impayés',
      addPlayer: 'Ajouter un joueur',
      recordPayment: 'Enregistrer un paiement',
      takeAttendance: "Faire l'appel",
      monthlyEvolution: 'Évolution des paiements mensuels',
      recentMonths: 'Derniers mois',
      recentPayments: 'Derniers paiements',
      allPayments: 'Tous les paiements →',
      priorityUnpaid: 'Impayés prioritaires',
      allUnpaid: 'Tous les impayés',
      noUnpaid: 'Aucun impayé à signaler.',
      settle: 'Régulariser',
      viewReceipt: 'Voir reçu',
      overdueAlertTitle: 'Alerte cotisations en retard (> 30 jours)',
      overdueAlertSubtitle: 'Vérification automatique au démarrage : {count} joueur(s) identifié(s) avec un retard de plus de 30 jours.',
      overdueViewList: 'Consulter les impayés',
      overdueHide: 'Masquer',
      overdueDaysLate: 'jours de retard',
      overdueLateTag: 'En retard',
      overdueFilterButton: 'Retard > 30 jours',
    },
    // Common
    common: {
      search: 'Rechercher...',
      searchShortcut: '⌘K',
      new: 'Nouveau',
      filter: 'Filtrer',
      all: 'Tous',
      allFem: 'Toutes',
      save: 'Enregistrer',
      cancel: 'Annuler',
      edit: 'Modifier',
      delete: 'Supprimer',
      close: 'Fermer',
      actions: 'Actions',
      status: 'Statut',
      exportExcel: 'Exporter Excel',
      loading: 'Chargement...',
      success: 'Opération réussie',
      error: 'Erreur',
      total: 'Total',
      print: 'Imprimer',
      download: 'Télécharger',
      phone: 'Téléphone',
      whatsapp: 'WhatsApp',
      email: 'Email',
      address: 'Adresse',
      category: 'Catégorie',
      coach: 'Entraîneur',
      notes: 'Remarques & Notes',
      amount: 'Montant',
      date: 'Date',
      player: 'Joueur',
      parent: 'Parent',
      team: 'Équipe',
      viewProfile: 'Voir fiche',
      role: 'Rôle',
      active: 'Actif',
      inactive: 'Inactif',
      suspended: 'Suspendu',
      former: 'Ancien',
      validated: 'Validé',
      pending: 'En attente',
      rejected: 'Rejeté',
      present: 'Présent',
      absent: 'Absent',
      excused: 'Excusé',
      cash: 'Espèces',
      bankTransfer: 'Virement bancaire',
      cheque: 'Chèque',
      creditCard: 'Carte bancaire',
      other: 'Autre',
      confirm: 'Confirmer',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
      noData: 'Aucune donnée disponible',
      currencySymbol: 'DH',
      paid: 'PAYÉ',
      partiallyPaid: 'PARTIELLEMENT PAYÉ',
      unpaidStatus: 'IMPAYÉ',
    },
    // Players
    players: {
      title: 'Joueurs',
      subtitle: 'Effectif du club et fiches joueurs',
      newPlayer: 'Nouveau joueur',
      filterTeam: 'Toutes les équipes',
      filterStatus: 'Tous les statuts',
      colName: 'Joueur',
      colTeam: 'Équipe',
      colParent: 'Parent / Tuteur',
      colFinancial: 'Cotisation',
      colAttendance: 'Présences',
      colStatus: 'Statut',
      addPlayerTitle: 'Ajouter un nouveau joueur',
      editPlayerTitle: 'Modifier la fiche joueur',
      firstName: 'Prénom',
      lastName: 'Nom',
      birthDate: 'Date de naissance',
      gender: 'Genre',
      male: 'Masculin',
      female: 'Féminin',
      jerseyNumber: 'Numéro de maillot',
      position: 'Poste sur le terrain',
      assignedTeam: 'Équipe assignée',
      assignedParent: 'Parent référent',
      registrationDate: "Date d'inscription",
      detailsTitle: 'Détails du joueur',
      financialSummary: 'Situation financière',
      expectedAmount: 'Montant prévu',
      paidAmount: 'Montant réglé',
      remainingAmount: 'Reste à payer',
      attendanceRate: 'Taux de présence',
      playerDeleted: 'Joueur supprimé avec succès',
      playerSaved: 'Joueur enregistré avec succès',
    },
    // Parents
    parents: {
      title: 'Parents & Tuteurs',
      subtitle: 'Répertoire familial et contacts des adhérents',
      newParent: 'Nouveau parent',
      colName: 'Parent',
      colContact: 'Contact',
      colRelation: 'Lien familial',
      colChildren: 'Enfants inscrits',
      colBalance: 'Solde familial',
      father: 'Père',
      mother: 'Mère',
      guardian: 'Tuteur légal',
      otherRelation: 'Autre',
      addParentTitle: 'Ajouter un parent / tuteur',
      editParentTitle: 'Modifier le parent',
    },
    // Teams
    teams: {
      title: 'Équipes & Catégories',
      subtitle: 'Catégories, coachs et entraînements',
      newTeam: 'Nouvelle équipe',
      colTeam: 'Équipe / Catégorie',
      colCoach: 'Entraîneur',
      colSchedule: 'Planning & Terrain',
      colFee: 'Cotisation mensuelle',
      colPlayers: 'Effectif',
      addTeamTitle: 'Créer une équipe',
      editTeamTitle: "Modifier l'équipe",
      trainingLocation: "Lieu d'entraînement",
      trainingDays: "Jours d'entraînement",
      trainingTime: 'Horaires',
    },
    // Registrations
    registrations: {
      title: 'Inscriptions & Adhésions',
      subtitle: 'Adhésions de la saison sportive',
      newRegistration: 'Nouvelle inscription',
      season: 'Saison',
      formula: 'Formule / Périodicité',
      annual: 'Annuelle',
      term: 'Trimestrielle',
      semester: 'Semestrielle',
      monthly: 'Mensuelle',
      colPlayer: 'Joueur inscrit',
      colTeam: 'Équipe',
      colPeriod: 'Période',
      colTotal: 'Montant total prévu',
      colStatus: 'Statut adhésion',
    },
    // Payments
    payments: {
      title: 'Paiements & Encaissements',
      subtitle: 'Registre des encaissements en DH',
      newPayment: 'Enregistrer un paiement',
      colNum: 'N° Reçu / Réf',
      colPlayer: 'Joueur / Parent',
      colAmount: 'Montant',
      colDate: 'Date',
      colPeriod: 'Période couverte',
      colMethod: 'Mode',
      colStatus: 'Statut',
      addPaymentTitle: 'Enregistrer un nouveau paiement',
      selectPlayer: 'Sélectionner le joueur',
      paymentAmount: 'Montant du versement (DH)',
      paymentDate: 'Date du paiement',
      paymentMethod: 'Mode de règlement',
      paymentPeriod: 'Période couverte (ex: Octobre 2026)',
      referenceLabel: 'Référence (N° chèque / virement)',
      downloadReceipt: 'Générer le reçu officiel',
    },
    // Unpaid
    unpaid: {
      title: 'Gestion des Impayés',
      subtitle: 'Suivi et recouvrement des cotisations en retard',
      totalToRecover: 'Total restant à recouvrer :',
      colPlayer: 'Joueur',
      colParent: 'Parent',
      colTeam: 'Équipe',
      colRemaining: 'Reste à payer',
      colLastPayment: 'Dernier paiement',
      colDelay: 'Retard constaté',
      settleButton: 'Régulariser paiement',
      none: 'Aucun',
      filterOverdue30: 'En retard > 30 jours',
      showAll: 'Tous les impayés',
    },
    // Receipts
    receipts: {
      title: 'Reçus Officiels',
      subtitle: 'Reçus officiels de cotisation numérotés',
      colNumber: 'N° de Reçu',
      colPaymentRef: 'Paiement lié',
      colPlayer: 'Joueur & Famille',
      colAmount: 'Montant encaissé',
      colDate: "Date d'émission",
      officialReceiptTitle: 'REÇU OFFICIEL DE COTISATION',
      academyHeader: 'ASSOCIATION SPORTIVE - SECTION FOOTBALL',
      receivedFrom: 'Reçu de :',
      forPlayer: 'Pour le joueur :',
      amountInDH: 'Somme reçue :',
      paymentMode: 'Règlement effectué par :',
      membershipSeason: 'Adhésion sportive saison :',
      signatureStamp: 'Signature & Cachet de l’Association :',
    },
    // Sessions
    sessions: {
      title: 'Séances d’entraînement',
      subtitle: 'Planning et pointage des séances sportives',
      newSession: 'Nouvelle séance',
      colDate: 'Date & Horaires',
      colTeam: 'Équipe',
      colCoach: 'Coach',
      colLocation: 'Terrain / Lieu',
      colAttendanceCount: 'Présents / Effectif',
      takeRollCall: "Faire l'appel",
      completed: 'Terminée',
      scheduled: 'Programmée',
    },
    // Attendance
    attendance: {
      title: 'Feuille de Présence',
      subtitle: 'Pointage individuel des joueurs par séance',
      markAllPresent: 'Marquer tous présents',
      colPlayer: 'Joueur',
      colStatus: 'Présence',
      colNotes: 'Remarques séance',
      overallRate: 'Taux de présence global',
      saveAttendance: 'Valider la feuille de présence',
    },
    // Reports
    reports: {
      title: 'Rapports & Statistiques',
      subtitle: 'Analyses consolidées et exports administratifs',
      tabFinances: 'Rapport Financier',
      tabPlayers: 'Rapport Joueurs & Effectifs',
      tabParents: 'Rapport Parents & Familles',
      totalRevenue: 'Total Encaissé',
      totalUnpaidRevenue: 'Total Impayés',
      recoveryRate: 'Taux de recouvrement',
      totalPlayersCount: 'Total Joueurs',
    },
    // Users
    users: {
      title: 'Utilisateurs & Droits d’accès',
      subtitle: 'Comptes des collaborateurs du club',
      newUser: 'Nouvel utilisateur',
      colName: 'Nom',
      colEmail: 'Email',
      colPhone: 'Téléphone',
      colRole: 'Rôle',
      colStatus: 'Statut compte',
      roleSuperAdmin: 'Super Admin',
      roleAdmin: 'Administrateur',
      roleAccountant: 'Comptable',
      roleCoach: 'Entraîneur',
      roleStaff: 'Staff / Secrétariat',
      statusActive: 'Actif',
      statusInactive: 'Désactivé',
      toggleStatus: 'Basculer statut',
      editRole: 'Modifier le rôle',
    },
    // Settings
    settings: {
      title: 'Paramètres du Club',
      subtitle: 'Configuration générale et coordonnées de l’association',
      tabGeneral: 'Association',
      tabSeason: 'Saison Sportive',
      tabFees: 'Tarifs par équipe',
      tabAudit: 'Journal d’audit',
      assocName: 'Nom officiel de l’association',
      assocShort: 'Sigle / Nom court',
      president: 'Président du club',
      ice: 'Identifiant ICE',
      city: 'Ville',
      postalCode: 'Code postal',
      currency: 'Devise par défaut',
      receiptFooter: 'Texte de bas de page des reçus',
      saveSettings: 'Enregistrer les paramètres',
    },
    // Auth & Header
    auth: {
      loginTitle: 'AS Atlas Foot',
      loginSubtitle: 'Gestion de l’association',
      emailLabel: 'Email',
      passwordLabel: 'Mot de passe',
      loginButton: 'Se connecter',
      loggingIn: 'Connexion en cours...',
      forgotPassword: 'Mot de passe oublié ?',
      forgotTitle: 'Réinitialisation du mot de passe',
      sendResetLink: 'Envoyer le lien de réinitialisation',
      backToLogin: 'Retour à la connexion',
      testAccounts: 'Comptes d’accès préconfigurés',
      superAdmin: 'Direction (Super Admin)',
      accountant: 'Comptabilité',
      coach: 'Coach Rachid',
      myProfile: 'Mon profil',
      logout: 'Se déconnecter',
      settings: 'Paramètres',
      switchLang: 'Changer de langue',
      french: 'Français',
      arabic: 'العربية',
    },
  },
  ar: {
    // Nav
    nav: {
      dashboard: 'لوحة التحكم',
      players: 'اللاعبون',
      parents: 'أولياء الأمور',
      teams: 'الفرق',
      registrations: 'التسجيلات',
      plans: 'الاشتراكات والتعريفات',
      payments: 'المدفوعات',
      unpaid: 'المستحقات غير المؤداة',
      receipts: 'الإيصالات',
      sessions: 'الحصص التدريبية',
      attendance: 'الحضور',
      reports: 'التقارير',
      users: 'المستخدمون والصلاحيات',
      audit: 'سجل العمليات',
      settings: 'الإعدادات',
      logout: 'تسجيل الخروج',
      welcome: 'مرحباً',
      homeSection: 'الرئيسية',
      clubSection: 'النادي',
      financesSection: 'المالية',
      sportSection: 'الرياضة',
      reportsSection: 'التقارير',
      adminSection: 'الإدارة',
      seasonBadge: 'الموسم 2026-2027',
      managementApp: 'إدارة نادي كرة القدم',
    },
    // Dashboard
    dashboard: {
      title: 'لوحة التحكم',
      subtitle: 'نظرة عامة على أنشطة الجمعية الرياضية',
      activePlayers: 'اللاعبون النشطون',
      teams: 'الفرق',
      monthlyPayments: 'مدفوعات الشهر',
      totalUnpaid: 'إجمالي المستحقات',
      addPlayer: 'إضافة لاعب',
      recordPayment: 'تسجيل دفعة',
      takeAttendance: 'تسجيل الحضور',
      monthlyEvolution: 'تطور المدفوعات الشهرية',
      recentMonths: 'الشهور الأخيرة',
      recentPayments: 'آخر المدفوعات',
      allPayments: 'جميع المدفوعات ←',
      priorityUnpaid: 'المتأخرات ذات الأولوية',
      allUnpaid: 'جميع المتأخرات',
      noUnpaid: 'لا توجد مستحقات معلقة.',
      settle: 'تسوية',
      viewReceipt: 'معاينة الإيصال',
      overdueAlertTitle: 'تنبيه: اشتراكات متأخرة لأكثر من 30 يوماً',
      overdueAlertSubtitle: 'فحص تلقائي عند التشغيل: تم تحديد {count} لاعب(ين) مع اشتراكات متأخرة لأكثر من 30 يوماً.',
      overdueViewList: 'عرض المستحقات المتأخرة',
      overdueHide: 'إخفاء',
      overdueDaysLate: 'يوم تأخير',
      overdueLateTag: 'متأخر',
      overdueFilterButton: 'تأخير > 30 يوماً',
    },
    // Common
    common: {
      search: 'بحث...',
      searchShortcut: '⌘K',
      new: 'جديد',
      filter: 'تصفية',
      all: 'الكل',
      allFem: 'الكل',
      save: 'حفظ',
      cancel: 'إلغاء',
      edit: 'تعديل',
      delete: 'حذف',
      close: 'إغلاق',
      actions: 'إجراءات',
      status: 'الحالة',
      exportExcel: 'تصدير Excel',
      loading: 'جارٍ التحميل...',
      success: 'تمت العملية بنجاح',
      error: 'حدث خطأ',
      total: 'المجموع',
      print: 'طباعة',
      download: 'تحميل',
      phone: 'الهاتف',
      whatsapp: 'واتساب',
      email: 'البريد الإلكتروني',
      address: 'العنوان',
      category: 'الفئة',
      coach: 'المدرب',
      notes: 'ملاحظات',
      amount: 'المبلغ',
      date: 'التاريخ',
      player: 'اللاعب',
      parent: 'ولي الأمر',
      team: 'الفريق',
      viewProfile: 'عرض الملف',
      role: 'الصلاحية',
      active: 'نشط',
      inactive: 'غير نشط',
      suspended: 'موقوف',
      former: 'سابق',
      validated: 'مؤكد',
      pending: 'قيد الانتظار',
      rejected: 'مرفوض',
      present: 'حاضر',
      absent: 'غائب',
      excused: 'معذور',
      cash: 'نقداً',
      bankTransfer: 'تحويل بنكي',
      cheque: 'شيك',
      creditCard: 'بطاقة بنكية',
      other: 'أخرى',
      confirm: 'تأكيد',
      confirmDelete: 'هل أنت متأكد من رغبتك في حذف هذا العنصر؟',
      noData: 'لا توجد بيانات متاحة',
      currencySymbol: 'د.م',
      paid: 'مدفوع بالكامل',
      partiallyPaid: 'مدفوع جزئياً',
      unpaidStatus: 'غير مدفوع',
    },
    // Players
    players: {
      title: 'اللاعبون',
      subtitle: 'قائمة منخرطي النادي وملفات اللاعبين',
      newPlayer: 'إضافة لاعب جديد',
      filterTeam: 'جميع الفرق',
      filterStatus: 'جميع الحالات',
      colName: 'اللاعب',
      colTeam: 'الفريق',
      colParent: 'ولي الأمر',
      colFinancial: 'الاشتراك',
      colAttendance: 'الحضور',
      colStatus: 'الحالة',
      addPlayerTitle: 'إضافة لاعب جديد',
      editPlayerTitle: 'تعديل بيانات اللاعب',
      firstName: 'الاسم الشخصي',
      lastName: 'الاسم العائلي',
      birthDate: 'تاريخ الازدياد',
      gender: 'الجنس',
      male: 'ذكر',
      female: 'أنثى',
      jerseyNumber: 'رقم القميص',
      position: 'مركز اللعب',
      assignedTeam: 'الفريق المخصص',
      assignedParent: 'ولي الأمر المسؤول',
      registrationDate: 'تاريخ التسجيل',
      detailsTitle: 'تفاصيل اللاعب',
      financialSummary: 'الوضعية المالية',
      expectedAmount: 'المبلغ المستحق',
      paidAmount: 'المبلغ المؤدى',
      remainingAmount: 'المتبقي للأداء',
      attendanceRate: 'نسبة الحضور',
      playerDeleted: 'تم حذف اللاعب بنجاح',
      playerSaved: 'تم حفظ بيانات اللاعب بنجاح',
    },
    // Parents
    parents: {
      title: 'أولياء الأمور',
      subtitle: 'دليل العائلات وبيانات التواصل مع أولياء الأمور',
      newParent: 'إضافة ولي أمر جديد',
      colName: 'ولي الأمر',
      colContact: 'التواصل',
      colRelation: 'صلة القرابة',
      colChildren: 'الأبناء المسجلون',
      colBalance: 'الرصيد العائلي',
      father: 'الأب',
      mother: 'الأم',
      guardian: 'ولي أمر شرعي',
      otherRelation: 'صلة أخرى',
      addParentTitle: 'إضافة ولي أمر جديد',
      editParentTitle: 'تعديل بيانات ولي الأمر',
    },
    // Teams
    teams: {
      title: 'الفرق والفئات',
      subtitle: 'الفئات العمرية، المدربون وجداول التداريب',
      newTeam: 'فريق جديد',
      colTeam: 'الفريق / الفئة',
      colCoach: 'المدرب',
      colSchedule: 'الملعب والمواعيد',
      colFee: 'الاشتراك الشهري',
      colPlayers: 'العدد',
      addTeamTitle: 'إنشاء فريق جديد',
      editTeamTitle: 'تعديل الفريق',
      trainingLocation: 'مكان التداريب',
      trainingDays: 'أيام التداريب',
      trainingTime: 'التوقيت',
    },
    // Registrations
    registrations: {
      title: 'التسجيلات والاشتراكات',
      subtitle: 'انخراطات الموسم الرياضي الحالي',
      newRegistration: 'تسجيل جديد',
      season: 'الموسم',
      formula: 'صيغة الاشتراك',
      annual: 'سنوي',
      term: 'ثلاثي (3 أشهر)',
      semester: 'نصف سنوي',
      monthly: 'شهري',
      colPlayer: 'اللاعب المنخرط',
      colTeam: 'الفريق',
      colPeriod: 'الفترة',
      colTotal: 'المبلغ الإجمالي المستحق',
      colStatus: 'حالة الانخراط',
    },
    // Payments
    payments: {
      title: 'المدفوعات والمداخيل',
      subtitle: 'سجل المداخيل والمبالغ المحصلة بالدرهم',
      newPayment: 'تسجيل دفعة جديدة',
      colNum: 'رقم الإيصال / المرجع',
      colPlayer: 'اللاعب / ولي الأمر',
      colAmount: 'المبلغ',
      colDate: 'التاريخ',
      colPeriod: 'الفترة المغطاة',
      colMethod: 'طريقة الأداء',
      colStatus: 'الحالة',
      addPaymentTitle: 'تسجيل دفعة جديدة',
      selectPlayer: 'اختر اللاعب',
      paymentAmount: 'مبلغ الدفعة (د.م)',
      paymentDate: 'تاريخ الأداء',
      paymentMethod: 'طريقة الدفع',
      paymentPeriod: 'الفترة المغطاة (مثال: أكتوبر 2026)',
      referenceLabel: 'المرجع (رقم الشيك / التحويل)',
      downloadReceipt: 'إصدار الإيصال الرسمي',
    },
    // Unpaid
    unpaid: {
      title: 'المستحقات غير المؤداة',
      subtitle: 'متابعة وتحصيل الاشتراكات المتأخرة',
      totalToRecover: 'إجمالي المستحقات المتبقية للتحصيل:',
      colPlayer: 'اللاعب',
      colParent: 'ولي الأمر',
      colTeam: 'الفريق',
      colRemaining: 'المبلغ المتبقي',
      colLastPayment: 'آخر دفعة',
      colDelay: 'مدة التأخير',
      settleButton: 'تسوية الأداء',
      none: 'لا يوجد',
      filterOverdue30: 'متأخر لأكثر من 30 يوماً',
      showAll: 'جميع المتأخرات',
    },
    // Receipts
    receipts: {
      title: 'الإيصالات الرسمية',
      subtitle: 'إيصالات الأداء الرسمية المرقمة',
      colNumber: 'رقم الإيصال',
      colPaymentRef: 'الدفعة المرتبطة',
      colPlayer: 'اللاعب والعائلة',
      colAmount: 'المبلغ المقبوض',
      colDate: 'تاريخ الإصدار',
      officialReceiptTitle: 'إيصال أداء اشتراك رياضي رسمي',
      academyHeader: 'الجمعية الرياضية - فرع كرة القدم',
      receivedFrom: 'تسلّمنا من السيد(ة):',
      forPlayer: 'لفائدة المنخرط:',
      amountInDH: 'مبلغ وقدره:',
      paymentMode: 'طريقة الأداء:',
      membershipSeason: 'اشتراك الموسم الرياضي:',
      signatureStamp: 'توقيع وخاتم الجمعية:',
    },
    // Sessions
    sessions: {
      title: 'الحصص التدريبية',
      subtitle: 'برمجة وتسجيل الحصص الرياضية',
      newSession: 'حصة جديدة',
      colDate: 'التاريخ والتوقيت',
      colTeam: 'الفريق',
      colCoach: 'المدرب',
      colLocation: 'الملعب',
      colAttendanceCount: 'الحاضرون / المجموع',
      takeRollCall: 'تسجيل الحضور',
      completed: 'مكتملة',
      scheduled: 'مبرمجة',
    },
    // Attendance
    attendance: {
      title: 'ورقة الحضور والغياب',
      subtitle: 'تسجيل حضور المنخرطين في الحصص التدريبية',
      markAllPresent: 'تحديد الجميع كحاضرين',
      colPlayer: 'اللاعب',
      colStatus: 'الحضور',
      colNotes: 'ملاحظات الحصة',
      overallRate: 'النسبة العامة للحضور',
      saveAttendance: 'تأكيد ورقة الحضور',
    },
    // Reports
    reports: {
      title: 'التقارير والإحصائيات',
      subtitle: 'تحليلات مجمعة وتقارير إدارية قابلة للتصدير',
      tabFinances: 'التقرير المالي',
      tabPlayers: 'تقرير اللاعبين والفئات',
      tabParents: 'تقرير أولياء الأمور',
      totalRevenue: 'إجمالي المداخيل المحصلة',
      totalUnpaidRevenue: 'إجمالي المستحقات غير المؤداة',
      recoveryRate: 'نسبة التحصيل',
      totalPlayersCount: 'مجموع اللاعبين',
    },
    // Users
    users: {
      title: 'المستخدمون والصلاحيات',
      subtitle: 'حسابات طاقم ومسؤولي النادي',
      newUser: 'مستخدم جديد',
      colName: 'الاسم الكامل',
      colEmail: 'البريد الإلكتروني',
      colPhone: 'الهاتف',
      colRole: 'الصلاحية',
      colStatus: 'حالة الحساب',
      roleSuperAdmin: 'مشرف عام',
      roleAdmin: 'مدير إداري',
      roleAccountant: 'محاسب',
      roleCoach: 'مدرب',
      roleStaff: 'طاقم / كتابة',
      statusActive: 'نشط',
      statusInactive: 'معطل',
      toggleStatus: 'تغيير الحالة',
      editRole: 'تعديل الصلاحية',
    },
    // Settings
    settings: {
      title: 'إعدادات النادي',
      subtitle: 'البيانات العامة للجمعية الرياضية',
      tabGeneral: 'الجمعية',
      tabSeason: 'الموسم الرياضي',
      tabFees: 'التعريفات حسب الفرق',
      tabAudit: 'سجل العمليات',
      assocName: 'الاسم الرسمي للجمعية',
      assocShort: 'الاسم المختصر',
      president: 'رئيس النادي',
      ice: 'الرقم الموحد للمقاولة (ICE)',
      city: 'المدينة',
      postalCode: 'الرمز البريدي',
      currency: 'العملة الافتراضية',
      receiptFooter: 'النص أسفل الإيصالات الرسمية',
      saveSettings: 'حفظ الإعدادات',
    },
    // Auth & Header
    auth: {
      loginTitle: 'نادي أطلس لكرة القدم',
      loginSubtitle: 'إدارة الجمعية الرياضية',
      emailLabel: 'البريد الإلكتروني',
      passwordLabel: 'كلمة المرور',
      loginButton: 'تسجيل الدخول',
      loggingIn: 'جارٍ تسجيل الدخول...',
      forgotPassword: 'نسيت كلمة المرور؟',
      forgotTitle: 'استعادة كلمة المرور',
      sendResetLink: 'إرسال رابط استعادة كلمة المرور',
      backToLogin: 'العودة لتسجيل الدخول',
      testAccounts: 'حسابات تجريبية معدة مسبقاً',
      superAdmin: 'الإدارة (مشرف عام)',
      accountant: 'المحاسبة',
      coach: 'المدرب رشيد',
      myProfile: 'ملفي الشخصي',
      logout: 'تسجيل الخروج',
      settings: 'الإعدادات',
      switchLang: 'تغيير اللغة',
      french: 'Français',
      arabic: 'العربية',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (path: string, fallback?: string) => string;
  isRTL: boolean;
  dir: 'ltr' | 'rtl';
  formatMoney: (amount: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      if (saved === 'ar' || saved === 'fr') return saved;
    } catch {
      // fallback
    }
    return 'fr';
  });

  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LANG_KEY, language);
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    if (isRTL) {
      document.body.classList.add('rtl-mode');
    } else {
      document.body.classList.remove('rtl-mode');
    }
  }, [language, dir, isRTL]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'fr' ? 'ar' : 'fr'));
  };

  const t = (path: string, fallback?: string): string => {
    const keys = path.split('.');
    let current: any = translations[language];
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to French if missing in Arabic
        let fb: any = translations.fr;
        for (const k of keys) {
          if (fb && typeof fb === 'object' && k in fb) {
            fb = fb[k];
          } else {
            fb = undefined;
            break;
          }
        }
        return fb || fallback || path;
      }
    }
    return typeof current === 'string' ? current : fallback || path;
  };

  const formatMoney = (amount: number): string => {
    const formatted = new Intl.NumberFormat(language === 'ar' ? 'ar-MA' : 'fr-FR', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(amount);
    const symbol = language === 'ar' ? 'د.م' : 'DH';
    return `${formatted} ${symbol}`;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isRTL,
        dir,
        formatMoney,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
