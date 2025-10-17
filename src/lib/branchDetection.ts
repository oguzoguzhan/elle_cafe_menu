import { supabase, Branch } from './supabase';

export async function detectBranchFromHostname(): Promise<Branch | null> {
  const hostname = window.location.hostname;

  const parts = hostname.split('.');
  if (parts.length < 2) {
    return null;
  }

  const subdomain = parts[0];

  if (subdomain === 'localhost' || subdomain === 'www' || parts.length < 3) {
    return null;
  }

  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .eq('subdomain', subdomain)
    .maybeSingle();

  if (error) {
    console.error('Error fetching branch:', error);
    return null;
  }

  return data;
}

export function hasSubdomain(): boolean {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  if (parts.length < 3) {
    return false;
  }

  const subdomain = parts[0];
  return subdomain !== 'localhost' && subdomain !== 'www';
}
