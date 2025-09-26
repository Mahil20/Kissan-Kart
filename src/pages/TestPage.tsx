import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase-with-fallback';
import { toast } from 'sonner';

const TestPage = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpassword123');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testSignup = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('Testing direct Supabase signup...');
      
      const response = await supabase.auth.signUp(email, password, 'user');
      
      console.log('Direct response:', response);
      setResult(response);
      
      if (response.error) {
        toast.error(`Error: ${response.error.message}`);
      } else {
        toast.success('Signup test successful!');
      }
      
    } catch (error) {
      console.error('Test error:', error);
      setResult({ error: error });
      toast.error(`Test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    
    try {
      // Test a simple query to see if Supabase is accessible
      const { data, error } = await supabase.auth.getSession();
      console.log('Connection test:', { data, error });
      
      if (error) {
        toast.error(`Connection failed: ${error.message}`);
      } else {
        toast.success('Connection successful!');
      }
      
      setResult({ connectionTest: { data, error } });
      
    } catch (error) {
      console.error('Connection error:', error);
      toast.error(`Connection error: ${error}`);
      setResult({ connectionError: error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Supabase Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <label>Email:</label>
          <Input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
        </div>
        
        <div>
          <label>Password:</label>
          <Input 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={testConnection} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            Test Connection
          </Button>
          
          <Button 
            onClick={testSignup} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test Signup'}
          </Button>
        </div>
        
        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPage;
