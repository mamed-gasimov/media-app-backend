import ejs from 'ejs';
import fs from 'fs';

class ForgotPasswordTemplate {
  public passwordResetTemplate(username: string, resetLink: string) {
    return ejs.render(fs.readFileSync(__dirname + '/forgot-password-template.ejs', 'utf8'), {
      username,
      resetLink,
    });
  }
}

export const forgotPasswordTemplate = new ForgotPasswordTemplate();
