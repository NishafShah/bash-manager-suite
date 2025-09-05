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
    // Verify admin authentication
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Check if user has admin role
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!userRole) {
      throw new Error('Admin access required');
    }

    // Fetch all bookings with related data
    const { data: bookings, error } = await supabaseClient
      .from('bookings')
      .select(`
        *,
        service_packages(title, price),
        profiles(first_name, last_name, phone)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

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
      worksheet.addRow([
        booking.id,
        `${booking.profiles?.first_name || ''} ${booking.profiles?.last_name || ''}`.trim() || 'Guest',
        user.email || '',
        booking.profiles?.phone || '',
        booking.service_packages?.title || 'Custom Package',
        new Date(booking.booking_date).toLocaleDateString(),
        new Date(booking.event_date).toLocaleDateString(),
        booking.guest_count || '',
        Number(booking.total_amount || 0),
        booking.status,
        booking.special_requests || ''
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