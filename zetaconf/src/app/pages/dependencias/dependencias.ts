import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DepartmentService, Department } from '../../services/department.service';
import { OrganizationService, Organization } from '../../services/organization.service';
import { ClientService } from '../../services/client.service';
import { RoleService } from '../../core/role.service';
import { matchesSearch } from '../../shared/text-utils';
import { DependenciaForm } from './dependencia-form/dependencia-form';

@Component({
  selector: 'app-dependencias',
  standalone: true,
  imports: [FormsModule, DependenciaForm],
  templateUrl: './dependencias.html',
  styleUrl: './dependencias.css'
})
export class Dependencias implements OnInit {
  departments = signal<Department[]>([]);
  organizations = signal<Organization[]>([]);
  loading = signal(true);
  errorMsg = signal('');

  searchQuery = signal('');
  orgFilter = signal<number | null>(null);

  showForm = signal(false);
  editingDep = signal<Department | null>(null);

  constructor(
    private departmentService: DepartmentService,
    private organizationService: OrganizationService,
    private clientService: ClientService,
    public roleService: RoleService
  ) {}

  async ngOnInit() {
    await this.roleService.ensureLoaded();
    await this.loadAll();
  }

  async loadAll() {
    this.loading.set(true);
    this.errorMsg.set('');
    try {
      const [deps, orgs] = await Promise.all([
        this.departmentService.getAll(),
        this.organizationService.getAll()
      ]);
      this.departments.set(deps);
      this.organizations.set(orgs);
    } catch (err: any) {
      this.errorMsg.set('No se pudieron cargar las dependencias: ' + err.message);
    } finally {
      this.loading.set(false);
    }
  }

  organizationName(orgId: number): string {
    return this.organizations().find(o => o.organization_id === orgId)?.name ?? '—';
  }

  filtered(): Department[] {
    const q = this.searchQuery();
    const org = this.orgFilter();
    return this.departments().filter(d => {
      if (org !== null && d.organization_id !== org) return false;
      if (q && !matchesSearch(d.name, q)) return false;
      return true;
    });
  }

  openNew() {
    this.editingDep.set(null);
    this.showForm.set(true);
  }

  openEdit(d: Department) {
    this.editingDep.set(d);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingDep.set(null);
  }

  async onSaved() {
    this.closeForm();
    await this.loadAll();
  }

  async deleteDep(d: Department) {
    try {
      const clients = await this.clientService.getByDepartment(d.department_id);
      if (clients.length > 0) {
        alert(`No se puede eliminar "${d.name}": tiene ${clients.length} cliente${clients.length !== 1 ? 's' : ''} asociado${clients.length !== 1 ? 's' : ''}. Reasigna primero esos clientes a otra dependencia.`);
        return;
      }
    } catch (err: any) {
      alert('No se pudo verificar si la dependencia tiene clientes asociados: ' + err.message);
      return;
    }
    if (!confirm(`¿Eliminar la dependencia "${d.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await this.departmentService.delete(d.department_id);
      await this.loadAll();
    } catch (err: any) {
      alert('No se pudo eliminar: ' + err.message);
    }
  }
}