import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DepartmentService, Department } from '../../../services/department.service';
import { Organization } from '../../../services/organization.service';

@Component({
  selector: 'app-dependencia-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dependencia-form.html',
  styleUrl: './dependencia-form.css'
})
export class DependenciaForm implements OnInit {
  @Input() organizations: Organization[] = [];
  @Input() initial: Department | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  name = signal('');
  selectedOrgId = signal<number | null>(null);
  saving = signal(false);
  errorMsg = signal('');

  constructor(private departmentService: DepartmentService) {}

  ngOnInit() {
    if (this.initial) {
      this.name.set(this.initial.name);
      this.selectedOrgId.set(this.initial.organization_id);
    } else if (this.organizations.length > 0) {
      this.selectedOrgId.set(this.organizations[0].organization_id);
    }
  }

  async onSubmit() {
    const name = this.name().trim();
    const orgId = this.selectedOrgId();
    if (!name || !orgId) {
      this.errorMsg.set('El nombre y la organización son obligatorios');
      return;
    }
    this.errorMsg.set('');
    this.saving.set(true);
    try {
      if (this.initial) {
        await this.departmentService.update(this.initial.department_id, { name, organization_id: orgId });
      } else {
        await this.departmentService.create({ name, organization_id: orgId });
      }
      this.saved.emit();
    } catch (err: any) {
      this.errorMsg.set('No se pudo guardar: ' + (err?.message ?? err));
    } finally {
      this.saving.set(false);
    }
  }
}