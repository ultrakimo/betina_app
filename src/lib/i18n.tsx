import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LangCode = 'en' | 'de' | 'es' | 'pt' | 'fr' | 'it' | 'ro';

export const LANGUAGES: { code: LangCode; label: string; flag: string; nativeName: string }[] = [
  { code: 'en', label: 'English',    flag: '🇬🇧', nativeName: 'English'    },
  { code: 'de', label: 'German',     flag: '🇩🇪', nativeName: 'Deutsch'    },
  { code: 'es', label: 'Spanish',    flag: '🇪🇸', nativeName: 'Español'    },
  { code: 'pt', label: 'Portuguese', flag: '🇧🇷', nativeName: 'Português'  },
  { code: 'fr', label: 'French',     flag: '🇫🇷', nativeName: 'Français'   },
  { code: 'it', label: 'Italian',    flag: '🇮🇹', nativeName: 'Italiano'   },
  { code: 'ro', label: 'Romanian',   flag: '🇷🇴', nativeName: 'Română'     },
];

type Translations = {
  // Auth
  welcomeTitle: string;
  welcomeSubtitle: string;
  enterPhone: string;
  phoneLabel: string;
  continueBtn: string;
  otpTitle: string;
  otpSubtitle: string;
  otpResend: string;
  otpVerify: string;
  registerTitle: string;
  registerName: string;
  registerCountry: string;
  registerBirthday: string;
  registerBtn: string;
  interestsTitle: string;
  interestsSubtitle: string;
  interestsTeamLabel: string;
  interestsFinish: string;
  // Tabs
  tabHome: string;
  tabLive: string;
  tabChat: string;
  tabJourney: string;
  tabSettings: string;
  // Home
  homeGreeting: string;
  homeXP: string;
  homeStreak: string;
  // Live
  liveTitle: string;
  liveTopStory: string;
  liveNoNews: string;
  liveUpcoming: string;
  liveResults: string;
  // Chat
  chatTitle: string;
  chatPlaceholder: string;
  // Journey
  journeyTitle: string;
  journeyMember: string;
  journeyCurrentTier: string;
  journeyToNext: string;
  // Settings
  settingsTitle: string;
  settingsLanguage: string;
  settingsSave: string;
  settingsSaved: string;
  settingsLogout: string;
  settingsAccount: string;
  settingsTier: string;
  // Article
  articleAsk: string;
  articleAskDesc: string;
  articleReadMin: string;
};

