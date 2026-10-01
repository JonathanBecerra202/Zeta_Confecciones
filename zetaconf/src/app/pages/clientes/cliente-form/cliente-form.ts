import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientService, Client } from '../../../services/client.service';
import { DepartmentService, Department } from '../../../services/department.service';
import { OrganizationService, Organization } from '../../../services/organization.service';
import { MeasurementService } from '../../../services/measurement.service';

const MEASUREMENT_FIELDS = [
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

function safeTrim(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './cliente-form.html',
  styleUrl: './cliente-form.css'
})
export class ClienteForm implements OnInit {
  @Input() organizations: Organization[] = [];
  @Input() departments: Department[] = [];
  @Input() initial: Client | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  @Output() departmentCreated = new EventEmitter<void>();
  @Output() organizationCreated = new EventEmitter<void>();

  measurementFields = MEASUREMENT_FIELDS;

  firstName = signal('');
  middleName = signal('');
  lastName = signal('');
  secondLastName = signal('');
  phone = signal('');
  selectedOrgId = signal<number | null>(null);
  selectedDepId = signal<number | null>(null);

  showNewOrg = signal(false);
  newOrgName = signal('');

  showNewDep = signal(false);
  newDepName = signal('');

  showMeasurements = signal(false);
  measurementValues = signal<Record<string, string>>({});
  measurementNotes = signal('');

  saving = signal(false);
  errorMsg = signal('');

  private clientAlreadyCreated = false;

  constructor(
    private clientService: ClientService,
    private departmentService: DepartmentService,
    private organizationService: OrganizationService,
    private measurementService: MeasurementService
  ) {}

  ngOnInit() {
    if (this.initial) {
      const c = this.initial;
      this.firstName.set(c.first_name);
      this.middleName.set(c.middle_name ?? '');
      this.lastName.set(c.last_name);
      this.secondLastName.set(c.second_last_name ?? '');
      this.phone.set(c.phone ?? '');
      const dep = this.departments.find(d => d.department_id === c.department_id);
      this.selectedDepId.set(c.department_id);
      this.selectedOrgId.set(dep?.organization_id ?? null);
    }
  }

  filteredDeps(): Department[] {
    const orgId = this.selectedOrgId();
    if (orgId === null) return [];
    return this.departments.filter(d => d.organization_id === orgId);
  }

  onOrgChange(orgId: number | null) {
    this.selectedOrgId.set(orgId);
    this.selectedDepId.set(null);
    this.showNewDep.set(false);
  }

  async addOrganization() {
    const name = safeTrim(this.newOrgName());
    if (!name) return;
    try {
      const org = await this.organizationService.create({ name });
      this.organizations = [...this.organizations, org];
      this.organizationCreated.emit();
      this.selectedOrgId.set(org.organization_id);
      this.selectedDepId.set(null);
      this.newOrgName.set('');
      this.showNewOrg.set(false);
    } catch (err: any) {
      this.errorMsg.set('No se pudo crear la organización: ' + (err?.message ?? err));
    }
  }

  async addDepartment() {
    const orgId = this.selectedOrgId();
    const name = safeTrim(this.newDepName());
    if (!orgId || !name) return;
    try {
      const dep = await this.departmentService.create({ name, organization_id: orgId });
      this.departments = [...this.departments, dep];
      this.departmentCreated.emit();
      this.selectedDepId.set(dep.department_id);
      this.newDepName.set('');
      this.showNewDep.set(false);
    } catch (err: any) {
      this.errorMsg.set('No se pudo crear la dependencia: ' + (err?.message ?? err));
    }
  }

 setMeasurementValue(key: string, v: string | number) {
  const asString = v === null || v === undefined ? '' : String(v);
  this.measurementValues.update(cur => ({ ...cur, [key]: asString }));
}
  private hasMeasurementData(): boolean {
    const vals = this.measurementValues();
    return Object.values(vals).some(v => safeTrim(v) !== '') || safeTrim(this.measurementNotes()) !== '';
  }

  async onSubmit() {
    if (this.saving() || this.clientAlreadyCreated) return;

    const firstName = safeTrim(this.firstName());
    const lastName = safeTrim(this.lastName());
    if (!firstName || !lastName) {
      this.errorMsg.set('El primer nombre y el primer apellido son obligatorios');
      return;
    }
    this.errorMsg.set('');
    this.saving.set(true);
    try {
      const payload = {
        first_name: firstName,
        middle_name: safeTrim(this.middleName()) || null,
        last_name: lastName,
        second_last_name: safeTrim(this.secondLastName()) || null,
        phone: safeTrim(this.phone()) || null,
        department_id: this.selectedDepId()
      };

      let clientId: number;

      if (this.initial) {
        const updated = await this.clientService.update(this.initial.client_id, payload as any);
        clientId = updated.client_id;
      } else {
        const created = await this.clientService.create(payload as any);
        clientId = created.client_id;
        this.clientAlreadyCreated = true;
      }

      if (!this.initial && this.hasMeasurementData()) {
        try {
          const measurementPayload: any = {
            client_id: clientId,
            notes: safeTrim(this.measurementNotes()) || null
          };
          for (const f of this.measurementFields) {
            const trimmed = safeTrim(this.measurementValues()[f.key]);
            measurementPayload[f.key] = trimmed !== '' ? Number(trimmed) : null;
          }
          await this.measurementService.create(measurementPayload);
        } catch (measurementErr: any) {
          console.error('No se pudo guardar la medida inicial', measurementErr);
          alert('El cliente se creó correctamente, pero no se pudo guardar la medida inicial. Puedes agregarla luego desde el detalle del cliente.');
        }
      }

      this.saved.emit();
    } catch (err: any) {
      this.errorMsg.set('No se pudo guardar: ' + (err?.message ?? err));
    } finally {
      this.saving.set(false);
    }
  }
}