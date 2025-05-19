-- Create UserSetting table
CREATE TABLE IF NOT EXISTS "UserSetting" (
  "userId" UUID PRIMARY KEY REFERENCES "User"("id"),
  "defaultMode" TEXT NOT NULL DEFAULT 'SAFU',
  "notificationPreferences" JSONB NOT NULL DEFAULT '{"email": true, "push": true}',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create TradingRule table
CREATE TABLE IF NOT EXISTS "TradingRule" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id"),
  "name" TEXT NOT NULL,
  "mode" TEXT NOT NULL,
  "conditions" JSONB NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "walletAddress" TEXT,
  "lastExecuted" TIMESTAMP WITH TIME ZONE,
  "executionHistory" JSONB DEFAULT '[]'::jsonb,
  UNIQUE("userId", "name")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_trading_rules_user_id" ON "TradingRule"("userId");
CREATE INDEX IF NOT EXISTS "idx_trading_rules_mode" ON "TradingRule"("mode");
CREATE INDEX IF NOT EXISTS "idx_trading_rules_is_active" ON "TradingRule"("isActive");
