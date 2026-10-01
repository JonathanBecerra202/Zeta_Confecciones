import { Injectable } from '@angular/core';
import { SupabaseService } from '../core/supabase.service';
import { AuthService } from '../core/auth.service';

export interface CurrentProfile {
  user_id: string;
  full_name: string;
  role_name: 'Admin' | 'Employee';
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private supabase: SupabaseService, private authService: AuthService) {}

  async getCurrentProfile(): Promise<CurrentProfile> {
    const session = await this.authService.getSession();
    if (!session) {
      throw new Error('No hay sesión activa');
    }
    const userId = session.user.id;

    const { data, error } = await this.supabase.client
      .from('profile')
      .select('user_id, full_name, role:role_id(name)')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return {
      user_id: data['user_id'],
      full_name: data['full_name'],
      role_name: (data['role'] as any).name
    };
  }
}