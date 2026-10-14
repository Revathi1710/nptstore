<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Order Reports</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #2563eb; padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p  { color: #bfdbfe; margin: 6px 0 0; font-size: 13px; }
    .body { padding: 32px; }
    .greeting { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
    .message  { font-size: 14px; color: #64748b; line-height: 1.7; margin-bottom: 24px; }
    .order-box { background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .order-box h3 { margin: 0 0 14px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; }
    .order-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
    .order-row span:first-child { color: #64748b; }
    .order-row span:last-child  { font-weight: 700; color: #1e293b; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    .items-table th { text-align: left; padding: 8px 12px; background: #f1f5f9; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; }
    .items-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
    .items-table tr:last-child td { border-bottom: none; }
    .total-row td { font-weight: 800; font-size: 14px; color: #2563eb; }

    /* Download section */
    .download-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 20px; margin-bottom: 24px; }
    .download-box strong { display: block; font-size: 14px; color: #1d4ed8; margin-bottom: 4px; }
    .download-box p { font-size: 13px; color: #3b82f6; margin: 0 0 16px; }
    .btn-download {
      display: block;
      background: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 10px;
    }
    .btn-pdf { background: #dc2626; }
    .btn-download:last-child { margin-bottom: 0; }
    .expire-note { font-size: 12px; color: #94a3b8; margin-top: 12px; text-align: center; }

    .footer { border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
<div class="container">

  <div class="header">
    <h1>NPTStore</h1>
    <p>Your reports are ready — click to download</p>
  </div>

  <div class="body">
    <p class="greeting">Hi {{ $order->customer_name }},</p>
    <p class="message">
      Thank you for your purchase! Your payment was successful and your order has been confirmed.
      Use the download button(s) below to get your Excel and PDF report(s).
    </p>

    <!-- Order details -->
    <div class="order-box">
      <h3>Order Details</h3>
      <div class="order-row"><span>Order ID</span>      <span>#{{ $order->id }}</span></div>
      <div class="order-row"><span>Payment ID</span>    <span>{{ $order->razorpay_payment_id }}</span></div>
      <div class="order-row"><span>Date</span>          <span>{{ $order->created_at->format('d M Y, h:i A') }}</span></div>
      <div class="order-row"><span>Email</span>         <span>{{ $order->customer_email }}</span></div>
    </div>

    <!-- Items -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th style="text-align:right">Price</th>
        </tr>
      </thead>
      <tbody>
        @foreach($order->items as $item)
        <tr>
          <td>{{ $item->product->name ?? 'Product #'.$item->product_id }}</td>
          <td>{{ $item->quantity }}</td>
          <td style="text-align:right">₹{{ number_format($item->price * $item->quantity, 2) }}</td>
        </tr>
        @endforeach
        <tr class="total-row">
          <td colspan="2">Total Paid</td>
          <td style="text-align:right">₹{{ number_format($order->total, 2) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Download links -->
    <div class="download-box">
      <strong>📥 Your Reports Are Ready</strong>
      <p>Click a button below to download your file. Links expire in 7 days.</p>

      @forelse($downloadLinks as $link)
        @php $isPdf = ($link['type'] ?? 'excel') === 'pdf'; @endphp
        <a href="{{ $link['url'] }}" class="btn-download {{ $isPdf ? 'btn-pdf' : '' }}">
          {{ $isPdf ? '📄' : '⬇' }} Download: {{ $link['name'] }}
        </a>
      @empty
        <p style="color:#ef4444;font-size:13px;text-align:center;margin:0">
          No files are currently available. Please contact support.
        </p>
      @endforelse

    </div>

    <p class="message" style="margin-bottom:0">
      Thank you for choosing NPTStore. If you have any questions, reply to this email or contact our support team.
    </p>
  </div>

  <div class="footer">
    &copy; {{ date('Y') }} NPTStore. All rights reserved.<br/>
    This is an automated email — please do not reply directly.
  </div>

</div>
</body>
</html>