import { Injectable } from '@angular/core';
import { SupabaseService } from '../core/supabase.service';

export type AuditOperation = 'INSERT' | 'UPDATE' | 'DELETE';

export interface AuditLog {
  audit_log_id: number;
  table_name: string;
  operation: AuditOperation;
  record_id: string;
  data_before: any;
  data_after: any;
  logged_at: string;
  user_id: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {

  constructor(private supabase: SupabaseService) {}

  async getAll(limit = 200): Promise<AuditLog[]> {
    const { data, error } = await this.supabase.client
      .from('audit_log')
      .select('*')
      .order('logged_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data as AuditLog[];
  }
}