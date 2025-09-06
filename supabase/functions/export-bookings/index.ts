import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import ExcelJS from "https://cdn.skypack.dev/exceljs@4.4.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authentication with JWT from request and check admin role via RLS
    const authHeader = req.headers.get('Authorization') || '';
    const supabaseRls = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseRls.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: userRole, error: roleErr } = await supabaseRls
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleErr) throw roleErr;
    if (!userRole) throw new Error('Admin access required');

    // Use service role client for unrestricted data aggregation after verifying admin
    const supabaseSr = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch bookings and related data without relying on PostgREST FK joins
    const { data: bookings, error: bookingsErr } = await supabaseSr
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    if (bookingsErr) throw bookingsErr;

    // Fetch related packages
    const packageIds = Array.from(new Set((bookings ?? []).map(b => b.package_id).filter(Boolean)));
    const { data: packages } = packageIds.length
      ? await supabaseSr.from('service_packages').select('id,title,price').in('id', packageIds)
      : { data: [], error: null } as any;
    const packageMap = new Map((packages ?? []).map(p => [p.id, p]));

    // Fetch related profiles
    const userIds = Array.from(new Set((bookings ?? []).map(b => b.user_id).filter(Boolean)));
    const { data: profiles } = userIds.length
      ? await supabaseSr.from('profiles').select('id,first_name,last_name,phone').in('id', userIds)
      : { data: [], error: null } as any;
    const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bookings');

    // Define headers
    const headers = [
      'Booking ID',
      'Customer Name', 
      'Email',
      'Phone',
      'Package',
      'Booking Date',
      'Event Date',
      'Guest Count',
      'Total Amount',
      'Status',
      'Special Requests'
    ];

    // Add header row
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F3FF' }
    };

    // Add booking data
    bookings?.forEach((booking) => {
      const prof = profileMap.get(booking.user_id) ?? ({} as any);
      const pkg = packageMap.get(booking.package_id) ?? ({} as any);
      worksheet.addRow([
        booking.id,
        `${(prof.first_name ?? '')} ${(prof.last_name ?? '')}`.trim() || 'Guest',
        '',
        prof.phone ?? '',
        pkg.title ?? 'Custom Package',
        new Date(booking.booking_date).toLocaleDateString(),
        new Date(booking.event_date).toLocaleDateString(),
        booking.guest_count ?? '',
        Number(booking.total_amount ?? 0),
        booking.status,
        booking.special_requests ?? ''
      ]);
    });

    // Auto-size columns
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const length = cell.value ? cell.value.toString().length : 10;
        if (length > maxLength) {
          maxLength = length;
        }
      });
      column.width = Math.min(maxLength + 2, 50);
    });

    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const uint8Array = new Uint8Array(buffer);

    return new Response(uint8Array, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="bookings-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});