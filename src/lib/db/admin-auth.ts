import { createHash } from "crypto";
import { getSupabaseClient } from "@/lib/db/supabase";
import { Database, Json } from "@/lib/db/schema";
import { AdminAuditLogRecord, AdminRole, AdminSessionContext, AdminSessionRecord, AdminUserRecord } from "@/lib/types";

type AdminUserRow = Database["public"]["Tables"]["admin_users"]["Row"];
type AdminSessionRow = Database["public"]["Tables"]["admin_sessions"]["Row"];
type AdminAuditLogRow = Database["public"]["Tables"]["admin_audit_logs"]["Row"];

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function mapAdminUser(row: AdminUserRow): AdminUserRecord {
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at,
    disabledAt: row.disabled_at
  };
}

function mapAdminSession(row: AdminSessionRow): AdminSessionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    lastSeenAt: row.last_seen_at,
    revokedAt: row.revoked_at
  };
}

function mapAdminAuditLog(row: AdminAuditLogRow): AdminAuditLogRecord {
  return {
    id: row.id,
    userId: row.user_id,
    action: row.action,
    resource: row.resource,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    details: row.details,
    createdAt: row.created_at
  };
}

export async function findAdminUserWithPasswordByUsername(username: string) {
  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("username", username)
    .is("disabled_at", null)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as AdminUserRow | null) ?? null;
}

export async function countAdminUsers() {
  const supabase = getSupabaseClient() as any;
  const { count, error } = await supabase.from("admin_users").select("*", { count: "exact", head: true });
  if (error) {
    throw error;
  }
  return count ?? 0;
}

export async function createAdminUser(input: { username: string; passwordHash: string; role: AdminRole }) {
  const supabase = getSupabaseClient() as any;
  const payload: Database["public"]["Tables"]["admin_users"]["Insert"] = {
    username: input.username,
    password_hash: input.passwordHash,
    role: input.role
  };
  const { data, error } = await supabase.from("admin_users").insert(payload).select("*").single();
  if (error) {
    throw error;
  }
  return mapAdminUser(data as AdminUserRow);
}

export async function createAdminSessionRecord(input: { sessionId: string; userId: string; token: string; expiresAt: string }) {
  const supabase = getSupabaseClient() as any;
  const payload: Database["public"]["Tables"]["admin_sessions"]["Insert"] = {
    id: input.sessionId,
    user_id: input.userId,
    token_hash: hashToken(input.token),
    expires_at: input.expiresAt
  };

  const { data, error } = await supabase.from("admin_sessions").insert(payload).select("*").single();
  if (error) {
    throw error;
  }

  return mapAdminSession(data as AdminSessionRow);
}

export async function getAdminSessionContextByToken(sessionId: string, token: string): Promise<AdminSessionContext | null> {
  const supabase = getSupabaseClient() as any;
  const { data: sessionRow, error: sessionError } = await supabase
    .from("admin_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("token_hash", hashToken(token))
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (sessionError) {
    throw sessionError;
  }

  if (!sessionRow) {
    return null;
  }

  const { data: userRow, error: userError } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", sessionRow.user_id)
    .is("disabled_at", null)
    .maybeSingle();

  if (userError) {
    throw userError;
  }

  if (!userRow) {
    return null;
  }

  return {
    session: mapAdminSession(sessionRow as AdminSessionRow),
    user: mapAdminUser(userRow as AdminUserRow)
  };
}

export async function revokeAdminSessionByToken(sessionId: string, token: string) {
  const supabase = getSupabaseClient() as any;
  const { error } = await supabase
    .from("admin_sessions")
    .update({
      revoked_at: new Date().toISOString()
    })
    .eq("id", sessionId)
    .eq("token_hash", hashToken(token));

  if (error) {
    throw error;
  }
}

export async function touchAdminSession(sessionId: string) {
  const supabase = getSupabaseClient() as any;
  const { error } = await supabase
    .from("admin_sessions")
    .update({
      last_seen_at: new Date().toISOString()
    })
    .eq("id", sessionId)
    .is("revoked_at", null);

  if (error) {
    throw error;
  }
}

export async function upsertAdminLastLogin(userId: string) {
  const supabase = getSupabaseClient() as any;
  const { error } = await supabase
    .from("admin_users")
    .update({
      last_login_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}

export async function recordAdminLoginAttempt(input: { username: string; ipAddress: string | null; success: boolean }) {
  const supabase = getSupabaseClient() as any;
  const payload: Database["public"]["Tables"]["admin_login_attempts"]["Insert"] = {
    username: input.username,
    ip_address: input.ipAddress,
    success: input.success
  };

  const { error } = await supabase.from("admin_login_attempts").insert(payload);
  if (error) {
    throw error;
  }
}

export async function countRecentFailedLoginAttempts(input: { username: string; ipAddress: string | null; since: string }) {
  const supabase = getSupabaseClient() as any;
  const [byUsername, byIp] = await Promise.all([
    supabase
      .from("admin_login_attempts")
      .select("*", { count: "exact", head: true })
      .eq("username", input.username)
      .eq("success", false)
      .gte("attempted_at", input.since),
    input.ipAddress
      ? supabase
          .from("admin_login_attempts")
          .select("*", { count: "exact", head: true })
          .eq("ip_address", input.ipAddress)
          .eq("success", false)
          .gte("attempted_at", input.since)
      : Promise.resolve({ count: 0, error: null })
  ]);

  if (byUsername.error) {
    throw byUsername.error;
  }

  if (byIp.error) {
    throw byIp.error;
  }

  return {
    usernameFailures: byUsername.count ?? 0,
    ipFailures: byIp.count ?? 0
  };
}

export async function createAdminAuditLog(input: {
  userId?: string | null;
  action: string;
  resource: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  details?: Record<string, unknown> | null;
}) {
  const supabase = getSupabaseClient() as any;
  const payload: Database["public"]["Tables"]["admin_audit_logs"]["Insert"] = {
    user_id: input.userId ?? null,
    action: input.action,
    resource: input.resource,
    ip_address: input.ipAddress ?? null,
    user_agent: input.userAgent ?? null,
    details: (input.details ?? null) as Json
  };

  const { data, error } = await supabase.from("admin_audit_logs").insert(payload).select("*").single();
  if (error) {
    throw error;
  }

  return mapAdminAuditLog(data as AdminAuditLogRow);
}

export async function listAdminUsers() {
  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as AdminUserRow[]).map(mapAdminUser);
}

export async function listRecentAdminAuditLogs(limit = 20) {
  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase
    .from("admin_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return ((data ?? []) as AdminAuditLogRow[]).map(mapAdminAuditLog);
}

export async function setAdminUserDisabledState(input: { userId: string; disabled: boolean }) {
  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase
    .from("admin_users")
    .update({
      disabled_at: input.disabled ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq("id", input.userId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapAdminUser(data as AdminUserRow);
}
