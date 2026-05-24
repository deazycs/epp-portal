// ============================================================
// CORE TYPES — Росреестр ИС Закупок МО
// ============================================================

export type UserRole =
  | 'specialist_mto'
  | 'head_department'
  | 'contract_manager'
  | 'accountant'
  | 'admin'
  | 'management';

export type ProcurementStatus =
  | 'draft'              // Создание (СЗ поступила в МТО)
  | 'sz_approval'        // Согласование СЗ с Зам. руководителя
  | 'financing'          // Перекладывание денег на статью (ФЭО)
  | 'preparation'        // Подготовка: 3 КП, ТЗ, проект договора, НМЦК
  | 'placement'          // Размещение закупки в ЕАТ/ЕИС
  | 'bidding'            // Торги (сбор заявок)
  | 'winner_approval'    // Согласование победителя с нач. МТО
  | 'contract_expertise' // Экспертиза договора (ФЭО + правовой)
  | 'deputy_signing'     // Визирование Зам. руководителя
  | 'contract_signed'    // Договор подписан (ЭЦП, печать)
  | 'execution'          // Исполнение (ожидаем поставку)
  | 'payment'            // Оплата (документы в бухгалтерию)
  | 'plan_schedule'      // Включение в план-график ЕИС
  | 'eis_notice'         // Публикация извещения в ЕИС (перед аукционом)
  | 'eis_reporting'      // Отчётность в ЕИС/ЕАТ
  | 'archive'            // Архив
  | 'cancelled';         // Отменено

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type DocumentStatus = 'draft' | 'review' | 'approved' | 'rejected' | 'archived';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision';
export type TaskStatus = 'new' | 'in_progress' | 'done' | 'overdue' | 'cancelled';
export type ContractStatus = 'draft' | 'active' | 'executed' | 'terminated' | 'expired';

export interface User {
  id: string;
  login: string;
  fullName: string;
  shortName: string;
  role: UserRole;
  department: string;
  departmentId: string;
  position: string;
  email: string;
  phone: string;
  avatar?: string;
  isOnline: boolean;
  lastLogin: string;
  permissions: string[];
}

export interface Department {
  id: string;
  name: string;
  shortName: string;
  head: string;
  parentId?: string;
  code: string;
  employeeCount: number;
  activeProcurements: number;
}

export interface Supplier {
  id: string;
  inn: string;
  kpp?: string;
  ogrn: string;
  name: string;
  shortName: string;
  legalAddress: string;
  actualAddress: string;
  contactPerson: string;
  phone: string;
  email: string;
  bankName: string;
  bik: string;
  checkingAccount: string;
  correspondentAccount: string;
  category: 'legal' | 'individual' | 'sp';
  isSmallBusiness: boolean;
  rating: number;
  totalContracts: number;
  totalSum: number;
  status: 'active' | 'blacklisted' | 'suspended';
  registeredAt: string;
  lastContractAt?: string;
  notes?: string;
}

export interface ProcurementItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  okpd2Code?: string;
  ktruCode?: string;
  characteristics?: string;
}

export interface Procurement {
  id: string;
  registryNumber: string;
  eatNumber?: string;
  eisNumber?: string;
  title: string;
  description: string;
  status: ProcurementStatus;
  riskLevel: RiskLevel;

  // Организация
  departmentId: string;
  departmentName: string;
  initiatorId: string;
  initiatorName: string;
  responsibleId: string;
  responsibleName: string;

  // Финансы
  plannedSum: number;
  contractSum?: number;
  paidSum?: number;
  budgetCode: string;
  kbk: string;
  kosgu: string;
  financingSource: string;

  // Поставщик
  supplierId?: string;
  supplierName?: string;
  supplierInn?: string;

  // Предмет
  procurementType: 'goods' | 'works' | 'services';
  procedure?: string; // eat_kotировки | eis_auction | eis_konkurs | single
  items: ProcurementItem[];

  // Даты
  createdAt: string;
  updatedAt: string;
  plannedStartDate: string;
  plannedEndDate: string;
  contractDate?: string;
  contractEndDate?: string;
  actualEndDate?: string;
  eatPlacementDate?: string;

  // Документы
  documentIds: string[];

  // Прочее
  tags: string[];
  // Реквизиты закупки
  szInitiatorDept?: string;
  szDate?: string;
  nmck?: number;
  economySumTotal?: number;
  economyPct?: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isOverdue: boolean;
  overduedays?: number;
  comments?: Comment[];
  approvals?: Approval[];
  tasks?: Task[];
  history?: HistoryEntry[];
  workflowSteps?: WorkflowStep[];
}

export interface Contract {
  id: string;
  number: string;
  procurementId: string;
  procurementTitle: string;
  supplierId: string;
  supplierName: string;
  supplierInn: string;
  status: ContractStatus;
  subject: string;
  totalSum: number;
  paidSum: number;
  signDate: string;
  startDate: string;
  endDate: string;
  actualEndDate?: string;
  departmentId: string;
  departmentName: string;
  responsibleId: string;
  responsibleName: string;
  documentIds: string[];
  payments: Payment[];
  executions: Execution[];
  isOverdue: boolean;
  notes?: string;
}

