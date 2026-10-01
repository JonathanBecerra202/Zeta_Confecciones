import { Component, EventEmitter, Input, OnInit, Output, computed, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Client, ClientService } from '../../../services/client.service';
import { GarmentOrder, OrderService } from '../../../services/order.service';
import { Measurement, MeasurementService } from '../../../services/measurement.service';
import { Department } from '../../../services/department.service';
import { Organization } from '../../../services/organization.service';
import { RoleService } from '../../../core/role.service';
import { MedidaForm } from './medida-form/medida-form';
import { PedidoForm } from './pedido-form/pedido-form';
import { OrderPayments } from './order-payments/order-payments';

@Component({
  selector: 'app-cliente-detail',
  standalone: true,
  imports: [DecimalPipe, DatePipe, MedidaForm, PedidoForm, OrderPayments],
  templateUrl: './cliente-detail.html',
  styleUrl: './cliente-detail.css'
})
export class ClienteDetail implements OnInit {
  @Input({ required: true }) client!: Client;
  @Input() department: Department | undefined;
  @Input() organization: Organization | undefined;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() statusChanged = new EventEmitter<void>();

  orders = signal<GarmentOrder[]>([]);
  measurements = signal<Measurement[]>([]);
  loading = signal(true);
  togglingActive = signal(false);

  showMeasurementForm = signal(false);
  showMeasurementHistory = signal(false);
  showOrderForm = signal(false);
  editingOrder = signal<GarmentOrder | null>(null);

  statusLabels: Record<string, string> = {
    Pending: 'Pendiente',
    In_progress: 'En proceso',
    Delivered: 'Entregado',
    Cancelled: 'Cancelado'
  };

  paymentStatusLabels: Record<string, string> = {
    Pending: 'Pendiente',
    Paid: 'Pagado'
  };

  constructor(
    private orderService: OrderService,
    private measurementService: MeasurementService,
    private clientService: ClientService,
    public roleService: RoleService
  ) {}

  async ngOnInit() {
    await this.roleService.ensureLoaded();
    await this.loadAll();
  }

  async loadAll() {
    this.loading.set(true);
    try {
      const [orders, measurements] = await Promise.all([
        this.orderService.getByClient(this.client.client_id),
        this.measurementService.getByClient(this.client.client_id)
      ]);
      this.orders.set(orders);
      this.measurements.set(measurements);
    } finally {
      this.loading.set(false);
    }
  }

  fullName(): string {
    return [this.client.first_name, this.client.middle_name, this.client.last_name, this.client.second_last_name]
      .filter(Boolean).join(' ');
  }

  latestMeasurement(): Measurement | null {
    return this.measurements().length > 0 ? this.measurements()[0] : null;
  }

  pendingTotal = computed(() => {
    return this.orders().reduce((sum, o) => sum + (o.balance_due ?? (o.total_price - o.amount_paid)), 0);
  });

  saldoOf(o: GarmentOrder): number {
    return o.balance_due ?? (o.total_price - o.amount_paid);
  }

  async toggleActive() {
    this.togglingActive.set(true);
    try {
      await this.clientService.setActive(this.client.client_id, !this.client.active);
      this.statusChanged.emit();
      this.close.emit();
    } finally {
      this.togglingActive.set(false);
    }
  }

  openNewOrder() {
    this.editingOrder.set(null);
    this.showOrderForm.set(true);
  }

  openEditOrder(o: GarmentOrder) {
    this.editingOrder.set(o);
    this.showOrderForm.set(true);
  }

  async onOrderSaved() {
    this.showOrderForm.set(false);
    this.editingOrder.set(null);
    await this.loadAll();
  }

  async deleteOrder(o: GarmentOrder) {
    if (!confirm('¿Eliminar este pedido? Esta acción no se puede deshacer.')) return;
    try {
      await this.orderService.delete(o.garment_order_id);
      await this.loadAll();
    } catch (err: any) {
      alert('No se pudo eliminar: ' + err.message);
    }
  }

  async onMeasurementSaved() {
    this.showMeasurementForm.set(false);
    await this.loadAll();
  }
}