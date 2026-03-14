/**
 * Supabase Client for Newsletter Dashboard
 * Works in both browser and Node.js
 */

const SUPABASE_URL = 'https://eytpovjjhwprfedrdceu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5dHBvdmpqaHdwcmZlZHJkY2V1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjg0NjYwNSwiZXhwIjoyMDg4NDIyNjA1fQ.p64Gk9WfSXwV4fCBlJV-o2JH8zrkX6hFTdzK7yxLC0o';

class SupabaseClient {
  constructor() {
    this.baseUrl = SUPABASE_URL;
    this.apiKey = SUPABASE_KEY;
  }

  async request(path, method = 'GET', body = null) {
    const options = {
      method: method,
      headers: {
        'apikey': this.apiKey,
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(this.baseUrl + path, options);
    
    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // Insert or update newsletter
  async upsertNewsletter(newsletter) {
    return this.request('/rest/v1/newsletters', 'POST', newsletter);
  }

  // Bulk insert newsletters
  async upsertNewsletters(newsletters) {
    return this.request('/rest/v1/newsletters', 'POST', newsletters);
  }

  // Get all newsletters
  async getNewsletters(status = null) {
    let path = '/rest/v1/newsletters?select=*&order=created_at.desc';
    if (status) {
      path += `&status=eq.${status}`;
    }
    return this.request(path, 'GET');
  }

  // Get newsletter count by status
  async getStats() {
    const all = await this.request('/rest/v1/newsletters?select=status', 'GET');
    
    const stats = {
      total: all.length,
      pending: 0,
      success: 0,
      failed: 0
    };

    all.forEach(n => {
      if (n.status === 'success') stats.success++;
      else if (n.status === 'failed') stats.failed++;
      else stats.pending++;
    });

    return stats;
  }

  // Update newsletter status
  async updateStatus(url, status) {
    return this.request(
      `/rest/v1/newsletters?url=eq.${encodeURIComponent(url)}`,
      'PATCH',
      { 
        status: status,
        updated_at: new Date().toISOString(),
        signed_up_at: status === 'success' ? new Date().toISOString() : null
      }
    );
  }

  // Delete all newsletters (for testing)
  async deleteAll() {
    return this.request('/rest/v1/newsletters', 'DELETE');
  }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SupabaseClient;
}
