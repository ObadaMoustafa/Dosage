type ApiErrorBody = {
  error?: string;
  message?: string;
};

const API_URL = import.meta.env.VITE_API_URL as string;

function getAuthToken() {
  return localStorage.getItem('token');
}

async function readJson<T>(res: Response): Promise<T> {
  return (await res.json().catch(() => ({}))) as T;
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  withAuth = false,
): Promise<{ res: Response; data: T }> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (withAuth) {
    const token = getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
  const data = await readJson<T>(res);
  return { res, data };
}

export type RegisterPayload = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role?: 'patient';
};

export type UpdateProfilePayload = {
  first_name?: string;
  last_name?: string;
  email?: string | null;
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
};

export type AuthUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  avatar_url?: string | null;
  created_at: string;
};

export type ApiMedicine = {
  id: string;
  medicijn_naam: string;
  toedieningsvorm?: string | null;
  sterkte?: string | null;
  beschrijving?: string | null;
  bijsluiter?: string | null;
  stock_id?: string | null;
  added_at?: string;
};

export type CreateMedicinePayload = {
  medicijn_naam: string;
  toedieningsvorm?: string | null;
  sterkte?: string | null;
  beschrijving?: string | null;
  bijsluiter?: string | null;
  stock_id?: string | null;
};

export type UpdateMedicinePayload = Partial<CreateMedicinePayload>;

export const authApi = {
  async login(email: string, password: string) {
    const { res, data } = await apiRequest<{ token?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok || !data.token) {
      const errorData = data as ApiErrorBody;
      throw new Error(errorData.error ?? errorData.message ?? 'Login failed');
    }

    localStorage.setItem('token', data.token);
    return data.token;
  },

  async register(payload: RegisterPayload) {
    const { res, data } = await apiRequest<ApiErrorBody>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(data.error ?? data.message ?? 'Registratie mislukt');
    }
  },

  async me() {
    const { res, data } = await apiRequest<AuthUser | ApiErrorBody>(
      '/auth/me',
      { method: 'GET' },
      true,
    );

    if (res.status === 401 || res.status === 403) {
      return null;
    }
    if (!res.ok) {
      throw new Error((data as ApiErrorBody).error ?? 'Auth check failed');
    }
    return data as AuthUser;
  },

  async updateProfile(payload: UpdateProfilePayload) {
    const { res, data } = await apiRequest<ApiErrorBody>(
      '/auth/me',
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      true,
    );

    if (!res.ok) {
      throw new Error(data.error ?? data.message ?? 'Opslaan mislukt');
    }
  },

  async changePassword(payload: ChangePasswordPayload) {
    const { res, data } = await apiRequest<ApiErrorBody>(
      '/auth/change-password',
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      true,
    );

    if (!res.ok) {
      throw new Error(
        data.error ?? data.message ?? 'Wachtwoord wijzigen mislukt',
      );
    }
  },

  async deleteAccount() {
    const { res, data } = await apiRequest<ApiErrorBody>(
      '/auth/me',
      { method: 'DELETE' },
      true,
    );

    if (!res.ok) {
      throw new Error(
        data.error ?? data.message ?? 'Fout bij verwijderen account.',
      );
    }
  },
};

