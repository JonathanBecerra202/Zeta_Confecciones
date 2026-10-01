import { Injectable } from '@angular/core';
import { SupabaseService } from '../core/supabase.service';

export interface Client {
  client_id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  second_last_name: string | null;
  phone: string | null;
  active: boolean;
  registered_at: string;
  updated_at: string;
  department_id: number | null;
}

export type ClientInsert = Pick<Client, 'first_name' | 'last_name'> & Partial<Pick<Client, 'middle_name' | 'second_last_name' | 'phone' | 'department_id'>>;

export type ClientUpdate = Partial<Pick<Client, 'first_name' | 'middle_name' | 'last_name' | 'second_last_name' | 'phone' | 'department_id' | 'active'>>;

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private supabase: SupabaseService) {}

  async getAll(): Promise<Client[]> {
    const { data, error } = await this.supabase.client
      .from('client')
      .select('*')
      .order('first_name');
    if (error) throw error;
    return data as Client[];
  }

  async getById(clientId: number): Promise<Client> {
    const { data, error } = await this.supabase.client
      .from('client')
      .select('*')
      .eq('client_id', clientId)
      .single();
    if (error) throw error;
    return data as Client;
  }

  async getByDepartment(departmentId: number): Promise<Client[]> {
    const { data, error } = await this.supabase.client
      .from('client')
      .select('*')
      .eq('department_id', departmentId);
    if (error) throw error;
    return data as Client[];
  }

  async create(client: ClientInsert): Promise<Client> {
    const { data, error } = await this.supabase.client
      .from('client')
      .insert(client)
      .select()
      .single();
    if (error) throw error;
    return data as Client;
  }

  async update(clientId: number, changes: ClientUpdate): Promise<Client> {
    const { data, error } = await this.supabase.client
      .from('client')
      .update(changes)
      .eq('client_id', clientId)
      .select()
      .single();
    if (error) throw error;
    return data as Client;
  }

  async setActive(clientId: number, active: boolean): Promise<Client> {
    return this.update(clientId, { active });
  }

  async delete(clientId: number): Promise<void> {
    const { error } = await this.supabase.client
      .from('client')
      .delete()
      .eq('client_id', clientId);
    if (error) throw error;
  }
}