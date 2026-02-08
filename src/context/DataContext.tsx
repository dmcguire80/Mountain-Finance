import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import {
    collection,
    doc,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    orderBy,
    where,
    Timestamp,
    writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import type { Account, Entry } from '../types';

interface DataContextType {
    accounts: Account[];
    entries: Entry[];
    loading: boolean;
    error: string | null;
    // Account operations
    addAccount: (name: string, accountType?: string) => Promise<string>;
    updateAccount: (id: string, data: Partial<Account>) => Promise<void>;
    deleteAccount: (id: string) => Promise<void>;
    toggleAccountActive: (id: string) => Promise<void>;
    // Entry operations
    addEntry: (accountId: string, value: number, date: Date, notes?: string) => Promise<void>;
    addEntries: (
        entries: { accountId: string; value: number; date: Date; notes?: string }[]
    ) => Promise<void>;
    updateEntry: (id: string, data: Partial<Entry>) => Promise<void>;
    deleteEntry: (id: string) => Promise<void>;
    // Utility
    getActiveAccounts: () => Account[];
    getEntriesForAccount: (accountId: string) => Entry[];
}

const DataContext = createContext<DataContextType | null>(null);

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}

interface DataProviderProps {
    children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [entries, setEntries] = useState<Entry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Subscribe to accounts
    useEffect(() => {
        if (!user) {
            setAccounts([]);
            setEntries([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const accountsRef = collection(db, 'users', user.uid, 'accounts');
        const accountsQuery = query(accountsRef, orderBy('name'));

        const unsubscribe = onSnapshot(
            accountsQuery,
            (snapshot) => {
                const accountsData: Account[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    name: doc.data().name,
                    accountType: doc.data().accountType || null,
                    isActive: doc.data().isActive ?? true,
                    createdAt: doc.data().createdAt?.toDate() || new Date(),
                }));
                setAccounts(accountsData);
                setLoading(false);
            },
            (err) => {
                console.error('Error fetching accounts:', err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    // Subscribe to entries
    useEffect(() => {
        if (!user) {
            return;
        }

        const entriesRef = collection(db, 'users', user.uid, 'entries');
        const entriesQuery = query(entriesRef, orderBy('entryDate', 'desc'));

        const unsubscribe = onSnapshot(
            entriesQuery,
            (snapshot) => {
                const entriesData: Entry[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    accountId: doc.data().accountId,
                    value: doc.data().value,
                    entryDate: doc.data().entryDate?.toDate() || new Date(),
                    notes: doc.data().notes || null,
                    createdAt: doc.data().createdAt?.toDate() || new Date(),
                }));
                setEntries(entriesData);
            },
            (err) => {
                console.error('Error fetching entries:', err);
                setError(err.message);
            }
        );

        return () => unsubscribe();
    }, [user]);

    // Account operations
    const addAccount = useCallback(
        async (name: string, accountType?: string): Promise<string> => {
            if (!user) throw new Error('Not authenticated');
            const accountsRef = collection(db, 'users', user.uid, 'accounts');
            const docRef = await addDoc(accountsRef, {
                name,
                accountType: accountType || null,
                isActive: true,
                createdAt: Timestamp.now(),
            });
            return docRef.id;
        },
        [user]
    );

    const updateAccount = useCallback(
        async (id: string, data: Partial<Account>) => {
            if (!user) throw new Error('Not authenticated');
            const accountRef = doc(db, 'users', user.uid, 'accounts', id);
            await updateDoc(accountRef, data);
        },
        [user]
    );

    const deleteAccount = useCallback(
        async (id: string) => {
            if (!user) throw new Error('Not authenticated');

            // Delete all entries for this account first
            const entriesRef = collection(db, 'users', user.uid, 'entries');
            const entriesQuery = query(entriesRef, where('accountId', '==', id));
            const snapshot = await getDocs(entriesQuery);

            if (!snapshot.empty) {
                const batch = writeBatch(db);
                snapshot.docs.forEach((entryDoc) => batch.delete(entryDoc.ref));
                await batch.commit();
            }

            const accountRef = doc(db, 'users', user.uid, 'accounts', id);
            await deleteDoc(accountRef);
        },
        [user]
    );

    const toggleAccountActive = useCallback(
        async (id: string) => {
            const account = accounts.find((a) => a.id === id);
            if (!account) return;
            await updateAccount(id, { isActive: !account.isActive });
        },
        [accounts, updateAccount]
    );

    // Entry operations
    const addEntry = useCallback(
        async (accountId: string, value: number, date: Date, notes?: string) => {
            if (!user) throw new Error('Not authenticated');
            const entriesRef = collection(db, 'users', user.uid, 'entries');
            await addDoc(entriesRef, {
                accountId,
                value,
                entryDate: Timestamp.fromDate(date),
                notes: notes || null,
                createdAt: Timestamp.now(),
            });
        },
        [user]
    );

    const addEntries = useCallback(
        async (entriesData: { accountId: string; value: number; date: Date; notes?: string }[]) => {
            if (!user) throw new Error('Not authenticated');
            const batch = writeBatch(db);
            const entriesRef = collection(db, 'users', user.uid, 'entries');

            for (const entry of entriesData) {
                const docRef = doc(entriesRef);
                batch.set(docRef, {
                    accountId: entry.accountId,
                    value: entry.value,
                    entryDate: Timestamp.fromDate(entry.date),
                    notes: entry.notes || null,
                    createdAt: Timestamp.now(),
                });
            }

            await batch.commit();
        },
        [user]
    );

    const updateEntry = useCallback(
        async (id: string, data: Partial<Entry>) => {
            if (!user) throw new Error('Not authenticated');
            const entryRef = doc(db, 'users', user.uid, 'entries', id);
            const updateData: Record<string, unknown> = { ...data };
            if (data.entryDate) {
                updateData.entryDate = Timestamp.fromDate(data.entryDate);
            }
            await updateDoc(entryRef, updateData);
        },
        [user]
    );

    const deleteEntry = useCallback(
        async (id: string) => {
            if (!user) throw new Error('Not authenticated');
            const entryRef = doc(db, 'users', user.uid, 'entries', id);
            await deleteDoc(entryRef);
        },
        [user]
    );

    // Utility functions
    const getActiveAccounts = useCallback(() => {
        return accounts.filter((a) => a.isActive);
    }, [accounts]);

    const getEntriesForAccount = useCallback(
        (accountId: string) => {
            return entries.filter((e) => e.accountId === accountId);
        },
        [entries]
    );

    const value: DataContextType = {
        accounts,
        entries,
        loading,
        error,
        addAccount,
        updateAccount,
        deleteAccount,
        toggleAccountActive,
        addEntry,
        addEntries,
        updateEntry,
        deleteEntry,
        getActiveAccounts,
        getEntriesForAccount,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
