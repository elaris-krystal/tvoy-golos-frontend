/**
 * Подкатегории, для которых генератор создаёт текст жалобы/заявления
 * на НАРУШЕНИЕ (по 59-ФЗ), а не запрос о ЛЬГОТАХ. Для них экран
 * Screen3Benefits должен показывать другие формулировки — соцзащита
 * не имеет отношения, например, к незаконной свалке или отказу в
 * возврате товара.
 *
 * Список должен соответствовать ключам с реальными шаблонами в
 * backend generator.py (комбинированный ключ "категория_подкатегория").
 * При добавлении новой подкатегории такого типа — обязательно добавить
 * её и сюда, иначе пользователь увидит вводящее в заблуждение сообщение
 * про «точный перечень льгот от соцзащиты» (баг, который уже был найден
 * и исправлен для labor/*, но не был обобщён на позже добавленные
 * категории — ЖКХ, дольщики, экология, потребители, часть здоровья/пенсии).
 */
export const VIOLATION_SUBCATEGORIES: Set<string> = new Set([
  'labor/salary_issues', 'labor/unfair_dismissal', 'labor/working_conditions', 'labor/other_labor',
  'utilities/utility_overcharge', 'utilities/utility_quality', 'utilities/management_company', 'utilities/capital_repair',
  'construction/construction_delay', 'construction/developer_bankruptcy', 'construction/construction_defects', 'construction/other_construction',
  'ecology/illegal_dump', 'ecology/illegal_logging', 'ecology/pollution', 'ecology/other_ecology',
  'consumer/refund_refusal', 'consumer/warranty_defect', 'consumer/service_quality', 'consumer/consumer_other',
  'health/paid_services_free_clinic', 'health/treatment_refusal',
  'pension/pension_recalculation', 'pension/pension_underpayment',
  'finance/bank_dispute', 'finance/insurance_dispute', 'finance/osago_dispute', 'finance/finance_other',
  'transport/flight_delay', 'transport/lost_baggage', 'transport/public_transport', 'transport/transport_other',
  'privacy/data_misuse', 'privacy/data_deletion_refusal', 'privacy/data_leak', 'privacy/privacy_other',
]);

export function isViolationSubcategory(categoryKey?: string | null, subcategoryKey?: string | null): boolean {
  if (!categoryKey || !subcategoryKey) return false;
  return VIOLATION_SUBCATEGORIES.has(`${categoryKey}/${subcategoryKey}`);
}
