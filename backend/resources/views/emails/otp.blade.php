<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>Your NPTStore sign-in code</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;-webkit-text-size-adjust:100%;">

  {{-- hidden preview text shown next to the subject in the inbox --}}
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Your sign-in code is {{ $otp }}. It expires in {{ $minutes }} minutes.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;">
    <tr>
      <td align="center" style="padding:32px 12px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0"
               style="width:100%;max-width:600px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

          {{-- blue header --}}
          <tr>
            <td align="center" style="background-color:#2563eb;padding:44px 24px;">
              <div style="font-size:30px;font-weight:800;line-height:1.2;color:#ffffff;letter-spacing:-0.5px;">NPTStore</div>
              <div style="margin-top:10px;font-size:15px;line-height:1.4;color:#dbeafe;">Your sign-in code is ready</div>
            </td>
          </tr>

          {{-- body --}}
          <tr>
            <td style="padding:40px 40px 8px 40px;">
              <div style="font-size:20px;font-weight:700;color:#111827;">Hello,</div>
              <p style="margin:16px 0 0 0;font-size:16px;line-height:1.6;color:#4b5563;">
                Use the code below to sign in to NPTStore. You can view your reports and order history after you enter it.
              </p>
            </td>
          </tr>

          {{-- code box --}}
          <tr>
            <td align="center" style="padding:24px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
                <tr>
                  <td align="center" style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:26px 12px;">
                    <div style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#2563eb;">Your code</div>
                    <div style="margin-top:10px;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:40px;font-weight:800;letter-spacing:10px;color:#1e3a8a;">{{ $otp }}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 8px 40px;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#4b5563;">
                This code expires in <strong style="color:#111827;">{{ $minutes }} minutes</strong>. Please do not share it with anyone.
              </p>
              <p style="margin:14px 0 0 0;font-size:14px;line-height:1.6;color:#6b7280;">
                If you did not ask for this code, you can safely ignore this email. No one can sign in without it.
              </p>
            </td>
          </tr>

          {{-- help box --}}
          <tr>
            <td style="padding:24px 40px 40px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
                <tr>
                  <td style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;font-size:14px;line-height:1.6;color:#4b5563;">
                    Need help? Call or WhatsApp
                    <a href="tel:+919171015659" style="color:#2563eb;font-weight:700;text-decoration:none;">+91 91710 15659</a>
                    or write to
                    <a href="mailto:sales@newprojectstracker.com" style="color:#2563eb;font-weight:700;text-decoration:none;">sales@newprojectstracker.com</a>.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          {{-- footer --}}
          <tr>
            <td align="center" style="background-color:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 24px;font-size:12px;line-height:1.6;color:#9ca3af;">
              New Project Tracker &middot; NPTStore<br>
              This email was sent to {{ $email }}.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>