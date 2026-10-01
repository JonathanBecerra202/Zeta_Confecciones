import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientService, Client } from '../../services/client.service';
import { OrganizationService, Organization } from '../../services/organization.service';
import { DepartmentService, Department } from '../../services/department.service';
import { matchesSearch } from '../../shared/text-utils';
import { ClienteForm } from './cliente-form/cliente-form';
import { ClienteDetail } from './cliente-detail/cliente-detail';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [FormsModule, ClienteForm, ClienteDetail],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css'
})
export class Clientes implements OnInit {
  clients = signal<Client[]>([]);
  organizations = signal<Organization[]>([]);
  departments = signal<Department[]>([]);
  loading = signal(true);
  errorMsg = signal('');

  searchQuery = signal('');
  orgFilter = signal<number | null>(null);
  depFilter = signal<number | null>(null);
  showInactive = signal(false);

  showForm = signal(false);
  editingClient = signal<Client | null>(null);
  selectedClient = signal<Client | null>(null);

  constructor(
    private clientService: ClientService,
    private organizationService: OrganizationService,
    private departmentService: DepartmentService
  ) {}

  async ngOnInit() {
    await this.loadAll();
  }

  async loadAll() {
    this.loading.set(true);
    this.errorMsg.set('');
    try {
      const [clients, orgs, deps] = await Promise.all([
        this.clientService.getAll(),
        this.organizationService.getAll(),
        this.departmentService.getAll()
      ]);
      this.clients.set(clients);
      this.organizations.set(orgs);
      this.departments.set(deps);
    } catch (err: any) {
      this.errorMsg.set('No se pudieron cargar los clientes: ' + err.message);
    } finally {
      this.loading.set(false);
    }
  }

  fullName(c: Client): string {
    return [c.first_name, c.middle_name, c.last_name, c.second_last_name].filter(Boolean).join(' ');
  }

  departmentOf(c: Client): Department | undefined {
    return this.departments().find(d => d.department_id === c.department_id);
  }

  organizationNameOf(c: Client): string {
    const dep = this.departmentOf(c);
    if (!dep) return '';
    const org = this.organizations().find(o => o.organization_id === dep.organization_id);
    return org?.name ?? '';
  }

  departmentsForOrg(orgId: number | null): Department[] {
    if (orgId === null) return this.departments();
    return this.departments().filter(d => d.organization_id === orgId);
  }

  filtered = computed(() => {
    const q = this.searchQuery();
    const org = this.orgFilter();
    const dep = this.depFilter();
    const showInactive = this.showInactive();

    return this.clients().filter(c => {
      if (!showInactive && !c.active) return false;
      if (dep !== null && c.department_id !== dep) return false;
      if (org !== null) {
        const d = this.departmentOf(c);
        if (!d || d.organization_id !== org) return false;
      }
      if (q && !matchesSearch(this.fullName(c), q)) return false;
      return true;
    });
  });

  openNew() {
    this.editingClient.set(null);
    this.showForm.set(true);
  }

  openEdit(c: Client) {
    this.editingClient.set(c);
    this.selectedClient.set(null);
    this.showForm.set(true);
  }

  openDetail(c: Client) {
    this.selectedClient.set(c);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingClient.set(null);
  }

  closeDetail() {
    this.selectedClient.set(null);
  }

  async onSaved() {
    this.closeForm();
    await this.loadAll();
  }

  async onDepartmentCreated() {
    this.departments.set(await this.departmentService.getAll());
  }
  async onOrganizationCreated() {
    this.organizations.set(await this.organizationService.getAll());
  }
}