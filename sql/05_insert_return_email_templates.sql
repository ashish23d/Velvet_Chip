-- Insert Return Requested Template
INSERT INTO public.mail_templates (name, subject, html_content, template_type, is_active, placeholders)
VALUES (
    'return_requested',
    'Return Request Received - Order #{{order_id}}',
    '<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .header { background-color: #be185d; padding: 40px 0; text-align: center; }
  .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
  .content { padding: 40px; color: #374151; }
  .greeting { font-size: 18px; margin-bottom: 20px; }
  .message { line-height: 1.6; margin-bottom: 30px; }
  .order-details { background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
  .order-details h3 { margin-top: 0; color: #111827; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 15px; }
  .item-table { width: 100%; border-collapse: collapse; }
  .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
  .btn { display: inline-block; background-color: #be185d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-top: 10px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Return Request Received</h1>
    </div>
    <div class="content">
      <p class="greeting">Hi {{customer_name}},</p>
      <p class="message">
        We have received your return request for the item(s) from Order <strong>#{{order_id}}</strong>.
        Our team will review your request and get back to you shortly.
      </p>
      
      <div class="order-details">
        <h3>Return Details</h3>
        <table class="item-table">
          {{order_items_rows}}
        </table>
        <p style="margin-top: 15px; font-size: 14px;"><strong>Reason:</strong> {{return_reason}}</p>
      </div>

      <p class="message">
        You can track the status of your return in your account.
      </p>
      
      <div style="text-align: center;">
        <a href="{{tracking_link}}" class="btn">View Return Status</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; {{year}} VelvetChip. All rights reserved.</p>
      <p>If you have any questions, please reply to this email.</p>
    </div>
  </div>
</body>
</html>',
    'return_process',
    true,
    '["{{customer_name}}", "{{order_id}}", "{{order_items_rows}}", "{{return_reason}}", "{{tracking_link}}", "{{year}}"]'
);

-- Insert Return Status Update Template
INSERT INTO public.mail_templates (name, subject, html_content, template_type, is_active, placeholders)
VALUES (
    'return_status_update',
    'Return Status Updated - Order #{{order_id}}',
    '<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .header { background-color: #be185d; padding: 40px 0; text-align: center; }
  .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
  .content { padding: 40px; color: #374151; }
  .greeting { font-size: 18px; margin-bottom: 20px; }
  .message { line-height: 1.6; margin-bottom: 30px; }
  .status-badge { display: inline-block; padding: 6px 12px; background-color: #f3f4f6; color: #111827; border-radius: 9999px; font-weight: 600; font-size: 14px; margin-bottom: 20px; border: 1px solid #e5e7eb; }
  .order-details { background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
  .item-table { width: 100%; border-collapse: collapse; }
  .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
  .btn { display: inline-block; background-color: #be185d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-top: 10px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Return Status Update</h1>
    </div>
    <div class="content">
      <p class="greeting">Hi {{customer_name}},</p>
      <p class="message">
        The status of your return request for Order <strong>#{{order_id}}</strong> has been updated.
      </p>

      <div style="text-align: center; margin-bottom: 30px;">
        <span class="status-badge">New Status: {{return_status}}</span>
      </div>
      
      <div class="order-details">
        <table class="item-table">
          {{order_items_rows}}
        </table>
      </div>

      <p class="message">
        If your return has been approved, please follow the instructions in the returns portal to ship your item back.
      </p>
      
      <div style="text-align: center;">
        <a href="{{tracking_link}}" class="btn">View Return Details</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; {{year}} VelvetChip. All rights reserved.</p>
    </div>
  </div>
</body>
</html>',
    'return_process',
    true,
    '["{{customer_name}}", "{{order_id}}", "{{return_status}}", "{{order_items_rows}}", "{{tracking_link}}", "{{year}}"]'
);
