<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your free sample</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #2563eb; padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; }
    .header p  { color: #bfdbfe; margin: 6px 0 0; font-size: 13px; }
    .body { padding: 32px; }
    .greeting { font-size: 16px; font-weight: 700; margin: 0 0 8px; }
    .message  { font-size: 14px; color: #64748b; line-height: 1.7; margin: 0 0 20px; }
    .product-box { background: #f1f5f9; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px; }
    .product-box small { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: .1em; color: #94a3b8; margin-bottom: 4px; }
    .product-box strong { font-size: 15px; color: #1e293b; }
    .btn { display: block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 13px 20px; border-radius: 8px; font-size: 14px; font-weight: 700; text-align: center; margin-bottom: 24px; }
    .note { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #1d4ed8; margin-bottom: 24px; }
    .footer { border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>NPTStore</h1>
    <p>Your free sample is ready</p>
  </div>

  <div class="body">
    <p class="greeting">Hi {{ $lead->name }},</p>
    <p class="message">
      Thank you for your interest{{ $lead->company ? ' from ' . $lead->company : '' }}.
      Here is the sample report you requested.
    </p>

    <div class="product-box">
      <small>Sample of</small>
      <strong>{{ $product->name }}</strong>
    </div>

    @if($attached)
      <div class="note">📎 The sample PDF is attached to this email.</div>
    @else
      <a href="{{ $downloadUrl }}" class="btn">⬇ Download sample PDF</a>
    @endif

    <p class="message" style="margin-bottom:0">
      Want the complete report with all project details? Visit our store, or reply to this email and our team will help you.
    </p>
  </div>

  <div class="footer">
    &copy; {{ date('Y') }} NPTStore. All rights reserved.<br/>
    You received this email because you requested a sample on our website.
  </div>
</div>
</body>
</html>