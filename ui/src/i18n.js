import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import english from './Utils/locale/EN-US.json';
import spanish from './Utils/locale/ES.json';
import moment from 'moment';

// the translations
// (tip move them in a JSON file and import them)
const resources = {
  en_us: {
    translation: english
  }, 
  es: {
    translation: spanish
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en_us",
    fallbackLng: ['en', 'es'],

    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

  i18n.on('languageChanged', function(lng) {
    // E.g. set the moment locale with the current language
    moment.locale(lng);
});

  export default i18n;