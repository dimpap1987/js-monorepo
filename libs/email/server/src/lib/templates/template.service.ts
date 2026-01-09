import { Inject, Injectable, Logger, Optional } from '@nestjs/common'
import { EMAIL_TEMPLATE_ENGINE } from '../email.tokens'
import { EmailTemplate, TemplateEngine, TemplateRegistry } from './template.types'

@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name)
  private readonly templates: TemplateRegistry = {}
  private readonly defaultEngine: TemplateEngine

  constructor(
    @Optional()
    @Inject(EMAIL_TEMPLATE_ENGINE)
    private readonly customEngine?: TemplateEngine
  ) {
    this.defaultEngine = {
      render: this.defaultRender.bind(this),
    }
  }

  registerTemplate(templateId: string, template: { subject: string; html?: string; text?: string }): void {
    this.templates[templateId] = template
    this.logger.log(`Registered email template: ${templateId}`)
  }

  registerTemplates(templates: TemplateRegistry): void {
    for (const [templateId, template] of Object.entries(templates)) {
      this.registerTemplate(templateId, template)
    }
  }

  getTemplate(templateId: string): EmailTemplate | undefined {
    return this.templates[templateId]
  }

  hasTemplate(templateId: string): boolean {
    return templateId in this.templates
  }

  render(templateId: string, data: Record<string, unknown> = {}): EmailTemplate {
    const template = this.templates[templateId]

    if (!template) {
      throw new Error(`Email template not found: ${templateId}`)
    }

    const engine = this.customEngine ?? this.defaultEngine

    return {
      subject: engine.render(template.subject, data),
      html: template.html ? engine.render(template.html, data) : undefined,
      text: template.text ? engine.render(template.text, data) : undefined,
    }
  }

  renderInline(
    template: { subject: string; html?: string; text?: string },
    data: Record<string, unknown> = {}
  ): EmailTemplate {
    const engine = this.customEngine ?? this.defaultEngine

    return {
      subject: engine.render(template.subject, data),
      html: template.html ? engine.render(template.html, data) : undefined,
      text: template.text ? engine.render(template.text, data) : undefined,
    }
  }

  private defaultRender(template: string, data: Record<string, unknown>): string {
    return template.replace(/\{\{(\s*[\w.]+\s*)\}\}/g, (match, key) => {
      const trimmedKey = key.trim()
      const value = this.getNestedValue(data, trimmedKey)
      return value !== undefined ? String(value) : match
    })
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: unknown, key) => {
      if (current === null || current === undefined) {
        return undefined
      }
      return (current as Record<string, unknown>)[key]
    }, obj)
  }
}
