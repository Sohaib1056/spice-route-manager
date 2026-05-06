const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Auth APIs
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(userId: string, userName: string, userRole: string) {
    return this.request("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ userId, userName, userRole }),
    });
  }

  // User APIs
  async getUsers() {
    return this.request("/users");
  }

  async getUserById(id: string) {
    return this.request(`/users/${id}`);
  }

  async createUser(userData: any) {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string, currentUser: any) {
    return this.request(`/users/${id}`, {
      method: "DELETE",
      body: JSON.stringify(currentUser),
    });
  }

  async updateUserPassword(id: string, password: string, currentUser: any) {
    return this.request(`/users/${id}/password`, {
      method: "PUT",
      body: JSON.stringify({ password, ...currentUser }),
    });
  }

  // Permission APIs
  async getAllPermissions() {
    return this.request("/permissions");
  }

  async getUserPermissions(userId: string) {
    return this.request(`/permissions/${userId}`);
  }

  async updateUserPermissions(userId: string, permissions: any, currentUser: any) {
    return this.request(`/permissions/${userId}`, {
      method: "PUT",
      body: JSON.stringify({ permissions, ...currentUser }),
    });
  }

  async bulkUpdatePermissions(updates: any[], currentUser: any) {
    return this.request("/permissions/bulk", {
      method: "PUT",
      body: JSON.stringify({ updates, ...currentUser }),
    });
  }

  // Audit APIs
  async getAuditLogs(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/audit?${queryString}`);
  }

  async getAuditStats() {
    return this.request("/audit/stats");
  }

  async getRecentActivity(limit: number = 10) {
    return this.request(`/audit/recent?limit=${limit}`);
  }

  async getUserActivity(userId: string, page: number = 1, limit: number = 20) {
    return this.request(`/audit/user/${userId}?page=${page}&limit=${limit}`);
  }

  async exportAuditLogs(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/audit?${queryString}`);
  }

  // Finance APIs
  async getFinanceTransactions(filters: any = {}) {
    const queryString = new URLSearchParams(filters).toString();
    return this.request(`/finance?${queryString}`);
  }

  async getFinanceStats(range: string = "This Month") {
    return this.request(`/finance/stats?range=${range}`);
  }

  async getMonthlyFinanceData() {
    return this.request("/finance/monthly");
  }

  async getExpenseBreakdown() {
    return this.request("/finance/expense-breakdown");
  }

  async createFinanceTransaction(data: any) {
    return this.request("/finance", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteFinanceTransaction(id: string, currentUser: any) {
    return this.request(`/finance/${id}`, {
      method: "DELETE",
      body: JSON.stringify(currentUser),
    });
  }

  // Report APIs
  async getReportData() {
    return this.request("/reports");
  }

  async exportReport(type: string = "combined") {
    return this.request(`/reports/export?type=${type}`);
  }

  async getPrintReport() {
    return this.request("/reports/print");
  }

  // Settings APIs
  async getSettings() {
    return this.request("/settings");
  }

  async updateCompanyInfo(data: any) {
    return this.request("/settings/company", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async updateSystemSettings(data: any) {
    return this.request("/settings/system", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async createBackup(currentUser: any) {
    return this.request("/settings/backup", {
      method: "POST",
      body: JSON.stringify(currentUser),
    });
  }

  async downloadBackup() {
    return this.request("/settings/backup/download");
  }

  async resetAllData(confirmText: string, currentUser: any) {
    return this.request("/settings/reset", {
      method: "DELETE",
      body: JSON.stringify({ confirmText, ...currentUser }),
    });
  }

  // Supplier Payment APIs
  async recordSupplierPayment(supplierId: string, paymentData: any) {
    return this.request(`/suppliers/${supplierId}/payment`, {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }

  async getSupplierLedger(supplierId: string) {
    return this.request(`/suppliers/${supplierId}/ledger`);
  }

  // Low Stock APIs
  async getLowStockProducts(filters: any = {}) {
    const queryString = new URLSearchParams(filters).toString();
    return this.request(`/low-stock?${queryString}`);
  }

  async getLowStockStats() {
    return this.request("/low-stock/stats");
  }

  async getReorderList() {
    return this.request("/low-stock/reorder-list");
  }

  // Stock APIs
  async getStockMovements() {
    return this.request("/stock/movements");
  }

  async adjustStock(data: any) {
    return this.request("/stock/adjust", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getSales(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/sales?${queryString}`);
  }

  async getWebsiteOrders(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/website-orders?${queryString}`);
  }

  async getWebsiteOrderById(id: string) {
    return this.request(`/website-orders/${id}`);
  }

  async getSaleById(id: string) {
    return this.request(`/sales/${id}`);
  }

  // Return APIs
  async getReturns(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/returns?${queryString}`);
  }

  async getReturnStats() {
    return this.request("/returns/stats");
  }

  async getReturnById(id: string) {
    return this.request(`/returns/${id}`);
  }

  async createReturn(data: any) {
    return this.request("/returns", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async approveReturn(id: string, processedBy: string) {
    const res = await this.request<any>(`/returns/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify({ processedBy }),
    });
    console.log("[ApiService] approveReturn response:", res);
    return res;
  }

  async rejectReturn(id: string, data: { rejectionReason: string; processedBy: string }) {
    return this.request(`/returns/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async markAsRefunded(id: string, data: { transactionReference: string; processedBy: string }) {
    return this.request(`/returns/${id}/refunded`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiService();
export default api;
