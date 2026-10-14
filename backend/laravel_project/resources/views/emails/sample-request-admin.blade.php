<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
    <div style="background:#16264D;color:#ffffff;padding:18px 24px;">
      <div style="font-size:12px;letter-spacing:1px;color:#D4A55E;">NPT STORE</div>
      <div style="font-size:18px;font-weight:bold;margin-top:4px;">New sample request</div>
    </div>

    <div style="padding:24px;">
      <p style="margin:0 0 16px;font-size:14px;color:#4B5563;">
        Someone just downloaded a free sample. Reply to this email to contact them directly.
      </p>

      <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#6B7280;width:130px;">Name</td><td style="padding:8px 0;font-weight:bold;">{{ $lead->name }}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7280;">Email</td><td style="padding:8px 0;"><a href="mailto:{{ $lead->email }}" style="color:#1A4FE0;">{{ $lead->email }}</a></td></tr>
        <tr><td style="padding:8px 0;color:#6B7280;">Mobile</td><td style="padding:8px 0;">{{ $lead->mobile }}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7280;">Company</td><td style="padding:8px 0;">{{ $lead->company }}</td></tr>
        <tr>
          <td style="padding:8px 0;color:#6B7280;">Account</td>
          <td style="padding:8px 0;">
            @if ($isRegistered)
              <span style="background:#ECFDF5;color:#059669;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:bold;">Registered user</span>
            @else
              <span style="background:#EFF6FF;color:#0284C7;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:bold;">New user</span>
            @endif
          </td>
        </tr>
        <tr style="border-top:1px solid #e5e7eb;">
          <td style="padding:12px 0 8px;color:#6B7280;">Report</td>
          <td style="padding:12px 0 8px;font-weight:bold;">{{ $product->name }}<br><span style="font-weight:normal;color:#6B7280;font-size:12px;">{{ $product->code }}</span></td>
        </tr>
        <tr><td style="padding:8px 0;color:#6B7280;">Requested</td><td style="padding:8px 0;">{{ $lead->created_at->timezone('Asia/Kolkata')->format('d M Y, h:i A') }}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7280;">IP address</td><td style="padding:8px 0;">{{ $lead->ip }}</td></tr>
      </table>
    </div>
  </div>
</body>
</html>