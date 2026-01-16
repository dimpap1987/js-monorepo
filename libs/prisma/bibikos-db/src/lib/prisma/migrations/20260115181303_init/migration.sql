-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "citext";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DEACTIVATED', 'BANNED');

-- CreateTable
CREATE TABLE "auth_users" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "username" CITEXT NOT NULL,
    "email" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "auth_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL,
    "profileImage" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "scopes" TEXT[],

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unregistered_users" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profileImage" TEXT,
    "providerId" INTEGER NOT NULL,

    CONSTRAINT "unregistered_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "providers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role" (
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "status" TEXT NOT NULL DEFAULT 'unread',
    "user_id" INTEGER,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "rollout" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stripe_customers" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "stripe_customer_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stripe_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" SERIAL NOT NULL,
    "payment_customer_id" INTEGER NOT NULL,
    "stripe_subscription_id" TEXT,
    "priceId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "trial_start" TIMESTAMP(3),
    "trial_end" TIMESTAMP(3),
    "cancel_at" TIMESTAMP(3),
    "canceled_at" TIMESTAMP(3),
    "cancel_reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stripe_webhook_events" (
    "id" SERIAL NOT NULL,
    "event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "stripeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "hierarchy" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prices" (
    "id" SERIAL NOT NULL,
    "stripeId" TEXT NOT NULL,
    "unitAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'active',
    "replaced_by_price_id" INTEGER,
    "productId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "additional_data" JSONB,
    "link" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_notifications" (
    "receiver_id" INTEGER NOT NULL,
    "notification_id" INTEGER NOT NULL,
    "sender_id" INTEGER,
    "is_read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_notifications_pkey" PRIMARY KEY ("receiver_id","notification_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_username" ON "auth_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "auth_users_email_key" ON "auth_users"("email");

-- CreateIndex
CREATE INDEX "auth_users_email_idx" ON "auth_users"("email");

-- CreateIndex
CREATE INDEX "auth_users_username_idx" ON "auth_users"("username");

-- CreateIndex
CREATE INDEX "auth_users_status_idx" ON "auth_users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_providerId_key" ON "user_profiles"("userId", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "unregistered_users_token_key" ON "unregistered_users"("token");

-- CreateIndex
CREATE UNIQUE INDEX "unregistered_users_email_key" ON "unregistered_users"("email");

-- CreateIndex
CREATE INDEX "unregistered_users_email_idx" ON "unregistered_users"("email");

-- CreateIndex
CREATE INDEX "unregistered_users_token_idx" ON "unregistered_users"("token");

-- CreateIndex
CREATE UNIQUE INDEX "providers_name_key" ON "providers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "contact_messages_status_idx" ON "contact_messages"("status");

-- CreateIndex
CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages"("created_at");

-- CreateIndex
CREATE INDEX "contact_messages_user_id_idx" ON "contact_messages"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_key_key" ON "feature_flags"("key");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_customers_userId_key" ON "stripe_customers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_customers_stripe_customer_id_key" ON "stripe_customers"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "stripe_customers_userId_idx" ON "stripe_customers"("userId");

-- CreateIndex
CREATE INDEX "stripe_customers_stripe_customer_id_idx" ON "stripe_customers"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "subscriptions_payment_customer_id_idx" ON "subscriptions"("payment_customer_id");

-- CreateIndex
CREATE INDEX "subscriptions_priceId_idx" ON "subscriptions"("priceId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_status_current_period_end_idx" ON "subscriptions"("status", "current_period_end");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_webhook_events_event_id_key" ON "stripe_webhook_events"("event_id");

-- CreateIndex
CREATE INDEX "stripe_webhook_events_event_id_idx" ON "stripe_webhook_events"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_stripeId_key" ON "products"("stripeId");

-- CreateIndex
CREATE UNIQUE INDEX "products_name_key" ON "products"("name");

-- CreateIndex
CREATE UNIQUE INDEX "prices_stripeId_key" ON "prices"("stripeId");

-- CreateIndex
CREATE INDEX "prices_active_idx" ON "prices"("active");

-- CreateIndex
CREATE INDEX "prices_status_idx" ON "prices"("status");

-- CreateIndex
CREATE INDEX "prices_replaced_by_price_id_idx" ON "prices"("replaced_by_price_id");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unregistered_users" ADD CONSTRAINT "unregistered_users_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stripe_customers" ADD CONSTRAINT "stripe_customers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_payment_customer_id_fkey" FOREIGN KEY ("payment_customer_id") REFERENCES "stripe_customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "prices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prices" ADD CONSTRAINT "prices_replaced_by_price_id_fkey" FOREIGN KEY ("replaced_by_price_id") REFERENCES "prices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prices" ADD CONSTRAINT "prices_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_notifications" ADD CONSTRAINT "users_notifications_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "auth_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_notifications" ADD CONSTRAINT "users_notifications_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_notifications" ADD CONSTRAINT "users_notifications_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
