import { Injectable } from '@angular/core';
import { SupabaseService } from '../core/supabase.service';

export interface Payment {
  payment_id: number;
  amount: number;
  note: string | null;
  paid_at: string;
  garment_order_id: number;
}

export type PaymentInsert = Pick<Payment, 'amount' | 'garment_order_id'> & Partial<Pick<Payment, 'note'>>;
export type PaymentUpdate = Partial<Pick<Payment, 'amount' | 'note'>>;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private supabase: SupabaseService) {}

  async getByOrder(garmentOrderId: number): Promise<Payment[]> {
    const { data, error } = await this.supabase.client
      .from('payment')
      .select('*')
      .eq('garment_order_id', garmentOrderId)
      .order('paid_at', { ascending: false });
    if (error) throw error;
    return data as Payment[];
  }

  async getById(paymentId: number): Promise<Payment> {
    const { data, error } = await this.supabase.client
      .from('payment')
      .select('*')
      .eq('payment_id', paymentId)
      .single();
    if (error) throw error;
    return data as Payment;
  }

  async create(payment: PaymentInsert): Promise<Payment> {
    const { data, error } = await this.supabase.client
      .from('payment')
      .insert(payment)
      .select()
      .single();
    if (error) throw error;
    return data as Payment;
  }

  async update(paymentId: number, changes: PaymentUpdate): Promise<Payment> {
    const { data, error } = await this.supabase.client
      .from('payment')
      .update(changes)
      .eq('payment_id', paymentId)
      .select()
      .single();
    if (error) throw error;
    return data as Payment;
  }

  async delete(paymentId: number): Promise<void> {
    const { error } = await this.supabase.client
      .from('payment')
      .delete()
      .eq('payment_id', paymentId);
    if (error) throw error;
  }
}