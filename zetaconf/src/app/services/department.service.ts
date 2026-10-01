import { Injectable } from '@angular/core';
import { SupabaseService } from '../core/supabase.service';

export interface Department {
  department_id: number;
  name: string;
  created_at: string;
  organization_id: number;
}

export type DepartmentInsert = Pick<Department, 'name' | 'organization_id'>;
export type DepartmentUpdate = Partial<Pick<Department, 'name' | 'organization_id'>>;

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  constructor(private supabase: SupabaseService) {}

  async getAll(): Promise<Department[]> {
    const { data, error } = await this.supabase.client
      .from('department')
      .select('*')
      .order('name');
    if (error) throw error;
    return data as Department[];
  }

  async getByOrganization(organizationId: number): Promise<Department[]> {
    const { data, error } = await this.supabase.client
      .from('department')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name');
    if (error) throw error;
    return data as Department[];
  }

  async getById(departmentId: number): Promise<Department> {
    const { data, error } = await this.supabase.client
      .from('department')
      .select('*')
      .eq('department_id', departmentId)
      .single();
    if (error) throw error;
    return data as Department;
  }

  async create(dep: DepartmentInsert): Promise<Department> {
    const { data, error } = await this.supabase.client
      .from('department')
      .insert(dep)
      .select()
      .single();
    if (error) throw error;
    return data as Department;
  }

  async update(departmentId: number, changes: DepartmentUpdate): Promise<Department> {
    const { data, error } = await this.supabase.client
      .from('department')
      .update(changes)
      .eq('department_id', departmentId)
      .select()
      .single();
    if (error) throw error;
    return data as Department;
  }

  async delete(departmentId: number): Promise<void> {
    const { error } = await this.supabase.client
      .from('department')
      .delete()
      .eq('department_id', departmentId);
    if (error) throw error;
  }
}