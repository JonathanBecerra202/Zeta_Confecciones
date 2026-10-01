import { Injectable } from '@angular/core';
import { SupabaseService } from '../core/supabase.service';

export interface Measurement {
  measurement_id: number;
  back_width_ae: number | null;
  bust_circumference_cb: number | null;
  waist_circumference_cc: number | null;
  hip_circumference_ck: number | null;
  torso_length_lt: number | null;
  pants_length_lp: number | null;
  sleeve_length_lm: number | null;
  sleeve_circumference_cm: number | null;
  leg_circumference_cp: number | null;
  notes: string | null;
  taken_at: string;
  client_id: number;
}

export type MeasurementInsert = Pick<Measurement, 'client_id'> & Partial<Pick<Measurement, 'back_width_ae' | 'bust_circumference_cb' | 'waist_circumference_cc' | 'hip_circumference_ck' | 'torso_length_lt' | 'pants_length_lp' | 'sleeve_length_lm' | 'sleeve_circumference_cm' | 'leg_circumference_cp' | 'notes'>>;

export type MeasurementUpdate = Partial<Omit<Measurement, 'measurement_id' | 'client_id' | 'taken_at'>>;

@Injectable({
  providedIn: 'root'
})
export class MeasurementService {

  constructor(private supabase: SupabaseService) {}

  async getByClient(clientId: number): Promise<Measurement[]> {
    const { data, error } = await this.supabase.client
      .from('measurement')
      .select('*')
      .eq('client_id', clientId)
      .order('taken_at', { ascending: false });
    if (error) throw error;
    return data as Measurement[];
  }

  async getLatestByClient(clientId: number): Promise<Measurement | null> {
    const { data, error } = await this.supabase.client
      .from('measurement')
      .select('*')
      .eq('client_id', clientId)
      .order('taken_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data as Measurement | null;
  }

  async getById(measurementId: number): Promise<Measurement> {
    const { data, error } = await this.supabase.client
      .from('measurement')
      .select('*')
      .eq('measurement_id', measurementId)
      .single();
    if (error) throw error;
    return data as Measurement;
  }

  async create(measurement: MeasurementInsert): Promise<Measurement> {
    const { data, error } = await this.supabase.client
      .from('measurement')
      .insert(measurement)
      .select()
      .single();
    if (error) throw error;
    return data as Measurement;
  }

  async update(measurementId: number, changes: MeasurementUpdate): Promise<Measurement> {
    const { data, error } = await this.supabase.client
      .from('measurement')
      .update(changes)
      .eq('measurement_id', measurementId)
      .select()
      .single();
    if (error) throw error;
    return data as Measurement;
  }

  async delete(measurementId: number): Promise<void> {
    const { error } = await this.supabase.client
      .from('measurement')
      .delete()
      .eq('measurement_id', measurementId);
    if (error) throw error;
  }
}