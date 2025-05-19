import { prisma } from '@/lib/db';
import { tradingRules, userSettings } from '@/lib/db/schema';

export type TradingRule = {
  id: string;
  userId: string;
  name: string;
  mode: 'SAFU' | 'HOT';
  conditions: {
    type: 'price' | 'time' | 'volume';
    value: number;
    operator: '<' | '>' | '=';
  }[];
  isActive: boolean;
  walletAddress?: string;
  lastExecuted?: Date;
  executionHistory: {
    timestamp: Date;
    price: number;
    action: 'buy' | 'sell' | 'hold';
    reason: string;
  }[];
};

export type UserTradingSettings = {
  defaultMode: 'SAFU' | 'HOT';
  notificationPreferences: {
    email: boolean;
    push: boolean;
  };
};

export class TradingService {
  async createUserSettings(userId: string, settings: Partial<UserTradingSettings> = {}): Promise<UserTradingSettings> {
    const defaultSettings = {
      defaultMode: 'SAFU',
      notificationPreferences: {
        email: true,
        push: true,
      },
      ...settings,
    };

    await prisma.userSetting.create({
      data: {
        userId,
        defaultMode: defaultSettings.defaultMode,
        notificationPreferences: defaultSettings.notificationPreferences,
      },
    });

    return defaultSettings;
  }

  async getTradingRules(userId: string, isActive?: boolean): Promise<TradingRule[]> {
    const rules = await prisma.tradingRule.findMany({
      where: {
        userId,
        ...(isActive !== undefined ? { isActive } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return rules;
  }

  async createTradingRule(userId: string, rule: Omit<TradingRule, 'id' | 'userId'>): Promise<TradingRule> {
    const createdRule = await prisma.tradingRule.create({
      data: {
        userId,
        ...rule,
      },
    });

    return createdRule;
  }

  async updateTradingRule(id: string, updates: Partial<TradingRule>): Promise<TradingRule | null> {
    const updatedRule = await prisma.tradingRule.update({
      where: { id },
      data: updates,
    });

    return updatedRule;
  }

  async deleteTradingRule(id: string): Promise<void> {
    await prisma.tradingRule.delete({
      where: { id },
    });
  }

  async executeTradingRule(rule: TradingRule, currentPrice: number): Promise<void> {
    if (!rule.isActive) return;

    const shouldExecute = rule.conditions.some(condition => {
      switch (condition.operator) {
        case '<': return currentPrice < condition.value;
        case '>': return currentPrice > condition.value;
        case '=': return currentPrice === condition.value;
        default: return false;
      }
    });

    if (shouldExecute) {
      // TODO: Implement actual trading logic
      // For SAFU mode, just record the condition
      // For HOT mode, execute the trade
      const action = rule.mode === 'HOT' ? 'sell' : 'hold';
      const execution = {
        timestamp: new Date(),
        price: currentPrice,
        action,
        reason: 'Condition met',
      };

      await prisma.tradingRule.update({
        where: { id: rule.id },
        data: {
          lastExecuted: new Date(),
          executionHistory: {
            push: execution,
          },
        },
      });
    }
  }
}
