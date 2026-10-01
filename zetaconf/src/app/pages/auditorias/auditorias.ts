import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuditLog, AuditLogService } from '../../services/audit-log.service';
import { SupabaseService } from '../../core/supabase.service';

const OPERATION_LABELS: Record<string, string> = {
  INSERT: 'Creación',
  UPDATE: 'Edición',
  DELETE: 'Eliminación'
};

@Component({
  selector: 'app-auditorias',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './auditorias.html',
  styleUrl: './auditorias.css'
})
export class Auditorias implements OnInit {
  logs = signal<AuditLog[]>([]);
  userNames = signal<Record<string, string>>({});
  loading = signal(true);
  errorMsg = signal('');
  operationLabels = OPERATION_LABELS;

  constructor(private auditLogService: AuditLogService, private supabase: SupabaseService) {}

  async ngOnInit() {
    this.loading.set(true);
    this.errorMsg.set('');
    try {
      const logs = await this.auditLogService.getAll();
      this.logs.set(logs);

      const userIds = Array.from(new Set(logs.map(l => l.user_id).filter((id): id is string => !!id)));
      if (userIds.length > 0) {
        const { data, error } = await this.supabase.client
          .from('profile')
          .select('user_id, full_name')
          .in('user_id', userIds);
        if (!error && data) {
          const map: Record<string, string> = {};
          for (const p of data as any[]) {
            map[p.user_id] = p.full_name;
          }
          this.userNames.set(map);
        }
      }
    } catch (err: any) {
      this.errorMsg.set('No se pudo cargar la auditoría: ' + err.message);
    } finally {
      this.loading.set(false);
    }
  }

  userName(userId: string | null): string {
    if (!userId) return 'Sistema (sin usuario autenticado)';
    return this.userNames()[userId] ?? 'Usuario desconocido';
  }

  // Línea completa ya armada aquí en TypeScript, para no anidar comillas ni ternarios en el HTML.
  recordDescription(log: AuditLog): string {
    if (log.table_name === 'profile') {
      const name = log.data_after?.full_name ?? log.data_before?.full_name;
      return 'Perfil: ' + (name ? name : log.record_id);
    }
    return 'Registro #' + log.record_id;
  }
}