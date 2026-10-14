<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
    <div style="background:#16264D;color:#ffffff;padding:18px 24px;">
      <div style="font-size:12px;letter-spacing:1px;color:#D4A55E;">NPT STORE</div>
      <div style="font-size:18px;font-weight:bold;margin-top:4px;">
        New order #{{ $order->id }} · ₹{{ number_format($order->total) }}
      </div>
    </div>

    <div style="padding:24px;">
      <p style="margin:0 0 16px;font-size:14px;color:#4B5563;">
        Payment received. The reports have been queued to email to the customer. Reply to this email to contact them.
      </p>

      <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:7px 0;color:#6B7280;width:130px;">Customer</td><td style="padding:7px 0;font-weight:bold;">{{ $order->customer_name }}</td></tr>
        <tr><td style="padding:7px 0;color:#6B7280;">Email</td><td style="padding:7px 0;"><a href="mailto:{{ $order->customer_email }}" style="color:#1A4FE0;">{{ $order->customer_email }}</a></td></tr>
        <tr><td style="padding:7px 0;color:#6B7280;">Mobile</td><td style="padding:7px 0;">{{ $order->customer_mobile }}</td></tr>
        <tr>
          <td style="padding:7px 0;color:#6B7280;">Account</td>
          <td style="padding:7px 0;">
            @if ($isRegistered)
              <span style="background:#ECFDF5;color:#059669;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:bold;">Registered user</span>
            @else
              <span style="background:#EFF6FF;color:#0284C7;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:bold;">Guest / new user</span>
            @endif
          </td>
        </tr>
        <tr>
          <td style="padding:7px 0;color:#6B7280;vertical-align:top;">Address</td>
          <td style="padding:7px 0;">
            {{ collect([$order->address, $order->city, $order->state, $order->pincode, $order->country])->filter()->implode(', ') }}
          </td>
        </tr>
        <tr><td style="padding:7px 0;color:#6B7280;">Payment ID</td><td style="padding:7px 0;font-family:monospace;">{{ $order->razorpay_payment_id }}</td></tr>
        <tr><td style="padding:7px 0;color:#6B7280;">Paid at</td><td style="padding:7px 0;">{{ optional($order->paid_at)->timezone('Asia/Kolkata')->format('d M Y, h:i A') }}</td></tr>
      </table>

      <div style="margin:20px 0 8px;font-size:12px;font-weight:bold;letter-spacing:1px;color:#1A4FE0;">REPORTS ORDERED</div>
      <table cellpadding="0" cellspacing="0" style="width:100%;font-size:13px;border-collapse:collapse;border:1px solid #e5e7eb;">
        <tr style="background:#F7F9FC;color:#6B7280;text-align:left;">
          <th style="padding:8px 10px;">Report</th>
          <th style="padding:8px 10px;text-align:center;">Qty</th>
          <th style="padding:8px 10px;text-align:right;">Price</th>
        </tr>
        @foreach ($order->items as $item)
          <tr style="border-top:1px solid #e5e7eb;">
            <td style="padding:8px 10px;">
              {{ $item->product->name ?? 'Deleted report' }}
              @if (!empty($item->product->code))
                <br><span style="color:#6B7280;font-size:11px;">{{ $item->product->code }}</span>
              @endif
            </td>
            <td style="padding:8px 10px;text-align:center;">{{ $item->quantity }}</td>
            <td style="padding:8px 10px;text-align:right;">₹{{ number_format($item->price * $item->quantity) }}</td>
          </tr>
        @endforeach
      </table>

      <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;margin-top:12px;">
        <tr><td style="padding:4px 0;color:#6B7280;">Subtotal</td><td style="text-align:right;">₹{{ number_format($order->subtotal) }}</td></tr>
        <tr><td style="padding:4px 0;color:#6B7280;">GST (18%)</td><td style="text-align:right;">₹{{ number_format($order->tax) }}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold;border-top:1px solid #e5e7eb;">Total</td><td style="text-align:right;font-weight:bold;border-top:1px solid #e5e7eb;">₹{{ number_format($order->total) }}</td></tr>
      </table>
    </div>
  </div>
</body>
</html>