import type { Category } from '../types';

export const CATEGORIES: Category[] = [
  {
    key: 'family',
    label: 'Семья и дети',
    icon: '👶',
    subcategories: [
      { key: 'single_parent', label: 'Одинокий родитель' },
      { key: 'large_family', label: 'Многодетная семья' },
      { key: 'disabled_child', label: 'Ребёнок-инвалид' },
      { key: 'guardianship', label: 'Опека / попечительство' },
    ],
  },
  {
    key: 'employment',
    label: 'Занятость и доход',
    icon: '💼',
    subcategories: [
      { key: 'employed', label: 'Работаю официально' },
      { key: 'unemployed', label: 'Безработный' },
      { key: 'self_employed', label: 'Самозанятый или ИП' },
      { key: 'informal', label: 'Работаю неофициально' },
      { key: 'ussr_deposits', label: 'Компенсация вкладов СССР (ФЗ-73)' },
    ],
  },
  {
    key: 'health',
    label: 'Здоровье и инвалидность',
    icon: '🏥',
    subcategories: [
      { key: 'disability', label: 'Инвалидность' },
      { key: 'chronic', label: 'Хроническое заболевание' },
      { key: 'veteran', label: 'Ветеран боевых действий' },
      { key: 'paid_services_free_clinic', label: 'Незаконные платные услуги по ОМС' },
      { key: 'treatment_refusal', label: 'Отказ в медицинской помощи' },
    ],
  },
  {
    key: 'housing',
    label: 'Жильё',
    icon: '🏠',
    subcategories: [
      { key: 'no_housing', label: 'Нет своего жилья' },
      { key: 'emergency', label: 'Аварийное жильё' },
      { key: 'mortgage', label: 'Ипотека' },
      { key: 'purchased', label: 'Недавно приобрёл жильё' },
    ],
  },
  {
    key: 'education',
    label: 'Образование',
    icon: '🎓',
    subcategories: [
      { key: 'school', label: 'Школьное образование' },
      { key: 'higher', label: 'Высшее образование' },
      { key: 'vocational', label: 'Профессиональная переподготовка' },
      { key: 'children_extra', label: 'Допобразование детей' },
    ],
  },
  {
    key: 'pension',
    label: 'Пенсия и возраст',
    icon: '🧓',
    subcategories: [
      { key: 'pensioner', label: 'Пенсионер' },
      { key: 'pre_pension', label: 'Предпенсионный возраст' },
      { key: 'breadwinner_loss', label: 'Потеря кормильца' },
      { key: 'pension_recalculation', label: 'Неверный расчёт или отказ в перерасчёте' },
      { key: 'pension_underpayment', label: 'Недополученные доплаты или индексация' },
    ],
  },
  {
    key: 'labor',
    label: 'Работа и трудовые споры',
    icon: '⚖️',
    subcategories: [
      { key: 'salary_issues', label: 'Задержка или невыплата зарплаты' },
      { key: 'unfair_dismissal', label: 'Незаконное увольнение' },
      { key: 'working_conditions', label: 'Опасные условия / переработки' },
      { key: 'other_labor', label: 'Другой трудовой вопрос' },
    ],
  },
  {
    key: 'utilities',
    label: 'ЖКХ и управляющая компания',
    icon: '🔧',
    subcategories: [
      { key: 'utility_overcharge', label: 'Завышенные начисления' },
      { key: 'utility_quality', label: 'Некачественные коммунальные услуги' },
      { key: 'management_company', label: 'Бездействие управляющей компании' },
      { key: 'capital_repair', label: 'Взносы на капремонт' },
    ],
  },
  {
    key: 'construction',
    label: 'Долевое строительство',
    icon: '🏗️',
    subcategories: [
      { key: 'construction_delay', label: 'Задержка передачи квартиры' },
      { key: 'developer_bankruptcy', label: 'Банкротство застройщика' },
      { key: 'construction_defects', label: 'Недостатки качества квартиры' },
      { key: 'other_construction', label: 'Другой вопрос по ДДУ' },
    ],
  },
  {
    key: 'ecology',
    label: 'Экология',
    icon: '🌳',
    subcategories: [
      { key: 'illegal_dump', label: 'Незаконная свалка' },
      { key: 'illegal_logging', label: 'Незаконная вырубка деревьев' },
      { key: 'pollution', label: 'Загрязнение воздуха, воды или почвы' },
      { key: 'other_ecology', label: 'Другой экологический вопрос' },
    ],
  },
  {
    key: 'consumer',
    label: 'Права потребителя',
    icon: '🛒',
    subcategories: [
      { key: 'refund_refusal', label: 'Отказ в возврате денег за товар' },
      { key: 'warranty_defect', label: 'Недостатки товара по гарантии' },
      { key: 'service_quality', label: 'Некачественная услуга' },
      { key: 'consumer_other', label: 'Другой потребительский вопрос' },
    ],
  },
  {
    key: 'finance',
    label: 'Банки и страхование',
    icon: '🏦',
    subcategories: [
      { key: 'bank_dispute', label: 'Спор с банком (комиссии, навязанные услуги)' },
      { key: 'insurance_dispute', label: 'Отказ или задержка страховой выплаты' },
      { key: 'osago_dispute', label: 'Спор по ОСАГО/КАСКО' },
      { key: 'finance_other', label: 'Другой финансовый вопрос' },
    ],
  },
  {
    key: 'transport',
    label: 'Транспорт',
    icon: '✈️',
    subcategories: [
      { key: 'flight_delay', label: 'Задержка или отмена рейса' },
      { key: 'lost_baggage', label: 'Утеря или повреждение багажа' },
      { key: 'public_transport', label: 'Общественный транспорт (автобус, электричка)' },
      { key: 'transport_other', label: 'Другой транспортный вопрос' },
    ],
  },
];
