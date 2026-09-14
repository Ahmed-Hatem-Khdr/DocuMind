import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { handleFirestoreError, OperationType } from '../../firebase/error-handler';
import { DocumentModel, ReminderModel } from '../../types/document';

const DOCS_COLLECTION = 'documents';
const REMINDERS_COLLECTION = 'reminders';

// Demo sample documents for instant evaluation without uploading
export const DEMO_DOCUMENTS: DocumentModel[] = [
  {
    id: 'demo-doc-1',
    ownerId: 'demo-user',
    fileName: 'Suez_Canal_Univ_AI_Certificate_2026.pdf',
    fileType: 'application/pdf',
    fileSize: 1048576,
    title: 'Suez Canal University AI & Machine Learning Certificate',
    category: 'Certificates',
    documentType: 'Certificate',
    language: 'English',
    ocrText: `SUEZ CANAL UNIVERSITY
Faculty of Computers and Informatics
Department of Artificial Intelligence

CERTIFICATE OF EXCELLENCE

This is to certify that: AHMED HATEM
has successfully completed the Advanced Artificial Intelligence and Deep Learning Intensive Professional Program.

Program Details:
- Institution: Suez Canal University, Ismailia, Egypt
- Specialization: Machine Learning, Neural Networks & Computer Vision
- Duration: 120 Hours
- Issue Date: 15/09/2026
- Grade: High Distinction (98/100)
- Expiry Date: N/A (Lifetime validity)

Authorized Signature:
Prof. Dr. Head of AI Department`,
    shortSummary: 'Certificate of Excellence awarded to Ahmed Hatem by Suez Canal University in AI and Machine Learning.',
    detailedSummary: 'This document certifies that Ahmed Hatem successfully completed a 120-hour intensive program in Advanced Artificial Intelligence and Deep Learning at Suez Canal University with a grade of High Distinction (98/100). Issued on September 15, 2026.',
    tags: ['#AI', '#Education', '#Certificate', '#SuezCanalUniversity', '#2026'],
    extractedData: {
      student_name: 'Ahmed Hatem',
      institution: 'Suez Canal University',
      certificate_type: 'Advanced AI & Deep Learning Intensive',
      issue_date: '15/09/2026',
      score: '98/100 (High Distinction)',
      duration: '120 Hours',
    },
    confidenceScores: {
      student_name: 98,
      institution: 96,
      certificate_type: 95,
      issue_date: 92,
      score: 97,
    },
    documentDate: '2026-09-15',
    uploadDate: '2026-09-15',
    processingStatus: 'ready',
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-doc-2',
    ownerId: 'demo-user',
    fileName: 'AWS_Cloud_Infrastructure_Invoice_INV-84920.pdf',
    fileType: 'application/pdf',
    fileSize: 450200,
    title: 'Amazon Web Services Cloud Infrastructure Monthly Invoice',
    category: 'Invoices',
    documentType: 'Invoice',
    language: 'English',
    ocrText: `AMAZON WEB SERVICES, INC.
P.O. Box 84023, Seattle, WA 98124

INVOICE STATEMENT
Invoice Number: INV-84920
Invoice Date: August 31, 2026
Billing Period: Aug 01, 2026 - Aug 31, 2026
Payment Due Date: September 20, 2026

Account ID: 8821-4901-3320
Customer: Tech Solutions Ltd.

Summary of Charges:
- Elastic Compute Cloud (EC2): $142.50
- Relational Database Service (RDS): $85.00
- Simple Storage Service (S3): $18.20
- Network Data Transfer: $12.30

Subtotal: $258.00
Tax (VAT 14%): $36.12
Total Amount Due: $294.12 USD

Payment Method: Visa ending in 4242`,
    shortSummary: 'AWS Invoice INV-84920 for August 2026 totaling $294.12 USD due September 20, 2026.',
    detailedSummary: 'Monthly cloud infrastructure invoice from Amazon Web Services for Tech Solutions Ltd. Total amount is $294.12 USD including 14% VAT. Breakdown includes EC2 ($142.50), RDS ($85.00), and S3 storage ($18.20). Due date is September 20, 2026.',
    tags: ['#AWS', '#Invoice', '#Cloud', '#Finance', '#2026'],
    extractedData: {
      company: 'Amazon Web Services, Inc.',
      invoice_number: 'INV-84920',
      date: 'August 31, 2026',
      due_date: 'September 20, 2026',
      subtotal: '$258.00',
      tax: '$36.12 (14% VAT)',
      total: '$294.12 USD',
      currency: 'USD',
    },
    confidenceScores: {
      company: 99,
      invoice_number: 98,
      date: 96,
      due_date: 95,
      total: 99,
    },
    documentDate: '2026-08-31',
    uploadDate: '2026-09-01',
    expiryDate: '2026-09-20',
    processingStatus: 'ready',
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-doc-3',
    ownerId: 'demo-user',
    fileName: 'Software_Engineer_Employment_Contract_2025.pdf',
    fileType: 'application/pdf',
    fileSize: 2100500,
    title: 'Senior Full Stack AI Engineer Employment Agreement',
    category: 'Contracts',
    documentType: 'Contract',
    language: 'English',
    ocrText: `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is made effective as of January 15, 2025, by and between:
Party A: Tech Corp International ("Employer")
Party B: Ahmed Hatem ("Employee")

POSITION AND DUTIES:
The Employee shall serve in the position of Senior Full Stack & AI Engineer.

COMPENSATION & BENEFITS:
- Base Annual Salary: $120,000 USD paid in monthly installments.
- Performance Bonus: Up to 15% annual bonus based on key project metrics.
- Health Insurance: Full medical, dental, and vision coverage provided.

DURATION & TERMINATION:
- Contract Effective Start Date: January 15, 2025
- Contract Expiry / Renewal Date: January 14, 2027 (2-year term with automatic renewal)
- Notice Period: 30 days written notice required by either party.

CONFIDENTIALITY & NON-COMPETE:
Standard IP assignment and 12-month post-employment non-compete clause in designated regions.`,
    shortSummary: 'Employment agreement between Tech Corp International and Ahmed Hatem for Senior AI Engineer position.',
    detailedSummary: 'A 2-year employment contract for Senior Full Stack & AI Engineer role with Tech Corp International. Salary is $120,000 USD/year plus up to 15% bonus. Start date: Jan 15, 2025. Expiration/Renewal date: Jan 14, 2027.',
    tags: ['#Contract', '#Employment', '#Career', '#TechCorp', '#2025'],
    extractedData: {
      parties: 'Tech Corp International & Ahmed Hatem',
      position: 'Senior Full Stack & AI Engineer',
      salary: '$120,000 USD / year',
      bonus: 'Up to 15%',
      start_date: '2025-01-15',
      end_date: '2027-01-14',
      notice_period: '30 days',
    },
    confidenceScores: {
      parties: 97,
      position: 98,
      salary: 95,
      start_date: 96,
      end_date: 93,
    },
    documentDate: '2025-01-15',
    uploadDate: '2025-01-16',
    expiryDate: '2027-01-14',
    processingStatus: 'ready',
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-doc-4',
    ownerId: 'demo-user',
    fileName: 'Arabic_Medical_Diagnostic_Report_2026.pdf',
    fileType: 'application/pdf',
    fileSize: 890000,
    title: 'تقرير طبي وشامل - مركز الأمل الطبي',
    category: 'Medical',
    documentType: 'Medical report',
    language: 'Arabic + English (Mixed)',
    ocrText: `مركز الأمل الطبي للتشخيص والعلاج
جمهورية مصر العربية - القاهرة

تقرير فحص طبي شامل (Comprehensive Medical Report)

اسم المريض: أحمد حاتم (Ahmed Hatem)
رقم الملف الطبي: MED-99402
تاريخ الفحص: 10 مايو 2026

نتائج الفحوصات الطبية:
1. صورة الدم الكاملة (CBC): طبيعية بالكامل - الهيموجلوبين 14.8 g/dL
2. وظائف الكبد والكلى: جميع المؤشرات ضمن الحدود الطبيعية المستهدفة
3. قياس ضغط الدم: 120/80 mmHg (طبيعي ممتاز)
4. فحص النظر والسمع: لا توجد أي ملاحظات أو مشاكل صحية

التوصيات الطبية:
- الاستمرار في نمط الحياة الصحي وممارسة الرياضة المنتظمة
- الفحص الدوري السنوي القادم: مايو 2027

الطبيب المعالج: أ.د. محمود الشريف - استشاري الباطنة والقلب`,
    shortSummary: 'تقرير طبي شامل لأحمد حاتم من مركز الأمل الطبي يؤكد سلامة الفحوصات وجميع المؤشرات الحيوية.',
    detailedSummary: 'تقرير تشخيصي صادر عن مركز الأمل الطبي بالقاهرة بتاريخ 10 مايو 2026 للمريض أحمد حاتم. أظهرت الفحوصات (CBC، وظائف الكبد والكلى، ضغط الدم) نتائج طبيعية بالكامل بدون أي اعتلالات. يُوصى بإجراء الفحص الدوري القادم في مايو 2027.',
    tags: ['#طبي', '#تقرير_طبي', '#صحة', '#القاهرة', '#2026'],
    extractedData: {
      patient_name: 'أحمد حاتم (Ahmed Hatem)',
      medical_file_id: 'MED-99402',
      medical_center: 'مركز الأمل الطبي - القاهرة',
      examination_date: '10/05/2026',
      next_checkup_date: '10/05/2027',
      physician: 'أ.د. محمود الشريف',
      blood_pressure: '120/80 mmHg',
    },
    confidenceScores: {
      patient_name: 99,
      medical_center: 97,
      examination_date: 96,
      physician: 94,
    },
    documentDate: '2026-05-10',
    uploadDate: '2026-05-11',
    expiryDate: '2027-05-10',
    processingStatus: 'ready',
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Document CRUD Functions
export async function fetchUserDocuments(userId: string): Promise<DocumentModel[]> {
  if (!userId || userId === 'demo-user') {
    return DEMO_DOCUMENTS;
  }

  try {
    const q = query(
      collection(db, DOCS_COLLECTION),
      where('ownerId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as DocumentModel[];

    // Include demo documents if user archive is empty for seamless experience
    if (docs.length === 0) {
      return DEMO_DOCUMENTS;
    }
    return docs;
  } catch (error) {
    console.warn('Firestore fetch failed, returning demo mode documents:', error);
    return DEMO_DOCUMENTS;
  }
}

export async function saveDocument(document: DocumentModel): Promise<void> {
  if (document.ownerId === 'demo-user' || document.isDemo) {
    DEMO_DOCUMENTS.unshift(document);
    return;
  }

  try {
    const docRef = doc(db, DOCS_COLLECTION, document.id);
    await setDoc(docRef, {
      ...document,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${DOCS_COLLECTION}/${document.id}`);
  }
}

export async function updateDocumentFields(
  documentId: string,
  userId: string,
  updates: Partial<DocumentModel>
): Promise<void> {
  if (userId === 'demo-user') {
    const index = DEMO_DOCUMENTS.findIndex((d) => d.id === documentId);
    if (index !== -1) {
      DEMO_DOCUMENTS[index] = {
        ...DEMO_DOCUMENTS[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    }
    return;
  }

  try {
    const docRef = doc(db, DOCS_COLLECTION, documentId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${DOCS_COLLECTION}/${documentId}`);
  }
}

export async function deleteDocumentRecord(documentId: string, userId: string): Promise<void> {
  if (userId === 'demo-user') {
    const index = DEMO_DOCUMENTS.findIndex((d) => d.id === documentId);
    if (index !== -1) {
      DEMO_DOCUMENTS.splice(index, 1);
    }
    return;
  }

  try {
    const docRef = doc(db, DOCS_COLLECTION, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${DOCS_COLLECTION}/${documentId}`);
  }
}

// Reminders CRUD
export async function createReminder(reminder: ReminderModel): Promise<void> {
  if (reminder.ownerId === 'demo-user') {
    return;
  }

  try {
    const ref = doc(db, REMINDERS_COLLECTION, reminder.id);
    await setDoc(ref, reminder);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${REMINDERS_COLLECTION}/${reminder.id}`);
  }
}

export async function fetchUserReminders(userId: string): Promise<ReminderModel[]> {
  if (!userId || userId === 'demo-user') {
    return [
      {
        id: 'rem-1',
        ownerId: 'demo-user',
        documentId: 'demo-doc-2',
        documentTitle: 'Amazon Web Services Monthly Invoice',
        title: 'Pay AWS Invoice INV-84920',
        targetDate: '2026-09-20',
        reminderDate: '2026-09-13',
        period: '1_week_before',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'rem-2',
        ownerId: 'demo-user',
        documentId: 'demo-doc-3',
        documentTitle: 'Senior Full Stack AI Engineer Contract',
        title: 'Review Employment Agreement Renewal Options',
        targetDate: '2027-01-14',
        reminderDate: '2026-12-14',
        period: '1_month_before',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  try {
    const q = query(
      collection(db, REMINDERS_COLLECTION),
      where('ownerId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as ReminderModel[];
  } catch (error) {
    return [];
  }
}
