import { Injectable } from '@angular/core';
import { SupabaseService } from '../core/supabase.service';

export type OrderStatus = 'Pending' | 'In_progress' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid';

export interface GarmentOrder {
  garment_order_id: number;
  description: string;
  total_price: number;
  amount_paid: number;
  balance_due: number | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  created_at: string;
  delivery_date: string | null;
  notes: string | null;
  quantity: number;
  unit_price: number;
  embroidery: boolean;
  client_id: number;
  measurement_id: number | null;
}

export type OrderInsert = Pick<GarmentOrder, 'description' | 'unit_price' | 'client_id'> & Partial<Pick<GarmentOrder, 'quantity' | 'delivery_date' | 'notes' | 'measurement_id' | 'status' | 'embroidery'>>;

export type OrderUpdate = Partial<Pick<GarmentOrder, 'description' | 'unit_price' | 'quantity' | 'delivery_date' | 'notes' | 'status' | 'measurement_id' | 'embroidery'>>;

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private supabase: SupabaseService) {}

  async getAll(): Promise<GarmentOrder[]> {
    const { data, error } = await this.supabase.client
      .from('garment_order')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as GarmentOrder[];
  }

  async getByClient(clientId: number): Promise<GarmentOrder[]> {
    const { data, error } = await this.supabase.client
      .from('garment_order')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as GarmentOrder[];
  }

  async getById(garmentOrderId: number): Promise<GarmentOrder> {
    const { data, error } = await this.supabase.client
      .from('garment_order')
      .select('*')
      .eq('garment_order_id', garmentOrderId)
      .single();
    if (error) throw error;
    return data as GarmentOrder;
  }

  async create(order: OrderInsert): Promise<GarmentOrder> {
    const { data, error } = await this.supabase.client
      .from('garment_order')
      .insert(order)
      .select()
      .single();
    if (error) throw error;
    return data as GarmentOrder;
  }

  async update(garmentOrderId: number, changes: OrderUpdate): Promise<GarmentOrder> {
    const { data, error } = await this.supabase.client
      .from('garment_order')
      .update(changes)
      .eq('garment_order_id', garmentOrderId)
      .select()
      .single();
    if (error) throw error;
    return data as GarmentOrder;
  }

  async delete(garmentOrderId: number): Promise<void> {
    const { error } = await this.supabase.client
      .from('garment_order')
      .delete()
      .eq('garment_order_id', garmentOrderId);
    if (error) throw error;
  }
}