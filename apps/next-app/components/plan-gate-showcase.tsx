import { DpButton } from '@js-monorepo/button'
import { Badge } from '@js-monorepo/components/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@js-monorepo/components/card'
import { useNotifications } from '@js-monorepo/notification'
import { PlanGate, PlanGateInline, usePlanAccess } from '@js-monorepo/payments-ui'
import { BarChart3, Download, Lock, Settings, Sparkles, Zap } from 'lucide-react'
/**
 * Showcase component demonstrating all PlanGate modes and features
 */
export function PlanGateShowcase() {
  const { hasAccess, currentPlan, isSubscribed } = usePlanAccess('basic')
  const { addNotification } = useNotifications()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Plan Gate
        </CardTitle>
        <CardDescription>
          Control feature access based on subscription plans. Supports multiple display modes for professional UX.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan Status */}
        <div className="p-4 border border-border rounded-lg bg-muted/50">
          <p className="text-sm font-medium mb-2">Your Current Status</p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>
              Subscribed: <Badge variant={isSubscribed ? 'default' : 'secondary'}>{isSubscribed ? 'Yes' : 'No'}</Badge>
            </span>
            <span>
              Plan: <Badge variant="accent">{currentPlan || 'None'}</Badge>
            </span>
            <span>
              Basic Access: <Badge variant={hasAccess ? 'default' : 'destructive'}>{hasAccess ? 'Yes' : 'No'}</Badge>
            </span>
          </div>
        </div>

        {/* Mode: Hide - shows hierarchy: pro users see basic features */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <code className="px-1.5 py-0.5 bg-muted rounded text-xs">mode=&quot;hide&quot;</code>
            <span className="text-muted-foreground font-normal">- Completely hides content</span>
          </h4>
          <div className="p-4 border border-dashed border-border rounded-lg space-y-3">
            {/* Basic feature - visible to basic, pro, premium, enterprise */}
            <PlanGate plan="basic" mode="hide">
              <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Basic Feature (visible to Basic+ plans)
                </span>
              </div>
            </PlanGate>
            {/* Pro feature - visible to pro, premium, enterprise */}
            <PlanGate plan="pro" mode="hide">
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  Pro Feature (visible to Pro+ plans)
                </span>
              </div>
            </PlanGate>
            <p className="text-xs text-muted-foreground">
              Your plan: <strong>{currentPlan || 'None'}</strong> — Higher plans can access lower-tier features (Pro
              users see Basic features)
            </p>
          </div>
        </div>

        {/* Mode: Blur */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <code className="px-1.5 py-0.5 bg-muted rounded text-xs">mode=&quot;blur&quot;</code>
            <span className="text-muted-foreground font-normal">- Shows blurred preview with upgrade prompt</span>
          </h4>
          <PlanGate plan="pro" mode="blur" featureName="Advanced Analytics">
            <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-semibold">Advanced Analytics Dashboard</p>
                  <p className="text-sm text-muted-foreground">Real-time insights and metrics</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-background rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">2.4K</p>
                  <p className="text-xs text-muted-foreground">Active Users</p>
                </div>
                <div className="p-3 bg-background rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-500">+18%</p>
                  <p className="text-xs text-muted-foreground">Growth</p>
                </div>
                <div className="p-3 bg-background rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-500">98.5%</p>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                </div>
              </div>
            </div>
          </PlanGate>
        </div>

        {/* Mode: Lock */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <code className="px-1.5 py-0.5 bg-muted rounded text-xs">mode=&quot;lock&quot;</code>
            <span className="text-muted-foreground font-normal">- Shows locked state with upgrade CTA</span>
          </h4>
          <PlanGate plan="enterprise" mode="lock" featureName="API Access">
            <div className="p-4 bg-accent rounded-lg">
              <p>Enterprise API Documentation</p>
            </div>
          </PlanGate>
        </div>

        {/* Mode: Fallback */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <code className="px-1.5 py-0.5 bg-muted rounded text-xs">mode=&quot;fallback&quot;</code>
            <span className="text-muted-foreground font-normal">- Renders custom fallback content</span>
          </h4>
          <PlanGate
            plan="premium"
            mode="fallback"
            fallback={
              <div className="p-4 border border-amber-500/20 bg-amber-500/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-full">
                    <Lock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-600 dark:text-amber-400">Premium Feature</p>
                    <p className="text-sm text-muted-foreground">
                      Upgrade to Premium to unlock priority support and custom integrations.
                    </p>
                  </div>
                </div>
              </div>
            }
          >
            <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" />
                <span className="font-medium">Custom Integration Settings</span>
              </div>
            </div>
          </PlanGate>
        </div>

        {/* Inline Badge Demo */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <code className="px-1.5 py-0.5 bg-muted rounded text-xs">PlanGateInline</code>
            <span className="text-muted-foreground font-normal">- Wrapper for buttons</span>
          </h4>
          <div className="flex flex-wrap gap-3">
            {/* Default: redirect to pricing */}
            <PlanGateInline plan="pro">
              <DpButton variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Redirect (default)
              </DpButton>
            </PlanGateInline>

            {/* Block: silently intercept with custom handler */}
            <PlanGateInline
              plan="pro"
              behavior="block"
              onBlockedClick={() =>
                addNotification({
                  message: 'Upgrade to Pro to access this feature',
                  type: 'information',
                  duration: 3000,
                })
              }
            >
              <DpButton variant="secondary">
                <Zap className="w-4 h-4 mr-2" />
                Block + Toast
              </DpButton>
            </PlanGateInline>

            {/* Disable: traditional disabled state */}
            <PlanGateInline plan="enterprise" behavior="disable">
              <DpButton variant="accent">
                <Settings className="w-4 h-4 mr-2" />
                Disabled
              </DpButton>
            </PlanGateInline>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <strong>redirect</strong> (default): Click redirects to pricing page
            </p>
            <p>
              <strong>block</strong>: Click is intercepted, use <code>onBlockedClick</code> for custom behavior
            </p>
            <p>
              <strong>disable</strong>: Traditional disabled/grayed out state
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
