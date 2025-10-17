import { supabase, Branch } from './supabase';

export async function detectBranchFromUrl(): Promise<string | null> {
  try {
    const hostname = window.location.hostname;

    const subdomain = hostname.split('.')[0];

    if (!subdomain || subdomain === 'localhost' || subdomain === 'www' || hostname === subdomain) {
      return null;
    }

    const { data, error } = await supabase
      .from('branches')
      .select('id')
      .eq('subdomain', subdomain)
      .maybeSingle();

    if (error) {
      console.error('Branch detection error:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Branch detection error:', error);
    return null;
  }
}

export async function getCurrentBranch(): Promise<Branch | null> {
  try {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];

    if (!subdomain || subdomain === 'localhost' || subdomain === 'www' || hostname === subdomain) {
      return null;
    }

    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .eq('subdomain', subdomain)
      .maybeSingle();

    if (error) {
      console.error('Branch detection error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Branch detection error:', error);
    return null;
  }
}
