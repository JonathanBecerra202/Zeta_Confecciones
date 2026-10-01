import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrganizationService, Organization } from '../../../services/organization.service';

@Component({
  selector: 'app-organizacion-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './organizacion-form.html',
  styleUrl: './organizacion-form.css'
})
export class OrganizacionForm implements OnInit {
  @Input() initial: Organization | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  name = signal('');
  saving = signal(false);
  errorMsg = signal('');

  constructor(private organizationService: OrganizationService) {}

  ngOnInit() {
    if (this.initial) {
      this.name.set(this.initial.name);
    }
  }

  async onSubmit() {
    const name = this.name().trim();
    if (!name) {
      this.errorMsg.set('El nombre es obligatorio');
      return;
    }
    this.errorMsg.set('');
    this.saving.set(true);
    try {
      if (this.initial) {
        await this.organizationService.update(this.initial.organization_id, { name });
      } else {
        await this.organizationService.create({ name });
      }
      this.saved.emit();
    } catch (err: any) {
      this.errorMsg.set('No se pudo guardar: ' + (err?.message ?? err));
    } finally {
      this.saving.set(false);
    }
  }
}