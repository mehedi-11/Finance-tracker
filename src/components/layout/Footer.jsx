import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-8 px-4 md:px-6 lg:px-10 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm font-medium">
        <p>© {currentYear} Money Tracker. {t('footer.rights')}</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-primary-600 transition-colors">{t('footer.privacy')}</a>
          <a href="#" className="hover:text-primary-600 transition-colors">{t('footer.terms')}</a>
          <a href="/help" className="hover:text-primary-600 transition-colors">{t('common.help_support')}</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
