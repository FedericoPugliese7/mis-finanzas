import { useRef, useState } from 'react';
import { Archive, Download, FileInput, Trash2, Upload } from 'lucide-react';
import type { Settings } from '@/shared/lib/types';
import type { ImportMode, ImportPlan } from '@/shared/lib/backup';
import { backupRepo } from '@/shared/db/repos/backup.repo';
import { categoriesRepo } from '@/shared/db/repos/categories.repo';
import { transactionsRepo } from '@/shared/db/repos/transactions.repo';
import { generateDemoTransactions } from '@/shared/lib/demo-data';
import { parseBackup, backupFileName, buildImportPlan } from '@/shared/lib/backup';
import { transactionsToCsv } from '@/shared/lib/csv';
import { downloadFile } from '@/shared/lib/download';
import { useUiStore } from '@/shared/stores/ui.store';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Dialog } from '@/shared/ui/dialog';

interface BackupSectionProps {
  settings: Settings;
  onUpdate: (patch: Partial<Settings>) => Promise<unknown>;
}

export function BackupSection({ settings: _settings, onUpdate }: BackupSectionProps) {
  const show = useUiStore((state) => state.show);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importMode, setImportMode] = useState<ImportMode>('merge');
  const [pendingImportPlan, setPendingImportPlan] = useState<ImportPlan | null>(null);
  const [demoDialogOpen, setDemoDialogOpen] = useState(false);
  const [dangerDialogOpen, setDangerDialogOpen] = useState(false);

  const handleExportJson = async () => {
    try {
      const backup = await backupRepo.exportAll();
      const raw = JSON.stringify(backup, null, 2);
      downloadFile(backupFileName(), raw, 'application/json');
      show({ message: 'Backup JSON exportado correctamente.' });
    } catch {
      show({ message: 'No se pudo generar el backup JSON.' });
    }
  };

  const handleExportCsv = async () => {
    try {
      const [transactions, categories] = await Promise.all([
        transactionsRepo.getAll(),
        categoriesRepo.getAll()
      ]);
      const csv = transactionsToCsv(transactions, categories);
      downloadFile(
        `mis-finanzas-movimientos-${new Date().toISOString().split('T')[0]}.csv`,
        csv,
        'text/csv'
      );
      show({ message: 'CSV exportado correctamente.' });
    } catch {
      show({ message: 'No se pudo generar el CSV.' });
    }
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    event.target.value = '';

    try {
      const backup = parseBackup(text);
      const [currentTransactions, currentCategories] = await Promise.all([
        transactionsRepo.getAll(),
        categoriesRepo.getAll()
      ]);

      const mergePlan = buildImportPlan(
        backup,
        { transactions: currentTransactions, categories: currentCategories },
        'merge'
      );

      setPendingImportPlan(mergePlan);
      setImportMode('merge');
      setImportDialogOpen(true);
    } catch (err) {
      if (err instanceof Error) {
        show({ message: err.message });
      } else {
        show({ message: 'El archivo seleccionado no es un backup válido.' });
      }
    }
  };

  const handleImportConfirm = async () => {
    if (!pendingImportPlan) return;

    try {
      await backupRepo.apply(pendingImportPlan);
      show({
        message: `Backup importado (${pendingImportPlan.counts.transactions} movimientos, ${pendingImportPlan.counts.categories} categorías).`
      });
      setImportDialogOpen(false);
      setPendingImportPlan(null);
    } catch {
      show({ message: 'No se pudo aplicar el backup.' });
    }
  };

  const handleDemoLoad = async () => {
    try {
      const categories = await categoriesRepo.getAll();
      const demoTxs = generateDemoTransactions(categories);
      if (demoTxs.length === 0) {
        show({
          message: 'Primero creá al menos una categoría de ingreso y una de gasto.'
        });
        return;
      }
      await backupRepo.insertDemo(demoTxs);
      show({ message: `${demoTxs.length} movimientos de ejemplo generados.` });
    } catch {
      show({ message: 'No se pudieron generar los datos de ejemplo.' });
    }
  };

  const handleClearAll = async () => {
    try {
      await backupRepo.clearAll();
      // Sync runtime stores with reset defaults
      onUpdate({
        theme: 'system',
        displayCurrency: 'ARS',
        referenceRate: 1000,
        rateSource: 'dolarapi'
      });
      show({ message: 'Datos restablecidos a valores de fábrica.' });
    } catch {
      show({ message: 'No se pudo restablecer la aplicación.' });
    }
  };

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-content">Backup y Datos</h2>
      <p className="mt-1 text-sm text-content-secondary">
        Exportá, importá o restablecé tus datos. El backup JSON incluye todo: movimientos,
        categorías y ajustes.
      </p>

      <div className="mt-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleExportJson}>
            <Download size={16} aria-hidden /> Exportar JSON
          </Button>
          <Button variant="secondary" onClick={handleExportCsv}>
            <FileInput size={16} aria-hidden /> Exportar CSV
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="import-file" className="sr-only">
            Importar archivo de backup JSON
          </label>
          <input
            ref={fileInputRef}
            id="import-file"
            type="file"
            accept=".json,application/json"
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
            onChange={handleFileSelected}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} aria-hidden /> Importar JSON
          </Button>
        </div>

        <div className="border-t border-border pt-4 space-y-4">
          <h3 className="text-sm font-medium text-content">Datos de ejemplo</h3>
          <p className="text-xs text-content-muted">
            Genera ~500 movimientos realistas (últimos 12 meses) para probar gráficos y
            rendimiento.
          </p>
          <Button variant="secondary" onClick={() => setDemoDialogOpen(true)}>
            <Archive size={16} aria-hidden /> Cargar datos de ejemplo
          </Button>
        </div>

        <div className="border-t border-border pt-4 space-y-4 text-danger">
          <h3 className="text-sm font-medium text-content">Zona de peligro</h3>
          <p className="text-xs text-content-muted">
            Borra todos los movimientos y categorías, y restablece los ajustes a valores
            de fábrica.
            <strong>Esta acción no se puede deshacer.</strong>
          </p>
          <Button variant="danger" onClick={() => setDangerDialogOpen(true)}>
            <Trash2 size={16} aria-hidden /> Borrar todos los datos
          </Button>
        </div>
      </div>

      {/* Import dialog */}
      <Dialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        title="Importar backup"
        description={
          pendingImportPlan
            ? `Se encontraron ${pendingImportPlan.counts.transactions + pendingImportPlan.counts.transactionsSkipped} movimientos y ${pendingImportPlan.counts.categories + pendingImportPlan.counts.categoriesSkipped} categorías en el archivo.`
            : ''
        }
      >
        {pendingImportPlan && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label id="import-mode-label" className="text-sm font-medium text-content">
                Modo de importación
              </label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-1.5 text-sm text-content">
                  <input
                    type="radio"
                    name="import-mode"
                    checked={importMode === 'merge'}
                    onChange={() => {
                      setImportMode('merge');
                      const newPlan = buildImportPlan(
                        {
                          schemaVersion: 1,
                          exportedAt: new Date().toISOString(),
                          transactions: pendingImportPlan.transactions.concat(
                            pendingImportPlan.counts.transactionsSkipped > 0
                              ? [] // placeholder - we don't have skipped ones
                              : []
                          ),
                          categories: pendingImportPlan.categories,
                          settings: pendingImportPlan.settings ?? {
                            theme: 'system',
                            displayCurrency: 'ARS',
                            referenceRate: 1000,
                            rateSource: 'dolarapi'
                          }
                        },
                        {
                          transactions: pendingImportPlan.transactions,
                          categories: pendingImportPlan.categories
                        },
                        'merge'
                      );
                      setPendingImportPlan(newPlan);
                    }}
                  />
                  Fusionar (añade solo lo nuevo, conserva tus ajustes)
                </label>
                <label className="flex items-center gap-1.5 text-sm text-content">
                  <input
                    type="radio"
                    name="import-mode"
                    checked={importMode === 'replace'}
                    onChange={() => {
                      setImportMode('replace');
                      const newPlan = buildImportPlan(
                        {
                          schemaVersion: 1,
                          exportedAt: new Date().toISOString(),
                          transactions: pendingImportPlan.transactions.concat(
                            pendingImportPlan.counts.transactionsSkipped > 0 ? [] : []
                          ),
                          categories: pendingImportPlan.categories,
                          settings: pendingImportPlan.settings ?? {
                            theme: 'system',
                            displayCurrency: 'ARS',
                            referenceRate: 1000,
                            rateSource: 'dolarapi'
                          }
                        },
                        {
                          transactions: pendingImportPlan.transactions,
                          categories: pendingImportPlan.categories
                        },
                        'replace'
                      );
                      setPendingImportPlan(newPlan);
                    }}
                  />
                  Reemplazar (borra todo y usa el backup, incluyendo ajustes)
                </label>
              </div>
            </div>

            <div className="rounded-card border border-border bg-background-subtle p-3 text-xs text-content-secondary">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-semibold text-content">Nuevos:</span>{' '}
                  {pendingImportPlan.counts.transactions} movimientos,
                  {pendingImportPlan.counts.categories} categorías
                </div>
                <div>
                  <span className="font-semibold text-content">
                    Existentes (omitidos):
                  </span>{' '}
                  {pendingImportPlan.counts.transactionsSkipped} movimientos,
                  {pendingImportPlan.counts.categoriesSkipped} categorías
                </div>
              </div>
              {pendingImportPlan.settings && (
                <p className="mt-1 text-warning">
                  Los ajustes del backup <strong>sobreescribirán</strong> los actuales.
                </p>
              )}
              {!pendingImportPlan.settings && (
                <p className="mt-1">Tus ajustes actuales se conservan.</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setImportDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleImportConfirm}>Importar</Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Demo confirm dialog */}
      <Dialog
        open={demoDialogOpen}
        onOpenChange={setDemoDialogOpen}
        title="Cargar datos de ejemplo"
        description="Se generarán ~500 movimientos de los últimos 12 meses. Si ya tenés datos, se añadirán (no se borran los existentes)."
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => setDemoDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDemoLoad}>Generar y cargar</Button>
        </div>
      </Dialog>

      {/* Danger confirm dialog */}
      <Dialog
        open={dangerDialogOpen}
        onOpenChange={setDangerDialogOpen}
        title="¿Borrar todo?"
        description="Se eliminarán todos tus movimientos y categorías, y los ajustes volverán a los valores de fábrica. No hay forma de revertir esto."
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => setDangerDialogOpen(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleClearAll}>
            Sí, borrar todo
          </Button>
        </div>
      </Dialog>
    </Card>
  );
}
