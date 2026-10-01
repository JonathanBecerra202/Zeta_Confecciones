import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GarmentOrder } from '../../../../services/order.service';
import { Payment, PaymentService } from '../../../../services/payment.service';
import { formatCurrencyInput, parseCurrencyInput } from '../../../../shared/currency-utils';

@Component({
  selector: 'app-order-payments',
  standalone: true,
  imports: [DecimalPipe, DatePipe, FormsModule],
  templateUrl: './order-payments.html',
  styleUrl: './order-payments.css'
})
export class OrderPayments {
  @Input({ required: true }) order!: GarmentOrder;
  @Output() changed = new EventEmitter<void>();

  expanded = signal(false);
  payments = signal<Payment[]>([]);
  loading = signal(false);

  newAmountDisplay = signal('');
  newNote = signal('');
  saving = signal(false);
  errorMsg = signal('');

  constructor(private paymentService: PaymentService) {}

  async toggle() {
    this.expanded.update(v => !v);
    if (this.expanded() && this.payments().length === 0) {
      this.loading.set(true);
      try {
        this.payments.set(await this.paymentService.getByOrder(this.order.garment_order_id));
      } finally {
        this.loading.set(false);
      }
    }
  }

  saldo(): number {
    return this.order.balance_due ?? (this.order.total_price - this.order.amount_paid);
  }

  onAmountInput(value: string) {
    this.newAmountDisplay.set(formatCurrencyInput(value));
  }

  async addPayment() {
    const amount = parseCurrencyInput(this.newAmountDisplay());
    if (!amount || amount <= 0) {
      this.errorMsg.set('Ingresa un monto válido');
      return;
    }
    this.errorMsg.set('');
    this.saving.set(true);
    try {
      await this.paymentService.create({
        garment_order_id: this.order.garment_order_id,
        amount,
        note: this.newNote().trim() || null
      } as any);
      this.newAmountDisplay.set('');
      this.newNote.set('');
      this.payments.set(await this.paymentService.getByOrder(this.order.garment_order_id));
      this.changed.emit();
    } catch (err: any) {
      this.errorMsg.set(err.message ?? 'No se pudo registrar el abono');
    } finally {
      this.saving.set(false);
    }
  }
}