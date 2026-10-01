import { Injectable } from '@angular/core';
import { SupabaseService } from '../core/supabase.service';

export interface Organization {
  organization_id: number;
  name: string;
  created_at: string;
}

export type OrganizationInsert = Pick<Organization, 'name'>;
export type OrganizationUpdate = Partial<Pick<Organization, 'name'>>;

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

  constructor(private supabase: SupabaseService) {}

  async getAll(): Promise<Organization[]> {
    const { data, error } = await this.supabase.client
      .from('organization')
      .select('*')
      .order('name');
    if (error) throw error;
    return data as Organization[];
  }

  async getById(organizationId: number): Promise<Organization> {
    const { data, error } = await this.supabase.client
      .from('organization')
      .select('*')
      .eq('organization_id', organizationId)
      .single();
    if (error) throw error;
    return data as Organization;
  }

  async create(org: OrganizationInsert): Promise<Organization> {
    const { data, error } = await this.supabase.client
      .from('organization')
      .insert(org)
      .select()
      .single();
    if (error) throw error;
    return data as Organization;
  }

  async update(organizationId: number, changes: OrganizationUpdate): Promise<Organization> {
    const { data, error } = await this.supabase.client
      .from('organization')
      .update(changes)
      .eq('organization_id', organizationId)
      .select()
      .single();
    if (error) throw error;
    return data as Organization;
  }

  async delete(organizationId: number): Promise<void> {
    const { error } = await this.supabase.client
      .from('organization')
      .delete()
      .eq('organization_id', organizationId);
    if (error) throw error;
  }
}