export const medicinesApi = {
  async listMy(filters: { user_id?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.user_id) {
      params.set('user_id', filters.user_id);
    }
    const query = params.toString();
    const { res, data } = await apiRequest<ApiMedicine[] | ApiErrorBody>(
      `/medicines/me${query ? `?${query}` : ''}`,
      { method: 'GET' },
      true,
    );

    if (!res.ok) {
      throw new Error(
        (data as ApiErrorBody).error ?? 'Kon medicijnen niet laden.',
      );
    }

    return data as ApiMedicine[];
  },

  async create(payload: CreateMedicinePayload) {
    const { res, data } = await apiRequest<{ id?: string } & ApiErrorBody>(
      '/medicines/me',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      true,
    );

    if (!res.ok) {
      throw new Error(
        data.error ?? data.message ?? 'Medicijn toevoegen mislukt.',
      );
    }

    return data.id;
  },

  async update(id: string, payload: UpdateMedicinePayload) {
    const { res, data } = await apiRequest<ApiErrorBody>(
      `/medicines/me/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      true,
    );

    if (!res.ok) {
      throw new Error(
        data.error ?? data.message ?? 'Medicijn bijwerken mislukt.',
      );
    }
  },

  async remove(id: string) {
    const { res, data } = await apiRequest<ApiErrorBody>(
      `/medicines/me/${id}`,
      { method: 'DELETE' },
      true,
    );

    if (!res.ok) {
      throw new Error(
        data.error ?? data.message ?? 'Medicijn verwijderen mislukt.',
      );
    }
  },
};

export type PairingType = 'TRUSTED' | 'THERAPIST';

export type PairingInviteResponse = {
  code: string;
  type: PairingType;
  expires_at: string;
};

export type PairingViewer = {
  connection_id: string;
  user_id: string;
  name: string;
  avatar?: string | null;
  role: string;
  since: string;
};

export type PairingSubject = {
  connection_id: string;
  user_id: string;
  name: string;
  avatar?: string | null;
  email?: string | null;
  since: string;
};

export type PairingViewersResponse = {
  therapists: PairingViewer[];
  trusted: PairingViewer[];
};

export type PairingSubjectsResponse = {
  full_access: PairingSubject[];
  read_only: PairingSubject[];
};

export const pairingApi = {
  async invite(type: PairingType) {
    const { res, data } = await apiRequest<
      PairingInviteResponse | ApiErrorBody
    >(
      '/pairing/invite',
      {
        method: 'POST',
        body: JSON.stringify({ type }),
      },
      true,
    );

    if (!res.ok) {
      throw new Error(
        data.error ?? data.message ?? 'Deelcode genereren mislukt.',
      );
    }

    return data as PairingInviteResponse;
  },

  async link(code: string) {
    const { res, data } = await apiRequest<ApiErrorBody>(
      '/pairing/link',
      {
        method: 'POST',
        body: JSON.stringify({ code }),
      },
      true,
    );

    if (!res.ok) {
      throw new Error(data.error ?? data.message ?? 'Koppelen mislukt.');
    }
  },

  async viewers() {
    const { res, data } = await apiRequest<
      PairingViewersResponse | ApiErrorBody
    >('/pairing/viewers', { method: 'GET' }, true);

    if (!res.ok) {
      throw new Error(
        data.error ?? data.message ?? 'Kan koppelingen niet laden.',
      );
    }

    return data as PairingViewersResponse;
  },

  async subjects() {
    const { res, data } = await apiRequest<
      PairingSubjectsResponse | ApiErrorBody
    >('/pairing/subjects', { method: 'GET' }, true);

    if (!res.ok) {
      throw new Error(
        data.error ?? data.message ?? 'Kan gekoppelde personen niet laden.',
      );
    }

    return data as PairingSubjectsResponse;
  },

  async unlink(userId: string) {
    const { res, data } = await apiRequest<ApiErrorBody>(
      `/pairing/unlink/${userId}`,
      { method: 'DELETE' },
      true,
    );

    if (!res.ok) {
      throw new Error(
        data.error ?? data.message ?? 'Verbinding verwijderen mislukt.',
      );
    }
  },
};

export type LogItem = {
  id: string;
  gmn_id: string;
  medicijn_naam: string;
  medicijn_turven: number;
  gms_id?: string | null;
  status?: string | null;
  aangemaakt_op: string;
};

export type CreateLogPayload = {
  gmn_id: string;
  medicijn_turven?: number;
  gms_id?: string | null;
  status?: string;
  aangemaakt_op?: string;
};

export type LogsFilters = {
  date?: string;
  from?: string;
  to?: string;
  gmn_id?: string;
  user_id?: string;
};

export const logsApi = {
  async list(filters: LogsFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    const query = params.toString();
    const { res, data } = await apiRequest<LogItem[] | ApiErrorBody>(
      `/logs${query ? `?${query}` : ''}`,
      { method: 'GET' },
      true,
    );

    if (!res.ok) {
      throw new Error(data.error ?? data.message ?? 'Kon historie niet laden.');
    }

    return data as LogItem[];
  },

  async create(payload: CreateLogPayload) {
    const { res, data } = await apiRequest<{ id?: string } & ApiErrorBody>(
      '/logs',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      true,
    );

    if (!res.ok) {
      throw new Error(data.error ?? data.message ?? 'Log toevoegen mislukt.');
    }

    return data.id;
  },

  async remove(id: string) {
    const { res, data } = await apiRequest<ApiErrorBody>(
      `/logs/${id}`,
      { method: 'DELETE' },
      true,
    );

    if (!res.ok) {
      throw new Error(data.error ?? data.message ?? 'Log verwijderen mislukt.');
    }
  },
};

export type StockStatus = 'Op peil' | 'Bijna op' | 'Bijna leeg';

export type StockItemApi = {
  id: string;
  name: string;
  packs_count?: number;
  pills_per_pack?: number;
  strips_count?: number;
  pills_per_strip?: number;
  loose_pills: number;
  threshold: number;
  status: StockStatus;
  last_updated: string;
};

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'behandelaar' | 'patient';
  is_active: boolean;
  created_at: string;
};

export const adminApi = {
  async users() {
    const { res, data } = await apiRequest<AdminUser[] | ApiErrorBody>(
      '/admin/users',
      { method: 'GET' },
      true,
    );

    if (!res.ok) {
      throw new Error(
        data.error ?? data.message ?? 'Gebruikers laden mislukt.',
      );
    }

    return data as AdminUser[];
  },

  async updateRole(userId: string, role: AdminUser['role']) {
    const { res, data } = await apiRequest<ApiErrorBody>(
      `/admin/users/role/${userId}`,
      { method: 'PUT', body: JSON.stringify({ role }) },
      true,
    );

    if (!res.ok) {
      throw new Error(data.error ?? data.message ?? 'Rol bijwerken mislukt.');
    }
  },

  async toggleStatus(userId: string, isActive: boolean) {
    const { res, data } = await apiRequest<ApiErrorBody>(
      `/admin/users/toggle-status/${userId}`,
      { method: 'POST', body: JSON.stringify({ isActive }) },
      true,
    );

    if (!res.ok) {
      throw new Error(
        data.error ?? data.message ?? 'Status bijwerken mislukt.',
      );
    }
  },
};

export type StockItemPayload = {
  name: string;
  packs_count: number;
  pills_per_pack: number;
  loose_pills: number;
  threshold: number;
  status: StockStatus;
};

export const stockApi = {
  async list() {
    const { res, data } = await apiRequest<StockItemApi[] | ApiErrorBody>(
      '/stock',
      { method: 'GET' },
      true,
    );

    if (!res.ok) {
      throw new Error(data.error ?? data.message ?? 'Voorraad laden mislukt.');
    }

    return data as StockItemApi[];
  },

  async create(payload: StockItemPayload) {
    const { res, data } = await apiRequest<{ id?: string } & ApiErrorBody>(
      '/stock',
      { method: 'POST', body: JSON.stringify(payload) },
      true,
    );

    if (!res.ok) {
      throw new Error(
        data.error ?? data.message ?? 'Voorraad toevoegen mislukt.',
      );
    }

    return data.id;
  },

  async update(id: string, payload: Partial<StockItemPayload>) {
    const { res, data } = await apiRequest<ApiErrorBody>(
      `/stock/${id}`,
      { method: 'PUT', body: JSON.stringify(payload) },
      true,
    );

    if (!res.ok) {
      throw new Error(
        data.error ?? data.message ?? 'Voorraad bijwerken mislukt.',
      );
    }
  },

  async remove(id: string) {
    const { res, data } = await apiRequest<ApiErrorBody>(
      `/stock/${id}`,
      { method: 'DELETE' },
      true,
    );

    if (!res.ok) {
      throw new Error(
        data.error ?? data.message ?? 'Voorraad verwijderen mislukt.',
      );
    }
  },
};

export type ScheduleApi = {
  id: string;
  gmn_id: string;
  medicijn_naam: string;
  dagen: Record<string, boolean>;
  tijden: string[];
  next_occurrence?: string | null;
  innemen_status?: string | null;
  aantal: number;
  beschrijving: string;
  aangemaakt_op: string;
};

export type SchedulePayload = {
  gmn_id: string;
  dagen: Record<string, boolean>;
  tijden: string[];
  aantal: number;
  beschrijving: string;
};

export const schedulesApi = {
  async list(filters: { user_id?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.user_id) {
      params.set('user_id', filters.user_id);
    }
    const query = params.toString();
    const { res, data } = await apiRequest<ScheduleApi[] | ApiErrorBody>(
      `/schema${query ? `?${query}` : ''}`,
      { method: 'GET' },
      true,
    );

    if (!res.ok) {
      throw new Error(data.error ?? data.message ?? "Schema's laden mislukt.");
    }

    return data as ScheduleApi[];
  },

  async create(payload: SchedulePayload) {
    const { res, data } = await apiRequest<{ id?: string } & ApiErrorBody>(
      '/schema',
      { method: 'POST', body: JSON.stringify(payload) },
      true,
    );

    if (!res.ok) {
      throw new Error(
        data.error ?? data.message ?? 'Schema toevoegen mislukt.',
      );
    }

    return data.id;
  },

  async update(id: string, payload: SchedulePayload) {
    const { res, data } = await apiRequest<ApiErrorBody>(
      `/schema/${id}`,
      { method: 'PUT', body: JSON.stringify(payload) },
      true,
    );

    if (!res.ok) {
      throw new Error(
        data.error ?? data.message ?? 'Schema bijwerken mislukt.',
      );
    }
  },

  async remove(id: string) {
    const { res, data } = await apiRequest<ApiErrorBody>(
      `/schema/${id}`,
      { method: 'DELETE' },
      true,
    );

    if (!res.ok) {
      throw new Error(
        data.error ?? data.message ?? 'Schema verwijderen mislukt.',
      );
    }
  },

  async updateStatus(id: string, status: 'optijd' | 'gemist') {
    const { res, data } = await apiRequest<ApiErrorBody>(
      '/schema/update_status',
      { method: 'PUT', body: JSON.stringify({ id, innemen_status: status }) },
      true,
    );

    if (!res.ok) {
      throw new Error(
        data.error ?? data.message ?? 'Status bijwerken mislukt.',
      );
    }
  },
};
