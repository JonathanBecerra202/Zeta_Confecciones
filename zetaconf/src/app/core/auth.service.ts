import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private supabase: SupabaseService) {}

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.client.auth.signOut();
    if (error) throw error;
  }

  async getSession() {
    const { data } = await this.supabase.client.auth.getSession();
    return data.session;
  }

  async isLoggedIn(): Promise<boolean> {
    const session = await this.getSession();
    return session !== null;
  }
}