export interface Payment {
  id: string;
  contractId: string;
  procurementId: string;
  amount: number;
  plannedDate: string;
  actualDate?: string;
  status: 'planned' | 'processing' | 'completed' | 'overdue' | 'cancelled';
  paymentOrderNumber?: string;
  bankOrderDate?: string;
  description: string;
  documentIds: string[];
}

export interface Execution {
  id: string;
  contractId: string;
  procurementId: string;
  stage: string;
  plannedDate: string;
  actualDate?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'overdue' | 'accepted';
  acceptanceDate?: string;
  actNumber?: string;
  description: string;
  deliveredItems?: ProcurementItem[];
  documentIds: string[];
}

export interface Document {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  category: DocumentCategory;
  status: DocumentStatus;
  procurementId?: string;
  contractId?: string;
  uploadedById: string;
  uploadedByName: string;
  uploadedAt: string;
  updatedAt: string;
  version: number;
  previousVersionId?: string;
  description?: string;
  tags: string[];
  // Реквизиты закупки
  szInitiatorDept?: string;
  szDate?: string;
  nmck?: number;
  economySumTotal?: number;
  economyPct?: number;
  approvedById?: string;
  approvedByName?: string;
  approvedAt?: string;
  isTemplate: boolean;
  downloadUrl: string;
}

export type DocumentCategory =
  | 'tz'
  | 'commercial_offer'
  | 'contract'
  | 'invoice'
  | 'acceptance_act'
  | 'service_note'
  | 'justification'
  | 'correspondence'
  | 'other'
  | 'template'
  | 'report'
  | 'order';

export interface Comment {
  id: string;
  entityId: string;
  entityType: 'procurement' | 'contract' | 'document' | 'task';
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  createdAt: string;
  updatedAt?: string;
  isInternal: boolean;
  attachmentIds?: string[];
  parentId?: string;
  reactions?: { emoji: string; count: number; users: string[] }[];
}

export interface Approval {
  id: string;
  entityId: string;
  entityType: string;
  approverIds: string[];
  currentApproverId?: string;
  status: ApprovalStatus;
  stage: number;
  totalStages: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  steps: ApprovalStep[];
}

export interface ApprovalStep {
  id: string;
  approvalId: string;
  stage: number;
  approverId: string;
  approverName: string;
  approverRole: UserRole;
  status: ApprovalStatus;
  comment?: string;
  decidedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assigneeId: string;
  assigneeName: string;
  creatorId: string;
  creatorName: string;
  procurementId?: string;
  contractId?: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  // Реквизиты закупки
  szInitiatorDept?: string;
  szDate?: string;
  nmck?: number;
  economySumTotal?: number;
  economyPct?: number;
  subtasks?: SubTask[];
}

export interface SubTask {
  id: string;
  parentId: string;
  title: string;
  done: boolean;
  assigneeId?: string;
}

export interface HistoryEntry {
  id: string;
  entityId: string;
  entityType: string;
  userId: string;
  userName: string;
  action: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  createdAt: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

export interface WorkflowStep {
  id: string;
  procurementId: string;
  status: ProcurementStatus;
  name: string;
  description?: string;
  completedAt?: string;
  completedById?: string;
  completedByName?: string;
  responsible?: string;
  requiredDocuments?: string[];
  isActive: boolean;
  isCompleted: boolean;
  order: number;
  durationDays?: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'deadline' | 'approval' | 'task' | 'system' | 'document' | 'payment';
  title: string;
  message: string;
  link?: string;
  entityId?: string;
  entityType?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface KPIMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target?: number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  period: string;
  status: 'good' | 'warning' | 'bad';
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  entityId?: string;
  entityType?: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  result: 'success' | 'failure' | 'warning';
  details?: Record<string, unknown>;
}

export interface Risk {
  id: string;
  procurementId?: string;
  contractId?: string;
  title: string;
  description: string;
  level: RiskLevel;
  category: 'deadline' | 'document' | 'supplier' | 'budget' | 'compliance' | 'technical';
  status: 'open' | 'mitigated' | 'accepted' | 'closed';
  responsibleId: string;
  responsibleName: string;
  identifiedAt: string;
  dueDate?: string;
  closedAt?: string;
  mitigationPlan?: string;
}

export interface ServiceNote {
  id: string;
  number: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  departmentId: string;
  addresseeId: string;
  addresseeName: string;
  procurementId?: string;
  status: 'draft' | 'sent' | 'reviewed' | 'approved' | 'rejected';
  createdAt: string;
  sentAt?: string;
  reviewedAt?: string;
  documentId?: string;
}

export interface AnalyticsData {
  period: string;
  totalProcurements: number;
  totalSum: number;
  completedProcurements: number;
  overdueProcurements: number;
  activeProcurements: number;
  avgExecutionDays: number;
  supplierCount: number;
  topCategories: { name: string; count: number; sum: number }[];
  byDepartment: { name: string; count: number; sum: number }[];
  byStatus: { status: string; count: number }[];
  timeline: { date: string; count: number; sum: number }[];
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface FilterState {
  search?: string;
  status?: string[];
  department?: string[];
  dateFrom?: string;
  dateTo?: string;
  riskLevel?: string[];
  priority?: string[];
  [key: string]: unknown;
}
