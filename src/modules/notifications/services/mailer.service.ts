import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });
  }

  private generateHtmlTemplate(content: string, title?: string): string {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>${title || 'ekiliSync'}</title>
    <style>
      :root {
        --radius: 0.625rem;
        --background: #f8f9fa;
        --card: #ffffff;
        --text: #111111;
        --subtext: #555555;
        --primary: #205081;
        --primary-foreground: #ffffff;
        --accent: #97a0b0;
        --border: #e1e1e1;
      }
  
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background-color: var(--background);
        color: var(--text);
        line-height: 1.6;
      }
  
      .container {
        width: 100%;
        padding: 20px 0;
        display: flex;
        justify-content: center;
      }
  
      .card {
        width: 600px;
        max-width: 100%;
        background-color: var(--card);
        border-radius: var(--radius);
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        border: 1px solid var(--border);
      }
  
      .header {
        background-color: var(--primary);
        color: var(--primary-foreground);
        padding: 30px 20px;
        text-align: center;
      }
  
      .header img {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: block;
        margin: 0 auto 10px auto;
      }
  
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
      }
  
      .header p {
        margin: 5px 0 0 0;
        font-size: 14px;
        opacity: 0.85;
      }
  
      .content {
        padding: 30px 20px;
        color: var(--text);
        font-size: 16px;
      }
  
      .content p {
        margin: 0 0 16px 0;
      }
  
      .footer {
        background-color: var(--background);
        padding: 20px;
        text-align: center;
        border-top: 1px solid var(--border);
        color: var(--subtext);
        font-size: 14px;
      }
  
      .footer p {
        margin: 5px 0;
        font-size: 12px;
      }
  
      a {
        color: var(--accent);
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <!-- Header -->
        <div class="header">
          <h1>ekiliSync</h1>
          <p>Professional Workforce Management</p>
        </div>
  
        <!-- Content -->
        <div class="content">
          ${content.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '<br>').join('')}
        </div>
  
        <!-- Footer -->
        <div class="footer">
          <p>© ${new Date().getFullYear()} ekiliSync. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
    `.trim();
  }
  
  

  async sendMail(to: string, subject: string, text: string, html?: string) {
    const htmlContent = html || this.generateHtmlTemplate(text, subject);
    
    const info = await this.transporter.sendMail({
      from: `"ekiliSync" <support@ekilie.com>`,
      to,
      subject,
      text,
      html: htmlContent
    });

    return info;
  }
}
