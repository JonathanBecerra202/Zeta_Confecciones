import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { GarmentOrder, OrderService, OrderStatus } from '../../../../services/order.service';
import { Measurement } from '../../../../services/measurement.service';
import { formatCurrencyInput, parseCurrencyInput } from '../../../../shared/currency-utils';

const STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: 'Pendiente',
  In_progress: 'En proceso',
  Delivered: 'Entregado',
  Cancelled: 'Cancelado'
};

@Component({
  selector: 'app-pedido-form',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './pedido-form.html',
  styleUrl: './pedido-form.css'
})
export class PedidoForm implements OnInit {
  @Input({ required: true }) clientId!: number;
  @Input() measurements: Measurement[] = [];
  @Input() initial: GarmentOrder | null = null;
  @Input() isAdmin = false;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  description = signal('');
  quantity = signal('1');
  unitPriceDisplay = signal('');
  deliveryDate = signal('');
  notes = signal('');
  measurementId = signal<number | null>(null);
  embroidery = signal(false);
  status = signal<OrderStatus>('Pending');

  statusLabels = STATUS_LABELS;
  statusOptions: OrderStatus[] = ['Pending', 'In_progress', 'Delivered', 'Cancelled'];

  saving = signal(false);
  errorMsg = signal('');

  minDeliveryDate = new Date().toISOString().split('T')[0];

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    if (this.initial) {
      const o = this.initial;
      this.description.set(o.description);
      this.quantity.set(String(o.quantity));
      this.unitPriceDisplay.set(formatCurrencyInput(String(o.unit_price)));
      this.deliveryDate.set(o.delivery_date ?? '');
      this.notes.set(o.notes ?? '');
      this.measurementId.set(o.measurement_id);
      this.embroidery.set(o.embroidery);
      this.status.set(o.status);
    } else if (this.measurements.length > 0) {
      this.measurementId.set(this.measurements[0].measurement_id);
    }
  }

  get priceLocked(): boolean {
    return !!this.initial && !this.isAdmin;
  }

  onUnitPriceInput(value: string) {
    if (this.priceLocked) return;
    this.unitPriceDisplay.set(formatCurrencyInput(value));
  }

  async onSubmit() {
    const unitPrice = parseCurrencyInput(this.unitPriceDisplay());
    if (!this.description().trim() || !unitPrice) {
      this.errorMsg.set('Descripción y precio unitario son obligatorios');
      return;
    }
    this.errorMsg.set('');
    this.saving.set(true);
    try {
      const payload: any = {
        description: this.description().trim(),
        quantity: Number(this.quantity()) || 1,
        delivery_date: this.deliveryDate() || null,
        notes: this.notes().trim() || null,
        measurement_id: this.measurementId(),
        embroidery: this.embroidery(),
        status: this.status()
      };

      if (!this.priceLocked) {
        payload.unit_price = unitPrice;
      }

      if (this.initial) {
        await this.orderService.update(this.initial.garment_order_id, payload);
      } else {
        payload.unit_price = unitPrice;
        payload.client_id = this.clientId;
        await this.orderService.create(payload);
      }
      this.saved.emit();
    } catch (err: any) {
      this.errorMsg.set('No se pudo guardar el pedido: ' + err.message);
    } finally {
      this.saving.set(false);
    }
  }
}