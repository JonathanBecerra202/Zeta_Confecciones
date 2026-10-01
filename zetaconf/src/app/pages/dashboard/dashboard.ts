import { Component, OnInit, computed, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Client, ClientService } from '../../services/client.service';
import { GarmentOrder, OrderService } from '../../services/order.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  clients = signal<Client[]>([]);
  orders = signal<GarmentOrder[]>([]);
  loading = signal(true);
  errorMsg = signal('');

  constructor(private clientService: ClientService, private orderService: OrderService) {}

  async ngOnInit() {
    this.loading.set(true);
    this.errorMsg.set('');
    try {
      const [clients, orders] = await Promise.all([
        this.clientService.getAll(),
        this.orderService.getAll()
      ]);
      this.clients.set(clients);
      this.orders.set(orders);
    } catch (err: any) {
      this.errorMsg.set('No se pudo cargar el resumen: ' + err.message);
    } finally {
      this.loading.set(false);
    }
  }

  activeClients = computed(() => this.clients().filter(c => c.active).length);

  pendingOrders = computed(() =>
    this.orders().filter(o => o.status === 'Pending' || o.status === 'In_progress')
  );

  ordersWithBalance = computed(() =>
    this.orders().filter(o => (o.balance_due ?? (o.total_price - o.amount_paid)) > 0 && o.status !== 'Cancelled')
  );

  totalPendingBalance = computed(() =>
    this.ordersWithBalance().reduce((sum, o) => sum + (o.balance_due ?? (o.total_price - o.amount_paid)), 0)
  );

  upcomingDeliveries = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.orders()
      .filter(o => o.delivery_date && o.delivery_date >= today && o.status !== 'Delivered' && o.status !== 'Cancelled')
      .sort((a, b) => (a.delivery_date! < b.delivery_date! ? -1 : 1))
      .slice(0, 5);
  });

  overdueOrders = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.orders()
      .filter(o => o.delivery_date && o.delivery_date < today && o.status !== 'Delivered' && o.status !== 'Cancelled')
      .sort((a, b) => (a.delivery_date! < b.delivery_date! ? -1 : 1));
  });

  clientName(clientId: number): string {
    const c = this.clients().find(cl => cl.client_id === clientId);
    if (!c) return '—';
    return [c.first_name, c.middle_name, c.last_name, c.second_last_name].filter(Boolean).join(' ');
  }

  saldoOf(o: GarmentOrder): number {
    return o.balance_due ?? (o.total_price - o.amount_paid);
  }
}