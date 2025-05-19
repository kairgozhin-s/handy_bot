import { useEffect, useState } from 'react';
import { TradingService } from '@/lib/services/trading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from 'next-auth/react';

export default function TradingPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const tradingService = new TradingService();
  const [rules, setRules] = useState<TradingRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [newRule, setNewRule] = useState<Partial<TradingRule>>({
    name: '',
    mode: 'SAFU',
    conditions: [{ type: 'price', value: 0, operator: '>' }],
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const rules = await tradingService.getTradingRules(session?.user?.id || '');
      setRules(rules);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load trading rules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    try {
      setLoading(true);
      await tradingService.createTradingRule(session?.user?.id || '', newRule as Omit<TradingRule, 'id' | 'userId'>);
      toast({
        title: "Success",
        description: "Trading rule created successfully",
      });
      setNewRule({
        name: '',
        mode: 'SAFU',
        conditions: [{ type: 'price', value: 0, operator: '>' }],
      });
      await loadRules();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create trading rule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">Trading Rules</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Rule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Rule Name</Label>
                    <Input
                      id="name"
                      value={newRule.name}
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mode">Mode</Label>
                    <Select
                      value={newRule.mode}
                      onValueChange={(value) => setNewRule({ ...newRule, mode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAFU">SAFU (Notification Only)</SelectItem>
                        <SelectItem value="HOT">HOT (Active Trading)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Conditions</Label>
                    {newRule.conditions.map((condition, index) => (
                      <div key={index} className="flex gap-2">
                        <Select
                          value={condition.type}
                          onValueChange={(value) => {
                            const newConditions = [...newRule.conditions];
                            newConditions[index].type = value;
                            setNewRule({ ...newRule, conditions: newConditions });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="price">Price</SelectItem>
                            <SelectItem value="time">Time</SelectItem>
                            <SelectItem value="volume">Volume</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          value={condition.value}
                          onChange={(e) => {
                            const newConditions = [...newRule.conditions];
                            newConditions[index].value = Number(e.target.value);
                            setNewRule({ ...newRule, conditions: newConditions });
                          }}
                        />
                        <Select
                          value={condition.operator}
                          onValueChange={(value) => {
                            const newConditions = [...newRule.conditions];
                            newConditions[index].operator = value;
                            setNewRule({ ...newRule, conditions: newConditions });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="<">Less than</SelectItem>
                            <SelectItem value=">">Greater than</SelectItem>
                            <SelectItem value="=">Equal to</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewRule({
                          ...newRule,
                          conditions: [...newRule.conditions, { type: 'price', value: 0, operator: '>' }],
                        });
                      }}
                    >
                      Add Condition
                    </Button>
                  </div>
                  <Button
                    onClick={handleCreateRule}
                    disabled={loading || !newRule.name}
                  >
                    Create Rule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Active Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <CardTitle>{rule.name}</CardTitle>
                  <CardDescription>
                    Mode: {rule.mode} | Status: {rule.isActive ? 'Active' : 'Inactive'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {rule.conditions.map((condition, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="font-medium">Condition {index + 1}:</span>
                        <span>
                          {condition.type} {condition.operator} {condition.value}
                        </span>
                      </div>
                    ))}
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement edit functionality
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement delete functionality
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
