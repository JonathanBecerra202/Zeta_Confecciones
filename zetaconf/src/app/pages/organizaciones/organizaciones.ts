import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrganizationService, Organization } from '../../services/organization.service';
import { DepartmentService } from '../../services/department.service';
import { RoleService } from '../../core/role.service';
import { matchesSearch } from '../../shared/text-utils';
import { OrganizacionForm } from './organizacion-form/organizacion-form';

@Component({
  selector: 'app-organizaciones',
  standalone: true,
  imports: [FormsModule, OrganizacionForm],
  templateUrl: './organizaciones.html',
  styleUrl: './organizaciones.css'
})
export class Organizaciones implements OnInit {
  organizations = signal<Organization[]>([]);
  departmentCounts = signal<Record<number, number>>({});
  loading = signal(true);
  errorMsg = signal('');
  searchQuery = signal('');

  showForm = signal(false);
  editingOrg = signal<Organization | null>(null);

  constructor(
    private organizationService: OrganizationService,
    private departmentService: DepartmentService,
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
      const [orgs, deps] = await Promise.all([
        this.organizationService.getAll(),
        this.departmentService.getAll()
      ]);
      this.organizations.set(orgs);
      const counts: Record<number, number> = {};
      for (const d of deps) {
        counts[d.organization_id] = (counts[d.organization_id] ?? 0) + 1;
      }
      this.departmentCounts.set(counts);
    } catch (err: any) {
      this.errorMsg.set('No se pudieron cargar las organizaciones: ' + err.message);
    } finally {
      this.loading.set(false);
    }
  }

  filtered(): Organization[] {
    const q = this.searchQuery();
    if (!q) return this.organizations();
    return this.organizations().filter(o => matchesSearch(o.name, q));
  }

  depCount(orgId: number): number {
    return this.departmentCounts()[orgId] ?? 0;
  }

  openNew() {
    this.editingOrg.set(null);
    this.showForm.set(true);
  }

  openEdit(o: Organization) {
    this.editingOrg.set(o);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingOrg.set(null);
  }

  async onSaved() {
    this.closeForm();
    await this.loadAll();
  }

  async deleteOrg(o: Organization) {
    const count = this.depCount(o.organization_id);
    if (count > 0) {
      alert(`No se puede eliminar "${o.name}": tiene ${count} dependencia${count !== 1 ? 's' : ''} asociada${count !== 1 ? 's' : ''}. Elimina o reasigna primero esas dependencias.`);
      return;
    }
    if (!confirm(`¿Eliminar la organización "${o.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await this.organizationService.delete(o.organization_id);
      await this.loadAll();
    } catch (err: any) {
      alert('No se pudo eliminar: ' + err.message);
    }
  }
}