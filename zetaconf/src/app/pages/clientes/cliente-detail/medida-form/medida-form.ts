import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MeasurementService } from '../../../../services/measurement.service';

@Component({
  selector: 'app-medida-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './medida-form.html',
  styleUrl: './medida-form.css'
})
export class MedidaForm {
  @Input({ required: true }) clientId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  fields = [
    { key: 'back_width_ae', label: 'Ancho de espalda' },
    { key: 'bust_circumference_cb', label: 'Contorno de busto' },
    { key: 'waist_circumference_cc', label: 'Contorno de cintura' },
    { key: 'hip_circumference_ck', label: 'Contorno de cadera' },
    { key: 'torso_length_lt', label: 'Largo de talle' },
    { key: 'pants_length_lp', label: 'Largo de pantalón' },
    { key: 'sleeve_length_lm', label: 'Largo de manga' },
    { key: 'sleeve_circumference_cm', label: 'Contorno de manga' },
    { key: 'leg_circumference_cp', label: 'Contorno de pierna' }
  ] as const;

  values = signal<Record<string, string>>({});
  notes = signal('');
  saving = signal(false);
  errorMsg = signal('');

  setValue(key: string, v: string) {
    this.values.update(cur => ({ ...cur, [key]: v }));
  }

  async onSubmit() {
    this.errorMsg.set('');
    this.saving.set(true);
    try {
      const payload: any = { client_id: this.clientId, notes: this.notes().trim() || null };
      for (const f of this.fields) {
        const raw = this.values()[f.key];
        payload[f.key] = raw ? Number(raw) : null;
      }
      await this.measurementService.create(payload);
      this.saved.emit();
    } catch (err: any) {
      this.errorMsg.set('No se pudo guardar la medida: ' + err.message);
    } finally {
      this.saving.set(false);
    }
  }

  constructor(private measurementService: MeasurementService) {}
}