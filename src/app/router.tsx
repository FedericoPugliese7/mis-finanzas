import { lazy } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './layout/AppShell';

const DashboardPage = lazy(() => import('@/features/dashboard/dashboard.page'));
const TransactionsPage = lazy(() => import('@/features/transactions/transactions.page'));
const CategoriesPage = lazy(() => import('@/features/categories/categories.page'));
const SettingsPage = lazy(() => import('@/features/settings/settings.page'));

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
