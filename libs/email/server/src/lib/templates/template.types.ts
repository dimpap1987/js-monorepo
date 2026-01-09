export interface EmailTemplate {
  subject: string
  html?: string
  text?: string
}

export interface TemplateEngine {
  render(template: string, data: Record<string, unknown>): string
}

export interface TemplateRegistry {
  [templateId: string]: {
    subject: string
    html?: string
    text?: string
  }
}
