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
];
