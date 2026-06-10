declare module 'firebase/app' {
  export type FirebaseApp = unknown;
  export function initializeApp(config: Record<string, unknown>): FirebaseApp;
}

declare module 'firebase/auth' {
  export type User = {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  };

  export type Auth = unknown;
  export class GoogleAuthProvider {
    constructor();
    addScope(scope: string): void;
  }

  export function getAuth(app?: unknown): Auth;
  export function GoogleAuthProvider(): GoogleAuthProvider;
  export function signInWithPopup(auth: Auth, provider: GoogleAuthProvider): Promise<{ user: User }>;
  export function signOut(auth: Auth): Promise<void>;
  export function onAuthStateChanged(
    auth: Auth,
    callback: (user: User | null) => void
  ): () => void;
}

declare module 'firebase/firestore' {
  export type Timestamp = {
    toDate(): Date;
    toMillis(): number;
  };

  export type DocumentSnapshot = {
    id: string;
    exists(): boolean;
    data(): Record<string, unknown>;
  };

  export type QueryConstraint = unknown;
  export type CollectionReference = unknown;

  export function getFirestore(app?: unknown): unknown;
  export function doc(...args: Array<string | unknown>): unknown;
  export function collection(...args: Array<string | unknown>): unknown;
  export function setDoc(ref: unknown, data: Record<string, unknown>, options?: Record<string, unknown>): Promise<void>;
  export function getDoc(ref: unknown): Promise<DocumentSnapshot>;
  export function addDoc(ref: unknown, data: Record<string, unknown>): Promise<{ id: string }>;
  export function deleteDoc(ref: unknown): Promise<void>;
  export function serverTimestamp(): Timestamp;
  export function query(ref: unknown, ...constraints: QueryConstraint[]): unknown;
  export function where(...args: unknown[]): QueryConstraint;
  export function orderBy(...args: unknown[]): QueryConstraint;
  export function limit(...args: unknown[]): QueryConstraint;
  export function startAfter(...args: unknown[]): QueryConstraint;
  export function getDocs(ref: unknown): Promise<{ docs: Array<{ id: string; data(): Record<string, unknown> }> }>;
  export function onSnapshot(
    ref: unknown,
    next: (snapshot: DocumentSnapshot & { docs: Array<{ id: string; data(): Record<string, unknown> }> }) => void,
    error?: (error: Error) => void
  ): () => void;
  export function setLogLevel(level: string): void;
}

declare module 'firebase/analytics' {
  export function getAnalytics(app: unknown): unknown;
  export function isSupported(): Promise<boolean>;
}
