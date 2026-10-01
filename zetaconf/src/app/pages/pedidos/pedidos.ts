import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { GarmentOrder, OrderService, OrderStatus } from '../../services/order.service';
import { Client, ClientService } from '../../services/client.service';
import { matchesSearch } from '../../shared/text-utils';

const STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: 'Pendiente',
  In_progress: 'En proceso',
  Delivered: 'Entregado',
  Cancelled: 'Cancelado'
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  Pending: 'Pendiente',
  Paid: 'Pagado'
};

function statusRank(status: OrderStatus): number {
  if (status === 'Delivered' || status === 'Cancelled') return 2;
  return 0;
}

function withinStatusPriority(status: OrderStatus): number {
  return status === 'In_progress' ? 0 : 1;
}

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [FormsModule, DecimalPipe, DatePipe],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.css'
})
export class Pedidos implements OnInit {
  orders = signal<GarmentOrder[]>([]);
  clients = signal<Client[]>([]);
  loading = signal(true);
  errorMsg = signal('');

  searchQuery = signal('');
  statusFilter = signal<OrderStatus | 'Todos'>('Todos');

  statusLabels = STATUS_LABELS;
  paymentStatusLabels = PAYMENT_STATUS_LABELS;
  statuses: (OrderStatus | 'Todos')[] = ['Todos', 'Pending', 'In_progress', 'Delivered', 'Cancelled'];

  constructor(private orderService: OrderService, private clientService: ClientService) {}

  async ngOnInit() {
    await this.loadAll();
  }

  async loadAll() {
    this.loading.set(true);
    this.errorMsg.set('');
    try {
      const [orders, clients] = await Promise.all([
        this.orderService.getAll(),
        this.clientService.getAll()
      ]);
      this.orders.set(orders);
      this.clients.set(clients);
    } catch (err: any) {
      this.errorMsg.set('No se pudieron cargar los pedidos: ' + err.message);
    } finally {
      this.loading.set(false);
    }
  }

  clientName(clientId: number): string {
    const c = this.clients().find(cl => cl.client_id === clientId);
    if (!c) return '—';
    return [c.first_name, c.middle_name, c.last_name, c.second_last_name].filter(Boolean).join(' ');
  }

  saldoOf(o: GarmentOrder): number {
    return o.balance_due ?? (o.total_price - o.amount_paid);
  }

  filtered(): GarmentOrder[] {
    const q = this.searchQuery();
    const status = this.statusFilter();

    let result = this.orders().filter(o => {
      if (status !== 'Todos' && o.status !== status) return false;
      if (q) {
        const haystack = this.clientName(o.client_id) + ' ' + o.description;
        if (!matchesSearch(haystack, q)) return false;
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      const rankA = statusRank(a.status);
      const rankB = statusRank(b.status);
      if (rankA !== rankB) return rankA - rankB;

      const dateA = a.delivery_date;
      const dateB = b.delivery_date;
      if (dateA && !dateB) return -1;
      if (!dateA && dateB) return 1;
      if (dateA && dateB && dateA !== dateB) return dateA < dateB ? -1 : 1;

      const prioA = withinStatusPriority(a.status);
      const prioB = withinStatusPriority(b.status);
      if (prioA !== prioB) return prioA - prioB;

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }
}