const T: Record<LangCode, Translations> = {
  en: {
    welcomeTitle: 'Welcome',
    welcomeSubtitle: "I'm BETina, your AI sports companion.",
    enterPhone: 'Enter your phone number',
    phoneLabel: 'Phone number',
    continueBtn: 'Continue',
    otpTitle: 'Enter the code',
    otpSubtitle: 'We sent a 6-digit code to',
    otpResend: 'Resend code',
    otpVerify: 'Verify',
    registerTitle: 'Create your profile',
    registerName: 'Your name',
    registerCountry: 'Country',
    registerBirthday: 'Birthday (DD / MM / YYYY)',
    registerBtn: "Let's go",
    interestsTitle: 'Your sports',
    interestsSubtitle: 'Pick what you follow',
    interestsTeamLabel: 'Favourite team',
    interestsFinish: 'Finish setup',
    tabHome: 'Home',
    tabLive: 'Live',
    tabChat: 'Chat',
    tabJourney: 'Journey',
    tabSettings: 'Settings',
    homeGreeting: 'Hey',
    homeXP: 'XP',
    homeStreak: 'day streak',
    liveTitle: 'Live & News',
    liveTopStory: '🔥 TOP STORY',
    liveNoNews: 'No news available right now',
    liveUpcoming: 'UPCOMING',
    liveResults: 'RECENT RESULTS',
    chatTitle: 'BETina Chat',
    chatPlaceholder: 'Ask BETina anything…',
    journeyTitle: 'My Journey',
    journeyMember: 'Member since',
    journeyCurrentTier: 'CURRENT',
    journeyToNext: 'XP to next tier',
    settingsTitle: 'Settings',
    settingsLanguage: 'Language',
    settingsSave: 'Save',
    settingsSaved: 'Saved ✓',
    settingsLogout: 'Log out',
    settingsAccount: 'Account',
    settingsTier: 'Tier',
    articleAsk: 'Ask BETina about this',
    articleAskDesc: 'Analysis, predictions & more',
    articleReadMin: 'min read',
  },
  de: {
    welcomeTitle: 'Willkommen',
    welcomeSubtitle: 'Ich bin BETina, dein KI-Sportbegleiter.',
    enterPhone: 'Gib deine Handynummer ein',
    phoneLabel: 'Handynummer',
    continueBtn: 'Weiter',
    otpTitle: 'Code eingeben',
    otpSubtitle: 'Wir haben einen 6-stelligen Code gesendet an',
    otpResend: 'Code erneut senden',
    otpVerify: 'Bestätigen',
    registerTitle: 'Profil erstellen',
    registerName: 'Dein Name',
    registerCountry: 'Land',
    registerBirthday: 'Geburtstag (TT / MM / JJJJ)',
    registerBtn: 'Los geht\'s',
    interestsTitle: 'Deine Sportarten',
    interestsSubtitle: 'Wähle was du verfolgst',
    interestsTeamLabel: 'Lieblingsverein',
    interestsFinish: 'Setup abschließen',
    tabHome: 'Home',
    tabLive: 'Live',
    tabChat: 'Chat',
    tabJourney: 'Reise',
    tabSettings: 'Einstellungen',
    homeGreeting: 'Hey',
    homeXP: 'XP',
    homeStreak: 'Tage in Folge',
    liveTitle: 'Live & News',
    liveTopStory: '🔥 TOP-MELDUNG',
    liveNoNews: 'Gerade keine Neuigkeiten',
    liveUpcoming: 'BEVORSTEHEND',
    liveResults: 'LETZTE ERGEBNISSE',
    chatTitle: 'BETina Chat',
    chatPlaceholder: 'Frag BETina alles…',
    journeyTitle: 'Meine Reise',
    journeyMember: 'Mitglied seit',
    journeyCurrentTier: 'AKTUELL',
    journeyToNext: 'XP bis zur nächsten Stufe',
    settingsTitle: 'Einstellungen',
    settingsLanguage: 'Sprache',
    settingsSave: 'Speichern',
    settingsSaved: 'Gespeichert ✓',
    settingsLogout: 'Abmelden',
    settingsAccount: 'Konto',
    settingsTier: 'Stufe',
    articleAsk: 'BETina fragen',
    articleAskDesc: 'Analyse, Prognosen & mehr',
    articleReadMin: 'Min. Lesezeit',
  },
  es: {
    welcomeTitle: 'Bienvenido',
    welcomeSubtitle: 'Soy BETina, tu compañera IA de deportes.',
    enterPhone: 'Ingresa tu número de teléfono',
    phoneLabel: 'Número de teléfono',
    continueBtn: 'Continuar',
    otpTitle: 'Ingresa el código',
    otpSubtitle: 'Enviamos un código de 6 dígitos a',
    otpResend: 'Reenviar código',
    otpVerify: 'Verificar',
    registerTitle: 'Crea tu perfil',
    registerName: 'Tu nombre',
    registerCountry: 'País',
    registerBirthday: 'Cumpleaños (DD / MM / AAAA)',
    registerBtn: 'Vamos',
    interestsTitle: 'Tus deportes',
    interestsSubtitle: 'Elige lo que sigues',
    interestsTeamLabel: 'Equipo favorito',
    interestsFinish: 'Finalizar',
    tabHome: 'Inicio',
    tabLive: 'En vivo',
    tabChat: 'Chat',
    tabJourney: 'Viaje',
    tabSettings: 'Ajustes',
    homeGreeting: 'Hola',
    homeXP: 'XP',
    homeStreak: 'días seguidos',
    liveTitle: 'En Vivo & Noticias',
    liveTopStory: '🔥 NOTICIA PRINCIPAL',
    liveNoNews: 'No hay noticias disponibles',
    liveUpcoming: 'PRÓXIMOS',
    liveResults: 'ÚLTIMOS RESULTADOS',
    chatTitle: 'Chat BETina',
    chatPlaceholder: 'Pregúntale cualquier cosa a BETina…',
    journeyTitle: 'Mi Viaje',
    journeyMember: 'Miembro desde',
    journeyCurrentTier: 'ACTUAL',
    journeyToNext: 'XP para el siguiente nivel',
    settingsTitle: 'Ajustes',
    settingsLanguage: 'Idioma',
    settingsSave: 'Guardar',
    settingsSaved: 'Guardado ✓',
    settingsLogout: 'Cerrar sesión',
    settingsAccount: 'Cuenta',
    settingsTier: 'Nivel',
    articleAsk: 'Preguntarle a BETina',
    articleAskDesc: 'Análisis, predicciones y más',
    articleReadMin: 'min de lectura',
  },
  pt: {
    welcomeTitle: 'Bem-vindo',
    welcomeSubtitle: 'Sou a BETina, sua companheira de IA esportiva.',
    enterPhone: 'Digite seu número de telefone',
    phoneLabel: 'Número de telefone',
    continueBtn: 'Continuar',
    otpTitle: 'Digite o código',
    otpSubtitle: 'Enviamos um código de 6 dígitos para',
    otpResend: 'Reenviar código',
    otpVerify: 'Verificar',
    registerTitle: 'Crie seu perfil',
    registerName: 'Seu nome',
    registerCountry: 'País',
    registerBirthday: 'Aniversário (DD / MM / AAAA)',
    registerBtn: 'Vamos lá',
    interestsTitle: 'Seus esportes',
    interestsSubtitle: 'Escolha o que você acompanha',
    interestsTeamLabel: 'Time favorito',
    interestsFinish: 'Finalizar',
    tabHome: 'Início',
    tabLive: 'Ao Vivo',
    tabChat: 'Chat',
    tabJourney: 'Jornada',
    tabSettings: 'Configurações',
    homeGreeting: 'Olá',
    homeXP: 'XP',
    homeStreak: 'dias seguidos',
    liveTitle: 'Ao Vivo & Notícias',
    liveTopStory: '🔥 DESTAQUE',
    liveNoNews: 'Sem notícias disponíveis',
    liveUpcoming: 'PRÓXIMOS',
    liveResults: 'ÚLTIMOS RESULTADOS',
    chatTitle: 'Chat BETina',
    chatPlaceholder: 'Pergunte qualquer coisa à BETina…',
    journeyTitle: 'Minha Jornada',
    journeyMember: 'Membro desde',
    journeyCurrentTier: 'ATUAL',
    journeyToNext: 'XP para o próximo nível',
    settingsTitle: 'Configurações',
    settingsLanguage: 'Idioma',
    settingsSave: 'Salvar',
    settingsSaved: 'Salvo ✓',
    settingsLogout: 'Sair',
    settingsAccount: 'Conta',
    settingsTier: 'Nível',
    articleAsk: 'Perguntar à BETina',
    articleAskDesc: 'Análise, previsões e mais',
    articleReadMin: 'min de leitura',
  },
  fr: {
    welcomeTitle: 'Bienvenue',
    welcomeSubtitle: 'Je suis BETina, votre compagne IA sportive.',
    enterPhone: 'Entrez votre numéro de téléphone',
    phoneLabel: 'Numéro de téléphone',
    continueBtn: 'Continuer',
    otpTitle: 'Entrez le code',
    otpSubtitle: 'Nous avons envoyé un code à 6 chiffres à',
    otpResend: 'Renvoyer le code',
    otpVerify: 'Vérifier',
    registerTitle: 'Créez votre profil',
    registerName: 'Votre nom',
    registerCountry: 'Pays',
    registerBirthday: 'Date de naissance (JJ / MM / AAAA)',
    registerBtn: 'C\'est parti',
    interestsTitle: 'Vos sports',
    interestsSubtitle: 'Choisissez ce que vous suivez',
    interestsTeamLabel: 'Équipe favorite',
    interestsFinish: 'Terminer',
    tabHome: 'Accueil',
    tabLive: 'En Direct',
    tabChat: 'Chat',
    tabJourney: 'Parcours',
    tabSettings: 'Paramètres',
    homeGreeting: 'Bonjour',
    homeXP: 'XP',
    homeStreak: 'jours consécutifs',
    liveTitle: 'Direct & Actualités',
    liveTopStory: '🔥 À LA UNE',
    liveNoNews: 'Pas d\'actualités disponibles',
    liveUpcoming: 'À VENIR',
    liveResults: 'DERNIERS RÉSULTATS',
    chatTitle: 'Chat BETina',
    chatPlaceholder: 'Demandez n\'importe quoi à BETina…',
    journeyTitle: 'Mon Parcours',
    journeyMember: 'Membre depuis',
    journeyCurrentTier: 'ACTUEL',
    journeyToNext: 'XP pour le prochain niveau',
    settingsTitle: 'Paramètres',
    settingsLanguage: 'Langue',
    settingsSave: 'Enregistrer',
    settingsSaved: 'Enregistré ✓',
    settingsLogout: 'Se déconnecter',
    settingsAccount: 'Compte',
    settingsTier: 'Niveau',
    articleAsk: 'Demander à BETina',
    articleAskDesc: 'Analyses, prédictions et plus',
    articleReadMin: 'min de lecture',
  },
  it: {
    welcomeTitle: 'Benvenuto',
    welcomeSubtitle: 'Sono BETina, la tua compagna IA sportiva.',
    enterPhone: 'Inserisci il tuo numero di telefono',
    phoneLabel: 'Numero di telefono',
    continueBtn: 'Continua',
    otpTitle: 'Inserisci il codice',
    otpSubtitle: 'Abbiamo inviato un codice a 6 cifre a',
    otpResend: 'Reinvia codice',
    otpVerify: 'Verifica',
    registerTitle: 'Crea il tuo profilo',
    registerName: 'Il tuo nome',
    registerCountry: 'Paese',
    registerBirthday: 'Compleanno (GG / MM / AAAA)',
    registerBtn: 'Iniziamo',
    interestsTitle: 'I tuoi sport',
    interestsSubtitle: 'Scegli cosa segui',
    interestsTeamLabel: 'Squadra preferita',
    interestsFinish: 'Finalizza',
    tabHome: 'Home',
    tabLive: 'Live',
    tabChat: 'Chat',
    tabJourney: 'Percorso',
    tabSettings: 'Impostazioni',
    homeGreeting: 'Ciao',
    homeXP: 'XP',
    homeStreak: 'giorni consecutivi',
    liveTitle: 'Live & Notizie',
    liveTopStory: '🔥 NOTIZIA PRINCIPALE',
    liveNoNews: 'Nessuna notizia disponibile',
    liveUpcoming: 'IN PROGRAMMA',
    liveResults: 'ULTIMI RISULTATI',
    chatTitle: 'Chat BETina',
    chatPlaceholder: 'Chiedi qualsiasi cosa a BETina…',
    journeyTitle: 'Il Mio Percorso',
    journeyMember: 'Membro da',
    journeyCurrentTier: 'ATTUALE',
    journeyToNext: 'XP per il livello successivo',
    settingsTitle: 'Impostazioni',
    settingsLanguage: 'Lingua',
    settingsSave: 'Salva',
    settingsSaved: 'Salvato ✓',
    settingsLogout: 'Esci',
    settingsAccount: 'Account',
    settingsTier: 'Livello',
    articleAsk: 'Chiedi a BETina',
    articleAskDesc: 'Analisi, previsioni e altro',
    articleReadMin: 'min di lettura',
  },
  ro: {
    welcomeTitle: 'Bun venit',
    welcomeSubtitle: 'Sunt BETina, companiona ta IA sportivă.',
    enterPhone: 'Introdu numărul tău de telefon',
    phoneLabel: 'Număr de telefon',
    continueBtn: 'Continuă',
    otpTitle: 'Introdu codul',
    otpSubtitle: 'Am trimis un cod de 6 cifre la',
    otpResend: 'Retrimite codul',
    otpVerify: 'Verifică',
    registerTitle: 'Creează-ți profilul',
    registerName: 'Numele tău',
    registerCountry: 'Țară',
    registerBirthday: 'Ziua de naștere (ZZ / LL / AAAA)',
    registerBtn: 'Hai să mergem',
    interestsTitle: 'Sporturile tale',
    interestsSubtitle: 'Alege ce urmărești',
    interestsTeamLabel: 'Echipa preferată',
    interestsFinish: 'Finalizează',
    tabHome: 'Acasă',
    tabLive: 'Live',
    tabChat: 'Chat',
    tabJourney: 'Călătorie',
    tabSettings: 'Setări',
    homeGreeting: 'Salut',
    homeXP: 'XP',
    homeStreak: 'zile la rând',
    liveTitle: 'Live & Știri',
    liveTopStory: '🔥 ȘTIREA ZILEI',
    liveNoNews: 'Nicio știre disponibilă',
    liveUpcoming: 'VIITOARE',
    liveResults: 'REZULTATE RECENTE',
    chatTitle: 'Chat BETina',
    chatPlaceholder: 'Întreabă-o pe BETina orice…',
    journeyTitle: 'Călătoria Mea',
    journeyMember: 'Membru din',
    journeyCurrentTier: 'CURENT',
    journeyToNext: 'XP pentru nivelul următor',
    settingsTitle: 'Setări',
    settingsLanguage: 'Limbă',
    settingsSave: 'Salvează',
    settingsSaved: 'Salvat ✓',
    settingsLogout: 'Deconectare',
    settingsAccount: 'Cont',
    settingsTier: 'Nivel',
    articleAsk: 'Întreabă BETina',
    articleAskDesc: 'Analiză, predicții și mai mult',
    articleReadMin: 'min citire',
  },
};

