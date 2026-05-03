import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, Mail, MessageCircle, Phone, ArrowRight, ShieldCheck, LifeBuoy } from 'lucide-react';
import { Card, Button } from '../components/ui';

const HelpSupport = () => {
  const { t } = useTranslation();

  const faqs = [
    { q: t('help_support.faq_1_q'), a: t('help_support.faq_1_a') },
    { q: t('help_support.faq_2_q'), a: t('help_support.faq_2_a') },
    { q: "How to set a budget?", a: "Navigate to the Budget page, select a category, enter the amount and click 'Set Budget'." },
    { q: "Is my data secure?", a: "Yes, we use industry-standard encryption to protect your financial information." }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="text-center space-y-4 py-8">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LifeBuoy className="text-primary-600" size={40} />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900">{t('help_support.title')}</h1>
        <p className="text-gray-500 font-medium max-w-xl mx-auto">{t('help_support.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center p-8 bg-white border-none shadow-sm hover:shadow-md transition-all group">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
            <Mail className="text-indigo-600" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{t('common.email_us')}</h3>
          <p className="text-gray-500 text-sm mb-6">{t('common.response_time')}</p>
          <Button variant="secondary" className="w-full bg-indigo-50 border-none text-indigo-600 font-bold">{t('common.email_us')}</Button>
        </Card>

        <Card className="text-center p-8 bg-white border-none shadow-sm hover:shadow-md transition-all group">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
            <MessageSquare className="text-emerald-600" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{t('help_support.live_chat')}</h3>
          <p className="text-gray-500 text-sm mb-6">{t('common.chat_availability')}</p>
          <Button variant="secondary" className="w-full bg-emerald-50 border-none text-emerald-600 font-bold">{t('common.start_chat')}</Button>
        </Card>

        <Card className="text-center p-8 bg-white border-none shadow-sm hover:shadow-md transition-all group">
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
            <PhoneCall className="text-purple-600" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{t('common.phone_support')}</h3>
          <p className="text-gray-500 text-sm mb-6">{t('common.call_directly')}</p>
          <Button variant="secondary" className="w-full bg-purple-50 border-none text-purple-600 font-bold">{t('common.call_now')}</Button>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <HelpCircle className="text-primary-600" />
          {t('help_support.faq')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="p-6 bg-white border-none shadow-sm hover:shadow-md transition-all">
              <h4 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                <span className="text-primary-600 text-lg">Q.</span>
                {faq.q}
              </h4>
              <p className="text-gray-500 text-sm leading-relaxed ml-7">
                {faq.a}
              </p>
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-gray-50 rounded-[40px] p-10 md:p-16 text-center space-y-6 relative overflow-hidden border-none shadow-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full -mr-32 -mt-32 opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-100 rounded-full -ml-32 -mb-32 opacity-40"></div>
        
        <div className="relative z-10 space-y-6">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary-600/20">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-black text-gray-900">{t('help_support.help_footer_title')}</h2>
          <p className="text-gray-600 max-w-lg mx-auto font-medium">
            {t('help_support.help_footer_subtitle')}
          </p>
          <Button className="bg-primary-600 text-white hover:bg-primary-700 border-none px-10 py-4 font-bold rounded-xl flex items-center gap-2 mx-auto shadow-lg shadow-primary-600/20 active:scale-95">
            {t('help_support.get_in_touch')} <ArrowRight size={20} />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default HelpSupport;
