export type LegalDocumentType = 'terms' | 'privacy';

interface LegalSection {
  title: string;
  body?: string;
  bullets?: string[];
}

interface LegalDocument {
  title: string;
  updatedOn: string;
  sections: LegalSection[];
}

type Locale = 'en' | 'rw';

type LegalContent = Record<LegalDocumentType, Record<Locale, LegalDocument>>;

export const legalContent: LegalContent = {
  terms: {
    en: {
      title: 'Terms & Conditions',
      updatedOn: 'Last updated on 12 March 2025',
      sections: [
        {
          title: 'Eligibility',
          bullets: [
            'You are at least 18 years old or meet your country’s legal age.',
            'You can enter a binding agreement with RealWorks.',
            'You will use the app for lawful personal finance and wellness tracking.'
          ]
        },
        {
          title: 'Acceptable use',
          body: 'Do not misuse the platform, attempt unauthorized access, or upload harmful content. We may suspend accounts that violate these rules.'
        },
        {
          title: 'Subscriptions',
          body: 'Paid tiers renew monthly and can be cancelled anytime inside the app. Fees are non-refundable for the current billing cycle.'
        },
        {
          title: 'Contact',
          body: 'Email legal@realworks.africa for questions regarding these terms.'
        }
      ]
    },
    rw: {
      title: "Amategeko n'Amabwiriza",
      updatedOn: 'Yavuguruwe ku wa 12 Werurwe 2025',
      sections: [
        {
          title: 'Uburenganzira bwo kuyikoresha',
          bullets: [
            "Ufite nibura imyaka 18 cyangwa iyemewe n'igihugu cyawe.",
            "Ushobora kugirana amasezerano agira agaciro na RealWorks.",
            "Uwemera gukoresha porogaramu mu buryo bwemewe bwo gucunga imari n'ubuzima bwawe."
          ]
        },
        {
          title: 'Imikoreshereze yemewe',
          body: 'Ntukoreshe nabi urubuga, ntugerageze kwinjira mu buryo butemewe cyangwa ngo wohereze ibirimo kwangiza. Konti zica ku mategeko zirahagarikwa.'
        },
        {
          title: 'Serivisi zishyurwa',
          body: "Serivisi zishyurwa zishyurwa buri kwezi kandi ushobora kuzihagarika igihe icyo ari cyo cyose muri porogaramu. Amafaranga y'ukwezi kuriho ntiyishyurwa."
        },
        {
          title: 'Twandikire',
          body: "Ibibazo birebana n'aya mategeko wohereza kuri legal@realworks.africa."
        }
      ]
    }
  },
  privacy: {
    en: {
      title: 'Privacy Policy',
      updatedOn: 'Last updated on 06 March 2025',
      sections: [
        {
          title: 'How we handle your data',
          body: 'We collect the details you provide (name, email, phone, health logs) to personalize RealWorks and power the AI companion. This data is encrypted in transit and at rest and is never sold to third parties.'
        },
        {
          title: 'Information we collect',
          bullets: [
            'Personal details you share when creating an account.',
            'Financial activity you enter or import for budgeting.',
            'Wellness logs (cycle data, check-ins) you choose to store.'
          ]
        },
        {
          title: 'Your control',
          body: 'You can download, update, or delete your information at any time from the Account screen. Contact support@realworks.africa for additional privacy requests.'
        },
        {
          title: 'Questions?',
          body: 'Read the full policy at realworks.africa/privacy or chat with support for clarifications.'
        }
      ]
    },
    rw: {
      title: "Politiki y'Ibanga",
      updatedOn: 'Yavuguruwe ku wa 06 Werurwe 2025',
      sections: [
        {
          title: 'Uko dukoresha amakuru yawe',
          body: "Dukusanya amakuru utanga (amazina, imeri, telefone, raporo z'ubuzima) kugira ngo RealWorks ikwigirire akamaro kandi ifashe umufasha wacu wa AI. Amakuru abohererezwa mu buryo bwizewe kandi ntadandazwa ku bandi."
        },
        {
          title: 'Amakuru dukusanya',
          bullets: [
            'Amakuru yawe bwite utanga igihe ufungura konti.',
            "Ibikorwa by'imari winjiza cyangwa winjizamo mu igenamigambi.",
            "Amakuru y'ubuzima (imihango, isuzuma rya buri munsi) wihitiramo kubika."
          ]
        },
        {
          title: 'Uburyo ugumana uburenganzira',
          body: 'Ushobora gukurura, kuvugurura cyangwa gusiba amakuru yawe igihe icyo ari cyo cyose ukoresheje urupapuro rwa Konti. Twandikire kuri support@realworks.africa niba hari ubundi busabe.'
        },
        {
          title: 'Ibibazo?',
          body: 'Soma politiki yose kuri realworks.africa/privacy cyangwa uganire n’itsinda ryacu ry’ubufasha kugira ngo ubone ibisobanuro.'
        }
      ]
    }
  }
};

export const getLegalDocument = (type: LegalDocumentType, locale: Locale): LegalDocument => {
  const document = legalContent[type][locale];
  if (document) return document;
  return legalContent[type].en;
};
