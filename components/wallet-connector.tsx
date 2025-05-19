import { useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WalletConnectorProps {
  onWalletConnected: (publicKey: string) => void;
}

export function WalletConnector({ onWalletConnected }: WalletConnectorProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.solana) {
        const response = await window.solana.connect();
        setPublicKey(response.publicKey.toString());
        setIsConnected(true);
        onWalletConnected(response.publicKey.toString());
        toast({
          title: "Success",
          description: "Wallet connected successfully",
        });
      } else {
        setError('Please install Solana wallet');
      }
    } catch (err) {
      setError('Failed to connect wallet');
      toast({
        title: "Error",
        description: "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const disconnectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.solana) {
        await window.solana.disconnect();
        setPublicKey('');
        setIsConnected(false);
        toast({
          title: "Disconnected",
          description: "Wallet disconnected",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to disconnect wallet",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== 'undefined' && window.solana) {
        const { connected, publicKey } = window.solana;
        setIsConnected(connected);
        if (publicKey) {
          setPublicKey(publicKey.toString());
          onWalletConnected(publicKey.toString());
        }
      }
    };

    checkWalletConnection();
  }, [onWalletConnected]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Connection</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}
        {!isConnected ? (
          <Button onClick={connectWallet} className="w-full">
            Connect Solana Wallet
          </Button>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Connected Wallet</Label>
              <Input
                value={publicKey}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <Button
              variant="destructive"
              onClick={disconnectWallet}
              className="w-full"
            >
              Disconnect Wallet
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