// ── Context ──────────────────────────────────────────────────────────────────
type I18nCtx = {
  lang: LangCode;
  setLang: (l: LangCode) => Promise<void>;
  t: Translations;
};

export const I18nContext = createContext<I18nCtx>({
  lang: 'en',
  setLang: async () => {},
  t: T.en,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>('en');

  useEffect(() => {
    AsyncStorage.getItem('betina_lang').then((saved) => {
      if (saved && T[saved as LangCode]) setLangState(saved as LangCode);
    });
  }, []);

  const setLang = useCallback(async (l: LangCode) => {
    setLangState(l);
    await AsyncStorage.setItem('betina_lang', l);
  }, []);

  return (
    <I18nContext.Provider value={{ lang, setLang, t: T[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

// Detect device locale → best matching LangCode
export function detectLang(locale: string): LangCode {
  const short = locale.slice(0, 2).toLowerCase();
  const map: Record<string, LangCode> = {
    de: 'de', es: 'es', pt: 'pt', fr: 'fr', it: 'it', ro: 'ro',
  };
  return map[short] ?? 'en';
}

// ── Country → language ───────────────────────────────────────────────────────
// Used by onboarding: picking a country (register) or dial code (login)
// switches the whole app to that country's language.

const COUNTRY_LANG: Record<string, LangCode> = {
  AT: 'de', DE: 'de', CH: 'de',
  ES: 'es', MX: 'es', CO: 'es', AR: 'es', SV: 'es',
  PT: 'pt', BR: 'pt', AO: 'pt',
  FR: 'fr', SN: 'fr', GN: 'fr', CD: 'fr',
  IT: 'it',
  RO: 'ro',
  GB: 'en', US: 'en', NG: 'en', TZ: 'en', KE: 'en', GH: 'en',
};

/** ISO-3166 alpha-2 country code → app language. Null = unknown, keep current. */
export function langForCountry(iso2: string): LangCode | null {
  return COUNTRY_LANG[iso2.toUpperCase()] ?? null;
}

const DIAL_LANG: Record<string, LangCode> = {
  '+43': 'de', '+49': 'de', '+41': 'de',
  '+34': 'es', '+52': 'es', '+57': 'es', '+54': 'es', '+503': 'es',
  '+351': 'pt', '+55': 'pt', '+244': 'pt',
  '+33': 'fr', '+221': 'fr', '+224': 'fr', '+243': 'fr',
  '+39': 'it',
  '+40': 'ro',
  '+44': 'en', '+1': 'en', '+234': 'en', '+255': 'en', '+254': 'en', '+233': 'en',
};

/** Phone dial code → app language. Null = unknown, keep current. */
export function langForDialCode(dial: string): LangCode | null {
  return DIAL_LANG[dial] ?? null;
}
