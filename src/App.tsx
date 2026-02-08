import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { ManageAccounts } from './pages/ManageAccounts';
import { DataEntry } from './pages/DataEntry';
import { History } from './pages/History';
import { Import } from './pages/Import';
import { Settings } from './pages/Settings';
import { AccountDetail } from './pages/AccountDetail';

export default function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Dashboard />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/account/:id"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <AccountDetail />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/accounts"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <ManageAccounts />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/add-entry"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <DataEntry />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/history"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <History />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/import"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Import />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Settings />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            {/* Catch-all: redirect unknown routes to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
